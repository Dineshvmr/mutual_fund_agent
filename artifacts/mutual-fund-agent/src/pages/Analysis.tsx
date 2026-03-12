import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { FundCard } from "@/components/analysis/FundCard";
import { useGetRecommendations } from "@workspace/api-client-react";
import type { InvestmentProfile, RecommendationResult } from "@workspace/api-client-react";
import { 
  ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle, 
  Target, Clock, IndianRupee, Activity, ShieldAlert, BrainCircuit, RefreshCw
} from "lucide-react";
import { formatINR } from "@/lib/utils";

// --- Schema Definition ---
const formSchema = z.object({
  goal: z.string().min(1, "Please select an investment goal"),
  timeHorizon: z.enum(['short', 'medium', 'long'], { required_error: "Please select a time horizon" }),
  riskTolerance: z.enum(['low', 'moderate', 'high'], { required_error: "Please select your risk tolerance" }),
  investingNature: z.enum(['sip', 'one-time'], { required_error: "Please select investment nature" }),
  tenure: z.coerce.number().min(1).max(30),
  monthlyAmount: z.coerce.number().optional(),
  lumpSumAmount: z.coerce.number().optional(),
}).refine((data) => {
  if (data.investingNature === 'sip' && (!data.monthlyAmount || data.monthlyAmount < 500)) return false;
  if (data.investingNature === 'one-time' && (!data.lumpSumAmount || data.lumpSumAmount < 1000)) return false;
  return true;
}, {
  message: "Please enter a valid investment amount",
  path: ["monthlyAmount"], // attaching to a field to show generic error
});

type FormData = z.infer<typeof formSchema>;

const GOALS = [
  "Retirement Planning", "Child's Education", "Wealth Creation", 
  "Emergency Fund", "Tax Saving (80C)", "House Purchase", "Other"
];

export default function Analysis() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  
  const { mutate: getRecommendations, isPending } = useGetRecommendations({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
      },
      onError: (error) => {
        console.error("API Error:", error);
      }
    }
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    trigger,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      tenure: 5,
      investingNature: 'sip',
      monthlyAmount: 5000,
    }
  });

  const investingNature = watch('investingNature');

  const nextStep = async () => {
    let fieldsToValidate: any = [];
    if (step === 1) fieldsToValidate = ['goal', 'timeHorizon'];
    if (step === 2) fieldsToValidate = ['riskTolerance'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = (data: FormData) => {
    // API Expects exactly this shape
    const profile: InvestmentProfile = {
      timeHorizon: data.timeHorizon as InvestmentProfile['timeHorizon'],
      goal: data.goal,
      tenure: data.tenure,
      investingNature: data.investingNature as InvestmentProfile['investingNature'],
      riskTolerance: data.riskTolerance as InvestmentProfile['riskTolerance'],
      ...(data.investingNature === 'sip' ? { monthlyAmount: data.monthlyAmount } : { lumpSumAmount: data.lumpSumAmount })
    };
    
    getRecommendations({ data: profile });
  };

  const startOver = () => {
    reset();
    setResult(null);
    setStep(1);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // --- Render Functions ---

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="w-24 h-24 mx-auto rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center"
          >
            <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-2xl font-display font-bold text-foreground"
          >
            Analyzing Your Profile
          </motion.h2>
          <motion.div className="space-y-3 text-muted-foreground text-sm font-medium">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Assessing risk tolerance...</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>Scanning historical performance data...</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>Selecting optimal mutual funds...</motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div variants={pageVariants} initial="initial" animate="animate">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-primary" /> Your Recommendations
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg">
                  Based on your goal to achieve <strong>{watch('goal')}</strong> over <strong>{watch('tenure')} years</strong>.
                </p>
              </div>
              <button onClick={startOver} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                <RefreshCw className="w-4 h-4" /> Start Over
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
                <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary" /> AI Analysis Summary
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>
              </div>
              
              {result.projectedValue && (
                <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 md:p-8 text-white shadow-xl">
                  <h3 className="font-medium text-white/80 mb-2">Estimated Future Value</h3>
                  <div className="text-3xl md:text-4xl font-display font-bold mb-4">
                    {result.projectedValue}
                  </div>
                  <div className="text-sm text-white/90 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    Assuming expected market returns for your selected risk profile over {watch('tenure')} years.
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold font-display text-foreground mb-6">Recommended Funds</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {result.recommendations.map((fund, idx) => (
                <FundCard key={idx} fund={fund} />
              ))}
            </div>

            <div className="bg-muted/50 rounded-xl p-6 border border-border text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-orange-500" />
                <div>
                  <strong className="block text-foreground mb-1">Important Disclaimer</strong>
                  {result.disclaimer || "Mutual Fund investments are subject to market risks, read all scheme related documents carefully. The past performance of mutual funds is not necessarily indicative of future performance of the schemes. These recommendations are generated by AI based on your inputs and should not be considered as certified financial advice. Please consult a SEBI registered investment advisor before making final investment decisions."}
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // --- Wizard View ---
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-sm font-medium mb-3">
            <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>Goal & Horizon</span>
            <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>Risk Profile</span>
            <span className={step >= 3 ? "text-primary" : "text-muted-foreground"}>Investment Details</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-xl border border-border p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* STEP 1 */}
                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-foreground mb-2">What are you investing for?</h2>
                      <p className="text-muted-foreground mb-6">Select your primary financial goal.</p>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Controller
                          name="goal"
                          control={control}
                          render={({ field }) => (
                            <>
                              {GOALS.map(goal => (
                                <label 
                                  key={goal}
                                  className={`
                                    cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3
                                    ${field.value === goal ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-secondary/50'}
                                  `}
                                >
                                  <input type="radio" value={goal} onChange={field.onChange} checked={field.value === goal} className="sr-only" />
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${field.value === goal ? 'border-primary' : 'border-muted-foreground'}`}>
                                    {field.value === goal && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                  </div>
                                  <span className="font-medium text-foreground">{goal}</span>
                                </label>
                              ))}
                            </>
                          )}
                        />
                      </div>
                      {errors.goal && <p className="text-destructive text-sm mt-2">{errors.goal.message}</p>}
                    </div>

                    <div>
                      <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" /> Time Horizon
                      </h2>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <Controller
                          name="timeHorizon"
                          control={control}
                          render={({ field }) => (
                            <>
                              {[
                                { value: 'short', label: 'Short Term', desc: '< 3 Years' },
                                { value: 'medium', label: 'Medium Term', desc: '3 - 7 Years' },
                                { value: 'long', label: 'Long Term', desc: '> 7 Years' }
                              ].map(opt => (
                                <label 
                                  key={opt.value}
                                  className={`
                                    cursor-pointer p-4 rounded-xl border-2 text-center transition-all duration-200
                                    ${field.value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}
                                  `}
                                >
                                  <input type="radio" value={opt.value} onChange={field.onChange} checked={field.value === opt.value} className="sr-only" />
                                  <div className="font-bold text-foreground mb-1">{opt.label}</div>
                                  <div className="text-sm text-muted-foreground">{opt.desc}</div>
                                </label>
                              ))}
                            </>
                          )}
                        />
                      </div>
                      {errors.timeHorizon && <p className="text-destructive text-sm mt-2">{errors.timeHorizon.message}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                      <Activity className="w-6 h-6 text-primary" /> What is your risk tolerance?
                    </h2>
                    <p className="text-muted-foreground mb-6">Higher risk usually means higher potential returns, but greater short-term volatility.</p>
                    
                    <div className="space-y-4">
                      <Controller
                        name="riskTolerance"
                        control={control}
                        render={({ field }) => (
                          <>
                            {[
                              { value: 'low', label: 'Low Risk', desc: 'I prioritize protecting my capital over high returns. I cannot tolerate big drops in portfolio value.', color: 'text-emerald-500' },
                              { value: 'moderate', label: 'Moderate Risk', desc: 'I want a balance of growth and safety. I can handle minor market fluctuations.', color: 'text-blue-500' },
                              { value: 'high', label: 'High Risk', desc: 'I want maximum growth and am comfortable with significant short-term losses for long-term gains.', color: 'text-orange-500' }
                            ].map(opt => (
                              <label 
                                key={opt.value}
                                className={`
                                  cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 block
                                  ${field.value === opt.value ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/30'}
                                `}
                              >
                                <input type="radio" value={opt.value} onChange={field.onChange} checked={field.value === opt.value} className="sr-only" />
                                <div className="flex items-center justify-between mb-2">
                                  <div className={`font-bold text-lg ${field.value === opt.value ? 'text-primary' : 'text-foreground'}`}>
                                    {opt.label}
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${field.value === opt.value ? 'border-primary' : 'border-muted-foreground'}`}>
                                    {field.value === opt.value && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground leading-relaxed">{opt.desc}</div>
                              </label>
                            ))}
                          </>
                        )}
                      />
                    </div>
                    {errors.riskTolerance && <p className="text-destructive text-sm mt-2">{errors.riskTolerance.message}</p>}
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-display font-bold text-foreground mb-2">Investment Details</h2>
                    <p className="text-muted-foreground mb-6">How do you plan to invest?</p>

                    <div>
                      <div className="flex bg-secondary p-1 rounded-xl w-full max-w-sm mb-6">
                        <label className={`flex-1 text-center py-2.5 rounded-lg cursor-pointer font-semibold text-sm transition-colors ${investingNature === 'sip' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                          <input type="radio" value="sip" {...register("investingNature")} className="sr-only" />
                          Monthly SIP
                        </label>
                        <label className={`flex-1 text-center py-2.5 rounded-lg cursor-pointer font-semibold text-sm transition-colors ${investingNature === 'one-time' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                          <input type="radio" value="one-time" {...register("investingNature")} className="sr-only" />
                          One-time Lump Sum
                        </label>
                      </div>

                      <div className="mb-8 relative">
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          {investingNature === 'sip' ? 'Monthly Investment Amount (₹)' : 'Total Investment Amount (₹)'}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <IndianRupee className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <input 
                            type="number" 
                            {...register(investingNature === 'sip' ? 'monthlyAmount' : 'lumpSumAmount')}
                            className="block w-full pl-11 pr-4 py-4 bg-background border-2 border-border rounded-xl text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                            placeholder={investingNature === 'sip' ? "5000" : "100000"}
                          />
                        </div>
                        {(errors.monthlyAmount || errors.lumpSumAmount || errors.root) && (
                          <p className="text-destructive text-sm mt-2">
                            {errors.monthlyAmount?.message || errors.lumpSumAmount?.message || "Please enter a valid amount"}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-semibold text-foreground">
                            Exact Tenure (Years)
                          </label>
                          <span className="font-display font-bold text-primary text-xl">{watch('tenure')} Yrs</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" max="30" step="1"
                          {...register("tenure")}
                          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                          <span>1 Year</span>
                          <span>15 Years</span>
                          <span>30 Years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Navigation Controls */}
                <div className="pt-8 mt-8 border-t border-border flex items-center justify-between">
                  {step > 1 ? (
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="px-6 py-3 rounded-xl font-semibold text-muted-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : <div></div>}
                  
                  {step < 3 ? (
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="px-8 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      Analyze Portfolio <Sparkles className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
