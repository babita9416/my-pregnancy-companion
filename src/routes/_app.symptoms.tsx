import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SYMPTOM_OPTIONS } from "@/lib/pregnancy";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/symptoms")({
  head: () => ({ meta: [{ title: "Symptoms — My Pregnancy Journey" }] }),
  component: SymptomsPage,
});

function SymptomsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [symptom, setSymptom] = useState<string>(SYMPTOM_OPTIONS[0].name);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");

  const { data: logs = [] } = useQuery({
    queryKey: ["symptoms", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("symptoms")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const cat = SYMPTOM_OPTIONS.find((s) => s.name === symptom)?.category ?? null;
      const { error } = await supabase.from("symptoms").insert({
        user_id: user!.id,
        symptom_name: symptom,
        category: cat,
        severity,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["symptoms"] });
      toast.success("Logged");
      setOpen(false);
      setNotes("");
      setSeverity(5);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("symptoms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["symptoms"] }),
  });

  // Trend: last 7 days average severity by day
  const trend = (() => {
    const days: Record<string, { date: string; avg: number; count: number }> = {};
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const k = format(d, "yyyy-MM-dd");
      days[k] = { date: format(d, "EEE"), avg: 0, count: 0 };
      return k;
    });
    for (const l of logs) {
      if (days[l.date]) {
        const d = days[l.date];
        d.avg = (d.avg * d.count + l.severity) / (d.count + 1);
        d.count++;
      }
    }
    return last7.map((k) => ({ date: days[k].date, severity: +days[k].avg.toFixed(1) }));
  })();

  return (
    <>
      <AppHeader
        title="Symptoms"
        subtitle="Track how you feel"
        rightSlot={
          <button onClick={() => setOpen(true)} className="h-10 px-4 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground text-sm font-semibold flex items-center gap-1">
            <Plus className="h-4 w-4" /> Log
          </button>
        }
      />
      <div className="px-5 py-5 space-y-5">
        <SoftCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">7-day severity trend</p>
          <div className="h-36 mt-3">
            <ResponsiveContainer>
              <BarChart data={trend}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="severity" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SoftCard>

        <div>
          <h2 className="px-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">History</h2>
          {logs.length === 0 ? (
            <SoftCard className="text-center text-sm text-muted-foreground py-8">No symptoms logged yet</SoftCard>
          ) : (
            <div className="space-y-2">
              {logs.map((l) => (
                <SoftCard key={l.id} className="p-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[image:var(--gradient-soft)] flex items-center justify-center font-bold text-primary">
                    {l.severity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{l.symptom_name}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(l.date), "MMM d")} • {l.category}</p>
                    {l.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{l.notes}</p>}
                  </div>
                  <button onClick={() => remove.mutate(l.id)} className="text-muted-foreground hover:text-destructive p-1"><X className="h-4 w-4" /></button>
                </SoftCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setOpen(false)}>
          <div className="w-full mx-auto max-w-md bg-card rounded-t-3xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Log a symptom</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Symptom</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((s) => (
                  <button key={s.name} onClick={() => setSymptom(s.name)} className={`px-3 h-9 rounded-full text-xs font-medium border ${symptom === s.name ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-transparent"}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-2"><span>Severity</span><span className="text-primary font-bold">{severity}/10</span></div>
              <input type="range" min={1} max={10} value={severity} onChange={(e) => setSeverity(+e.target.value)} className="w-full accent-[var(--color-primary)]" />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              placeholder="Optional notes…"
              className="w-full rounded-2xl bg-secondary border-0 p-3 text-sm outline-none min-h-[80px]"
            />
            <button
              onClick={() => add.mutate()}
              disabled={add.isPending}
              className="w-full h-12 rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold"
            >
              {add.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}