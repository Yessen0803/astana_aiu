"use client";
import { t, type Locale } from "@/lib/healthflow";
const months: Record<Locale, string[]> = {
  kk: ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
export default function CategoryFilters({ month, locale, onChange }: { month: string; locale: Locale; onChange: (month: string) => void }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const go = (delta: number) => { const date = new Date(year, monthNumber - 1 + delta, 1); onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`); };
  return <div className="month-nav"><button className="month-arrow" onClick={() => go(-1)} aria-label={t(locale,"Previous month")}>←</button><strong>{months[locale][monthNumber - 1]} {year}</strong><button className="month-arrow" onClick={() => go(1)} aria-label={t(locale,"Next month")}>→</button></div>;
}
