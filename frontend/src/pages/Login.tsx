
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // For demo purposes, we'll simulate login
    setTimeout(() => {
      if (email && password) {
        toast({
          title: "Welcome to RelayOne",
          description: "Login successful. Redirecting to dashboard.",
        });
        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Please enter both email and password.",
        });
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden animated-gradient">
      {/* Animated background */}
      <div className="absolute inset-0 grid-background animate-move-background -z-10 opacity-50"></div>
      
      {/* Glowing orbs for decoration */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl animate-pulse-glow"></div>

      <div className="max-w-md w-full">
        {/* Logo and tagline */}
        <div className="text-center mb-10 animate-fade-in" style={{ animationDelay: "0ms" }}>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
            RelayOne
          </h1>
          <p className="text-muted-foreground mt-2">Intelligence in motion.</p>
        </div>

        {/* Login form card */}
        <div className="glass-card p-8 rounded-2xl animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-2xl font-semibold mb-6">Log in to your account</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium opacity-80">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/40 border-secondary input-glow h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium opacity-80">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/40 border-secondary input-glow h-11"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-300 glow-effect flex items-center justify-center group"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  "Log in to RelayOne"
                )}
              </Button>
            </div>

            <div className="text-center text-muted-foreground text-sm mt-6">
              <p>Built for founders, creators, and AI-first brands.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
