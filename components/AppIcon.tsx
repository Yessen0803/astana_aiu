import {
  CgAdd, CgArrowLeft, CgArrowRight, CgArrowTopRight, CgBell, CgBowl,
  CgCalendarDates, CgCamera, CgChart, CgCheck, CgClose, CgCloud,
  CgCoffee, CgComment, CgCommunity, CgDrop, CgGlass, CgGym, CgHeart,
  CgHome, CgIcecream, CgImage, CgLock, CgMail, CgMenuCake, CgMenuCheese,
  CgMoon, CgOptions, CgPin, CgProfile, CgSearch, CgShield, CgShoppingCart,
  CgSmile, CgSmileNeutral, CgSmileNone, CgSmileSad, CgSmileUpside, CgSun,
  CgSupport, CgTrees, CgTrophy, CgUserList, CgYinyang,
} from "react-icons/cg";
import type { IconType } from "react-icons";

const icons: Record<string, IconType> = {
  home: CgHome, "⌂": CgHome, "🏠": CgHome,
  calendar: CgCalendarDates, planning: CgCalendarDates, "▦": CgCalendarDates, "📅": CgCalendarDates, "🗓️": CgCalendarDates,
  bowl: CgBowl, nutrition: CgBowl, restaurants: CgBowl,
  "◉": CgBowl, "🍚": CgBowl, "🥗": CgBowl, "🍲": CgBowl, "🍛": CgBowl,
  "🥘": CgBowl, "🍽": CgBowl, "🍽️": CgBowl, "🍝": CgBowl, "🍜": CgBowl,
  "🥙": CgBowl, "🥩": CgBowl, "🐟": CgBowl, "🐠": CgBowl, "🍗": CgBowl,
  "🥒": CgBowl, "🥑": CgBowl, "🥣": CgBowl, "🥬": CgBowl, "🍞": CgBowl,
  "🥕": CgBowl, "🧀": CgMenuCheese, "🍳": CgMenuCheese,
  "🥞": CgMenuCake, "🍰": CgMenuCake, "🍦": CgIcecream, "🫐": CgIcecream,
  "🍓": CgIcecream, "🥛": CgCoffee, "🥤": CgGlass,
  movement: CgGym, workout: CgGym, "🏃": CgGym, "🏃‍♀️": CgGym,
  "🚶": CgGym, "🏋️": CgGym, "🏊": CgGym, "🤸": CgGym, "💪": CgGym,
  "💃": CgGym, "🎶": CgGym,
  yoga: CgYinyang, "🧘": CgYinyang,
  care: CgHeart, "✿": CgHeart, breathe: CgCloud, "🫧": CgCloud,
  "🌿": CgTrees, "🌱": CgTrees, "🌳": CgTrees, "🌬️": CgTrees,
  progress: CgChart, chart: CgChart, "⌁": CgChart,
  community: CgCommunity, "◎": CgCommunity, friends: CgUserList, "♧": CgUserList,
  notifications: CgBell, "🔔": CgBell, profile: CgProfile, "👤": CgProfile,
  support: CgSupport, "✉": CgMail, "💬": CgComment,
  sticker: CgSmile, "😊": CgSmile, "😄": CgSmileUpside, "🙂": CgSmile,
  "😐": CgSmileNeutral, "😔": CgSmileSad, "😣": CgSmileNone,
  "mood-good": CgSmileUpside, "mood-normal": CgSmile,
  "mood-neutral": CgSmileNeutral, "mood-tired": CgSmileSad, "mood-hard": CgSmileNone,
  admin: CgOptions, settings: CgOptions, "⚙": CgOptions,
  lock: CgLock, "🔒": CgLock, "🔐": CgShield,
  water: CgDrop, "💧": CgDrop, "🌊": CgDrop,
  moon: CgMoon, sleep: CgMoon, "🌙": CgMoon, sun: CgSun,
  "☀️": CgSun, "☀": CgSun, "🌞": CgSun, "🌅": CgSun, "🔥": CgSun,
  heart: CgHeart, "♡": CgHeart, "♥": CgHeart,
  check: CgCheck, "✓": CgCheck, "✅": CgCheck,
  "✦": CgTrophy, "★": CgTrophy, "⭐": CgTrophy, trophy: CgTrophy,
  "🏅": CgTrophy, "🏆": CgTrophy,
  pin: CgPin, "⌖": CgPin, search: CgSearch, camera: CgCamera,
  "📷": CgCamera, image: CgImage, comment: CgComment,
  add: CgAdd, "＋": CgAdd, close: CgClose, "×": CgClose,
  arrowLeft: CgArrowLeft, "←": CgArrowLeft, arrowRight: CgArrowRight,
  "→": CgArrowRight, "↗": CgArrowTopRight,
  shopping: CgShoppingCart, "🛒": CgShoppingCart, "🛍️": CgShoppingCart,
  "👋": CgProfile, "👥": CgUserList, "💳": CgShoppingCart,
  "📭": CgMail, "🗂️": CgImage, "🧺": CgShoppingCart,
};

export default function AppIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? CgSmile;
  return <Icon className={className} aria-hidden="true" focusable="false" />;
}
