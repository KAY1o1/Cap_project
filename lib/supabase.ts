import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.WXT_SUPABASE_URL,
  import.meta.env.WXT_SUPABASE_KEY,
  {
    auth: {
      // PKCE returns a `?code=` in the query string. chrome.identity strips the
      // URL *hash*, so implicit flow's tokens would be lost — PKCE is required.
      flowType: "pkce",
      detectSessionInUrl: false,
    },
  }
);