import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Loader2, ArrowRight, Star } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { handleAiUsageNotification } from '@/lib/aiUsageNotifications';
import { UpgradePrompt } from '@/components/UpgradePrompt';

interface ScreenerResult {
  ticker: string;
  name: string;
  reason: string;
}

const EXAMPLE_QUERIES = [
  'Tech stocks with P/E under 25 and growing revenue',
  'High dividend yield stocks in the S&P 500',
  'Small cap biotech with positive cash flow',
  'Undervalued energy stocks with low debt',
  'Companies with market cap over $500B and net margin above 20%',
];

const StockScreener = () => {
  const { canUseScreener } = useSubscription();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const { addTicker, removeTicker, isWatching } = useWatchlistStore();

  if (!canUseScreener) {
    return (
      <div className="min-h-screen bg-background pb-16 sm:pb-0">
        <section className="container mx-auto px-4 py-8 max-w-3xl">
          <UpgradePrompt feature="AI Stock Screener" description="Upgrade to Pro to screen stocks with natural language AI queries." />
        </section>
        <Footer />
      </div>
    );
  }

  const runScreen = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setLastQuery(q);

    try {
      const { data, error } = await supabase.functions.invoke('stock-screener', {
        body: { query: q },
      });

      if (error) throw new Error(error.message);
      if (data?.error) {
        toast({ title: 'Screener Error', description: data.error, variant: 'destructive' });
        return;
      }
      handleAiUsageNotification(data);
      setResults(data?.results || []);
      if (!data?.results?.length) {
        toast({ title: 'No matches', description: 'Try broadening your criteria.' });
      }
    } catch (err) {
      console.error('Screener error:', err);
      toast({ title: 'Error', description: 'Failed to run screen. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <section className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Stock Screener</h1>
            <p className="text-sm text-muted-foreground">Describe what you're looking for in plain English</p>
          </div>
        </div>

        {/* Search */}
        <form
          onSubmit={e => { e.preventDefault(); runScreen(query); }}
          className="flex gap-2 mb-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g., Show me tech stocks with P/E under 20..."
              className="pl-9 h-11"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || !query.trim()} className="h-11 px-5">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Screen</span>
          </Button>
        </form>

        {/* Example queries */}
        {!lastQuery && (
          <div className="space-y-2 mb-8">
            <span className="text-xs font-medium text-muted-foreground">Try these:</span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map(eq => (
                <button
                  key={eq}
                  onClick={() => { setQuery(eq); runScreen(eq); }}
                  className="text-xs bg-card border border-border rounded-full px-3 py-1.5 hover:border-accent/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Screening stocks with AI...</p>
            <p className="text-xs text-muted-foreground mt-1">"{lastQuery}"</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-foreground">Results</h2>
              <Badge variant="outline" className="text-[10px]">{results.length} matches</Badge>
              <span className="text-[10px] text-muted-foreground ml-auto">"{lastQuery}"</span>
            </div>
            <div className="space-y-2">
              {results.map(r => (
                <div
                  key={r.ticker}
                  className="bg-card rounded-lg border border-border p-3 flex items-center gap-3 hover:border-accent/40 transition-colors group"
                >
                  <button
                    onClick={() => isWatching(r.ticker) ? removeTicker(r.ticker) : addTicker(r.ticker)}
                    className="p-1 rounded-full hover:bg-muted transition-colors shrink-0"
                  >
                    <Star className={`h-4 w-4 ${isWatching(r.ticker) ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-sm text-foreground">{r.ticker}</span>
                      <span className="text-xs text-muted-foreground truncate">{r.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.reason}</p>
                  </div>
                  <Link to={`/stock/${r.ticker}`} className="shrink-0">
                    <Button variant="ghost" size="sm" className="h-8">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && lastQuery && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No stocks matched your criteria. Try adjusting your query.</p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground mt-8 text-center italic">
          AI-powered screening uses general market knowledge. Always verify metrics with live data before making decisions.
        </p>
      </section>
      <Footer />
    </div>
  );
};

export default StockScreener;
