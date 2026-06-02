import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { computePregnancyStatus } from "@/lib/pregnancy";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { ProgressRing } from "@/components/ProgressRing";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — My Pregnancy Journey" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const status = useMemo(() => computePregnancyStatus({ dueDate: profile?.due_date, startDate: profile?.pregnancy_start_date }), [profile]);

  const { data: weights = [] } = useQuery({
    queryKey: ["w-an", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("weight_logs").select("date,weight_kg").order("date")).data ?? [],
  });
  const { data: symptoms = [] } = useQuery({
    queryKey: ["s-an", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("symptoms").select("date,severity")).data ?? [],
  });
  const { data: kicks = [] } = useQuery({
    queryKey: ["k-an", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("kick_sessions").select("session_date,kick_count")).data ?? [],
  });
  const { data: apptCount = 0 } = useQuery({
    queryKey: ["a-an", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("appointments").select("id", { count: "exact", head: true })).count ?? 0,
  });

  const weightData = weights.map((w) => ({ date: format(new Date(w.date), "MMM d"), weight: +w.weight_kg }));

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const key = format(d, "yyyy-MM-dd");
    return { key, label: format(d, "d"), severity: 0, count: 0, kicks: 0 };
  });
  symptoms.forEach((s) => {
    const row = last14.find((r) => r.key === s.date);
    if (row) { row.severity = (row.severity * row.count + s.severity) / (row.count + 1); row.count++; }
  });
  kicks.forEach((k) => {
    const row = last14.find((r) => r.key === k.session_date);
    if (row) row.kicks += k.kick_count;
  });

  const totalKicks = kicks.reduce((a, k) => a + k.kick_count, 0);

  return (
    <>
      <AppHeader title="Analytics" subtitle="Your journey at a glance" />
      <div className="px-5 py-5 space-y-5">
        {status && (
          <SoftCard className="bg-[image:var(--gradient-hero)] flex items-center gap-4 border-0">
            <ProgressRing value={status.progressPct} size={90} stroke={8}>
              <span className="text-xl font-bold">{status.progressPct}%</span>
            </ProgressRing>
            <div>
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Pregnancy progress</p>
              <p className="text-base font-bold mt-1">Week {status.week} • T{status.trimester}</p>
              <p className="text-xs text-muted-foreground">{status.daysRemaining} days remaining</p>
            </div>
          </SoftCard>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Kicks" value={totalKicks} />
          <Stat label="Symptoms" value={symptoms.length} />
          <Stat label="Appointments" value={apptCount} />
        </div>

        <SoftCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Weight trend</p>
          {weightData.length < 2 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Log at least 2 weights</p>
          ) : (
            <div className="h-44">
              <ResponsiveContainer>
                <LineChart data={weightData}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11 }} width={32} domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </SoftCard>

        <SoftCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">14-day symptom severity</p>
          <div className="h-36">
            <ResponsiveContainer>
              <BarChart data={last14.map((d) => ({ ...d, severity: +d.severity.toFixed(1) }))}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} style={{ fontSize: 10 }} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="severity" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SoftCard>

        <SoftCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">14-day kicks</p>
          <div className="h-36">
            <ResponsiveContainer>
              <BarChart data={last14}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} style={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="kicks" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SoftCard>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <SoftCard className="text-center py-4">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-semibold">{label}</p>
    </SoftCard>
  );
}