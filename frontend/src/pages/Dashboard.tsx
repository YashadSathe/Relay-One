
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityLogFeed from "@/components/dashboard/ActivityLogFeed";
import DeliveryStatusPanel from "@/components/dashboard/DeliveryStatusPanel";
import MiniAnalyticsPanel from "@/components/dashboard/MinAnalyticsPanel";
import QuickLinksPanel from "@/components/dashboard/QuickLinksPanel";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";

const Dashboard = () => {
  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
            RelayOne Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome to your AI-powered content management dashboard.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              <MiniAnalyticsPanel />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DeliveryStatusPanel />
                
                <Card className="border border-border/30 bg-card/40 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Upcoming Posts</CardTitle>
                    <CardDescription>Preview your scheduled content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Your upcoming posts will appear here.</p>
                  </CardContent>
                </Card>
                
                <div className="md:col-span-2">
                  <AIInsightsPanel />
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="grid grid-cols-1 gap-6">
              <ActivityLogFeed />
              <QuickLinksPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
