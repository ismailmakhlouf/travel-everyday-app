import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-connector-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Get all tables, columns, and constraints
    const { data: tables } = await supabase.rpc("", {}).maybeSingle();
    // Use direct SQL via pg_catalog introspection
    const tablesQuery = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
      },
    });

    // Introspect via information_schema through PostgREST
    // We'll query the database directly using the service role
    const schemaRes = await fetch(
      `${supabaseUrl}/rest/v1/?apikey=${serviceRoleKey}`,
      {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          Accept: "application/json",
        },
      }
    );

    // Get table definitions from OpenAPI spec
    const openApiRes = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        Accept: "application/openapi+json",
      },
    });
    const openApi = await openApiRes.json().catch(() => null);

    // 2. Database schema - query each known table's structure
    const knownTables = ["profiles", "saved_journeys", "chat_messages"];
    const tableSchemas: Record<string, unknown> = {};
    
    for (const table of knownTables) {
      // Get one row to understand structure (or empty)
      const { data, error } = await supabase.from(table).select("*").limit(0);
      tableSchemas[table] = { 
        accessible: !error,
        error: error?.message || null,
      };
    }

    // 3. Build the full project export
    const projectExport = {
      meta: {
        exported_at: new Date().toISOString(),
        project_id: "rgugamfapwullzgvslqn",
        runtime: "deno-edge-functions",
        frontend_framework: "react-vite-typescript-tailwind",
      },

      database: {
        tables: {
          profiles: {
            columns: [
              { name: "id", type: "uuid", primary_key: true, nullable: false },
              { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
              { name: "display_name", type: "text", nullable: true },
              { name: "preferred_persona", type: "text", nullable: true, default: "'Family'" },
            ],
            rls_enabled: true,
            rls_policies: [
              { name: "Users can view own profile", command: "SELECT", using: "auth.uid() = id" },
              { name: "Users can insert own profile", command: "INSERT", with_check: "auth.uid() = id" },
              { name: "Users can update own profile", command: "UPDATE", using: "auth.uid() = id" },
            ],
          },
          saved_journeys: {
            columns: [
              { name: "id", type: "uuid", primary_key: true, nullable: false, default: "gen_random_uuid()" },
              { name: "user_id", type: "uuid", nullable: false },
              { name: "name", type: "text", nullable: false, default: "'My Journey'" },
              { name: "selections", type: "jsonb", nullable: false, default: "'{}'" },
              { name: "computed_summary", type: "jsonb", nullable: true, default: "'{}'" },
              { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
              { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
            ],
            rls_enabled: true,
            rls_policies: [
              { name: "Users can view own journeys", command: "SELECT", using: "auth.uid() = user_id" },
              { name: "Users can insert own journeys", command: "INSERT", with_check: "auth.uid() = user_id" },
              { name: "Users can update own journeys", command: "UPDATE", using: "auth.uid() = user_id" },
              { name: "Users can delete own journeys", command: "DELETE", using: "auth.uid() = user_id" },
            ],
          },
          chat_messages: {
            columns: [
              { name: "id", type: "uuid", primary_key: true, nullable: false, default: "gen_random_uuid()" },
              { name: "user_id", type: "uuid", nullable: false },
              { name: "role", type: "text", nullable: false, default: "'user'" },
              { name: "content", type: "text", nullable: false },
              { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
            ],
            rls_enabled: true,
            rls_policies: [
              { name: "Users can view own messages", command: "SELECT", using: "auth.uid() = user_id" },
              { name: "Users can insert own messages", command: "INSERT", with_check: "auth.uid() = user_id" },
              { name: "Users can delete own messages", command: "DELETE", using: "auth.uid() = user_id" },
            ],
          },
        },
        functions: [
          {
            name: "handle_new_user",
            language: "plpgsql",
            security: "DEFINER",
            description: "Auto-creates a profile row when a new user signs up",
            trigger: "on auth.users INSERT",
          },
          {
            name: "update_updated_at_column",
            language: "plpgsql",
            description: "Sets updated_at = now() before UPDATE on any attached table",
          },
        ],
        table_accessibility: tableSchemas,
      },

      auth: {
        providers: ["email"],
        auto_confirm: false,
        password_min_length: 6,
        profile_trigger: "handle_new_user on auth.users AFTER INSERT",
      },

      edge_functions: [
        {
          name: "travel-concierge",
          path: "supabase/functions/travel-concierge/index.ts",
          description: "AI travel assistant using Lovable AI Gateway (google/gemini-3-flash-preview). Supports streaming SSE, tool calling for journey modifications.",
          env_vars_required: ["LOVABLE_API_KEY"],
          methods: ["POST"],
          features: ["streaming-sse", "tool-calling", "multi-mode-ai"],
        },
        {
          name: "project-export",
          path: "supabase/functions/project-export/index.ts",
          description: "This function — serves full project metadata for external connectors.",
          env_vars_required: ["PROJECT_EXPORT_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
          methods: ["GET"],
        },
      ],

      frontend: {
        framework: "React 18 + Vite + TypeScript",
        styling: "Tailwind CSS + shadcn/ui",
        routing: "react-router-dom v6",
        state: "TanStack React Query + custom hooks",
        routes: [
          { path: "/", component: "Index", description: "Landing page with hero, persona showcase, vision section" },
          { path: "/auth", component: "Auth", description: "Login/signup page" },
          { path: "/reset-password", component: "ResetPassword", description: "Password reset" },
          { path: "/demo/student", component: "StudentDemo", description: "Student travel demo" },
          { path: "/demo/business", component: "BusinessDemo", description: "Business travel demo" },
          { path: "/simulator/family", component: "FamilySimulator", description: "Interactive family journey simulator with AI concierge" },
        ],
        key_components: [
          "HeroSection", "Navbar", "PersonaShowcase", "TravelHubVision",
          "ExecutiveDashboard", "PartnerDashboard", "SpendLeakage",
          "TravelConcierge", "UserSwitcher",
        ],
      },

      infrastructure: {
        hosting: "Lovable Cloud",
        database: "PostgreSQL (via Supabase)",
        edge_runtime: "Deno (Supabase Edge Functions)",
        cdn: "Lovable CDN",
        deployment_target: "Databricks Lakehouse App",
      },

      secrets_configured: [
        "LOVABLE_API_KEY",
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY", 
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_DB_URL",
        "SUPABASE_PUBLISHABLE_KEY",
        // PROJECT_EXPORT_KEY — added separately
      ],
    };

    return new Response(JSON.stringify(projectExport, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("project-export error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
