-- Esquema inicial: bandas y su disponibilidad por día y franja.

create type tipo_banda as enum ('cornetas_tambores', 'agrupacion_musical', 'banda_musica');
create type franja as enum ('manana', 'tarde', 'noche');
create type estado_franja as enum ('libre', 'ocupado');

create table bandas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique,
  nombre text not null,
  tipo tipo_banda not null,
  localidad text not null,
  provincia text not null,
  musicos integer check (musicos > 0),
  precio_min integer check (precio_min >= 0),
  precio_max integer check (precio_max >= precio_min),
  telefono text,
  email text,
  repertorio text,
  descripcion text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index bandas_provincia_idx on bandas (provincia);
create index bandas_owner_idx on bandas (owner_id);

-- Una fila por banda, fecha y franja. Si no hay fila, la franja está "sin confirmar".
create table disponibilidad (
  banda_id uuid not null references bandas (id) on delete cascade,
  fecha date not null,
  franja franja not null,
  estado estado_franja not null,
  actualizado_en timestamptz not null default now(),
  primary key (banda_id, fecha, franja)
);

create index disponibilidad_fecha_idx on disponibilidad (fecha, franja, estado);

alter table bandas enable row level security;
alter table disponibilidad enable row level security;

-- Cualquiera puede ver bandas y disponibilidad (las hermandades buscan sin registrarse).
create policy "bandas visibles" on bandas for select using (true);
create policy "disponibilidad visible" on disponibilidad for select using (true);

-- Solo la propia banda edita sus datos.
create policy "banda crea su perfil" on bandas for insert with check (auth.uid() = owner_id);
create policy "banda edita su perfil" on bandas for update using (auth.uid() = owner_id);
create policy "banda borra su perfil" on bandas for delete using (auth.uid() = owner_id);

create policy "banda gestiona su calendario" on disponibilidad for all
  using (exists (select 1 from bandas b where b.id = banda_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from bandas b where b.id = banda_id and b.owner_id = auth.uid()));
