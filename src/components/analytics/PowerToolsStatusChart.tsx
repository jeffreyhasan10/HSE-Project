import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Settings, Archive, AlertTriangle } from "lucide-react";

// Enhanced data with additional properties based on PowerTools bio-data
const data = [
  { 
    name: "Operational", 
    value: 42, 
    fill: "#22c55e",
    gradient: "url(#operationalGradient)",
    icon: Wrench,
    description: "Tools ready for use"
  },
  { 
    name: "Maintenance", 
    value: 12, 
    fill: "#eab308",
    gradient: "url(#maintenanceGradient)",
    icon: Settings,
    description: "Tools under maintenance"
  },
  { 
    name: "Under Repair", 
    value: 6, 
    fill: "#ef4444",
    gradient: "url(#repairGradient)",
    icon: AlertTriangle,
    description: "Tools being repaired"
  },
  { 
    name: "Inactive", 
    value: 8, 
    fill: "#6b7280",
    gradient: "url(#inactiveGradient)",
    icon: Archive,
    description: "Tools not in use"
  }
];

const chartConfig: ChartConfig = {
  operational: { label: "Operational", theme: { light: "#22c55e", dark: "#16a34a" } },
  maintenance: { label: "Maintenance", theme: { light: "#eab308", dark: "#ca8a04" } },
  repair: { label: "Under Repair", theme: { light: "#ef4444", dark: "#dc2626" } },
  inactive: { label: "Inactive", theme: { light: "#6b7280", dark: "#52525b" } },
};

// Custom label component for better positioning
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Hide labels for very small slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-medium drop-shadow-lg"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip content
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const IconComponent = data.icon;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <IconComponent className="w-4 h-4" style={{ color: data.fill }} />
          <span className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</span>
        </div>
        <p className="text-2xl font-bold mb-1" style={{ color: data.fill }}>
          {data.value} tools
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{data.description}</p>
      </div>
    );
  }
  return null;
};

// Stats summary component
const StatsSummary = () => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {data.map((item) => {
        const IconComponent = item.icon;
        const percentage = ((item.value / total) * 100).toFixed(1);
        
        return (
          <div key={item.name} className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${item.fill}20` }}
              >
                <IconComponent className="w-6 h-6" style={{ color: item.fill }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {item.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {item.name}
            </div>
            <Badge variant="secondary" className="text-xs">
              {percentage}%
            </Badge>
          </div>
        );
      })}
    </div>
  );
};

export function PowerToolsStatusChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
            {total} Total Tools
          </Badge>
        </div>

        <StatsSummary />
        
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="operationalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="maintenanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#eab308" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="repairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6b7280" stopOpacity={1} />
                  <stop offset="100%" stopColor="#52525b" stopOpacity={1} />
                </linearGradient>
              </defs>
              
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={120}
                innerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="white"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.gradient}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Additional insights */}
        <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-white/20">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Quick Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">
                {((data[0].value / total) * 100).toFixed(0)}% of tools are operational
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600 dark:text-gray-400">
                {data[1].value + data[2].value} tools need attention
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}