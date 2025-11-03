
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, FileText, ListFilter, RefreshCw, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Define the log entry type
interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: "info" | "warning" | "error" | "success";
  agent: string;
  details?: string;
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Sample log data
  const sampleLogs: LogEntry[] = [
    {
      id: "log-1",
      timestamp: "10:01 AM",
      message: "Topic 'AI hiring trends' sent to GPT",
      level: "info",
      agent: "Generator",
      details: "Topic selected from top 5 trending topics on HackerNews"
    },
    {
      id: "log-2",
      timestamp: "10:02 AM",
      message: "Evaluator score: 8.5/10",
      level: "success",
      agent: "Evaluator",
      details: "Post meets criteria for engagement and tone. Keywords matched: 'AI', 'hiring', 'trends'"
    },
    {
      id: "log-3",
      timestamp: "10:03 AM",
      message: "Post queued to Buffer",
      level: "success",
      agent: "Scheduler",
      details: "Scheduled for publishing at 2:30 PM"
    },
    {
      id: "log-4",
      timestamp: "10:04 AM",
      message: "3 duplicate topics removed",
      level: "warning",
      agent: "Cleaner",
      details: "Duplicates detected: 'AI tools for recruiting', 'Hiring AI specialists', 'AI trend analysis'"
    },
    {
      id: "log-5",
      timestamp: "10:05 AM",
      message: "Awaiting next scheduled run",
      level: "info",
      agent: "System",
      details: "Next run scheduled for 1:30 PM"
    },
    {
      id: "log-6",
      timestamp: "09:55 AM",
      message: "Error connecting to Twitter API",
      level: "error",
      agent: "Scraper",
      details: "Rate limit exceeded. Will retry in 15 minutes."
    },
    {
      id: "log-7",
      timestamp: "09:50 AM",
      message: "New topics scraped from HackerNews",
      level: "info",
      agent: "Scraper",
      details: "15 new topics found, 10 added to database"
    },
    {
      id: "log-8",
      timestamp: "09:45 AM",
      message: "System check complete",
      level: "success",
      agent: "System",
      details: "All services operational"
    }
  ];

  // Initialize logs on first render
  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs when activeTab changes
  useEffect(() => {
    filterLogs();
  }, [activeTab, logs]);

  const fetchLogs = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setLogs(sampleLogs);
      setIsLoading(false);
      
      toast({
        title: "Logs refreshed",
        description: `${sampleLogs.length} log entries loaded.`,
      });
    }, 600);
  };

  const filterLogs = () => {
    if (activeTab === "all") {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.level === activeTab));
    }
  };

  // Get the appropriate icon based on agent type
  const getAgentIcon = (agent: string) => {
    switch (agent.toLowerCase()) {
      case "scraper":
        return <FileText className="size-4" />;
      case "evaluator":
        return <Terminal className="size-4" />;
      case "generator":
        return <Brain className="size-4" />;
      case "scheduler":
        return <Terminal className="size-4" />;
      case "system":
        return <Terminal className="size-4" />;
      case "cleaner":
        return <ListFilter className="size-4" />;
      default:
        return <Terminal className="size-4" />;
    }
  };

  // Get the appropriate color based on log level
  const getLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "text-blue-400 border-blue-400/20 bg-blue-500/5";
      case "warning":
        return "text-yellow-400 border-yellow-400/20 bg-yellow-500/5";
      case "error":
        return "text-red-400 border-red-400/20 bg-red-500/5";
      case "success":
        return "text-green-400 border-green-400/20 bg-green-500/5";
      default:
        return "text-blue-400 border-blue-400/20 bg-blue-500/5";
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center md:text-left mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
            Logs
          </h1>
          <p className="mt-2 text-muted-foreground">
            Monitor agent activities and system events.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border border-border/30 bg-card/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent agent activities and events</CardDescription>
              </div>
              <Button 
                onClick={fetchLogs} 
                disabled={isLoading}
                variant="outline" 
                size="sm"
                className="ml-auto"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                {isLoading ? "Refreshing..." : "Refresh Logs"}
              </Button>
            </CardHeader>
            
            <div className="px-6">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 mb-2 w-full sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="success">Success</TabsTrigger>
                  <TabsTrigger value="warning">Warning</TabsTrigger>
                  <TabsTrigger value="error">Error</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <CardContent>
              <ScrollArea className="h-[500px] w-full pr-4">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-pulse text-muted-foreground">Loading logs...</div>
                    </div>
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className={cn(
                          "p-3 rounded-md border transition-all duration-300 hover:border-border/60 group animate-fade-in",
                          "border-border/30 bg-card/60 backdrop-blur-sm",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-1.5 rounded-md flex-shrink-0 border", 
                            getLevelColor(log.level)
                          )}>
                            {getAgentIcon(log.agent)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium leading-none">{log.message}</p>
                              <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className={cn(
                                "text-xs font-medium rounded-full px-2 py-0.5", 
                                getLevelColor(log.level),
                              )}>
                                {log.agent}
                              </span>
                              {log.details && (
                                <p className="text-xs text-muted-foreground mt-1 w-full">
                                  {log.details}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">No log entries found.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Logs;
