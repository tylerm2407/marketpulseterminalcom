import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Search, Eye, Sparkles, AlertTriangle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TOUR_STORAGE_KEY = 'marketpulse-tour-complete';

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: TourStep[] = [
  {
    title: 'Search Any Stock',
    description: 'Type a ticker (AAPL) or company name in the search bar to get a comprehensive analysis dossier.',
    icon: Search,
  },
  {
    title: 'Build Your Watchlist',
    description: 'Star any stock to add it to your watchlist. Track prices and changes for all your favorites in one place.',
    icon: Eye,
  },
  {
    title: 'AI-Powered Insights',
    description: 'Get AI summaries of social media buzz, and click "Explain" on any risk factor for a deeper breakdown.',
    icon: Sparkles,
  },
  {
    title: 'Risk Framework',
    description: 'Every stock has identified risks categorized by severity. Expand any risk for an AI-generated educational explanation.',
    icon: AlertTriangle,
  },
  {
    title: 'Compare & Screen',
    description: 'Use the Compare tool to view stocks side-by-side, or the AI Screener to find stocks using natural language queries.',
    icon: BarChart3,
  },
];

export function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!isVisible) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 animate-in fade-in-0 duration-300" onClick={dismiss} />

      {/* Tour card */}
      <div className="fixed inset-x-4 bottom-20 sm:inset-auto sm:bottom-8 sm:right-8 sm:w-[380px] z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
        <div className="bg-card border border-border rounded-xl shadow-xl p-5">
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === step ? 'w-6 bg-accent' : i < step ? 'w-1.5 bg-accent/50' : 'w-1.5 bg-muted-foreground/20'
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex items-start gap-3 mb-5">
            <div className="p-2 rounded-lg bg-accent/10 shrink-0">
              <Icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{current.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{current.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={dismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={prev}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" className="h-8 text-xs" onClick={next}>
                {step < STEPS.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center mt-3">
            <span className="text-[10px] text-muted-foreground">{step + 1} of {STEPS.length}</span>
          </div>
        </div>
      </div>
    </>
  );
}
