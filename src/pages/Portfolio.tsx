import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, PieChart, Loader2, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/layout/Footer';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { useWatchlistQuotes } from '@/hooks/useStockData';
import { toast } from 'sonner';

interface Holding {
  id: string;
  ticker: string;
  company_name: string;
  shares: number;
  buy_price: number;
  buy_date: string | null;
  dividend_yield: number;
  notes: string;
}

export default function Portfolio() {
  const { user, loading: authLoading } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ticker: '', company_name: '', shares: '', buy_price: '', buy_date: '', dividend_yield: '', notes: '' });

  const tickers = holdings.map(h => h.ticker);
  const { data: liveQuotes } = useWatchlistQuotes(tickers);
  const quoteMap = new Map((liveQuotes || []).map(q => [q.ticker, q]));

  useEffect(() => {
    if (user) fetchHoldings();
  }, [user]);

  const fetchHoldings = async () => {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setHoldings(data as Holding[]);
    setLoading(false);
  };

  const addHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('portfolio_holdings').insert({
      user_id: user.id,
      ticker: form.ticker.toUpperCase(),
      company_name: form.company_name,
      shares: parseFloat(form.shares) || 0,
      buy_price: parseFloat(form.buy_price) || 0,
      buy_date: form.buy_date || null,
      dividend_yield: parseFloat(form.dividend_yield) || 0,
      notes: form.notes,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Added ${form.ticker.toUpperCase()}`);
      setForm({ ticker: '', company_name: '', shares: '', buy_price: '', buy_date: '', dividend_yield: '', notes: '' });
      setDialogOpen(false);
      fetchHoldings();
    }
  };

  const deleteHolding = async (id: string, ticker: string) => {
    const { error } = await supabase.from('portfolio_holdings').delete().eq('id', id);
    if (!error) {
      toast.success(`Removed ${ticker}`);
      setHoldings(prev => prev.filter(h => h.id !== id));
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  // Portfolio stats
  const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.buy_price, 0);
  const totalValue = holdings.reduce((sum, h) => {
    const live = quoteMap.get(h.ticker);
    return sum + h.shares * (live?.price ?? h.buy_price);
  }, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const annualDividends = holdings.reduce((sum, h) => {
    const live = quoteMap.get(h.ticker);
    const dy = h.dividend_yield ?? 0;
    const currentPrice = live?.price ?? h.buy_price;
    return sum + h.shares * currentPrice * (dy / 100);
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Wallet className="h-6 w-6 text-accent" />
              Portfolio
            </h1>
            <p className="text-sm text-muted-foreground">Track your holdings, performance & dividends</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Holding</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Holding</DialogTitle>
              </DialogHeader>
              <form onSubmit={addHolding} className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label htmlFor="ticker">Ticker</Label><Input id="ticker" placeholder="AAPL" value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))} required /></div>
                  <div><Label htmlFor="company_name">Company</Label><Input id="company_name" placeholder="Apple Inc." value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label htmlFor="shares">Shares</Label><Input id="shares" type="number" step="any" placeholder="10" value={form.shares} onChange={e => setForm(f => ({ ...f, shares: e.target.value }))} required /></div>
                  <div><Label htmlFor="buy_price">Buy Price</Label><Input id="buy_price" type="number" step="any" placeholder="150.00" value={form.buy_price} onChange={e => setForm(f => ({ ...f, buy_price: e.target.value }))} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label htmlFor="buy_date">Buy Date</Label><Input id="buy_date" type="date" value={form.buy_date} onChange={e => setForm(f => ({ ...f, buy_date: e.target.value }))} /></div>
                  <div><Label htmlFor="dividend_yield">Div. Yield %</Label><Input id="dividend_yield" type="number" step="any" placeholder="0.5" value={form.dividend_yield} onChange={e => setForm(f => ({ ...f, dividend_yield: e.target.value }))} /></div>
                </div>
                <div><Label htmlFor="notes">Notes</Label><Input id="notes" placeholder="Optional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
                <Button type="submit" className="w-full">Add to Portfolio</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><PieChart className="h-3 w-3" /> Total Value</div>
              <div className="text-lg font-bold font-mono text-foreground">{formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">{totalGain >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} Total Gain</div>
              <div className={`text-lg font-bold font-mono ${totalGain >= 0 ? 'text-gain' : 'text-loss'}`}>
                {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)} <span className="text-xs">({formatPercent(totalGainPct)})</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Cost Basis</div>
              <div className="text-lg font-bold font-mono text-foreground">{formatCurrency(totalCost)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Est. Annual Dividends</div>
              <div className="text-lg font-bold font-mono text-accent">{formatCurrency(annualDividends)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Holdings ({holdings.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No holdings yet</p>
                <p className="text-sm">Click "Add Holding" to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead className="hidden sm:table-cell">Company</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Buy Price</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Gain/Loss</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Div. Yield</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map(h => {
                      const live = quoteMap.get(h.ticker);
                      const currentPrice = live?.price ?? h.buy_price;
                      const gain = (currentPrice - h.buy_price) * h.shares;
                      const gainPct = h.buy_price > 0 ? ((currentPrice - h.buy_price) / h.buy_price) * 100 : 0;
                      const dy = h.dividend_yield ?? 0;
                      return (
                        <TableRow key={h.id}>
                          <TableCell>
                            <Link to={`/stock/${h.ticker}`} className="font-bold font-mono text-foreground hover:text-accent transition-colors">{h.ticker}</Link>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm truncate max-w-[150px]">{h.company_name}</TableCell>
                          <TableCell className="text-right font-mono">{h.shares}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(h.buy_price)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(currentPrice)}</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-mono font-medium ${gain >= 0 ? 'text-gain' : 'text-loss'}`}>
                              {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                            </span>
                            <Badge variant="outline" className={`ml-1 text-[10px] ${gain >= 0 ? 'text-gain border-gain/30' : 'text-loss border-loss/30'}`}>
                              {formatPercent(gainPct)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right hidden md:table-cell font-mono text-sm">{dy > 0 ? `${dy.toFixed(2)}%` : '—'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteHolding(h.id, h.ticker)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
