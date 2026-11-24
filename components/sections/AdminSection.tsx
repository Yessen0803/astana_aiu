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
const roleKey = "hf:user-roles";
const reportKey = "hf:reports";

export function AdminView({ locale, email, name, threads, reservations, onReply, onReservationStatus }: { locale: Locale; email: string; name: string; threads: SupportThread[]; reservations: Reservation[]; onReply: (threadId: string, text: string) => void; onReservationStatus: (id: string, status: "accepted" | "rejected") => void }) {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [selectedThread, setSelectedThread] = useState("");
  const [reply, setReply] = useState("");
  const [tab, setTab] = useState<"support" | "posts" | "reports" | "bookings" | "roles">("reports");
  const [roles, setRoles] = useState<Record<string, AdminRole>>({});
  const [roleSaved, setRoleSaved] = useState(false);
  const [detail, setDetail] = useState<AdminReport | null>(null);

  useEffect(() => {
    const saved = read<AdminPost[]>("hf:posts", []);
    const savedIds = new Set(saved.map((post) => post.id));
    const hidden = read<string[]>("hf:hidden-posts", []);
    setPosts([...saved, ...recommendedPosts.filter((post) => !savedIds.has(post.id) && !hidden.includes(post.id)).map((post) => ({ ...post, demo: true }))]);
    setReports(read<AdminReport[]>(reportKey, []));
    setRoles(read<Record<string, AdminRole>>(roleKey, {}));
  }, []);
  const activeThread = threads.find((thread) => thread.id === selectedThread) ?? threads[0];
  const people = [{ id: email || "current-user", name: name || t(locale, "User"), email: email || t(locale, "Guest user") }, ...read<Friend[]>("hf:friends", demoFriends).map((friend) => ({ id: `friend:${friend.id}`, name: friend.name, email: t(locale, "Community member") }))];

  function removePost(id: string) {
    const removed = posts.find((post) => post.id === id);
    const next = posts.filter((post) => post.id !== id); setPosts(next); save("hf:posts", next.filter((post) => !post.demo));
    if (removed?.demo) save("hf:hidden-posts", [...new Set([...read<string[]>("hf:hidden-posts", []), id])]);
  }
  function dismissReport(id: string) {
    const next = reports.filter((report) => report.id !== id); setReports(next); save(reportKey, next); setDetail(null);
  }
  function deleteReportedPost(report: AdminReport) { removePost(report.postId); dismissReport(report.id); }
  function submitReply(event: FormEvent) { event.preventDefault(); if (!activeThread || !reply.trim()) return; onReply(activeThread.id, reply); setReply(""); }
  function updateRole(id: string, role: AdminRole) { setRoles((current) => ({ ...current, [id]: role })); setRoleSaved(false); }
  function persistRoles() { const ok = save(roleKey, roles); setRoleSaved(ok); }
  function postHref(postId: string) { return `/community#post-${encodeURIComponent(postId)}`; }
  const post = (id: string) => posts.find((item) => item.id === id);

  return <><PageIntro eyebrow={t(locale, "ADMIN")} title={t(locale, "Admin dashboard")} subtitle={t(locale, "Manage local demo content and review community posts.")}/>
    <section className="admin-account-card"><span className="admin-shield"><AppIcon name="settings"/></span><div><b>{t(locale, "Demo administrator")}</b><small>{email} · {t(locale, "Local demo only — this is not protected by server authentication.")}</small></div><span className="status-chip">{t(locale, "Administrator")}</span></section>
    <div className="stats-grid admin-stats"><article className="stat-card"><span><AppIcon name="community"/> {t(locale, "Community posts")}</span><b>{posts.length}</b><small>{t(locale, "saved in this browser")}</small></article><article className="stat-card"><span><AppIcon name="friends"/> {t(locale, "Friends")}</span><b>{read<Friend[]>("hf:friends", demoFriends).length}</b><small>{t(locale, "local profiles")}</small></article><article className="stat-card"><span><AppIcon name="flag"/> {t(locale, "Reports")}</span><b>{reports.length}</b><small>{t(locale, "reported posts")}</small></article><article className="stat-card"><span><AppIcon name="shopping"/> {t(locale, "Bookings")}</span><b>{reservations.length}</b><small>{t(locale, "saved in this browser")}</small></article></div>
    <nav className="admin-feature-tabs" aria-label={t(locale, "Admin sections")}>
      {([ ["reports", "Reports", reports.length], ["bookings", "Bookings", reservations.length], ["posts", "Community posts", posts.length], ["support", "Support inbox", threads.length], ["roles", "Manage user roles", people.length] ] as const).map(([key, label, count]) => <button key={key} type="button" className={tab === key ? "selected" : ""} aria-pressed={tab === key} onClick={() => setTab(key)}>{t(locale, label)} <span>{count}</span></button>)}
    </nav>

    {tab === "reports" && <section className="panel admin-reports-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Moderation")}</span><h2>{t(locale, "Manage reports")}</h2></div><span className="count-pill">{reports.length}</span></div>{reports.length ? <div className="admin-report-list">{reports.map((report) => <article className="admin-report-card" key={report.id}><div className="admin-report-heading"><div><b>{t(locale, "Reporter")}: {report.reporter}</b><small>{t(locale, "Reported post")}: {report.postAuthor}</small></div><time>{new Date(report.createdAt).toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU", { dateStyle: "medium", timeStyle: "short" })}</time></div><p><b>{t(locale, "Reason")}:</b> {t(locale, report.reason)}</p>{report.details && <p>{report.details}</p>}<button className="text-button report-post-link" type="button" onClick={() => setDetail(report)}>{t(locale, "View details")} · {report.postId} <AppIcon name="arrowRight"/></button><div className="admin-report-actions"><button className="button secondary" type="button" onClick={() => dismissReport(report.id)}>{t(locale, "Dismiss report")}</button><button className="button danger" type="button" onClick={() => deleteReportedPost(report)}>{t(locale, "Delete post")}</button></div></article>)}</div> : <div className="empty-state"><span><AppIcon name="flag"/></span><b>{t(locale, "No reports yet")}</b></div>}</section>}

    {tab === "bookings" && <section className="panel admin-bookings-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Bookings")}</span><h2>{t(locale, "Update booking status")}</h2></div></div>{reservations.length ? reservations.map((reservation) => <article className="admin-booking-row" key={reservation.id}><div><b>{reservation.place}</b><small>{reservation.date} · {reservation.time} · {reservation.guests} {t(locale, "Guests")}</small><p>{reservation.description ? t(locale, reservation.description) : t(locale, "Reservation request received.")}</p></div><span className={`status-chip booking-status ${reservation.status || "pending"}`}>{t(locale, reservation.status === "accepted" ? "Accepted" : reservation.status === "rejected" ? "Rejected" : "Pending")}</span><div className="admin-report-actions"><button className="button secondary" type="button" onClick={() => onReservationStatus(reservation.id, "accepted")}>{t(locale, "Accepted")}</button><button className="button danger" type="button" onClick={() => onReservationStatus(reservation.id, "rejected")}>{t(locale, "Rejected")}</button></div></article>) : <div className="empty-state"><b>{t(locale, "No bookings yet")}</b></div>}</section>}

    {tab === "posts" && <section className="panel admin-posts-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Moderation")}</span><h2>{t(locale, "Community posts")}</h2></div><span className="count-pill">{posts.length}</span></div>{posts.length ? posts.map((item) => <article className="admin-post-row" key={item.id}>{item.image && <Image src={item.image} alt="" width={80} height={80} unoptimized/>}<div><b>{item.author}</b><p>{item.caption || t(locale, "Photo post")}</p><small>{new Date(item.createdAt).toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU")}</small></div><a className="text-button" href={postHref(item.id)}>{t(locale, "View details")}</a><button className="text-button danger" type="button" onClick={() => removePost(item.id)}>{t(locale, "Delete post")}</button></article>) : <div className="empty-state"><b>{t(locale, "No community posts yet")}</b></div>}</section>}

    {tab === "support" && <section className="panel admin-inbox-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Support inbox")}</span><h2>{t(locale, "Messages from users")}</h2></div><span className="count-pill">{threads.length}</span></div>{threads.length ? <div className="admin-inbox-layout"><div className="admin-thread-list">{threads.map((thread) => <button key={thread.id} className={activeThread?.id === thread.id ? "admin-thread-select selected" : "admin-thread-select"} onClick={() => setSelectedThread(thread.id)}><b>{thread.name}</b><small>{thread.email || t(locale, "Guest user")}</small><span>{thread.messages[thread.messages.length - 1]?.text || ""}</span></button>)}</div>{activeThread && <div className="admin-thread-detail"><div className="admin-thread-title"><div><b>{activeThread.name}</b><small>{activeThread.email || t(locale, "Guest user")}</small></div><span className="status-chip">{t(locale, "User")}</span></div><div className="support-thread-messages admin-thread-messages">{activeThread.messages.map((message) => <article className={`support-thread-message ${message.sender}`} key={message.id}><b>{message.sender === "admin" ? t(locale, "Administrator") : activeThread.name}</b><p>{message.text}</p><time>{new Date(message.createdAt).toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU", { dateStyle: "medium", timeStyle: "short" })}</time></article>)}</div><form className="support-compose" onSubmit={submitReply}><textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={t(locale, "Write a reply…")} maxLength={1000} required/><div><small>{t(locale, "Reply as admin")}</small><button className="button primary" type="submit"><AppIcon name="send"/> {t(locale, "Send reply")}</button></div></form></div>}</div> : <div className="support-thread-empty"><span><AppIcon name="mail"/></span><b>{t(locale, "No support messages yet")}</b><p>{t(locale, "User messages will appear here.")}</p></div>}</section>}

    {tab === "roles" && <section className="panel admin-roles-panel"><div className="panel-heading"><div><span className="eyebrow">{t(locale, "Access")}</span><h2>{t(locale, "Manage user roles")}</h2><p>{t(locale, "Assign user, moderator, or administrator access.")}</p></div></div>{people.map((person) => <div className="admin-role-row" key={person.id}><div><b>{person.name}</b><small>{person.email}</small></div><label><span>{t(locale, "Role")}</span><select value={roles[person.id] || (person.id === (email || "current-user") ? "admin" : "user")} onChange={(event) => updateRole(person.id, event.target.value as AdminRole)}><option value="user">{t(locale, "User")}</option><option value="moderator">{t(locale, "Moderator")}</option><option value="admin">{t(locale, "Administrator")}</option></select></label></div>)}<button className="button primary" type="button" onClick={persistRoles}>{t(locale, "Save role")}</button>{roleSaved && <p className="inline-message" role="status">{t(locale, "Role saved")}</p>}</section>}

    {detail && <div className="modal-backdrop" onClick={() => setDetail(null)}><section className="community-detail-modal admin-report-detail" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" aria-label={t(locale, "Close")} onClick={() => setDetail(null)}><AppIcon name="close"/></button><span className="eyebrow">{t(locale, "Reported post")}</span><h2>{post(detail.postId)?.caption || t(locale, "Post details")}</h2><p><b>{t(locale, "Reporter")}:</b> {detail.reporter}</p><p><b>{t(locale, "Author")}:</b> {detail.postAuthor}</p><p><b>{t(locale, "Reason")}:</b> {t(locale, detail.reason)}</p>{detail.details && <p><b>{t(locale, "Details")}:</b> {detail.details}</p>}<a href={postHref(detail.postId)}>{t(locale, "Open post")} ↗</a><div className="admin-report-actions"><button className="button secondary" onClick={() => dismissReport(detail.id)}>{t(locale, "Dismiss report")}</button><button className="button danger" onClick={() => deleteReportedPost(detail)}>{t(locale, "Delete post")}</button></div></section></div>}
    <p className="local-note">{t(locale, "Admin changes are stored in this browser only; shared roles and reports need a server.")}</p>
  </>;
}
