import { motion } from "framer-motion";
import { Train } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-surface"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Train className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            Trainline <span className="text-primary">Travel Hub</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Problem", href: "#problem" },
            { label: "Customer", href: "#persona" },
            { label: "Vision", href: "#vision" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/demo/student"
            className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
          >
            Student Demo
          </Link>
          <Link
            to="/demo/business"
            className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:shadow-teal-glow transition-all"
          >
            Family Demo
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
