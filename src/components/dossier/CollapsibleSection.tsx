import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  quickBrief?: string;
}

export function CollapsibleSection({ title, children, defaultOpen = false, quickBrief }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-card rounded-lg border border-border card-elevated animate-fade-in">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-4 hover:bg-muted/50 transition-colors rounded-t-lg text-left">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')} />
      </CollapsibleTrigger>
      {!isOpen && quickBrief && (
        <div className="px-6 pb-4 -mt-1 text-sm text-muted-foreground">{quickBrief}</div>
      )}
      <CollapsibleContent>
        <div className="px-6 pb-6 pt-2 border-t border-border">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
