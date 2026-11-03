import type { DayPlan, MealPlan, MealSlot, MonthPlan } from "@/data/requests";
const key = (month: string) => `as-menu:plan:${month}`;
const groceryKey = (month: string) => `as-menu:checked:${month}`;

export function readPlan(month: string): MonthPlan {
  try {
    const raw = JSON.parse(localStorage.getItem(key(month)) || "{}") as Record<string, unknown>;
    const plan: MonthPlan = {};
    for (const [day, value] of Object.entries(raw)) {
      if (!value || typeof value !== "object") continue;
      const saved = value as Partial<MealPlan & Record<MealSlot, MealPlan>>;
      // Migrate the old one-meal-per-day structure without losing existing meals.
      if (typeof saved.recipeId === "string") plan[day] = { lunch: saved as MealPlan };
      else {
        const meals: DayPlan = {};
        for (const slot of ["breakfast", "lunch", "dinner"] as const) {
          const meal = saved[slot];
          if (meal && typeof meal.recipeId === "string") meals[slot] = meal;
        }
        if (Object.keys(meals).length) plan[day] = meals;
      }
    }
    return plan;
  } catch { return {}; }
}
export function writePlan(month: string, plan: MonthPlan) {
  try { localStorage.setItem(key(month), JSON.stringify(plan)); } catch { /* браузер жады қолжетімсіз болуы мүмкін */ }
}
export function readChecked(month: string): string[] {
  try { return JSON.parse(localStorage.getItem(groceryKey(month)) || "[]"); } catch { return []; }
}
export function writeChecked(month: string, ids: string[]) {
  try { localStorage.setItem(groceryKey(month), JSON.stringify(ids)); } catch { /* браузер жады қолжетімсіз болуы мүмкін */ }
}
