import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Run all introspection queries in parallel
    const [tablesRes, rlsRes, rlsStatusRes, funcsRes, triggersRes] =
      await Promise.all([
        supabase.rpc("introspect_tables"),
        supabase.rpc("introspect_rls_policies"),
        supabase.rpc("introspect_rls_status"),
        supabase.rpc("introspect_functions"),
        supabase.rpc("introspect_triggers"),
      ]);

    // Merge RLS status + policies into table objects
    const tables = tablesRes.data ?? {};
    const rlsPolicies = rlsRes.data ?? {};
    const rlsStatus = rlsStatusRes.data ?? {};

    for (const tableName of Object.keys(tables)) {
      tables[tableName].rls_enabled = rlsStatus[tableName] ?? false;
      tables[tableName].rls_policies = rlsPolicies[tableName] ?? [];
    }

    const projectExport = {
      meta: {
        exported_at: new Date().toISOString(),
        version: "2.0",
        description:
          "Dynamic project introspection — drop this edge function into any Lovable Cloud project.",
      },
      database: {
        tables,
        functions: funcsRes.data ?? [],
        triggers: triggersRes.data ?? [],
      },
      auth: {
        note: "Auth config is not introspectable via SQL. Check supabase/config.toml or the Cloud UI.",
      },
      edge_functions: {
        note: "Edge function source code lives in supabase/functions/. Connect via GitHub for full code access.",
      },
    };

    return new Response(JSON.stringify(projectExport, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("project-export error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
