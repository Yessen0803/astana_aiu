"use client";
const months = ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"];
export default function CategoryFilters({ month, onChange }: { month: string; onChange: (month: string) => void }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const go = (delta: number) => { const date = new Date(year, monthNumber - 1 + delta, 1); onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`); };
  return <div className="month-nav"><button className="month-arrow" onClick={() => go(-1)} aria-label="Алдыңғы ай">←</button><strong>{months[monthNumber - 1]} {year}</strong><button className="month-arrow" onClick={() => go(1)} aria-label="Келесі ай">→</button></div>;
}
