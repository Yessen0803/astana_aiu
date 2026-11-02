"use client";
import type { DayPlan, Recipe } from "@/data/requests";
const weekdayNames = ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"];
export default function RequestCard({ month, plans, recipes, selected, onSelect }: { month: string; plans: Record<string, DayPlan>; recipes: Recipe[]; selected: number; onSelect: (day: number) => void }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const days = new Date(year, monthNumber, 0).getDate();
  const offset = (new Date(year, monthNumber - 1, 1).getDay() + 6) % 7;
  return <div className="calendar"><div className="weekdays">{weekdayNames.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">
    {Array.from({ length: offset }, (_, index) => <div className="calendar-blank" key={`blank-${index}`} />)}
    {Array.from({ length: days }, (_, index) => { const day = index + 1; const recipe = recipes.find((item) => item.id === plans[String(day)]?.recipeId); return <button key={day} className={`day-cell${selected === day ? " selected" : ""}${recipe ? " planned" : ""}`} onClick={() => onSelect(day)} aria-label={`${day}-күн${recipe ? `: ${recipe.name}` : ""}`}><span className="day-number">{day}</span>{recipe && <span className="day-meal"><span>{recipe.emoji}</span><span className="day-meal-name">{recipe.name}</span></span>}</button>; })}
  </div></div>;
}
