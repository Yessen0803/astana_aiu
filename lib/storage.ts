import type { MonthPlan } from "@/data/requests";
const key = (month: string) => `as-menu:plan:${month}`;
const groceryKey = (month: string) => `as-menu:checked:${month}`;

export function readPlan(month: string): MonthPlan {
  try { return JSON.parse(localStorage.getItem(key(month)) || "{}"); } catch { return {}; }
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
