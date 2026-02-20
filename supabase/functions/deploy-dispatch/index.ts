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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Validate Authorization header is Service Role Key
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];

  try {
    const body = await req.json();
    const {
      published_app_url,
      github_repo,
      github_branch = "main",
      include_data = false,
      tables,
      databricks_app_name,
      stages = [],
      key_delivery = "databricks_secret",
    } = body;

    if (!published_app_url || !databricks_app_name) {
      return new Response(
        JSON.stringify({ error: "published_app_url and databricks_app_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sourceConfig = {
      published_app_url,
      supabase_url: supabaseUrl,
      project_ref: projectRef,
      github_repo: github_repo || null,
      github_branch,
      include_data,
      tables: tables || null,
      databricks_app_name,
    };

    const row: Record<string, unknown> = {
      status: "pending",
      source_config: sourceConfig,
      stages,
      stage_results: {},
      key_delivery,
    };

    // Option B: inline key delivery
    if (key_delivery === "inline") {
      row.service_role_key = serviceRoleKey;
    }

    const { data, error } = await supabase
      .from("deploy_requests")
      .insert(row)
      .select("id, status, source_config, key_delivery, created_at")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("deploy-dispatch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
