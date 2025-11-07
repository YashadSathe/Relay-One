
  import { useState, useEffect } from "react";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { useToast } from "@/components/ui/use-toast";
  import { CalendarClock, Loader2, PlayCircle, PauseCircle } from "lucide-react";
  import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
  import { useForm } from "react-hook-form";
  import api from "@/lib/api";

  const Scheduler = () => {
    const [automationActive, setAutomationActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("09:00");
    const [scheduleFrequency, setScheduleFrequency] = useState("daily");
    const { toast } = useToast();

    const [schedulerStatus, setSchedulerStatus] = useState("unknown");
    const [nextRunTime, setNextRunTime] = useState<string | null>(null);

    const form = useForm({
      defaultValues: {
        time: "09:00",
        frequency: "daily"
      }
    });

    useEffect(() => {
      const fetchConfig = async () => {
        try {
          const res = await authFetch("/api/scheduler/settings");
          const data = await res.json();
        
          setAutomationActive(data.active);
          setScheduleTime(data.time);
          setScheduleFrequency(data.frequency);
        
          form.setValue("time", data.time);
          form.setValue("frequency", data.frequency);
        } catch (error) {
          console.error("Failed to load scheduler settings", error);
        }
      };

  fetchConfig();
}, []);


    const handleAutomationToggle = async () => {
      setIsSubmitting(true);
      
      try {
        const res = await authFetch("/api/scheduler/settings");
        const current = await res.json();

        const updated = {
          ...current,
          active: !automationActive,
        };
        
        const save = await authFetch("/api/scheduler/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });

        if (!save.ok) throw new Error("Failed to update automation status");
        
        setAutomationActive(updated.active);
        
        toast({
          title: `Automation ${updated.active ? "Started" : "Paused"}`,
          description: `The AI automation has been ${updated.active ? "activated" : "paused"} successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to change automation status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const onSubmit = async (data: { time: string, frequency: string }) => {
      setIsSubmitting(true);
      
      try {
        const res = await authFetch("/api/scheduler/settings");
        const current = await res.json();
          
        const updated = {
          ...current,
          time: data.time,
          frequency: data.frequency,
        };

    const save = await authFetch("/api/scheduler/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (!save.ok) throw new Error("Failed to update schedule");
        
        setScheduleTime(updated.time);
        setScheduleFrequency(updated.frequency);
        
        toast({
          title: "Schedule Updated",
          description: "Your automation schedule has been updated successfully.",
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
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    useEffect(() => {
      const fetchSchedulerHealth = async () => {
        try {
          const res = await fetch("/api/scheduler/health");
          const data = await res.json();

          setSchedulerStatus(data.status || "unknown");

          if (data.jobs && data.jobs.length > 0 && data.jobs[0].next_run) {
            setNextRunTime(data.jobs[0].next_run);
          } else {
            setNextRunTime(null);
          }
        } catch (err) {
          setSchedulerStatus("error");
          setNextRunTime(null);
        }
      };
      
      fetchSchedulerHealth();
    }, []);

    return (
      <div className="min-h-[calc(100vh-8rem)] bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
              Scheduler
            </h1>
            <p className="mt-2 text-muted-foreground">
              Control when your content is posted automatically.
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
                        disabled={isSubmitting}
                        onCheckedChange={handleAutomationToggle}
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
                      {automationActive ? "System is actively monitoring and posting content" : "System is in standby mode"}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Status: <span className="font-medium">{schedulerStatus}</span><br />
                    {automationActive ? (
                      nextRunTime ? (
                        <>
                          Next run:{" "}
                          <span className="font-medium">
                            {new Date(nextRunTime).toLocaleString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </>
                      ) : (
                        "No upcoming run scheduled"
                      )
                    ) : (
                      "Automation is paused"
                    )}
                  </p>
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
                          <FormLabel>Automation Time</FormLabel>
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
                      disabled={isSubmitting}
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
                    <div>{formatTimeString(scheduleTime)}</div>
                    <div className="text-muted-foreground">Frequency:</div>
                    <div className="capitalize">{scheduleFrequency}</div>
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