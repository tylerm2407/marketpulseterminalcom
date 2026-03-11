import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Palette, ArrowLeft } from 'lucide-react';

export default function Settings() {
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    marketOpen: false,
  });

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground mb-6">Manage your preferences and notifications.</p>

        <div className="space-y-5">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
