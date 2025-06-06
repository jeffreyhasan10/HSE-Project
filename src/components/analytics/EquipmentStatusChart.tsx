import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Wrench, Archive } from "lucide-react";

// Enhanced data with additional properties
const data = [
  { 
    name: "Active", 
    value: 23, 
    fill: "#22c55e",
    gradient: "url(#activeGradient)",
    icon: Zap,
    description: "Equipment in operational condition"
  },
  { 
    name: "Maintenance", 
    value: 4, 
    fill: "#eab308",
    gradient: "url(#maintenanceGradient)",
    icon: Wrench,
    description: "Equipment under scheduled maintenance"
  },
  { 
    name: "Decommissioned", 
    value: 1, 
    fill: "#6b7280",
    gradient: "url(#decommissionedGradient)",
    icon: Archive,
    description: "Equipment retired from service"
  }
];

const chartConfig: ChartConfig = {
  active: { label: "Active", theme: { light: "#22c55e", dark: "#16a34a" } },
  maintenance: { label: "Maintenance", theme: { light: "#eab308", dark: "#ca8a04" } },
  decommissioned: { label: "Decommissioned", theme: { light: "#6b7280", dark: "#52525b" } },
};

// Custom label component for better positioning
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.03) return null; // Hide labels for very small slices

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
          {data.value} {data.value === 1 ? 'unit' : 'units'}
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
    <div className="grid grid-cols-3 gap-4 mb-6">
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
            <Badge 
              variant="default"
              className="text-xs"
              style={{ 
                backgroundColor: `${item.fill}20`,
                color: item.fill 
              }}
            >
              {percentage}%
            </Badge>
          </div>
        );
      })}
    </div>
  );
};

// Equipment efficiency indicator
const EfficiencyIndicator = () => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const active = data.find(item => item.name === "Active")?.value || 0;
  const maintenance = data.find(item => item.name === "Maintenance")?.value || 0;
  const operational = active + maintenance; // Maintenance equipment will return to service
  const efficiency = total > 0 ? (active / total * 100).toFixed(1) : '0';
  const availability = total > 0 ? (operational / total * 100).toFixed(1) : '0';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-green-800 dark:text-green-200">Current Efficiency</h4>
        </div>
        <p className="text-2xl font-bold text-green-600">{efficiency}%</p>
        <p className="text-sm text-green-700 dark:text-green-300">Equipment ready for immediate use</p>
      </div>
      
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Fleet Availability</h4>
        </div>
        <p className="text-2xl font-bold text-blue-600">{availability}%</p>
        <p className="text-sm text-blue-700 dark:text-blue-300">Total serviceable equipment</p>
      </div>
    </div>
  );
};

// Maintenance alert component
const MaintenanceAlert = () => {
  const maintenance = data.find(item => item.name === "Maintenance")?.value || 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maintenancePercentage = total > 0 ? (maintenance / total * 100).toFixed(0) : '0';
  
  if (maintenance === 0) {
    return (
      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-400">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Optimal Status:</strong> All equipment is operational.
          </p>
        </div>
      </div>
    );
  }
  
  const alertLevel = maintenance > (total * 0.2) ? 'red' : 'yellow';
  const alertColor = alertLevel === 'red' ? 'red' : 'yellow';
  
  return (
    <div className={`p-3 bg-${alertColor}-50 dark:bg-${alertColor}-900/20 rounded border-l-4 border-${alertColor}-400`}>
      <div className="flex items-center gap-2">
        <Wrench className={`w-4 h-4 text-${alertColor}-600`} />
        <p className={`text-sm text-${alertColor}-800 dark:text-${alertColor}-200`}>
          <strong>Maintenance Schedule:</strong> {maintenance} units ({maintenancePercentage}% of fleet) currently under maintenance.
        </p>
      </div>
    </div>
  );
};

export function EquipmentStatusChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="w-full bg-transparent border-none">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="outline">
            {total} Total Units
          </Badge>
        </div>

        <StatsSummary />
        
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="maintenanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#eab308" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="decommissionedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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

        {/* Equipment metrics */}
        <div className="mt-6 space-y-4">
          <EfficiencyIndicator />
          <MaintenanceAlert />
        </div>
      </CardContent>
    </Card>
  );
}