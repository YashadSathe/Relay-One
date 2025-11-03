
import React from "react";
import { Link } from "react-router-dom";
import { Check, AlertTriangle, XOctagon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SystemStatus = "operational" | "degraded" | "outage";

interface FooterProps {
  status?: SystemStatus;
  lastRun?: string;
  version?: string;
}

const Footer = ({ 
  status = "operational", 
  lastRun = "May 7, 10:03 AM", 
  version = "v1.0.0" 
}: FooterProps) => {
  // Status indicator mapping
  const renderStatusIndicator = () => {
    switch (status) {
      case "operational":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <Check className="size-3 mr-1" /> Operational
          </Badge>
        );
      case "degraded":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertTriangle className="size-3 mr-1" /> Degraded
          </Badge>
        );
      case "outage":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XOctagon className="size-3 mr-1" /> Outage
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="mt-auto w-full">
      <Separator className="mb-4 opacity-30" />
      
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          {/* Left: Company & Copyright */}
          <div className="text-center md:text-left">
            <p className="font-medium text-foreground/80">RelayOne © 2025</p>
            <p className="text-xs opacity-70">A product by Dexmiq Solutions</p>
          </div>
          
          {/* Center: System Status */}
          <div className="flex flex-col items-center gap-1">
            {renderStatusIndicator()}
            <p className="text-xs opacity-70">Last run: {lastRun}</p>
          </div>
          
          {/* Right: Version & Links */}
          <div className="text-center md:text-right">
            <p className="mb-1 font-mono">{version}</p>
            <div className="flex gap-3 text-xs">
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
