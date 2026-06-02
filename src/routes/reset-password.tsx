import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — My Pregnancy Journey" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col px-6 py-10">
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
        <h1 className="text-3xl font-bold">Set a new password</h1>
        <form onSubmit={handle} className="mt-8 space-y-4">
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full h-14 rounded-2xl bg-card border border-border px-4 outline-none" />
          <button disabled={loading} className="h-14 w-full rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold disabled:opacity-60">
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}