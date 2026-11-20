# Bandas Cofrades

Web para que las hermandades encuentren banda libre para su salida procesional. Cada banda (cornetas y tambores, agrupación musical o banda de música) tiene un perfil y un calendario de disponibilidad por día y franja (mañana, tarde, noche).

## Qué hace esta primera versión

- **Buscador** (`/`): por día de Semana Santa 2027 o cualquier fecha, franja, provincia y tipo de banda. Primero salen las bandas que han confirmado que están libres, luego las que no han confirmado y al final las ocupadas.
- **Perfil público de banda** (`/bandas/[slug]`): datos, precio orientativo, repertorio, calendario y botón para escribir por WhatsApp o llamar.
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

Abre http://localhost:3000. Sin configurar Supabase, la web funciona en **modo demostración** con bandas de ejemplo inventadas y el panel desactivado.

## Conectar Supabase

1. Crea un proyecto gratuito en Supabase.
2. En el editor SQL, ejecuta `supabase/migrations/0001_init.sql`.
3. En *Authentication → URL Configuration*, añade `http://localhost:3000/auth/callback` (y la URL de producción) a las URLs de redirección.
4. Copia `.env.example` a `.env.local` y rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (en *Project Settings → API*).
5. `npm run dev` y entra en `/panel` para crear tu primera banda.

## Modelo de datos

- `bandas`: perfil de cada banda; cada una pertenece a un usuario (`owner_id`).
- `disponibilidad`: una fila por banda, fecha y franja con estado `libre` u `ocupado`. Si no hay fila, la franja está "sin confirmar".

Las políticas de seguridad (RLS) dejan que cualquiera lea los perfiles y que solo cada banda edite los suyos.

## Siguientes pasos

- Cargar a mano 20 o 30 bandas reales de Granada, Málaga y Almería (con su permiso).
- Calendario para fechas fuera de Semana Santa (glorias, Corpus, patronales).
- Búsqueda por distancia, fotos y vídeo en el perfil.
- Avisos a la hermandad cuando una banda quede libre en la fecha que busca.
