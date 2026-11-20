# Bandas Cofrades

Web para que las hermandades encuentren banda libre para su salida procesional. Cada banda (cornetas y tambores, agrupación musical o banda de música) tiene un perfil y un calendario de disponibilidad por día y franja (mañana, tarde, noche).

## Qué hace esta primera versión

- **Catálogo** (`/`): rejilla de bandas con búsqueda por nombre o localidad, provincia y tipo de formación.
- **Perfil público de banda** (`/bandas/[slug]`): año de fundación, músicos, precio orientativo, repertorio, redes sociales, calendario y botón para escribir por WhatsApp o llamar.
- **Panel de la banda** (`/panel`): la banda entra con un enlace a su correo, crea o edita su perfil y marca su calendario pulsando cada franja.

Sin pagos ni contratos dentro de la web por ahora.

## Tecnología

- [Next.js](https://nextjs.org) 15 (App Router, TypeScript).
- [Supabase](https://supabase.com): base de datos Postgres y acceso por enlace mágico al correo.
- Pensado para publicarse en [Vercel](https://vercel.com).

## Probarla en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin configurar Supabase, el catálogo usa las bandas de `src/data/bandas.json` y el panel de bandas está desactivado.

## Conectar Supabase

1. Crea un proyecto gratuito en Supabase.
2. En el editor SQL, ejecuta en orden los archivos de `supabase/migrations/`.
3. En *Authentication → URL Configuration*, añade `http://localhost:3000/**` y `https://bandas-cofrades.vercel.app/**` a las URLs de redirección (el `**` permite volver al foro después de entrar).
4. Copia `.env.example` a `.env.local` y rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (en *Project Settings → API*).
5. `npm run dev` y entra en `/panel` para crear tu primera banda.

## Datos de bandas

`src/data/bandas.json` contiene 1.847 bandas (1.665 activas y 182 extintas) tomadas del directorio público de [Musicofrades](https://musicofrades.com/directorio-de-bandas/) el 20/11/2026: nombre, tipo, localidad, provincia, año, estado, hermandad, web y redes. Cada perfil enlaza a su ficha original. Teléfonos y correos no se importan: cada banda los añade al reclamar su perfil.

Para actualizarlas:

```bash
python3 scripts/extraer_musicofrades.py /tmp/mc   # ~40 min, una petición cada 0,6 s
python3 scripts/convertir_musicofrades.py /tmp/mc # regenera bandas.json y supabase/seed_bandas.sql
```

Con Supabase, ejecuta `supabase/seed_bandas.sql` después de las migraciones para cargar las bandas.

## Modelo de datos

- `bandas`: perfil de cada banda; cada una pertenece a un usuario (`owner_id`).
- `disponibilidad`: una fila por banda, fecha y franja con estado `libre` u `ocupado`. Si no hay fila, la franja está "sin confirmar".

Las políticas de seguridad (RLS) dejan que cualquiera lea los perfiles y que solo cada banda edite los suyos.

## Foro

- **Foro general** (`/foro`) y **foro de cada banda** (`/bandas/[slug]/foro`, con los últimos temas en el perfil).
- Para escribir hay que entrar con el correo (mismo enlace mágico que el panel) y elegir un **apodo**; el correo nunca se muestra.
- **Moderación básica** (`supabase/migrations/0004_foro.sql`):
  - Cualquiera puede denunciar un tema o respuesta. Con 3 denuncias se oculta solo hasta que lo revise un moderador.
  - Los moderadores ocultan, cierran, fijan y bloquean usuarios, y tienen una página con las denuncias pendientes (`/foro/moderacion`).
  - El dueño de una banda puede ocultar, cerrar y fijar temas en el foro de su banda.
  - Límite de ritmo contra el spam: 3 respuestas por minuto y 3 temas cada 10 minutos.
- Para hacerte moderador, entra en el foro, elige tu apodo y ejecuta en el editor SQL de Supabase:

  ```sql
  update perfiles set es_moderador = true where lower(apodo) = lower('TuApodo');
  ```

Sin Supabase, el foro se ve vacío y avisa de que se activará al conectar la base de datos.

## Siguientes pasos

- Cargar a mano 20 o 30 bandas reales de Granada, Málaga y Almería (con su permiso).
- Calendario para fechas fuera de Semana Santa (glorias, Corpus, patronales).
- Búsqueda por distancia, fotos y vídeo en el perfil.
- Avisos a la hermandad cuando una banda quede libre en la fecha que busca.
