import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface TopicSubmission {
  id: string;
  topic: string;
  timestamp: string;
}

const ManualTopic = () => {
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [recentTopics, setRecentTopics] = useState<TopicSubmission[]>([]); //set empty as default
  const [isLoading, setIsLoading] = useState(true);
  
  {/* Fetch functiom */}
  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/manual-topics');
      if (!response.ok) {
        throw new Error ('Failed to fetch topics')
      }
      const topics: TopicSubmission[] = await response.json();
      setRecentTopics(topics);
    }
    catch (error) {
      toast({
        title: "Error",
        description: "Could not load recent submissions.",
        variant: "destructive",
      });
    }
    finally {
      setIsLoading(false);
    }
  };
  
  {/* Fetch data on load */}
  useEffect(() => {
    fetchTopics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTopic = topic.trim();
    
    if (!trimmedTopic) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/manual-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: trimmedTopic })
      });
      if (!response.ok) throw new Error('Failed to submit topic');

      await fetchTopics();
      
      toast({
        title: "Success",
        description: "Topic submitted successfully to the AI agents.",
      });
      setTopic("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit topic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
            Manual Topic
          </h1>
          <p className="mt-2 text-muted-foreground">
            Submit a custom topic directly to the AI content pipeline.
          </p>
        </div>
        
        <div className="mt-8">
          <Card className="border backdrop-blur-sm border-border/30 bg-card/40">
            <CardHeader>
              <CardTitle>Submit a Topic</CardTitle>
              <CardDescription>Enter a trending idea or concept to process</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <Input
                    type="text"
                    placeholder="Enter a trending idea or keyword..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex-1 focus:border-purple-400 focus:ring-purple-500/20"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="transition-all hover:shadow-[0_0_15px_rgba(155,135,245,0.5)] hover:bg-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Submit Topic to AI Pipeline"
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold">Recent Submissions</h3>
                {recentTopics.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-border/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 font-medium text-left">Topic</th>
                            <th className="px-4 py-3 font-medium text-right">Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {recentTopics.map((item) => (
                            <tr key={item.id} className="bg-card/20 hover:bg-card/30">
                              <td className="px-4 py-3">{item.topic}</td>
                              <td className="px-4 py-3 text-right text-muted-foreground">{item.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent submissions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManualTopic;