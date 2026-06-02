import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/checklist")({
  head: () => ({ meta: [{ title: "Checklist — My Pregnancy Journey" }] }),
  component: ChecklistPage,
});

function ChecklistPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tri, setTri] = useState<1 | 2 | 3>(1);
  const [newTask, setNewTask] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["checklist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("checklist_items").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("checklist_items").update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist"] }),
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("checklist_items").insert({
        user_id: user!.id, trimester: tri, task: newTask, is_custom: true,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["checklist"] }); setNewTask(""); toast.success("Added"); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist"] }),
  });

  const triItems = items.filter((i) => i.trimester === tri);
  const done = triItems.filter((i) => i.completed).length;
  const pct = triItems.length ? Math.round((done / triItems.length) * 100) : 0;

  return (
    <>
      <AppHeader title="Checklist" subtitle="Tasks for your trimester" />
      <div className="px-5 py-5 space-y-5">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-secondary p-1">
          {([1, 2, 3] as const).map((t) => (
            <button key={t} onClick={() => setTri(t)} className={`h-10 rounded-xl text-sm font-semibold transition ${tri === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              Trimester {t}
            </button>
          ))}
        </div>

        <SoftCard className="bg-[image:var(--gradient-soft)]">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Trimester {tri} progress</p>
            <p className="font-bold text-primary">{done}/{triItems.length}</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-card overflow-hidden">
            <div className="h-full bg-[image:var(--gradient-primary)] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </SoftCard>

        <div className="space-y-2">
          {triItems.map((i) => (
            <SoftCard key={i.id} className="flex items-center gap-3 py-3">
              <button onClick={() => toggle.mutate({ id: i.id, completed: !i.completed })} className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition ${i.completed ? "bg-[image:var(--gradient-primary)] border-transparent" : "border-border"}`}>
                {i.completed && <Check className="h-4 w-4 text-primary-foreground" />}
              </button>
              <p className={`flex-1 text-sm ${i.completed ? "line-through text-muted-foreground" : "font-medium"}`}>{i.task}</p>
              {i.is_custom && (
                <button onClick={() => remove.mutate(i.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
              )}
            </SoftCard>
          ))}
        </div>

        <SoftCard className="flex items-center gap-2 p-3">
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)} maxLength={120} placeholder={`Add task to T${tri}…`} className="flex-1 h-10 rounded-xl bg-secondary px-3 outline-none text-sm" />
          <button disabled={!newTask} onClick={() => add.mutate()} className="h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground flex items-center justify-center disabled:opacity-50"><Plus className="h-5 w-5" /></button>
        </SoftCard>
      </div>
    </>
  );
}