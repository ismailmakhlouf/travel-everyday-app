import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { GraduationCap, MapPin, Leaf, Star, Utensils, Gift, Percent, ArrowRight, ChevronRight, Clock, Train, Plane } from "lucide-react";

const persona = {
  name: "Priya Sharma",
  age: 21,
  type: "Student",
  university: "University of Manchester",
  home: "Mumbai, India",
  dietaryPref: "Vegetarian",
  frequentRestaurants: ["Dishoom", "Wagamama", "Greggs (veggie options)", "Leon"],
  monthlyTransportSpend: 142,
  tripDetails: {
    from: "Manchester Piccadilly",
    to: "Mumbai, India",
    via: "London St Pancras → Heathrow",
    segments: [
      { mode: "Train", from: "Manchester", to: "London Euston", time: "2h 07m", price: "£32" },
      { mode: "Tube", from: "Euston", to: "Heathrow T2", time: "52m", price: "£6.70" },
      { mode: "Flight", from: "London Heathrow", to: "Mumbai BOM", time: "9h 15m", price: "£387" },
    ],
  },
};

const deals = [
  {
    partner: "Dishoom",
    offer: "Veggie Breakfast Naan Wrap + Chai",
    price: "£4.99",
    originalPrice: "£8.50",
    savings: "41%",
    location: "Manchester Piccadilly Station",
    icon: Utensils,
    color: "primary",
  },
  {
    partner: "Leon",
    offer: "Plant-Based Meal Deal (pre-order for train)",
    price: "£6.49",
    originalPrice: "£9.99",
    savings: "35%",
    location: "Euston Station",
    icon: Leaf,
    color: "trainline-success",
  },
  {
    partner: "Deliveroo",
    offer: "Free delivery on next 3 veggie orders",
    price: "FREE",
    originalPrice: "£8.97",
    savings: "100%",
    location: "Anywhere in Manchester",
    icon: Gift,
    color: "accent",
  },
];

const PersonaShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState<"profile" | "journey" | "deals">("profile");

  return (
    <section id="persona" ref={ref} className="py-24 md:py-32 relative">
      <div className="container relative z-10 mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Customer Intelligence</span>
          <h2 className="text-4xl md:text-5xl font-bold font-display mt-3 mb-5">
            Know Your Traveller. <span className="text-gradient-gold">Delight Them.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Turn a low-value student commuter into a loyal, high-lifetime-value customer through personalised experiences and curated partnerships.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Tab navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-2 mb-8"
          >
            {(["profile", "journey", "deals"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-teal-glow"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab === "profile" ? "Traveller Profile" : tab === "journey" ? "Multi-Modal Trip" : "Bespoke Deals"}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === "profile" && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Profile card */}
                <div className="rounded-2xl bg-card-gradient border border-border/40 p-8 shadow-card">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-display text-foreground">{persona.name}</h3>
                      <p className="text-muted-foreground text-sm">{persona.age} · {persona.type}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                        <MapPin className="w-3 h-3" />
                        {persona.university}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border/30">
                      <span className="text-sm text-muted-foreground">Home</span>
                      <span className="text-sm font-medium text-foreground">{persona.home}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/30">
                      <span className="text-sm text-muted-foreground">Dietary Preference</span>
                      <span className="text-sm font-medium text-trainline-success flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> {persona.dietaryPref}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/30">
                      <span className="text-sm text-muted-foreground">Monthly Transport</span>
                      <span className="text-sm font-medium text-foreground">£{persona.monthlyTransportSpend}/mo</span>
                    </div>
                  </div>
                </div>

                {/* Insights card */}
                <div className="rounded-2xl bg-card-gradient border border-border/40 p-8 shadow-card">
                  <h4 className="text-sm font-medium text-accent uppercase tracking-wider mb-5">Data Insights</h4>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-secondary/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Utensils className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Favourite Restaurants</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {persona.frequentRestaurants.map((r) => (
                          <span key={r} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">Pattern Detected</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Priya orders vegetarian meals 3x/week via Deliveroo, mostly from Dishoom and Leon. She commutes to uni by tram daily and books a Manchester→London train twice a term.
                      </p>
                    </div>
                    <div className="rounded-xl bg-accent/10 border border-accent/20 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Percent className="w-4 h-4 text-accent" />
                        <span className="text-sm font-bold text-accent">Opportunity Score: 87/100</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        High engagement potential. Likely to convert on food deals and multi-modal bundling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "journey" && (
              <div className="rounded-2xl bg-card-gradient border border-border/40 p-8 shadow-card">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold font-display text-foreground">Manchester → Mumbai</h3>
                    <p className="text-sm text-muted-foreground">Holiday break · Multi-modal journey</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gradient-teal">£425.70</p>
                    <p className="text-xs text-muted-foreground">Total journey cost</p>
                  </div>
                </div>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border/50" />

                  <div className="space-y-6">
                    {persona.tripDetails.segments.map((seg, i) => (
                      <div key={i} className="relative flex gap-5">
                        <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          seg.mode === "Train" ? "bg-primary/15 text-primary" :
                          seg.mode === "Tube" ? "bg-accent/15 text-accent" :
                          "bg-trainline-gold/15 text-trainline-gold"
                        }`}>
                          {seg.mode === "Train" ? <Train className="w-5 h-5" /> :
                           seg.mode === "Flight" ? <Plane className="w-5 h-5" /> :
                           <Train className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-medium text-primary uppercase tracking-wider">{seg.mode}</span>
                              <p className="text-sm font-semibold text-foreground mt-0.5">{seg.from} → {seg.to}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">{seg.price}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                <Clock className="w-3 h-3" /> {seg.time}
                              </p>
                            </div>
                          </div>
                          {i < persona.tripDetails.segments.length - 1 && (
                            <div className="mt-3 px-3 py-2 rounded-lg bg-accent/5 border border-accent/15 flex items-center gap-2">
                              <Gift className="w-3.5 h-3.5 text-accent" />
                              <span className="text-xs text-accent font-medium">
                                {i === 0 ? "Pick up your Dishoom meal deal at the station!" : "Skip the queue — lounge access included"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">All booked through Trainline Travel Hub</p>
                    <p className="text-xs text-muted-foreground">Earn 425 loyalty points · Baggage tracked door-to-door</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            )}

            {activeTab === "deals" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-accent/5 border border-accent/20 p-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                      <Star className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-accent">AI-Curated Deals for Priya</p>
                      <p className="text-xs text-muted-foreground">Based on dietary preferences, favourite restaurants, and travel patterns</p>
                    </div>
                  </div>
                </div>

                {deals.map((deal, i) => (
                  <motion.div
                    key={deal.partner}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="rounded-2xl bg-card-gradient border border-border/40 p-6 shadow-card hover:border-primary/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          deal.color === "primary" ? "bg-primary/15 text-primary" :
                          deal.color === "accent" ? "bg-accent/15 text-accent" :
                          "bg-trainline-success/15 text-trainline-success"
                        }`}>
                          <deal.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-primary uppercase tracking-wider">{deal.partner}</span>
                          <h4 className="text-base font-semibold text-foreground mt-0.5">{deal.offer}</h4>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {deal.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{deal.price}</p>
                        <p className="text-xs text-muted-foreground line-through">{deal.originalPrice}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-trainline-success/15 text-trainline-success text-xs font-bold">
                          Save {deal.savings}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="text-center mt-8">
                  <p className="text-sm text-muted-foreground">
                    Powered by <span className="text-primary font-semibold">Databricks</span> customer intelligence — real-time personalisation at scale
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PersonaShowcase;
