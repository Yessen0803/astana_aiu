"use client";
import {
  CgAdd, CgArrowLeft, CgArrowRight, CgBell, CgBowl, CgCalendarDates,
  CgCamera, CgChart, CgCheck, CgClose, CgCoffee, CgComment, CgCommunity,
  CgCloud, CgDrop, CgGlass, CgGym, CgHeart, CgHome, CgIcecream, CgImage, CgLock, CgMail,
  CgMenuCake, CgMenuCheese, CgMoon, CgOptions, CgPin, CgProfile,
  CgSearch, CgShield, CgShoppingCart, CgSmile, CgSun, CgSupport, CgTrees,
  CgTrophy, CgUserList, CgYinyang,
} from "react-icons/cg";
import type { IconType } from "react-icons";

const icons: Record<string, IconType> = {
  home: CgHome, "⌂": CgHome, "🏠": CgHome,
  calendar: CgCalendarDates, planning: CgCalendarDates, "▦": CgCalendarDates, "📅": CgCalendarDates, "🗓️": CgCalendarDates,
  bowl: CgBowl, nutrition: CgBowl, "◉": CgBowl, "🍚": CgBowl, "🥗": CgBowl, "🍲": CgBowl, "🍛": CgBowl, "🥘": CgBowl, "🍽️": CgBowl, "🍝": CgBowl, "🍜": CgBowl, "🥙": CgBowl, "🥩": CgBowl, "🐟": CgBowl, "🐠": CgBowl, "🍗": CgBowl, "🥒": CgBowl,
  "🍳": CgMenuCheese, "🥞": CgMenuCake, "🍰": CgMenuCake, "🍦": CgIcecream, "🫐": CgIcecream, "🍓": CgIcecream, "🥑": CgBowl, "🥛": CgCoffee,
  movement: CgGym, "↗": CgGym, "🏃": CgGym, "🚶": CgGym, "🏋️": CgGym, "💃": CgGym, workout: CgGym,
  yoga: CgYinyang, "🧘": CgYinyang, care: CgHeart, "✿": CgHeart, "🌿": CgTrees, "🌱": CgTrees, "🌳": CgTrees, "🫧": CgCloud,
  progress: CgChart, chart: CgChart, "⌁": CgChart, community: CgCommunity, "◎": CgCommunity, friends: CgUserList, "♧": CgUserList,
  restaurants: CgMenuCake, "✳": CgMenuCake, notifications: CgBell, "🔔": CgBell, profile: CgProfile, "👤": CgProfile,
  support: CgSupport, "✉": CgMail, "💬": CgComment, sticker: CgSmile, "😊": CgSmile,
  admin: CgOptions, settings: CgOptions, "⚙": CgOptions, lock: CgLock, "🔒": CgLock, "🔐": CgShield,
  water: CgDrop, "💧": CgDrop, moon: CgMoon, sleep: CgMoon, "🌙": CgMoon, sun: CgSun, "☀️": CgSun, "🌞": CgSun,
  heart: CgHeart, "♡": CgHeart, "♥": CgHeart, check: CgCheck, "✓": CgCheck, "✅": CgCheck, "✦": CgTrophy, "★": CgTrophy,
  pin: CgPin, "⌖": CgPin, search: CgSearch, camera: CgCamera, "📷": CgCamera, image: CgImage,
  comment: CgComment, add: CgAdd, "＋": CgAdd, close: CgClose, "×": CgClose,
  arrowLeft: CgArrowLeft, "←": CgArrowLeft, arrowRight: CgArrowRight, "→": CgArrowRight,
  shopping: CgShoppingCart, "🛒": CgShoppingCart, trophy: CgTrophy, "🏅": CgTrophy,
  "☕": CgCoffee, "🥣": CgBowl, "🥬": CgBowl, "🍞": CgBowl, "☾": CgMoon, "☀": CgSun, "🔐": CgLock, "🛍️": CgShoppingCart, "🥤": CgGlass,
  "🏊": CgGym, "🤸": CgGym, "💪": CgGym, "🎶": CgGym, "🌊": CgDrop, "🌬️": CgTrees, "👋": CgProfile, "👥": CgUserList,
  "💳": CgShoppingCart, "📭": CgMail, "🗂️": CgImage, "😄": CgSmile, "😐": CgSmile, "😔": CgSmile, "😣": CgSmile, "🙂": CgSmile,
  "🌱": CgTrees, "🌿": CgTrees, "🌳": CgTrees, "🔥": CgSun, "🏆": CgTrophy, "🥕": CgBowl, "🧺": CgShoppingCart,
};

export default function AppIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? CgSmile;
  return <Icon className={className} aria-hidden="true" focusable="false" />;
}
