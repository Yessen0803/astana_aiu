export type Habit = { id: string; title: string; icon: string };
export type DayData = { steps: number; water: number; completedHabits: string[]; planned: string[]; done: string[]; mood: string; sleepStart: string; sleepEnd: string; sleepLogged?: boolean; careDone: string[]; note: string };
export type Activity = { id: string; name: string; date: string; minutes: number };
export type Friend = { id: string; name: string; city: string; bio: string; sessions: number; points: number; color: string; instagram?: string; tiktok?: string };
export type Reservation = { id: string; place: string; date: string; time: string; guests: number };
export type HealthNotification = { id: string; title: string; message: string; icon: string; createdAt: string; read: boolean };
export type SupportMessage = { id: string; sender: "user" | "admin"; text: string; createdAt: string };
export type SupportThread = { id: string; name: string; email: string; messages: SupportMessage[] };
