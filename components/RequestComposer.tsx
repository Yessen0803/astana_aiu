"use client";
import type { MealPlan, MealSlot, Recipe } from "@/data/requests";
import { t, type Locale } from "@/lib/healthflow";
export default function RequestComposer({ locale, day, slot, plan, recipes, onChange, onRemove }: { locale: Locale; day: number; slot: { id: MealSlot; label: string; icon: string }; plan?: MealPlan; recipes: Recipe[]; onChange: (plan?: MealPlan) => void; onRemove: () => void }) {
  const recipe = recipes.find((item) => item.id === plan?.recipeId);
  const choices = recipes.filter((item) => item.slot === slot.id);
  const selectId = `recipe-select-${slot.id}`;
  const dayTitle = locale === "kk" ? `${day}-күнге не әзірлейсің?` : locale === "ru" ? `Что приготовить на ${day}-е число?` : `What will you make on day ${day}?`;
  return <section className="editor meal-slot-editor"><div className="panel-title"><div><span className="eyebrow">{slot.icon} {t(locale,slot.label)}</span><h2>{dayTitle}</h2></div><span className="editor-date">🗓️</span></div>
    <label className="field-label" htmlFor={selectId}>{t(locale,"Choose a meal")}</label><select id={selectId} className="recipe-select" value={plan?.recipeId ?? ""} onChange={(event) => onChange(event.target.value ? { recipeId: event.target.value, servings: plan?.servings ?? 1 } : undefined)}><option value="">— {t(locale,"Select a meal")} —</option>{choices.map((item) => <option key={item.id} value={item.id}>{item.emoji} {item.names?.[locale] ?? t(locale,item.name)} · {item.kcalPerServing} kcal</option>)}</select>
    {recipe && <><div className="servings-row"><div><strong>{t(locale,"Servings")}</strong><span>{t(locale,"Amount and calories update by serving count")}</span></div><div className="stepper"><button onClick={() => onChange({ ...plan!, servings: Math.max(1, plan!.servings - 1) })} aria-label={t(locale,"Decrease servings")}>−</button><output>{plan?.servings}</output><button onClick={() => onChange({ ...plan!, servings: Math.min(20, plan!.servings + 1) })} aria-label={t(locale,"Increase servings")}>+</button></div></div><div className="recipe-preview"><strong>{recipe.emoji} {recipe.names?.[locale] ?? t(locale,recipe.name)} · {recipe.kcalPerServing * (plan?.servings || 1)} kcal · {t(locale,"Ingredients")}</strong><ul>{recipe.ingredients.map((ingredient) => <li key={ingredient.name}><span>{t(locale,ingredient.name)}</span><b>{Math.round(ingredient.amount * (plan?.servings || 1) / 4 * 10) / 10} {ingredient.unit}</b></li>)}</ul><small>{t(locale,"Approximate calories; ingredient amounts scale with servings.")}</small></div><button className="remove-meal" onClick={onRemove}>{t(locale,"Clear this day’s meal")}</button></>}
    {!recipe && <p className="empty-day">{t(locale,"Choose a meal to add its ingredients to your shopping list automatically.")}</p>}
  </section>;
}
