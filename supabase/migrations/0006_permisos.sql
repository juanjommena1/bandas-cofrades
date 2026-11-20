-- Permisos de acceso a las tablas para la web.
-- Los proyectos nuevos de Supabase ya no dan permisos automáticos a las tablas creadas por SQL,
-- así que se conceden aquí. Lo que cada usuario puede ver o cambiar lo siguen limitando
-- las políticas de seguridad (RLS) de cada tabla.

grant usage on schema public to anon, authenticated;

-- Lectura: catálogo, calendario y foro son públicos (RLS oculta lo moderado).
grant select on bandas, disponibilidad, perfiles, foro_temas, foro_mensajes, foro_denuncias to anon, authenticated;

-- Escritura de las bandas en su panel (RLS: solo su propia banda).
grant insert, update, delete on bandas, disponibilidad to authenticated;

-- Funciones que usan las políticas y la web.
grant execute on function es_moderador(), puede_moderar(text), puede_publicar() to anon, authenticated;
