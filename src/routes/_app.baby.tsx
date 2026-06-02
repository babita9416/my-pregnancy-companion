import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useProfile } from "@/lib/use-profile";
import { computePregnancyStatus, getBabyWeekInfo } from "@/lib/pregnancy";
import { ChevronLeft, ChevronRight, Ruler, Weight } from "lucide-react";

export const Route = createFileRoute("/_app/baby")({
  head: () => ({ meta: [{ title: "Baby development — My Pregnancy Journey" }] }),
  component: BabyPage,
});

function BabyPage() {
  const { data: profile } = useProfile();
  const status = useMemo(
    () => computePregnancyStatus({ dueDate: profile?.due_date, startDate: profile?.pregnancy_start_date }),
    [profile],
  );
  const [week, setWeek] = useState<number | null>(null);
  const currentWeek = status?.week ?? 4;
  const view = week ?? currentWeek;
  const info = getBabyWeekInfo(view);

  return (
    <>
      <AppHeader title="Baby's growth" subtitle={`Week ${info.week} of 40`} />
      <div className="px-5 py-5 space-y-5">
        <SoftCard className="bg-[image:var(--gradient-soft)] text-center py-8">
          <div className="text-7xl">{info.emoji}</div>
          <p className="mt-4 text-xs uppercase tracking-wider text-primary font-semibold">Size of a</p>
          <h2 className="text-3xl font-bold mt-1">{info.size}</h2>
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-primary" />
              <span>{info.lengthCm} cm</span>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-primary" />
              <span>{info.weightG} g</span>
            </div>
          </div>
        </SoftCard>

        <SoftCard>
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">This week's milestone</p>
          <h3 className="text-lg font-bold mt-1">{info.milestone}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{info.details}</p>
        </SoftCard>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setWeek(Math.max(4, view - 1))}
            disabled={view <= 4}
            className="flex-1 h-12 rounded-2xl bg-card border border-border flex items-center justify-center gap-1 font-medium disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Week {view - 1}
          </button>
          <button
            onClick={() => setWeek(currentWeek)}
            className="h-12 rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground px-5 font-semibold"
          >
            Today
          </button>
          <button
            onClick={() => setWeek(Math.min(40, view + 1))}
            disabled={view >= 40}
            className="flex-1 h-12 rounded-2xl bg-card border border-border flex items-center justify-center gap-1 font-medium disabled:opacity-40"
          >
            Week {view + 1} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}