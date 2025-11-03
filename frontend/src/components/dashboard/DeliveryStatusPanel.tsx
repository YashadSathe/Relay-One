
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data interface
interface DeliveryStatus {
  todayStatus: "completed" | "pending";
  nextRun: string;
  queueCount: number;
}

// Simulated data
const mockData: DeliveryStatus = {
  todayStatus: "completed",
  nextRun: "May 8, 10:00 AM",
  queueCount: 2
};

const DeliveryStatusPanel: React.FC = () => {
  const [status, setStatus] = React.useState<DeliveryStatus>(mockData);
  const [isLoading, setIsLoading] = React.useState(false);

  // Simulate a refresh action
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setStatus(mockData);
      setIsLoading(false);
    }, 800);
  };

  return (
    <Card className="border border-border/30 bg-card/40 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Delivery Status</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-8 w-8 rounded-full"
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            isLoading && "animate-spin"
          )} />
          <span className="sr-only">Refresh status</span>
        </Button>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="space-y-4">
          {/* Today's Run Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Today's Run Status</p>
              <div className="flex items-center gap-2">
                {status.todayStatus === "completed" ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <p className="font-medium">Automation ran successfully today.</p>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-yellow-400" />
                    <p className="font-medium">Automation not yet triggered today.</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Next Scheduled Run */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Next Scheduled Run</p>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary/80" />
              <p className="font-medium">{status.nextRun}</p>
            </div>
          </div>

          {/* Queue Status */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Queue Status</p>
            <div className="pl-7">
              <p className="font-medium">
                {status.queueCount}{" "}
                {status.queueCount === 1 ? "post" : "posts"}{" "}
                currently in Buffer draft queue.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryStatusPanel;
