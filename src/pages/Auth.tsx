import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Check your email for confirmation." });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
            {isLogin ? "Welcome Back" : "Join Luminara"}
          </h1>
          <p className="mt-2 text-sm font-body text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Create a free account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-body font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 shadow-glow"
          >
            {submitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-body text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
