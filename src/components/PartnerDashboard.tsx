/* ══════════════════════════════════════════════════════
   PARTNER DASHBOARD — Revenue impact per partner,
   derived entirely from revenueModel.
   ══════════════════════════════════════════════════════ */

import { motion } from "framer-motion";
import { Handshake, TrendingUp, BarChart3 } from "lucide-react";
import type { FleetMetrics } from "@/lib/revenueModel";
import type { ComputedJourney } from "@/lib/pricingEngine";

const fmt = (n: number) => {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(0)}k`;
  return `£${n}`;
};

interface Props {
  fleet: FleetMetrics;
  computed: ComputedJourney;
}

const PartnerDashboard = ({ fleet, computed }: Props) => {
  const conversionUplift = computed.savingsPct > 25 ? 42 : computed.savingsPct > 15 ? 28 : 18;

  return (
    <div className="rounded-2xl bg-card-gradient border border-border/30 p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Handshake className="w-4 h-4 text-accent" /> Partner Revenue Impact
      </h3>
      <p className="text-[10px] text-muted-foreground">
        Live breakdown based on your configuration — updates as you change selections
      </p>

      {/* Partner lines */}
      {fleet.partners.map(p => (
        <div key={p.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{p.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-foreground font-medium">£{p.perJourney}/trip</span>
              <span className="font-bold text-foreground">{fmt(p.monthly)}/mo</span>
              <span className="text-muted-foreground">({p.pctOfTotal}%)</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${p.pctOfTotal}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}

      {/* Conversion uplift */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/20">
        <div className="text-center">
          <TrendingUp className="w-4 h-4 text-trainline-success mx-auto mb-1" />
          <p className="text-base font-bold text-trainline-success">+{conversionUplift}%</p>
          <p className="text-[10px] text-muted-foreground">Conversion Uplift</p>
        </div>
        <div className="text-center">
          <BarChart3 className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-base font-bold text-primary">{fleet.ancillaryAttachRate}%</p>
          <p className="text-[10px] text-muted-foreground">Attach Rate</p>
        </div>
        <div className="text-center">
          <Handshake className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="text-base font-bold text-accent">{fleet.crossPartnerRevPct}%</p>
          <p className="text-[10px] text-muted-foreground">Cross-Partner</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
