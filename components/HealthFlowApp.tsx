"use client";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { PageIntro } from "@/components/sections/PageIntro";
import { TodayView } from "@/components/sections/TodaySection";
import { PlanningView } from "@/components/sections/PlanningSection";
import { MovementView } from "@/components/sections/MovementSection";
import { CareView } from "@/components/sections/CareSection";
import { ProgressView } from "@/components/sections/ProgressSection";
import { NotificationsView, NotificationDetailPage } from "@/components/sections/NotificationSection";
import { FriendsView } from "@/components/sections/FriendsSection";
import { SupportPage } from "@/components/sections/SupportSection";
import { AdminView, adminNavigation, type AdminPageId } from "@/components/sections/AdminSection";
import { RestaurantView } from "@/components/sections/RestaurantSection";
import { ProfileEditPage, ProfileView } from "@/components/sections/ProfileSection";
import type { Activity, DayData, Friend, Habit, HealthNotification, Reservation, SupportMessage, SupportThread } from "@/lib/healthflow-types";
import { defaultHabits, demoFriends, emptyDay, formatSleepDuration, initials, normalizeSocialLink, read, restaurants, save, saveProfileData, sleepMinutes, todayKey, workoutLibrary } from "@/lib/healthflow-app";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import AppIcon from "@/components/AppIcon";
import Board from "@/components/Board";
import { recipes } from "@/data/requests";
import AchievementGrid from "@/components/AchievementGrid";
import CommunityFeed from "@/components/CommunityFeed";
import RegistrationScreen from "@/components/RegistrationScreen";
import SupportBot from "@/components/SupportBot";
import WellnessPreferences from "@/components/WellnessPreferences";
import { formatDate, formatWeekday, localDayKey, localizeStoredText, t, type HealthView, type Locale, type Theme } from "@/lib/healthflow";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

const views: { id: HealthView; icon: string; label: string }[] = [
  { id: "today", icon: "home", label: "Today" }, { id: "planning", icon: "calendar", label: "Planning" }, { id: "nutrition", icon: "bowl", label: "Nutrition" },
  { id: "movement", icon: "movement", label: "Movement" }, { id: "care", icon: "heart", label: "Care" },
  { id: "progress", icon: "chart", label: "Progress" }, { id: "notifications", icon: "notifications", label: "Notifications" }, { id: "community", icon: "community", label: "Community" }, { id: "friends", icon: "friends", label: "Friends" },
  { id: "restaurants", icon: "restaurants", label: "Restaurants" }, { id: "profile", icon: "profile", label: "Profile" }, { id: "support", icon: "support", label: "Support" }, { id: "admin", icon: "settings", label: "Admin" },
];
const viewRoutes: Record<HealthView, string> = {
  today: "today", planning: "schedule", nutrition: "nutrition", movement: "movement",
  care: "care", progress: "progress", notifications: "notifications", community: "community",
  friends: "friends", restaurants: "restaurants", profile: "profile", support: "support", admin: "admin",
};
const routeViews: Record<string, HealthView> = {
  today: "today", schedule: "planning", planning: "planning", nutrition: "nutrition", movement: "movement",
  care: "care", progress: "progress", notifications: "notifications", community: "community",
  friends: "friends", restaurants: "restaurants", profile: "profile", support: "support", admin: "admin",
};
function viewFromPathname(pathname: string): HealthView {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment ? routeViews[segment] ?? "today" : "today";
}
function adminPageFromPathname(pathname: string): AdminPageId {
  const page = pathname.split("/").filter(Boolean)[1] as AdminPageId | undefined;
  return adminNavigation.some((item) => item.id === page) ? page! : "overview";
}
export default function HealthFlowApp() {
  const pathname = usePathname();
  const router = useRouter();
  const [view, setView] = useState<HealthView>(() => viewFromPathname(pathname));
  const [locale, setLocale] = useState<Locale>("kk");
  const [theme, setTheme] = useState<Theme>("light");
  const [name, setName] = useState("Есен Абдукарим");
  const [bio, setBio] = useState("Өз қарқыныммен, күн сайын жақсырақ.");
  const [city, setCity] = useState("Астана");
  const [focusDate, setFocusDate] = useState(todayKey());
  const [day, setDay] = useState<DayData>(emptyDay());
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [customHabit, setCustomHabit] = useState("");
  const [customWorkout, setCustomWorkout] = useState("");
  const [stepInput, setStepInput] = useState("6000");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [backendUserId, setBackendUserId] = useState("");
  const persistMealPlanToBackend = useCallback((plan: { date: string; slot: "breakfast" | "lunch" | "dinner"; meal?: { recipeId: string; servings: number } }) => {
    if (!backendUserId) return;
    const request = plan.meal
      ? fetch("/api/meal-plan", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan_date: plan.date, meal_slot: plan.slot, recipe_id: plan.meal.recipeId, servings: plan.meal.servings }) })
      : fetch(`/api/meal-plan?date=${encodeURIComponent(plan.date)}&slot=${encodeURIComponent(plan.slot)}`, { method: "DELETE" });
    void request.then((response) => { if (!response.ok) setToast(t(locale, "Meal plan is saved on this device; server sync failed.")); }).catch(() => setToast(t(locale, "Meal plan is saved on this device; server sync failed.")));
  }, [backendUserId, locale]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [friends, setFriends] = useState<Friend[]>(demoFriends);
  const [friendQuery, setFriendQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [booking, setBooking] = useState<{ id: string; date: string; time: string; guests: number } | null>(null);
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState<HealthNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<HealthNotification | null>(null);
  const [supportThreads, setSupportThreads] = useState<SupportThread[]>([]);
  const [supportDraft, setSupportDraft] = useState("");
  const [adminSettings, setAdminSettings] = useState({ stepGoal: 8000, waterGoal: 2000, communityEnabled: true });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const profile = read<{ name?: string; bio?: string; photo?: string; instagram?: string; tiktok?: string }>("hf:profile", {});
    setLocale(read<Locale>("hf:locale", "kk")); setTheme(read<Theme>("hf:theme", "light"));
    setName(profile.name || "Есен Абдукарим"); setBio(profile.bio || "Өз қарқыныммен, күн сайын жақсырақ."); setProfilePhoto(profile.photo || ""); setInstagram(profile.instagram || ""); setTiktok(profile.tiktok || "");
    setCity(read("hf:city-name", "Астана")); setHabits(read("hf:habits", defaultHabits));
    const account = read<{ email?: string; role?: string } | null>("hf:account", null);
    const guestAccess = read<boolean>("hf:guest-access", false);
    setAccountEmail(account?.email || ""); setIsAdmin(account?.role === "admin"); setAuthorized(Boolean(account?.email || guestAccess));
    setNotifications(read<HealthNotification[]>("hf:notifications", []));
    setSupportThreads(read<SupportThread[]>("hf:support-inbox", []));
    setAdminSettings({ stepGoal: 8000, waterGoal: 2000, communityEnabled: true, ...read<Partial<{ stepGoal: number; waterGoal: number; communityEnabled: boolean }>>("hf:admin-settings", {}) });
    setActivities(read("hf:activity-log", [])); setFriends(read("hf:friends", demoFriends)); setReservations(read("hf:reservations", []));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !isSupabaseConfigured()) return;
    let cancelled = false;
    async function restoreSupabaseAccount() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        let user = currentUser;
        if (!user && read<boolean>("hf:guest-access", false)) {
          const anonymous = await supabase.auth.signInAnonymously({ options: { data: { display_name: name, city } } });
          if (!anonymous.error) user = anonymous.data.user;
        }
        if (!user || cancelled) return;
        setBackendUserId(user.id);
        const response = await fetch("/api/profile", { cache: "no-store" });
        const result = response.ok ? await response.json() as { profile?: { display_name?: string; city?: string; bio?: string; role?: string; instagram?: string; tiktok?: string } | null } : null;
        if (cancelled) return;
        const profile = result?.profile;
        const restoredName = profile?.display_name || String(user.user_metadata.display_name || "HealthFlow user");
        const restoredCity = profile?.city || String(user.user_metadata.city || "Астана");
        setName(restoredName); setCity(restoredCity); setBio(profile?.bio || ""); setInstagram(profile?.instagram || ""); setTiktok(profile?.tiktok || "");
        setAccountEmail(user.email || ""); setIsAdmin(profile?.role === "admin");
        save("hf:account", { email: user.email || "", role: profile?.role || "user" });
        save("hf:profile", { name: restoredName, city: restoredCity, bio: profile?.bio || "", instagram: profile?.instagram || "", tiktok: profile?.tiktok || "" });
        save("hf:guest-access", false); setAuthorized(true);
      } catch { /* Keep the local demo entry flow available while offline. */ }
    }
    void restoreSupabaseAccount();
    return () => { cancelled = true; };
  }, [ready]);
  useEffect(() => {
    if (!ready) return;
    setView(viewFromPathname(pathname));
    setSelectedNotification(null);
    setSelectedFriend(null);
  }, [pathname, ready]);
  useEffect(() => { if (!ready) return; const savedDay = read(`hf:day:${focusDate}`, emptyDay()); setDay(savedDay); setStepInput(String(savedDay.steps || 6000)); }, [focusDate, ready]);
  useEffect(() => {
    if (!ready || !authorized || !isSupabaseConfigured()) return;
    let cancelled = false;
    async function loadRemoteDailyLog() {
      try {
        const response = await fetch(`/api/daily-log?date=${encodeURIComponent(focusDate)}`, { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as { log?: { steps: number; water_ml: number; sleep_start: string; sleep_end: string; mood: string; completed_habits: string[]; planned_activities: string[]; completed_activities: string[]; care_done: string[]; note: string } | null };
        if (cancelled || !result.log) return;
        const remoteDay: DayData = { ...emptyDay(), steps: result.log.steps, water: result.log.water_ml, sleepStart: result.log.sleep_start, sleepEnd: result.log.sleep_end, mood: result.log.mood, completedHabits: result.log.completed_habits || [], planned: result.log.planned_activities || [], done: result.log.completed_activities || [], careDone: result.log.care_done || [], note: result.log.note || "" };
        setDay(remoteDay); setStepInput(String(remoteDay.steps || 6000)); save(`hf:day:${focusDate}`, remoteDay);
      } catch { /* Keep the device copy available when offline. */ }
    }
    void loadRemoteDailyLog();
    return () => { cancelled = true; };
  }, [focusDate, ready, authorized]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2600); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => { document.documentElement.lang = locale === "kk" ? "kk" : locale; }, [locale]);
  useEffect(() => {
    function syncSupport(event: StorageEvent) { if (event.key === "hf:support-inbox") setSupportThreads(read<SupportThread[]>("hf:support-inbox", [])); }
    window.addEventListener("storage", syncSupport);
    return () => window.removeEventListener("storage", syncSupport);
  }, []);
  useEffect(() => {
    if (!ready || !authorized || !backendUserId || !isSupabaseConfigured()) return;
    let cancelled = false;
    void fetch("/api/support/messages", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json() as { messages?: Array<{ id: string; user_id: string; sender_role: "user" | "admin"; body: string; created_at: string; display_name?: string }> };
      if (cancelled || !result.messages) return;
      const grouped = new Map<string, SupportThread>();
      for (const item of result.messages) {
        const thread = grouped.get(item.user_id) || { id: item.user_id, name: item.display_name || name, email: item.user_id === backendUserId ? accountEmail : "", messages: [] };
        thread.messages.push({ id: item.id, sender: item.sender_role, text: item.body, createdAt: item.created_at });
        grouped.set(item.user_id, thread);
      }
      const remoteThreads = [...grouped.values()];
      if (isAdmin) {
        setSupportThreads(remoteThreads);
        save("hf:support-inbox", remoteThreads);
      } else {
        const ownThread = remoteThreads.find((thread) => thread.id === backendUserId) || { id: backendUserId, name, email: accountEmail, messages: [] };
        setSupportThreads([ownThread]);
        save("hf:support-inbox", [ownThread]);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [ready, authorized, backendUserId, isAdmin, accountEmail, name]);
  useEffect(() => {
    if (!ready || !authorized) return;
    const today = todayKey();
    if (localStorage.getItem("hf:welcome-date") === today) return;
    const isReturning = Boolean(localStorage.getItem("hf:welcome-date"));
    localStorage.setItem("hf:welcome-date", today);
    const nextItems: HealthNotification[] = [
      { id: `welcome-${today}`, title: isReturning ? t(locale, "Welcome back") : t(locale, "Welcome to HealthFlow"), message: `${name} · ${t(locale, "Your wellness space is ready.")}`, icon: "trees", createdAt: new Date().toISOString(), read: false },
      { id: `tip-${today}`, title: t(locale, "A gentle reminder"), message: t(locale, "Log your steps, water, and sleep to see your daily rhythm."), icon: "water", createdAt: new Date().toISOString(), read: false },
    ];
    setNotifications((current) => { const updated = [...nextItems, ...current].slice(0, 40); save("hf:notifications", updated); return updated; });
    setToast(`${t(locale, isReturning ? "Welcome back" : "Welcome to HealthFlow")}, ${name}!`);
  }, [ready, authorized, locale, name]);

  function updateNotifications(updater: (current: HealthNotification[]) => HealthNotification[]) { setNotifications((current) => { const updated = updater(current); save("hf:notifications", updated); return updated; }); }
  function markNotificationRead(id: string) { updateNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item)); }
  function markAllNotificationsRead() { updateNotifications((current) => current.map((item) => ({ ...item, read: true }))); }
  function clearReadNotifications() { updateNotifications((current) => current.filter((item) => !item.read)); }
  function clearUnreadNotifications() { updateNotifications((current) => current.filter((item) => item.read)); }
  function openNotification(item: HealthNotification) { markNotificationRead(item.id); setSelectedNotification({ ...item, read: true }); setNotificationsOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function addReminder(title: string, message: string, icon: string) {
    const item: HealthNotification = { id: `reminder-${Date.now()}`, title, message, icon, createdAt: new Date().toISOString(), read: false };
    setNotifications((current) => { const updated = [item, ...current].slice(0, 40); save("hf:notifications", updated); return updated; });
    setToast(`${title} · ${message}`);
  }
  function sendAdminAnnouncement(title: string, message: string) {
    const item: HealthNotification = { id: `announcement-${Date.now()}`, title, message, icon: "notifications", createdAt: new Date().toISOString(), read: false };
    setNotifications((current) => { const updated = [item, ...current].slice(0, 40); save("hf:notifications", updated); return updated; });
    setToast(t(locale, "Announcement sent"));
  }
  const supportThreadId = backendUserId || (accountEmail ? accountEmail.toLocaleLowerCase() : "guest:local");
  const currentSupportThread = supportThreads.find((thread) => thread.id === supportThreadId) ?? { id: supportThreadId, name, email: accountEmail, messages: [] };
  async function sendSupportMessage(event: FormEvent) {
    event.preventDefault(); const text = supportDraft.trim(); if (!text) return;
    const current = supportThreads.find((thread) => thread.id === supportThreadId) ?? { id: supportThreadId, name, email: accountEmail, messages: [] };
    const message: SupportMessage = { id: `user-${Date.now()}`, sender: "user", text, createdAt: new Date().toISOString() };
    const next = [...supportThreads.filter((thread) => thread.id !== supportThreadId), { ...current, name, email: accountEmail, messages: [...current.messages, message] }];
    setSupportThreads(next); save("hf:support-inbox", next); setSupportDraft(""); setToast(t(locale,"Message sent to admin"));
    if (backendUserId) {
      try {
        const response = await fetch("/api/support/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: text }) });
        if (!response.ok) throw new Error("Support sync failed");
        const result = await response.json() as { message: { id: string; created_at: string } };
        const synced = next.map((thread) => thread.id === supportThreadId ? { ...thread, messages: thread.messages.map((item) => item.id === message.id ? { ...item, id: result.message.id, createdAt: result.message.created_at } : item) } : thread);
        setSupportThreads(synced); save("hf:support-inbox", synced);
      } catch { setToast(t(locale, "Message is saved on this device; server sync failed.")); }
    }
  }
  async function replyToSupport(threadId: string, text: string) {
    const value = text.trim(); if (!value) return;
    const current = supportThreads.find((thread) => thread.id === threadId); if (!current) return;
    const next = supportThreads.map((thread) => thread.id === threadId ? { ...thread, messages: [...thread.messages, { id: `admin-${Date.now()}`, sender: "admin" as const, text: value, createdAt: new Date().toISOString() }] } : thread);
    setSupportThreads(next); save("hf:support-inbox", next); setToast(t(locale,"Admin reply sent"));
    if (backendUserId && isAdmin && /^[0-9a-f-]{36}$/i.test(threadId)) {
      try {
        const response = await fetch("/api/support/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: threadId, body: value }) });
        if (!response.ok) throw new Error("Support sync failed");
      } catch { setToast(t(locale, "Reply is saved on this device; server sync failed.")); }
    }
  }

  function changeView(next: HealthView) {
    setView(next);
    setSelectedNotification(null);
    setSelectedFriend(null);
    const href = `/${viewRoutes[next]}`;
    if (pathname !== href) router.push(href, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function persistDayToBackend(logDate: string, value: DayData) {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      return fetch("/api/daily-log", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ log_date: logDate, steps: value.steps, water_ml: value.water, sleep_start: value.sleepStart, sleep_end: value.sleepEnd, mood: value.mood, completed_habits: value.completedHabits, planned_activities: value.planned, completed_activities: value.done, care_done: value.careDone, note: value.note }) });
    }).catch(() => {});
  }
  function updateDay(patch: Partial<DayData>) { const next = { ...day, ...patch }; setDay(next); save(`hf:day:${focusDate}`, next); persistDayToBackend(focusDate, next); }
  function addActivity(activityName: string, minutes = 30) {
    const next: Activity[] = [{ id: `act-${Date.now()}`, name: activityName, date: focusDate, minutes }, ...activities].slice(0, 500);
    setActivities(next); save("hf:activity-log", next); setToast(`${activityName} · ${t(locale, "Added to today")}`);
  }
  function planActivity(activityName: string) {
    if (day.planned.includes(activityName)) return;
    updateDay({ planned: [...day.planned, activityName] });
    const date = formatDate(new Date(`${focusDate}T12:00:00`), locale);
    const message = t(locale, "Planned activity reminder").replace("{activity}", t(locale, activityName)).replace("{date}", date);
    addReminder(t(locale, "Activity reminder"), message, "movement");
  }
  function completeActivity(activityName: string) {
    if (day.done.includes(activityName)) return;
    updateDay({ done: [...day.done, activityName] }); addActivity(activityName, workoutLibrary.find((item) => item.name === activityName)?.minutes || 30);
  }
  function toggleHabit(id: string) { const next = day.completedHabits.includes(id) ? day.completedHabits.filter((item) => item !== id) : [...day.completedHabits, id]; updateDay({ completedHabits: next }); }
  function addHabit(event: FormEvent) { event.preventDefault(); const title = customHabit.trim(); if (!title) return; const next = [...habits, { id: `habit-${Date.now()}`, title, icon: "trophy" }]; setHabits(next); save("hf:habits", next); setCustomHabit(""); setToast("Әдет қосылды"); }
  async function persistProfileToBackend(profile: { name: string; city: string; bio: string; instagram: string; tiktok: string }) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: profile.name, city: profile.city, bio: profile.bio, instagram: profile.instagram, tiktok: profile.tiktok }) });
    if (!response.ok) throw new Error("Profile sync failed");
  }
  function saveProfile() { const ok = saveProfileData({ name, bio, photo: profilePhoto, instagram, tiktok }); setToast(ok ? "Профиль сақталды" : "Сақтау орны толды"); if (ok) void persistProfileToBackend({ name, city, bio, instagram, tiktok }).catch(() => setToast(t(locale, "Profile saved on this device; server sync failed."))); }
  async function saveSocialLinks() {
    const nextInstagram = normalizeSocialLink(instagram, "instagram.com");
    const nextTiktok = normalizeSocialLink(tiktok, "tiktok.com");
    if (nextInstagram === null || nextTiktok === null) { setToast(t(locale, "Enter valid Instagram and TikTok URLs")); return; }
    setInstagram(nextInstagram); setTiktok(nextTiktok);
    const ok = saveProfileData({ name, bio, photo: profilePhoto, instagram: nextInstagram, tiktok: nextTiktok });
    if (ok) { try { await persistProfileToBackend({ name, city, bio, instagram: nextInstagram, tiktok: nextTiktok }); } catch { setToast(t(locale, "Profile saved on this device; server sync failed.")); return; } }
    setToast(ok ? t(locale, "Social links saved") : t(locale, "Storage is full"));
  }
  function registerProfile(registration: { name: string; email: string; city: string; bio?: string; role?: string }) {
    const nextBio = registration.bio ?? bio;
    const role = registration.role === "admin" ? "admin" : "user";
    const nextProfile = { name: registration.name, bio: nextBio, photo: profilePhoto };
    save("hf:account", { email: registration.email, role }); save("hf:guest-access", false); save("hf:profile", nextProfile);
    setName(registration.name); setBio(nextBio); setAccountEmail(registration.email); setIsAdmin(role === "admin"); updateCity(registration.city); setAuthorized(true);
    if (isSupabaseConfigured()) void fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: registration.name, city: registration.city, bio: nextBio }) }).catch(() => {});
  }
  function useAdminDemo() { const profile = { name: "HealthFlow Admin", bio: "Демо әкімші аккаунты", photo: "" }; save("hf:account", { email: "admin@healthflow.local", role: "admin" }); save("hf:profile", profile); save("hf:guest-access", false); setName(profile.name); setBio(profile.bio); setProfilePhoto(""); setAccountEmail("admin@healthflow.local"); setIsAdmin(true); setAuthorized(true); setToast("Демо әкімші аккаунты ашылды"); changeView("admin"); }
  function useUserDemo() { const profile = { name: "Есен Абдукарим", bio: "Өз қарқыныммен, күн сайын жақсырақ.", photo: "" }; save("hf:account", { email: "esen@healthflow.local", role: "user" }); save("hf:profile", profile); save("hf:guest-access", false); setName(profile.name); setBio(profile.bio); setProfilePhoto(""); setAccountEmail("esen@healthflow.local"); setIsAdmin(false); setAuthorized(true); setToast(t(locale,"User demo opened")); changeView("profile"); }
  async function continueAsGuest() {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: current } = await supabase.auth.getSession();
          const result = current.session
            ? { data: { user: current.session.user }, error: null }
            : await supabase.auth.signInAnonymously({ options: { data: { display_name: name, city } } });
          if (!result.error && result.data.user) setBackendUserId(result.data.user.id);
          else setToast(t(locale, "Guest mode is local until anonymous Supabase sign-in is enabled."));
        } catch { setToast(t(locale, "Guest mode is local until anonymous Supabase sign-in is enabled.")); }
      }
    }
    save("hf:guest-access", true); setAuthorized(true);
  }
  function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) void supabase.auth.signOut().catch(() => {});
    save("hf:account", null); save("hf:guest-access", false);
    setBackendUserId("");
    setAccountEmail(""); setIsAdmin(false); setAuthorized(false); setSelectedNotification(null);
    router.replace("/");
  }
  function openRegistration() { setAuthorized(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function selectLocale(value: Locale) { setLocale(value); save("hf:locale", value); }
  function selectTheme(value: Theme) { setTheme(value); save("hf:theme", value); }
  function exportData() {
    const data: Record<string, unknown> = {};
    for (let index = 0; index < localStorage.length; index++) { const key = localStorage.key(index); if (key?.startsWith("hf:") || key?.startsWith("as-menu:")) data[key] = localStorage.getItem(key); }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "healthflow-data.json"; anchor.click(); URL.revokeObjectURL(url); setToast("Деректер жүктелді");
  }
  function chooseProfilePhoto(file?: File) { if (!file) return; if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) { setToast("12 МБ-тан аспайтын суретті таңда"); return; } const reader = new FileReader(); reader.onerror = () => setToast("Суретті оқу мүмкін болмады"); reader.onload = () => { const image = new window.Image(); image.onerror = () => setToast("Бұл суретті ашу мүмкін болмады"); image.onload = () => { const scale = Math.min(1, 560 / Math.max(image.width, image.height)); const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height); let value = canvas.toDataURL("image/jpeg", 0.68); if (value.length > 450000) value = canvas.toDataURL("image/jpeg", 0.48); if (value.length > 550000) { setToast("Кішірек сурет таңдап көр"); return; } const ok = saveProfileData({ photo: value }); if (!ok) { setToast("Суретті сақтау орны жеткіліксіз"); return; } setProfilePhoto(value); setToast("Профиль суреті сақталды"); }; image.src = String(reader.result || ""); }; reader.readAsDataURL(file); }
  function addFriend(event: FormEvent) { event.preventDefault(); const query = friendQuery.trim(); if (!query) return; if (friends.some((item) => item.name.toLocaleLowerCase() === query.toLocaleLowerCase())) { setToast("Бұл дос тізімде бар"); return; } const next = [{ id: `friend-${Date.now()}`, name: query, city, bio: "HealthFlow қауымдастығының мүшесі", sessions: 0, points: 0, color: "#b8c4e8" }, ...friends]; setFriends(next); save("hf:friends", next); setFriendQuery(""); setToast("Дос жергілікті тізімге қосылды"); }
  function saveFriendSocialLinks(id: string, values: { instagram: string; tiktok: string }) {
    const instagram = normalizeSocialLink(values.instagram, "instagram.com");
    const tiktok = normalizeSocialLink(values.tiktok, "tiktok.com");
    if (instagram === null || tiktok === null) { setToast(t(locale, "Enter valid Instagram and TikTok URLs")); return false; }
    const next = friends.map((friend) => friend.id === id ? { ...friend, instagram: instagram || undefined, tiktok: tiktok || undefined } : friend);
    setFriends(next); save("hf:friends", next);
    setSelectedFriend(next.find((friend) => friend.id === id) ?? null);
    setToast(t(locale, "Social links saved"));
    return true;
  }
  function removeFriend(id: string) { const next = friends.filter((item) => item.id !== id); setFriends(next); save("hf:friends", next); setSelectedFriend(null); }
  function reserve(event: FormEvent) { event.preventDefault(); if (!booking) return; const restaurant = restaurants.find((item) => item.id === booking.id); if (!restaurant) return; const next = [{ id: `res-${Date.now()}`, place: restaurant.name, date: booking.date, time: booking.time, guests: booking.guests, status: "pending" as const, description: restaurant.type }, ...reservations]; setReservations(next); save("hf:reservations", next); setBooking(null); setToast(t(locale, "Reservation request received.")); }
  function cancelReservation(id: string) { const next = reservations.filter((item) => item.id !== id); setReservations(next); save("hf:reservations", next); }
  function setReservationStatus(id: string, status: "accepted" | "rejected") { const next = reservations.map((item) => item.id === id ? { ...item, status } : item); setReservations(next); save("hf:reservations", next); }
  function updateCity(value: string) { setCity(value); save("hf:city-name", value); const ids: Record<string,string> = { "Астана":"astana", "Алматы":"almaty", "Шымкент":"shymkent", "Қарағанды":"karaganda" }; const id = ids[value] || value; save("hf:city", id); }

  const weekActivity = useMemo(() => activities.filter((item) => { const date = new Date(`${item.date}T12:00:00`); const start = new Date(); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); return date >= start; }), [activities]);
  const mealsCount = (() => { let count = 0; if (typeof window === "undefined") return count; try { for (let index = 0; index < localStorage.length; index++) { const key = localStorage.key(index); if (key?.startsWith("as-menu:plan:")) { const plan = JSON.parse(localStorage.getItem(key) || "{}"); count += Object.values(plan).reduce((sum: number, dayPlan: unknown) => { if (!dayPlan || typeof dayPlan !== "object") return sum; if ("recipeId" in dayPlan) return sum + 1; return sum + Object.values(dayPlan).filter(Boolean).length; }, 0); } } } catch {} return count; })();
  const visitedCount = (() => { if (typeof window === "undefined") return 0; try { return (JSON.parse(localStorage.getItem("hf:visited") || "[]") as string[]).length; } catch { return 0; } })();
  const activeDateSet = new Set(activities.map((item) => item.date));
  const streak = (() => { const cursor = new Date(); const today = localDayKey(cursor); if (!activeDateSet.has(today)) cursor.setDate(cursor.getDate() - 1); let days = 0; while (activeDateSet.has(localDayKey(cursor))) { days++; cursor.setDate(cursor.getDate() - 1); } return days; })();
  const stats = { activities: activities.length, streak, steps: day.steps, meals: mealsCount, visits: visitedCount, points: activities.length * 80 + Math.floor(day.steps / 100) + mealsCount * 10, activeDays: activeDateSet.size, week: weekActivity.length };
  const navViews = views.filter((item) => item.id !== "support" && (item.id !== "admin" || isAdmin));
  const adminMode = view === "admin" && isAdmin;
  const adminPage = adminPageFromPathname(pathname);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const unreadNotifications = notifications.filter((item) => !item.read);
  const waterGoal = adminSettings.waterGoal, stepGoal = adminSettings.stepGoal, progress = Math.min(100, Math.round(day.steps / stepGoal * 100));

  if (!ready) return <main className="loading-screen"><span className="brand-mark">H</span><p>{t(locale,"HealthFlow жүктелуде…")}</p></main>;
  if (!authorized) return <RegistrationScreen locale={locale} theme={theme} initialName={name} initialCity={city} onLocale={selectLocale} onTheme={selectTheme} onRegister={registerProfile} onContinueAsGuest={continueAsGuest} onAdminDemo={useAdminDemo}/>;

  return <div className={`health-app ${theme === "dark" ? "theme-dark" : "theme-light"}`} data-theme={theme}>
    <aside className={adminMode ? "sidebar admin-sidebar" : "sidebar"}><Link className="app-brand" href={adminMode ? "/admin" : "/today"}><span className="brand-symbol">H</span><span><b>{adminMode ? t(locale, "Administrator") : "healthflow"}</b><small>{adminMode ? "healthflow" : t(locale,"Move a little each day")}</small></span></Link><div className="sidebar-caption">{t(locale,"MENU")}</div><nav className="side-nav">{adminMode ? <>{adminNavigation.map((item) => { const href = item.id === "overview" ? "/admin" : `/admin/${item.id}`; return <Link key={item.id} href={href} className={adminPage === item.id ? "nav-item active" : "nav-item"} aria-current={adminPage === item.id ? "page" : undefined}><span className="nav-icon"><AppIcon name={item.icon}/></span><span>{t(locale, item.label)}</span></Link>; })}<Link href="/today" className="nav-item admin-back-link"><span className="nav-icon"><AppIcon name="arrowRight"/></span><span>{t(locale, "Today")}</span></Link></> : navViews.map((item) => <Link key={item.id} href={`/${viewRoutes[item.id]}`} className={view === item.id ? "nav-item active" : "nav-item"} aria-current={view === item.id ? "page" : undefined}><span className="nav-icon"><AppIcon name={item.icon}/></span><span>{t(locale, item.label)}</span>{item.id === "friends" && <small>{friends.length}</small>}</Link>)}</nav><div className="sidebar-bottom"><div className="mini-profile"><span className="avatar" style={profilePhoto ? { backgroundImage: `url(${profilePhoto})` } : undefined}>{profilePhoto ? "" : initials(name)}</span><span><b>{name}</b><small>{t(locale,city)}</small></span><button className="icon-button" onClick={() => changeView("profile")} aria-label={t(locale, "Settings")}><AppIcon name="settings"/></button></div><small className="sidebar-local">{t(locale, "Demo data stays in this browser")}</small></div></aside>
    <main className="main-area"><header className="app-topbar"><div className="mobile-brand"><span className="brand-symbol">H</span><b>healthflow</b></div><div className="date-line"><span className="live-dot"/>{formatDate(new Date(`${focusDate}T12:00:00`), locale)}</div><div className="topbar-actions"><div className="notifications-anchor"><button className={notificationsOpen?"notification-bell active":"notification-bell"} onClick={()=>setNotificationsOpen((open)=>!open)} aria-label={unreadCount > 0 ? t(locale,"Notifications") + ": " + unreadCount + " " + t(locale,"unread") : t(locale,"Notifications")} aria-expanded={notificationsOpen}><AppIcon name="notifications"/>{unreadCount > 0 && <span className="notification-count" aria-live="polite">{unreadCount > 99 ? "99+" : unreadCount}</span>}</button>{notificationsOpen&&<section className="notifications-menu" aria-label={t(locale,"Notifications")}><header><div><b>{t(locale,"Notifications")}</b><small>{unreadCount} {t(locale,"unread")}</small></div><button className="icon-button" onClick={()=>setNotificationsOpen(false)} aria-label={t(locale,"Close")}><AppIcon name="close"/></button></header><div className="notification-list">{unreadNotifications.length?unreadNotifications.map((item)=><button key={item.id} className="notification-item unread" aria-label={`${item.title}. ${t(locale,"Unread notification")}. ${item.message}`} onClick={()=>openNotification(item)}><span><AppIcon name={item.icon}/></span><span><b>{localizeStoredText(locale,item.title)}<i className="notification-unread-dot" aria-hidden="true"/></b><small>{localizeStoredText(locale,item.message)}</small><time>{new Date(item.createdAt).toLocaleString(locale === "kk" ? "kk-KZ" : locale === "ru" ? "ru-RU" : "en-US",{dateStyle:"medium",timeStyle:"short"})}</time></span></button>):<div className="notifications-empty"><AppIcon name="notifications"/><b>{t(locale,"No unread messages")}</b><small>{t(locale,"New messages will appear here.")}</small></div>}</div>{unreadNotifications.length>0&&<footer><button onClick={markAllNotificationsRead}>{t(locale,"Mark all read")}</button><button onClick={clearUnreadNotifications}>{t(locale,"Clear all")}</button></footer>}</section>}</div><button className="top-avatar" onClick={() => changeView("profile")} aria-label={t(locale, "Profile")}>{profilePhoto ? <Image src={profilePhoto} alt="" width={34} height={34} unoptimized/> : initials(name)}</button></div></header>
      <nav className={adminMode ? "mobile-nav admin-mobile-nav" : "mobile-nav"}>{adminMode ? adminNavigation.map((item) => <Link key={item.id} href={item.id === "overview" ? "/admin" : `/admin/${item.id}`} className={adminPage === item.id ? "mobile-nav-item active" : "mobile-nav-item"} aria-current={adminPage === item.id ? "page" : undefined}><span><AppIcon name={item.icon}/></span>{t(locale, item.label)}</Link>) : navViews.map((item) => <Link key={item.id} href={`/${viewRoutes[item.id]}`} className={view === item.id ? "mobile-nav-item active" : "mobile-nav-item"} aria-current={view === item.id ? "page" : undefined}><span><AppIcon name={item.icon}/></span>{t(locale, item.label)}</Link>)}</nav>
      {pathname === "/profile/edit" ? <div className="content-wrap"><ProfileEditPage locale={locale} name={name} email={accountEmail} bio={bio} city={city} photo={profilePhoto} instagram={instagram} tiktok={tiktok} setName={setName} setBio={setBio} setCity={updateCity} setInstagram={setInstagram} setTiktok={setTiktok} onPhoto={chooseProfilePhoto} onSave={saveProfile} onSaveSocial={saveSocialLinks}/></div> : selectedNotification ? <div className="content-wrap"><NotificationDetailPage locale={locale} notification={{...selectedNotification,title:localizeStoredText(locale,selectedNotification.title),message:localizeStoredText(locale,selectedNotification.message)}} onBack={() => setSelectedNotification(null)}/></div> : <>
<div className="content-wrap">{view === "today" && <TodayView locale={locale} name={name} day={day} habits={habits} stepInput={stepInput} setStepInput={setStepInput} onDate={setFocusDate} onHabit={toggleHabit} onWater={() => updateDay({ water: Math.max(0, day.water + 200) })} onSteps={() => { const parsed = Math.max(0, Math.min(100000, Number(stepInput) || 0)); updateDay({ steps: parsed }); setToast("Қадам саны сақталды"); }} onHabitAdd={addHabit} customHabit={customHabit} setCustomHabit={setCustomHabit} onMove={planActivity} onNavigate={changeView} progress={progress} waterGoal={waterGoal} stepGoal={stepGoal}/>}</div>
      <div className="content-wrap">{view === "planning" && <PlanningView locale={locale} focusDate={focusDate} onDate={setFocusDate} day={day} onPlan={planActivity} onDone={completeActivity} onNavigate={changeView}/>}</div>
      {view === "nutrition" && <div className="content-wrap nutrition-wrap"><PageIntro eyebrow={t(locale,"Nutrition")} title={t(locale,"Nutrition")} subtitle={t(locale,"Plan monthly meals, track calories and portions, and calculate groceries automatically.")}/><Board locale={locale} onPlanChange={persistMealPlanToBackend} onMealPlanned={({name,slot,day,month})=>{const date=new Date(`${month}-${String(day).padStart(2,"0")}T12:00:00`);const message=t(locale,"Planned meal reminder").replace("{meal}",name).replace("{slot}",t(locale,slot)).replace("{date}",formatDate(date,locale));addReminder(t(locale,"Meal reminder"),message,"bowl");}}/></div>}
      <div className="content-wrap">{view === "movement" && <MovementView locale={locale} planned={day.planned} done={day.done} customWorkout={customWorkout} setCustomWorkout={setCustomWorkout} onPlan={planActivity} onDone={completeActivity} onNavigate={changeView}/>}</div>
      <div className="content-wrap">{view === "care" && <CareView locale={locale} day={day} focusDate={focusDate} onDate={setFocusDate} onDay={updateDay}/>}</div>
      {view === "progress" && <div className="content-wrap"><PageIntro eyebrow={t(locale,"Progress")} title={t(locale,"Progress")} subtitle={t(locale,"Small consistent steps are the beginning of big changes.")}/><ProgressView locale={locale} stats={stats} focusDate={focusDate} onNavigate={changeView}/><AchievementGrid locale={locale} stats={stats}/></div>}
      {view === "notifications" && <div className="content-wrap"><NotificationsView locale={locale} notifications={notifications} onOpen={openNotification} onClear={clearReadNotifications}/></div>}
      {view === "support" && <div className="content-wrap"><SupportPage locale={locale} name={name} email={accountEmail} thread={currentSupportThread} draft={supportDraft} setDraft={setSupportDraft} onSend={sendSupportMessage}/></div>}
      {view === "community" && <div className="content-wrap">{adminSettings.communityEnabled ? <><PageIntro eyebrow={t(locale,"Community")} title={t(locale,"Community")} subtitle={t(locale,"Share photos, support one another, and celebrate small wins.")}/><CommunityFeed locale={locale} author={name}/></> : <section className="panel"><h2>{t(locale,"Community")}</h2><p>{t(locale,"Community posting is disabled by an administrator.")}</p></section>}</div>}
      <div className="content-wrap">{view === "friends" && <FriendsView locale={locale} friends={friends} selected={selectedFriend} query={friendQuery} setQuery={setFriendQuery} onAdd={addFriend} onSelect={setSelectedFriend} onRemove={removeFriend} onSaveLinks={saveFriendSocialLinks}/>}</div>
      <div className="content-wrap">{view === "restaurants" && <RestaurantView locale={locale} reservations={reservations} booking={booking} setBooking={setBooking} onReserve={reserve} onCancel={cancelReservation}/>}</div>
      <div className="content-wrap">{view === "profile" && <ProfileView locale={locale} theme={theme} name={name} email={accountEmail} bio={bio} city={city} photo={profilePhoto} instagram={instagram} tiktok={tiktok} setInstagram={setInstagram} setTiktok={setTiktok} stats={stats} setName={setName} setBio={setBio} setCity={updateCity} onPhoto={chooseProfilePhoto} onSave={saveProfile} onSaveSocial={saveSocialLinks} onLocale={selectLocale} onTheme={selectTheme} onExport={exportData} onRegistration={openRegistration} onSignOut={signOut} onNavigate={changeView} onAdminDemo={useAdminDemo} onUserDemo={useUserDemo} isAdmin={isAdmin}/>}</div>
      <div className="content-wrap">{view === "admin" && isAdmin && <AdminView page={adminPage} locale={locale} email={accountEmail} name={name} threads={supportThreads} reservations={reservations} onReply={replyToSupport} onReservationStatus={setReservationStatus} onBroadcast={sendAdminAnnouncement} onExport={exportData} onSettingsSave={setAdminSettings}/>}</div></>}<SupportBot locale={locale} name={name}/>{toast && <div className="toast-message" role="status">✓ {toast}</div>}
    </main>
  </div>;
}
