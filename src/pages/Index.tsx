import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SpendLeakage from "@/components/SpendLeakage";
import PersonaShowcase from "@/components/PersonaShowcase";
import TravelHubVision from "@/components/TravelHubVision";
import { Train, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SpendLeakage />
      <PersonaShowcase />
      <TravelHubVision />

      {/* Footer CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Train className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Ready to Own the Journey?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Let's build the Travel Hub that turns Trainline from a ticket seller into the definitive travel platform.
          </p>
          <a
            href="#"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:shadow-teal-glow hover:scale-105"
          >
            Start the Conversation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-xs text-muted-foreground mt-8">
            A Databricks vision demo · Powered by unified data & AI
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
