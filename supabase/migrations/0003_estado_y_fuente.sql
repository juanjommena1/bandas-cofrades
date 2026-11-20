-- Estado de la banda (activa/extinta), hermandad vinculada y enlace a la ficha de origen.
alter table bandas
  add column estado text not null default 'Activa',
  add column hermandad text,
  add column fuente_url text;

-- Las bandas importadas no tienen todavía usuario propietario: lo tendrán cuando la banda reclame su perfil.
alter table bandas alter column owner_id drop not null;
