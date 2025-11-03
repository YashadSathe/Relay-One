
import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { FileText, TrendingUp, MessageSquare, Monitor, AlarmClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Define the log entry type
interface LogEntry {
  agent: "Scraper" | "Ranker" | "Generator" | "Evaluator" | "Scheduler";
  message: string;
  timestamp: string;
}

// Sample log data for demonstration
const sampleLogs: LogEntry[] = [
  {
    agent: "Scraper",
    message: "Scraped 14 topics from Reddit AI community.",
    timestamp: "May 7, 10:02 AM"
  },
  {
    agent: "Ranker",
    message: "Ranked 10 topics and selected top 2.",
    timestamp: "May 7, 10:03 AM"
  },
  {
    agent: "Generator",
    message: "Generated draft post using OpenAI model.",
    timestamp: "May 7, 10:04 AM"
  },
  {
    agent: "Evaluator",
    message: "Evaluated post: Score 8.7/10 - Engagement potential high.",
    timestamp: "May 7, 10:05 AM"
  },
  {
    agent: "Scheduler",
    message: "Scheduled post for LinkedIn at 2:30 PM.",
    timestamp: "May 7, 10:06 AM"
  }
];

// Generate more logs for demonstration
const generateMoreLogs = (): LogEntry[] => {
  const agentTypes: LogEntry["agent"][] = ["Scraper", "Ranker", "Generator", "Evaluator", "Scheduler"];
  const messages = [
    "Analyzing trending topics in tech industry.",
    "Processing data from Twitter API.",
    "Optimizing content for maximum engagement.",
    "Cross-referencing topics with historical performance.",
    "Updating post queue with new content."
  ];
  
  const now = new Date();
  
  return Array(3).fill(null).map((_, i) => ({
    agent: agentTypes[Math.floor(Math.random() * agentTypes.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: `May 7, ${now.getHours()}:${String(now.getMinutes() - i).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`
  }));
};

const ActivityLogFeed: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(sampleLogs);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Simulate fetching new logs
  const fetchNewLogs = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newLogs = generateMoreLogs();
      setLogs(prevLogs => [...newLogs, ...prevLogs]);
      setIsLoading(false);
      
      toast({
        title: "Logs updated",
        description: `${newLogs.length} new activities received.`,
      });
    }, 800);
  };
  
  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchNewLogs, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Scroll to top when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);
  
  // Get the appropriate icon for each agent type
  const getAgentIcon = (agent: LogEntry["agent"]) => {
    switch (agent) {
      case "Scraper":
        return <FileText className="size-4" />;
      case "Ranker":
        return <TrendingUp className="size-4" />;
      case "Generator":
        return <MessageSquare className="size-4" />;
      case "Evaluator":
        return <Monitor className="size-4" />;
      case "Scheduler":
        return <AlarmClock className="size-4" />;
      default:
        return <FileText className="size-4" />;
    }
  };
  
  // Get the appropriate color for each agent type
  const getAgentColor = (agent: LogEntry["agent"]) => {
    switch (agent) {
      case "Scraper":
        return "text-blue-400 border-blue-400/20";
      case "Ranker":
        return "text-green-400 border-green-400/20";
      case "Generator":
        return "text-purple-400 border-purple-400/20";
      case "Evaluator":
        return "text-yellow-400 border-yellow-400/20";
      case "Scheduler":
        return "text-red-400 border-red-400/20";
      default:
        return "text-blue-400 border-blue-400/20";
    }
  };
  
  return (
    <Card className="border-border/30 bg-card/40 backdrop-blur-sm h-full">
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Log</h3>
          <p className="text-xs text-muted-foreground">AI Agent Activities</p>
        </div>
        <button
          onClick={fetchNewLogs}
          disabled={isLoading}
          className="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      
      <ScrollArea className="h-[400px] md:h-[500px]" ref={scrollRef}>
        <div className="p-4 space-y-2">
          {logs.map((log, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-md border bg-card/60 backdrop-blur-sm transition-all duration-300",
                "border-border/30 hover:border-border/50",
                "animate-fade-in"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "p-1.5 rounded-md bg-background/50 border",
                    getAgentColor(log.agent)
                  )}>
                    {getAgentIcon(log.agent)}
                  </span>
                  <div>
                    <p className="text-sm">{log.message}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn(
                        "text-xs font-medium rounded-full px-2 py-0.5", 
                        getAgentColor(log.agent),
                        "bg-background/40"
                      )}>
                        {log.agent}
                      </span>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ActivityLogFeed;
