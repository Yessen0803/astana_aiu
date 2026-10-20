"use client";
import type { DayPlan, Recipe } from "@/data/requests";
export default function RequestComposer({ day, plan, recipes, onChange, onRemove }: { day: number; plan?: DayPlan; recipes: Recipe[]; onChange: (plan?: DayPlan) => void; onRemove: () => void }) {
  const recipe = recipes.find((item) => item.id === plan?.recipeId);
  return <section className="editor"><div className="panel-title"><div><span className="eyebrow">Күндік мәзір</span><h2>{day}-күнге не әзірлейсің?</h2></div><span className="editor-date">🗓️</span></div>
    <label className="field-label" htmlFor="recipe-select">Тағамды таңда</label><select id="recipe-select" className="recipe-select" value={plan?.recipeId ?? ""} onChange={(event) => onChange(event.target.value ? { recipeId: event.target.value, servings: plan?.servings ?? 4 } : undefined)}><option value="">— Тағам таңдау —</option>{recipes.map((item) => <option key={item.id} value={item.id}>{item.emoji} {item.name}</option>)}</select>
    {recipe && <><div className="servings-row"><div><strong>Неше адамға?</strong><span>Мөлшер төрт адамға есептелген</span></div><div className="stepper"><button onClick={() => onChange({ ...plan!, servings: Math.max(1, plan!.servings - 1) })} aria-label="Адам санын азайту">−</button><output>{plan?.servings}</output><button onClick={() => onChange({ ...plan!, servings: Math.min(20, plan!.servings + 1) })} aria-label="Адам санын көбейту">+</button></div></div><div className="recipe-preview"><strong>{recipe.emoji} {recipe.name} құрамы</strong><ul>{recipe.ingredients.map((ingredient) => <li key={ingredient.name}><span>{ingredient.name}</span><b>{ingredient.amount} {ingredient.unit}</b></li>)}</ul><small>Көрсетілген мөлшер 4 адамға арналған.</small></div><button className="remove-meal" onClick={onRemove}>Бұл күнгі мәзірді тазалау</button></>}
    {!recipe && <p className="empty-day">Тағам таңдасаң, қажетті азық-түлік тізіміне автоматты түрде қосылады.</p>}
  </section>;
}
