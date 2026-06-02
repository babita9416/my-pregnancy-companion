import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SoftCard } from "@/components/SoftCard";
import { useProfile } from "@/lib/use-profile";
import { computePregnancyStatus } from "@/lib/pregnancy";
import { Droplet, Minus, Plus, Check, X } from "lucide-react";

export const Route = createFileRoute("/_app/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition — My Pregnancy Journey" }] }),
  component: NutritionPage,
});

const TRIMESTER_GUIDE: Record<1 | 2 | 3, { focus: string; tip: string; recommended: string[]; avoid: string[]; meals: { name: string; items: string[] }[] }> = {
  1: {
    focus: "Folate, B6 & hydration",
    tip: "Eat small frequent meals to ease nausea. Folate is critical for neural tube development.",
    recommended: ["Leafy greens", "Lentils & beans", "Fortified cereals", "Eggs", "Citrus fruits", "Ginger tea"],
    avoid: ["Raw fish & sushi", "Unpasteurized dairy", "Deli meats", "Alcohol", "High-mercury fish", "Excess caffeine"],
    meals: [
      { name: "Breakfast", items: ["Oatmeal w/ berries", "Boiled egg", "Ginger tea"] },
      { name: "Lunch", items: ["Lentil soup", "Whole-grain toast", "Orange slices"] },
      { name: "Dinner", items: ["Grilled chicken", "Quinoa salad", "Steamed broccoli"] },
    ],
  },
  2: {
    focus: "Iron, calcium & protein",
    tip: "Baby's growth accelerates — add ~340 extra kcal/day with nutrient-dense foods.",
    recommended: ["Lean red meat", "Greek yogurt", "Salmon (cooked)", "Sweet potatoes", "Almonds", "Spinach"],
    avoid: ["Raw eggs", "Soft cheeses (unpasteurized)", "Liver in excess", "Energy drinks", "Smoked seafood", "Alcohol"],
    meals: [
      { name: "Breakfast", items: ["Greek yogurt parfait", "Walnuts", "Banana"] },
      { name: "Lunch", items: ["Salmon bowl", "Brown rice", "Avocado"] },
      { name: "Dinner", items: ["Beef stir-fry", "Sweet potato", "Spinach salad"] },
    ],
  },
  3: {
    focus: "Omega-3, fiber & calcium",
    tip: "Add ~450 extra kcal/day. Smaller meals help with heartburn as baby grows.",
    recommended: ["Fatty fish (cooked)", "Chia seeds", "Cheese & milk", "Whole grains", "Berries", "Beans"],
    avoid: ["High-sodium foods", "Sugary drinks", "Raw seafood", "Unpasteurized juice", "Alcohol", "Excess caffeine"],
    meals: [
      { name: "Breakfast", items: ["Chia pudding", "Mixed berries", "Whole-grain toast"] },
      { name: "Lunch", items: ["Bean burrito bowl", "Avocado", "Cheese"] },
      { name: "Dinner", items: ["Baked salmon", "Roasted veggies", "Quinoa"] },
    ],
  },
};

function NutritionPage() {
  const { data: profile } = useProfile();
  const status = useMemo(() => computePregnancyStatus({ dueDate: profile?.due_date, startDate: profile?.pregnancy_start_date }), [profile]);
  const tri = (status?.trimester ?? 1) as 1 | 2 | 3;
  const guide = TRIMESTER_GUIDE[tri];

  // Local-storage water tracker (per-day)
  const todayKey = `water-${new Date().toISOString().slice(0, 10)}`;
  const [glasses, setGlasses] = useState(0);
  const goal = 8;

  useEffect(() => {
    const v = localStorage.getItem(todayKey);
    if (v) setGlasses(parseInt(v, 10));
  }, [todayKey]);
  useEffect(() => { localStorage.setItem(todayKey, String(glasses)); }, [glasses, todayKey]);

  return (
    <>
      <AppHeader title="Nutrition" subtitle={`Trimester ${tri} guidance`} />
      <div className="px-5 py-5 space-y-5">
        <SoftCard className="bg-[image:var(--gradient-soft)]">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">This trimester</p>
          <p className="text-lg font-bold mt-1">{guide.focus}</p>
          <p className="text-sm text-muted-foreground mt-1">{guide.tip}</p>
        </SoftCard>

        <SoftCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Water today</p>
              <p className="text-2xl font-bold mt-1">{glasses} <span className="text-sm font-normal text-muted-foreground">/ {goal} glasses</span></p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setGlasses((g) => Math.max(0, g - 1))} className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center"><Minus className="h-4 w-4" /></button>
              <button onClick={() => setGlasses((g) => g + 1)} className="h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground flex items-center justify-center"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-8 gap-1.5">
            {Array.from({ length: goal }).map((_, i) => (
              <div key={i} className={`h-10 rounded-lg flex items-center justify-center ${i < glasses ? "bg-[image:var(--gradient-primary)] text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <Droplet className="h-4 w-4" />
              </div>
            ))}
          </div>
        </SoftCard>

        <div className="grid grid-cols-2 gap-3">
          <SoftCard className="p-4">
            <p className="text-xs uppercase tracking-wider text-emerald-600 font-bold flex items-center gap-1"><Check className="h-3 w-3" /> Recommended</p>
            <ul className="mt-2 space-y-1.5">
              {guide.recommended.map((f) => <li key={f} className="text-xs text-foreground/80">• {f}</li>)}
            </ul>
          </SoftCard>
          <SoftCard className="p-4">
            <p className="text-xs uppercase tracking-wider text-rose-600 font-bold flex items-center gap-1"><X className="h-3 w-3" /> Avoid</p>
            <ul className="mt-2 space-y-1.5">
              {guide.avoid.map((f) => <li key={f} className="text-xs text-foreground/80">• {f}</li>)}
            </ul>
          </SoftCard>
        </div>

        <div>
          <h2 className="px-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sample meal plan</h2>
          <div className="space-y-2">
            {guide.meals.map((m) => (
              <SoftCard key={m.name} className="py-3">
                <p className="text-xs uppercase tracking-wider text-primary font-semibold">{m.name}</p>
                <p className="text-sm mt-1">{m.items.join(" • ")}</p>
              </SoftCard>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}