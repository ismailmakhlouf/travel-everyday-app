import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Train, Plane, ArrowRight, ArrowLeft, Users, MapPin,
  Hotel, Luggage, Clock, Check, CreditCard, Sparkles,
  Globe, Car, Baby, Crown, Wine, ShieldCheck, TrendingUp,
  Gift, UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const STEPS = ["search", "itinerary", "checkout", "confirmation"] as const;
type Step = typeof STEPS[number];

const stepLabels: Record<Step, string> = {
  search: "Search",
  itinerary: "Itinerary",
  checkout: "Book",
  confirmation: "Done",
};

// Marcus's journey (London → Zürich)
const marcusSegments = [
  { id: "m1", mode: "Eurostar", icon: Train, from: "London St Pancras", to: "Paris Gare du Nord", time: "2h 16m", price: 89, marketPrice: 129, detail: "Standard" },
  { id: "m2", mode: "TGV", icon: Train, from: "Paris Gare de Lyon", to: "Zürich HB", time: "4h 03m", price: 72, marketPrice: 98, detail: "SNCF" },
];

// Anika's journey (Berlin → Zürich)
const anikaSegments = [
  { id: "a1", mode: "ICE", icon: Train, from: "Berlin Hbf", to: "Zürich HB", time: "7h 45m", price: 79, marketPrice: 112, detail: "Deutsche Bahn" },
];

// Shared segments (Zürich → Dubai, everyone together)
const sharedSegments = [
  { id: "s1", mode: "Flight", icon: Plane, from: "Zürich ZRH", to: "Dubai DXB", time: "6h 10m", price: 285, marketPrice: 410, detail: "Emirates" },
];

// Package extras (included in one price)
const packageExtras = [
  { id: "e1", name: "Eurostar Lounge Access", price: 0, marketPrice: 45, icon: Crown, desc: "Complimentary for Family Journeyman members", free: true, forWhom: "Marcus" },
  { id: "e2", name: "Extra Luggage (4 bags)", price: 15, marketPrice: 40, icon: Luggage, desc: "Pre-registered across all rail segments", free: false, forWhom: "Family" },
  { id: "e3", name: "Airport Lounge — Zürich", price: 0, marketPrice: 55, icon: Wine, desc: "Swiss First Lounge — free for families booking 3+ segments", free: true, forWhom: "Family" },
  { id: "e4", name: "Priority Fast Track — Dubai", price: 12, marketPrice: 24, icon: ShieldCheck, desc: "Skip immigration for all family members", free: false, forWhom: "Family" },
  { id: "e5", name: "Hotel: Jumeirah Al Naseem", price: 195, marketPrice: 310, icon: Hotel, desc: "Family Suite · 3 nights · Inc. breakfast · Kids stay free", free: false, forWhom: "Family" },
  { id: "e6", name: "Airport Transfer — Dubai", price: 35, marketPrice: 65, icon: Car, desc: "Private MPV from DXB to hotel, 2 child seats included", free: false, forWhom: "Family" },
];

// Kids
const kids = [
  { name: "Liam", age: 8, discount: "50% off rail, free hotel" },
  { name: "Sophie", age: 5, discount: "Free rail, free hotel" },
  { name: "Ava", age: 2, discount: "Free all segments (infant)" },
];

// Kid surcharges
const kidSurcharges = [
  { name: "Liam (8)", amount: 112, detail: "50% rail + child flight fare" },
  { name: "Sophie (5)", amount: 68, detail: "Free rail, child flight fare" },
  { name: "Ava (2)", amount: 0, detail: "Infant — free on all segments" },
];

const BusinessDemo = () => {
  const [currentStep, setCurrentStep] = useState<Step>("search");
  const stepIndex = STEPS.indexOf(currentStep);

  const next = () => { if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1]); };
  const prev = () => { if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]); };

  const marcusTotal = marcusSegments.reduce((s, seg) => s + seg.price, 0);
  const anikaTotal = anikaSegments.reduce((s, seg) => s + seg.price, 0);
  const sharedTotal = sharedSegments.reduce((s, seg) => s + seg.price, 0);
  const extrasTotal = packageExtras.reduce((s, e) => s + e.price, 0);
  const kidsTotal = kidSurcharges.reduce((s, k) => s + k.amount, 0);

  // Adults pay for shared segments individually
  const adultFlights = sharedTotal * 2;
  const packagePrice = marcusTotal + anikaTotal + adultFlights + extrasTotal + kidsTotal;

  const marcusMarket = marcusSegments.reduce((s, seg) => s + seg.marketPrice, 0);
  const anikaMarket = anikaSegments.reduce((s, seg) => s + seg.marketPrice, 0);
  const sharedMarket = sharedSegments.reduce((s, seg) => s + seg.marketPrice, 0);
  const extrasMarket = packageExtras.reduce((s, e) => s + e.marketPrice, 0);
  const marketTotal = marcusMarket + anikaMarket + sharedMarket * 2 + extrasMarket + 250; // kids at market
  const totalSavings = marketTotal - packagePrice;

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
                <Users className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">Marcus Chen · Family</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-card/80 backdrop-blur border-b border-border/30">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between max-w-xl mx-auto">
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
                {i < STEPS.length - 1 && <div className={`w-12 h-0.5 hidden md:block ${i < stepIndex ? "bg-primary" : "bg-border"}`} />}
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
            className="max-w-5xl mx-auto"
          >
            {/* SEARCH */}
            {currentStep === "search" && (
              <div className="space-y-8">
                <div className="text-center mb-10">
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">Family Experience Demo</span>
                  <h1 className="text-3xl md:text-4xl font-bold font-display mt-2">Plan Your Family Holiday, Marcus</h1>
                  <p className="text-muted-foreground mt-2">2 adults, 3 kids, 2 origins — one seamless package</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-8 shadow-card max-w-2xl mx-auto space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Marcus departs from</label>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/30">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground font-medium">London St Pancras</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Anika departs from</label>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/30">
                        <MapPin className="w-5 h-5 text-[hsl(25,80%,55%)] shrink-0" />
                        <span className="text-foreground font-medium">Berlin Hbf</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" /></div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Destination</label>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/30">
                      <Globe className="w-5 h-5 text-accent shrink-0" />
                      <span className="text-foreground font-medium">Dubai, UAE</span>
                      <span className="ml-auto text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">via Zürich</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Depart</label>
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground">18 Apr 2025</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Return</label>
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground">27 Apr 2025</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Adults</label>
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> 2
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Children</label>
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground flex items-center gap-1">
                        <Baby className="w-3 h-3" /> 3
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="text-xs font-medium text-accent">Family Routing</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Marcus travels via Paris through the Swiss Alps; Anika takes the direct ICE from Berlin. They converge in Zürich, then fly to Dubai together with all 3 kids.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ITINERARY — Swim Lanes */}
            {currentStep === "itinerary" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold font-display">Family Itinerary</h2>
                  <p className="text-muted-foreground mt-2">All-inclusive package · One price · Massive savings</p>
                </div>

                {/* Swim lanes header */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Marcus Lane */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Marcus's Route</p>
                        <p className="text-xs text-muted-foreground">London → Zürich</p>
                      </div>
                    </div>

                    {marcusSegments.map((seg) => (
                      <div key={seg.id} className="rounded-xl bg-card-gradient border border-border/40 p-4 shadow-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <seg.icon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-primary uppercase">{seg.mode}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{seg.detail}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {seg.time}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground">{seg.from} → {seg.to}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">£{seg.price}</span>
                            <span className="text-xs text-muted-foreground line-through">£{seg.marketPrice}</span>
                          </div>
                          <span className="text-xs font-semibold text-trainline-success">Save {Math.round((1 - seg.price / seg.marketPrice) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Anika Lane */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[hsl(25,80%,55%)]/10 border border-[hsl(25,80%,55%)]/30">
                      <div className="w-8 h-8 rounded-full bg-[hsl(25,80%,55%)]/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-[hsl(25,80%,55%)]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Anika's Route</p>
                        <p className="text-xs text-muted-foreground">Berlin → Zürich</p>
                      </div>
                    </div>

                    {anikaSegments.map((seg) => (
                      <div key={seg.id} className="rounded-xl bg-card-gradient border border-border/40 p-4 shadow-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <seg.icon className="w-4 h-4 text-[hsl(25,80%,55%)]" />
                            <span className="text-xs font-medium text-[hsl(25,80%,55%)] uppercase">{seg.mode}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{seg.detail}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {seg.time}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground">{seg.from} → {seg.to}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">£{seg.price}</span>
                            <span className="text-xs text-muted-foreground line-through">£{seg.marketPrice}</span>
                          </div>
                          <span className="text-xs font-semibold text-trainline-success">Save {Math.round((1 - seg.price / seg.marketPrice) * 100)}%</span>
                        </div>
                      </div>
                    ))}

                    {/* Visual spacer to align with Marcus's 2 cards */}
                    <div className="rounded-xl border border-dashed border-border/30 p-4 flex items-center justify-center text-xs text-muted-foreground">
                      <span>Arrives Zürich HB · 19:15</span>
                    </div>
                  </div>
                </div>

                {/* Convergence */}
                <div className="relative">
                  <div className="absolute left-1/2 -top-3 w-0.5 h-3 bg-accent/40" />
                  <div className="rounded-2xl bg-accent/5 border border-accent/30 p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-2">
                      <Globe className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-base font-bold font-display text-foreground">Family Converges in Zürich</h3>
                    <p className="text-xs text-muted-foreground mt-1">Marcus arrives 18:42 · Anika arrives 19:15 · Dinner at Kronenhalle, 20:00</p>
                  </div>
                </div>

                {/* Shared flight */}
                <div className="rounded-xl bg-card-gradient border border-accent/30 p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Plane className="w-5 h-5 text-accent" />
                    <span className="text-sm font-bold text-foreground">Shared Segment — Whole Family</span>
                  </div>
                  {sharedSegments.map((seg) => (
                    <div key={seg.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{seg.from} → {seg.to}</p>
                        <p className="text-xs text-muted-foreground">{seg.detail} · {seg.time} · 2 adults + 3 children</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">£{seg.price}/adult</span>
                          <span className="text-xs text-muted-foreground line-through">£{seg.marketPrice}</span>
                        </div>
                        <span className="text-xs text-trainline-success font-semibold">Save {Math.round((1 - seg.price / seg.marketPrice) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kids add-ons */}
                <div className="rounded-xl bg-card-gradient border border-border/40 p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Baby className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-foreground">Children Add-ons</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-trainline-success/10 text-trainline-success ml-auto">Kids stay free at hotel</span>
                  </div>
                  <div className="space-y-3">
                    {kids.map((kid, i) => (
                      <div key={kid.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/30 border border-border/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {kid.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{kid.name} <span className="text-muted-foreground font-normal">({kid.age})</span></p>
                            <p className="text-xs text-muted-foreground">{kid.discount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {kidSurcharges[i].amount === 0 ? (
                            <span className="text-sm font-bold text-trainline-success">FREE</span>
                          ) : (
                            <span className="text-sm font-bold text-foreground">+£{kidSurcharges[i].amount}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Package extras */}
                <div className="rounded-xl bg-card-gradient border border-border/40 p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5 text-accent" />
                    <span className="text-sm font-bold text-foreground">Included in Package</span>
                  </div>
                  <div className="space-y-2">
                    {packageExtras.map((extra) => (
                      <div key={extra.id} className="flex items-center justify-between py-2 border-b border-border/15">
                        <div className="flex items-center gap-2.5">
                          <extra.icon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-sm text-foreground">{extra.name}</span>
                            <p className="text-xs text-muted-foreground">{extra.desc}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          {extra.free ? (
                            <div>
                              <span className="text-sm font-bold text-trainline-success">FREE</span>
                              <p className="text-xs text-muted-foreground line-through">£{extra.marketPrice}</p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-sm font-bold text-foreground">£{extra.price}</span>
                              <p className="text-xs text-muted-foreground line-through">£{extra.marketPrice}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Package total */}
                <div className="rounded-2xl bg-primary/5 border border-primary/30 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xl font-bold text-foreground">Family Package Total</p>
                      <p className="text-xs text-muted-foreground">2 adults + 3 kids · Transport + hotel + extras</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground line-through">£{marketTotal}</p>
                      <p className="text-3xl font-bold text-gradient-teal">£{packagePrice}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-trainline-success/10 border border-trainline-success/20">
                    <TrendingUp className="w-5 h-5 text-trainline-success shrink-0" />
                    <p className="text-sm font-semibold text-trainline-success">
                      You're saving £{totalSavings} ({Math.round((totalSavings / marketTotal) * 100)}%) vs booking separately
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CHECKOUT */}
            {currentStep === "checkout" && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-display">Confirm Your Family Package</h2>
                  <p className="text-muted-foreground mt-2">Everything in one booking — one price</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-7 shadow-card space-y-4 max-w-2xl mx-auto">
                  <h4 className="text-xs text-primary font-medium uppercase tracking-wider">Marcus · London → Zürich</h4>
                  {marcusSegments.map((seg) => (
                    <div key={seg.id} className="flex items-center justify-between py-1.5 border-b border-border/20">
                      <span className="text-sm text-foreground">{seg.detail}: {seg.from} → {seg.to}</span>
                      <span className="text-sm font-medium text-foreground">£{seg.price}</span>
                    </div>
                  ))}

                  <h4 className="text-xs text-[hsl(25,80%,55%)] font-medium uppercase tracking-wider pt-2">Anika · Berlin → Zürich</h4>
                  {anikaSegments.map((seg) => (
                    <div key={seg.id} className="flex items-center justify-between py-1.5 border-b border-border/20">
                      <span className="text-sm text-foreground">{seg.detail}: {seg.from} → {seg.to}</span>
                      <span className="text-sm font-medium text-foreground">£{seg.price}</span>
                    </div>
                  ))}

                  <h4 className="text-xs text-accent font-medium uppercase tracking-wider pt-2">Shared · Zürich → Dubai (×2 adults)</h4>
                  {sharedSegments.map((seg) => (
                    <div key={seg.id} className="flex items-center justify-between py-1.5 border-b border-border/20">
                      <span className="text-sm text-foreground">{seg.detail}: {seg.from} → {seg.to}</span>
                      <span className="text-sm font-medium text-foreground">£{seg.price * 2}</span>
                    </div>
                  ))}

                  <h4 className="text-xs text-primary font-medium uppercase tracking-wider pt-2">Children</h4>
                  {kidSurcharges.map((k) => (
                    <div key={k.name} className="flex items-center justify-between py-1.5 border-b border-border/20">
                      <span className="text-sm text-foreground">{k.name} — {k.detail}</span>
                      <span className={`text-sm font-medium ${k.amount === 0 ? "text-trainline-success" : "text-foreground"}`}>
                        {k.amount === 0 ? "FREE" : `£${k.amount}`}
                      </span>
                    </div>
                  ))}

                  <h4 className="text-xs text-accent font-medium uppercase tracking-wider pt-2">Package Extras</h4>
                  {packageExtras.map((e) => (
                    <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border/20">
                      <span className="text-sm text-foreground">{e.name}</span>
                      <span className={`text-sm font-medium ${e.free ? "text-trainline-success" : "text-foreground"}`}>
                        {e.free ? "FREE" : `£${e.price}`}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-lg font-bold text-foreground">Family Package Total</span>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground line-through">Market: £{marketTotal}</p>
                      <p className="text-2xl font-bold text-gradient-teal">£{packagePrice}</p>
                      <p className="text-xs text-trainline-success font-semibold">Saving £{totalSavings}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Amex Platinum ****1903</p>
                      <p className="text-xs text-muted-foreground">Earn {Math.round(packagePrice)} loyalty points + 2× Amex points</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIRMATION */}
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
                  <h2 className="text-3xl font-bold font-display">Bon Voyage, Chen Family! ✈️</h2>
                  <p className="text-muted-foreground mt-2">5 travellers · 4 countries · 1 seamless booking</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-7 shadow-card max-w-lg mx-auto text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking Ref</span>
                    <span className="text-sm font-bold text-primary font-mono">TH-2025-DXB-3159</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Marcus</span>
                    <span className="text-sm font-medium text-foreground">London → Paris → Zürich → Dubai</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Anika</span>
                    <span className="text-sm font-medium text-foreground">Berlin → Zürich → Dubai</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Children</span>
                    <span className="text-sm font-medium text-foreground">Liam (8), Sophie (5), Ava (2)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Package Value</span>
                    <span className="text-sm font-bold text-gradient-teal">£{packagePrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Saved</span>
                    <span className="text-sm font-bold text-trainline-success">£{totalSavings}</span>
                  </div>
                </div>

                {/* Loyalty across countries */}
                <div className="max-w-lg mx-auto space-y-4 text-left">
                  <h3 className="text-center text-lg font-bold font-display text-foreground flex items-center justify-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    Loyalty Points Earned Across 4 Countries
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { country: "🇬🇧 UK", pts: Math.round(marcusTotal * 0.4), program: "Trainline Rewards" },
                      { country: "🇫🇷 France", pts: Math.round(72 * 0.3), program: "SNCF Connect" },
                      { country: "🇩🇪 Germany", pts: Math.round(anikaTotal * 0.3), program: "BahnBonus" },
                      { country: "🇦🇪 UAE", pts: Math.round(sharedTotal * 2 * 0.5), program: "Skywards" },
                    ].map((item) => (
                      <div key={item.country} className="rounded-xl bg-card-gradient border border-border/40 p-4 shadow-card">
                        <p className="text-sm font-bold text-foreground">{item.country}</p>
                        <p className="text-lg font-bold text-accent">{item.pts} pts</p>
                        <p className="text-xs text-muted-foreground">{item.program}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <span className="text-foreground font-semibold">Total: {Math.round(marcusTotal * 0.4 + 72 * 0.3 + anikaTotal * 0.3 + sharedTotal * 2 * 0.5)} points</span> earned across all partner programs — redeemable for flights, upgrades, and lounge access
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-accent/5 border border-accent/20 p-5 max-w-lg mx-auto">
                  <p className="text-sm text-accent font-semibold mb-1">💰 Revenue Captured</p>
                  <p className="text-xs text-muted-foreground">
                    Without Travel Hub, Trainline captures only £{marcusTotal} (one rail ticket).
                    Now capturing £{packagePrice} — a <span className="text-trainline-success font-bold">{Math.round((packagePrice / marcusTotal - 1) * 100)}% increase</span> in customer value per trip.
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
        <div className="max-w-5xl mx-auto mt-12 flex items-center justify-between">
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
