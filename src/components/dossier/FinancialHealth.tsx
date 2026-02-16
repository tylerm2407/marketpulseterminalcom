import { useState } from 'react';
import type { StockData } from '@/types/stock';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatLargeNumber, formatMargin, CHART_COLORS } from '@/lib/formatters';
import { GlossaryTerm } from '@/components/GlossaryTerm';
import { SourceAttribution } from '@/components/SourceAttribution';

export function FinancialHealth({ stock }: { stock: StockData }) {
  const [view, setView] = useState<'annual' | 'quarterly'>('annual');
  const data = view === 'annual' ? stock.financials.annual : stock.financials.quarterly;
  const reversed = [...data].reverse();

  const revenueChart = reversed.map(p => ({
    period: p.period.replace('FY', ''),
    Revenue: +(p.revenue / 1e9).toFixed(1),
    'Net Income': +(p.netIncome / 1e9).toFixed(1),
  }));

  const marginChart = reversed.map(p => ({
    period: p.period.replace('FY', ''),
    'Op Margin': p.operatingMargin,
    'Net Margin': p.netMargin,
  }));

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as 'annual' | 'quarterly')}>
        <TabsList className="h-8">
          <TabsTrigger value="annual" className="text-xs px-3 h-7">Annual</TabsTrigger>
          <TabsTrigger value="quarterly" className="text-xs px-3 h-7">Quarterly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3">Revenue & Net Income ($B)</h3>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart} barGap={4}>
                <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(216,18%,90%)' }} />
                <Bar dataKey="Revenue" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Income" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3">Margin Trends (%)</h3>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marginChart}>
                <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(216,18%,90%)' }} formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Line type="monotone" dataKey="Op Margin" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Net Margin" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Metric</TableHead>
              {data.map(p => (
                <TableHead key={p.period} className="text-xs text-right">{p.period}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <MetricRow label="Revenue" data={data} accessor={p => formatLargeNumber(p.revenue)} />
            <MetricRow label="Gross Profit" data={data} accessor={p => formatLargeNumber(p.grossProfit)} />
            <MetricRow label="Operating Income" data={data} accessor={p => formatLargeNumber(p.operatingIncome)} />
            <MetricRow label="Net Income" data={data} accessor={p => formatLargeNumber(p.netIncome)} />
            <MetricRow label="EPS" data={data} accessor={p => `$${p.eps.toFixed(2)}`} glossaryKey="eps" />
            <MetricRow label="Op Margin" data={data} accessor={p => formatMargin(p.operatingMargin)} glossaryKey="operatingMargin" />
            <MetricRow label="Net Margin" data={data} accessor={p => formatMargin(p.netMargin)} glossaryKey="netMargin" />
            <MetricRow label="Total Assets" data={data} accessor={p => formatLargeNumber(p.totalAssets)} />
            <MetricRow label="Total Debt" data={data} accessor={p => formatLargeNumber(p.totalDebt)} />
            <MetricRow label="Cash" data={data} accessor={p => formatLargeNumber(p.cashAndEquivalents)} />
            <MetricRow label="Op Cash Flow" data={data} accessor={p => formatLargeNumber(p.operatingCashFlow)} />
            <MetricRow label="Free Cash Flow" data={data} accessor={p => formatLargeNumber(p.freeCashFlow)} glossaryKey="freeCashFlow" />
            <MetricRow label="Current Ratio" data={data} accessor={p => p.currentRatio.toFixed(2)} glossaryKey="currentRatio" />
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-2">
        <SourceAttribution source="Polygon.io" />
      </div>
    </div>
  );
}

function MetricRow({ label, data, accessor, glossaryKey }: {
  label: string;
  data: StockData['financials']['annual'];
  accessor: (p: StockData['financials']['annual'][0]) => string;
  glossaryKey?: string;
}) {
  return (
    <TableRow>
      <TableCell className="text-xs font-medium text-muted-foreground">
        {glossaryKey ? <GlossaryTerm termKey={glossaryKey}>{label}</GlossaryTerm> : label}
      </TableCell>
      {data.map(p => (
        <TableCell key={p.period} className="text-xs text-right font-mono">{accessor(p)}</TableCell>
      ))}
    </TableRow>
  );
}
