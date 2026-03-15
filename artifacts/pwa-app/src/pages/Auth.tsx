import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSignup, useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FlagTriangleRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMut = useLogin();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMut.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Welcome back!" });
        setLocation("/");
      },
      onError: (err: any) => {
        toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
      }
    });
  };

  return <AuthLayout mode="login" form={form} setForm={setForm} onSubmit={onSubmit} isPending={loginMut.isPending} />;
}

export function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const signupMut = useSignup();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ email: "", password: "", displayName: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMut.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Account created!", description: "Please check your email to verify." });
        setLocation("/");
      },
      onError: (err: any) => {
        toast({ title: "Signup failed", description: err.message || "Could not create account", variant: "destructive" });
      }
    });
  };

  return <AuthLayout mode="signup" form={form} setForm={setForm} onSubmit={onSubmit} isPending={signupMut.isPending} />;
}

function AuthLayout({ mode, form, setForm, onSubmit, isPending }: any) {
  const isLogin = mode === 'login';
  
  return (
    <div className="min-h-screen flex w-full relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-card/90 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl shadow-black/5">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <FlagTriangleRight className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-display font-extrabold text-center tracking-tight mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {isLogin ? 'Enter your details to sign in.' : 'Join the FlagIt community.'}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Display Name</label>
                <input 
                  required
                  type="text" 
                  value={form.displayName}
                  onChange={e => setForm({...form, displayName: e.target.value})}
                  className="w-full p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Anonymous User 123"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email address</label>
              <input 
                required
                type="email" 
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <input 
                required
                type="password" 
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            
            <Button type="submit" className="w-full h-12 text-lg font-bold mt-6 shadow-md" disabled={isPending}>
              {isPending ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>{' '}
            <Link href={isLogin ? "/signup" : "/login"} className="text-primary font-semibold hover:underline">
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
