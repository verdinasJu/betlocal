import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con `service_role`: salta RLS y es el único que puede escribir en el
 * catálogo. Solo debe instanciarse en código de servidor (rutas de cron), nunca
 * en un componente de cliente, porque la clave da acceso total a la base.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
