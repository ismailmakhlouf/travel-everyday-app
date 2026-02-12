import { motion, AnimatePresence } from "framer-motion";
import {
  Train, Plane, ArrowRight, ArrowLeft, Users, Hotel, Luggage, Clock, Sparkles,
  Zap, BarChart3, CheckCircle2, Eye, Settings2, Award, Star, Layers, DollarSign,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useJourneyState, STEPS } from "@/hooks/useJourneyState";
import {
  RAIL_OPTIONS, FLIGHT_OPTIONS, HOTEL_OPTIONS, ANCILLARY_OPTIONS,
  isAncillaryFree,
} from "@/lib/pricingEngine";
import ExecutiveDashboard from "@/components/ExecutiveDashboard";

const stepMeta = {
  rail: { label: "Rail", icon: Train },
  flight: { label: "Flights", icon: Plane },
  hotel: { label: "Hotel", icon: Hotel },
  ancillaries: { label: "Extras", icon: Luggage },
  optimize: { label: "Optimize", icon: Zap },
  checkout: { label: "Checkout", icon: CheckCircle2 },
} as const;

const FamilySimulator = () => {
  const {
    selections, step, stepIndex, view, optimizing, adoptionRate,
    computed, preOptComputed, fleet, railGroups,
    setStep, setView, setAdoptionRate,
    selectRail, selectFlight, selectHotel, toggleAncillary,
    handleOptimize, nextStep, prevStep,
  } = useJourneyState();

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* ─── Top bar ─── */}
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

      {/* ─── Step nav ─── */}
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

      {/* ─── Live summary bar ─── */}
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
              <Star className="w-3 h-3" style={{ color: computed.tier.color }} />
              <span className="font-bold" style={{ color: computed.tier.color }}>{computed.tier.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{computed.totalLoyaltyPoints} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <div className="pt-40 container mx-auto px-4 md:px-6 max-w-4xl">
        {view === "executive" ? (
          <ExecutiveDashboard
            computed={computed}
            fleet={fleet}
            adoptionRate={adoptionRate}
            onAdoptionRateChange={setAdoptionRate}
          />
        ) : (
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Rail ── */}
            {step === "rail" && (
              <motion.div key="rail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Select <span className="text-gradient-teal">Rail</span></h1>
                  <p className="text-sm text-muted-foreground">Choose rail options for each traveler · Standard / Flexible / First Class</p>
                </div>

                {railGroups.map(group => (
                  <div key={group.key} className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Users className="w-3 h-3" /> {group.label}
                    </h3>
                    <div className="grid gap-2">
                      {group.options.map(opt => {
                        const selected = selections.railSelections[group.key] === opt.id;
                        const savings = Math.round((1 - opt.bundlePrice / opt.marketPrice) * 100);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => selectRail(group.key, opt.id)}
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

            {/* ── STEP 2: Flight ── */}
            {step === "flight" && (
              <motion.div key="flight" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Choose Your <span className="text-gradient-teal">Flight</span></h1>
                  <p className="text-sm text-muted-foreground">Zürich → Dubai · 2 adults + 3 children</p>
                </div>

                <div className="grid gap-3">
                  {FLIGHT_OPTIONS.map(opt => {
                    const selected = selections.flightId === opt.id;
                    const savings = Math.round((1 - opt.bundlePrice / opt.marketPrice) * 100);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectFlight(opt.id)}
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

            {/* ── STEP 3: Hotel ── */}
            {step === "hotel" && (
              <motion.div key="hotel" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Select <span className="text-gradient-gold">Hotel</span></h1>
                  <p className="text-sm text-muted-foreground">Dubai · 3 nights · Family Suite</p>
                  <p className="text-xs text-primary/80 font-medium">Exclusive rates negotiated via Booking.com & Agoda — only available on Trainline</p>
                </div>

                <div className="grid gap-3">
                  {HOTEL_OPTIONS.map(opt => {
                    const selected = selections.hotelId === opt.id;
                    const bestPublic = Math.min(opt.bookingPrice, opt.agodaPrice);
                    const savings = Math.round((1 - opt.trainlineExclusivePrice / bestPublic) * 100);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectHotel(opt.id)}
                        className={`w-full text-left p-5 rounded-xl border transition-all ${
                          selected
                            ? "border-accent/50 bg-accent/5 shadow-gold-glow"
                            : "border-border/30 bg-card-gradient hover:border-border/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-bold text-foreground">{opt.name}</p>
                              {selected && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold uppercase tracking-wider">Exclusive</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {Array.from({ length: opt.stars }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-accent fill-accent" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-secondary/40 border border-border/20 p-3">
                            <p className="text-[10px] text-muted-foreground mb-1">Booking.com</p>
                            <p className="text-[10px] text-muted-foreground/60 mb-0.5">Public rate</p>
                            <p className="text-sm font-bold text-muted-foreground line-through">£{opt.bookingPrice}</p>
                          </div>
                          <div className="rounded-lg bg-secondary/40 border border-border/20 p-3">
                            <p className="text-[10px] text-muted-foreground mb-1">Agoda</p>
                            <p className="text-[10px] text-muted-foreground/60 mb-0.5">Public rate</p>
                            <p className="text-sm font-bold text-muted-foreground line-through">£{opt.agodaPrice}</p>
                          </div>
                          <div className={`rounded-lg p-3 ${selected ? "bg-primary/10 border-2 border-primary/40" : "bg-primary/5 border border-primary/20"}`}>
                            <p className="text-[10px] text-primary font-bold mb-1">Trainline</p>
                            <p className="text-[10px] text-primary/60 mb-0.5">Exclusive rate</p>
                            <p className="text-lg font-bold text-foreground">£{opt.trainlineExclusivePrice}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Award className="w-3 h-3" />{opt.hotelPoints} pts · +{opt.tierBoost}% tier</span>
                          <span className="text-trainline-success font-semibold">Save {savings}% vs best public</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Ancillaries ── */}
            {step === "ancillaries" && (
              <motion.div key="anc" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Add <span className="text-gradient-teal">Extras</span></h1>
                  <p className="text-sm text-muted-foreground">Toggle ancillaries — prices update live</p>
                </div>

                {(["Lounge", "Transfer", "Dining", "Extras"] as const).map(cat => {
                  const items = ANCILLARY_OPTIONS.filter(a => a.category === cat);
                  return (
                    <div key={cat} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{cat}</h3>
                      {items.map(item => {
                        const selected = selections.ancillaryIds.includes(item.id);
                        const isFree = isAncillaryFree(item, computed.tier);
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
                                {isFree ? (
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

            {/* ── STEP 5: Optimize ── */}
            {step === "optimize" && (
              <motion.div key="opt" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-accent" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold font-display">
                    {selections.optimized ? "Journey Optimized" : "Optimize My Journey"}
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {selections.optimized
                      ? "Databricks AI has recalculated your bundle for maximum savings and tier progression."
                      : "Review your complete journey below, then let Databricks AI optimize pricing, loyalty, and tier benefits."}
                  </p>
                </div>

                {/* Full Journey Summary */}
                <div className="rounded-2xl bg-card-gradient border border-border/30 p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Your Complete Journey
                  </h3>

                  {/* Rail */}
                  {Object.values(selections.railSelections).map(id => {
                    const r = RAIL_OPTIONS.find(x => x.id === id);
                    if (!r) return null;
                    const bundlePrice = selections.optimized ? Math.round(r.bundlePrice * 0.92) : r.bundlePrice;
                    return (
                      <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/10">
                        <div className="flex items-center gap-2">
                          <Train className="w-3.5 h-3.5 text-primary" />
                          <div>
                            <p className="text-sm text-foreground">{r.route}</p>
                            <p className="text-[10px] text-muted-foreground">{r.operator} · {r.class}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground line-through mr-2">£{r.marketPrice}</span>
                          <span className={`text-sm font-bold ${selections.optimized ? "text-trainline-success" : "text-foreground"}`}>
                            £{bundlePrice}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Flight */}
                  {selections.flightId && (() => {
                    const f = FLIGHT_OPTIONS.find(x => x.id === selections.flightId);
                    if (!f) return null;
                    return (
                      <div className="flex items-center justify-between py-2 border-b border-border/10">
                        <div className="flex items-center gap-2">
                          <Plane className="w-3.5 h-3.5 text-primary" />
                          <div>
                            <p className="text-sm text-foreground">{f.route}</p>
                            <p className="text-[10px] text-muted-foreground">{f.airline} · ×2 adults</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground line-through mr-2">£{f.marketPrice * 2}</span>
                          <span className={`text-sm font-bold ${selections.optimized ? "text-trainline-success" : "text-foreground"}`}>
                            £{computed.flight.bundle}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Hotel */}
                  {selections.hotelId && (() => {
                    const h = HOTEL_OPTIONS.find(x => x.id === selections.hotelId);
                    if (!h) return null;
                    return (
                      <div className="flex items-center justify-between py-2 border-b border-border/10">
                        <div className="flex items-center gap-2">
                          <Hotel className="w-3.5 h-3.5 text-accent" />
                          <div>
                            <p className="text-sm text-foreground">{h.name}</p>
                            <p className="text-[10px] text-muted-foreground">3 nights · Exclusive Trainline rate</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground line-through mr-2">£{h.bookingPrice}</span>
                          <span className={`text-sm font-bold ${selections.optimized ? "text-trainline-success" : "text-foreground"}`}>
                            £{computed.hotel.bundle}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Ancillaries */}
                  {selections.ancillaryIds.map(id => {
                    const a = ANCILLARY_OPTIONS.find(x => x.id === id);
                    if (!a) return null;
                    const isFree = isAncillaryFree(a, computed.tier);
                    return (
                      <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-foreground">{a.name}</p>
                            {isFree && <p className="text-[10px] text-trainline-success font-semibold">{a.freeLabel}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          {isFree ? (
                            <span className="text-sm font-bold text-trainline-success">FREE</span>
                          ) : (
                            <>
                              <span className="text-xs text-muted-foreground line-through mr-2">£{a.marketPrice}</span>
                              <span className={`text-sm font-bold ${selections.optimized ? "text-trainline-success" : "text-foreground"}`}>
                                £{selections.optimized ? Math.round(a.bundlePrice * 0.92) : a.bundlePrice}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Before / After */}
                {selections.optimized ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-secondary/40 border border-border/30 p-4 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Before Optimization</p>
                        <p className="text-lg font-bold text-muted-foreground line-through">£{preOptComputed.totalBundle}</p>
                        <p className="text-xs text-muted-foreground">{preOptComputed.totalLoyaltyPoints} pts</p>
                      </div>
                      <div className="rounded-xl bg-trainline-success/5 border-2 border-trainline-success/30 p-4 text-center shadow-teal-glow">
                        <p className="text-[10px] text-trainline-success uppercase tracking-wider font-bold mb-1">After Optimization</p>
                        <p className="text-lg font-bold text-foreground">£{computed.totalBundle}</p>
                        <p className="text-xs text-trainline-success font-semibold">{computed.tierPoints} pts (+{computed.tierPoints - preOptComputed.totalLoyaltyPoints} bonus)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Price Saved", value: `£${preOptComputed.totalBundle - computed.totalBundle}`, icon: DollarSign, color: "text-trainline-success" },
                        { label: "Total Savings", value: `${computed.savingsPct}%`, icon: TrendingUp, color: "text-trainline-success" },
                        { label: "Tier Progress", value: `+${computed.tierPoints - preOptComputed.totalLoyaltyPoints} pts`, icon: Award, color: "text-accent" },
                        { label: "Bonus Miles", value: `+${Math.round(computed.airlineMiles * 0.15)}`, icon: Plane, color: "text-primary" },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl bg-card-gradient border border-border/30 p-4 text-center">
                          <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                          <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-xl bg-secondary/40 border border-border/30 p-4 text-center w-full max-w-sm">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Current Package Total</p>
                      <p className="text-2xl font-bold text-foreground">£{computed.totalBundle}</p>
                      <p className="text-xs text-muted-foreground">{computed.totalLoyaltyPoints} pts · {computed.tier.name} tier</p>
                    </div>

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
                          Recalculating bundle…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2"><Zap className="w-5 h-5" /> Optimize My Journey</span>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 6: Checkout ── */}
            {step === "checkout" && (
              <motion.div key="checkout" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6 max-w-2xl mx-auto">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Unified <span className="text-gradient-teal">Checkout</span></h1>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/30 p-6 shadow-card space-y-4">
                  {[
                    { label: "Rail", market: computed.rail.market, bundle: computed.rail.bundle },
                    { label: "Flights (×2 adults)", market: computed.flight.market, bundle: computed.flight.bundle },
                    { label: "Hotel (3 nights)", market: computed.hotel.market, bundle: computed.hotel.bundle },
                    { label: "Ancillaries", market: computed.ancillaries.market, bundle: computed.ancillaries.bundle },
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
                      <p className="text-lg font-bold text-primary">{computed.trainlinePoints}</p>
                      <p className="text-[10px] text-muted-foreground">Trainline pts</p>
                    </div>
                    <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                      <p className="text-lg font-bold text-accent">{computed.airlineMiles}</p>
                      <p className="text-[10px] text-muted-foreground">{computed.flight.airline} Miles</p>
                    </div>
                    <div className="rounded-lg bg-trainline-gold/5 border border-trainline-gold/20 p-3">
                      <p className="text-lg font-bold text-trainline-gold">{computed.hotelPoints}</p>
                      <p className="text-[10px] text-muted-foreground">Hotel pts</p>
                    </div>
                  </div>

                  {/* Tier progress */}
                  <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Current Tier</span>
                      <span className="text-sm font-bold flex items-center gap-1" style={{ color: computed.tier.color }}>
                        <Star className="w-3.5 h-3.5" fill={computed.tier.color} />
                        {computed.tier.name}
                      </span>
                    </div>
                    {computed.nextTier && (
                      <>
                        <div className="h-2 rounded-full bg-background overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${computed.tierProgress}%`,
                              background: `linear-gradient(90deg, ${computed.tier.color}, ${computed.nextTier.color})`
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                          {computed.nextTier.min - computed.tierPoints} more points to <span style={{ color: computed.nextTier.color }} className="font-semibold">{computed.nextTier.name}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {selections.optimized && (
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

      {/* ─── Bottom nav ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-border/20">
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <button
            onClick={prevStep}
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
              onClick={nextStep}
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
