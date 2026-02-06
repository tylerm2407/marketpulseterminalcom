import type { StockData } from '@/types/stock';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Users, Globe, Calendar } from 'lucide-react';
import { formatLargeNumber } from '@/lib/formatters';
import { SEGMENT_COLORS } from '@/lib/formatters';

export function BusinessOverview({ stock }: { stock: StockData }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">{stock.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard icon={Building2} label="Headquarters" value={stock.headquarters} />
        <InfoCard icon={Calendar} label="Founded" value={String(stock.founded)} />
        <InfoCard icon={Users} label="Employees" value={stock.employees.toLocaleString()} />
        <InfoCard icon={Globe} label="CEO" value={stock.ceo} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Revenue by Segment ($B)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stock.revenueSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {stock.revenueSegments.map((_, i) => (
                    <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(1)}B`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {stock.revenueSegments.map((seg, i) => (
              <div key={seg.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                {seg.name}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Revenue by Geography ($B)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stock.geographicRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {stock.geographicRevenue.map((_, i) => (
                    <Cell key={i} fill={SEGMENT_COLORS[(i + 2) % SEGMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(1)}B`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {stock.geographicRevenue.map((seg, i) => (
              <div key={seg.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: SEGMENT_COLORS[(i + 2) % SEGMENT_COLORS.length] }} />
                {seg.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50">
      <Icon className="h-4 w-4 text-accent mt-0.5 shrink-0" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}
