import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, X, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";

const MOODS = ["😊 Happy", "😌 Calm", "😴 Tired", "🥰 Loved", "😢 Sad", "😰 Anxious", "🤢 Sick", "🤩 Excited"];

export const Route = createFileRoute("/_app/journal")({
  head: () => ({ meta: [{ title: "Journal — My Pregnancy Journey" }] }),
  component: JournalPage,
});

function JournalPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ title: "", content: "", mood: MOODS[0], entry_date: format(new Date(), "yyyy-MM-dd") });

  const { data: entries = [] } = useQuery({
    queryKey: ["journal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("journal_entries").select("*").order("entry_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((e) => e.title.toLowerCase().includes(term) || (e.content ?? "").toLowerCase().includes(term));
  }, [entries, q]);

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user!.id,
        title: form.title,
        content: form.content || null,
        mood: form.mood,
        entry_date: form.entry_date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      toast.success("Saved");
      setOpen(false);
      setForm({ ...form, title: "", content: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journal_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });

  return (
    <>
      <AppHeader title="Journal" subtitle="Your pregnancy memories" rightSlot={
        <button onClick={() => setOpen(true)} className="h-10 px-4 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground text-sm font-semibold flex items-center gap-1">
          <Plus className="h-4 w-4" /> Write
        </button>
      } />
      <div className="px-5 py-5 space-y-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search entries…" className="w-full h-12 rounded-2xl bg-secondary pl-11 pr-4 outline-none text-sm" />
        </div>

        {filtered.length === 0 ? (
          <SoftCard className="text-center py-10">
            <p className="text-sm text-muted-foreground">No entries yet — write your first memory.</p>
          </SoftCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <SoftCard key={e.id} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">{format(new Date(e.entry_date), "EEE, MMM d, yyyy")}</p>
                    <h3 className="text-base font-bold mt-0.5">{e.title}</h3>
                  </div>
                  <span className="text-lg">{e.mood?.split(" ")[0]}</span>
                </div>
                {e.content && <p className="text-sm text-foreground/80 whitespace-pre-wrap">{e.content}</p>}
                <div className="flex justify-end">
                  <button onClick={() => remove.mutate(e.id)} className="text-muted-foreground hover:text-destructive text-xs flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </SoftCard>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setOpen(false)}>
          <div className="w-full mx-auto max-w-md bg-card rounded-t-3xl p-5 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold">New entry</h3><button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
            <input placeholder="Title" maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full h-12 rounded-2xl bg-secondary px-4 outline-none" />
            <input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} className="w-full h-12 rounded-2xl bg-secondary px-4 outline-none" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mood</p>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map((m) => (
                  <button key={m} onClick={() => setForm({ ...form, mood: m })} className={`h-9 px-3 rounded-full text-xs font-medium ${form.mood === m ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{m}</button>
                ))}
              </div>
            </div>
            <textarea value={form.content} maxLength={5000} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="How are you feeling today?" className="w-full rounded-2xl bg-secondary p-3 min-h-[140px] outline-none text-sm" />
            <button disabled={!form.title || add.isPending} onClick={() => add.mutate()} className="w-full h-12 rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold disabled:opacity-60">
              {add.isPending ? "Saving…" : "Save entry"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}