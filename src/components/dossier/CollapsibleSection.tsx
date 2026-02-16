import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DataFreshness } from '@/components/DataFreshness';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  quickBrief?: string;
  dataUpdatedAt?: string | Date | number;
}

export function CollapsibleSection({ title, children, defaultOpen = false, quickBrief, dataUpdatedAt }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-card rounded-lg border border-border card-elevated animate-fade-in">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 sm:px-6 py-4 min-h-[48px] hover:bg-muted/50 active:bg-muted/70 transition-colors rounded-t-lg text-left touch-manipulation">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">{title}</h2>
          {dataUpdatedAt && <DataFreshness updatedAt={dataUpdatedAt} />}
        </div>
        <ChevronDown className={cn('h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2', isOpen && 'rotate-180')} />
      </CollapsibleTrigger>
      {!isOpen && quickBrief && (
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 -mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">{quickBrief}</div>
      )}
      <CollapsibleContent>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-border overflow-x-hidden">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
