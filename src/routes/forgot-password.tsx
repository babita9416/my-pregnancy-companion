import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — My Pregnancy Journey" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Check your email for the reset link.");
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col px-6 py-10">
      <Link to="/login" className="text-sm text-muted-foreground">← Back to sign in</Link>
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
        <h1 className="text-3xl font-bold">Reset your password</h1>
        <p className="mt-2 text-muted-foreground">We'll email you a link to set a new one.</p>
        {sent ? (
          <div className="mt-8 rounded-3xl bg-card border border-border p-5 text-sm">
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </div>
        ) : (
          <form onSubmit={handle} className="mt-8 space-y-4">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-14 rounded-2xl bg-card border border-border px-4 outline-none" />
            <button disabled={loading} className="h-14 w-full rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold disabled:opacity-60">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}