/* ══════════════════════════════════════════════════════
   JOURNEY STATE HOOK — Global simulation state.
   All UI components consume this hook.
   ══════════════════════════════════════════════════════ */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  type JourneySelections,
  type ComputedJourney,
  getRailGroups,
  computeJourney,
  optimizeSelections,
  ANCILLARY_OPTIONS,
} from "@/lib/pricingEngine";
import { computeFleetMetrics, type FleetMetrics } from "@/lib/revenueModel";
import { supabase } from "@/integrations/supabase/client";

export type Step = "rail" | "flight" | "hotel" | "ancillaries" | "optimize" | "checkout";
export const STEPS: Step[] = ["rail", "flight", "hotel", "ancillaries", "optimize", "checkout"];
export type ViewMode = "customer" | "executive";

// Default: NO predetermined selections — user picks everything.
function defaultSelections(): JourneySelections {
  return {
    persona: "Family",
    railSelections: {},
    flightId: "",
    hotelId: "",
    ancillaryIds: [],
    optimized: false,
  };
}

export function useJourneyState(userId?: string) {
  const [selections, setSelections] = useState<JourneySelections>(defaultSelections);
  const [step, setStep] = useState<Step>("rail");
  const [view, setView] = useState<ViewMode>("customer");
  const [optimizing, setOptimizing] = useState(false);
  const [adoptionRate, setAdoptionRate] = useState(0.18);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const railGroups = useMemo(() => getRailGroups(), []);

  // Computed journey — recalculates on every selection change
  const computed: ComputedJourney = useMemo(
    () => computeJourney(selections),
    [selections]
  );

  // Pre-optimization snapshot
  const preOptComputed: ComputedJourney = useMemo(
    () => computeJourney({ ...selections, optimized: false }),
    [selections]
  );

  // Fleet metrics
  const fleet: FleetMetrics = useMemo(
    () => computeFleetMetrics(computed, adoptionRate),
    [computed, adoptionRate]
  );

  // ─── Load most recent journey on login ────────────
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("saved_journeys")
      .select("id, selections")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setJourneyId(data[0].id);
          const saved = data[0].selections as unknown as JourneySelections;
          if (saved && saved.persona) setSelections(saved);
        }
      });
  }, [userId]);

  // ─── Auto-save (debounced) ────────────────────────
  useEffect(() => {
    if (!userId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const summary = {
        totalBundle: computed.totalBundle,
        totalSavings: computed.totalSavings,
        tier: computed.tier.name,
        tierPoints: computed.tierPoints,
      };
      if (journeyId) {
        await supabase
          .from("saved_journeys")
          .update({ selections: selections as any, computed_summary: summary as any })
          .eq("id", journeyId);
      } else {
        const { data } = await supabase
          .from("saved_journeys")
          .insert({ user_id: userId, name: "My Journey", selections: selections as any, computed_summary: summary as any })
          .select("id")
          .single();
        if (data) setJourneyId(data.id);
      }
    }, 1500);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [selections, userId, journeyId, computed.totalBundle, computed.totalSavings, computed.tier.name, computed.tierPoints]);

  // ─── Actions ────────────────────────────────────────

  const selectRail = useCallback((groupKey: string, optionId: string) => {
    setSelections(prev => ({
      ...prev,
      railSelections: { ...prev.railSelections, [groupKey]: optionId },
    }));
  }, []);

  const selectFlight = useCallback((id: string) => {
    setSelections(prev => ({ ...prev, flightId: id }));
  }, []);

  const selectHotel = useCallback((id: string) => {
    setSelections(prev => ({ ...prev, hotelId: id }));
  }, []);

  const toggleAncillary = useCallback((id: string) => {
    setSelections(prev => ({
      ...prev,
      ancillaryIds: prev.ancillaryIds.includes(id)
        ? prev.ancillaryIds.filter(x => x !== id)
        : [...prev.ancillaryIds, id],
    }));
  }, []);

  const handleOptimize = useCallback(() => {
    if (selections.optimized) return;
    setOptimizing(true);
    setTimeout(() => {
      setSelections(prev => optimizeSelections(prev));
      setOptimizing(false);
    }, 2500);
  }, [selections.optimized]);

  const resetJourney = useCallback(() => {
    setSelections(defaultSelections());
    setStep("rail");
  }, []);

  // ─── AI Action Dispatcher ─────────────────────────
  const applyAIAction = useCallback((action: { name: string; arguments: Record<string, string> }) => {
    switch (action.name) {
      case "select_rail":
        selectRail(action.arguments.group_key, action.arguments.option_id);
        break;
      case "select_flight":
        selectFlight(action.arguments.flight_id);
        break;
      case "select_hotel":
        selectHotel(action.arguments.hotel_id);
        break;
      case "toggle_ancillary":
        toggleAncillary(action.arguments.ancillary_id);
        break;
      case "optimize_journey":
        handleOptimize();
        break;
    }
  }, [selectRail, selectFlight, selectHotel, toggleAncillary, handleOptimize]);

  // Step navigation
  const stepIndex = STEPS.indexOf(step);
  const nextStep = useCallback(() => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
  }, [stepIndex]);
  const prevStep = useCallback(() => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  }, [stepIndex]);

  return {
    // State
    selections,
    step,
    stepIndex,
    view,
    optimizing,
    adoptionRate,

    // Computed
    computed,
    preOptComputed,
    fleet,
    railGroups,

    // Actions
    setStep,
    setView,
    setAdoptionRate,
    selectRail,
    selectFlight,
    selectHotel,
    toggleAncillary,
    handleOptimize,
    resetJourney,
    nextStep,
    prevStep,
    applyAIAction,
  };
}
