import { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, FileDown, Share2, RefreshCw, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StockData } from '@/types/stock';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { formatLargeNumber, formatCurrency, formatPercent } from '@/lib/formatters';
import { GlossaryTerm } from '@/components/GlossaryTerm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { markChecklistItem } from '@/components/OnboardingChecklist';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export function DossierHeader({ stock }: { stock: StockData }) {
  const { addTicker, removeTicker } = useWatchlistStore();
  const watching = useWatchlistStore((s) => s.tickers.includes(stock.ticker));
  const isPositive = stock.change >= 0;
  const { user } = useAuth();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertPrice, setAlertPrice] = useState(stock.price.toFixed(2));
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');
  const [alertSaving, setAlertSaving] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${stock.name} (${stock.ticker}) – MarketPulse`,
      text: `${stock.ticker} is trading at ${formatCurrency(stock.price)} (${isPositive ? '+' : ''}${formatPercent(stock.changePercent)}). Check out the full analysis:`,
      url: `${window.location.origin}/stock/${stock.ticker}`,
    };

    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share(shareData);
      } else if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success('Link copied to clipboard!');
      }
    } catch {
      // User cancelled share
    }
  };

  const handleCreateAlert = async () => {
    if (!user) {
      toast.error('Sign in to set price alerts');
      return;
    }
    setAlertSaving(true);
    const { error } = await supabase.from('price_alerts').insert({
      user_id: user.id,
      ticker: stock.ticker,
      company_name: stock.name,
      target_price: parseFloat(alertPrice),
      direction: alertDirection,
    });
    setAlertSaving(false);
    if (error) {
      toast.error('Failed to create alert');
    } else {
      toast.success(`Alert set: ${stock.ticker} ${alertDirection} ${formatCurrency(parseFloat(alertPrice))}`);
      markChecklistItem('alert');
      setAlertOpen(false);
    }
  };

  // Mark dossier viewed for checklist
  markChecklistItem('dossier');

  return (
    <>
      <div className="bg-card rounded-lg border border-border card-elevated p-4 sm:p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{stock.name}</h1>
              <Badge variant="secondary" className="text-xs font-mono shrink-0">{stock.ticker}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] sm:text-xs">{stock.exchange}</Badge>
              <Badge variant="outline" className="text-[10px] sm:text-xs">{stock.sector}</Badge>
            </div>

            <div className="flex items-baseline gap-3 mt-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{formatCurrency(stock.price)}</span>
              <div className={`flex items-center gap-1 text-base sm:text-lg font-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
                {isPositive ? <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="font-mono">{formatCurrency(Math.abs(stock.change))}</span>
                <span className="font-mono">({formatPercent(stock.changePercent)})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-muted-foreground">
              <span><GlossaryTerm termKey="marketCap">Mkt Cap</GlossaryTerm>: <span className="font-medium text-foreground">{formatLargeNumber(stock.marketCap)}</span></span>
              <span><GlossaryTerm termKey="volume">Vol</GlossaryTerm>: <span className="font-medium text-foreground">{formatCompactNumber(stock.volume)}</span></span>
              <span><GlossaryTerm termKey="52w">52W</GlossaryTerm>: <span className="font-medium text-foreground">{formatCurrency(stock.low52w)} – {formatCurrency(stock.high52w)}</span></span>
              <span><GlossaryTerm termKey="beta">β</GlossaryTerm>: <span className="font-medium text-foreground">{stock.beta.toFixed(2)}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant={watching ? 'default' : 'outline'}
              size="sm"
              onClick={() => watching ? removeTicker(stock.ticker) : addTicker(stock.ticker)}
              className={`h-9 sm:h-8 ${watching ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}`}
            >
              {watching ? <EyeOff className="h-4 w-4 sm:mr-1.5" /> : <Eye className="h-4 w-4 sm:mr-1.5" />}
              <span className="hidden sm:inline">{watching ? 'Watching' : 'Watch'}</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 sm:h-8" onClick={() => setAlertOpen(true)}>
              <Bell className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Set Alert</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 sm:h-8" onClick={handleShare}>
              <Share2 className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 sm:h-8">
              <FileDown className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex-wrap">
          <Badge
            variant={stock.dataCompleteness > 90 ? 'default' : 'secondary'}
            className={`text-[10px] sm:text-xs ${stock.dataCompleteness > 90 ? 'bg-accent text-accent-foreground' : ''}`}
          >
            Data Quality: {stock.dataCompleteness}%
          </Badge>
          <span className="text-[10px] sm:text-xs text-muted-foreground">Updated: {stock.lastUpdated}</span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </Button>
          {stock.earningsDate && (
            <span className="text-[10px] sm:text-xs text-muted-foreground sm:ml-auto">
              Earnings: <span className="font-medium text-foreground">{stock.earningsDate}</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Alert Dialog */}
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-4 w-4 text-accent" />
              Set Price Alert — {stock.ticker}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-muted-foreground">
              Current price: <span className="text-foreground font-mono font-medium">{formatCurrency(stock.price)}</span>
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Alert when price goes</Label>
              <Select value={alertDirection} onValueChange={(v) => setAlertDirection(v as 'above' | 'below')}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="above">Above</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Target Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                className="bg-background border-border font-mono"
              />
            </div>
            <Button onClick={handleCreateAlert} disabled={alertSaving} className="w-full">
              {alertSaving ? 'Creating...' : 'Create Alert'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatCompactNumber(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}
