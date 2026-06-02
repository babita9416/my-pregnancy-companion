import { differenceInDays, addWeeks, format } from "date-fns";

export const PREGNANCY_DURATION_DAYS = 280; // 40 weeks

export interface PregnancyStatus {
  week: number;
  day: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  progressPct: number;
  dueDate: Date;
  startDate: Date;
}

export function computePregnancyStatus(input: {
  dueDate?: string | null;
  startDate?: string | null;
}): PregnancyStatus | null {
  let due: Date | null = null;
  let start: Date | null = null;

  if (input.dueDate) {
    due = new Date(input.dueDate);
    start = addWeeks(due, -40);
  } else if (input.startDate) {
    start = new Date(input.startDate);
    due = addWeeks(start, 40);
  }

  if (!due || !start) return null;

  const today = new Date();
  const elapsedDays = Math.max(0, Math.min(PREGNANCY_DURATION_DAYS, differenceInDays(today, start)));
  const week = Math.min(40, Math.floor(elapsedDays / 7));
  const day = elapsedDays % 7;
  const trimester: 1 | 2 | 3 = week < 13 ? 1 : week < 27 ? 2 : 3;
  const daysRemaining = Math.max(0, differenceInDays(due, today));
  const progressPct = Math.min(100, Math.round((elapsedDays / PREGNANCY_DURATION_DAYS) * 100));

  return { week, day, trimester, daysRemaining, progressPct, dueDate: due, startDate: start };
}

export function formatDueDate(date: Date) {
  return format(date, "MMM d, yyyy");
}

export interface BabyWeekInfo {
  week: number;
  size: string; // fruit/object comparison
  emoji: string;
  lengthCm: number;
  weightG: number;
  milestone: string;
  details: string;
}

const WEEK_DATA: Record<number, Omit<BabyWeekInfo, "week">> = {
  4: { size: "Poppy seed", emoji: "🌱", lengthCm: 0.1, weightG: 0.04, milestone: "Implantation complete", details: "Baby is a tiny ball of cells called a blastocyst, busily implanting into the uterine wall." },
  5: { size: "Sesame seed", emoji: "🌰", lengthCm: 0.2, weightG: 0.05, milestone: "Heart begins forming", details: "The neural tube is forming and the heart starts as a simple tube." },
  6: { size: "Lentil", emoji: "🫘", lengthCm: 0.4, weightG: 0.1, milestone: "Heartbeat detectable", details: "Baby's tiny heart now beats around 110 times per minute." },
  7: { size: "Blueberry", emoji: "🫐", lengthCm: 1, weightG: 0.5, milestone: "Limb buds appear", details: "Arms, legs, eyes, and tiny features are beginning to form." },
  8: { size: "Raspberry", emoji: "🍇", lengthCm: 1.6, weightG: 1, milestone: "Tiny fingers form", details: "Webbed fingers and toes are visible. Baby is starting to move, though you can't feel it yet." },
  9: { size: "Cherry", emoji: "🍒", lengthCm: 2.3, weightG: 2, milestone: "Now a fetus", details: "Embryonic tail is gone. Essential body parts are in place." },
  10: { size: "Strawberry", emoji: "🍓", lengthCm: 3.1, weightG: 4, milestone: "Vital organs working", details: "Kidneys, intestines, brain, and liver are all functioning." },
  11: { size: "Lime", emoji: "🟢", lengthCm: 4.1, weightG: 7, milestone: "Tooth buds form", details: "Tiny tooth buds and nail beds are appearing." },
  12: { size: "Plum", emoji: "🍑", lengthCm: 5.4, weightG: 14, milestone: "Reflexes developing", details: "Baby can now open and close their fingers and curl their toes." },
  13: { size: "Peach", emoji: "🍑", lengthCm: 7.4, weightG: 23, milestone: "Vocal cords forming", details: "Welcome to the second trimester! Fingerprints are forming." },
  14: { size: "Lemon", emoji: "🍋", lengthCm: 8.7, weightG: 43, milestone: "Facial expressions", details: "Baby can squint, frown, and grimace." },
  15: { size: "Apple", emoji: "🍎", lengthCm: 10.1, weightG: 70, milestone: "Hearing develops", details: "Baby's bones are getting harder and they can sense light." },
  16: { size: "Avocado", emoji: "🥑", lengthCm: 11.6, weightG: 100, milestone: "First kicks", details: "You might start feeling fluttery movements soon." },
  17: { size: "Pear", emoji: "🍐", lengthCm: 13, weightG: 140, milestone: "Building fat", details: "Baby is starting to build fat to keep warm after birth." },
  18: { size: "Bell pepper", emoji: "🫑", lengthCm: 14.2, weightG: 190, milestone: "Yawning & hiccups", details: "Baby is hearing your heartbeat and your voice." },
  19: { size: "Mango", emoji: "🥭", lengthCm: 15.3, weightG: 240, milestone: "Vernix coating", details: "A waxy coating protects baby's skin in the amniotic fluid." },
  20: { size: "Banana", emoji: "🍌", lengthCm: 16.4, weightG: 300, milestone: "Halfway there!", details: "Time for your anatomy scan — and you may learn the sex." },
  21: { size: "Carrot", emoji: "🥕", lengthCm: 26.7, weightG: 360, milestone: "Tasting flavors", details: "Baby is swallowing amniotic fluid and tasting what you eat." },
  22: { size: "Spaghetti squash", emoji: "🎃", lengthCm: 27.8, weightG: 430, milestone: "Sleep cycles", details: "Baby now has regular periods of sleep and wakefulness." },
  23: { size: "Large mango", emoji: "🥭", lengthCm: 28.9, weightG: 500, milestone: "Hearing voices", details: "Baby can hear loud noises and your voice clearly." },
  24: { size: "Ear of corn", emoji: "🌽", lengthCm: 30, weightG: 600, milestone: "Viability milestone", details: "Lungs are developing surfactant. Baby has a real chance at survival if born now." },
  25: { size: "Rutabaga", emoji: "🥔", lengthCm: 34.6, weightG: 660, milestone: "Responding to touch", details: "Baby responds to your touch on your belly." },
  26: { size: "Scallion", emoji: "🧅", lengthCm: 35.6, weightG: 760, milestone: "Eyes opening", details: "Baby's eyes are beginning to open." },
  27: { size: "Cauliflower", emoji: "🥦", lengthCm: 36.6, weightG: 875, milestone: "Brain activity", details: "Welcome to the third trimester! Brain is very active." },
  28: { size: "Eggplant", emoji: "🍆", lengthCm: 37.6, weightG: 1000, milestone: "Dreaming begins", details: "Baby might be dreaming — REM sleep is happening." },
  29: { size: "Butternut squash", emoji: "🎃", lengthCm: 38.6, weightG: 1150, milestone: "Bones hardening", details: "Bones are fully formed but still soft and pliable." },
  30: { size: "Cabbage", emoji: "🥬", lengthCm: 39.9, weightG: 1300, milestone: "Hair growing", details: "Baby's hair is growing thicker." },
  31: { size: "Coconut", emoji: "🥥", lengthCm: 41.1, weightG: 1500, milestone: "Five senses active", details: "All five senses are now working." },
  32: { size: "Jicama", emoji: "🥔", lengthCm: 42.4, weightG: 1700, milestone: "Practicing breathing", details: "Baby is practicing breathing movements." },
  33: { size: "Pineapple", emoji: "🍍", lengthCm: 43.7, weightG: 1900, milestone: "Recognizing sounds", details: "Baby can recognize familiar songs and voices." },
  34: { size: "Cantaloupe", emoji: "🍈", lengthCm: 45, weightG: 2150, milestone: "Lungs almost ready", details: "Central nervous system and lungs continue maturing." },
  35: { size: "Honeydew", emoji: "🍈", lengthCm: 46.2, weightG: 2400, milestone: "Filling out", details: "Baby is plumping up and filling out." },
  36: { size: "Romaine lettuce", emoji: "🥬", lengthCm: 47.4, weightG: 2600, milestone: "Heading down", details: "Baby is likely settling into head-down position." },
  37: { size: "Swiss chard", emoji: "🥬", lengthCm: 48.6, weightG: 2860, milestone: "Early term", details: "Baby is considered early term — practicing breathing and sucking." },
  38: { size: "Leek", emoji: "🌿", lengthCm: 49.8, weightG: 3080, milestone: "Lanugo shedding", details: "The fine hair (lanugo) is mostly gone now." },
  39: { size: "Mini watermelon", emoji: "🍉", lengthCm: 50.7, weightG: 3290, milestone: "Full term", details: "Baby is full term and ready whenever they decide." },
  40: { size: "Pumpkin", emoji: "🎃", lengthCm: 51.2, weightG: 3460, milestone: "Due date!", details: "You're at the finish line. Baby could arrive any day now." },
};

export function getBabyWeekInfo(week: number): BabyWeekInfo {
  const clamped = Math.max(4, Math.min(40, week));
  const data = WEEK_DATA[clamped] ?? WEEK_DATA[4];
  return { week: clamped, ...data };
}

export const SYMPTOM_OPTIONS = [
  { name: "Nausea", category: "Digestive" },
  { name: "Fatigue", category: "General" },
  { name: "Back pain", category: "Pain" },
  { name: "Headache", category: "Pain" },
  { name: "Swelling", category: "Circulation" },
  { name: "Cramping", category: "Pain" },
  { name: "Mood changes", category: "Emotional" },
  { name: "Heartburn", category: "Digestive" },
  { name: "Dizziness", category: "General" },
  { name: "Insomnia", category: "Sleep" },
] as const;

export const MOODS = ["😊 Happy", "😌 Calm", "🥰 Loved", "😴 Tired", "😟 Anxious", "😢 Sad", "🤩 Excited", "😤 Frustrated"];

export function recommendedWeightGainKg(week: number, prePregnancyBmi: number | null): { min: number; max: number } {
  // IOM guidelines for total weight gain
  let totalMin = 11.5;
  let totalMax = 16;
  if (prePregnancyBmi != null) {
    if (prePregnancyBmi < 18.5) { totalMin = 12.5; totalMax = 18; }
    else if (prePregnancyBmi < 25) { totalMin = 11.5; totalMax = 16; }
    else if (prePregnancyBmi < 30) { totalMin = 7; totalMax = 11.5; }
    else { totalMin = 5; totalMax = 9; }
  }
  // First trimester ~1-2 kg, then linear through wk 40
  const baselineFirstTri = 1.5;
  if (week <= 13) {
    const pct = week / 13;
    return { min: pct * baselineFirstTri * 0.8, max: pct * baselineFirstTri * 1.2 };
  }
  const remainingWeeks = week - 13;
  const totalRemainingWeeks = 27;
  const pct = remainingWeeks / totalRemainingWeeks;
  return {
    min: +(baselineFirstTri + (totalMin - baselineFirstTri) * pct).toFixed(1),
    max: +(baselineFirstTri + (totalMax - baselineFirstTri) * pct).toFixed(1),
  };
}