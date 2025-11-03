
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MoonStar, Sun, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Settings = () => {
  const { toast } = useToast();
  
  // State for all settings
  const [settings, setSettings] = useState({
    autoQueue: false,
    showEvaluatorScore: true,
    defaultVisibility: "public",
    darkMode: true,
    useSystemTheme: false,
    emailWhenQueued: true,
    dailyActivitySummary: false,
    inAppToasts: true
  });

  // Handle toggle changes
  const handleToggleChange = (setting: string) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [setting]: !prev[setting as keyof typeof prev] };
      
      // Show toast notification when a setting is changed
      toast({
        title: "Setting updated",
        description: `${setting} has been ${newSettings[setting as keyof typeof newSettings] ? "enabled" : "disabled"}.`
      });
      
      return newSettings;
    });
  };

  // Handle select changes
  const handleSelectChange = (setting: string, value: string) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [setting]: value };
      
      toast({
        title: "Setting updated",
        description: `${setting} has been set to ${value}.`
      });
      
      return newSettings;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Customize your RelayOne experience.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* General Preferences */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="size-5" />
              General Preferences
            </CardTitle>
            <CardDescription>Configure how RelayOne works for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between space-x-4">
                <div>
                  <Label htmlFor="auto-queue" className="text-base">Enable Auto-Queue to Buffer</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically queue approved posts to Buffer
                  </p>
                </div>
                <Switch 
                  id="auto-queue" 
                  checked={settings.autoQueue}
                  onCheckedChange={() => handleToggleChange("autoQueue")}
                />
              </div>

              <div className="flex items-start justify-between space-x-4">
                <div>
                  <Label htmlFor="evaluator-score" className="text-base">Show Evaluator Score on Posts</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Display AI confidence scores on post evaluations
                  </p>
                </div>
                <Switch 
                  id="evaluator-score" 
                  checked={settings.showEvaluatorScore}
                  onCheckedChange={() => handleToggleChange("showEvaluatorScore")}
                />
              </div>

              <div className="flex flex-col space-y-3">
                <Label htmlFor="default-visibility" className="text-base">Default Post Visibility</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-2">
                  Set the default visibility for new posts
                </p>
                <Select
                  value={settings.defaultVisibility}
                  onValueChange={(value) => handleSelectChange("defaultVisibility", value)}
                >
                  <SelectTrigger id="default-visibility" className="w-full">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="draft">Draft only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {settings.darkMode ? <MoonStar className="size-5" /> : <Sun className="size-5" />}
              Theme Settings
            </CardTitle>
            <CardDescription>Personalize the look and feel of RelayOne</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between space-x-4">
                <div>
                  <Label htmlFor="dark-mode" className="text-base">
                    {settings.darkMode ? "Dark Mode" : "Light Mode"}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {settings.darkMode ? "Using dark theme" : "Using light theme"}
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={settings.darkMode}
                  onCheckedChange={() => handleToggleChange("darkMode")}
                  className={cn(
                    settings.darkMode ? "bg-primary" : "bg-secondary",
                  )}
                />
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox 
                  id="system-theme" 
                  checked={settings.useSystemTheme}
                  onCheckedChange={() => handleToggleChange("useSystemTheme")}
                />
                <div>
                  <Label htmlFor="system-theme" className="text-base">Use System Theme</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically match your device's theme settings
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              Notification Settings
            </CardTitle>
            <CardDescription>Manage how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between space-x-4">
                <div>
                  <Label htmlFor="email-queued" className="text-base">Email When Post is Queued</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive an email notification when a post is queued
                  </p>
                </div>
                <Switch 
                  id="email-queued" 
                  checked={settings.emailWhenQueued}
                  onCheckedChange={() => handleToggleChange("emailWhenQueued")}
                />
              </div>

              <div className="flex items-start justify-between space-x-4">
                <div>
                  <Label htmlFor="daily-summary" className="text-base">Daily Activity Summary</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive a daily email with your activity summary
                  </p>
                </div>
                <Switch 
                  id="daily-summary" 
                  checked={settings.dailyActivitySummary}
                  onCheckedChange={() => handleToggleChange("dailyActivitySummary")}
                />
              </div>

              <div className="flex items-start justify-between space-x-4">
                <div>
                  <Label htmlFor="in-app-toasts" className="text-base">In-App Toast Alerts</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show notification toasts in the application
                  </p>
                </div>
                <Switch 
                  id="in-app-toasts" 
                  checked={settings.inAppToasts}
                  onCheckedChange={() => handleToggleChange("inAppToasts")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
