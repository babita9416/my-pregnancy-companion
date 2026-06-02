import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { computePregnancyStatus, recommendedWeightGainKg } from "@/lib/pregnancy";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_app/weight")({
  head: () => ({ meta: [{ title: "Weight tracker — My Pregnancy Journey" }] }),
  component: WeightPage,
});

function WeightPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [bmiOpen, setBmiOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [height, setHeight] = useState("");
  const [prePregWeight, setPrePregWeight] = useState("");

  const status = useMemo(
    () => computePregnancyStatus({ dueDate: profile?.due_date, startDate: profile?.pregnancy_start_date }),
    [profile],
  );

  const { data: logs = [] } = useQuery({
    queryKey: ["weights", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("weight_logs").select("*").order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("weight_logs").insert({
        user_id: user!.id,
        weight_kg: +weight,
        date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weights"] });
      toast.success("Recorded");
      setOpen(false); setWeight("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const chartData = logs.map((l) => ({ date: format(new Date(l.date), "MMM d"), weight: +l.weight_kg }));
  const latest = logs[logs.length - 1];
  const first = logs[0];
  const gained = latest && first ? +(latest.weight_kg - first.weight_kg).toFixed(1) : 0;

  const range = status ? recommendedWeightGainKg(status.week, null) : null;

  const bmi = (() => {
    const h = +height, w = +prePregWeight;
    if (!h || !w) return null;
    return +(w / Math.pow(h / 100, 2)).toFixed(1);
  })();

  return (
    <>
      <AppHeader title="Weight" subtitle="Healthy gain matters" rightSlot={
        <button onClick={() => setOpen(true)} className="h-10 px-4 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground text-sm font-semibold flex items-center gap-1">
          <Plus className="h-4 w-4" /> Log
        </button>
      } />
      <div className="px-5 py-5 space-y-5">
        <SoftCard className="bg-[image:var(--gradient-soft)]">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Current weight</p>
              <p className="text-3xl font-bold mt-1">{latest ? `${latest.weight_kg} kg` : "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gained</p>
              <p className="text-2xl font-bold text-primary mt-1">{gained > 0 ? "+" : ""}{gained} kg</p>
            </div>
          </div>
          {range && (
            <p className="mt-3 text-xs text-muted-foreground">Recommended at week {status?.week}: {range.min}–{range.max} kg</p>
          )}
        </SoftCard>

        <SoftCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Trend</p>
          {chartData.length < 2 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Log at least 2 weights to see your trend</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} style={{ fontSize: 11 }} width={32} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-primary)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </SoftCard>

        <SoftCard>
          <button onClick={() => setBmiOpen((v) => !v)} className="w-full text-left">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">BMI calculator</p>
            <p className="text-sm text-muted-foreground mt-0.5">Calculate your pre-pregnancy BMI {bmiOpen ? "▲" : "▼"}</p>
          </button>
          {bmiOpen && (
            <div className="mt-4 space-y-3">
              <input placeholder="Height (cm)" value={height} type="number" onChange={(e) => setHeight(e.target.value)} className="w-full h-11 rounded-xl bg-secondary px-3 outline-none" />
              <input placeholder="Pre-pregnancy weight (kg)" value={prePregWeight} type="number" onChange={(e) => setPrePregWeight(e.target.value)} className="w-full h-11 rounded-xl bg-secondary px-3 outline-none" />
              {bmi && (
                <div className="bg-[image:var(--gradient-soft)] rounded-2xl p-4 text-center">
                  <p className="text-3xl font-bold">{bmi}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"}
                  </p>
                </div>
              )}
            </div>
          )}
        </SoftCard>

        <div>
          <h2 className="px-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">History</h2>
          {logs.length === 0 ? (
            <SoftCard className="text-center text-sm text-muted-foreground py-6">No entries yet</SoftCard>
          ) : (
            <div className="space-y-2">
              {[...logs].reverse().map((l) => (
                <SoftCard key={l.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold">{l.weight_kg} kg</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(l.date), "EEE, MMM d, yyyy")}</p>
                  </div>
                </SoftCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setOpen(false)}>
          <div className="w-full mx-auto max-w-md bg-card rounded-t-3xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Log weight</h3><button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
            <input type="number" step="0.1" placeholder="Weight in kg" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full h-12 rounded-2xl bg-secondary px-4 outline-none" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-12 rounded-2xl bg-secondary px-4 outline-none" />
            <button disabled={!weight || add.isPending} onClick={() => add.mutate()} className="w-full h-12 rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold disabled:opacity-60">
              {add.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}