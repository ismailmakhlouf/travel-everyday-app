/* ══════════════════════════════════════════════════════
   REVENUE MODEL — Fleet-wide projections from a single
   journey configuration. All executive metrics derive
   from this module.
   ══════════════════════════════════════════════════════ */

import type { ComputedJourney } from "./pricingEngine";

export const MONTHLY_JOURNEYS = 285_000;
export const LEGACY_REV_PER_JOURNEY = 87; // rail-only capture

export interface FleetMetrics {
  adoptionRate: number;
  adoptedJourneys: number;

  // Per-journey
  revPerJourney: number;
  leakagePerJourney: number;
  basketMultiplier: string;

  // Monthly
  monthlyRevHub: number;
  monthlyRevLegacy: number;
  monthlyUplift: number;

  // Annual
  annualRevHub: number;
  annualUplift: number;

  // Rates
  ancillaryAttachRate: number;
  crossPartnerRevPct: number;
  marginUplift: number;

  // Partner distribution (per-journey and monthly)
  partners: PartnerLine[];

  // Segment projections
  segments: SegmentProjection[];
}

export interface PartnerLine {
  label: string;
  perJourney: number;
  pctOfTotal: number;
  monthly: number;
  annual: number;
}

export interface SegmentProjection {
  segment: string;
  volumePct: number;
  revPerJourney: number;
  ancillaryAttach: number;
  yoyGrowth: string;
  highlight?: boolean;
}

export function computeFleetMetrics(
  journey: ComputedJourney,
  adoptionRate: number // 0-1
): FleetMetrics {
  const adoptedJourneys = Math.round(MONTHLY_JOURNEYS * adoptionRate);
  const revPerJourney = journey.totalBundle;
  const leakagePerJourney = revPerJourney - LEGACY_REV_PER_JOURNEY;
  const basketMultiplier = (revPerJourney / LEGACY_REV_PER_JOURNEY).toFixed(1);

  const monthlyRevHub = adoptedJourneys * revPerJourney;
  const monthlyRevLegacy = adoptedJourneys * LEGACY_REV_PER_JOURNEY;
  const monthlyUplift = monthlyRevHub - monthlyRevLegacy;

  const annualRevHub = monthlyRevHub * 12;
  const annualUplift = monthlyUplift * 12;

  const ancillaryAttachRate = journey.ancillaries.totalAvailable > 0
    ? Math.round((journey.ancillaries.count / journey.ancillaries.totalAvailable) * 100)
    : 0;

  const totalRev = journey.totalBundle || 1;
  const crossPartnerRevPct = Math.round(
    ((journey.revenueBySegment.airline + journey.revenueBySegment.hotel) / totalRev) * 100
  );

  const marginUplift = journey.tierPoints > 500 ? 36 : 31;

  // Partner distribution
  const seg = journey.revenueBySegment;
  const mkPartner = (label: string, amount: number): PartnerLine => ({
    label,
    perJourney: amount,
    pctOfTotal: Math.round((amount / totalRev) * 100),
    monthly: Math.round((amount / totalRev) * monthlyRevHub),
    annual: Math.round((amount / totalRev) * annualRevHub),
  });

  const partners: PartnerLine[] = [
    mkPartner("Rail (Trainline)", seg.rail),
    mkPartner(`Airline (${journey.flight.airline})`, seg.airline),
    mkPartner(`Hotel (${journey.hotel.name})`, seg.hotel),
    mkPartner("Ancillaries", seg.ancillary),
  ];

  // Segment projections — family row is live, others are reference benchmarks
  const segments: SegmentProjection[] = [
    {
      segment: "Family (3+ kids)",
      volumePct: 22,
      revPerJourney,
      ancillaryAttach: ancillaryAttachRate,
      yoyGrowth: "+34%",
      highlight: true,
    },
    { segment: "Business Solo", volumePct: 35, revPerJourney: 340, ancillaryAttach: 45, yoyGrowth: "+18%" },
    { segment: "Student / Budget", volumePct: 28, revPerJourney: 185, ancillaryAttach: 62, yoyGrowth: "+52%" },
    { segment: "Leisure Couple", volumePct: 15, revPerJourney: 420, ancillaryAttach: 38, yoyGrowth: "+21%" },
  ];

  return {
    adoptionRate,
    adoptedJourneys,
    revPerJourney,
    leakagePerJourney,
    basketMultiplier,
    monthlyRevHub,
    monthlyRevLegacy,
    monthlyUplift,
    annualRevHub,
    annualUplift,
    ancillaryAttachRate,
    crossPartnerRevPct,
    marginUplift,
    partners,
    segments,
  };
}

// ─── Scenario helper ────────────────────────────────

export interface AdoptionScenario {
  label: string;
  rate: number;
  monthlyRev: number;
  monthlyUplift: number;
  annualUplift: number;
}

export function computeAdoptionScenarios(
  revPerJourney: number,
  rates: number[] = [0.08, 0.12, 0.18, 0.25, 0.35]
): AdoptionScenario[] {
  return rates.map(rate => {
    const vol = Math.round(MONTHLY_JOURNEYS * rate);
    const monthlyRev = vol * revPerJourney;
    const monthlyUplift = vol * (revPerJourney - LEGACY_REV_PER_JOURNEY);
    return {
      label: `${Math.round(rate * 100)}%`,
      rate,
      monthlyRev,
      monthlyUplift,
      annualUplift: monthlyUplift * 12,
    };
  });
}
