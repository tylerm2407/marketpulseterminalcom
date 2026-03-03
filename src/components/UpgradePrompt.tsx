import { useNavigate } from 'react-router-dom';
import { Crown, Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface UpgradePromptProps {
  feature: string;
  description?: string;
}

const NOVAWEALTH_SUBSCRIBE_URL = 'https://novawealth.app/pricing';

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUpgrade = () => {
    if (user && !user.is_anonymous) {
      // Logged-in user: go straight to checkout
      navigate('/checkout?plan=monthly');
    } else {
      // Guest or not logged in: go to pricing/auth
      navigate('/pricing');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
        <Lock className="h-7 w-7 text-accent" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2">{feature} is a Pro Feature</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || `Upgrade to unlock ${feature.toLowerCase()} and all premium features.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Button onClick={handleUpgrade} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Crown className="h-4 w-4" />
          Upgrade to Pro — $19.99/mo
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => window.open(NOVAWEALTH_SUBSCRIBE_URL, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          NovaWealth Bundle
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Includes a 30-day free trial. Cancel anytime.
      </p>
    </div>
  );
}
