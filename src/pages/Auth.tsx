import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Train } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { toast } = useToast();

  if (loading) return null;
  if (user) return <Navigate to="/simulator/family" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a confirmation link." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We sent you a password reset link." });
      setShowReset(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (showReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto">
              <Train className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold font-display text-foreground">Reset Password</h1>
          </div>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={submitting}>Send Reset Link</Button>
            <button type="button" onClick={() => setShowReset(false)} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
              Back to login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <Train className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold font-display text-foreground">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Sign up to save your journeys" : "Sign in to your Travel Hub"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Input placeholder="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          )}
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Please wait…" : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
          {!isSignUp && (
            <button onClick={() => setShowReset(true)} className="text-muted-foreground hover:text-foreground">
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
