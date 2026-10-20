"use client";
import { useEffect, useMemo, useState } from "react";
import CategoryFilters from "@/components/CategoryFilters";
import RequestCard from "@/components/RequestCard";
import RequestComposer from "@/components/RequestComposer";
import { recipes, type MonthPlan } from "@/data/requests";
import { readChecked, readPlan, writeChecked, writePlan } from "@/lib/storage";

export default function Board() {
  const [month, setMonth] = useState("2026-10");
  const [day, setDay] = useState(1);
  const [plans, setPlans] = useState<MonthPlan>({});
  const [checked, setChecked] = useState<string[]>([]);
  useEffect(() => { const now = new Date(); const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; setMonth(current); setPlans(readPlan(current)); setChecked(readChecked(current)); }, []);
  function changeMonth(value: string) { setMonth(value); setDay(1); setPlans(readPlan(value)); setChecked(readChecked(value)); }
  function setMeal(plan?: MonthPlan[string]) { setPlans((current) => { const next = { ...current }; if (plan) next[String(day)] = plan; else delete next[String(day)]; writePlan(month, next); return next; }); }
  const groceries = useMemo(() => {
    const amounts = new Map<string, { name: string; unit: string; amount: number }>();
    Object.values(plans).forEach((plan) => { const recipe = recipes.find((item) => item.id === plan.recipeId); if (!recipe) return; recipe.ingredients.forEach((ingredient) => { const id = `${ingredient.name.toLocaleLowerCase("kk")}|${ingredient.unit}`; const item = amounts.get(id) ?? { name: ingredient.name, unit: ingredient.unit, amount: 0 }; item.amount += ingredient.amount * plan.servings / 4; amounts.set(id, item); }); });
    return [...amounts.entries()].map(([id, item]) => ({ id, ...item })).sort((a, b) => a.name.localeCompare(b.name, "kk"));
  }, [plans]);
  function toggleGrocery(id: string) { setChecked((current) => { const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]; writeChecked(month, next); return next; }); }
  function formatAmount(amount: number, unit: string) { const clean = Math.round(amount * 10) / 10; if (unit === "г" && clean >= 1000) return `${Math.round(clean / 100) / 10} кг`; if (unit === "мл" && clean >= 1000) return `${Math.round(clean / 100) / 10} л`; return `${clean} ${unit}`; }
  const plannedDays = Object.keys(plans).length;
  const checkedCount = groceries.filter((item) => checked.includes(item.id)).length;
  return <section className="planner"><div className="section-heading"><div><span className="eyebrow">Бір айға — бір жоспар</span><h1>Айлық ас мәзірі</h1><p>Күнделікті асыңды жоспарла. Алатын азық-түлігіңді автоматты есепте.</p></div><div className="month-badge">🥕 Бір айға жоспарла</div></div>
    <CategoryFilters month={month} onChange={changeMonth} />
    <div className="overview"><div className="overview-icon">🍲</div><div><strong>{plannedDays} күнге ас жоспарланған</strong><span>Мәзірге тағам қосқан сайын азық-түлік тізімі жаңарады.</span></div><div className="overview-dots"><i/><i/><i/><i/><i/></div></div>
    <div className="planner-layout"><div className="left-column"><section className="calendar-panel"><div className="panel-title"><div><span className="eyebrow">Күнтізбе</span><h2>Күнделікті мәзір</h2></div><span className="calendar-hint">Күнді басып, ас таңда</span></div><RequestCard month={month} plans={plans} recipes={recipes} selected={day} onSelect={setDay} /><div className="legend"><span><i className="legend-selected"/> Таңдалған күн</span><span><i className="legend-planned"/> Мәзірі бар күн</span></div></section><RequestComposer day={day} plan={plans[String(day)]} recipes={recipes} onChange={setMeal} onRemove={() => setMeal()} /></div>
    <aside className="grocery-panel"><div className="panel-title"><div><span className="eyebrow">Айлық тізім</span><h2>Сатып алатын азық-түлік</h2></div><span className="list-icon">🛒</span></div><p className="grocery-sub">Барлық жоспарланған тағамға есептелген</p>{groceries.length ? <><div className="grocery-progress"><span>{checkedCount} / {groceries.length} алынды</span><div><i style={{ width: `${groceries.length ? Math.min(100, checkedCount / groceries.length * 100) : 0}%` }}/></div></div><ul className="grocery-list">{groceries.map((item) => <li key={item.id} className={checked.includes(item.id) ? "bought" : ""}><label><input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggleGrocery(item.id)} /><span>{item.name}</span></label><b>{formatAmount(item.amount, item.unit)}</b></li>)}</ul><p className="grocery-note">☝️ Бірдей азық-түлік біріктіріліп, жалпы мөлшері көрсетіледі.</p></> : <div className="grocery-empty"><span>🧺</span><strong>Тізім әзірге бос</strong><p>Күнтізбеден күн таңдап, тағам жоспарласаң — керекті азық-түлік осында жиналады.</p></div>}</aside></div>
    <p className="storage-note">🔒 Мәзірің осы құрылғыдағы браузерде сақталады.</p>
  </section>;
}

