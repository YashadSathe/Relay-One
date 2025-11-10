import { useState, useEffect } from "react";
import { FileText, RefreshCw, ArrowDown, ArrowUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {HoverCard,HoverCardContent,HoverCardTrigger,} from "@/components/ui/hover-card";
import { toast } from "@/hooks/use-toast";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import api from "@/lib/api";
interface Post {
  id: string;
  content: string;
  score: number;
  timestamp: string;
}

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isFetching, setIsFetching] = useState(true);
  const [scoreFilter, setScoreFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchPosts = async () => {
    try {
      setIsFetching(true);
      const response = await api.get('/api/posts');
      const data = await response.data;
      setPosts(data.posts || []);
      
      } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || "Failed to load posts";
      let title = "Error Fetching Posts";

      if (error.response?.status === 401) {
        title = "Authentication Error";
      } else if (!error.response) {
        title = "Network Error";
      }
      toast({
        title: title,
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "Z");
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Filter and sort posts
  const getFilteredPosts = () => {
    let filteredPosts = [...posts];
    
    // Apply score filter
    if (scoreFilter === "low") {
      filteredPosts = filteredPosts.filter(post => post.score < 7);
    } else if (scoreFilter === "medium") {
      filteredPosts = filteredPosts.filter(post => post.score >= 7 && post.score < 9);
    } else if (scoreFilter === "high") {
      filteredPosts = filteredPosts.filter(post => post.score >= 9);
    }
    
    // Apply date filter
    if (dateFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredPosts = filteredPosts.filter(post => new Date(post.timestamp) >= oneWeekAgo);
    } else if (dateFilter === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filteredPosts = filteredPosts.filter(post => new Date(post.timestamp) >= oneMonthAgo);
    }
    
    // Apply sort
    filteredPosts.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortOrder === "oldest") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortOrder === "highest") {
        return b.score - a.score;
      } else {
        return a.score - b.score;
      }
    });
    
    return filteredPosts;
  };

  const filteredPosts = getFilteredPosts();
  
  // Determine score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-green-500/20 text-green-500 border-green-500/50";
    if (score >= 7) return "bg-amber-500/20 text-amber-500 border-amber-500/50";
    return "bg-red-500/20 text-red-500 border-red-500/50";
  };

  if (isFetching) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-background p-0 md:p-2 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background p-0 md:p-2">
      <div className="max-w-7xl mx-auto">
        <div className="text-center md:text-left mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
            Posts
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review and manage your generated LinkedIn posts.
          </p>
        </div>

        {/* Rest of your existing JSX remains the same */}
        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Filter by:</span>
            
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="low">Below 7</SelectItem>
                <SelectItem value="medium">7 - 9</SelectItem>
                <SelectItem value="high">9+</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 items-center ml-auto">
            <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Score</SelectItem>
                <SelectItem value="lowest">Lowest Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Post Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Card key={post.id} className="bg-card shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary/80" />
                    <CardTitle className="text-lg font-medium">LinkedIn Post</CardTitle>
                  </div>
                  <HoverCard>
                    <HoverCardTrigger>
                      <Badge
                        className={`font-medium border ${getScoreColor(post.score || 0)}`}
                      >
                        Score: {post.score|| 'NA'}/10
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Post Evaluation Score</h4>
                        <p className="text-sm text-muted-foreground">
                          This score represents the AI evaluator's assessment of engagement potential,
                          clarity, and alignment with professional tone.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </CardHeader>
                <CardContent className="pt-2">
                  <ScrollArea className="h-[160px] md:h-[180px] rounded-md pr-4">
                    <p className="text-sm whitespace-pre-line">{post.content}</p>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-0 gap-2">
                  <p className="text-xs text-muted-foreground">
                    Generated on {formatDate(post.timestamp)}
                  </p>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-medium mb-1">No posts generated yet</h3>
              <p className="text-muted-foreground">
                Run the content generation pipeline to create your first post!
              </p>
            </div>
          )}
        </div>

        {/* Pagination - You might want to implement real pagination later */}
        {filteredPosts.length > 0 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;