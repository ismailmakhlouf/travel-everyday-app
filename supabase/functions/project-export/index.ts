import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function extractTableData(
  supabase: ReturnType<typeof createClient>,
  tableName: string,
  since?: string
) {
  const allRows: Record<string, unknown>[] = [];
  const batchSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase.from(tableName).select("*").range(offset, offset + batchSize - 1);

    if (since) {
      // Try updated_at first, fall back to created_at
      query = query.or(`updated_at.gte.${since},created_at.gte.${since}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error extracting ${tableName}:`, error.message);
      return { rows: allRows, total_count: allRows.length, error: error.message };
    }

    if (data && data.length > 0) {
      allRows.push(...data);
      offset += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  return { rows: allRows, total_count: allRows.length };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
  const url = new URL(req.url);
  const includeData = url.searchParams.get("include_data") === "true";
  const tablesParam = url.searchParams.get("tables");
  const sinceParam = url.searchParams.get("since");

  // If include_data is requested, validate Service Role Key auth
  if (includeData) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized. Service Role Key required for data extraction." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

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

    // Check for bootstrap errors
    const errors: string[] = [];
    if (tablesRes.error) errors.push(`introspect_tables: ${tablesRes.error.message}`);
    if (rlsRes.error) errors.push(`introspect_rls_policies: ${rlsRes.error.message}`);
    if (rlsStatusRes.error) errors.push(`introspect_rls_status: ${rlsStatusRes.error.message}`);
    if (funcsRes.error) errors.push(`introspect_functions: ${funcsRes.error.message}`);
    if (triggersRes.error) errors.push(`introspect_triggers: ${triggersRes.error.message}`);

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Introspection functions not found. Run project-introspection-bootstrap.sql first.",
          details: errors,
          bootstrap_sql: "https://github.com/<owner>/<repo>/blob/main/supabase/project-introspection-bootstrap.sql",
        }, null, 2),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Merge RLS status + policies into table objects
    const tables = tablesRes.data ?? {};
    const rlsPolicies = rlsRes.data ?? {};
    const rlsStatus = rlsStatusRes.data ?? {};

    for (const tableName of Object.keys(tables)) {
      tables[tableName].rls_enabled = rlsStatus[tableName] ?? false;
      tables[tableName].rls_policies = rlsPolicies[tableName] ?? [];
    }

    // Filter out introspection functions
    const allFunctions = (funcsRes.data ?? []) as Array<{ name: string }>;
    const introspectionNames = new Set([
      "introspect_tables",
      "introspect_rls_policies",
      "introspect_rls_status",
      "introspect_functions",
      "introspect_triggers",
    ]);
    const projectFunctions = allFunctions.filter(
      (f) => !introspectionNames.has(f.name)
    );

    // Extract table data if requested
    let tableData: Record<string, unknown> | undefined;
    if (includeData) {
      const tableNames = tablesParam
        ? tablesParam.split(",").map((t) => t.trim())
        : Object.keys(tables);

      tableData = {};
      const dataPromises = tableNames.map(async (name) => {
        const result = await extractTableData(supabase, name, sinceParam || undefined);
        return { name, result };
      });

      const results = await Promise.all(dataPromises);
      for (const { name, result } of results) {
        tableData[name] = result;
      }
    }

    const database: Record<string, unknown> = {
      tables,
      functions: projectFunctions,
      triggers: triggersRes.data ?? [],
    };

    if (tableData) {
      database.table_data = tableData;
    }

    const projectExport = {
      meta: {
        exported_at: new Date().toISOString(),
        project_ref: projectRef,
        version: "2.2",
        description:
          "Dynamic project introspection with optional data extraction. Portable across any Lovable Cloud / Supabase project.",
        include_data: includeData,
      },

      database,

      github_delegation: {
        description:
          "Auth config and edge function source cannot be introspected via SQL. " +
          "The deployment app should pull these directly from the project's GitHub repo.",
        instructions: {
          auth_config: {
            file: "supabase/config.toml",
            sections: ["[auth]", "[auth.email]", "[auth.external.*]"],
            note: "Parse the TOML to extract auth providers, auto-confirm, password rules, etc.",
          },
          edge_functions: {
            directory: "supabase/functions/",
            pattern: "supabase/functions/*/index.ts",
            note: "Each subdirectory is one edge function. The index.ts is the entry point.",
          },
          migrations: {
            directory: "supabase/migrations/",
            pattern: "supabase/migrations/*.sql",
            note: "Ordered SQL migration files. Apply in filename order for schema recreation.",
          },
          frontend_source: {
            directory: "src/",
            note: "Full React/Vite/TypeScript frontend source tree.",
          },
        },
        github_api_example: {
          contents_url:
            "https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}",
          tree_url:
            "https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
        },
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
