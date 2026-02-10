import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Train, Bus, Coffee, Utensils, ShoppingBag, Wifi, Hotel, Luggage, Plane, ArrowRight } from "lucide-react";

interface SpendItem {
  icon: React.ElementType;
  label: string;
  trainlineSpend: number;
  competitorSpend: number;
  competitor: string;
}

const spendData: SpendItem[] = [
  { icon: Train, label: "Train Ticket", trainlineSpend: 87, competitorSpend: 0, competitor: "" },
  { icon: Bus, label: "Tube / Metro", trainlineSpend: 0, competitorSpend: 12, competitor: "TfL" },
  { icon: Coffee, label: "Coffee & Snacks", trainlineSpend: 0, competitorSpend: 8, competitor: "Pret / Costa" },
  { icon: Utensils, label: "Meals", trainlineSpend: 0, competitorSpend: 24, competitor: "Deliveroo / Just Eat" },
  { icon: Plane, label: "Flights", trainlineSpend: 0, competitorSpend: 245, competitor: "Skyscanner" },
  { icon: Luggage, label: "Luggage Storage", trainlineSpend: 0, competitorSpend: 15, competitor: "Stasher" },
  { icon: Wifi, label: "WiFi / Lounge", trainlineSpend: 0, competitorSpend: 18, competitor: "First Class Lounge" },
  { icon: Hotel, label: "Hotel / Stay", trainlineSpend: 0, competitorSpend: 142, competitor: "Booking.com" },
  { icon: ShoppingBag, label: "Travel Essentials", trainlineSpend: 0, competitorSpend: 35, competitor: "Amazon / Boots" },
];

const totalTrainline = spendData.reduce((s, d) => s + d.trainlineSpend, 0);
const totalCompetitor = spendData.reduce((s, d) => s + d.competitorSpend, 0);
const totalJourney = totalTrainline + totalCompetitor;

const SpendLeakage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problem" ref={ref} className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="container relative z-10 mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider">The Problem</span>
          <h2 className="text-4xl md:text-5xl font-bold font-display mt-3 mb-5">
            You're Only Capturing <span className="text-gradient-teal">£{totalTrainline}</span> of a <span className="text-gradient-gold">£{totalJourney}</span> Journey
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            For every trip booked, your customers spend {Math.round((totalCompetitor / totalJourney) * 100)}% of their travel budget with competitors. That's <span className="text-trainline-danger font-semibold">£{totalCompetitor}</span> in lost value per journey.
          </p>
        </motion.div>

        {/* Swimlane visualization */}
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            <div className="col-span-3">Touchpoint</div>
            <div className="col-span-3 text-center">
              <span className="text-primary">Trainline Revenue</span>
            </div>
            <div className="col-span-3 text-center">
              <span className="text-trainline-danger">Lost to Competitor</span>
            </div>
            <div className="col-span-3 text-right">Competitor</div>
          </div>

          {spendData.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
              className="grid grid-cols-12 gap-3 items-center p-4 rounded-xl bg-card-gradient border border-border/30 hover:border-border/60 transition-all group"
            >
              {/* Label */}
              <div className="col-span-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.trainlineSpend > 0 ? 'bg-primary/15 text-primary' : 'bg-trainline-danger/15 text-trainline-danger'}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>

              {/* Trainline bar */}
              <div className="col-span-3 flex items-center justify-center">
                {item.trainlineSpend > 0 ? (
                  <div className="w-full relative">
                    <div className="h-8 rounded-lg overflow-hidden bg-primary/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${(item.trainlineSpend / 250) * 100}%` } : {}}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                        className="h-full rounded-lg bg-primary/40 flex items-center justify-end pr-3"
                      >
                        <span className="text-xs font-bold text-primary">£{item.trainlineSpend}</span>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/40">—</span>
                )}
              </div>

              {/* Competitor bar */}
              <div className="col-span-3 flex items-center justify-center">
                {item.competitorSpend > 0 ? (
                  <div className="w-full relative">
                    <div className="h-8 rounded-lg overflow-hidden bg-trainline-danger/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${(item.competitorSpend / 250) * 100}%` } : {}}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                        className="h-full rounded-lg bg-trainline-danger/30 flex items-center justify-end pr-3"
                      >
                        <span className="text-xs font-bold text-trainline-danger">£{item.competitorSpend}</span>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/40">—</span>
                )}
              </div>

              {/* Competitor name */}
              <div className="col-span-3 text-right">
                <span className="text-xs text-muted-foreground">{item.competitor || "✓ You"}</span>
              </div>
            </motion.div>
          ))}

          {/* Total row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-12 gap-3 items-center p-5 rounded-xl border-2 border-accent/30 bg-accent/5 mt-4"
          >
            <div className="col-span-3">
              <span className="text-sm font-bold text-accent">Total Journey Spend</span>
            </div>
            <div className="col-span-3 text-center">
              <span className="text-lg font-bold text-primary">£{totalTrainline}</span>
              <span className="text-xs text-muted-foreground ml-2">({Math.round((totalTrainline / totalJourney) * 100)}%)</span>
            </div>
            <div className="col-span-3 text-center">
              <span className="text-lg font-bold text-trainline-danger">£{totalCompetitor}</span>
              <span className="text-xs text-muted-foreground ml-2">({Math.round((totalCompetitor / totalJourney) * 100)}%)</span>
            </div>
            <div className="col-span-3 text-right">
              <span className="text-sm font-bold text-accent">£{totalJourney}</span>
            </div>
          </motion.div>
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-xl font-display font-semibold text-foreground mb-2">
            What if you could capture <span className="text-gradient-gold">all of it</span>?
          </p>
          <p className="text-muted-foreground mb-8">
            Out of sight, out of mind. Become the single pane of glass for every journey.
          </p>
          <a href="#persona" className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
            See how <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default SpendLeakage;
