import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  feature: string;
  description?: string;
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
        <Lock className="h-7 w-7 text-accent" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2">{feature} is a Pro Feature</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || `Upgrade to MarketPulse Pro to unlock ${feature.toLowerCase()} and all premium features.`}
      </p>
      <Button onClick={() => navigate('/pricing')} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
        <Crown className="h-4 w-4" />
        Upgrade to Pro
      </Button>
      <p className="text-xs text-muted-foreground mt-3">Start with a 30-day free trial — no commitment</p>
    </div>
  );
}
