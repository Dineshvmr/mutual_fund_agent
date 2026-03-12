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
            className="relative lg:ml-auto w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/10"
          >
            {/* Decorative glow */}
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-primary/20 blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-1/3 h-1/3 rounded-full bg-accent/20 blur-[40px] pointer-events-none" />

            <div className="relative z-10 w-full h-full flex flex-col justify-between p-8">
              {/* Top stats row */}
              <div className="flex gap-3">
                <div className="flex-1 bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Portfolio Return</p>
                  <p className="text-2xl font-bold text-primary">+14.8%</p>
                  <p className="text-xs text-emerald-500 font-medium mt-1">↑ 3.2% this year</p>
                </div>
                <div className="flex-1 bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Funds Analyzed</p>
                  <p className="text-2xl font-bold text-foreground">2,400+</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Across all categories</p>
                </div>
              </div>

              {/* Chart area */}
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-foreground">SIP Growth Projection</p>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">10 Yrs</span>
                </div>
                <svg viewBox="0 0 280 90" className="w-full" fill="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(221 83% 53%)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(221 83% 53%)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[20, 45, 70].map(y => (
                    <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
                  ))}
                  {/* Area fill */}
                  <path
                    d="M0,85 C30,80 50,75 70,68 C90,60 110,52 130,44 C150,35 170,26 190,20 C210,14 230,10 250,7 L280,5 L280,90 L0,90 Z"
                    fill="url(#chartGrad)"
                  />
                  {/* Line */}
                  <path
                    d="M0,85 C30,80 50,75 70,68 C90,60 110,52 130,44 C150,35 170,26 190,20 C210,14 230,10 250,7 L280,5"
                    stroke="hsl(221 83% 53%)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* End dot */}
                  <circle cx="280" cy="5" r="4" fill="hsl(221 83% 53%)" />
                  <circle cx="280" cy="5" r="7" fill="hsl(221 83% 53%)" fillOpacity="0.2" />
                </svg>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Year 1</span><span>Year 5</span><span>Year 10</span>
                </div>
              </div>

              {/* Bottom fund chips */}
              <div className="space-y-2">
                {[
                  { name: "Large Cap", ret: "+12.4%", color: "bg-blue-500" },
                  { name: "Mid Cap", ret: "+18.7%", color: "bg-violet-500" },
                  { name: "ELSS", ret: "+15.2%", color: "bg-emerald-500" },
                ].map(fund => (
                  <div key={fund.name} className="flex items-center justify-between bg-card/80 backdrop-blur-sm border border-border rounded-xl px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${fund.color}`} />
                      <span className="text-sm font-medium text-foreground">{fund.name}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">{fund.ret}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
