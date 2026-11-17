import {
  CgAdd, CgArrowLeft, CgArrowRight, CgArrowTopRight, CgBell, CgBowl,
  CgCalendarDates, CgCamera, CgChart, CgCheck, CgClose, CgCloud,
  CgCoffee, CgComment, CgCommunity, CgDrop, CgGlass, CgGym, CgHeart,
  CgHome, CgImage, CgLock, CgMail, CgMenuCheese, CgMoon,
  CgOptions, CgPen, CgPin, CgProfile, CgSearch, CgShield, CgShoppingCart,
  CgSmile, CgSmileNeutral, CgSmileNone, CgSmileSad, CgSmileUpside, CgSun,
  CgSupport, CgTrees, CgTrophy, CgUserList, CgYinyang,
} from "react-icons/cg";
import type { IconType } from "react-icons";

const icons: Record<string, IconType> = {
  home: CgHome, calendar: CgCalendarDates, planning: CgCalendarDates,
  bowl: CgBowl, nutrition: CgBowl, restaurants: CgBowl, food: CgMenuCheese,
  movement: CgGym, workout: CgGym, gym: CgGym, dance: CgGym, swim: CgGlass,
  yoga: CgYinyang, pilates: CgYinyang, outdoor: CgTrees, trees: CgTrees,
  care: CgHeart, heart: CgHeart, breathe: CgCloud,
  progress: CgChart, chart: CgChart, community: CgCommunity, friends: CgUserList,
  notifications: CgBell, profile: CgProfile, support: CgSupport, comment: CgComment,
  sticker: CgSmile, "mood-good": CgSmileUpside, "mood-normal": CgSmile,
  "mood-neutral": CgSmileNeutral, "mood-tired": CgSmileSad, "mood-hard": CgSmileNone,
  admin: CgOptions, settings: CgOptions, edit: CgPen, pencil: CgPen,
  lock: CgLock, water: CgDrop, moon: CgMoon, sleep: CgMoon, sun: CgSun,
  check: CgCheck, trophy: CgTrophy, streak: CgTrophy, camera: CgCamera,
  image: CgImage, pin: CgPin, search: CgSearch, add: CgAdd, close: CgClose,
  mail: CgMail, shopping: CgShoppingCart, coffee: CgCoffee,
  arrowLeft: CgArrowLeft, arrowRight: CgArrowRight,
  "⌂": CgHome, "▦": CgCalendarDates, "◉": CgBowl, "↗": CgArrowTopRight,
  "←": CgArrowLeft, "→": CgArrowRight, "✦": CgTrophy, "★": CgTrophy,
  "♡": CgHeart, "♥": CgHeart, "✓": CgCheck, "✎": CgPen, "⌖": CgPin,
};

const iconTone: Record<string, string> = {
  home: "green", calendar: "green", planning: "green", bowl: "food", nutrition: "food",
  restaurants: "food", food: "food", coffee: "food", shopping: "food",
  movement: "movement", workout: "movement", gym: "movement", dance: "movement",
  swim: "water", water: "water", yoga: "wellness", pilates: "wellness",
  outdoor: "green", trees: "green", care: "wellness", heart: "wellness", breathe: "wellness",
  progress: "achievement", chart: "achievement", trophy: "achievement", streak: "achievement",
  community: "social", friends: "social", notifications: "social", profile: "green",
  support: "social", comment: "social", sticker: "mood", "mood-good": "mood-good",
  "mood-normal": "mood-normal", "mood-neutral": "mood-neutral", "mood-tired": "mood-tired",
  "mood-hard": "mood-hard", sun: "warm", moon: "sleep", sleep: "sleep",
  edit: "green", pencil: "green", camera: "social", image: "social", mail: "social",
};

// Older local notifications may still store emoji identifiers. Resolve those
// to the matching Carbon icon while keeping the rendered UI emoji-free.
const legacyIconNames: Record<string, string> = {
  "\u{1F33F}": "trees", "\u{1F331}": "trees", "\u{1F4A7}": "water",
  "\u{1F3C3}": "movement", "\u{1F3C3}\u200D\u2640\uFE0F": "movement",
  "\u{1F957}": "bowl", "\u{1F371}": "bowl", "\u{1F37D}\uFE0F": "bowl",
  "\u{1F3C5}": "trophy", "\u{1F3C6}": "trophy", "\u{1F44B}": "profile",
  "\u{1F465}": "friends", "\u{1F4AC}": "comment", "\u{1F512}": "lock",
  "\u{1F4ED}": "mail", "\u{1F5C2}\uFE0F": "image", "\u{1F6D2}": "shopping",
};

export default function AppIcon({ name, className }: { name: string; className?: string }) {
  const resolvedName = legacyIconNames[name] ?? name;
  const Icon = icons[resolvedName] ?? CgSmile;
  const classes = ["hf-icon", `hf-icon--${iconTone[resolvedName] ?? "default"}`, className].filter(Boolean).join(" ");
  return <Icon className={classes} aria-hidden="true" focusable="false" />;
}
