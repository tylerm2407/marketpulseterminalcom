import type { StockData } from '@/types/stock';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatLargeNumber, formatPercent, formatNumber, formatCompactNumber } from '@/lib/formatters';
import { GlossaryTerm } from '@/components/GlossaryTerm';
import { SourceAttribution } from '@/components/SourceAttribution';

export function OwnershipInsiders({ stock }: { stock: StockData }) {
  const topHoldersPct = stock.institutionalHolders.slice(0, 3).reduce((s, h) => s + h.percentOwnership, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-foreground">Top Institutional Holders</h3>
          {topHoldersPct > 20 && (
            <Badge variant="outline" className="text-[10px] bg-warning/15 text-warning border-warning/30">
              Top 3 own {topHoldersPct.toFixed(1)}%
            </Badge>
          )}
        </div>
        {/* Mobile: card layout / Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Holder</TableHead>
                <TableHead className="text-xs text-right">Shares</TableHead>
                <TableHead className="text-xs text-right">% Owned</TableHead>
                <TableHead className="text-xs text-right">Change</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.institutionalHolders.map((h, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs font-medium">{h.name}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{formatCompactNumber(h.shares)}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{h.percentOwnership.toFixed(1)}%</TableCell>
                  <TableCell className={`text-xs text-right font-mono ${h.change > 0 ? 'text-gain' : h.change < 0 ? 'text-loss' : ''}`}>
                    {formatPercent(h.change)}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">{formatLargeNumber(h.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="sm:hidden space-y-2">
          {stock.institutionalHolders.map((h, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="text-xs font-medium text-foreground mb-1.5">{h.name}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <span className="text-muted-foreground">Shares</span>
                <span className="text-right font-mono text-foreground">{formatCompactNumber(h.shares)}</span>
                <span className="text-muted-foreground">% Owned</span>
                <span className="text-right font-mono text-foreground">{h.percentOwnership.toFixed(1)}%</span>
                <span className="text-muted-foreground">Change</span>
                <span className={`text-right font-mono ${h.change > 0 ? 'text-gain' : h.change < 0 ? 'text-loss' : 'text-foreground'}`}>
                  {formatPercent(h.change)}
                </span>
                <span className="text-muted-foreground">Value</span>
                <span className="text-right font-mono text-foreground">{formatLargeNumber(h.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {stock.insiderTransactions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Insider Transactions</h3>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs text-right">Shares</TableHead>
                  <TableHead className="text-xs text-right">Price</TableHead>
                  <TableHead className="text-xs text-right">Value</TableHead>
                  <TableHead className="text-xs text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stock.insiderTransactions.map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium">{t.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.title}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className={`text-[10px] ${t.type === 'buy' ? 'text-gain border-gain/30' : t.type === 'sell' ? 'text-loss border-loss/30' : ''}`}>
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatNumber(t.shares)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">${t.price.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatLargeNumber(t.value)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{t.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-2">
            {stock.insiderTransactions.map((t, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">{t.name}</span>
                  <Badge variant="outline" className={`text-[10px] ${t.type === 'buy' ? 'text-gain border-gain/30' : t.type === 'sell' ? 'text-loss border-loss/30' : ''}`}>
                    {t.type}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground mb-1.5">{t.title}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="text-right font-mono text-foreground">{formatNumber(t.shares)}</span>
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-right font-mono text-foreground">${t.price.toFixed(2)}</span>
                  <span className="text-muted-foreground">Value</span>
                  <span className="text-right font-mono text-foreground">{formatLargeNumber(t.value)}</span>
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-right font-mono text-foreground">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span><GlossaryTerm termKey="shortInterest">Short Interest</GlossaryTerm>: <span className="font-medium text-foreground font-mono">{stock.shortInterest.toFixed(1)}%</span></span>
          {stock.dividendYield > 0 && (
            <span><GlossaryTerm termKey="dividendYield">Dividend Yield</GlossaryTerm>: <span className="font-medium text-foreground font-mono">{stock.dividendYield.toFixed(2)}%</span></span>
          )}
        </div>
        <SourceAttribution source="Polygon.io" />
      </div>
    </div>
  );
}
