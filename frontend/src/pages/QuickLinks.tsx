
import QuickLinksPanel from "@/components/dashboard/QuickLinksPanel";

const QuickLinks = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
            Quick Links
          </h1>
          <p className="mt-2 text-muted-foreground">
            Access important resources and external tools.
          </p>
        </div>
        
        <div className="mt-8">
          <QuickLinksPanel />
        </div>
      </div>
    </div>
  );
};

export default QuickLinks;
