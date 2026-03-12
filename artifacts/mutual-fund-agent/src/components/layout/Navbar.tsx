import { Link } from "wouter";
import { TrendingUp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar({ className }: { className?: string }) {
  return (
    <header className={cn("fixed top-0 inset-x-0 z-50 glass-effect", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground block leading-none">Fin<span className="text-primary">Agent</span></span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Mutual Fund AI</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            SEBI Guidelines Compliant AI
          </div>
        </div>
      </div>
    </header>
  );
}
