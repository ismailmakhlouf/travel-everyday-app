/* ══════════════════════════════════════════════════════
   JOURNEY STATE HOOK — Global simulation state.
   All UI components consume this hook.
   ══════════════════════════════════════════════════════ */

import { useState, useMemo, useCallback } from "react";
import {
  type JourneySelections,
  type ComputedJourney,
  getRailGroups,
  computeJourney,
  optimizeSelections,
  ANCILLARY_OPTIONS,
} from "@/lib/pricingEngine";
import { computeFleetMetrics, type FleetMetrics } from "@/lib/revenueModel";

export type Step = "rail" | "flight" | "hotel" | "ancillaries" | "optimize" | "checkout";
export const STEPS: Step[] = ["rail", "flight", "hotel", "ancillaries", "optimize", "checkout"];
export type ViewMode = "customer" | "executive";

// Default: NO predetermined selections — user picks everything.
// We start with empty rail selections so user must choose.
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

export function useJourneyState() {
  const [selections, setSelections] = useState<JourneySelections>(defaultSelections);
  const [step, setStep] = useState<Step>("rail");
  const [view, setView] = useState<ViewMode>("customer");
  const [optimizing, setOptimizing] = useState(false);
  const [adoptionRate, setAdoptionRate] = useState(0.18);

  const railGroups = useMemo(() => getRailGroups(), []);

  // Computed journey — recalculates on every selection change
  const computed: ComputedJourney = useMemo(
    () => computeJourney(selections),
    [selections]
  );

  // Pre-optimization snapshot (for before/after comparison)
  const preOptComputed: ComputedJourney = useMemo(
    () => computeJourney({ ...selections, optimized: false }),
    [selections]
  );

  // Fleet metrics — recalculates on adoption rate or journey change
  const fleet: FleetMetrics = useMemo(
    () => computeFleetMetrics(computed, adoptionRate),
    [computed, adoptionRate]
  );

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
  };
}
