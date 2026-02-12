/* ══════════════════════════════════════════════════════
   PRICING ENGINE — All calculation logic lives here.
   UI components NEVER do inline arithmetic.
   ══════════════════════════════════════════════════════ */

// ─── Data Models ────────────────────────────────────

export interface RailOption {
  id: string;
  traveler: string;
  route: string;
  operator: string;
  class: "Standard" | "Flexible" | "First Class" | string;
  time: string;
  marketPrice: number;
  bundlePrice: number;
  points: number;
}

export interface FlightOption {
  id: string;
  airline: string;
  route: string;
  time: string;
  marketPrice: number;
  bundlePrice: number;
  airlineMiles: number;
  tierBoost: number;
}

export interface HotelOption {
  id: string;
  name: string;
  stars: number;
  bookingPrice: number;
  agodaPrice: number;
  trainlineExclusivePrice: number;
  hotelPoints: number;
  tierBoost: number;
}

export interface AncillaryOption {
  id: string;
  category: "Lounge" | "Transfer" | "Dining" | "Extras";
  name: string;
  marketPrice: number;
  bundlePrice: number;
  points: number;
  freeAtTier?: TierName;
  freeLabel?: string;
}

export type Persona = "Family" | "Student" | "Business";
export type TierName = "Silver" | "Gold" | "Platinum";

export interface TierDef {
  name: TierName;
  min: number;
  color: string;
}

// ─── Tier Logic ─────────────────────────────────────

export const TIERS: TierDef[] = [
  { name: "Silver", min: 0, color: "hsl(210 10% 60%)" },
  { name: "Gold", min: 500, color: "hsl(40 90% 55%)" },
  { name: "Platinum", min: 1200, color: "hsl(270 30% 65%)" },
];

export function getTier(points: number): TierDef {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTier(points: number): TierDef | null {
  for (const t of TIERS) {
    if (points < t.min) return t;
  }
  return null;
}

// ─── Static Data Catalogs ───────────────────────────

export const RAIL_OPTIONS: RailOption[] = [
  { id: "m1a", traveler: "Marcus", route: "London → Paris", operator: "Eurostar", class: "Standard", time: "2h 16m", marketPrice: 89, bundlePrice: 72, points: 36 },
  { id: "m1b", traveler: "Marcus", route: "London → Paris", operator: "Eurostar", class: "Flexible", time: "2h 16m", marketPrice: 129, bundlePrice: 89, points: 54 },
  { id: "m1c", traveler: "Marcus", route: "London → Paris", operator: "Eurostar", class: "First Class", time: "2h 16m", marketPrice: 245, bundlePrice: 179, points: 108 },
  { id: "m2a", traveler: "Marcus", route: "Paris → Zürich", operator: "TGV Lyria", class: "Standard", time: "4h 03m", marketPrice: 68, bundlePrice: 52, points: 26 },
  { id: "m2b", traveler: "Marcus", route: "Paris → Zürich", operator: "TGV Lyria", class: "Flexible", time: "4h 03m", marketPrice: 98, bundlePrice: 72, points: 44 },
  { id: "m2c", traveler: "Marcus", route: "Paris → Zürich", operator: "TGV Lyria", class: "First Class", time: "4h 03m", marketPrice: 158, bundlePrice: 115, points: 68 },
  { id: "a1a", traveler: "Anika", route: "Berlin → Zürich", operator: "DB ICE", class: "Standard", time: "7h 45m", marketPrice: 79, bundlePrice: 59, points: 30 },
  { id: "a1b", traveler: "Anika", route: "Berlin → Zürich", operator: "DB ICE", class: "Flexible", time: "7h 45m", marketPrice: 112, bundlePrice: 79, points: 48 },
  { id: "a1c", traveler: "Anika", route: "Berlin → Zürich", operator: "DB-ÖBB Nightjet", class: "First Class", time: "10h 20m", marketPrice: 175, bundlePrice: 128, points: 72 },
];

export const FLIGHT_OPTIONS: FlightOption[] = [
  { id: "f1", airline: "Emirates", route: "Zürich → Dubai", time: "6h 10m", marketPrice: 410, bundlePrice: 285, airlineMiles: 285, tierBoost: 12 },
  { id: "f2", airline: "British Airways", route: "Zürich → Dubai", time: "7h 45m", marketPrice: 385, bundlePrice: 268, airlineMiles: 210, tierBoost: 8 },
  { id: "f3", airline: "Swiss", route: "Zürich → Dubai", time: "5h 55m", marketPrice: 445, bundlePrice: 310, airlineMiles: 195, tierBoost: 10 },
  { id: "f4", airline: "Lufthansa", route: "Zürich → Dubai", time: "8h 20m", marketPrice: 365, bundlePrice: 255, airlineMiles: 180, tierBoost: 7 },
];

export const HOTEL_OPTIONS: HotelOption[] = [
  { id: "h1", name: "Jumeirah Al Naseem", stars: 5, bookingPrice: 420, agodaPrice: 405, trainlineExclusivePrice: 368, hotelPoints: 120, tierBoost: 15 },
  { id: "h2", name: "Atlantis The Royal", stars: 5, bookingPrice: 520, agodaPrice: 498, trainlineExclusivePrice: 445, hotelPoints: 160, tierBoost: 18 },
  { id: "h3", name: "Hilton Dubai Creek", stars: 4, bookingPrice: 280, agodaPrice: 265, trainlineExclusivePrice: 228, hotelPoints: 85, tierBoost: 8 },
];

export const ANCILLARY_OPTIONS: AncillaryOption[] = [
  { id: "anc1", category: "Lounge", name: "Aspire Lounge — St Pancras", marketPrice: 45, bundlePrice: 32, points: 15 },
  { id: "anc2", category: "Lounge", name: "Swiss First Lounge — Zürich", marketPrice: 55, bundlePrice: 38, points: 20, freeAtTier: "Gold", freeLabel: "Free at Gold+" },
  { id: "anc3", category: "Transfer", name: "Uber — Dubai Airport", marketPrice: 35, bundlePrice: 28, points: 8 },
  { id: "anc4", category: "Transfer", name: "Private MPV (child seats)", marketPrice: 65, bundlePrice: 42, points: 15 },
  { id: "anc5", category: "Dining", name: "Pret Meal Bundle × 2", marketPrice: 18, bundlePrice: 12, points: 6 },
  { id: "anc6", category: "Dining", name: "Restaurant Partner Voucher — Dubai", marketPrice: 40, bundlePrice: 25, points: 12 },
  { id: "anc7", category: "Extras", name: "Extra Luggage (4 bags)", marketPrice: 40, bundlePrice: 15, points: 5 },
  { id: "anc8", category: "Extras", name: "Fast Track — Dubai Immigration", marketPrice: 24, bundlePrice: 12, points: 8 },
  { id: "anc9", category: "Extras", name: "Children Rail Fares (×3)", marketPrice: 180, bundlePrice: 95, points: 30 },
];

// ─── Rail Groupings ─────────────────────────────────

export interface RailGroup {
  key: string;
  label: string;
  options: RailOption[];
}

export function getRailGroups(): RailGroup[] {
  const groups: Record<string, RailOption[]> = {};
  for (const r of RAIL_OPTIONS) {
    const key = `${r.traveler}-${r.route}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return Object.entries(groups).map(([key, options]) => ({
    key,
    label: `${options[0].traveler} — ${options[0].route}`,
    options,
  }));
}

// ─── Selections State Shape ─────────────────────────

export interface JourneySelections {
  persona: Persona;
  railSelections: Record<string, string>; // groupKey → optionId
  flightId: string;
  hotelId: string;
  ancillaryIds: string[];
  optimized: boolean;
}

// ─── Computed Results ───────────────────────────────

export interface SegmentBreakdown {
  market: number;
  bundle: number;
  savings: number;
  savingsPct: number;
  points: number;
}

export interface ComputedJourney {
  rail: SegmentBreakdown;
  flight: SegmentBreakdown & { airline: string; miles: number; tierBoost: number };
  hotel: SegmentBreakdown & { hotelPoints: number; tierBoost: number; name: string };
  ancillaries: SegmentBreakdown & { count: number; totalAvailable: number };

  totalMarket: number;
  totalBundle: number;
  totalSavings: number;
  savingsPct: number;

  trainlinePoints: number;
  airlineMiles: number;
  hotelPoints: number;
  totalLoyaltyPoints: number;

  tierPoints: number;
  tier: TierDef;
  nextTier: TierDef | null;
  tierProgress: number; // 0-100

  // For revenue model
  revenueBySegment: { rail: number; airline: number; hotel: number; ancillary: number };
}

const OPTIMIZE_FACTOR = 0.92;
const OPTIMIZE_BONUS_POINTS = 80;

export function isAncillaryFree(anc: AncillaryOption, currentTier: TierDef): boolean {
  if (!anc.freeAtTier) return false;
  const tierIndex = TIERS.findIndex(t => t.name === currentTier.name);
  const freeIndex = TIERS.findIndex(t => t.name === anc.freeAtTier);
  return tierIndex >= freeIndex;
}

export function computeJourney(selections: JourneySelections): ComputedJourney {
  const discount = selections.optimized ? OPTIMIZE_FACTOR : 1;

  // Rail
  const selectedRails = Object.values(selections.railSelections)
    .map(id => RAIL_OPTIONS.find(r => r.id === id))
    .filter(Boolean) as RailOption[];
  const railMarket = selectedRails.reduce((s, r) => s + r.marketPrice, 0);
  const railBundle = Math.round(selectedRails.reduce((s, r) => s + r.bundlePrice, 0) * discount);
  const railPoints = selectedRails.reduce((s, r) => s + r.points, 0);

  // Flight (×2 adults)
  const flight = FLIGHT_OPTIONS.find(f => f.id === selections.flightId) ?? FLIGHT_OPTIONS[0];
  const flightMarket = flight.marketPrice * 2;
  const flightBundle = Math.round(flight.bundlePrice * 2 * discount);
  const flightMiles = flight.airlineMiles;

  // Hotel
  const hotel = HOTEL_OPTIONS.find(h => h.id === selections.hotelId) ?? HOTEL_OPTIONS[0];
  const hotelMarket = hotel.bookingPrice; // public reference
  const hotelBundle = Math.round(hotel.trainlineExclusivePrice * discount);

  // Preliminary tier for free-ancillary check
  const prelimPoints = railPoints + hotel.hotelPoints + Math.round(flightMiles * 0.4) + (selections.optimized ? OPTIMIZE_BONUS_POINTS : 0);
  const prelimTier = getTier(prelimPoints);

  // Ancillaries
  const selectedAncs = selections.ancillaryIds
    .map(id => ANCILLARY_OPTIONS.find(a => a.id === id))
    .filter(Boolean) as AncillaryOption[];
  const ancMarket = selectedAncs.reduce((s, a) => s + a.marketPrice, 0);
  const ancBundle = Math.round(
    selectedAncs.reduce((s, a) => s + (isAncillaryFree(a, prelimTier) ? 0 : a.bundlePrice), 0) * discount
  );
  const ancPoints = selectedAncs.reduce((s, a) => s + a.points, 0);

  // Totals
  const totalMarket = railMarket + flightMarket + hotelMarket + ancMarket;
  const totalBundle = railBundle + flightBundle + hotelBundle + ancBundle;
  const totalSavings = totalMarket - totalBundle;
  const savingsPct = totalMarket > 0 ? Math.round((totalSavings / totalMarket) * 100) : 0;

  // Loyalty
  const trainlinePoints = railPoints + ancPoints;
  const airlineMiles = flightMiles;
  const hotelPoints = hotel.hotelPoints;
  const totalLoyaltyPoints = trainlinePoints + hotelPoints + Math.round(airlineMiles * 0.4);

  // Tier
  const tierPoints = totalLoyaltyPoints + (selections.optimized ? OPTIMIZE_BONUS_POINTS : 0);
  const tier = getTier(tierPoints);
  const nextTier = getNextTier(tierPoints);
  const tierProgress = nextTier ? Math.min(100, Math.round((tierPoints / nextTier.min) * 100)) : 100;

  return {
    rail: { market: railMarket, bundle: railBundle, savings: railMarket - railBundle, savingsPct: railMarket > 0 ? Math.round(((railMarket - railBundle) / railMarket) * 100) : 0, points: railPoints },
    flight: { market: flightMarket, bundle: flightBundle, savings: flightMarket - flightBundle, savingsPct: Math.round(((flightMarket - flightBundle) / flightMarket) * 100), points: Math.round(flightMiles * 0.4), airline: flight.airline, miles: flightMiles, tierBoost: flight.tierBoost },
    hotel: { market: hotelMarket, bundle: hotelBundle, savings: hotelMarket - hotelBundle, savingsPct: hotelMarket > 0 ? Math.round(((hotelMarket - hotelBundle) / hotelMarket) * 100) : 0, points: hotelPoints, hotelPoints, tierBoost: hotel.tierBoost, name: hotel.name },
    ancillaries: { market: ancMarket, bundle: ancBundle, savings: ancMarket - ancBundle, savingsPct: ancMarket > 0 ? Math.round(((ancMarket - ancBundle) / ancMarket) * 100) : 0, points: ancPoints, count: selectedAncs.length, totalAvailable: ANCILLARY_OPTIONS.length },

    totalMarket,
    totalBundle,
    totalSavings,
    savingsPct,

    trainlinePoints,
    airlineMiles,
    hotelPoints,
    totalLoyaltyPoints,

    tierPoints,
    tier,
    nextTier,
    tierProgress,

    revenueBySegment: {
      rail: railBundle,
      airline: flightBundle,
      hotel: hotelBundle,
      ancillary: ancBundle,
    },
  };
}

// ─── Optimizer ──────────────────────────────────────
// Simulates AI re-optimization: upgrades cheapest rail segments and maximizes tier.

export function optimizeSelections(current: JourneySelections): JourneySelections {
  const groups = getRailGroups();
  const newRail = { ...current.railSelections };

  // Upgrade each rail group to Flexible if on Standard
  for (const g of groups) {
    const currentId = newRail[g.key];
    const currentOpt = g.options.find(o => o.id === currentId);
    if (currentOpt && currentOpt.class === "Standard") {
      const flex = g.options.find(o => o.class === "Flexible");
      if (flex) newRail[g.key] = flex.id;
    }
  }

  // Add high-value ancillaries if not already selected
  const newAnc = [...current.ancillaryIds];
  for (const a of ANCILLARY_OPTIONS) {
    if (!newAnc.includes(a.id) && a.points >= 12) {
      newAnc.push(a.id);
    }
  }

  return {
    ...current,
    railSelections: newRail,
    ancillaryIds: newAnc,
    optimized: true,
  };
}
