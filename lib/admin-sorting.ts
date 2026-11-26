import type { Reservation, SupportThread } from "@/lib/healthflow-types";

export type AdminReportSortItem = { createdAt: string; reason: string; reporter: string };
export type AdminPersonSortItem = { id: string; name: string; role: string };
export type AdminPostSortItem = { createdAt: string; likes?: string[] };
export type AdminAuditSortItem = { createdAt: string; action: string };

const time = (value: string | undefined) => Date.parse(value || "") || 0;

export function sortAdminReports<T extends AdminReportSortItem>(items: T[], mode: string) {
  return [...items].sort((a, b) => {
    if (mode === "oldest") return time(a.createdAt) - time(b.createdAt);
    if (mode === "reason") return a.reason.localeCompare(b.reason);
    if (mode === "reporter") return a.reporter.localeCompare(b.reporter);
    return time(b.createdAt) - time(a.createdAt);
  });
}

export function sortAdminPeople<T extends AdminPersonSortItem>(items: T[], mode: string, roleOverrides: Record<string, string> = {}) {
  return [...items].sort((a, b) => {
    if (mode === "role") return (roleOverrides[a.id] || a.role).localeCompare(roleOverrides[b.id] || b.role) || a.name.localeCompare(b.name);
    return mode === "name-desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
  });
}

export function sortAdminReservations<T extends Reservation>(items: T[], mode: string) {
  return [...items].sort((a, b) => {
    if (mode === "status") return (a.status || "pending").localeCompare(b.status || "pending") || a.date.localeCompare(b.date);
    return mode === "latest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
  });
}

export function sortAdminPosts<T extends AdminPostSortItem>(items: T[], mode: string) {
  return [...items].sort((a, b) => {
    if (mode === "most-liked") return (b.likes?.length || 0) - (a.likes?.length || 0);
    return mode === "oldest" ? time(a.createdAt) - time(b.createdAt) : time(b.createdAt) - time(a.createdAt);
  });
}

export function sortAdminThreads<T extends SupportThread>(items: T[], mode: string) {
  const lastMessageTime = (thread: SupportThread) => time(thread.messages[thread.messages.length - 1]?.createdAt);
  return [...items].sort((a, b) => {
    if (mode === "name") return a.name.localeCompare(b.name);
    return mode === "oldest" ? lastMessageTime(a) - lastMessageTime(b) : lastMessageTime(b) - lastMessageTime(a);
  });
}

export function sortAdminAudit<T extends AdminAuditSortItem>(items: T[], mode: string) {
  return [...items].sort((a, b) => {
    if (mode === "action") return a.action.localeCompare(b.action);
    return mode === "oldest" ? time(a.createdAt) - time(b.createdAt) : time(b.createdAt) - time(a.createdAt);
  });
}
