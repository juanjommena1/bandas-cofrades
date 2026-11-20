-- Escudo de la banda (ruta o URL de la imagen). Se deja de guardar el enlace a la ficha de origen.
alter table bandas add column if not exists escudo_url text;
alter table bandas drop column if exists fuente_url;

-- Hay bandas fundadas antes de 1800 (p. ej. 1789): se amplía el rango permitido.
alter table bandas drop constraint if exists bandas_ano_fundacion_check;
alter table bandas add constraint bandas_ano_fundacion_check check (ano_fundacion between 1500 and 2100);
