import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Footprints, Square } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/kicks")({
  head: () => ({ meta: [{ title: "Kick counter — My Pregnancy Journey" }] }),
  component: KicksPage,
});

function KicksPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const { data: sessions = [] } = useQuery({
    queryKey: ["kicks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("kick_sessions").select("*").order("started_at", { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const startedAt = new Date(startRef.current!).toISOString();
      const { error } = await supabase.from("kick_sessions").insert({
        user_id: user!.id,
        started_at: startedAt,
        ended_at: new Date().toISOString(),
        kick_count: count,
        duration_seconds: elapsed,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kicks"] });
      toast.success(`Session saved: ${count} kicks in ${formatDur(elapsed)}`);
      setActive(false); setCount(0); setElapsed(0); startRef.current = null;
    },
  });

  function start() {
    startRef.current = Date.now();
    setActive(true); setCount(0); setElapsed(0);
  }

  const weekTotal = sessions
    .filter((s) => new Date(s.started_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
    .reduce((acc, s) => acc + s.kick_count, 0);

  return (
    <>
      <AppHeader title="Kick counter" subtitle={`${weekTotal} kicks this week`} />
      <div className="px-5 py-5 space-y-5">
        <SoftCard className="bg-[image:var(--gradient-soft)] text-center py-10">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">Current session</p>
          <p className="text-7xl font-bold mt-2 tabular-nums">{count}</p>
          <p className="text-sm text-muted-foreground mt-1">{formatDur(elapsed)}</p>

          {active ? (
            <>
              <button
                onClick={() => setCount((c) => c + 1)}
                className="mt-6 h-32 w-32 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground text-xl font-bold shadow-[var(--shadow-glow)] active:scale-95 transition"
              >
                Tap
              </button>
              <div className="mt-5 flex gap-2 justify-center">
                <button onClick={() => save.mutate()} disabled={save.isPending || count === 0} className="h-11 px-5 rounded-2xl bg-card border border-border font-semibold flex items-center gap-2 disabled:opacity-60">
                  <Square className="h-4 w-4" /> End & save
                </button>
              </div>
            </>
          ) : (
            <button onClick={start} className="mt-6 h-14 px-8 rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)] inline-flex items-center gap-2">
              <Footprints className="h-5 w-5" /> Start session
            </button>
          )}
        </SoftCard>

        <div>
          <h2 className="px-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent sessions</h2>
          {sessions.length === 0 ? (
            <SoftCard className="text-center text-sm text-muted-foreground py-6">No sessions yet</SoftCard>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <SoftCard key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold">{s.kick_count} kicks</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(s.started_at), "MMM d, h:mm a")} • {formatDur(s.duration_seconds ?? 0)}</p>
                  </div>
                  <Footprints className="h-5 w-5 text-primary" />
                </SoftCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function formatDur(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}