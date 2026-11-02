export type Ingredient = { name: string; amount: number; unit: "г" | "мл" | "дана" | "қаптама" };
export type Recipe = { id: string; name: string; emoji: string; ingredients: Ingredient[] };
export type DayPlan = { recipeId: string; servings: number };
export type MonthPlan = Record<string, DayPlan>;

// Мөлшер төрт адамға есептелген. Қажетті тізім адам санына қарай автоматты өзгереді.
export const recipes: Recipe[] = [
  { id: "pilaf", name: "Палау", emoji: "🍚", ingredients: [{ name: "Күріш", amount: 300, unit: "г" }, { name: "Ет", amount: 400, unit: "г" }, { name: "Сәбіз", amount: 2, unit: "дана" }, { name: "Пияз", amount: 1, unit: "дана" }, { name: "Май", amount: 50, unit: "мл" }] },
  { id: "soup", name: "Кеспе көже", emoji: "🍲", ingredients: [{ name: "Ет", amount: 300, unit: "г" }, { name: "Кеспе", amount: 250, unit: "г" }, { name: "Картоп", amount: 3, unit: "дана" }, { name: "Сәбіз", amount: 1, unit: "дана" }, { name: "Пияз", amount: 1, unit: "дана" }] },
  { id: "manty", name: "Манты", emoji: "🥟", ingredients: [{ name: "Ет", amount: 500, unit: "г" }, { name: "Ұн", amount: 500, unit: "г" }, { name: "Пияз", amount: 3, unit: "дана" }, { name: "Картоп", amount: 2, unit: "дана" }] },
  { id: "lagman", name: "Лағман", emoji: "🍜", ingredients: [{ name: "Ет", amount: 350, unit: "г" }, { name: "Кеспе", amount: 400, unit: "г" }, { name: "Болгар бұрышы", amount: 1, unit: "дана" }, { name: "Қызанақ", amount: 2, unit: "дана" }, { name: "Пияз", amount: 1, unit: "дана" }] },
  { id: "samsa", name: "Самса", emoji: "🥐", ingredients: [{ name: "Ұн", amount: 450, unit: "г" }, { name: "Ет", amount: 350, unit: "г" }, { name: "Пияз", amount: 2, unit: "дана" }] },
  { id: "salad", name: "Көкөніс салаты", emoji: "🥗", ingredients: [{ name: "Қызанақ", amount: 3, unit: "дана" }, { name: "Қияр", amount: 2, unit: "дана" }, { name: "Көк шөп", amount: 1, unit: "қаптама" }] },
  { id: "porridge", name: "Сұлы ботқасы", emoji: "🥣", ingredients: [{ name: "Сұлы жармасы", amount: 200, unit: "г" }, { name: "Сүт", amount: 700, unit: "мл" }, { name: "Банан", amount: 2, unit: "дана" }] },
  { id: "pasta", name: "Ет қосылған макарон", emoji: "🍝", ingredients: [{ name: "Макарон", amount: 350, unit: "г" }, { name: "Тартылған ет", amount: 300, unit: "г" }, { name: "Қызанақ", amount: 2, unit: "дана" }, { name: "Пияз", amount: 1, unit: "дана" }] },
];
