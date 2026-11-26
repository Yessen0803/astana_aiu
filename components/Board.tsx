"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import CategoryFilters from "@/components/CategoryFilters";
import AppIcon from "@/components/AppIcon";
import RequestCard from "@/components/RequestCard";
import RequestComposer from "@/components/RequestComposer";
import { mealSlots, recipes, type MealPlan, type MealSlot, type MonthPlan } from "@/data/requests";
import { readChecked, readPlan, writeChecked, writePlan } from "@/lib/storage";
import { t, type Locale } from "@/lib/healthflow";

export default function Board({ locale, onMealPlanned, onPlanChange }: { locale: Locale; onMealPlanned?: (meal: { name: string; slot: MealSlot; day: number; month: string }) => void; onPlanChange?: (plan: { date: string; slot: MealSlot; meal?: MealPlan }) => void }) {
  const [month, setMonth] = useState("2026-10");
  const [day, setDay] = useState(1);
  const [plans, setPlans] = useState<MonthPlan>({});
  const [checked, setChecked] = useState<string[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  useEffect(() => { const now = new Date(); const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; setMonth(current); setDay(now.getDate()); setPlans(readPlan(current)); setChecked(readChecked(current)); const savedGoal = Number(localStorage.getItem("as-menu:kcal-target")); if (Number.isFinite(savedGoal) && savedGoal >= 500 && savedGoal <= 6000) setCalorieGoal(savedGoal); }, []);
  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/meal-plan?month=${encodeURIComponent(month)}`, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json() as { meals?: Array<{ plan_date: string; meal_slot: MealSlot; recipe_id: string; servings: number }> };
      if (cancelled) return;
      const local = readPlan(month);
      const remote: MonthPlan = {};
      for (const item of result.meals || []) {
        const date = new Date(`${item.plan_date}T00:00:00`);
        if (!Number.isFinite(date.getTime()) || !mealSlots.some((slot) => slot.id === item.meal_slot) || !recipes.some((recipe) => recipe.id === item.recipe_id)) continue;
        const dayKey = String(date.getDate());
        remote[dayKey] = { ...(remote[dayKey] || {}), [item.meal_slot]: { recipeId: item.recipe_id, servings: item.servings } };
      }
      const merged: MonthPlan = { ...local };
      for (const [dayKey, meals] of Object.entries(remote)) merged[dayKey] = { ...(merged[dayKey] || {}), ...meals };
      setPlans(merged);
      writePlan(month, merged);
      for (const [dayKey, meals] of Object.entries(local)) {
        for (const slot of mealSlots) {
          const meal = meals[slot.id];
          if (meal && !remote[dayKey]?.[slot.id]) onPlanChange?.({ date: `${month}-${String(dayKey).padStart(2, "0")}`, slot: slot.id, meal });
        }
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [month, onPlanChange]);
  function changeMonth(value: string) { setMonth(value); setDay(1); setPlans(readPlan(value)); setChecked(readChecked(value)); }
  function setMeal(slot: MealSlot, meal?: MealPlan) {
    const previousMealId = plans[String(day)]?.[slot]?.recipeId;
    if (meal && meal.recipeId !== previousMealId) {
      const recipe = recipes.find((item) => item.id === meal.recipeId);
      if (recipe) onMealPlanned?.({ name: recipe.names?.[locale] ?? t(locale, recipe.name), slot, day, month });
    }
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
    onPlanChange?.({ date: `${month}-${String(day).padStart(2, "0")}`, slot, meal });
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
  const selectedKcal = mealSlots.reduce((total, slot) => { const plan = plans[String(day)]?.[slot.id]; const recipe = recipes.find((item) => item.id === plan?.recipeId); return total + (recipe ? recipe.kcalPerServing * (plan?.servings || 1) : 0); }, 0);
  const plannedKcal = Object.values(plans).reduce((total, dayPlan) => total + mealSlots.reduce((dayTotal, slot) => { const plan = dayPlan[slot.id]; const recipe = recipes.find((item) => item.id === plan?.recipeId); return dayTotal + (recipe ? recipe.kcalPerServing * (plan?.servings || 1) : 0); }, 0), 0);
  function changeCalorieGoal(value: number) { const clean = Math.max(500, Math.min(6000, Math.round(value || 0))); setCalorieGoal(clean); try { localStorage.setItem("as-menu:kcal-target", String(clean)); } catch {} }
  const checkedCount = groceries.filter((item) => checked.includes(item.id)).length;
  const plannedText = locale === "kk" ? `${plannedMeals} ас жоспарланған` : locale === "ru" ? `Запланировано приёмов пищи: ${plannedMeals}` : `${plannedMeals} meals planned`;
  const checkedText = locale === "kk" ? "алынды" : locale === "ru" ? "куплено" : "purchased";
  return <section className="planner"><div className="section-heading"><div><span className="eyebrow">{t(locale,"One month, one plan")}</span><h1>{t(locale,"Monthly meal menu")}</h1><p>{t(locale,"Plan your daily meals. Your shopping list is calculated automatically.")}</p></div><div className="month-badge"><AppIcon name="food"/> {t(locale,"Plan a month")}</div></div>
    <CategoryFilters month={month} locale={locale} onChange={changeMonth} />
    <div className="overview"><div className="overview-icon"><AppIcon name="bowl"/></div><div><strong>{plannedText}</strong><span>{t(locale,"The shopping list updates when you add a meal.")}</span></div><div className="overview-dots"><i/><i/><i/><i/><i/></div></div>
    <section className="calorie-summary"><div><span className="eyebrow">{t(locale,"Selected day calories")}</span><strong>{selectedKcal.toLocaleString()} <small>kcal</small></strong><p>{selectedKcal > calorieGoal ? t(locale,"Above your daily target") : t(locale,"Planned calories for this day")}</p></div><div className="calorie-meter"><span><i style={{ width: `${Math.min(100, selectedKcal / calorieGoal * 100)}%` }}/></span><small>{selectedKcal.toLocaleString()} / {calorieGoal.toLocaleString()} kcal · {t(locale,"Month total")}: {plannedKcal.toLocaleString()} kcal</small></div><label>{t(locale,"Daily calorie target")}<input type="number" min={500} max={6000} step={50} value={calorieGoal} onChange={(event) => changeCalorieGoal(Number(event.target.value))}/></label></section>
    <div className="planner-layout"><div className="left-column"><section className="calendar-panel"><div className="panel-title"><div><span className="eyebrow">{t(locale,"Calendar")}</span><h2>{t(locale,"Daily menu")}</h2></div><span className="calendar-hint">{t(locale,"Choose a day and select a meal")}</span></div><RequestCard month={month} locale={locale} plans={plans} recipes={recipes} selected={day} onSelect={setDay} /><div className="legend"><span><i className="legend-selected"/> {t(locale,"Selected day")}</span><span><i className="legend-planned"/> {t(locale,"Meal planned")}</span></div></section>{mealSlots.map((slot) => <RequestComposer key={slot.id} locale={locale} day={day} slot={slot} plan={plans[String(day)]?.[slot.id]} recipes={recipes} onChange={(meal) => setMeal(slot.id, meal)} onRemove={() => setMeal(slot.id)} />)}</div>
    <aside className="grocery-panel"><div className="panel-title"><div><span className="eyebrow">{t(locale,"Monthly list")}</span><h2>{t(locale,"Shopping list")}</h2></div><span className="list-icon"><AppIcon name="shopping"/></span></div><p className="grocery-sub">{t(locale,"For all planned meals")}</p>{groceries.length ? <><div className="grocery-progress"><span>{checkedCount} / {groceries.length} {checkedText}</span><div><i style={{ width: `${groceries.length ? Math.min(100, checkedCount / groceries.length * 100) : 0}%` }}/></div></div><ul className="grocery-list">{groceries.map((item) => <li key={item.id} className={checked.includes(item.id) ? "bought" : ""}><label><input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggleGrocery(item.id)} /><span>{t(locale,item.name)}</span></label><b>{formatAmount(item.amount, item.unit)}</b></li>)}</ul><p className="grocery-note"><AppIcon name="check"/> {t(locale,"Same ingredients are combined into total amounts.")}</p></> : <div className="grocery-empty"><span><AppIcon name="shopping"/></span><strong>{t(locale,"Your list is empty")}</strong><p>{t(locale,"Choose a day and plan a meal to see its ingredients here.")}</p></div>}</aside></div>
    <p className="storage-note"><AppIcon name="lock"/> {locale === "kk" ? "Мәзір осы құрылғыда сақталады және Supabase аккаунтына кіргенде синхрондалады." : locale === "ru" ? "Меню сохраняется на устройстве и синхронизируется с Supabase после входа в аккаунт." : "The menu is saved on this device and syncs with Supabase when signed in."}</p>
  </section>;
}

