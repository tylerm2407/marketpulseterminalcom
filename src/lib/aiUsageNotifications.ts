import { toast } from 'sonner';

interface AiUsageNotification {
  type: 'half' | 'three_quarter' | 'limit_reached';
  message: string;
  usedDollars: number;
  limitDollars: number;
  resetDate: string;
}

/**
 * Check an AI endpoint response for usage milestone notifications and show a toast.
 * Call this after every successful AI fetch.
 */
export function handleAiUsageNotification(data: any) {
  const notification = data?.ai_usage_notification as AiUsageNotification | undefined;
  if (!notification) return;

  const resetFormatted = new Date(notification.resetDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  switch (notification.type) {
    case 'half':
      toast.warning('AI Credits: 50% Used', {
        description: `You've used half of your monthly AI credits. Credits reset ${resetFormatted}.`,
        duration: 8000,
      });
      break;
    case 'three_quarter':
      toast.warning('AI Credits: 75% Used', {
        description: `You've used $${notification.usedDollars.toFixed(2)} of $${notification.limitDollars.toFixed(2)}. Credits reset ${resetFormatted}.`,
        duration: 10000,
      });
      break;
    case 'limit_reached':
      toast.error('AI Credits Exhausted', {
        description: `You've used all your monthly AI credits. They will reset on ${resetFormatted}.`,
        duration: 15000,
      });
      break;
  }
}
