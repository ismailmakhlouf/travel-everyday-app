import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Train, Plane, ArrowRight, ArrowLeft, Users, MapPin,
  Hotel, Luggage, Clock, Sparkles, Globe, Car, Crown, Wine,
  ShieldCheck, TrendingUp, Coffee, Utensils, Zap, BarChart3,
  CheckCircle2, Eye, Settings2, ChevronDown, Award, Star
} from "lucide-react";
import { Link } from "react-router-dom";

/* ══════════════════════════════════════════════════════
   DATA MODELS
   ══════════════════════════════════════════════════════ */

interface RailOption {
  id: string;
  traveler: "marcus" | "anika";
  route: string;
  operator: string;
  class: string;
  time: string;
  marketPrice: number;
  bundlePrice: number;
  points: number;
}

interface FlightOption {
  id: string;
  airline: string;
  route: string;
  time: string;
  marketPrice: number;
  bundlePrice: number;
  airlineMiles: number;
  tierBoost: number;
}

interface HotelOption {
  id: string;
  name: string;
  stars: number;
  bookingPrice: number;
  agodaPrice: number;
  trainlinePrice: number;
  hotelPoints: number;
  tierBoost: number;
}

interface Ancillary {
  id: string;
  category: string;
  name: string;
  marketPrice: number;
  bundlePrice: number;
  points: number;
  free?: boolean;
  freeLabel?: string;
}

const railOptions: RailOption[] = [
  { id: "m1a", traveler: "marcus", route: "London → Paris", operator: "Eurostar", class: "Standard", time: "2h 16m", marketPrice: 89, bundlePrice: 72, points: 36 },
  { id: "m1b", traveler: "marcus", route: "London → Paris", operator: "Eurostar", class: "Standard Premier", time: "2h 16m", marketPrice: 129, bundlePrice: 89, points: 54 },
  { id: "m1c", traveler: "marcus", route: "London → Paris", operator: "Eurostar", class: "Business Premier", time: "2h 16m", marketPrice: 245, bundlePrice: 179, points: 108 },
  { id: "m2a", traveler: "marcus", route: "Paris → Zürich", operator: "TGV Lyria", class: "2nd Class", time: "4h 03m", marketPrice: 68, bundlePrice: 52, points: 26 },
  { id: "m2b", traveler: "marcus", route: "Paris → Zürich", operator: "TGV Lyria", class: "1st Class", time: "4h 03m", marketPrice: 98, bundlePrice: 72, points: 44 },
  { id: "a1a", traveler: "anika", route: "Berlin → Zürich", operator: "DB ICE", class: "2nd Class", time: "7h 45m", marketPrice: 79, bundlePrice: 59, points: 30 },
  { id: "a1b", traveler: "anika", route: "Berlin → Zürich", operator: "DB ICE", class: "1st Class", time: "7h 45m", marketPrice: 112, bundlePrice: 79, points: 48 },
  { id: "a1c", traveler: "anika", route: "Berlin → Zürich", operator: "DB-ÖBB Nightjet", class: "Sleeper", time: "10h 20m", marketPrice: 135, bundlePrice: 95, points: 58 },
];

const flightOptions: FlightOption[] = [
  { id: "f1", airline: "Emirates", route: "Zürich → Dubai", time: "6h 10m", marketPrice: 410, bundlePrice: 285, airlineMiles: 285, tierBoost: 12 },
  { id: "f2", airline: "British Airways", route: "Zürich → Dubai", time: "7h 45m", marketPrice: 385, bundlePrice: 268, airlineMiles: 210, tierBoost: 8 },
  { id: "f3", airline: "Swiss", route: "Zürich → Dubai", time: "5h 55m", marketPrice: 445, bundlePrice: 310, airlineMiles: 195, tierBoost: 10 },
  { id: "f4", airline: "Lufthansa", route: "Zürich → Dubai", time: "8h 20m", marketPrice: 365, bundlePrice: 255, airlineMiles: 180, tierBoost: 7 },
];

const hotelOptions: HotelOption[] = [
  { id: "h1", name: "Jumeirah Al Naseem", stars: 5, bookingPrice: 420, agodaPrice: 405, trainlinePrice: 368, hotelPoints: 120, tierBoost: 15 },
  { id: "h2", name: "Atlantis The Royal", stars: 5, bookingPrice: 520, agodaPrice: 498, trainlinePrice: 445, hotelPoints: 160, tierBoost: 18 },
  { id: "h3", name: "Hilton Dubai Creek", stars: 4, bookingPrice: 280, agodaPrice: 265, trainlinePrice: 228, hotelPoints: 85, tierBoost: 8 },
];

const ancillaryOptions: Ancillary[] = [
  { id: "anc1", category: "Lounge", name: "Aspire Lounge — St Pancras", marketPrice: 45, bundlePrice: 32, points: 15 },
  { id: "anc2", category: "Lounge", name: "Swiss First Lounge — Zürich", marketPrice: 55, bundlePrice: 0, points: 20, free: true, freeLabel: "Family 3+ Tier" },
  { id: "anc3", category: "Transfer", name: "Uber — Dubai Airport", marketPrice: 35, bundlePrice: 28, points: 8 },
  { id: "anc4", category: "Transfer", name: "Private MPV (child seats)", marketPrice: 65, bundlePrice: 42, points: 15 },
  { id: "anc5", category: "Dining", name: "Pret Meal Bundle × 2", marketPrice: 18, bundlePrice: 12, points: 6 },
  { id: "anc6", category: "Dining", name: "Restaurant Partner Voucher — Dubai", marketPrice: 40, bundlePrice: 25, points: 12 },
  { id: "anc7", category: "Extras", name: "Extra Luggage (4 bags)", marketPrice: 40, bundlePrice: 15, points: 5 },
  { id: "anc8", category: "Extras", name: "Fast Track — Dubai Immigration", marketPrice: 24, bundlePrice: 12, points: 8 },
  { id: "anc9", category: "Extras", name: "Children Rail Fares (×3)", marketPrice: 180, bundlePrice: 95, points: 30 },
];

const STEPS = ["rail", "flight", "hotel", "ancillaries", "optimize", "checkout"] as const;
type Step = typeof STEPS[number];

const stepMeta: Record<Step, { label: string; icon: typeof Train }> = {
  rail: { label: "Rail", icon: Train },
  flight: { label: "Flights", icon: Plane },
  hotel: { label: "Hotel", icon: Hotel },
  ancillaries: { label: "Extras", icon: Luggage },
  optimize: { label: "Optimize", icon: Zap },
  checkout: { label: "Checkout", icon: CheckCircle2 },
};

/* ══════════════════════════════════════════════════════
   TIER
   ══════════════════════════════════════════════════════ */

const TIERS = [
  { name: "Silver", min: 0, color: "hsl(210 10% 60%)" },
  { name: "Gold", min: 500, color: "hsl(40 90% 55%)" },
  { name: "Platinum", min: 1200, color: "hsl(270 30% 65%)" },
];

function getTier(points: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

function getNextTier(points: number) {
  for (const t of TIERS) {
    if (points < t.min) return t;
  }
  return null;
}

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */

const FamilySimulator = () => {
  const [step, setStep] = useState<Step>("rail");
  const [view, setView] = useState<"customer" | "executive">("customer");
  const [optimized, setOptimized] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  // Selections
  const [selectedRail, setSelectedRail] = useState<Record<string, string>>({
    "marcus-london-paris": "m1b",
    "marcus-paris-zurich": "m2b",
    "anika-berlin-zurich": "a1b",
  });
  const [selectedFlight, setSelectedFlight] = useState("f1");
  const [selectedHotel, setSelectedHotel] = useState("h1");
  const [selectedAncillaries, setSelectedAncillaries] = useState<string[]>(["anc2", "anc7", "anc9"]);

  const stepIndex = STEPS.indexOf(step);
  const next = () => { if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]); };
  const prev = () => { if (stepIndex > 0) setStep(STEPS[stepIndex - 1]); };

  // Optimize effect
  const OPTIMIZE_DISCOUNT = optimized ? 0.92 : 1;

  // Computed prices
  const computed = useMemo(() => {
    const selRails = Object.values(selectedRail).map(id => railOptions.find(r => r.id === id)!).filter(Boolean);
    const flight = flightOptions.find(f => f.id === selectedFlight)!;
    const hotel = hotelOptions.find(h => h.id === selectedHotel)!;
    const ancs = selectedAncillaries.map(id => ancillaryOptions.find(a => a.id === id)!).filter(Boolean);

    const railMarket = selRails.reduce((s, r) => s + r.marketPrice, 0);
    const railBundle = Math.round(selRails.reduce((s, r) => s + r.bundlePrice, 0) * OPTIMIZE_DISCOUNT);
    const railPoints = selRails.reduce((s, r) => s + r.points, 0);

    const flightMarket = flight.marketPrice * 2; // 2 adults
    const flightBundle = Math.round(flight.bundlePrice * 2 * OPTIMIZE_DISCOUNT);
    const flightMiles = flight.airlineMiles;

    const hotelMarket = hotel.bookingPrice;
    const hotelBundle = Math.round(hotel.trainlinePrice * OPTIMIZE_DISCOUNT);
    const hotelPts = hotel.hotelPoints;

    const ancMarket = ancs.reduce((s, a) => s + a.marketPrice, 0);
    const ancBundle = Math.round(ancs.reduce((s, a) => s + (a.free ? 0 : a.bundlePrice), 0) * OPTIMIZE_DISCOUNT);
    const ancPoints = ancs.reduce((s, a) => s + a.points, 0);

    const totalMarket = railMarket + flightMarket + hotelMarket + ancMarket;
    const totalBundle = railBundle + flightBundle + hotelBundle + ancBundle;
    const totalPoints = railPoints + ancPoints + hotelPts + Math.round(flightMiles * 0.4);
    const totalSavings = totalMarket - totalBundle;
    const savingsPct = Math.round((totalSavings / totalMarket) * 100);

    // Partner revenue
    const trainlineRev = railBundle;
    const airlineRev = flightBundle;
    const hotelRev = hotelBundle;
    const ancRev = ancBundle;
    const totalRev = trainlineRev + airlineRev + hotelRev + ancRev;

    return {
      railMarket, railBundle, railPoints,
      flightMarket, flightBundle, flightMiles, flightTierBoost: flight.tierBoost, flightAirline: flight.airline,
      hotelMarket, hotelBundle, hotelPts, hotelTierBoost: hotel.tierBoost,
      ancMarket, ancBundle, ancPoints,
      totalMarket, totalBundle, totalPoints, totalSavings, savingsPct,
      trainlineRev, airlineRev, hotelRev, ancRev, totalRev,
      tierTotal: totalPoints + (optimized ? 80 : 0),
    };
  }, [selectedRail, selectedFlight, selectedHotel, selectedAncillaries, OPTIMIZE_DISCOUNT, optimized]);

  const tier = getTier(computed.tierTotal);
  const nextTier = getNextTier(computed.tierTotal);

  const handleOptimize = () => {
    if (optimized) return;
    setOptimizing(true);
    setTimeout(() => {
      setOptimized(true);
      setOptimizing(false);
    }, 2000);
  };

  // Group rails by route
  const marcusLondonParis = railOptions.filter(r => r.traveler === "marcus" && r.route === "London → Paris");
  const marcusParisZurich = railOptions.filter(r => r.traveler === "marcus" && r.route === "Paris → Zürich");
  const anikaBerlinZurich = railOptions.filter(r => r.traveler === "anika" && r.route === "Berlin → Zürich");

  const toggleAncillary = (id: string) => {
    setSelectedAncillaries(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  /* ────── RENDER ────── */

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-surface">
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Train className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-sm md:text-base">
              Travel Hub <span className="text-primary text-xs font-normal ml-1">Simulator</span>
            </span>
          </Link>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-0.5">
            <button
              onClick={() => setView("customer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === "customer" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Customer</span>
            </button>
            <button
              onClick={() => setView("executive")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === "executive" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span className="hidden sm:inline">Executive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step nav */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-card/70 backdrop-blur border-b border-border/20">
        <div className="container mx-auto px-4 md:px-6 py-2">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((s, i) => {
              const Icon = stepMeta[s].icon;
              return (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                    i === stepIndex ? "text-primary" : i < stepIndex ? "text-primary/50" : "text-muted-foreground/40"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i === stepIndex ? "bg-primary text-primary-foreground shadow-teal-glow" :
                    i < stepIndex ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                    {i < stepIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:block">{stepMeta[s].label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live summary bar */}
      <div className="fixed top-[6.5rem] left-0 right-0 z-30 bg-background/90 backdrop-blur border-b border-border/10">
        <div className="container mx-auto px-4 md:px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Package: </span>
              <span className="font-bold text-gradient-teal">£{computed.totalBundle}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-muted-foreground">Saving: </span>
              <span className="font-bold text-trainline-success">{computed.savingsPct}%</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" style={{ color: tier.color }} />
              <span className="font-bold" style={{ color: tier.color }}>{tier.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{computed.totalPoints} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-40 container mx-auto px-4 md:px-6 max-w-4xl">
        {view === "executive" ? (
          /* ═══════════ EXECUTIVE VIEW ═══════════ */
          <motion.div
            key="exec"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <p className="text-xs text-accent uppercase tracking-widest">Executive Dashboard — Live</p>
              <h1 className="text-2xl md:text-3xl font-bold font-display">
                Revenue <span className="text-gradient-teal">Impact</span>
              </h1>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Without */}
              <div className="rounded-2xl border-2 border-destructive/30 p-6 space-y-4" style={{ background: "linear-gradient(135deg, hsl(0 15% 10%), hsl(0 10% 8%))" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                  <p className="text-xs font-bold text-destructive uppercase tracking-wider">Without Travel Hub</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue Captured</p>
                  <p className="text-3xl font-bold text-destructive">£87</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue Leaked</p>
                  <p className="text-xl font-bold text-destructive/60">£{computed.totalMarket - 87}</p>
                </div>
                <div className="h-2.5 rounded-full bg-destructive/10 overflow-hidden">
                  <div className="h-full rounded-full bg-destructive/50" style={{ width: `${Math.round(87 / computed.totalMarket * 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Only {Math.round(87 / computed.totalMarket * 100)}% captured</p>
              </div>

              {/* With */}
              <div className="rounded-2xl border-2 border-primary/40 p-6 space-y-4 shadow-teal-glow" style={{ background: "linear-gradient(135deg, hsl(175 20% 10%), hsl(175 15% 8%))" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">With Travel Hub</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue Captured</p>
                  <p className="text-3xl font-bold text-gradient-teal">£{computed.totalBundle}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Ancillary Attach</p>
                    <p className="text-lg font-bold text-trainline-success">{Math.round(selectedAncillaries.length / ancillaryOptions.length * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Margin Uplift</p>
                    <p className="text-lg font-bold text-accent">+{computed.savingsPct}%</p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-primary/10 overflow-hidden">
                  <div className="h-full rounded-full bg-primary/60" style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            {/* Partner revenue */}
            <div className="rounded-2xl bg-card-gradient border border-border/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Partner Revenue Distribution</h3>
              {[
                { label: "Rail (Trainline)", amount: computed.railBundle, pct: Math.round(computed.railBundle / computed.totalRev * 100), color: "bg-primary" },
                { label: `Airline (${computed.flightAirline})`, amount: computed.flightBundle, pct: Math.round(computed.airlineRev / computed.totalRev * 100), color: "bg-accent" },
                { label: "Hotel", amount: computed.hotelBundle, pct: Math.round(computed.hotelRev / computed.totalRev * 100), color: "bg-trainline-gold" },
                { label: "Ancillaries", amount: computed.ancBundle, pct: Math.round(computed.ancRev / computed.totalRev * 100), color: "bg-trainline-success" },
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-bold text-foreground">£{item.amount} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Avg Rev/Journey", value: `£${computed.totalBundle}`, change: `+${Math.round((computed.totalBundle / 87 - 1) * 100)}%` },
                { label: "Customer Tier", value: tier.name, change: nextTier ? `${nextTier.min - computed.tierTotal} to ${nextTier.name}` : "Max" },
                { label: "Loyalty Points", value: `${computed.totalPoints}`, change: `+${computed.totalPoints}` },
                { label: "Savings Delivered", value: `£${computed.totalSavings}`, change: `${computed.savingsPct}%` },
              ].map(kpi => (
                <div key={kpi.label} className="rounded-xl bg-card-gradient border border-border/30 p-4 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-lg font-bold text-foreground mt-1">{kpi.value}</p>
                  <p className="text-[10px] text-trainline-success font-semibold mt-0.5">{kpi.change}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ═══════════ CUSTOMER VIEW ═══════════ */
          <AnimatePresence mode="wait">
            {/* STEP 1: Rail */}
            {step === "rail" && (
              <motion.div key="rail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Select <span className="text-gradient-teal">Rail</span></h1>
                  <p className="text-sm text-muted-foreground">Choose rail options for each traveler</p>
                </div>

                {[
                  { label: "Marcus — London → Paris", options: marcusLondonParis, key: "marcus-london-paris", accent: "primary" },
                  { label: "Marcus — Paris → Zürich", options: marcusParisZurich, key: "marcus-paris-zurich", accent: "primary" },
                  { label: "Anika — Berlin → Zürich", options: anikaBerlinZurich, key: "anika-berlin-zurich", accent: "accent" },
                ].map(group => (
                  <div key={group.key} className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Users className="w-3 h-3" /> {group.label}
                    </h3>
                    <div className="grid gap-2">
                      {group.options.map(opt => {
                        const selected = selectedRail[group.key] === opt.id;
                        const savings = Math.round((1 - opt.bundlePrice / opt.marketPrice) * 100);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedRail(prev => ({ ...prev, [group.key]: opt.id }))}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                              selected
                                ? "border-primary/50 bg-primary/5 shadow-teal-glow"
                                : "border-border/30 bg-card-gradient hover:border-border/60"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected ? "bg-primary/20" : "bg-secondary"}`}>
                                  <Train className={`w-4 h-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{opt.operator} · {opt.class}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{opt.time} · {opt.points} pts</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground line-through">£{opt.marketPrice}</span>
                                  <span className="text-sm font-bold text-foreground">£{opt.bundlePrice}</span>
                                </div>
                                <span className="text-[10px] font-semibold text-trainline-success">Save {savings}%</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* STEP 2: Flight */}
            {step === "flight" && (
              <motion.div key="flight" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Choose Your <span className="text-gradient-teal">Flight</span></h1>
                  <p className="text-sm text-muted-foreground">Zürich → Dubai · 2 adults + 3 children</p>
                </div>

                <div className="grid gap-3">
                  {flightOptions.map(opt => {
                    const selected = selectedFlight === opt.id;
                    const savings = Math.round((1 - opt.bundlePrice / opt.marketPrice) * 100);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedFlight(opt.id)}
                        className={`w-full text-left p-5 rounded-xl border transition-all ${
                          selected
                            ? "border-primary/50 bg-primary/5 shadow-teal-glow"
                            : "border-border/30 bg-card-gradient hover:border-border/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-primary/20" : "bg-secondary"}`}>
                              <Plane className={`w-5 h-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <p className="text-base font-bold text-foreground">{opt.airline}</p>
                              <p className="text-xs text-muted-foreground">{opt.route} · {opt.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground line-through">£{opt.marketPrice * 2}</p>
                            <p className="text-lg font-bold text-foreground">£{opt.bundlePrice * 2}</p>
                            <p className="text-[10px] font-semibold text-trainline-success">Save {savings}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Award className="w-3 h-3" />{opt.airlineMiles} miles</span>
                          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{opt.tierBoost}% tier boost</span>
                          <span className="text-[10px] text-muted-foreground/60">Skyscanner ref</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Hotel */}
            {step === "hotel" && (
              <motion.div key="hotel" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Select <span className="text-gradient-gold">Hotel</span></h1>
                  <p className="text-sm text-muted-foreground">Dubai · 3 nights · Family Suite</p>
                </div>

                <div className="grid gap-3">
                  {hotelOptions.map(opt => {
                    const selected = selectedHotel === opt.id;
                    const bestCompetitor = Math.min(opt.bookingPrice, opt.agodaPrice);
                    const savings = Math.round((1 - opt.trainlinePrice / bestCompetitor) * 100);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedHotel(opt.id)}
                        className={`w-full text-left p-5 rounded-xl border transition-all ${
                          selected
                            ? "border-accent/50 bg-accent/5 shadow-gold-glow"
                            : "border-border/30 bg-card-gradient hover:border-border/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-base font-bold text-foreground">{opt.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {Array.from({ length: opt.stars }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-accent fill-accent" />
                              ))}
                            </div>
                          </div>
                          {selected && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold uppercase tracking-wider">Exclusive</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-secondary/50 p-2">
                            <p className="text-[10px] text-muted-foreground">Booking.com</p>
                            <p className="text-sm font-bold text-muted-foreground line-through">£{opt.bookingPrice}</p>
                          </div>
                          <div className="rounded-lg bg-secondary/50 p-2">
                            <p className="text-[10px] text-muted-foreground">Agoda</p>
                            <p className="text-sm font-bold text-muted-foreground line-through">£{opt.agodaPrice}</p>
                          </div>
                          <div className={`rounded-lg p-2 ${selected ? "bg-primary/10 border border-primary/30" : "bg-secondary/80"}`}>
                            <p className="text-[10px] text-primary font-semibold">Trainline</p>
                            <p className="text-sm font-bold text-foreground">£{opt.trainlinePrice}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Award className="w-3 h-3" />{opt.hotelPoints} pts · +{opt.tierBoost}% tier</span>
                          <span className="text-trainline-success font-semibold">Save {savings}% vs best</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Ancillaries */}
            {step === "ancillaries" && (
              <motion.div key="anc" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Add <span className="text-gradient-teal">Extras</span></h1>
                  <p className="text-sm text-muted-foreground">Toggle ancillaries — prices update live</p>
                </div>

                {["Lounge", "Transfer", "Dining", "Extras"].map(cat => {
                  const items = ancillaryOptions.filter(a => a.category === cat);
                  return (
                    <div key={cat} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{cat}</h3>
                      {items.map(item => {
                        const selected = selectedAncillaries.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleAncillary(item.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                              selected
                                ? "border-primary/40 bg-primary/5"
                                : "border-border/30 bg-card-gradient hover:border-border/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                                }`}>
                                  {selected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.points} pts</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {item.free ? (
                                  <div>
                                    <span className="text-sm font-bold text-trainline-success">FREE</span>
                                    <p className="text-[10px] text-accent font-medium">{item.freeLabel}</p>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-xs text-muted-foreground line-through">£{item.marketPrice}</span>
                                    <span className="text-sm font-bold text-foreground ml-2">£{item.bundlePrice}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* STEP 5: Optimize */}
            {step === "optimize" && (
              <motion.div key="opt" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-accent" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold font-display">
                    {optimized ? "Journey Optimized" : "Optimize My Journey"}
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {optimized
                      ? "Databricks AI has recalculated your bundle for maximum savings and tier progression."
                      : "Let Databricks AI find the best combination of pricing, loyalty, and tier benefits."}
                  </p>
                </div>

                {!optimized && (
                  <button
                    onClick={handleOptimize}
                    disabled={optimizing}
                    className="px-8 py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg hover:shadow-gold-glow transition-all disabled:opacity-50"
                  >
                    {optimizing ? (
                      <span className="flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Settings2 className="w-5 h-5" />
                        </motion.div>
                        Optimizing…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2"><Zap className="w-5 h-5" /> Optimize My Journey</span>
                    )}
                  </button>
                )}

                {optimized && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl"
                  >
                    {[
                      { label: "Price Reduced", value: `£${computed.totalBundle}`, icon: TrendingUp },
                      { label: "Savings", value: `${computed.savingsPct}%`, icon: Sparkles },
                      { label: "Tier Progress", value: `+80 pts`, icon: Award },
                      { label: "Bonus Miles", value: `+${Math.round(computed.flightMiles * 0.15)}`, icon: Plane },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl bg-trainline-success/5 border border-trainline-success/20 p-4 text-center">
                        <item.icon className="w-5 h-5 text-trainline-success mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{item.value}</p>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 6: Checkout */}
            {step === "checkout" && (
              <motion.div key="checkout" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6 max-w-2xl mx-auto">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Unified <span className="text-gradient-teal">Checkout</span></h1>
                </div>

                {/* Price breakdown */}
                <div className="rounded-2xl bg-card-gradient border border-border/30 p-6 shadow-card space-y-4">
                  {[
                    { label: "Rail", market: computed.railMarket, bundle: computed.railBundle },
                    { label: "Flights (×2 adults)", market: computed.flightMarket, bundle: computed.flightBundle },
                    { label: "Hotel (3 nights)", market: computed.hotelMarket, bundle: computed.hotelBundle },
                    { label: "Ancillaries", market: computed.ancMarket, bundle: computed.ancBundle },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/20">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground line-through">£{row.market}</span>
                        <span className="text-sm font-bold text-foreground">£{row.bundle}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Market Total</span>
                    <span className="text-lg text-muted-foreground line-through">£{computed.totalMarket}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Trainline Package</span>
                    <span className="text-2xl font-bold text-gradient-teal">£{computed.totalBundle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-trainline-success font-semibold">You Save</span>
                    <span className="text-lg font-bold text-trainline-success">£{computed.totalSavings} ({computed.savingsPct}%)</span>
                  </div>
                </div>

                {/* Loyalty */}
                <div className="rounded-2xl bg-card-gradient border border-border/30 p-6 shadow-card space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Loyalty Earned</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <p className="text-lg font-bold text-primary">{computed.totalPoints}</p>
                      <p className="text-[10px] text-muted-foreground">Trainline pts</p>
                    </div>
                    <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                      <p className="text-lg font-bold text-accent">{computed.flightMiles}</p>
                      <p className="text-[10px] text-muted-foreground">{computed.flightAirline} Miles</p>
                    </div>
                    <div className="rounded-lg bg-trainline-gold/5 border border-trainline-gold/20 p-3">
                      <p className="text-lg font-bold text-trainline-gold">{computed.hotelPts}</p>
                      <p className="text-[10px] text-muted-foreground">Hotel pts</p>
                    </div>
                  </div>

                  {/* Tier */}
                  <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Current Tier</span>
                      <span className="text-sm font-bold flex items-center gap-1" style={{ color: tier.color }}>
                        <Star className="w-3.5 h-3.5" fill={tier.color} />
                        {tier.name}
                      </span>
                    </div>
                    {nextTier && (
                      <>
                        <div className="h-2 rounded-full bg-background overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(100, (computed.tierTotal / nextTier.min) * 100)}%`,
                              background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color})`
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                          {nextTier.min - computed.tierTotal} more points to <span style={{ color: nextTier.color }} className="font-semibold">{nextTier.name}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {optimized && (
                  <div className="rounded-xl bg-trainline-success/5 border border-trainline-success/20 p-4 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-trainline-success shrink-0" />
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">AI-optimized</span> — this bundle includes dynamic pricing, tier acceleration, and partner rate matching.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-border/20">
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={stepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-20 bg-secondary/80 text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-all ${i === stepIndex ? "bg-primary w-5" : i < stepIndex ? "bg-primary/40" : "bg-border"}`} />
            ))}
          </div>
          {stepIndex === STEPS.length - 1 ? (
            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:shadow-teal-glow transition-all"
            >
              Done <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={next}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:shadow-teal-glow transition-all"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilySimulator;
