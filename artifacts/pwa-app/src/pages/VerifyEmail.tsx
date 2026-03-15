import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { useVerifyEmail, useResendVerification } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export default function VerifyEmail() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");
  
  const [, setLocation] = useLocation();
  const { isAuthenticated, isVerified, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const verifyMut = useVerifyEmail();
  const resendMut = useResendVerification();
  
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isVerified) {
      setLocation("/");
      return;
    }

    if (token && status === 'idle') {
      setStatus('verifying');
      verifyMut.mutate({ data: { token } }, {
        onSuccess: () => {
          setStatus('success');
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setTimeout(() => setLocation("/"), 2000);
        },
        onError: (err: any) => {
          setStatus('error');
          setErrorMsg(err.message || "Invalid or expired token.");
        }
      });
    }
  }, [token, isVerified, status, verifyMut, queryClient, setLocation]);

  const handleResend = () => {
    resendMut.mutate(undefined, {
      onSuccess: () => toast({ title: "Sent!", description: "Check your inbox for the new link." }),
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  if (!isAuthenticated) {
    return <div className="text-center py-20 font-bold">Please log in first to verify your email.</div>;
  }

  return (
    <div className="max-w-md mx-auto pt-20">
      <div className="bg-card rounded-3xl p-8 border border-border shadow-lg text-center">
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-bold font-display">Verifying...</h2>
            <p className="text-muted-foreground mt-2">Please wait while we confirm your email.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-20 h-20 text-success mb-6" />
            <h2 className="text-2xl font-bold font-display text-success">Verified!</h2>
            <p className="text-muted-foreground mt-2">Your email has been successfully verified. Redirecting...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <AlertCircle className="w-20 h-20 text-destructive mb-6" />
            <h2 className="text-2xl font-bold font-display text-destructive">Verification Failed</h2>
            <p className="text-muted-foreground mt-2 mb-6">{errorMsg}</p>
            <Button onClick={handleResend} variant="outline" disabled={resendMut.isPending}>
              {resendMut.isPending ? "Sending..." : "Request new link"}
            </Button>
          </div>
        )}

        {status === 'idle' && !token && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-display">Check your email</h2>
            <p className="text-muted-foreground mt-2 mb-8">
              We sent a verification link to <strong>{user?.email}</strong>. 
              You need to verify your email before you can post reviews.
            </p>
            <Button 
              size="lg" 
              className="w-full rounded-xl" 
              onClick={handleResend}
              disabled={resendMut.isPending}
            >
              {resendMut.isPending ? "Sending..." : "Resend Verification Email"}
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
