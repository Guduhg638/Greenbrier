import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import InstallGate from "@/components/InstallGate";

const queryClient = new QueryClient();

function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <div className="w-16 h-16 bg-black rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4L20 12H12L16 4Z" fill="white" />
            <rect x="8" y="14" width="16" height="3" rx="1.5" fill="white" />
            <rect x="8" y="20" width="16" height="3" rx="1.5" fill="white" />
            <rect x="8" y="26" width="10" height="3" rx="1.5" fill="white" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome!</h1>
        <p className="mt-2 text-sm text-gray-500">You're running the app from your home screen.</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <InstallGate>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </InstallGate>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
