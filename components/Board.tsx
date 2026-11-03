"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import CategoryFilters from "@/components/CategoryFilters";
import RequestCard from "@/components/RequestCard";
import RequestComposer from "@/components/RequestComposer";
import { mealSlots, recipes, type MealPlan, type MealSlot, type MonthPlan } from "@/data/requests";
import { readChecked, readPlan, writeChecked, writePlan } from "@/lib/storage";
import { t, type Locale } from "@/lib/healthflow";

export default function Board({ locale }: { locale: Locale }) {
  const [month, setMonth] = useState("2026-10");
  const [day, setDay] = useState(1);
  const [plans, setPlans] = useState<MonthPlan>({});
  const [checked, setChecked] = useState<string[]>([]);
  useEffect(() => { const now = new Date(); const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; setMonth(current); setDay(now.getDate()); setPlans(readPlan(current)); setChecked(readChecked(current)); }, []);
  function changeMonth(value: string) { setMonth(value); setDay(1); setPlans(readPlan(value)); setChecked(readChecked(value)); }
  function setMeal(slot: MealSlot, meal?: MealPlan) {
    setPlans((current) => {
      const next = { ...current };
      const dayPlan = { ...(next[String(day)] || {}) };
      if (meal) dayPlan[slot] = meal;
      else delete dayPlan[slot];
      if (Object.keys(dayPlan).length) next[String(day)] = dayPlan;
      else delete next[String(day)];
      writePlan(month, next);
      return next;
    });
  }
  const groceries = useMemo(() => {
    const amounts = new Map<string, { name: string; unit: string; amount: number }>();
    Object.values(plans).forEach((dayPlan) => mealSlots.forEach(({ id: slot }) => {
      const plan = dayPlan[slot];
      const recipe = recipes.find((item) => item.id === plan?.recipeId);
      if (!recipe || !plan) return;
      recipe.ingredients.forEach((ingredient) => { const id = `${ingredient.name.toLocaleLowerCase("kk")}|${ingredient.unit}`; const item = amounts.get(id) ?? { name: ingredient.name, unit: ingredient.unit, amount: 0 }; item.amount += ingredient.amount * plan.servings / 4; amounts.set(id, item); });
    }));
    return [...amounts.entries()].map(([id, item]) => ({ id, ...item })).sort((a, b) => a.name.localeCompare(b.name, "kk"));
  }, [plans]);
  function toggleGrocery(id: string) { setChecked((current) => { const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]; writeChecked(month, next); return next; }); }
  function formatAmount(amount: number, unit: string) {
    const clean = Math.round(amount * 10) / 10;
    const grams = locale === "en" ? "g" : "г", kilograms = "кг", milliliters = locale === "en" ? "ml" : "мл", liters = locale === "en" ? "l" : "л";
    if (unit === "г" && clean >= 1000) return `${Math.round(clean / 100) / 10} ${kilograms}`;
    if (unit === "мл" && clean >= 1000) return `${Math.round(clean / 100) / 10} ${liters}`;
    const unitText = unit === "г" ? grams : unit === "мл" ? milliliters : unit === "дана" ? locale === "kk" ? "дана" : locale === "ru" ? "шт." : "pcs" : unit === "қаптама" ? locale === "kk" ? "қаптама" : locale === "ru" ? "уп." : "pack" : unit;
    return `${clean} ${unitText}`;
  }
  const plannedMeals = Object.values(plans).reduce((total, dayPlan) => total + mealSlots.filter(({ id: slot }) => dayPlan[slot]).length, 0);
  const checkedCount = groceries.filter((item) => checked.includes(item.id)).length;
  const plannedText = locale === "kk" ? `${plannedMeals} ас жоспарланған` : locale === "ru" ? `Запланировано приёмов пищи: ${plannedMeals}` : `${plannedMeals} meals planned`;
  const checkedText = locale === "kk" ? "алынды" : locale === "ru" ? "куплено" : "purchased";
  return <section className="planner"><div className="section-heading"><div><span className="eyebrow">{t(locale,"One month, one plan")}</span><h1>{t(locale,"Monthly meal menu")}</h1><p>{t(locale,"Plan your daily meals. Your shopping list is calculated automatically.")}</p></div><div className="month-badge">🥕 {t(locale,"Plan a month")}</div></div>
    <CategoryFilters month={month} locale={locale} onChange={changeMonth} />
    <div className="overview"><div className="overview-icon">🍲</div><div><strong>{plannedText}</strong><span>{t(locale,"The shopping list updates when you add a meal.")}</span></div><div className="overview-dots"><i/><i/><i/><i/><i/></div></div>
    <div className="planner-layout"><div className="left-column"><section className="calendar-panel"><div className="panel-title"><div><span className="eyebrow">{t(locale,"Calendar")}</span><h2>{t(locale,"Daily menu")}</h2></div><span className="calendar-hint">{t(locale,"Choose a day and select a meal")}</span></div><RequestCard month={month} locale={locale} plans={plans} recipes={recipes} selected={day} onSelect={setDay} /><div className="legend"><span><i className="legend-selected"/> {t(locale,"Selected day")}</span><span><i className="legend-planned"/> {t(locale,"Meal planned")}</span></div></section>{mealSlots.map((slot) => <RequestComposer key={slot.id} locale={locale} day={day} slot={slot} plan={plans[String(day)]?.[slot.id]} recipes={recipes} onChange={(meal) => setMeal(slot.id, meal)} onRemove={() => setMeal(slot.id)} />)}</div>
    <aside className="grocery-panel"><div className="panel-title"><div><span className="eyebrow">{t(locale,"Monthly list")}</span><h2>{t(locale,"Shopping list")}</h2></div><span className="list-icon">🛒</span></div><p className="grocery-sub">{t(locale,"For all planned meals")}</p>{groceries.length ? <><div className="grocery-progress"><span>{checkedCount} / {groceries.length} {checkedText}</span><div><i style={{ width: `${groceries.length ? Math.min(100, checkedCount / groceries.length * 100) : 0}%` }}/></div></div><ul className="grocery-list">{groceries.map((item) => <li key={item.id} className={checked.includes(item.id) ? "bought" : ""}><label><input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggleGrocery(item.id)} /><span>{t(locale,item.name)}</span></label><b>{formatAmount(item.amount, item.unit)}</b></li>)}</ul><p className="grocery-note">☝️ {t(locale,"Same ingredients are combined into total amounts.")}</p></> : <div className="grocery-empty"><span>🧺</span><strong>{t(locale,"Your list is empty")}</strong><p>{t(locale,"Choose a day and plan a meal to see its ingredients here.")}</p></div>}</aside></div>
    <p className="storage-note">🔒 {t(locale,"Your menu is saved in this browser on this device.")}</p>
  </section>;
}

