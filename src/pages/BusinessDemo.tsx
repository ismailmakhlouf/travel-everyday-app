import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Train, Plane, ArrowRight, ArrowLeft, Briefcase, MapPin, Users, Star, 
  Hotel, Luggage, Crown, Clock, Check, CreditCard, Sparkles, 
  Wine, Wifi, ShieldCheck, Globe, Car, Baby, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const STEPS = ["search", "results", "upgrades", "multitrip", "checkout", "confirmation"] as const;
type Step = typeof STEPS[number];

const stepLabels: Record<Step, string> = {
  search: "Search",
  results: "Journey",
  upgrades: "Upgrades",
  multitrip: "Multi-Trip",
  checkout: "Book",
  confirmation: "Done",
};

const segments = [
  { mode: "First Class", icon: Train, from: "London St Pancras", to: "Paris Gare du Nord", time: "2h 16m", price: 189, color: "primary", detail: "Eurostar" },
  { mode: "TGV First", icon: Train, from: "Paris Gare de Lyon", to: "Zürich HB", time: "4h 03m", price: 145, color: "primary", detail: "SNCF" },
  { mode: "Flight", icon: Plane, from: "Zürich ZRH", to: "Dubai DXB", time: "6h 10m", price: 520, color: "trainline-gold", detail: "Emirates" },
];

const upgrades = [
  { name: "Eurostar Lounge Access", price: 35, icon: Crown, desc: "Priority boarding, champagne & canapés at St Pancras", tag: "Popular" },
  { name: "Extra Luggage (3 bags)", price: 25, icon: Luggage, desc: "Pre-registered checked luggage across all segments", tag: "Family" },
  { name: "Airport Lounge — Zürich", price: 42, icon: Wine, desc: "Swiss First Lounge with spa showers & hot food", tag: "Premium" },
  { name: "Priority Fast Track — Dubai", price: 18, icon: ShieldCheck, desc: "Skip immigration queues on arrival", tag: "Time saver" },
  { name: "Hotel: Jumeirah Al Naseem", price: 285, icon: Hotel, desc: "5★ Sea View Suite · 3 nights · Inc. breakfast", tag: "Recommended" },
  { name: "Airport Transfer — Dubai", price: 45, icon: Car, desc: "Private car from DXB to hotel, child seat included", tag: "Convenience" },
];

// Multi-trip planner data
const friendJourney = {
  name: "James",
  from: "Paris",
  segments: [
    { mode: "TGV", from: "Paris", to: "Zürich", time: "4h 03m", price: "£98" },
  ],
};

const spouseJourney = {
  name: "Anika",
  from: "Berlin",
  segments: [
    { mode: "ICE", from: "Berlin", to: "Zürich", time: "7h 45m", price: "£112" },
  ],
};

const BusinessDemo = () => {
  const [currentStep, setCurrentStep] = useState<Step>("search");
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);
  const stepIndex = STEPS.indexOf(currentStep);

  const next = () => { if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1]); };
  const prev = () => { if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]); };

  const toggleUpgrade = (name: string) => {
    setSelectedUpgrades(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const totalJourney = segments.reduce((s, seg) => s + seg.price, 0);
  const upgradesTotal = upgrades.filter(u => selectedUpgrades.includes(u.name)).reduce((s, u) => s + u.price, 0);
  const grandTotal = totalJourney + upgradesTotal;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-surface">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Train className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Trainline <span className="text-primary">Travel Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">Marcus Chen · Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-card/80 backdrop-blur border-b border-border/30">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((step, i) => (
              <button key={step} onClick={() => i <= stepIndex && setCurrentStep(step)} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < stepIndex ? "bg-primary text-primary-foreground" :
                  i === stepIndex ? "bg-primary text-primary-foreground shadow-teal-glow" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden md:inline ${i <= stepIndex ? "text-foreground" : "text-muted-foreground"}`}>
                  {stepLabels[step]}
                </span>
                {i < STEPS.length - 1 && <div className={`w-8 h-0.5 hidden md:block ${i < stepIndex ? "bg-primary" : "bg-border"}`} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-32 pb-24 container mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className="max-w-4xl mx-auto"
          >
            {/* Search */}
            {currentStep === "search" && (
              <div className="space-y-8">
                <div className="text-center mb-10">
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">Premium Journey Demo</span>
                  <h1 className="text-3xl md:text-4xl font-bold font-display mt-2">Plan Your Family Trip, Marcus</h1>
                  <p className="text-muted-foreground mt-2">London → Dubai · Family of 3 · Multi-modal first class</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-8 shadow-card max-w-2xl mx-auto space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">From</label>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/30">
                      <MapPin className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-foreground font-medium">London St Pancras</span>
                    </div>
                  </div>
                  <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" /></div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">To</label>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/30">
                      <Globe className="w-5 h-5 text-accent shrink-0" />
                      <span className="text-foreground font-medium">Dubai, UAE</span>
                      <span className="ml-auto text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">via Zürich</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Depart</label>
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground">Fri, 18 Apr 2025</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Return</label>
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground">Sun, 27 Apr 2025</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Passengers</label>
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> 2 Adults + 1 Child
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="text-xs font-medium text-accent">Premium Routing</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Scenic first-class rail through Paris and the Swiss Alps, then direct Emirates flight to Dubai. Your friend James and wife Anika can converge in Zürich.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {currentStep === "results" && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-display">Your Premium Route</h2>
                  <p className="text-muted-foreground mt-2">London → Paris → Zürich → Dubai · First class throughout</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-8 shadow-card">
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border/50" />
                    <div className="space-y-8">
                      {segments.map((seg, i) => (
                        <div key={i} className="relative flex gap-5">
                          <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/15">
                            <seg.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-primary uppercase tracking-wider">{seg.mode}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{seg.detail}</span>
                                </div>
                                <p className="text-sm font-semibold text-foreground mt-0.5">{seg.from} → {seg.to}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-foreground">£{seg.price}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> {seg.time}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-foreground">Base: <span className="text-gradient-teal">£{totalJourney}</span></p>
                      <p className="text-xs text-muted-foreground">Per person · First class · All segments</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-accent font-medium">Family of 3: £{totalJourney * 3}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrades */}
            {currentStep === "upgrades" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-display">Elevate Your Journey</h2>
                  <p className="text-muted-foreground mt-2">Lounge access, luggage, hotels — all in one booking</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {upgrades.map((upgrade, i) => (
                    <motion.button
                      key={upgrade.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => toggleUpgrade(upgrade.name)}
                      className={`w-full text-left rounded-2xl border p-5 transition-all ${
                        selectedUpgrades.includes(upgrade.name)
                          ? "bg-primary/5 border-primary/40 shadow-teal-glow"
                          : "bg-card-gradient border-border/40 shadow-card hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedUpgrades.includes(upgrade.name) ? "bg-primary/20" : "bg-secondary"
                        }`}>
                          {selectedUpgrades.includes(upgrade.name)
                            ? <Check className="w-5 h-5 text-primary" />
                            : <upgrade.icon className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-foreground">{upgrade.name}</h4>
                            <span className="text-sm font-bold text-primary">£{upgrade.price}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{upgrade.desc}</p>
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{upgrade.tag}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {selectedUpgrades.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-trainline-success/10 border border-trainline-success/20 text-center">
                    <p className="text-sm font-semibold text-trainline-success">
                      {selectedUpgrades.length} upgrade{selectedUpgrades.length > 1 ? "s" : ""} · +£{upgradesTotal}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Multi-Trip Planner */}
            {currentStep === "multitrip" && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-display">Everyone Converges in Zürich</h2>
                  <p className="text-muted-foreground mt-2">Your friend from Paris, your wife from Berlin — all meeting you in transit</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Marcus */}
                  <div className="rounded-2xl bg-card-gradient border border-primary/30 p-6 shadow-card">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Marcus (You)</p>
                        <p className="text-xs text-muted-foreground">London</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-secondary/50 text-xs">
                        <span className="text-primary font-medium">Eurostar</span> London → Paris
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/50 text-xs">
                        <span className="text-primary font-medium">TGV</span> Paris → Zürich
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">Arrives Zürich: 18:42</div>
                  </div>

                  {/* James */}
                  <div className="rounded-2xl bg-card-gradient border border-accent/30 p-6 shadow-card">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                        <Users className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{friendJourney.name}</p>
                        <p className="text-xs text-muted-foreground">{friendJourney.from}</p>
                      </div>
                    </div>
                    {friendJourney.segments.map((seg, i) => (
                      <div key={i} className="p-2 rounded-lg bg-secondary/50 text-xs">
                        <span className="text-accent font-medium">{seg.mode}</span> {seg.from} → {seg.to}
                        <span className="float-right text-muted-foreground">{seg.price}</span>
                      </div>
                    ))}
                    <div className="mt-3 text-xs text-muted-foreground">Arrives Zürich: 17:30</div>
                  </div>

                  {/* Anika */}
                  <div className="rounded-2xl bg-card-gradient border border-trainline-success/30 p-6 shadow-card">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-trainline-success/15 flex items-center justify-center">
                        <Users className="w-4 h-4 text-trainline-success" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{spouseJourney.name}</p>
                        <p className="text-xs text-muted-foreground">{spouseJourney.from}</p>
                      </div>
                    </div>
                    {spouseJourney.segments.map((seg, i) => (
                      <div key={i} className="p-2 rounded-lg bg-secondary/50 text-xs">
                        <span className="text-trainline-success font-medium">{seg.mode}</span> {seg.from} → {seg.to}
                        <span className="float-right text-muted-foreground">{seg.price}</span>
                      </div>
                    ))}
                    <div className="mt-3 text-xs text-muted-foreground">Arrives Zürich: 19:15</div>
                  </div>
                </div>

                {/* Convergence point */}
                <div className="rounded-2xl bg-accent/5 border border-accent/20 p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-foreground">Meet in Zürich</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    All 3 travellers converge at Zürich HB between 17:30 and 19:15
                  </p>
                  <p className="text-xs text-accent mt-2 font-medium">
                    🍽 Dinner booked at Kronenhalle · 20:00 · Party of 4 (inc. child)
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Then continue together: Zürich → Dubai on Emirates the next morning
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-sm text-foreground font-medium">
                    All journeys coordinated. All tickets in one app. Real-time delay alerts for everyone.
                  </p>
                </div>
              </div>
            )}

            {/* Checkout */}
            {currentStep === "checkout" && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-display">Complete Your Premium Booking</h2>
                  <p className="text-muted-foreground mt-2">Travel, upgrades, and hotel — one checkout</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-7 shadow-card space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Journey (per person × 3)</h3>
                  {segments.map((seg, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/20">
                      <div className="flex items-center gap-3">
                        <seg.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-foreground">{seg.detail}: {seg.from} → {seg.to}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">£{seg.price * 3}</span>
                    </div>
                  ))}

                  {selectedUpgrades.length > 0 && (
                    <>
                      <h4 className="text-xs text-accent font-medium uppercase tracking-wider pt-2">Upgrades</h4>
                      {upgrades.filter(u => selectedUpgrades.includes(u.name)).map(u => (
                        <div key={u.name} className="flex items-center justify-between py-2 border-b border-border/20">
                          <span className="text-sm text-foreground">{u.name}</span>
                          <span className="text-sm font-medium text-primary">£{u.price}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-lg font-bold text-foreground">Grand Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gradient-teal">£{totalJourney * 3 + upgradesTotal}</p>
                      <p className="text-xs text-muted-foreground">Family of 3 + upgrades</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Amex Platinum ****1903</p>
                      <p className="text-xs text-muted-foreground">Earn {Math.round(grandTotal * 3)} loyalty points + 2x Amex points</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation */}
            {currentStep === "confirmation" && (
              <div className="space-y-8 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="w-20 h-20 rounded-full bg-trainline-success/15 flex items-center justify-center mx-auto"
                >
                  <Check className="w-10 h-10 text-trainline-success" />
                </motion.div>

                <div>
                  <h2 className="text-3xl font-bold font-display">Bon Voyage, Marcus! ✈️</h2>
                  <p className="text-muted-foreground mt-2">Everything booked. Everyone connected. All in one place.</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-7 shadow-card max-w-lg mx-auto text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking Ref</span>
                    <span className="text-sm font-bold text-primary font-mono">TH-2025-DXB-3159</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Journey</span>
                    <span className="text-sm font-medium text-foreground">London → Paris → Zürich → Dubai</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Travellers</span>
                    <span className="text-sm font-medium text-foreground">Marcus, Anika + child</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Co-Travellers</span>
                    <span className="text-sm font-medium text-accent">James (Paris → Zürich)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Value</span>
                    <span className="text-sm font-bold text-gradient-teal">£{totalJourney * 3 + upgradesTotal}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-accent/5 border border-accent/20 p-5 max-w-lg mx-auto">
                  <p className="text-sm text-accent font-semibold mb-1">💰 Revenue Captured</p>
                  <p className="text-xs text-muted-foreground">
                    Without Travel Hub, Trainline would capture only £{totalJourney} (one ticket). 
                    Now capturing £{totalJourney * 3 + upgradesTotal} — a <span className="text-trainline-success font-bold">{Math.round(((totalJourney * 3 + upgradesTotal) / totalJourney - 1) * 100)}% increase</span> in customer lifetime value per trip.
                  </p>
                </div>

                <p className="text-xs text-muted-foreground pt-4">
                  Powered by <span className="text-primary font-semibold">Databricks</span> unified data & AI platform
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto mt-12 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={stepIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-secondary text-foreground hover:bg-secondary/80"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {currentStep === "confirmation" ? (
            <Link to="/" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:shadow-teal-glow transition-all">
              Back to Overview <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:shadow-teal-glow transition-all">
              {currentStep === "checkout" ? "Confirm Booking" : "Continue"} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDemo;
