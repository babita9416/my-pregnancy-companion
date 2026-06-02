import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useProfile } from "@/lib/use-profile";
import { computePregnancyStatus, getBabyWeekInfo, formatDueDate } from "@/lib/pregnancy";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Calendar, Scale, Footprints, ListChecks, Apple, BookHeart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Home — My Pregnancy Journey" }] }),
  component: Dashboard,
});

const FEATURES = [
  { to: "/symptoms", label: "Symptoms", icon: Activity, tint: "from-rose-200 to-pink-300" },
  { to: "/weight", label: "Weight", icon: Scale, tint: "from-orange-200 to-rose-300" },
  { to: "/kicks", label: "Kicks", icon: Footprints, tint: "from-violet-200 to-pink-300" },
  { to: "/checklist", label: "Checklist", icon: ListChecks, tint: "from-emerald-200 to-teal-300" },
  { to: "/nutrition", label: "Nutrition", icon: Apple, tint: "from-amber-200 to-orange-300" },
  { to: "/journal", label: "Journal", icon: BookHeart, tint: "from-pink-200 to-rose-300" },
] as const;

function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const status = useMemo(
    () => computePregnancyStatus({ dueDate: profile?.due_date, startDate: profile?.pregnancy_start_date }),
    [profile],
  );

  const { data: nextAppt } = useQuery({
    queryKey: ["next-appt", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .gte("date_time", new Date().toISOString())
        .order("date_time", { ascending: true })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  if (!profile) return null;

  // Onboarding needed
  if (!status) {
    return (
      <>
        <AppHeader title={`Hi ${profile.name ?? "there"}`} subtitle="Let's set up your journey" />
        <div className="px-5 py-6">
          <SoftCard className="bg-[image:var(--gradient-soft)] text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-3 text-lg font-bold">Set your due date</h2>
            <p className="mt-1 text-sm text-muted-foreground">We'll personalize your weekly journey.</p>
            <Link to="/onboarding" className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] px-6 text-primary-foreground font-semibold">
              Get started
            </Link>
          </SoftCard>
        </div>
      </>
    );
  }

  const baby = getBabyWeekInfo(status.week);

  return (
    <>
      <AppHeader title={`Hi ${(profile.name ?? "mama").split(" ")[0]}`} subtitle="How are you feeling today?" />
      <div className="px-5 py-5 space-y-5">
        {/* Hero week card */}
        <SoftCard className="bg-[image:var(--gradient-hero)] border-0">
          <div className="flex items-center gap-5">
            <ProgressRing value={status.progressPct} size={130} stroke={10}>
              <div className="text-center">
                <div className="text-3xl font-bold leading-none">{status.week}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Weeks</div>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Trimester {status.trimester}</p>
              <p className="mt-2 text-2xl font-bold leading-tight">{status.daysRemaining} <span className="text-sm font-normal text-muted-foreground">days to go</span></p>
              <p className="mt-1 text-xs text-muted-foreground">Due {formatDueDate(status.dueDate)}</p>
              <p className="mt-2 text-xs font-medium text-foreground/70">{status.progressPct}% complete</p>
            </div>
          </div>
        </SoftCard>

        {/* Baby this week */}
        <Link to="/baby">
          <SoftCard className="flex items-center gap-4">
            <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-3xl shadow-[var(--shadow-soft)]">
              {baby.emoji}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">This week</p>
              <p className="text-base font-bold">Baby is the size of a {baby.size.toLowerCase()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{baby.milestone}</p>
            </div>
          </SoftCard>
        </Link>

        {/* Upcoming appt */}
        {nextAppt && (
          <Link to="/appointments">
            <SoftCard className="flex items-center gap-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Next appointment</p>
                <p className="text-sm font-bold">{nextAppt.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(nextAppt.date_time).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
              </div>
            </SoftCard>
          </Link>
        )}

        {/* Feature grid */}
        <div>
          <h2 className="px-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Track & explore</h2>
          <div className="grid grid-cols-3 gap-3">
            {FEATURES.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="group">
                <div className="aspect-square rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-card)] p-3 flex flex-col items-center justify-center text-center transition group-active:scale-95">
                  <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center text-primary-foreground shadow-[var(--shadow-soft)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="mt-2 text-xs font-semibold">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}