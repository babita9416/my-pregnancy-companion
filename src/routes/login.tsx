import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — My Pregnancy Journey" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col px-6 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Heart className="h-4 w-4 text-primary" fill="currentColor" /> My Pregnancy Journey
      </Link>
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to continue your journey.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 auth-input" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Password</span>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 auth-input" />
          </label>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="h-14 w-full rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)] disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here? <Link to="/signup" className="text-primary font-semibold">Create an account</Link>
        </p>
      </div>
      <style>{`.auth-input{width:100%;height:3.25rem;border-radius:1rem;background:var(--color-card);border:1px solid var(--color-border);padding:0 1rem;font-size:1rem;color:var(--color-foreground);outline:none}.auth-input:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px oklch(0.78 0.14 355 / .2)}`}</style>
    </div>
  );
}