
# Plan: AI Travel Concierge + User Accounts

This plan adds two major capabilities to the simulator: (1) persistent user accounts with login/signup, and (2) an AI travel assistant that can advise, modify journey selections, and analyze executive metrics.

---

## Prerequisites (before any code changes)

**Enable Lovable Cloud** -- this spins up a Supabase backend for authentication, database, and edge functions. You will be prompted to approve this.

**Enable Lovable AI** -- this activates the AI gateway (already has LOVABLE_API_KEY provisioned) so the concierge can use the Gemini model.

---

## 1. Database Schema

### Tables

**profiles** -- created automatically on signup via trigger
- `id` (uuid, FK to auth.users, primary key)
- `display_name` (text)
- `preferred_persona` (text: Family / Student / Business)
- `created_at` (timestamp)

**saved_journeys** -- persists journey configurations per user
- `id` (uuid, primary key)
- `user_id` (uuid, FK to auth.users)
- `name` (text, e.g. "Dubai Family Trip")
- `selections` (jsonb -- stores the full JourneySelections object)
- `computed_summary` (jsonb -- cached totals for quick display)
- `created_at` / `updated_at`

**chat_messages** -- persists conversation history per user
- `id` (uuid, primary key)
- `user_id` (uuid, FK to auth.users)
- `role` (text: user / assistant / system)
- `content` (text)
- `created_at`

### RLS Policies
- Users can only read/update their own profiles, journeys, and chat messages
- Trigger auto-creates a profile row on signup

---

## 2. Authentication

### New files
- `src/pages/Auth.tsx` -- login/signup form with email + password
- `src/pages/ResetPassword.tsx` -- password reset page
- `src/lib/supabase.ts` -- Supabase client initialization
- `src/hooks/useAuth.ts` -- auth state hook (session, user, signOut)
- `src/components/UserSwitcher.tsx` -- shows current user in the simulator top bar, with sign-out and account info

### Flow
- Unauthenticated users land on the Auth page
- After login, they are redirected to `/simulator/family`
- The simulator top bar shows the logged-in user's name and a sign-out button
- Journey selections are auto-saved to `saved_journeys` on each change (debounced)
- On login, the most recent saved journey is loaded into state

---

## 3. AI Travel Concierge

### Edge Function: `supabase/functions/travel-concierge/index.ts`

Calls the Lovable AI Gateway with a rich system prompt that understands:
- The full pricing engine data (rail options, flights, hotels, ancillaries, tier logic)
- The user's current journey selections (passed in each request)
- Three modes: **journey advisor**, **concierge** (can return structured tool calls to modify selections), and **executive analyst**

Uses streaming SSE for real-time token delivery.

### Tool Calling for Concierge Actions

The AI can return structured actions via tool calling:
- `select_rail(group_key, option_id)` -- switch a rail selection
- `select_flight(flight_id)` -- switch airline
- `select_hotel(hotel_id)` -- switch hotel
- `toggle_ancillary(ancillary_id)` -- add/remove an extra
- `optimize_journey()` -- trigger the optimizer

When the frontend receives a tool call response, it executes the corresponding action from `useJourneyState`, so the AI can directly modify the simulation.

### New UI Components
- `src/components/TravelConcierge.tsx` -- a slide-out chat panel (bottom-right FAB button) with:
  - Message input
  - Streaming markdown responses (using react-markdown)
  - Visual indicators when the AI modifies journey state
  - Mode indicator (Advisor / Concierge / Analyst) -- auto-detected from context
- Chat history persisted to `chat_messages` table

### Example Interactions
- "Which flight gives me the best tier boost?" -- advisor mode, answers with analysis
- "Switch me to Emirates and add lounge access" -- concierge mode, modifies selections live
- "What's the revenue impact at 30% adoption?" -- analyst mode, references fleet metrics

---

## 4. Changes to Existing Files

### `src/hooks/useJourneyState.ts`
- Add methods that the AI concierge can call: `applyAIAction(action)` dispatcher
- Add auto-save logic (debounced write to `saved_journeys`)
- Add `loadJourney(journeyId)` to restore saved state

### `src/pages/FamilySimulator.tsx`
- Add the `TravelConcierge` floating panel
- Add `UserSwitcher` to the top bar (replaces/augments current nav)

### `src/App.tsx`
- Add `/auth` and `/reset-password` routes
- Wrap simulator routes with auth guard

---

## 5. File Summary

```text
New files:
  src/lib/supabase.ts
  src/hooks/useAuth.ts
  src/pages/Auth.tsx
  src/pages/ResetPassword.tsx
  src/components/UserSwitcher.tsx
  src/components/TravelConcierge.tsx
  supabase/functions/travel-concierge/index.ts

Modified files:
  src/App.tsx                    (routes + auth guard)
  src/hooks/useJourneyState.ts   (AI action dispatcher, auto-save, load)
  src/pages/FamilySimulator.tsx  (add concierge panel + user switcher)
  supabase/config.toml           (edge function config)

Database migrations:
  profiles table + trigger
  saved_journeys table
  chat_messages table
  RLS policies for all three
```

---

## Technical Notes

- The AI system prompt will embed the full catalog data (rail/flight/hotel/ancillary options with IDs) so the model can reference specific options by ID when making concierge actions
- Tool calling uses the OpenAI-compatible format supported by the Lovable AI Gateway
- Chat messages are persisted per-user so conversation history survives page reloads
- The concierge panel uses the same streaming SSE pattern from the Lovable AI documentation
- Default model: `google/gemini-3-flash-preview`
