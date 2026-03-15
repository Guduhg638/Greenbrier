import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Search, UserPlus, TrendingUp } from "lucide-react";
import { useGetFeed } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/SharedUI";
import { motion } from "framer-motion";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: feedData, isLoading } = useGetFeed({
    query: {
      queryKey: ["/api/feed"] // Explicitly set queryKey to match Orval output
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden text-white shadow-2xl" style={{background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)"}}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%), radial-gradient(circle at 60% 80%, #06b6d4 0%, transparent 40%)"}} />
        </div>
        
        <div className="relative z-10 px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-6">
              Who are you dealing with?
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl">
              FlagIt is the anonymous, trustworthy community for leaving real reviews about the people in your life. Protect others. Stay safe.
            </p>

            <form onSubmit={handleSearch} className="w-full max-w-xl relative flex items-center">
              <Search className="absolute left-4 w-6 h-6 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pl-14 pr-32 rounded-2xl bg-white text-foreground text-lg shadow-lg border-2 border-transparent focus:border-primary focus:outline-none transition-all"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="absolute right-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6"
              >
                Search
              </Button>
            </form>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/50">
              <span>Can't find someone?</span>
              <Link href="/person/new" className="text-blue-300 hover:text-blue-200 font-medium underline inline-flex items-center gap-1">
                <UserPlus className="w-4 h-4" /> Add them
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feed Section */}
      <section className="max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-8 border-b border-border pb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Recent Activity</h2>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : feedData?.items?.length ? (
          <div className="grid gap-6">
            {feedData.items.map((item, idx) => (
              <motion.div
                key={item.review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ReviewCard review={item.review} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground shadow-sm">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">Be the first to share your experience.</p>
          </div>
        )}
      </section>
    </div>
  );
}
