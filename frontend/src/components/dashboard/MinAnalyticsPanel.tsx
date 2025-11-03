import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Star, PieChart } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// Mock data for the analytics panel
const analyticsData = {
  monthlyPostCount: 18,
  averageScore: 8.1,
  sentimentStats: {
    positive: 12,
    neutral: 4,
    negative: 2
  }
};

// Helper component for metric display
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  description
}) => {
  return <div className="flex flex-col space-y-2 p-4 rounded-lg bg-secondary/30 border border-border/40 hover:border-primary/30 transition-all duration-300">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-primary/80">{icon}</div>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>;
};

// Sentiment chart component
const SentimentChart: React.FC = () => {
  const {
    sentimentStats
  } = analyticsData;

  // Process data for the chart
  const data = [{
    name: "Positive",
    value: sentimentStats.positive,
    color: "#4ade80"
  },
  // green
  {
    name: "Neutral",
    value: sentimentStats.neutral,
    color: "#60a5fa"
  },
  // blue
  {
    name: "Negative",
    value: sentimentStats.negative,
    color: "#f87171"
  } // red
  ];
  const total = data.reduce((acc, item) => acc + item.value, 0);
  return <div className="flex flex-col items-center justify-center h-full py-1 px-0">
      {/* Chart container */}
      <div className="h-16 w-full flex justify-center">
        <ChartContainer className="h-16" config={{
        positive: {
          theme: {
            light: "#4ade80",
            dark: "#4ade80"
          }
        },
        neutral: {
          theme: {
            light: "#60a5fa",
            dark: "#60a5fa"
          }
        },
        negative: {
          theme: {
            light: "#f87171",
            dark: "#f87171"
          }
        }
      }}>
          <ResponsiveContainer width={80} height={65}>
            <RechartsPieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={16} outerRadius={28} paddingAngle={2} dataKey="value" nameKey="name" label={false} labelLine={false}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      {/* Legend below the chart */}
      <div className="flex justify-center gap-3 text-xs text-muted-foreground mt-2 px-0 my-0">
        {data.map((item, index) => <div key={index} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{
          backgroundColor: item.color
        }}></div>
            <span className="mx--1 px-0 text-xs font-light">{item.name} ({Math.round(item.value / total * 100)}%)</span>
          </div>)}
      </div>
    </div>;
};
const MiniAnalyticsPanel: React.FC = () => {
  return <Card className="border border-border/30 bg-card/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Content Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", "grid-cols-1 md:grid-cols-3")}>
          {/* Posts Generated Metric */}
          <MetricCard title="Posts Generated This Month" value={analyticsData.monthlyPostCount} icon={<FileText className="size-5" />} />
          
          {/* Average Score Metric */}
          <MetricCard title="Average Evaluator Score" value={`${analyticsData.averageScore} / 10`} icon={<Star className="size-5" />} />
          
          {/* Sentiment Analysis */}
          <div className="flex flex-col p-4 rounded-lg bg-secondary/30 border border-border/40 hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-muted-foreground">Sentiment Breakdown</h3>
              <div className="text-primary/80">
                <PieChart className="size-5" />
              </div>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <SentimentChart />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default MiniAnalyticsPanel;