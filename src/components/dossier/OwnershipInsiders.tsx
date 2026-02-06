import type { StockData } from '@/types/stock';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatLargeNumber, formatPercent, formatNumber, formatCompactNumber } from '@/lib/formatters';

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
        <div className="overflow-x-auto">
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
      </div>

      {stock.insiderTransactions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Insider Transactions</h3>
          <div className="overflow-x-auto">
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
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Short Interest: <span className="font-medium text-foreground font-mono">{stock.shortInterest.toFixed(1)}%</span></span>
        {stock.dividendYield > 0 && (
          <span>Dividend Yield: <span className="font-medium text-foreground font-mono">{stock.dividendYield.toFixed(2)}%</span></span>
        )}
      </div>
    </div>
  );
}
