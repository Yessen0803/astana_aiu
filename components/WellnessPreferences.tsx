"use client";

import { useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/healthflow";

type ActivityLevel = "light" | "moderate" | "active";
type WellnessSettings = {
  goals: string[];
  activityLevel: ActivityLevel;
  vegetarian: boolean;
  lactoseFree: boolean;
  allergies: string;
};

const STORAGE_KEY = "hf:wellness-settings";
const DEFAULT_SNAPSHOT = JSON.stringify({
  goals: [], activityLevel: "moderate", vegetarian: false, lactoseFree: false, allergies: "",
});
const defaults: WellnessSettings = {
  goals: [],
  activityLevel: "moderate",
  vegetarian: false,
  lactoseFree: false,
  allergies: "",
};

const copy = {
  kk: {
    eyebrow: "ЖЕКЕ БАПТАУ",
    title: "Мақсаттар мен қалаулар",
    intro: "Өзіңе маңызды әдеттер мен тағам шектеулерін таңда. Бұл мәліметтер осы браузерде сақталады.",
    goals: "Негізгі мақсаттар",
    goalOptions: ["Көбірек қозғалу", "Теңгерімді тамақтану", "Ұйқы режимін реттеу", "Су ішуді бақылау", "Күтім әдетін қалыптастыру"],
    level: "Белсенділік деңгейі",
    levels: { light: "Жеңіл", moderate: "Орташа", active: "Белсенді" },
    food: "Тамақтану қалауы",
    vegetarian: "Вегетариандық тағамдар",
    lactoseFree: "Лактозасыз тағамдар",
    allergies: "Аллергия немесе шектейтін өнімдер",
    allergyPlaceholder: "Мысалы: жаңғақ, сүт, жұмыртқа",
    save: "Өзгерістер автоматты сақталады",
    saved: "Қалауларың сақталды",
    error: "Сақтау мүмкін болмады. Браузер жадысын тексер.",
    private: "Бұл мәліметтер профильде жарияланбайды.",
  },
  ru: {
    eyebrow: "ПЕРСОНАЛЬНЫЕ НАСТРОЙКИ",
    title: "Цели и предпочтения",
    intro: "Выбери важные привычки и пищевые ограничения. Данные сохраняются в этом браузере.",
    goals: "Основные цели",
    goalOptions: ["Больше двигаться", "Сбалансированно питаться", "Наладить режим сна", "Следить за водой", "Сформировать привычку ухода"],
    level: "Уровень активности",
    levels: { light: "Лёгкий", moderate: "Средний", active: "Активный" },
    food: "Пищевые предпочтения",
    vegetarian: "Вегетарианское питание",
    lactoseFree: "Без лактозы",
    allergies: "Аллергии или продукты-ограничения",
    allergyPlaceholder: "Например: орехи, молоко, яйца",
    save: "Изменения сохраняются автоматически",
    saved: "Предпочтения сохранены",
    error: "Не удалось сохранить. Проверь хранилище браузера.",
    private: "Эти данные не публикуются в профиле.",
  },
  en: {
    eyebrow: "PERSONAL SETTINGS",
    title: "Goals and preferences",
    intro: "Choose the habits and food restrictions that matter to you. These settings stay in this browser.",
    goals: "Main goals",
    goalOptions: ["Move more", "Eat balanced meals", "Improve sleep routine", "Track water intake", "Build a care routine"],
    level: "Activity level",
    levels: { light: "Light", moderate: "Moderate", active: "Active" },
    food: "Food preferences",
    vegetarian: "Vegetarian meals",
    lactoseFree: "Lactose-free meals",
    allergies: "Allergies or foods to avoid",
    allergyPlaceholder: "For example: nuts, milk, eggs",
    save: "Changes save automatically",
    saved: "Preferences saved",
    error: "Could not save preferences. Check browser storage.",
    private: "These details are not shown on your profile.",
  },
} as const;

const goalIds = ["movement", "balanced-food", "sleep", "water", "care"];

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("hf:wellness-preferences-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("hf:wellness-preferences-change", callback);
  };
}

function getSnapshot() {
  try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_SNAPSHOT; }
  catch { return DEFAULT_SNAPSHOT; }
}

function parseSnapshot(snapshot: string): WellnessSettings {
  try {
    const parsed = JSON.parse(snapshot) as Partial<WellnessSettings>;
    return {
      ...defaults,
      ...parsed,
      goals: Array.isArray(parsed.goals) ? parsed.goals.filter((goal) => goalIds.includes(goal)) : [],
      activityLevel: parsed.activityLevel === "light" || parsed.activityLevel === "active" ? parsed.activityLevel : "moderate",
      vegetarian: Boolean(parsed.vegetarian),
      lactoseFree: Boolean(parsed.lactoseFree),
      allergies: typeof parsed.allergies === "string" ? parsed.allergies : "",
    };
  } catch { return defaults; }
}

export default function WellnessPreferences({ locale }: { locale: Locale }) {
  const labels = copy[locale];
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_SNAPSHOT);
  const settings = parseSnapshot(snapshot);
  const [status, setStatus] = useState("");

  function updateSettings(patch: Partial<WellnessSettings>) {
    const next = { ...settings, ...patch };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("hf:wellness-preferences-change"));
      setStatus(labels.saved);
    } catch {
      setStatus(labels.error);
    }
  }

  function toggleGoal(goal: string) {
    updateSettings({ goals: settings.goals.includes(goal) ? settings.goals.filter((item) => item !== goal) : [...settings.goals, goal] });
  }

  return (
    <section className="panel wellness-preferences">
      <div className="panel-heading">
        <div><span className="eyebrow">{labels.eyebrow}</span><h2>{labels.title}</h2></div>
        <span className="panel-icon" aria-hidden="true">✦</span>
      </div>
      <p className="wellness-preferences-intro">{labels.intro}</p>
      <div className="wellness-preferences-form">
        <fieldset className="wellness-fieldset">
          <legend>{labels.goals}</legend>
          <div className="wellness-option-grid">
            {labels.goalOptions.map((label, index) => {
              const id = goalIds[index];
              return <label className="wellness-check" key={id}>
                <input type="checkbox" checked={settings.goals.includes(id)} onChange={() => toggleGoal(id)}/>
                <span>{label}</span>
              </label>;
            })}
          </div>
        </fieldset>
        <label className="wellness-control">
          <span>{labels.level}</span>
          <select value={settings.activityLevel} onChange={(event) => updateSettings({ activityLevel: event.target.value as ActivityLevel })}>
            <option value="light">{labels.levels.light}</option>
            <option value="moderate">{labels.levels.moderate}</option>
            <option value="active">{labels.levels.active}</option>
          </select>
        </label>
        <fieldset className="wellness-fieldset">
          <legend>{labels.food}</legend>
          <div className="wellness-option-grid">
            <label className="wellness-check"><input type="checkbox" checked={settings.vegetarian} onChange={(event) => updateSettings({ vegetarian: event.target.checked })}/><span>{labels.vegetarian}</span></label>
            <label className="wellness-check"><input type="checkbox" checked={settings.lactoseFree} onChange={(event) => updateSettings({ lactoseFree: event.target.checked })}/><span>{labels.lactoseFree}</span></label>
          </div>
        </fieldset>
        <label className="wellness-control">
          <span>{labels.allergies}</span>
          <input value={settings.allergies} onChange={(event) => updateSettings({ allergies: event.target.value })} placeholder={labels.allergyPlaceholder} maxLength={240}/>
        </label>
        <div className="wellness-preferences-footer">
          <small>{labels.private}</small>
          <span className="wellness-autosave">{labels.save}</span>
        </div>
        <p className={status === labels.error ? "wellness-save-status error" : "wellness-save-status"} role="status" aria-live="polite">{status}</p>
      </div>
    </section>
  );
}
