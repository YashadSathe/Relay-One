
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lightbulb, Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Mock insights data
const initialInsights = [
  {
    id: 1,
    icon: "search",
    text: "Topics with emotional storytelling tend to get higher scores."
  },
  {
    id: 2,
    icon: "trending-up",
    text: "Try exploring trends around AI and hiring — high engagement last week."
  },
  {
    id: 3,
    icon: "lightbulb",
    text: "Use more 'you' language — it triggers stronger reader reactions."
  }
];

const AIInsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState(initialInsights);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Shuffle insights and modify slightly to simulate new insights
      const shuffled = [...initialInsights]
        .sort(() => Math.random() - 0.5)
        .map(insight => ({
          ...insight,
          id: Math.random() // Assign new IDs to force re-render animation
        }));
      
      setInsights(shuffled);
      setIsLoading(false);
    }, 1000);
  };

  // Icon mapping function
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "search":
        return <Search className="size-4" />;
      case "trending-up":
        return <TrendingUp className="size-4" />;
      case "lightbulb":
        return <Lightbulb className="size-4" />;
      default:
        return <Lightbulb className="size-4" />;
    }
  };

  return (
    <Card className="border border-border/30 bg-card/40 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">AI Insights</CardTitle>
          <CardDescription>Content recommendations from RelayOne</CardDescription>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-9 gap-1" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          {isLoading ? "Analyzing..." : "Generate New Insights"}
        </Button>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-5">
          {isLoading ? (
            // Loading skeletons
            <>
              <div className="flex items-center gap-4">
                <div className="shrink-0 size-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Skeleton className="size-4" />
                </div>
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="shrink-0 size-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Skeleton className="size-4" />
                </div>
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="shrink-0 size-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Skeleton className="size-4" />
                </div>
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </>
          ) : (
            // Actual insights
            insights.map((insight) => (
              <div 
                key={insight.id} 
                className="flex items-center gap-4 animate-fade-in"
              >
                <div className="shrink-0 size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  {renderIcon(insight.icon)}
                </div>
                <p className="text-sm flex-1">{insight.text}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
