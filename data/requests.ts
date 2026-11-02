export type Ingredient = { name: string; amount: number; unit: "г" | "мл" | "дана" | "қаптама" };
export type Recipe = { id: string; name: string; emoji: string; ingredients: Ingredient[] };
export type MealSlot = "breakfast" | "lunch" | "dinner";
export type MealPlan = { recipeId: string; servings: number };
export type DayPlan = Partial<Record<MealSlot, MealPlan>>;
export type MonthPlan = Record<string, DayPlan>;

export const mealSlots: { id: MealSlot; label: string; icon: string }[] = [
  { id: "breakfast", label: "Breakfast", icon: "🌅" },
  { id: "lunch", label: "Lunch", icon: "☀️" },
  { id: "dinner", label: "Dinner", icon: "🌙" },
];

// Мөлшер төрт адамға есептелген. Қажетті тізім адам санына қарай автоматты өзгереді.
export const recipes: Recipe[] = [
  { id: "pilaf", name: "Майсыз күріш пен тауық еті", emoji: "🍚", ingredients: [{ name: "Қоңыр күріш", amount: 280, unit: "г" }, { name: "Тауықтың төс еті", amount: 400, unit: "г" }, { name: "Брокколи", amount: 180, unit: "г" }, { name: "Сәбіз", amount: 1, unit: "дана" }] },
  { id: "soup", name: "Жасымық пен көкөніс сорпасы", emoji: "🍲", ingredients: [{ name: "Жасымық", amount: 240, unit: "г" }, { name: "Қызанақ", amount: 2, unit: "дана" }, { name: "Сәбіз", amount: 1, unit: "дана" }, { name: "Пияз", amount: 1, unit: "дана" }, { name: "Шпинат", amount: 1, unit: "қаптама" }] },
  { id: "manty", name: "Майсыз тауық котлеті мен көкөніс", emoji: "🍗", ingredients: [{ name: "Тауықтың төс еті", amount: 400, unit: "г" }, { name: "Сұлы жармасы", amount: 60, unit: "г" }, { name: "Брокколи", amount: 200, unit: "г" }, { name: "Йогурт", amount: 100, unit: "мл" }] },
  { id: "lagman", name: "Тауық пен көкөніс бұқтырмасы", emoji: "🥘", ingredients: [{ name: "Тауықтың төс еті", amount: 350, unit: "г" }, { name: "Кәді", amount: 1, unit: "дана" }, { name: "Болгар бұрышы", amount: 1, unit: "дана" }, { name: "Қызанақ", amount: 2, unit: "дана" }, { name: "Пияз", amount: 1, unit: "дана" }] },
  { id: "samsa", name: "Ноқат пен авокадо салаты", emoji: "🥑", ingredients: [{ name: "Ноқат", amount: 250, unit: "г" }, { name: "Авокадо", amount: 1, unit: "дана" }, { name: "Қияр", amount: 1, unit: "дана" }, { name: "Қызанақ", amount: 2, unit: "дана" }, { name: "Көк шөп", amount: 1, unit: "қаптама" }] },
  { id: "salad", name: "Көкөніс салаты", emoji: "🥗", ingredients: [{ name: "Қызанақ", amount: 3, unit: "дана" }, { name: "Қияр", amount: 2, unit: "дана" }, { name: "Көк шөп", amount: 1, unit: "қаптама" }] },
  { id: "porridge", name: "Сұлы ботқасы", emoji: "🥣", ingredients: [{ name: "Сұлы жармасы", amount: 200, unit: "г" }, { name: "Сүт", amount: 700, unit: "мл" }, { name: "Банан", amount: 2, unit: "дана" }] },
  { id: "pasta", name: "Қарақұмық пен тауық еті", emoji: "🍛", ingredients: [{ name: "Қарақұмық", amount: 250, unit: "г" }, { name: "Тауықтың төс еті", amount: 350, unit: "г" }, { name: "Саңырауқұлақ", amount: 150, unit: "г" }, { name: "Пияз", amount: 1, unit: "дана" }] },
  { id: "yogurt-bowl", name: "Йогурт, жидек және сұлы боулы", emoji: "🫐", ingredients: [{ name: "Йогурт", amount: 220, unit: "г" }, { name: "Жидек", amount: 120, unit: "г" }, { name: "Сұлы жармасы", amount: 40, unit: "г" }, { name: "Банан", amount: 1, unit: "дана" }] },
  { id: "quinoa-chicken", name: "Киноа мен тауық боулы", emoji: "🥙", ingredients: [{ name: "Киноа", amount: 220, unit: "г" }, { name: "Тауықтың төс еті", amount: 350, unit: "г" }, { name: "Брокколи", amount: 150, unit: "г" }, { name: "Қияр", amount: 1, unit: "дана" }] },
  { id: "salmon-veg", name: "Албырт пен көкөніс", emoji: "🐟", ingredients: [{ name: "Албырт", amount: 350, unit: "г" }, { name: "Брокколи", amount: 200, unit: "г" }, { name: "Кәді", amount: 1, unit: "дана" }, { name: "Лимон", amount: 1, unit: "дана" }] },
  { id: "lentil-salad", name: "Жасымық пен көкөніс салаты", emoji: "🥬", ingredients: [{ name: "Жасымық", amount: 200, unit: "г" }, { name: "Қияр", amount: 1, unit: "дана" }, { name: "Қызанақ", amount: 2, unit: "дана" }, { name: "Шпинат", amount: 1, unit: "қаптама" }] },
];
