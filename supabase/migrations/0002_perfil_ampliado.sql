-- Datos de perfil ampliados: año de fundación, web y redes sociales.
alter table bandas
  add column ano_fundacion integer check (ano_fundacion between 1800 and 2100),
  add column web text,
  add column instagram text,
  add column facebook text,
  add column youtube text;

create index bandas_tipo_idx on bandas (tipo);
