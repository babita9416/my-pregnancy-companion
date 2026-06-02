import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — My Pregnancy Journey" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { name } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    if (data.session) {
      toast.success("Welcome! Let's set up your journey.");
      navigate({ to: "/onboarding" });
    } else {
      toast.success("Account created. Check your email to confirm.");
      navigate({ to: "/login" });
    }
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col px-6 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Heart className="h-4 w-4 text-primary" fill="currentColor" /> My Pregnancy Journey
      </Link>
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-muted-foreground">Let's start this beautiful journey together.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <AuthField label="Your name">
            <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="auth-input" placeholder="Sarah" />
          </AuthField>
          <AuthField label="Email">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="you@example.com" />
          </AuthField>
          <AuthField label="Password">
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" placeholder="At least 6 characters" />
          </AuthField>
          <button type="submit" disabled={loading} className="h-14 w-full rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)] disabled:opacity-60">
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
      <style>{`.auth-input{width:100%;height:3.25rem;border-radius:1rem;background:var(--color-card);border:1px solid var(--color-border);padding:0 1rem;font-size:1rem;color:var(--color-foreground);outline:none}.auth-input:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px oklch(0.78 0.14 355 / .2)}`}</style>
    </div>
  );
}

function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}