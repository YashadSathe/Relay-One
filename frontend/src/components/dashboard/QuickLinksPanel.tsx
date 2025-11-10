
import React, { useState, useRef, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { FileText, Database, Terminal, Github, FileBarChart, UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface QuickLinkProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}

const QuickLink: React.FC<QuickLinkProps> = ({ icon, label, description, href }) => {
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center h-32 rounded-lg bg-secondary/30 border border-border/40 p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:bg-secondary/40"
        >
          <div className="size-12 flex items-center justify-center bg-primary/10 rounded-full mb-3 text-primary">
            {icon}
          </div>
          <span className="text-sm font-medium text-center line-clamp-2">{label}</span>
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 text-sm">
        <div className="space-y-2">
          <h4 className="font-medium">{label}</h4>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

interface QuickLinkUploadProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  id: string;
  isLoading: boolean;
  disabled: boolean;
}

const QuickLinkUpload: React.FC<QuickLinkUploadProps> = ({ 
  icon, 
  label, 
  description, 
  id,
  isLoading,
  disabled 
}) => {
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <label
          htmlFor={id}
          className={cn(
            "flex flex-col items-center justify-center h-32 rounded-lg bg-secondary/30 border border-border/40 p-4 transition-all duration-300",
            disabled 
              ? "cursor-not-allowed opacity-50" 
              : "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:bg-secondary/40 cursor-pointer"
          )}
        >
          <div className="size-12 flex items-center justify-center bg-primary/10 rounded-full mb-3 text-primary">
            {isLoading ? <Loader2 className="size-5 animate-spin" /> : icon}
          </div>
          <span className="text-sm font-medium text-center line-clamp-2">{label}</span>
        </label>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 text-sm">
        <div className="space-y-2">
          <h4 className="font-medium">{label}</h4>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const QuickLinksPanel: React.FC = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const personalBriefInputRef = useRef<HTMLInputElement>(null);

  const handlePersonalBriefUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      const response = await api.post('/api/brand-briefs/personal/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: "Upload Successful",
        description: response.data.message || "Personal brand brief uploaded.",
      });

    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (personalBriefInputRef.current) {
        personalBriefInputRef.current.value = "";
      }
    }
  };
  const quickLinks: QuickLinkProps[] = [
    {
      icon: <FileText className="size-5" />,
      label: "Open Buffer Drafts",
      description: "View and edit your scheduled social media posts in Buffer.",
      href: "https://publish.buffer.com/drafts"
    },
    {
      icon: <Database className="size-5" />,
      label: "Open Notion Database",
      description: "Access your content library and planning documents in Notion.",
      href: "https://www.notion.so/your-notion-db-link"
    },
    {
      icon: <Terminal className="size-5" />,
      label: "View Replit Logs",
      description: "Check the backend logs and console output on Replit.",
      href: "https://replit.com/@your-workspace/your-project"
    },
    {
      icon: <Github className="size-5" />,
      label: "GitHub Repo",
      description: "Access the source code repository on GitHub.",
      href: "https://github.com/your-organization/your-repo"
    },
    {
      icon: <FileBarChart className="size-5" />,
      label: "Feature Roadmap",
      description: "See what features and improvements are planned for RelayOne.",
      href: "https://your-roadmap-link.com"
    },
  ];

  return (
    <Card className="border border-border/30 bg-card/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <QuickLink
              key={index}
              icon={link.icon}
              label={link.label}
              description={link.description}
              href={link.href}
            />
          ))}
          <QuickLinkUpload
            id="personal-brief-upload"
            icon={<UploadCloud className="size-5" />}
            label={isUploading ? "Uploading..." : "Upload Personal Brief"}
            description="Upload a .txt or .doc file for your personal brand brief."
            isLoading={isUploading}
            disabled={isUploading}
          />
          <input
            type="file"
            id="personal-brief-upload"
            ref={personalBriefInputRef}
            onChange={handlePersonalBriefUpload}
            className="hidden"
            accept=".txt,text/plain,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={isUploading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLinksPanel;
