import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CalendarClock, Loader2, PlayCircle } from "lucide-react"; // Removed PauseCircle
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import api from "@/lib/api"; // Use the correct api client

// --- START TIMEZONE HELPERS ---
/**
 * Converts a UTC "HH:MM" string to the user's local "HH:MM" string
 */
const convertUTCToLocal = (utcTime: string): string => {
  if (!utcTime) return "09:00";
  try {
    const [hours, minutes] = utcTime.split(':').map(Number);
    const today = new Date();
    today.setUTCHours(hours, minutes, 0, 0);
    const localHours = today.getHours().toString().padStart(2, '0');
    const localMinutes = today.getMinutes().toString().padStart(2, '0');
    return `${localHours}:${localMinutes}`;
  } catch (e) {
    return "09:00";
  }
};

/**
 * Converts a user's local "HH:MM" time string to a UTC "HH:MM" string
 */
const convertLocalToUTC = (localTime: string): string => {
  if (!localTime) return "09:00";
  try {
    const [hours, minutes] = localTime.split(':').map(Number);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    const utcHours = today.getUTCHours().toString().padStart(2, '0');
    const utcMinutes = today.getUTCMinutes().toString().padStart(2, '0');
    return `${utcHours}:${utcMinutes}`;
  } catch (e) {
    return "09:00";
  }
};
// --- END TIMEZONE HELPERS ---

const Scheduler = () => {
  const [automationActive, setAutomationActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  
  // These states are for the "Current Schedule" box
  const [displayTime, setDisplayTime] = useState("09:00");
  const [displayFrequency, setDisplayFrequency] = useState("daily");
  
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      time: "09:00",
      frequency: "daily"
    }
  });

  // 1. Fetch config on load
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        // FIX: Use api.get and get data from res.data
        const res = await api.get("/api/scheduler/settings");
        const data = res.data;
        
        // FIX: Convert UTC time from DB to local time for display
        const localTime = convertUTCToLocal(data.time);

        setAutomationActive(data.active);
        setDisplayTime(localTime);
        setDisplayFrequency(data.frequency);
        
        // Set form values
        form.setValue("time", localTime);
        form.setValue("frequency", data.frequency);
      } catch (error) {
        console.error("Failed to load scheduler settings", error);
        toast({
          title: "Error",
          description: "Failed to load scheduler settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [form, toast]); // Dependencies


  // 2. Handle the Automation ON/OFF switch
  const handleAutomationToggle = async (newActiveState: boolean) => {
    setIsSubmitting(true);
    
    // Get the *current* form values to send
    const formValues = form.getValues();
    const utcTime = convertLocalToUTC(formValues.time);

    try {
      const settingsToSave = {
        active: newActiveState,
        time: utcTime,
        frequency: formValues.frequency,
      };

      // FIX: Use api.post
      const save = await api.post("/api/scheduler/settings", settingsToSave);

      if (save.status !== 200) throw new Error("Failed to update automation status");
      
      setAutomationActive(newActiveState);
      
      toast({
        title: `Automation ${newActiveState ? "Started" : "Paused"}`,
        description: `The AI automation has been ${newActiveState ? "activated" : "paused"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change automation status. Please try again.",
        variant: "destructive",
      });
      // Revert switch on failure
      setAutomationActive(!newActiveState);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle saving the form (Time/Frequency)
  const onSubmit = async (data: { time: string, frequency: string }) => {
    setIsSubmitting(true);
    
    // FIX: Convert local time from form to UTC before saving
    const utcTime = convertLocalToUTC(data.time);

    try {
      const settingsToSave = {
        active: automationActive, // Send the current active state back
        time: utcTime, // Send the converted UTC time
        frequency: data.frequency,
      };

      // FIX: Use api.post
      const save = await api.post("/api/scheduler/settings", settingsToSave);

      if (save.status !== 200) throw new Error("Failed to update schedule");
      
      // Update the "Current Schedule" box
      setDisplayTime(data.time); // Keep display in local time
      setDisplayFrequency(data.frequency);
      
      toast({
        title: "Schedule Updated",
        description: `Your automation schedule has been updated to ${formatTimeString(data.time)} ${data.frequency}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time string to 12-hour format
  const formatTimeString = (timeStr: string) => {
    if (!timeStr) return "N/A";
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // 4. REMOVED: The useEffect for /api/scheduler/health is gone,
  // as it was part of the old broken system.

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
            Scheduler
          </h1>
          <p className="mt-2 text-muted-foreground">
            Control when your content is posted automatically. All times are shown in your local timezone.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
          {/* Automation Control Card */}
          <Card className="border border-border/30 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className={`h-5 w-5 ${automationActive ? "text-green-400" : "text-muted-foreground"}`} />
                Automation Control
              </CardTitle>
              <CardDescription>Start or pause the AI automation process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="automation-toggle">Automation Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {automationActive ? "Automation is active" : "Automation is paused"}
                    </p>
                  </div>
                  <div>
                    <Switch
                      id="automation-toggle"
                      checked={automationActive}
                      disabled={isSubmitting || isLoading}
                      onCheckedChange={handleAutomationToggle} // Pass the function directly
                      className={`${
                        automationActive 
                          ? "bg-primary shadow-[0_0_10px_rgba(155,135,245,0.5)]" 
                          : ""
                      } transition-all duration-300`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg border-border/20">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    automationActive ? "bg-green-500" : "bg-gray-500"
                  }`}></div>
                  <p className="text-sm font-medium">
                    {automationActive ? "System is actively monitoring for the next run" : "System is in standby mode"}
                  </p>
                </div>
                {/* REMOVED the broken "Next run" text */}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Settings Card */}
          <Card className="border border-border/30 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5" />
                Schedule Settings
              </CardTitle>
              <CardDescription>Set when automation should run</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Automation Time (Your Local Time)</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            className="focus-visible:ring-primary/20"
                          />
                        </FormControl>
                        <FormDescription>
                          Set the daily time for content processing
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                          <select
                            className="flex w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekdays">Weekdays Only</option>
                            <option value="alternate">Alternate Days</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          Set how often the automation should run
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isLoading}
                    className="w-full transition-all hover:shadow-[0_0_15px_rgba(155,135,245,0.5)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Schedule"
                    )}
                  </Button>
                </form>
              </Form>
              
              <div className="p-4 mt-6 border rounded-lg border-border/20">
                <h3 className="mb-2 text-sm font-medium">Current Schedule</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Time:</div>
                  <div>{formatTimeString(displayTime)} (Your Time)</div>
                  <div className="text-muted-foreground">Frequency:</div>
                  <div className="capitalize">{displayFrequency}</div>
                  <div className="text-muted-foreground">Status:</div>
                  <div>{automationActive ? "Active" : "Paused"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;