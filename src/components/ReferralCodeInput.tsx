import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface ReferralValidation {
  valid: boolean;
  referrer_id: string;
  code: string;
  discount_percent: number;
}

interface ReferralCodeInputProps {
  userEmail: string;
  onValidated: (result: ReferralValidation | null) => void;
}

const NOVA_WEALTH_URL = 'https://dbwuegchdysuocbpsprd.supabase.co/functions/v1';

export function ReferralCodeInput({ userEmail, onValidated }: ReferralCodeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleValidate = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      const res = await fetch(`${NOVA_WEALTH_URL}/validate-referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_code: trimmed, user_email: userEmail }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setStatus('valid');
        onValidated({ valid: true, referrer_id: data.referrer_id, code: data.code, discount_percent: data.discount_percent });
      } else {
        setStatus('invalid');
        setErrorMsg(data.error || 'Invalid referral code');
        onValidated(null);
      }
    } catch {
      setStatus('invalid');
      setErrorMsg('Could not validate code. Try again.');
      onValidated(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setStatus('idle');
    setErrorMsg('');
    onValidated(null);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
      <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <Tag className="h-3 w-3" />
        Have a referral code?
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => { setCode(e.target.value); if (status !== 'idle') handleClear(); }}
              placeholder="NW-XXXXXXXX"
              className="h-8 text-xs font-mono"
              disabled={status === 'valid'}
            />
            {status === 'valid' ? (
              <Button variant="outline" size="sm" className="h-8 text-xs shrink-0" onClick={handleClear}>
                Clear
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-8 text-xs shrink-0" onClick={handleValidate} disabled={loading || !code.trim()}>
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
              </Button>
            )}
          </div>
          {status === 'valid' && (
            <div className="flex items-center gap-1.5 text-xs text-gain">
              <CheckCircle className="h-3.5 w-3.5" />
              25% discount will be applied!
            </div>
          )}
          {status === 'invalid' && (
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMsg}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
