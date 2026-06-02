import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { addWeeks, format } from "date-fns";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your journey — My Pregnancy Journey" }] }),
  component: Onboarding,
});

function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"due" | "lmp">("due");
  const [date, setDate] = useState(format(addWeeks(new Date(), 20), "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const payload =
      mode === "due"
        ? { due_date: date, pregnancy_start_date: format(addWeeks(new Date(date), -40), "yyyy-MM-dd") }
        : { pregnancy_start_date: date, due_date: format(addWeeks(new Date(date), 40), "yyyy-MM-dd") };
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("All set! Welcome to your journey.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Heart className="h-4 w-4 text-primary" fill="currentColor" /> My Pregnancy Journey
      </div>
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold">When are you due?</h1>
        <p className="mt-2 text-muted-foreground">We'll calculate your week and personalize your journey.</p>

        <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
          {(["due", "lmp"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`h-11 rounded-xl text-sm font-medium transition ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {m === "due" ? "Due date" : "Last period"}
            </button>
          ))}
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-foreground/80">
            {mode === "due" ? "Estimated due date" : "First day of last period"}
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full h-14 rounded-2xl bg-card border border-border px-4 outline-none"
          />
        </label>

        <button
          onClick={save}
          disabled={saving}
          className="mt-8 h-14 w-full rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Begin journey"}
        </button>
      </div>
    </div>
  );
}