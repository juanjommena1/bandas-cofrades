export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Sin Supabase configurado, la web funciona con bandas de ejemplo. */
export const modoDemo = !supabaseUrl || !supabaseAnonKey;
