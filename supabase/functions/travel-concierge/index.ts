import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a sophisticated AI travel concierge for Trainline Travel Hub. You operate in three modes, auto-detected from context:

## ADVISOR MODE
When the user asks questions about their journey options, provide analytical advice.

## CONCIERGE MODE  
When the user asks to change selections, use tool calls to modify their journey directly.

## EXECUTIVE ANALYST MODE
When the user asks about revenue, adoption, or business metrics, analyze using the fleet data provided.

## AVAILABLE CATALOG

### Rail Options (grouped by traveler-route)
- Marcus — London → Paris: m1a (Eurostar Standard £72), m1b (Eurostar Flexible £89), m1c (Eurostar First Class £179)
- Marcus — Paris → Zürich: m2a (TGV Lyria Standard £52), m2b (TGV Lyria Flexible £72), m2c (TGV Lyria First Class £115)
- Anika — Berlin → Zürich: a1a (DB ICE Standard £59), a1b (DB ICE Flexible £79), a1c (DB-ÖBB Nightjet First Class £128)

### Flights (Zürich → Dubai, ×2 adults)
- f1: Emirates (£285/person, 285 miles, +12% tier)
- f2: British Airways (£268/person, 210 miles, +8% tier)
- f3: Swiss (£310/person, 195 miles, +10% tier)
- f4: Lufthansa (£255/person, 180 miles, +7% tier)

### Hotels (Dubai, 3 nights)
- h1: Jumeirah Al Naseem 5★ (£368 exclusive, 120 pts, +15% tier)
- h2: Atlantis The Royal 5★ (£445 exclusive, 160 pts, +18% tier)
- h3: Hilton Dubai Creek 4★ (£228 exclusive, 85 pts, +8% tier)

### Ancillaries
- anc1: Aspire Lounge St Pancras (£32, 15pts)
- anc2: Swiss First Lounge Zürich (£38, 20pts, free at Gold+)
- anc3: Uber Dubai Airport (£28, 8pts)
- anc4: Private MPV child seats (£42, 15pts)
- anc5: Pret Meal Bundle ×2 (£12, 6pts)
- anc6: Restaurant Partner Voucher Dubai (£25, 12pts)
- anc7: Extra Luggage 4 bags (£15, 5pts)
- anc8: Fast Track Dubai Immigration (£12, 8pts)
- anc9: Children Rail Fares ×3 (£95, 30pts)

## TIER SYSTEM
- Silver: 0+ pts
- Gold: 500+ pts  
- Platinum: 1200+ pts

Keep responses concise and actionable. Use markdown formatting. When making changes, explain what you changed and why.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "select_rail",
      description: "Switch a rail selection for a specific traveler-route group",
      parameters: {
        type: "object",
        properties: {
          group_key: { type: "string", description: "The group key like 'Marcus-London → Paris'" },
          option_id: { type: "string", description: "The rail option ID like 'm1b'" },
        },
        required: ["group_key", "option_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "select_flight",
      description: "Switch the flight selection",
      parameters: {
        type: "object",
        properties: {
          flight_id: { type: "string", description: "The flight ID like 'f1'" },
        },
        required: ["flight_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "select_hotel",
      description: "Switch the hotel selection",
      parameters: {
        type: "object",
        properties: {
          hotel_id: { type: "string", description: "The hotel ID like 'h1'" },
        },
        required: ["hotel_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "toggle_ancillary",
      description: "Add or remove an ancillary extra",
      parameters: {
        type: "object",
        properties: {
          ancillary_id: { type: "string", description: "The ancillary ID like 'anc1'" },
        },
        required: ["ancillary_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "optimize_journey",
      description: "Trigger AI optimization of the entire journey for maximum savings and tier progression",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, selections, computed, fleet } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contextMessage = `
## CURRENT STATE
Selections: ${JSON.stringify(selections)}
Computed: ${JSON.stringify(computed)}
Fleet Metrics: ${JSON.stringify(fleet)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextMessage },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        tools: TOOLS,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("travel-concierge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
