import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, X, MapPin, Calendar as CalIcon } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/appointments")({
  head: () => ({ meta: [{ title: "Appointments — My Pregnancy Journey" }] }),
  component: AppointmentsPage,
});

const TYPES = ["Checkup", "Ultrasound", "Lab test", "Specialist", "Other"];

function AppointmentsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: TYPES[0],
    date_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: "",
    notes: "",
  });

  const { data = [] } = useQuery({
    queryKey: ["appointments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("date_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const upcoming = data.filter((a) => new Date(a.date_time) >= new Date());
  const past = data.filter((a) => new Date(a.date_time) < new Date()).reverse();

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("appointments").insert({
        user_id: user!.id,
        title: form.title,
        type: form.type,
        date_time: new Date(form.date_time).toISOString(),
        location: form.location || null,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["next-appt"] });
      toast.success("Added");
      setOpen(false);
      setForm({ ...form, title: "", location: "", notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });

  return (
    <>
      <AppHeader title="Appointments" subtitle={`${upcoming.length} upcoming`} rightSlot={
        <button onClick={() => setOpen(true)} className="h-10 px-4 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground text-sm font-semibold flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add
        </button>
      } />
      <div className="px-5 py-5 space-y-6">
        <section>
          <h2 className="px-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <SoftCard className="text-center py-8">
              <CalIcon className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No upcoming appointments</p>
            </SoftCard>
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => (
                <AppointmentCard key={a.id} a={a} onDelete={() => remove.mutate(a.id)} />
              ))}
            </div>
          )}
        </section>
        {past.length > 0 && (
          <section>
            <h2 className="px-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Past</h2>
            <div className="space-y-2 opacity-70">
              {past.slice(0, 10).map((a) => (
                <AppointmentCard key={a.id} a={a} onDelete={() => remove.mutate(a.id)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setOpen(false)}>
          <div className="w-full mx-auto max-w-md bg-card rounded-t-3xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">New appointment</h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <input required placeholder="Title" value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full h-12 rounded-2xl bg-secondary px-4 outline-none" />
            <div className="flex gap-2 flex-wrap">
              {TYPES.map((t) => (
                <button key={t} onClick={() => setForm({ ...form, type: t })} className={`h-9 px-3 rounded-full text-xs font-medium ${form.type === t ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {t}
                </button>
              ))}
            </div>
            <input type="datetime-local" value={form.date_time} onChange={(e) => setForm({ ...form, date_time: e.target.value })} className="w-full h-12 rounded-2xl bg-secondary px-4 outline-none" />
            <input placeholder="Location (optional)" value={form.location} maxLength={200} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full h-12 rounded-2xl bg-secondary px-4 outline-none" />
            <textarea placeholder="Notes (optional)" value={form.notes} maxLength={500} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-2xl bg-secondary p-3 min-h-[70px] outline-none" />
            <button
              disabled={add.isPending}
              onClick={() => {
                if (!form.title.trim()) {
                  toast.error("Please enter a title");
                  return;
                }
                add.mutate();
              }}
              className="w-full h-12 rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold disabled:opacity-60"
            >
              {add.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function AppointmentCard({ a, onDelete }: { a: { id: string; title: string; type: string | null; date_time: string; location: string | null; notes: string | null }; onDelete: () => void }) {
  const d = new Date(a.date_time);
  return (
    <SoftCard className="flex items-center gap-3">
      <div className="h-14 w-14 rounded-2xl bg-[image:var(--gradient-soft)] flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase font-semibold text-primary">{format(d, "MMM")}</span>
        <span className="text-xl font-bold leading-none">{format(d, "d")}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{a.title}</p>
        <p className="text-xs text-muted-foreground">{format(d, "EEEE, h:mm a")} {a.type && `• ${a.type}`}</p>
        {a.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{a.location}</p>}
      </div>
      <button onClick={onDelete} className="text-muted-foreground hover:text-destructive p-1"><X className="h-4 w-4" /></button>
    </SoftCard>
  );
}