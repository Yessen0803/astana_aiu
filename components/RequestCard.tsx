"use client";
import { mealSlots, type DayPlan, type Recipe } from "@/data/requests";
import AppIcon from "@/components/AppIcon";
import { formatWeekday, type Locale, t } from "@/lib/healthflow";
export default function RequestCard({ month, locale, plans, recipes, selected, onSelect }: { month: string; locale: Locale; plans: Record<string, DayPlan>; recipes: Recipe[]; selected: number; onSelect: (day: number) => void }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const days = new Date(year, monthNumber, 0).getDate();
  const offset = (new Date(year, monthNumber - 1, 1).getDay() + 6) % 7;
  const weekdays = Array.from({ length: 7 }, (_, index) => formatWeekday(new Date(2026, 0, 5 + index), locale));
  return <div className="calendar"><div className="weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">
    {Array.from({ length: offset }, (_, index) => <div className="calendar-blank" key={`blank-${index}`} />)}
    {Array.from({ length: days }, (_, index) => { const day = index + 1; const dayPlan = plans[String(day)]; const meals = mealSlots.flatMap((slot) => { const recipe = recipes.find((item) => item.id === dayPlan?.[slot.id]?.recipeId); return recipe ? [{ slot, recipe }] : []; }); const dayLabel = locale === "kk" ? `${day}-күн` : locale === "ru" ? `${day}-е число` : `Day ${day}`; const mealLabel = meals.map(({ slot, recipe }) => `${t(locale, slot.label)}: ${recipe.names?.[locale] ?? t(locale, recipe.name)}`).join(", "); return <button key={day} className={`day-cell${selected === day ? " selected" : ""}${meals.length ? " planned" : ""}`} onClick={() => onSelect(day)} aria-label={`${dayLabel}${mealLabel ? `: ${mealLabel}` : ""}`}><span className="day-number">{day}</span>{meals.length > 0 && <span className="day-meals" aria-hidden="true" title={mealLabel}>{meals.map(({ slot, recipe }) => <span key={slot.id} title={`${t(locale,slot.label)}: ${recipe.names?.[locale] ?? t(locale,recipe.name)}`}><AppIcon name={recipe.emoji}/></span>)}</span>}</button>; })}
  </div></div>;
}
