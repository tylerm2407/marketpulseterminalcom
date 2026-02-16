import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Bell, BellRing, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/layout/Footer';
import { formatCurrency } from '@/lib/formatters';
import { useWatchlistQuotes } from '@/hooks/useStockData';
import { toast } from 'sonner';

interface PriceAlert {
  id: string;
  ticker: string;
  company_name: string;
  target_price: number;
  direction: 'above' | 'below';
  is_triggered: boolean;
  triggered_at: string | null;
  is_read: boolean;
  created_at: string;
}

export default function PriceAlerts() {
  const { user, loading: authLoading } = useAuth();
  const { canUsePortfolio: canUseAlerts } = useSubscription();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ticker: '', company_name: '', target_price: '', direction: 'above' as 'above' | 'below' });

  const tickers = [...new Set(alerts.map(a => a.ticker))];
  const { data: liveQuotes } = useWatchlistQuotes(tickers);
  const quoteMap = new Map((liveQuotes || []).map(q => [q.ticker, q]));

  useEffect(() => {
    if (user) fetchAlerts();
  }, [user]);

  // Client-side alert checking
  useEffect(() => {
    if (!liveQuotes || alerts.length === 0) return;
    alerts.forEach(alert => {
      if (alert.is_triggered) return;
      const live = quoteMap.get(alert.ticker);
      if (!live) return;
      const triggered =
        (alert.direction === 'above' && live.price >= alert.target_price) ||
        (alert.direction === 'below' && live.price <= alert.target_price);
      if (triggered) {
        supabase.from('price_alerts').update({ is_triggered: true, triggered_at: new Date().toISOString() }).eq('id', alert.id).then(() => {
          toast.success(`🔔 ${alert.ticker} hit ${formatCurrency(alert.target_price)} (${alert.direction})!`, { duration: 8000 });
          fetchAlerts();
        });
      }
    });
  }, [liveQuotes]);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setAlerts(data as PriceAlert[]);
    setLoading(false);
  };

  const addAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('price_alerts').insert({
      user_id: user.id,
      ticker: form.ticker.toUpperCase(),
      company_name: form.company_name,
      target_price: parseFloat(form.target_price) || 0,
      direction: form.direction,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Alert set for ${form.ticker.toUpperCase()}`);
      setForm({ ticker: '', company_name: '', target_price: '', direction: 'above' });
      setDialogOpen(false);
      fetchAlerts();
    }
  };

  const deleteAlert = async (id: string) => {
    await supabase.from('price_alerts').delete().eq('id', id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const markRead = async (id: string) => {
    await supabase.from('price_alerts').update({ is_read: true }).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!canUseAlerts) {
    return (
      <div className="min-h-screen bg-background pb-16 sm:pb-0">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <UpgradePrompt feature="Price Alerts" description="Upgrade to Pro to set price alerts and get notified when stocks hit your targets." />
        </div>
        <Footer />
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => !a.is_triggered);
  const triggeredAlerts = alerts.filter(a => a.is_triggered);
  const unreadCount = triggeredAlerts.filter(a => !a.is_read).length;

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6 text-accent" />
              Price Alerts
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">Get notified when stocks hit your target price</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Alert</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Price Alert</DialogTitle></DialogHeader>
              <form onSubmit={addAlert} className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Ticker</Label><Input placeholder="AAPL" value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))} required /></div>
                  <div><Label>Company</Label><Input placeholder="Apple Inc." value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Target Price</Label><Input type="number" step="any" placeholder="200.00" value={form.target_price} onChange={e => setForm(f => ({ ...f, target_price: e.target.value }))} required /></div>
                  <div>
                    <Label>Direction</Label>
                    <Select value={form.direction} onValueChange={(v: 'above' | 'below') => setForm(f => ({ ...f, direction: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Price goes above</SelectItem>
                        <SelectItem value="below">Price goes below</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Alert</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No alerts set</p>
              <p className="text-sm">Create your first price alert to get notified</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Triggered */}
            {triggeredAlerts.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-accent" /> Triggered ({triggeredAlerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {triggeredAlerts.map(a => (
                    <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border ${a.is_read ? 'border-border bg-card' : 'border-accent/30 bg-accent/5'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${a.direction === 'above' ? 'bg-gain/10' : 'bg-loss/10'}`}>
                          {a.direction === 'above' ? <ArrowUp className="h-4 w-4 text-gain" /> : <ArrowDown className="h-4 w-4 text-loss" />}
                        </div>
                        <div>
                          <Link to={`/stock/${a.ticker}`} className="font-bold font-mono text-foreground hover:text-accent">{a.ticker}</Link>
                          <span className="text-sm text-muted-foreground ml-2">{a.direction} {formatCurrency(a.target_price)}</span>
                          {a.triggered_at && <p className="text-xs text-muted-foreground">Triggered {new Date(a.triggered_at).toLocaleString()}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!a.is_read && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markRead(a.id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteAlert(a.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Active */}
            {activeAlerts.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Active ({activeAlerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeAlerts.map(a => {
                    const live = quoteMap.get(a.ticker);
                    return (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-full ${a.direction === 'above' ? 'bg-gain/10' : 'bg-loss/10'}`}>
                            {a.direction === 'above' ? <ArrowUp className="h-4 w-4 text-gain" /> : <ArrowDown className="h-4 w-4 text-loss" />}
                          </div>
                          <div>
                            <Link to={`/stock/${a.ticker}`} className="font-bold font-mono text-foreground hover:text-accent">{a.ticker}</Link>
                            <span className="text-sm text-muted-foreground ml-2">{a.direction} {formatCurrency(a.target_price)}</span>
                            {live && <p className="text-xs text-muted-foreground">Current: {formatCurrency(live.price)}</p>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteAlert(a.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
