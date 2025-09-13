import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface RevenueChartProps {
  data: { industry: string; revenue: number }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  // Transform data for the chart
  const chartData = data.map((item, index) => ({
    name: item.industry,
    revenue: item.revenue,
    month: `Month ${index + 1}`
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 border border-glass-border">
          <p className="text-glass-foreground font-medium">{label}</p>
          <p className="text-primary font-bold">
            Revenue: ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold neon-text">Revenue by Industry</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-glow"></div>
          <span className="text-sm text-muted-foreground">Live Data</span>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              className="animate-glow"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};