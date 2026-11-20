-- Foro: uno general y uno por banda, con cuentas de usuario y moderación básica.
--
-- Moderación:
--   * Cada usuario elige un apodo público (nunca se muestra su correo).
--   * Cualquiera puede denunciar un tema o respuesta; con 3 denuncias se oculta solo.
--   * Los moderadores (perfiles.es_moderador) ocultan, cierran, fijan y bloquean usuarios.
--   * El dueño de una banda puede ocultar, cerrar y fijar en el foro de su banda.
--   * Límite de ritmo para frenar el spam.
-- Para hacerte moderador, ejecuta en el editor SQL (cambia el apodo por el tuyo):
--   update perfiles set es_moderador = true where lower(apodo) = lower('TuApodo');

create table perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  apodo text not null check (char_length(apodo) between 3 and 30 and apodo ~ '^[A-Za-zÀ-ÿ0-9 _.-]+$'),
  es_moderador boolean not null default false,
  bloqueado boolean not null default false,
  creado_en timestamptz not null default now()
);
create unique index perfiles_apodo_idx on perfiles (lower(apodo));

create table foro_temas (
  id bigint generated always as identity primary key,
  banda_slug text references bandas (slug) on update cascade on delete cascade, -- null = foro general
  autor_id uuid not null references perfiles (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 3 and 120),
  cuerpo text not null check (char_length(cuerpo) between 1 and 5000),
  oculto boolean not null default false,
  cerrado boolean not null default false,
  fijado boolean not null default false,
  num_respuestas integer not null default 0,
  ultima_actividad timestamptz not null default now(),
  creado_en timestamptz not null default now()
);
create index foro_temas_lista_idx on foro_temas (banda_slug, fijado desc, ultima_actividad desc);

create table foro_mensajes (
  id bigint generated always as identity primary key,
  tema_id bigint not null references foro_temas (id) on delete cascade,
  autor_id uuid not null references perfiles (id) on delete cascade,
  cuerpo text not null check (char_length(cuerpo) between 1 and 5000),
  oculto boolean not null default false,
  creado_en timestamptz not null default now()
);
create index foro_mensajes_tema_idx on foro_mensajes (tema_id, creado_en);

create table foro_denuncias (
  id bigint generated always as identity primary key,
  tema_id bigint references foro_temas (id) on delete cascade,
  mensaje_id bigint references foro_mensajes (id) on delete cascade,
  denunciante_id uuid not null references perfiles (id) on delete cascade,
  motivo text check (char_length(motivo) <= 300),
  resuelta boolean not null default false,
  creado_en timestamptz not null default now(),
  check ((tema_id is null) <> (mensaje_id is null))
);
create unique index foro_denuncias_tema_idx on foro_denuncias (denunciante_id, tema_id) where tema_id is not null;
create unique index foro_denuncias_mensaje_idx on foro_denuncias (denunciante_id, mensaje_id) where mensaje_id is not null;
create index foro_denuncias_pendientes_idx on foro_denuncias (resuelta, creado_en desc);

-- Funciones de ayuda para las políticas.
create function es_moderador() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select es_moderador from perfiles where id = auth.uid()), false);
$$;

create function puede_moderar(p_slug text) returns boolean
language sql stable security definer set search_path = public as $$
  select es_moderador()
    or (p_slug is not null and exists (select 1 from bandas where slug = p_slug and owner_id = auth.uid()));
$$;

create function puede_publicar() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and not bloqueado);
$$;

-- Seguridad por filas.
alter table perfiles enable row level security;
alter table foro_temas enable row level security;
alter table foro_mensajes enable row level security;
alter table foro_denuncias enable row level security;

create policy "apodos visibles" on perfiles for select using (true);
create policy "usuario crea su perfil" on perfiles for insert with check (id = auth.uid());
create policy "usuario cambia su apodo" on perfiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "temas visibles" on foro_temas for select
  using (not oculto or autor_id = auth.uid() or puede_moderar(banda_slug));
create policy "usuario abre tema" on foro_temas for insert
  with check (autor_id = auth.uid() and puede_publicar());

create policy "respuestas visibles" on foro_mensajes for select
  using (not oculto or autor_id = auth.uid()
    or exists (select 1 from foro_temas t where t.id = tema_id and puede_moderar(t.banda_slug)));
create policy "usuario responde" on foro_mensajes for insert
  with check (autor_id = auth.uid() and puede_publicar()
    and exists (select 1 from foro_temas t where t.id = tema_id and not t.cerrado and not t.oculto));

create policy "moderadores ven denuncias" on foro_denuncias for select
  using (es_moderador() or denunciante_id = auth.uid());
create policy "usuario denuncia" on foro_denuncias for insert
  with check (denunciante_id = auth.uid() and puede_publicar());

-- Los usuarios solo pueden escribir estas columnas; el resto (moderador, bloqueado, oculto...)
-- solo se cambia con las funciones de moderación de más abajo.
revoke insert, update, delete on perfiles, foro_temas, foro_mensajes, foro_denuncias from anon, authenticated;
grant insert (id, apodo) on perfiles to authenticated;
grant update (apodo) on perfiles to authenticated;
grant insert (banda_slug, autor_id, titulo, cuerpo) on foro_temas to authenticated;
grant insert (tema_id, autor_id, cuerpo) on foro_mensajes to authenticated;
grant insert (tema_id, mensaje_id, denunciante_id, motivo) on foro_denuncias to authenticated;

-- Límite de ritmo contra el spam: 3 respuestas por minuto y 3 temas cada 10 minutos.
create function foro_limitar_ritmo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'foro_mensajes' then
    if (select count(*) from foro_mensajes where autor_id = new.autor_id and creado_en > now() - interval '1 minute') >= 3 then
      raise exception 'Demasiados mensajes seguidos. Espera un momento.' using errcode = 'P0001', hint = 'ritmo';
    end if;
  else
    if (select count(*) from foro_temas where autor_id = new.autor_id and creado_en > now() - interval '10 minutes') >= 3 then
      raise exception 'Demasiados temas seguidos. Espera un rato.' using errcode = 'P0001', hint = 'ritmo';
    end if;
  end if;
  return new;
end;
$$;
create trigger foro_temas_ritmo before insert on foro_temas for each row execute function foro_limitar_ritmo();
create trigger foro_mensajes_ritmo before insert on foro_mensajes for each row execute function foro_limitar_ritmo();

-- Contador de respuestas y última actividad del tema.
create function foro_al_responder() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update foro_temas set num_respuestas = num_respuestas + 1, ultima_actividad = new.creado_en where id = new.tema_id;
  return new;
end;
$$;
create trigger foro_mensajes_contador after insert on foro_mensajes for each row execute function foro_al_responder();

-- Con 3 denuncias pendientes, el contenido se oculta hasta que lo revise un moderador.
create function foro_al_denunciar() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.tema_id is not null then
    if (select count(*) from foro_denuncias where tema_id = new.tema_id and not resuelta) >= 3 then
      update foro_temas set oculto = true where id = new.tema_id;
    end if;
  elsif (select count(*) from foro_denuncias where mensaje_id = new.mensaje_id and not resuelta) >= 3 then
    update foro_mensajes set oculto = true where id = new.mensaje_id;
  end if;
  return new;
end;
$$;
create trigger foro_denuncias_ocultar after insert on foro_denuncias for each row execute function foro_al_denunciar();

-- Moderar un tema o respuesta: ocultar, mostrar, cerrar, abrir, fijar, desfijar.
create function foro_moderar(p_tipo text, p_id bigint, p_accion text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_slug text;
begin
  if p_tipo = 'tema' then
    select banda_slug into v_slug from foro_temas where id = p_id;
  elsif p_tipo = 'mensaje' then
    select t.banda_slug into v_slug from foro_mensajes m join foro_temas t on t.id = m.tema_id where m.id = p_id;
  else
    raise exception 'Tipo no válido';
  end if;
  if not found or not puede_moderar(v_slug) then
    raise exception 'No tienes permiso para moderar esto';
  end if;

  if p_tipo = 'tema' then
    update foro_temas set
      oculto  = case p_accion when 'ocultar' then true  when 'mostrar' then false else oculto end,
      cerrado = case p_accion when 'cerrar'  then true  when 'abrir'   then false else cerrado end,
      fijado  = case p_accion when 'fijar'   then true  when 'desfijar' then false else fijado end
    where id = p_id;
    if p_accion in ('ocultar', 'mostrar') then
      update foro_denuncias set resuelta = true where tema_id = p_id;
    end if;
  else
    if p_accion not in ('ocultar', 'mostrar') then raise exception 'Acción no válida'; end if;
    update foro_mensajes set oculto = (p_accion = 'ocultar') where id = p_id;
    update foro_denuncias set resuelta = true where mensaje_id = p_id;
  end if;
end;
$$;

-- Solo moderadores: descartar una denuncia y bloquear o desbloquear a un usuario.
create function foro_resolver_denuncia(p_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not es_moderador() then raise exception 'Solo moderadores'; end if;
  update foro_denuncias set resuelta = true where id = p_id;
end;
$$;

create function foro_bloquear_usuario(p_usuario uuid, p_bloquear boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not es_moderador() then raise exception 'Solo moderadores'; end if;
  if p_usuario = auth.uid() then raise exception 'No puedes bloquearte a ti mismo'; end if;
  update perfiles set bloqueado = p_bloquear where id = p_usuario;
end;
$$;

revoke execute on function foro_moderar(text, bigint, text), foro_resolver_denuncia(bigint), foro_bloquear_usuario(uuid, boolean) from public, anon;
grant execute on function foro_moderar(text, bigint, text), foro_resolver_denuncia(bigint), foro_bloquear_usuario(uuid, boolean) to authenticated;
