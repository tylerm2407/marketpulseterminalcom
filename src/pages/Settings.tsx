import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserRound, LogOut, Shield, Bell, Palette, Save, Loader2, Crown, Mail } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export default function Settings() {
  const { user, signOut, isGuest } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    marketOpen: false,
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data?.display_name) setDisplayName(data.display_name);
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleDeleteAccount = () => {
    toast.info('To delete your account, please contact support@marketpulseterminal.com');
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground mb-6">Manage your account, preferences, and notifications.</p>

        <div className="space-y-5">
          {/* Profile */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserRound className="h-4 w-4 text-accent" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm text-foreground font-mono mt-0.5">{user?.email ?? 'Guest'}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-xs text-muted-foreground">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="bg-background border-border"
                    disabled={isGuest}
                  />
                  <Button onClick={saveProfile} disabled={saving || isGuest} size="sm" className="shrink-0">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isPro ? 'default' : 'secondary'} className={isPro ? 'bg-accent text-accent-foreground' : ''}>
                  <Crown className="h-3 w-3 mr-1" />
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </Badge>
                {!isPro && (
                  <Button variant="link" size="sm" className="text-accent h-auto p-0" onClick={() => navigate('/pricing')}>
                    Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                Notifications
              </CardTitle>
              <CardDescription className="text-xs">Choose what updates you receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Price Alert Emails</p>
                  <p className="text-xs text-muted-foreground">Get notified when your alerts trigger</p>
                </div>
                <Switch checked={prefs.emailAlerts} onCheckedChange={(v) => setPrefs(p => ({ ...p, emailAlerts: v }))} />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Weekly Digest</p>
                  <p className="text-xs text-muted-foreground">Sunday summary of your watchlist performance</p>
                </div>
                <Switch checked={prefs.weeklyDigest} onCheckedChange={(v) => setPrefs(p => ({ ...p, weeklyDigest: v }))} />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Market Open Brief</p>
                  <p className="text-xs text-muted-foreground">Daily pre-market briefing at 9:00 AM ET</p>
                </div>
                <Switch checked={prefs.marketOpen} onCheckedChange={(v) => setPrefs(p => ({ ...p, marketOpen: v }))} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-accent" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">MarketPulse is designed for dark mode</p>
                </div>
                <Switch checked disabled />
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground text-xs" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
