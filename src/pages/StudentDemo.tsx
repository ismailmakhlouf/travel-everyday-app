import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Train, Plane, ArrowRight, ArrowLeft, GraduationCap, MapPin, Leaf, Star, 
  Utensils, Gift, Percent, Clock, Search, ChevronRight, Check, 
  CreditCard, Sparkles, ShoppingBag, Coffee, Wifi, BadgePercent, Trophy, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

const STEPS = ["search", "results", "personalize", "deals", "checkout", "confirmation"] as const;
type Step = typeof STEPS[number];

const stepLabels: Record<Step, string> = {
  search: "Search",
  results: "Journey",
  personalize: "For You",
  deals: "Deals",
  checkout: "Book",
  confirmation: "Done",
};

const segments = [
  { mode: "Train", icon: Train, from: "Manchester Piccadilly", to: "London Euston", time: "2h 07m", price: 32, color: "primary" },
  { mode: "Tube", icon: Train, from: "Euston", to: "Heathrow T2", time: "52m", price: 6.70, color: "accent" },
  { mode: "Flight", icon: Plane, from: "London Heathrow", to: "Mumbai BOM", time: "9h 15m", price: 387, color: "trainline-gold" },
];

const deals = [
  { partner: "Dishoom", offer: "Veggie Breakfast Naan Wrap + Chai", price: "£4.99", original: "£8.50", savings: "41%", location: "Manchester Piccadilly Station", icon: Utensils, tag: "Based on your favourites" },
  { partner: "Leon", offer: "Plant-Based Meal Deal (pre-order for train)", price: "£6.49", original: "£9.99", savings: "35%", location: "London Euston", icon: Leaf, tag: "Vegetarian match" },
  { partner: "Pret A Manger", offer: "Coffee & Pastry Combo", price: "£3.49", original: "£5.80", savings: "40%", location: "Heathrow Terminal 2", icon: Coffee, tag: "Popular at this station" },
  { partner: "Deliveroo", offer: "Free delivery on next 3 veggie orders", price: "FREE", original: "£8.97", savings: "100%", location: "Anywhere in Manchester", icon: Gift, tag: "Loyalty reward" },
  { partner: "WHSmith", offer: "Travel essentials bundle (neck pillow + snacks)", price: "£7.99", original: "£14.50", savings: "45%", location: "Heathrow Terminal 2", icon: ShoppingBag, tag: "Long-haul essential" },
];

const StudentDemo = () => {
  const [currentStep, setCurrentStep] = useState<Step>("search");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const stepIndex = STEPS.indexOf(currentStep);

  const next = () => {
    if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1]);
  };
  const prev = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]);
  };

  const toggleDeal = (partner: string) => {
    setSelectedDeals(prev => prev.includes(partner) ? prev.filter(p => p !== partner) : [...prev, partner]);
  };

  const totalJourney = segments.reduce((s, seg) => s + seg.price, 0);
  const dealsSavings = selectedDeals.length > 0 
    ? deals.filter(d => selectedDeals.includes(d.partner)).reduce((s, d) => {
        const orig = parseFloat(d.original.replace("£", ""));
        const price = d.price === "FREE" ? 0 : parseFloat(d.price.replace("£", ""));
        return s + (orig - price);
      }, 0) 
    : 0;

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
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">Priya Sharma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-card/80 backdrop-blur border-b border-border/30">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((step, i) => (
              <button
                key={step}
                onClick={() => i <= stepIndex && setCurrentStep(step)}
                className="flex items-center gap-2 group"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < stepIndex ? "bg-primary text-primary-foreground" :
                  i === stepIndex ? "bg-primary text-primary-foreground shadow-teal-glow" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden md:inline ${
                  i <= stepIndex ? "text-foreground" : "text-muted-foreground"
                }`}>{stepLabels[step]}</span>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 hidden md:block ${i < stepIndex ? "bg-primary" : "bg-border"}`} />
                )}
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
            {/* STEP: Search */}
            {currentStep === "search" && (
              <div className="space-y-8">
                <div className="text-center mb-10">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Student Journey Demo</span>
                  <h1 className="text-3xl md:text-4xl font-bold font-display mt-2">Where are you heading, Priya?</h1>
                  <p className="text-muted-foreground mt-2">Your AI-powered travel companion knows your preferences</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-8 shadow-card max-w-2xl mx-auto">
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-xs text-muted-foreground mb-1.5 block">From</label>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/30">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground font-medium">Manchester Piccadilly</span>
                        <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">Home station</span>
                      </div>
                    </div>
                    <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" /></div>
                    <div className="relative">
                      <label className="text-xs text-muted-foreground mb-1.5 block">To</label>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/30">
                        <Plane className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-foreground font-medium">Mumbai, India (BOM)</span>
                        <span className="ml-auto text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">Home city</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Depart</label>
                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground">
                          Sat, 22 Mar 2025
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Passengers</label>
                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground">
                          1 Adult (16-25 Railcard)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">AI Suggestion</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on your semester dates, we've found the cheapest multi-modal route via London. You'll save £47 vs flying direct from Manchester.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP: Results */}
            {currentStep === "results" && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-display">Your Optimal Route</h2>
                  <p className="text-muted-foreground mt-2">Manchester → Mumbai · 3 segments, 1 seamless booking</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-8 shadow-card">
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border/50" />
                    <div className="space-y-8">
                      {segments.map((seg, i) => (
                        <div key={i} className="relative flex gap-5">
                          <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-${seg.color}/15`}>
                            <seg.icon className={`w-5 h-5 text-${seg.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-medium text-primary uppercase tracking-wider">{seg.mode}</span>
                                <p className="text-sm font-semibold text-foreground mt-0.5">{seg.from} → {seg.to}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-foreground">£{seg.price.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                  <Clock className="w-3 h-3" /> {seg.time}
                                </p>
                              </div>
                            </div>
                            {i < segments.length - 1 && (
                              <div className="mt-3 px-3 py-2 rounded-lg bg-accent/5 border border-accent/15 flex items-center gap-2">
                                <Gift className="w-3.5 h-3.5 text-accent" />
                                <span className="text-xs text-accent font-medium">
                                  {i === 0 ? "🍽 Food deals available at this station" : "✈ Lounge access available — see deals"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div>
                      <p className="text-lg font-bold text-foreground">Total: <span className="text-gradient-teal">£{totalJourney.toFixed(2)}</span></p>
                      <p className="text-xs text-muted-foreground">All segments · Single booking · Door-to-door tracking</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-trainline-success font-semibold">£47 cheaper than direct flight</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP: Personalize */}
            {currentStep === "personalize" && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-display">We Know You, Priya</h2>
                  <p className="text-muted-foreground mt-2">Your data, your preferences — powering a journey built just for you</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-card-gradient border border-border/40 p-7 shadow-card">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-display text-foreground">Priya Sharma</h3>
                        <p className="text-sm text-muted-foreground">21 · Student · University of Manchester</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Home", value: "Mumbai, India" },
                        { label: "Rail Card", value: "16-25 Railcard" },
                        { label: "Transport Spend", value: "£142/month" },
                        { label: "Loyalty Points", value: "1,247 pts" },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between py-2 border-b border-border/20">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-medium text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-card-gradient border border-border/40 p-7 shadow-card space-y-4">
                    <h4 className="text-sm font-medium text-accent uppercase tracking-wider">Databricks Intelligence</h4>
                    
                    <div className="rounded-xl bg-secondary/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-4 h-4 text-trainline-success" />
                        <span className="text-sm font-medium text-foreground">Dietary: Vegetarian</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Detected from Deliveroo order history — 94% veggie orders over 6 months</p>
                    </div>
                    
                    <div className="rounded-xl bg-secondary/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Utensils className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Top Restaurants</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["Dishoom", "Leon", "Wagamama", "Greggs"].map(r => (
                          <span key={r} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{r}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="rounded-xl bg-accent/10 border border-accent/20 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-accent" />
                        <span className="text-sm font-bold text-accent">Opportunity Score: 87/100</span>
                      </div>
                      <p className="text-xs text-muted-foreground">High conversion potential for food deals and bundled multi-modal travel</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP: Deals */}
            {currentStep === "deals" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-display">Curated Just for You</h2>
                  <p className="text-muted-foreground mt-2">AI-selected deals based on your preferences and journey</p>
                </div>

                <div className="rounded-2xl bg-accent/5 border border-accent/20 p-5 flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-accent">Personalised by Databricks</p>
                    <p className="text-xs text-muted-foreground">Vegetarian preference · Favourite restaurants · Station locations along your route</p>
                  </div>
                </div>

                {deals.map((deal, i) => (
                  <motion.button
                    key={deal.partner}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => toggleDeal(deal.partner)}
                    className={`w-full text-left rounded-2xl border p-5 transition-all ${
                      selectedDeals.includes(deal.partner) 
                        ? "bg-primary/5 border-primary/40 shadow-teal-glow" 
                        : "bg-card-gradient border-border/40 shadow-card hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedDeals.includes(deal.partner) ? "bg-primary/20" : "bg-secondary"
                        }`}>
                          {selectedDeals.includes(deal.partner) 
                            ? <Check className="w-5 h-5 text-primary" /> 
                            : <deal.icon className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-primary uppercase tracking-wider">{deal.partner}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{deal.tag}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground">{deal.offer}</h4>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {deal.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-primary">{deal.price}</p>
                        <p className="text-xs text-muted-foreground line-through">{deal.original}</p>
                        <span className="text-xs font-bold text-trainline-success">-{deal.savings}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}

                {selectedDeals.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-trainline-success/10 border border-trainline-success/20 text-center"
                  >
                    <p className="text-sm font-semibold text-trainline-success">
                      {selectedDeals.length} deal{selectedDeals.length > 1 ? "s" : ""} selected · You save £{dealsSavings.toFixed(2)}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* STEP: Checkout */}
            {currentStep === "checkout" && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-display">One Booking. Everything.</h2>
                  <p className="text-muted-foreground mt-2">Train + Tube + Flight + Deals — all in a single checkout</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-7 shadow-card space-y-5">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Order Summary</h3>
                  
                  {segments.map((seg, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/20">
                      <div className="flex items-center gap-3">
                        <seg.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-foreground">{seg.mode}: {seg.from} → {seg.to}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">£{seg.price.toFixed(2)}</span>
                    </div>
                  ))}

                  {selectedDeals.length > 0 && (
                    <>
                      <h4 className="text-xs text-accent font-medium uppercase tracking-wider pt-2">Add-on Deals</h4>
                      {deals.filter(d => selectedDeals.includes(d.partner)).map(deal => (
                        <div key={deal.partner} className="flex items-center justify-between py-2 border-b border-border/20">
                          <span className="text-sm text-foreground">{deal.partner}: {deal.offer}</span>
                          <span className="text-sm font-medium text-primary">{deal.price}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gradient-teal">
                        £{(totalJourney + deals.filter(d => selectedDeals.includes(d.partner)).reduce((s, d) => s + (d.price === "FREE" ? 0 : parseFloat(d.price.replace("£", ""))), 0)).toFixed(2)}
                      </p>
                      {dealsSavings > 0 && (
                        <p className="text-xs text-trainline-success font-medium">You're saving £{dealsSavings.toFixed(2)} on deals</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Pay with saved card ****4821</p>
                      <p className="text-xs text-muted-foreground">Earn {Math.round(totalJourney)} loyalty points</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP: Confirmation */}
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
                  <h2 className="text-3xl font-bold font-display">You're All Set, Priya! 🎉</h2>
                  <p className="text-muted-foreground mt-2">Booking confirmed · All segments linked · Deals activated</p>
                </div>

                <div className="rounded-2xl bg-card-gradient border border-border/40 p-7 shadow-card max-w-lg mx-auto text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking Ref</span>
                    <span className="text-sm font-bold text-primary font-mono">TH-2025-MUM-7842</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Journey</span>
                    <span className="text-sm font-medium text-foreground">Manchester → Mumbai</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="text-sm font-medium text-foreground">Sat, 22 Mar 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Points Earned</span>
                    <span className="text-sm font-bold text-accent">{Math.round(totalJourney)} pts</span>
                  </div>
                  {selectedDeals.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Deals Activated</span>
                      <span className="text-sm font-bold text-trainline-success">{selectedDeals.length} deals</span>
                    </div>
                  )}
                </div>

                {/* Airline Loyalty Redemption */}
                <div className="max-w-2xl mx-auto space-y-5 text-left">
                  <div className="text-center">
                    <h3 className="text-lg font-bold font-display text-foreground flex items-center justify-center gap-2">
                      <Plane className="w-5 h-5 text-primary" />
                      Redeem Your Points with Partner Airlines
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your {Math.round(totalJourney)} new points + 1,247 existing = <span className="text-accent font-semibold">{Math.round(totalJourney) + 1247} total points</span>
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* British Airways */}
                    <div className="rounded-2xl border border-[hsl(220,50%,25%)] bg-[hsl(220,40%,12%)] p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[hsl(220,60%,20%)] flex items-center justify-center">
                          <Plane className="w-5 h-5 text-[hsl(0,70%,55%)]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">British Airways</p>
                          <p className="text-xs text-muted-foreground">Avios Programme</p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-secondary/50 px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Conversion Rate</span>
                        <span className="text-xs font-bold text-foreground">1 pt = 0.8 Avios</span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Your balance: <span className="text-foreground font-semibold">{Math.round((Math.round(totalJourney) + 1247) * 0.8)} Avios</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Next: <span className="text-foreground font-medium">Lounge Pass</span></span>
                          <span className="text-[hsl(0,70%,55%)] font-semibold">{Math.round((Math.round(totalJourney) + 1247) * 0.8)}/2,000 Avios</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-[hsl(0,70%,55%)] transition-all" style={{ width: `${Math.min(100, ((Math.round(totalJourney) + 1247) * 0.8 / 2000) * 100)}%` }} />
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Redemption Examples</p>
                        {[
                          { pts: "500 Avios", reward: "Domestic seat upgrade" },
                          { pts: "2,000 Avios", reward: "BA Lounge day pass" },
                          { pts: "4,000 Avios", reward: "Europe short-haul flight" },
                        ].map(r => (
                          <div key={r.reward} className="flex items-center justify-between text-xs py-1.5 border-b border-border/20">
                            <span className="text-foreground">{r.reward}</span>
                            <span className="text-[hsl(0,70%,55%)] font-medium">{r.pts}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Air India */}
                    <div className="rounded-2xl border border-[hsl(25,50%,25%)] bg-[hsl(25,30%,11%)] p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[hsl(25,60%,18%)] flex items-center justify-center">
                          <Plane className="w-5 h-5 text-[hsl(25,80%,55%)]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Air India</p>
                          <p className="text-xs text-muted-foreground">Flying Returns</p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-secondary/50 px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Conversion Rate</span>
                        <span className="text-xs font-bold text-foreground">1 pt = 1.2 Miles</span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Your balance: <span className="text-foreground font-semibold">{Math.round((Math.round(totalJourney) + 1247) * 1.2)} Miles</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Next: <span className="text-foreground font-medium">Mumbai Seat Upgrade</span></span>
                          <span className="text-[hsl(25,80%,55%)] font-semibold">{Math.round((Math.round(totalJourney) + 1247) * 1.2)}/2,500 Miles</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-[hsl(25,80%,55%)] transition-all" style={{ width: `${Math.min(100, ((Math.round(totalJourney) + 1247) * 1.2 / 2500) * 100)}%` }} />
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Redemption Examples</p>
                        {[
                          { pts: "1,000 Miles", reward: "Extra baggage (Mumbai route)" },
                          { pts: "2,500 Miles", reward: "Mumbai seat upgrade" },
                          { pts: "5,000 Miles", reward: "Companion voucher (domestic)" },
                        ].map(r => (
                          <div key={r.reward} className="flex items-center justify-between text-xs py-1.5 border-b border-border/20">
                            <span className="text-foreground">{r.reward}</span>
                            <span className="text-[hsl(25,80%,55%)] font-medium">{r.pts}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Earn more prompt */}
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Book 2 more trips to unlock a BA Lounge Pass</p>
                      <p className="text-xs text-muted-foreground">You're {2000 - Math.round((Math.round(totalJourney) + 1247) * 0.8)} Avios away — that's just 2 return trips to London</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-accent/5 border border-accent/20 p-5 max-w-lg mx-auto">
                  <p className="text-sm text-accent font-semibold mb-1">💡 The Trainline Difference</p>
                  <p className="text-xs text-muted-foreground">
                    Without Travel Hub, Priya would have booked 3 separate tickets, missed £{dealsSavings.toFixed(2)} in savings, and earned zero loyalty points. Now she's a connected, loyal customer.
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
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:shadow-teal-glow transition-all"
            >
              Back to Overview <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:shadow-teal-glow transition-all"
            >
              {currentStep === "checkout" ? "Confirm Booking" : "Continue"} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDemo;
