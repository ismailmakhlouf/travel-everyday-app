import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  return new Response(JSON.stringify({
    supabase_url: Deno.env.get("SUPABASE_URL"),
    service_role_key: serviceRoleKey,
    project_ref: Deno.env.get("SUPABASE_URL")!.replace("https://", "").split(".")[0],
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
