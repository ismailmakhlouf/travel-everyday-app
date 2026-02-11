import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Train, Plane, ArrowRight, Users, MapPin,
  Hotel, Luggage, Clock, Sparkles,
  Globe, Car, Crown, Wine, ShieldCheck, TrendingUp,
  Coffee, Utensils, Wifi, Search, Zap, BarChart3,
  CheckCircle2, ArrowUpRight, Shield
} from "lucide-react";
import { Link } from "react-router-dom";

/* ──────────────────── DATA ──────────────────── */

const leakageItems = [
  { icon: Train, label: "Rail Ticket", amount: 87, owner: "Trainline", captured: true },
  { icon: Plane, label: "Flight", amount: 245, owner: "Skyscanner", captured: false },
  { icon: Hotel, label: "Hotel", amount: 142, owner: "Booking.com", captured: false },
  { icon: Crown, label: "Lounge Access", amount: 45, owner: "Aspire Lounges", captured: false },
  { icon: Car, label: "Airport Transfer", amount: 35, owner: "Uber", captured: false },
  { icon: Utensils, label: "Station Dining", amount: 24, owner: "Deliveroo", captured: false },
  { icon: Coffee, label: "Coffee & Snacks", amount: 8, owner: "Pret A Manger", captured: false },
];

const scanMessages = [
  { text: "Detecting family members…", icon: Users, delay: 0 },
  { text: "Marcus Chen — Family Journeyman Tier", icon: Shield, delay: 800 },
  { text: "Spouse detected: Anika Chen (Berlin)", icon: MapPin, delay: 1600 },
  { text: "3 children: Liam (8), Sophie (5), Ava (2)", icon: Users, delay: 2400 },
  { text: "Convergence opportunity: Zürich HB", icon: Globe, delay: 3200 },
  { text: "Checking airline partnerships…", icon: Plane, delay: 4000 },
  { text: "Emirates partnership rate available", icon: CheckCircle2, delay: 4800 },
  { text: "Loyalty tier benefits applied", icon: Sparkles, delay: 5600 },
];

const marcusLegs = [
  { id: "m1", mode: "Eurostar", icon: Train, from: "London St Pancras", to: "Paris Gare du Nord", time: "2h 16m", price: 89, market: 129, detail: "Standard Premier" },
  { id: "m2", mode: "TGV Lyria", icon: Train, from: "Paris Gare de Lyon", to: "Zürich HB", time: "4h 03m", price: 72, market: 98, detail: "1st Class" },
];

const anikaLegs = [
  { id: "a1", mode: "ICE", icon: Train, from: "Berlin Hbf", to: "Zürich HB", time: "7h 45m", price: 79, market: 112, detail: "Deutsche Bahn" },
];

const sharedLegs = [
  { id: "s1", mode: "Flight", icon: Plane, from: "Zürich ZRH", to: "Dubai DXB", time: "6h 10m", price: 285, market: 410, detail: "Emirates · 2 adults" },
];

const packageItems = [
  { id: "p1", name: "Eurostar Lounge — London", price: 0, market: 45, icon: Crown, free: true, tag: "Loyalty Benefit" },
  { id: "p2", name: "Extra Luggage (4 bags)", price: 15, market: 40, icon: Luggage, free: false, tag: "Bundle Rate" },
  { id: "p3", name: "Swiss First Lounge — Zürich", price: 0, market: 55, icon: Wine, free: true, tag: "Family 3+ Benefit" },
  { id: "p4", name: "Fast Track — Dubai Immigration", price: 12, market: 24, icon: ShieldCheck, free: false, tag: "Partner Rate" },
  { id: "p5", name: "Jumeirah Al Naseem · Family Suite · 3 nights", price: 195, market: 310, icon: Hotel, free: false, tag: "Kids Stay Free" },
  { id: "p6", name: "Private Airport Transfer — Dubai", price: 35, market: 65, icon: Car, free: false, tag: "MPV · 2 child seats" },
  { id: "p7", name: "Children Fares (Liam + Sophie + Ava)", price: 180, market: 320, icon: Users, free: false, tag: "Family Discount" },
];

const MARKET_TOTAL = 1948;
const PACKAGE_TOTAL = 1247;
const SAVINGS = MARKET_TOTAL - PACKAGE_TOTAL;

const loyaltyPrograms = [
  { country: "🇬🇧", name: "UK", pts: 64, program: "Trainline Rewards" },
  { country: "🇫🇷", name: "France", pts: 22, program: "SNCF Connect" },
  { country: "🇩🇪", name: "Germany", pts: 24, program: "BahnBonus" },
  { country: "🇦🇪", name: "UAE", pts: 285, program: "Skywards" },
];
const TOTAL_POINTS = loyaltyPrograms.reduce((s, p) => s + p.pts, 0);

/* ──────────────────── ANIMATED COUNTER ──────────────────── */

function useCounter(target: number, duration: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    let start = 0;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(start);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration, active]);
  return val;
}

/* ──────────────────── COMPONENT ──────────────────── */

const ACTS = [1, 2, 3, 4, 5, 6] as const;
type Act = typeof ACTS[number];

const actTitles: Record<Act, string> = {
  1: "Revenue Leakage",
  2: "Intelligence",
  3: "Assembly",
  4: "Package",
  5: "Loyalty",
  6: "Executive View",
};

const BusinessDemo = () => {
  const [act, setAct] = useState<Act>(1);
  const [autoPlay, setAutoPlay] = useState(false);

  // Act 1 — progressive leakage reveal
  const [leakageRevealed, setLeakageRevealed] = useState(0);
  const [showLeakageQuestion, setShowLeakageQuestion] = useState(false);
  const capturedAmount = useCounter(87, 800, act === 1 && leakageRevealed > 0);
  const leakedAmount = useCounter(499, 1200, act === 1 && leakageRevealed >= leakageItems.length);

  useEffect(() => {
    if (act !== 1) return;
    setLeakageRevealed(0);
    setShowLeakageQuestion(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    leakageItems.forEach((_, i) => {
      timers.push(setTimeout(() => setLeakageRevealed(i + 1), 400 + i * 350));
    });
    timers.push(setTimeout(() => setShowLeakageQuestion(true), 400 + leakageItems.length * 350 + 800));
    return () => timers.forEach(clearTimeout);
  }, [act]);

  // Act 2 — scan messages
  const [scanRevealed, setScanRevealed] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const savingsCounter = useCounter(SAVINGS, 2000, scanComplete);

  useEffect(() => {
    if (act !== 2) return;
    setScanRevealed(0);
    setScanComplete(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    scanMessages.forEach((msg, i) => {
      timers.push(setTimeout(() => setScanRevealed(i + 1), msg.delay + 600));
    });
    timers.push(setTimeout(() => setScanComplete(true), 7000));
    return () => timers.forEach(clearTimeout);
  }, [act]);

  // Act 3 — itinerary assembly
  const [assemblyPhase, setAssemblyPhase] = useState(0); // 0=none, 1=marcus, 2=anika, 3=converge, 4=shared, 5+=items
  const [itemsRevealed, setItemsRevealed] = useState(0);
  const runningTotal = useCounter(
    assemblyPhase >= 5 ? PACKAGE_TOTAL : 0,
    2000,
    assemblyPhase >= 5
  );

  useEffect(() => {
    if (act !== 3) return;
    setAssemblyPhase(0);
    setItemsRevealed(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setAssemblyPhase(1), 400));
    timers.push(setTimeout(() => setAssemblyPhase(2), 1400));
    timers.push(setTimeout(() => setAssemblyPhase(3), 2600));
    timers.push(setTimeout(() => setAssemblyPhase(4), 3800));
    timers.push(setTimeout(() => setAssemblyPhase(5), 4800));
    packageItems.forEach((_, i) => {
      timers.push(setTimeout(() => setItemsRevealed(i + 1), 5200 + i * 500));
    });
    return () => timers.forEach(clearTimeout);
  }, [act]);

  // Act 4 — price moment
  const marketCounter = useCounter(MARKET_TOTAL, 1500, act === 4);
  const [priceCollapsed, setPriceCollapsed] = useState(false);
  const packageCounter = useCounter(PACKAGE_TOTAL, 1200, priceCollapsed);
  const savingsPct = useCounter(Math.round((SAVINGS / MARKET_TOTAL) * 100), 1000, priceCollapsed);

  useEffect(() => {
    if (act !== 4) return;
    setPriceCollapsed(false);
    const t = setTimeout(() => setPriceCollapsed(true), 2200);
    return () => clearTimeout(t);
  }, [act]);

  // Act 5 — loyalty flywheel
  const [loyaltyPhase, setLoyaltyPhase] = useState(0);
  const pointsCounter = useCounter(TOTAL_POINTS, 1200, act === 5 && loyaltyPhase >= 1);

  useEffect(() => {
    if (act !== 5) return;
    setLoyaltyPhase(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setLoyaltyPhase(1), 600));
    timers.push(setTimeout(() => setLoyaltyPhase(2), 2000));
    timers.push(setTimeout(() => setLoyaltyPhase(3), 3500));
    timers.push(setTimeout(() => setLoyaltyPhase(4), 5000));
    return () => timers.forEach(clearTimeout);
  }, [act]);

  // Act 6 — dashboard
  const oldCapture = useCounter(87, 800, act === 6);
  const newCapture = useCounter(PACKAGE_TOTAL, 1200, act === 6);
  const uplift = useCounter(36, 1000, act === 6);
  const crossPartner = useCounter(4, 800, act === 6);

  const goNext = useCallback(() => {
    if (act < 6) setAct((act + 1) as Act);
  }, [act]);

  const goPrev = useCallback(() => {
    if (act > 1) setAct((act - 1) as Act);
  }, [act]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-surface">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Train className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">
              Travel Hub <span className="text-primary text-sm font-normal ml-1">Executive Demo</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            {ACTS.map((a) => (
              <button
                key={a}
                onClick={() => setAct(a)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  a === act
                    ? "bg-primary text-primary-foreground shadow-teal-glow"
                    : a < act
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Act label bar */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-card/60 backdrop-blur border-b border-border/20">
        <div className="container mx-auto px-6 h-10 flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Act {act} — <span className="text-foreground font-medium">{actTitles[act]}</span>
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Marcus Chen · Family Journey</span>
          </div>
        </div>
      </div>

      {/* Main stage */}
      <div className="pt-28 pb-32 min-h-screen flex items-start justify-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <AnimatePresence mode="wait">
            {/* ═══════════ ACT 1 — REVENUE LEAKAGE ═══════════ */}
            {act === 1 && (
              <motion.div
                key="act1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-medium text-accent uppercase tracking-widest"
                  >
                    The Problem
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-5xl font-bold font-display"
                  >
                    Marcus books <span className="text-gradient-teal">London → Zürich</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground text-lg"
                  >
                    Total journey value: <span className="text-accent font-bold">£586</span>
                  </motion.p>
                </div>

                {/* Leakage items */}
                <div className="space-y-2.5 max-w-2xl mx-auto">
                  {leakageItems.map((item, i) => (
                    <AnimatePresence key={item.label}>
                      {i < leakageRevealed && (
                        <motion.div
                          initial={{ opacity: 0, x: -40, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: "auto" }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className={`flex items-center justify-between p-4 rounded-xl border ${
                            item.captured
                              ? "bg-primary/5 border-primary/30"
                              : "bg-destructive/5 border-destructive/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              item.captured ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                            }`}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.owner}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${item.captured ? "text-primary" : "text-destructive"}`}>
                              £{item.amount}
                            </p>
                            <p className={`text-[10px] uppercase tracking-wider font-semibold ${
                              item.captured ? "text-primary" : "text-destructive"
                            }`}>
                              {item.captured ? "✓ Captured" : "✗ Lost"}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>

                {/* Summary counters */}
                {leakageRevealed >= leakageItems.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 gap-4 max-w-md mx-auto"
                  >
                    <div className="rounded-xl bg-primary/10 border border-primary/30 p-5 text-center">
                      <p className="text-3xl font-bold text-primary">£{capturedAmount}</p>
                      <p className="text-xs text-primary/70 mt-1">Captured</p>
                    </div>
                    <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-5 text-center">
                      <p className="text-3xl font-bold text-destructive">£{leakedAmount}</p>
                      <p className="text-xs text-destructive/70 mt-1">Lost to Competitors</p>
                    </div>
                  </motion.div>
                )}

                {/* Question */}
                <AnimatePresence>
                  {showLeakageQuestion && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="text-center pt-6"
                    >
                      <p className="text-2xl md:text-3xl font-display font-bold text-foreground">
                        What if Trainline owned the <span className="text-gradient-gold">entire journey</span>?
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ═══════════ ACT 2 — INTELLIGENCE AWAKENS ═══════════ */}
            {act === 2 && (
              <motion.div
                key="act2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4"
                  >
                    <Zap className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-bold font-display">
                    Travel Hub <span className="text-gradient-teal">Activating</span>
                  </h1>
                </div>

                {/* Scan feed */}
                <div className="max-w-xl mx-auto space-y-3">
                  {scanMessages.map((msg, i) => (
                    <AnimatePresence key={i}>
                      {i < scanRevealed && (
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-card-gradient border border-border/30"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <msg.icon className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-sm text-foreground font-medium">{msg.text}</p>
                          <CheckCircle2 className="w-4 h-4 text-trainline-success ml-auto shrink-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>

                {/* Scan complete */}
                <AnimatePresence>
                  {scanComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-center space-y-4 pt-4"
                    >
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-trainline-success/10 border border-trainline-success/30">
                        <Sparkles className="w-4 h-4 text-trainline-success" />
                        <span className="text-sm font-semibold text-trainline-success">Potential savings identified</span>
                      </div>
                      <p className="text-5xl font-bold font-display text-gradient-gold">£{savingsCounter}</p>
                      <p className="text-sm text-muted-foreground">Recoverable from this single journey</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ═══════════ ACT 3 — ITINERARY ASSEMBLY ═══════════ */}
            {act === 3 && (
              <motion.div
                key="act3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold font-display">
                    Assembling <span className="text-gradient-teal">Family Itinerary</span>
                  </h1>
                  <p className="text-muted-foreground">Watch the system build your optimal journey in real time</p>
                </div>

                {/* Swim lanes */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Marcus lane */}
                  <AnimatePresence>
                    {assemblyPhase >= 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Marcus's Route</p>
                            <p className="text-xs text-muted-foreground">London → Paris → Zürich</p>
                          </div>
                        </div>
                        {marcusLegs.map((leg, i) => (
                          <motion.div
                            key={leg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.3 }}
                            className="rounded-xl bg-card-gradient border border-border/40 p-4 shadow-card"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <leg.icon className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium text-primary uppercase">{leg.mode}</span>
                              </div>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{leg.time}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{leg.from} → {leg.to}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">£{leg.price}</span>
                                <span className="text-xs text-muted-foreground line-through">£{leg.market}</span>
                              </div>
                              <span className="text-xs font-semibold text-trainline-success">Save {Math.round((1 - leg.price / leg.market) * 100)}%</span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Anika lane */}
                  <AnimatePresence>
                    {assemblyPhase >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/10 border border-accent/30">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Anika's Route</p>
                            <p className="text-xs text-muted-foreground">Berlin → Zürich</p>
                          </div>
                        </div>
                        {anikaLegs.map((leg) => (
                          <motion.div
                            key={leg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-xl bg-card-gradient border border-border/40 p-4 shadow-card"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <leg.icon className="w-4 h-4 text-accent" />
                                <span className="text-xs font-medium text-accent uppercase">{leg.mode}</span>
                              </div>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{leg.time}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{leg.from} → {leg.to}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">£{leg.price}</span>
                                <span className="text-xs text-muted-foreground line-through">£{leg.market}</span>
                              </div>
                              <span className="text-xs font-semibold text-trainline-success">Save {Math.round((1 - leg.price / leg.market) * 100)}%</span>
                            </div>
                          </motion.div>
                        ))}
                        <div className="rounded-xl border border-dashed border-accent/30 p-4 flex items-center justify-center text-xs text-muted-foreground">
                          Arrives Zürich HB · 19:15
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Convergence */}
                <AnimatePresence>
                  {assemblyPhase >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="rounded-2xl bg-accent/5 border-2 border-accent/40 p-5 text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-2">
                        <Globe className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="text-lg font-bold font-display text-foreground">Family Convergence — Zürich</h3>
                      <p className="text-xs text-muted-foreground mt-1">Marcus 18:42 · Anika 19:15 · Unified from here</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shared flight */}
                <AnimatePresence>
                  {assemblyPhase >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="rounded-xl bg-card-gradient border border-accent/30 p-5 shadow-card"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Plane className="w-5 h-5 text-accent" />
                        <span className="text-sm font-bold text-foreground">Shared — Whole Family</span>
                      </div>
                      {sharedLegs.map((leg) => (
                        <div key={leg.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{leg.from} → {leg.to}</p>
                            <p className="text-xs text-muted-foreground">{leg.detail} · {leg.time} + 3 children</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-foreground">£{leg.price}/adult</span>
                            <span className="text-xs text-muted-foreground line-through ml-2">£{leg.market}</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Package items — one by one */}
                <AnimatePresence>
                  {assemblyPhase >= 5 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      {packageItems.map((item, i) => (
                        <AnimatePresence key={item.id}>
                          {i < itemsRevealed && (
                            <motion.div
                              initial={{ opacity: 0, x: -30, height: 0 }}
                              animate={{ opacity: 1, x: 0, height: "auto" }}
                              transition={{ duration: 0.35 }}
                              className="flex items-center justify-between p-3.5 rounded-xl bg-card-gradient border border-border/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                  <item.icon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.tag}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-4">
                                {item.free ? (
                                  <div>
                                    <span className="text-sm font-bold text-trainline-success">FREE</span>
                                    <p className="text-xs text-muted-foreground line-through">£{item.market}</p>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-sm font-bold text-foreground">£{item.price}</span>
                                    <span className="text-xs text-muted-foreground line-through ml-2">£{item.market}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Running total */}
                {assemblyPhase >= 5 && itemsRevealed >= packageItems.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center pt-2"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Running Total</p>
                    <p className="text-4xl font-bold font-display text-gradient-teal">£{runningTotal}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ═══════════ ACT 4 — UNIFIED PRICE MOMENT ═══════════ */}
            {act === 4 && (
              <motion.div
                key="act4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center min-h-[60vh] space-y-10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Market Total — Booked Separately</p>
                  <p className={`text-6xl md:text-8xl font-bold font-display transition-all duration-700 ${
                    priceCollapsed ? "text-muted-foreground/30 line-through scale-90" : "text-foreground"
                  }`}>
                    £{marketCounter}
                  </p>
                </motion.div>

                <AnimatePresence>
                  {priceCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                      className="text-center space-y-4"
                    >
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Family Package Price</span>
                      </div>
                      <p className="text-7xl md:text-9xl font-bold font-display text-gradient-teal">
                        £{packageCounter}
                      </p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="space-y-2"
                      >
                        <p className="text-2xl font-bold text-trainline-success">
                          {savingsPct}% saved
                        </p>
                        <p className="text-muted-foreground">
                          £{SAVINGS} back in the family's pocket
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ═══════════ ACT 5 — LOYALTY FLYWHEEL ═══════════ */}
            {act === 5 && (
              <motion.div
                key="act5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8 max-w-2xl mx-auto"
              >
                {/* Phase 1: Points earned */}
                <AnimatePresence>
                  {loyaltyPhase >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-3"
                    >
                      <p className="text-xs text-accent uppercase tracking-widest">Loyalty Flywheel</p>
                      <p className="text-5xl md:text-6xl font-bold font-display text-gradient-gold">{pointsCounter} pts</p>
                      <p className="text-muted-foreground">earned from this single journey</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Phase 2: Converting to airlines */}
                <AnimatePresence>
                  {loyaltyPhase >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-center text-sm text-muted-foreground">Converting to airline partners…</p>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="rounded-xl p-5 text-center border"
                          style={{
                            background: "linear-gradient(135deg, hsl(220 30% 12%), hsl(220 40% 18%))",
                            borderColor: "hsl(220 60% 40% / 0.4)"
                          }}
                        >
                          <p className="text-lg font-bold text-foreground">British Airways</p>
                          <p className="text-3xl font-bold mt-2" style={{ color: "hsl(220 80% 55%)" }}>316</p>
                          <p className="text-xs text-muted-foreground mt-1">Avios earned</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-2">1 pt = 0.8 Avios</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="rounded-xl p-5 text-center border"
                          style={{
                            background: "linear-gradient(135deg, hsl(25 30% 12%), hsl(25 40% 16%))",
                            borderColor: "hsl(25 60% 40% / 0.4)"
                          }}
                        >
                          <p className="text-lg font-bold text-foreground">Air India</p>
                          <p className="text-3xl font-bold mt-2" style={{ color: "hsl(25 80% 55%)" }}>475</p>
                          <p className="text-xs text-muted-foreground mt-1">Flying Returns Miles</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-2">1 pt = 1.2 Miles</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Phase 3: Unlock */}
                <AnimatePresence>
                  {loyaltyPhase >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring" }}
                      className="rounded-2xl bg-trainline-success/5 border-2 border-trainline-success/30 p-6 text-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-trainline-success mx-auto mb-2" />
                      <p className="text-lg font-bold text-foreground">Reward Unlocked</p>
                      <p className="text-sm text-trainline-success font-semibold mt-1">BA Lounge Pass — Return Journey</p>
                      <p className="text-xs text-muted-foreground mt-2">Your Avios balance now qualifies for complimentary lounge access on your return trip</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Phase 4: Next journey suggestion */}
                <AnimatePresence>
                  {loyaltyPhase >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-card-gradient border border-accent/30 p-5 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Suggested Next Journey</p>
                        <p className="text-xs text-muted-foreground">Dubai → London — fully covered by points</p>
                        <p className="text-xs text-accent mt-1 font-semibold">Ecosystem gravity: they'll never leave.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ═══════════ ACT 6 — EXECUTIVE DASHBOARD ═══════════ */}
            {act === 6 && (
              <motion.div
                key="act6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <p className="text-xs text-accent uppercase tracking-widest">Executive View</p>
                  <h1 className="text-3xl md:text-4xl font-bold font-display">
                    Revenue <span className="text-gradient-teal">Transformation</span>
                  </h1>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Without */}
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border-2 border-destructive/30 p-7 space-y-5"
                    style={{ background: "linear-gradient(135deg, hsl(0 15% 10%), hsl(0 10% 8%))" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <p className="text-sm font-bold text-destructive uppercase tracking-wider">Without Travel Hub</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue Captured</p>
                        <p className="text-4xl font-bold text-destructive">£{oldCapture}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue Leaked</p>
                        <p className="text-2xl font-bold text-destructive/70">£499</p>
                      </div>
                      <div className="h-3 rounded-full bg-destructive/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "15%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full bg-destructive/50"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Capturing only 15% of journey value</p>
                    </div>
                  </motion.div>

                  {/* With */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border-2 border-primary/40 p-7 space-y-5 shadow-teal-glow"
                    style={{ background: "linear-gradient(135deg, hsl(175 20% 10%), hsl(175 15% 8%))" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <p className="text-sm font-bold text-primary uppercase tracking-wider">With Travel Hub</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue Captured</p>
                        <p className="text-4xl font-bold text-gradient-teal">£{newCapture}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Ancillary Uplift</p>
                          <p className="text-2xl font-bold text-trainline-success">+{uplift}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cross-Partner Rev</p>
                          <p className="text-2xl font-bold text-accent">+{crossPartner}×</p>
                        </div>
                      </div>
                      <div className="h-3 rounded-full bg-primary/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.5, delay: 0.7 }}
                          className="h-full rounded-full bg-primary/60"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Full journey value captured</p>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom line */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="text-center pt-6 space-y-2"
                >
                  <p className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    From <span className="text-destructive">£87</span> to <span className="text-gradient-teal">£{PACKAGE_TOTAL}</span>
                  </p>
                  <p className="text-lg text-accent font-semibold">
                    {Math.round((PACKAGE_TOTAL / 87 - 1) * 100)}% increase in customer value
                  </p>
                  <p className="text-sm text-muted-foreground pt-2">Per journey. Per family. At scale.</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-border/20">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={act === 1}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-20 bg-secondary/80 text-foreground hover:bg-secondary"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {ACTS.map((a) => (
                <div
                  key={a}
                  className={`w-2 h-2 rounded-full transition-all ${
                    a === act ? "bg-primary w-6" : a < act ? "bg-primary/40" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
          {act === 6 ? (
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:shadow-teal-glow transition-all"
            >
              Back to Overview <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:shadow-teal-glow transition-all"
            >
              Next Act <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDemo;
