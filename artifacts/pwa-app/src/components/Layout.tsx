import { Link, useLocation } from "wouter";
import { Shield, Search, Menu, User, LogOut, FlagTriangleRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isVerified, isMod, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Verification Banner */}
      {isAuthenticated && !isVerified && (
        <div className="bg-amber-100/80 border-b border-amber-200 text-amber-900 px-4 py-3 text-sm flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-amber-600" />
          <span>Please verify your email to leave reviews.</span>
          <Link href="/verify-email" className="font-semibold underline ml-1 hover:text-amber-700">
            Verify Now
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md shadow-primary/20">
              <FlagTriangleRight className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">FlagIt</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search people..."
                className="pl-9 pr-4 py-2 rounded-full bg-secondary/50 border-transparent focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/20 w-64 transition-all text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setLocation(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                  }
                }}
              />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {isMod && (
                  <Link href="/mod">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Shield className="w-4 h-4 mr-2" /> Mod Panel
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold">{user?.displayName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {isVerified ? (
                        <><CheckCircle2 className="w-3 h-3 text-success" /> Verified</>
                      ) : (
                        "Unverified"
                      )}
                    </span>
                  </div>
                  <Button variant="outline" size="icon" className="rounded-full" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button className="font-medium shadow-md shadow-primary/10 rounded-full px-6">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-border/50 overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search people..."
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setLocation(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                />
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{user?.displayName}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                    {isVerified && <Badge variant="outline" className="text-success border-success/30 bg-success/5"><CheckCircle2 className="w-3 h-3 mr-1"/> Verified</Badge>}
                  </div>
                  {isMod && (
                    <Link href="/mod">
                      <Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                        <Shield className="w-4 h-4 mr-2" /> Mod Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button variant="destructive" className="w-full justify-start" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Link href="/login">
                    <Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>Create Account</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/50 bg-white/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FlagTriangleRight className="w-4 h-4" />
            <span className="font-display font-bold">FlagIt</span>
            <span className="text-sm">© {new Date().getFullYear()}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            A safe space for honest community reviews.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: any) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", 
      variant === "default" && "bg-primary text-primary-foreground",
      variant === "outline" && "border border-input text-foreground",
      className
    )}>
      {children}
    </span>
  );
}

import { cn } from "@/lib/utils";
