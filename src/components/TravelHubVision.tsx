import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Train, Plane, Car, MapPin, Utensils, Coffee, Wifi, Hotel, ShoppingBag, Users, Globe, TrendingUp, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Everyday Companion",
    description: "Replace Citymapper. Daily commute routing, live delays, and smart alternatives — always in their pocket.",
    tag: "Retention"
  },
  {
    icon: Users,
    title: "Multi-Trip Planner",
    description: "Friend in Paris, spouse in Berlin — both meeting in Amsterdam. Plan converging journeys from one screen.",
    tag: "Differentiation"
  },
  {
    icon: TrendingUp,
    title: "Revenue Multiplier",
    description: "Monetise every touchpoint: food pre-orders, lounge access, baggage services, hotel bundles, and rideshare last-miles.",
    tag: "Growth"
  },
  {
    icon: Shield,
    title: "Partner Ecosystem",
    description: "Offer the platform free to tour operators and affiliates. They bring customers, you capture the full journey value.",
    tag: "Platform"
  },
];

const capabilities = [
  { icon: Train, label: "Rail" },
  { icon: Plane, label: "Flights" },
  { icon: Car, label: "Rideshare" },
  { icon: MapPin, label: "Hotels" },
  { icon: Utensils, label: "Food" },
  { icon: Coffee, label: "Café" },
  { icon: Wifi, label: "WiFi" },
  { icon: Hotel, label: "Lounges" },
  { icon: ShoppingBag, label: "Shop" },
];

const TravelHubVision = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="vision" ref={ref} className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />

      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">The Vision</span>
          <h2 className="text-4xl md:text-5xl font-bold font-display mt-3 mb-5">
            From Ticket Seller to <span className="text-gradient-teal">Travel Ecosystem</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Become the single pane of glass for every journey. Everyday usage drives loyalty; big trips drive revenue.
          </p>
        </motion.div>

        {/* Capability ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/40 hover:border-primary/40 transition-all cursor-default"
            >
              <cap.icon className="w-4 h-4 text-primary" />
              <span className="text-sm text-secondary-foreground">{cap.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="rounded-2xl bg-card-gradient border border-border/40 p-8 shadow-card hover:border-primary/30 hover:shadow-teal-glow transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Powered by Databricks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-card border border-border/40">
            <Zap className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">
              Powered by <span className="text-foreground font-semibold">Databricks</span> — Unified data, ML-driven personalisation, real-time analytics
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TravelHubVision;
