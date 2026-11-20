-- Escudo de la banda (ruta o URL de la imagen). Se deja de guardar el enlace a la ficha de origen.
alter table bandas add column escudo_url text;
alter table bandas drop column fuente_url;
