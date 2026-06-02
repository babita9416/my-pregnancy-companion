import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Moon, Sun, BarChart3, ListChecks, Apple, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — My Pregnancy Journey" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [due, setDue] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setDue(profile.due_date ?? "");
    }
  }, [profile]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const save = useMutation({
    mutationFn: async () => {
      const start = due ? new Date(new Date(due).getTime() - 280 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : null;
      const { error } = await supabase.from("profiles").update({
        name,
        due_date: due || null,
        pregnancy_start_date: start,
      }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/login" });
  }

  return (
    <>
      <AppHeader title="Profile" subtitle="Your account & settings" />
      <div className="px-5 py-5 space-y-5">
        <SoftCard className="bg-[image:var(--gradient-soft)] text-center py-6">
          <div className="h-20 w-20 rounded-full bg-[image:var(--gradient-primary)] mx-auto flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-[var(--shadow-soft)]">
            {(profile?.name ?? "M").charAt(0).toUpperCase()}
          </div>
          <p className="mt-3 font-bold">{profile?.name ?? "Mama"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </SoftCard>

        <SoftCard className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">Pregnancy details</p>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="w-full h-11 rounded-xl bg-secondary px-3 outline-none mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Due date</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="w-full h-11 rounded-xl bg-secondary px-3 outline-none mt-1" />
          </div>
          <button onClick={() => save.mutate()} disabled={save.isPending} className="w-full h-11 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold disabled:opacity-60">
            {save.isPending ? "Saving…" : "Save changes"}
          </button>
        </SoftCard>

        <div className="space-y-2">
          <NavRow to="/analytics" icon={BarChart3} label="Analytics" />
          <NavRow to="/checklist" icon={ListChecks} label="Checklist" />
          <NavRow to="/nutrition" icon={Apple} label="Nutrition guide" />
        </div>

        <SoftCard className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <div>
              <p className="font-semibold text-sm">Dark mode</p>
              <p className="text-xs text-muted-foreground">Easier on the eyes at night</p>
            </div>
          </div>
          <button onClick={toggleTheme} className={`h-7 w-12 rounded-full transition relative ${dark ? "bg-primary" : "bg-secondary"}`}>
            <span className={`absolute top-0.5 ${dark ? "right-0.5" : "left-0.5"} h-6 w-6 rounded-full bg-card shadow transition`} />
          </button>
        </SoftCard>

        <button onClick={signOut} className="w-full h-12 rounded-2xl bg-secondary text-foreground font-semibold flex items-center justify-center gap-2">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );
}

function NavRow({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link to={to}>
      <SoftCard className="flex items-center gap-3 py-4">
        <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-soft)] flex items-center justify-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <p className="flex-1 font-semibold text-sm">{label}</p>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </SoftCard>
    </Link>
  );
}