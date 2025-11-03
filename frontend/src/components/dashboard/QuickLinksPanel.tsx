
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { FileText, Database, Terminal, Github, MessageSquare, FileBarChart } from "lucide-react";
import { cn } from "@/lib/utils";

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

const QuickLinksPanel: React.FC = () => {
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
      icon: <MessageSquare className="size-5" />,
      label: "Support Discord",
      description: "Join our Discord community for support and discussions.",
      href: "https://discord.gg/your-invite"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLinksPanel;
