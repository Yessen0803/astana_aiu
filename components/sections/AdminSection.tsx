/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import AppIcon from "@/components/AppIcon";
import { PageIntro } from "@/components/sections/PageIntro";
import type { Friend, Reservation, SupportThread } from "@/lib/healthflow-types";
import { demoFriends, read, save } from "@/lib/healthflow-app";
import { t, type Locale } from "@/lib/healthflow";
import { recommendedPosts } from "@/data/community";

type AdminPost = { id: string; author: string; caption: string; createdAt: string; image?: string; art?: string; demo?: boolean; likes?: string[]; comments?: unknown[] };
type AdminReport = { id: string; postId: string; postAuthor: string; reporter: string; reason: string; details: string; createdAt: string };
type AdminRole = "user" | "moderator" | "admin";
type AdminPerson = { id: string; name: string; email?: string; city?: string; role: AdminRole };
type AdminSettings = { stepGoal: number; waterGoal: number; communityEnabled: boolean };
type AdminLog = { id: string; action: string; actor: string; createdAt: string };
const roleKey = "hf:user-roles";
const reportKey = "hf:reports";
const statusKey = "hf:user-status";
const settingsKey = "hf:admin-settings";
const auditKey = "hf:admin-audit";
const defaultSettings: AdminSettings = { stepGoal: 8000, waterGoal: 2000, communityEnabled: true };
function makeAdminLog(action: string, actor: string): AdminLog { const createdAt = new Date().toISOString(); return { id: `admin-${Date.now()}`, action, actor, createdAt }; }

export function AdminView({ locale, email, name, threads, reservations, onReply, onReservationStatus, onBroadcast, onExport, onSettingsSave }: { locale: Locale; email: string; name: string; threads: SupportThread[]; reservations: Reservation[]; onReply: (threadId: string, text: string) => void; onReservationStatus: (id: string, status: "accepted" | "rejected") => void; onBroadcast: (title: string, message: string) => void; onExport: () => void; onSettingsSave: (settings: AdminSettings) => void }) {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [selectedThread, setSelectedThread] = useState("");
  const [reply, setReply] = useState("");
  const [tab, setTab] = useState<"support" | "posts" | "reports" | "bookings" | "roles" | "users" | "announcements" | "settings" | "audit">("reports");
  const [roles, setRoles] = useState<Record<string, AdminRole>>({});
  const [databasePeople, setDatabasePeople] = useState<AdminPerson[] | null>(null);
  const [currentDatabaseUserId, setCurrentDatabaseUserId] = useState("");
  const [userStatuses, setUserStatuses] = useState<Record<string, "active" | "restricted">>({});
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [audit, setAudit] = useState<AdminLog[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementSent, setAnnouncementSent] = useState(false);
  const [roleSaved, setRoleSaved] = useState(false);
  const [detail, setDetail] = useState<AdminReport | null>(null);

  useEffect(() => {
    const saved = read<AdminPost[]>("hf:posts", []);
    const savedIds = new Set(saved.map((post) => post.id));
    const hidden = read<string[]>("hf:hidden-posts", []);
    setPosts([...saved, ...recommendedPosts.filter((post) => !savedIds.has(post.id) && !hidden.includes(post.id)).map((post) => ({ ...post, demo: true }))]);
    setReports(read<AdminReport[]>(reportKey, []));
    setRoles(read<Record<string, AdminRole>>(roleKey, {}));
    setUserStatuses(read(statusKey, {}));
    setSettings({ ...defaultSettings, ...read<Partial<AdminSettings>>(settingsKey, {}) });
    setAudit(read<AdminLog[]>(auditKey, []));
    void fetch("/api/admin/users", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json() as { currentUserId: string; users: Array<{ id: string; display_name: string; city: string; role: AdminRole }> };
      const loaded = result.users.map((user) => ({ id: user.id, name: user.display_name, city: user.city, role: user.role }));
      setDatabasePeople(loaded);
      setCurrentDatabaseUserId(result.currentUserId);
      setRoles((current) => ({ ...current, ...Object.fromEntries(loaded.map((user) => [user.id, user.role])) }));
    }).catch(() => {});
  }, []);
  const activeThread = threads.find((thread) => thread.id === selectedThread) ?? threads[0];
  const people: AdminPerson[] = databasePeople ?? [{ id: email || "current-user", name: name || t(locale, "User"), email: email || t(locale, "Guest user"), role: "admin" }, ...read<Friend[]>("hf:friends", demoFriends).map((friend) => ({ id: `friend:${friend.id}`, name: friend.name, email: t(locale, "Community member"), role: "user" as const }))];
  function logAction(action: string) {
    const next = [makeAdminLog(action, name || email), ...audit].slice(0, 100);
    setAudit(next); save(auditKey, next);
  }

  function removePost(id: string) {
    const removed = posts.find((post) => post.id === id);
    const next = posts.filter((post) => post.id !== id); setPosts(next); save("hf:posts", next.filter((post) => !post.demo));
    if (removed?.demo) save("hf:hidden-posts", [...new Set([...read<string[]>("hf:hidden-posts", []), id])]);
    logAction("Post removed");
  }
  function dismissReport(id: string) {
    const next = reports.filter((report) => report.id !== id); setReports(next); save(reportKey, next); setDetail(null); logAction("Report dismissed");
  }
  function deleteReportedPost(report: AdminReport) { removePost(report.postId); dismissReport(report.id); }
  function submitReply(event: FormEvent) { event.preventDefault(); if (!activeThread || !reply.trim()) return; onReply(activeThread.id, reply); setReply(""); logAction("Support reply sent"); }
  function changeBookingStatus(id: string, status: "accepted" | "rejected") { onReservationStatus(id, status); logAction("Booking status updated"); }
  function updateRole(id: string, role: AdminRole) { setRoles((current) => ({ ...current, [id]: role })); setRoleSaved(false); }
  async function persistRoles() {
    if (databasePeople) {
      const changes = databasePeople.filter((person) => (roles[person.id] || person.role) !== person.role);
      for (const person of changes) {
        const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: person.id, role: roles[person.id] }) });
        if (!response.ok) { setRoleSaved(false); return; }
      }
      const refreshed = await fetch("/api/admin/users", { cache: "no-store" });
      if (refreshed.ok) {
        const result = await refreshed.json() as { users: Array<{ id: string; display_name: string; city: string; role: AdminRole }> };
        setDatabasePeople(result.users.map((user) => ({ id: user.id, name: user.display_name, city: user.city, role: user.role })));
      }
    }
    const ok = save(roleKey, roles); setRoleSaved(ok); if (ok) logAction("Role updated");
  }
  function toggleRestriction(id: string) {
    const next = { ...userStatuses, [id]: userStatuses[id] === "restricted" ? "active" as const : "restricted" as const };
    setUserStatuses(next); save(statusKey, next); logAction(next[id] === "restricted" ? "Set restriction" : "Remove restriction");
  }
  function submitAnnouncement(event: FormEvent) {
    event.preventDefault();
    const title = announcementTitle.trim(); const message = announcementMessage.trim();
    if (!title || !message) return;
    onBroadcast(title, message); setAnnouncementTitle(""); setAnnouncementMessage(""); setAnnouncementSent(true); logAction("Announcement sent");
  }
  function persistSettings(event: FormEvent) {
    event.preventDefault();
    const next = { ...settings, stepGoal: Math.max(1000, Math.min(50000, Number(settings.stepGoal) || defaultSettings.stepGoal)), waterGoal: Math.max(500, Math.min(6000, Number(settings.waterGoal) || defaultSettings.waterGoal)) };
    setSettings(next); const ok = save(settingsKey, next); if (ok) { onSettingsSave(next); logAction("Settings saved"); setAnnouncementSent(false); }
  }
  function postHref(postId: string) { return `/community#post-${encodeURIComponent(postId)}`; }
  const post = (id: string) => posts.find((item) => item.id === id);
  const isDemoAccount = email.endsWith("@healthflow.local") || !email;

  return <><PageIntro eyebrow={t(locale, "ADMIN")} title={t(locale, "Admin dashboard")} subtitle={t(locale, "Manage local demo content and review community posts.")}/>
    <section className="admin-account-card"><span className="admin-shield"><AppIcon name="settings"/></span><div><b>{t(locale, isDemoAccount ? "Demo administrator" : "Supabase administrator")}</b><small>{email} · {t(locale, isDemoAccount ? "Local demo only — this is not protected by server authentication." : "Signed in through Supabase authentication.")}</small></div><span className="status-chip">{t(locale, "Administrator")}</span></section>
    <div className="stats-grid admin-stats"><article className="stat-card"><span><AppIcon name="community"/> {t(locale, "Community posts")}</span><b>{posts.length}</b><small>{t(locale, "saved in this browser")}</small></article><article className="stat-card"><span><AppIcon name="friends"/> {t(locale, "Users")}</span><b>{people.length}</b><small>{t(locale, "local profiles")}</small></article><article className="stat-card"><span><AppIcon name="flag"/> {t(locale, "Pending reports")}</span><b>{reports.length}</b><small>{t(locale, "reported posts")}</small></article><article className="stat-card"><span><AppIcon name="shopping"/> {t(locale, "Bookings")}</span><b>{reservations.length}</b><small>{t(locale, "saved in this browser")}</small></article><article className="stat-card"><span><AppIcon name="movement"/> {t(locale, "Total activities")}</span><b>{read<{id:string}[]>("hf:activity-log", []).length}</b><small>{t(locale, "saved in this browser")}</small></article><article className="stat-card"><span><AppIcon name="support"/> {t(locale, "Support conversations")}</span><b>{threads.length}</b><small>{t(locale, "local profiles")}</small></article></div>
    <nav className="admin-feature-tabs" aria-label={t(locale, "Admin sections")}>
      {([ ["reports", "Reports", reports.length], ["bookings", "Bookings", reservations.length], ["posts", "Community posts", posts.length], ["support", "Support inbox", threads.length], ["users", "Users", people.length], ["roles", "Manage user roles", people.length], ["announcements", "Announcements", 0], ["settings", "Application settings", 0], ["audit", "Audit log", audit.length] ] as const).map(([key, label, count]) => <button key={key} type="button" className={tab === key ? "selected" : ""} aria-pressed={tab === key} onClick={() => { setTab(key); setAnnouncementSent(false); }}>{t(locale, label)} <span>{count}</span></button>)}
    </nav>

    {tab === "users" && <section className="panel admin-roles-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Access")}</span><h2>{t(locale, "Manage users")}</h2><p>{databasePeople ? t(locale, "Users are loaded from the connected database.") : t(locale, "This is the local demo list. Sign in with a Supabase administrator account to load registered users.")}</p></div><span className="count-pill">{people.length}</span></div><div className="admin-user-list">{people.map((person) => { const restricted = userStatuses[person.id] === "restricted"; const current = databasePeople ? person.id === currentDatabaseUserId : person.id === (email || "current-user"); return <article className="admin-user-row" key={person.id}><div className="admin-user-avatar"><AppIcon name="profile"/></div><div className="admin-user-info"><b>{person.name}{current && <span className="count-pill">{t(locale, "Current account")}</span>}</b><small>{person.email || `ID: ${person.id.slice(0, 8)}…`}{person.city ? ` · ${person.city}` : ""}</small></div><span className={`status-chip ${restricted ? "booking-status rejected" : "booking-status accepted"}`}>{t(locale, restricted ? "Restricted" : "Active")}</span><button className={`button ${restricted ? "secondary" : "danger"}`} type="button" disabled={current || Boolean(databasePeople)} onClick={() => toggleRestriction(person.id)}>{t(locale, restricted ? "Remove restriction" : "Set restriction")}</button></article>; })}</div></section>}

    {tab === "announcements" && <section className="panel admin-announcement-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Notifications")}</span><h2>{t(locale, "Send announcement")}</h2><p>{t(locale, "Announcement saved only to this browser's notification inbox.")}</p></div><span className="status-chip">{t(locale, "Send to this demo inbox")}</span></div><form className="admin-announcement-form" onSubmit={submitAnnouncement}><label>{t(locale, "Announcement title")}<input value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} maxLength={90} required/></label><label>{t(locale, "Announcement message")}<textarea value={announcementMessage} onChange={(event) => setAnnouncementMessage(event.target.value)} rows={4} maxLength={500} required/></label><button className="button primary" type="submit"><AppIcon name="send"/>{t(locale, "Send announcement")}</button>{announcementSent && <p className="inline-message" role="status">{t(locale, "Announcement sent")}</p>}</form></section>}

    {tab === "settings" && <section className="panel admin-settings-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Application settings")}</span><h2>{t(locale, "Application settings")}</h2><p>{t(locale, "Admin settings saved in this browser only.")}</p></div></div><form className="admin-settings-form" onSubmit={persistSettings}><label>{t(locale, "Daily step goal")}<input type="number" min={1000} max={50000} step={500} value={settings.stepGoal} onChange={(event) => setSettings((current) => ({ ...current, stepGoal: Number(event.target.value) }))}/></label><label>{t(locale, "Daily water goal (ml)")}<input type="number" min={500} max={6000} step={100} value={settings.waterGoal} onChange={(event) => setSettings((current) => ({ ...current, waterGoal: Number(event.target.value) }))}/></label><label className="admin-toggle-row"><span><b>{t(locale, "Community posting")}</b><small>{t(locale, settings.communityEnabled ? "Community posting is enabled." : "Community posting is disabled.")}</small></span><input type="checkbox" checked={settings.communityEnabled} onChange={(event) => setSettings((current) => ({ ...current, communityEnabled: event.target.checked }))}/></label><button className="button primary" type="submit">{t(locale, "Save settings")}</button></form><div className="admin-export-row"><div><b>{t(locale, "Data and security")}</b><small>{t(locale, "Export app data")}</small></div><button className="button secondary" type="button" onClick={() => { onExport(); logAction("Export app data"); }}>{t(locale, "Export")}</button></div></section>}

    {tab === "audit" && <section className="panel admin-audit-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Data and security")}</span><h2>{t(locale, "Audit log")}</h2></div><span className="count-pill">{audit.length}</span></div>{audit.length ? <div className="admin-audit-list">{audit.map((entry) => <article className="admin-audit-row" key={entry.id}><div><b>{t(locale, entry.action)}</b><small>{t(locale, "Actor")}: {entry.actor}</small></div><time>{new Date(entry.createdAt).toLocaleString(locale === "kk" ? "kk-KZ" : locale === "ru" ? "ru-RU" : "en-US", { dateStyle: "medium", timeStyle: "short" })}</time></article>)}</div> : <div className="empty-state"><b>{t(locale, "No admin actions yet")}</b></div>}</section>}

    {tab === "reports" && <section className="panel admin-reports-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Moderation")}</span><h2>{t(locale, "Manage reports")}</h2></div><span className="count-pill">{reports.length}</span></div>{reports.length ? <div className="admin-report-list">{reports.map((report) => <article className="admin-report-card" key={report.id}><div className="admin-report-heading"><div><b>{t(locale, "Reporter")}: {report.reporter}</b><small>{t(locale, "Reported post")}: {report.postAuthor}</small></div><time>{new Date(report.createdAt).toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU", { dateStyle: "medium", timeStyle: "short" })}</time></div><p><b>{t(locale, "Reason")}:</b> {t(locale, report.reason)}</p>{report.details && <p>{report.details}</p>}<button className="text-button report-post-link" type="button" onClick={() => setDetail(report)}>{t(locale, "View details")} · {report.postId} <AppIcon name="arrowRight"/></button><div className="admin-report-actions"><button className="button secondary" type="button" onClick={() => dismissReport(report.id)}>{t(locale, "Dismiss report")}</button><button className="button danger" type="button" onClick={() => deleteReportedPost(report)}>{t(locale, "Delete post")}</button></div></article>)}</div> : <div className="empty-state"><span><AppIcon name="flag"/></span><b>{t(locale, "No reports yet")}</b></div>}</section>}

    {tab === "bookings" && <section className="panel admin-bookings-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Bookings")}</span><h2>{t(locale, "Update booking status")}</h2></div></div>{reservations.length ? reservations.map((reservation) => <article className="admin-booking-row" key={reservation.id}><div><b>{reservation.place}</b><small>{reservation.date} · {reservation.time} · {reservation.guests} {t(locale, "Guests")}</small><p>{reservation.description ? t(locale, reservation.description) : t(locale, "Reservation request received.")}</p></div><span className={`status-chip booking-status ${reservation.status || "pending"}`}>{t(locale, reservation.status === "accepted" ? "Accepted" : reservation.status === "rejected" ? "Rejected" : "Pending")}</span><div className="admin-report-actions"><button className="button secondary" type="button" onClick={() => changeBookingStatus(reservation.id, "accepted")}>{t(locale, "Accepted")}</button><button className="button danger" type="button" onClick={() => changeBookingStatus(reservation.id, "rejected")}>{t(locale, "Rejected")}</button></div></article>) : <div className="empty-state"><b>{t(locale, "No bookings yet")}</b></div>}</section>}

    {tab === "posts" && <section className="panel admin-posts-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Moderation")}</span><h2>{t(locale, "Community posts")}</h2></div><span className="count-pill">{posts.length}</span></div>{posts.length ? posts.map((item) => <article className="admin-post-row" key={item.id}>{item.image && <Image src={item.image} alt="" width={80} height={80} unoptimized/>}<div><b>{item.author}</b><p>{item.caption ? (item.demo ? t(locale,item.caption) : item.caption) : t(locale, "Photo post")}</p><small>{new Date(item.createdAt).toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU")}</small></div><a className="text-button" href={postHref(item.id)}>{t(locale, "View details")}</a><button className="text-button danger" type="button" onClick={() => removePost(item.id)}>{t(locale, "Delete post")}</button></article>) : <div className="empty-state"><b>{t(locale, "No community posts yet")}</b></div>}</section>}

    {tab === "support" && <section className="panel admin-inbox-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Support inbox")}</span><h2>{t(locale, "Messages from users")}</h2></div><span className="count-pill">{threads.length}</span></div>{threads.length ? <div className="admin-inbox-layout"><div className="admin-thread-list">{threads.map((thread) => <button key={thread.id} className={activeThread?.id === thread.id ? "admin-thread-select selected" : "admin-thread-select"} onClick={() => setSelectedThread(thread.id)}><b>{thread.name}</b><small>{thread.email || t(locale, "Guest user")}</small><span>{thread.messages[thread.messages.length - 1]?.text || ""}</span></button>)}</div>{activeThread && <div className="admin-thread-detail"><div className="admin-thread-title"><div><b>{activeThread.name}</b><small>{activeThread.email || t(locale, "Guest user")}</small></div><span className="status-chip">{t(locale, "User")}</span></div><div className="support-thread-messages admin-thread-messages">{activeThread.messages.map((message) => <article className={`support-thread-message ${message.sender}`} key={message.id}><b>{message.sender === "admin" ? t(locale, "Administrator") : activeThread.name}</b><p>{message.text}</p><time>{new Date(message.createdAt).toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU", { dateStyle: "medium", timeStyle: "short" })}</time></article>)}</div><form className="support-compose" onSubmit={submitReply}><textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={t(locale, "Write a reply…")} maxLength={1000} required/><div><small>{t(locale, "Reply as admin")}</small><button className="button primary" type="submit"><AppIcon name="send"/> {t(locale, "Send reply")}</button></div></form></div>}</div> : <div className="support-thread-empty"><span><AppIcon name="mail"/></span><b>{t(locale, "No support messages yet")}</b><p>{t(locale, "User messages will appear here.")}</p></div>}</section>}

    {tab === "roles" && <section className="panel admin-roles-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Access")}</span><h2>{t(locale, "Manage user roles")}</h2><p>{databasePeople ? t(locale, "Roles are saved in the connected database.") : t(locale, "Roles are saved locally in this demo. Sign in with a Supabase administrator to manage shared roles.")}</p></div></div>{people.map((person) => <div className="admin-role-row" key={person.id}><div><b>{person.name}</b><small>{person.email || `ID: ${person.id.slice(0, 8)}…`}</small></div><label><span>{t(locale, "Role")}</span><select value={roles[person.id] || person.role} disabled={Boolean(databasePeople) && person.id === currentDatabaseUserId} onChange={(event) => updateRole(person.id, event.target.value as AdminRole)}><option value="user">{t(locale, "User")}</option><option value="moderator">{t(locale, "Moderator")}</option><option value="admin">{t(locale, "Administrator")}</option></select></label></div>)}<button className="button primary" type="button" onClick={persistRoles}>{t(locale, "Save role")}</button>{roleSaved && <p className="inline-message" role="status">{t(locale, "Role saved")}</p>}</section>}

    {detail && <div className="modal-backdrop" onClick={() => setDetail(null)}><section className="community-detail-modal admin-report-detail" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" aria-label={t(locale, "Close")} onClick={() => setDetail(null)}><AppIcon name="close"/></button><span className="eyebrow">{t(locale, "Reported post")}</span><h2>{post(detail.postId)?.caption ? (post(detail.postId)?.demo ? t(locale,post(detail.postId)!.caption) : post(detail.postId)!.caption) : t(locale, "Post details")}</h2><p><b>{t(locale, "Reporter")}:</b> {detail.reporter}</p><p><b>{t(locale, "Author")}:</b> {detail.postAuthor}</p><p><b>{t(locale, "Reason")}:</b> {t(locale, detail.reason)}</p>{detail.details && <p><b>{t(locale, "Details")}:</b> {detail.details}</p>}<a href={postHref(detail.postId)}>{t(locale, "Open post")} ↗</a><div className="admin-report-actions"><button className="button secondary" onClick={() => dismissReport(detail.id)}>{t(locale, "Dismiss report")}</button><button className="button danger" onClick={() => deleteReportedPost(detail)}>{t(locale, "Delete post")}</button></div></section></div>}
    <p className="local-note">{t(locale, "Admin changes are stored in this browser only; shared roles and reports need a server.")}</p>
  </>;
}
