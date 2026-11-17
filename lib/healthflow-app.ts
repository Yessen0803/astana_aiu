import { localDayKey, type Locale } from "@/lib/healthflow";
import type { DayData, Friend, Habit } from "@/lib/healthflow-types";

export const workoutLibrary = [
  { name: "Жаяу жүріс", icon: "movement", minutes: 30, type: "Cardio" }, { name: "Йога", icon: "yoga", minutes: 25, type: "Yoga" },
  { name: "Күш жаттығуы", icon: "movement", minutes: 40, type: "Strength" }, { name: "Би", icon: "movement", minutes: 35, type: "Dance" },
  { name: "Созылу", icon: "yoga", minutes: 15, type: "Mobility" }, { name: "Жеңіл жүгіру", icon: "movement", minutes: 25, type: "Cardio" },
];
export const defaultHabits: Habit[] = [
  { id: "water-habit", title: "Су ішу", icon: "water" }, { id: "fresh-air", title: "Таза ауаға шығу", icon: "care" },
  { id: "stretch", title: "5 минут созылу", icon: "yoga" }, { id: "sleep-routine", title: "Ұйқы режимін сақтау", icon: "sleep" },
];
export const careItems = ["Бет күтімі", "Тыныс жаттығуы", "Күннен қорғану", "Кешкі созылу"];
export const restaurants = [
  { id: "green-bowl", name: "Green Bowl", type: "Теңгерімді боулдар", area: "Есіл ауданы", price: "2 900 ₸ бастап", icon: "bowl", tint: "mint", hours: "09:00–22:00" },
  { id: "slow-food", name: "Slow Food Kitchen", type: "Үй тағамы · пайдалы мәзір", area: "Алматы ауданы", price: "3 200 ₸ бастап", icon: "bowl", tint: "peach", hours: "10:00–21:00" },
  { id: "fresh-corner", name: "Fresh Corner", type: "Смузи және жеңіл ас", area: "Байқоңыр ауданы", price: "1 800 ₸ бастап", icon: "bowl", tint: "lavender", hours: "08:00–20:00" },
  { id: "grain-table", name: "Grain Table", type: "Дәнді дақылдар · салат", area: "Сарыарқа ауданы", price: "2 500 ₸ бастап", icon: "bowl", tint: "blue", hours: "11:00–22:00" },
];
export const demoFriends: Friend[] = [
  { id: "f-madina", name: "Мадина С.", city: "Астана", bio: "Таңғы серуен мен йоганы жақсы көремін", sessions: 24, points: 840, color: "#e8bc9d" },
  { id: "f-nurzhan", name: "Нұржан А.", city: "Астана", bio: "Аптасына үш рет қозғалысқа уақыт бөлемін", sessions: 18, points: 620, color: "#a7c4b3" },
  { id: "f-asel", name: "Әсел Қ.", city: "Алматы", bio: "Би, пилатес және жаңа пайдалы орындар", sessions: 31, points: 1120, color: "#c8b5de" },
];
export const todayKey = () => localDayKey(new Date());
export const emptyDay = (): DayData => ({ steps: 0, water: 0, completedHabits: [], planned: [], done: [], mood: "", sleepStart: "22:30", sleepEnd: "07:00", careDone: [], note: "" });
export function read<T>(key: string, fallback: T): T { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
export function save(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
export type ProfileData = { name?: string; bio?: string; photo?: string; instagram?: string; tiktok?: string };
export function saveProfileData(patch: ProfileData) {
  return save("hf:profile", { ...read<ProfileData>("hf:profile", {}), ...patch });
}
export function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map((part) => [...part][0] ?? "").join("").toUpperCase() || "Е"; }
export function normalizeSocialLink(value: string, host: "instagram.com" | "tiktok.com"): string | null {
  const input = value.trim();
  if (!input) return "";
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    const allowedHosts = [host, `www.${host}`];
    if (url.protocol !== "https:" || !allowedHosts.includes(url.hostname.toLowerCase()) || url.pathname === "/") return null;
    return url.toString();
  } catch { return null; }
}
export function sleepMinutes(start: string, end: string) { const [sh, sm] = start.split(":").map(Number), [eh, em] = end.split(":").map(Number); let minutes = eh * 60 + em - sh * 60 - sm; if (minutes < 0) minutes += 1440; return Number.isFinite(minutes) && minutes > 0 ? minutes : 0; }
export function formatSleepDuration(minutes: number, locale: Locale) { const hours = Math.floor(minutes / 60), rest = minutes % 60; return locale === "ru" ? `${hours} ч ${rest} мин` : locale === "en" ? `${hours} hr ${rest} min` : `${hours} сағ ${rest} мин`; }
