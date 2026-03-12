import { Link } from "wouter";
import { ArrowRight, BrainCircuit, Target, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-12rem)]">
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20 shadow-sm">
              <BrainCircuit className="w-4 h-4" />
              <span>AI-Powered Wealth Management</span>
            </motion.div>
            
            <motion.h1 variants={item} className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-foreground leading-[1.1] mb-6">
              Invest smarter with <span className="text-gradient">data-driven</span> clarity.
            </motion.h1>
            
            <motion.p variants={item} className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Answer a few questions about your financial goals and let our AI agent analyze thousands of mutual funds to build your perfect, personalized portfolio.
            </motion.p>
            
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/analysis" 
                className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-[0_0_40px_-10px_rgba(29,78,216,0.6)] hover:shadow-[0_0_60px_-10px_rgba(29,78,216,0.8)] hover:-translate-y-1 transition-all duration-300"
              >
                Start Free Analysis <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div variants={item} className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="flex flex-col gap-2">
                <Target className="w-6 h-6 text-accent" />
                <span className="font-semibold text-foreground">Goal Based</span>
                <span className="text-sm text-muted-foreground">Tailored to your life events</span>
              </div>
              <div className="flex flex-col gap-2">
                <ShieldCheck className="w-6 h-6 text-accent" />
                <span className="font-semibold text-foreground">Unbiased</span>
                <span className="text-sm text-muted-foreground">Data-backed selection</span>
              </div>
              <div className="flex flex-col gap-2">
                <Zap className="w-6 h-6 text-accent" />
                <span className="font-semibold text-foreground">Instant</span>
                <span className="text-sm text-muted-foreground">Real-time analysis</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="relative lg:ml-auto w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay z-10" />
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-finance.png`} 
              alt="Financial Analysis Abstract" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
