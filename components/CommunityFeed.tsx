"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { FormEvent, KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import NextImage from "next/image";
import AppIcon from "@/components/AppIcon";
import { recommendedPosts } from "@/data/community";
import { t, type Locale } from "@/lib/healthflow";

type Comment = { id: string; author: string; text: string };
type Post = { id: string; author: string; caption: string; image?: string; createdAt: string; likes: string[]; comments: Comment[]; demo?: boolean; art?: string };
type Report = { id: string; postId: string; postAuthor: string; reporter: string; reason: string; details: string; createdAt: string };
const storageKey = "hf:posts";
const reportKey = "hf:reports";
const stickers = [
  { icon: "care", label: "Қолдау" }, { icon: "movement", label: "Күшті" },
  { icon: "trophy", label: "Жарайсың" }, { icon: "heart", label: "Жүрек" },
  { icon: "sun", label: "Керемет" }, { icon: "check", label: "Алға" },
  { icon: "profile", label: "Сені қолдаймын" }, { icon: "community", label: "Біргеміз" },
];
const seedPosts: Post[] = recommendedPosts.map((post) => ({ ...post, demo: true }));
function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Select an image file."));
    const reader = new FileReader(), img = new Image();
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.onload = () => { img.onload = () => { const scale = Math.min(1, 1000 / Math.max(img.width, img.height)), canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale)); canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", .7)); }; img.onerror = () => reject(new Error("Could not open the image.")); img.src = String(reader.result); };
    reader.readAsDataURL(file);
  });
}

export default function CommunityFeed({ locale, author }: { locale: Locale; author: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"recommendations" | "mine">("recommendations");
  const [stickerPost, setStickerPost] = useState<string | null>(null);
  const [menuPost, setMenuPost] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [reportPost, setReportPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]") as Post[];
      const hidden = JSON.parse(localStorage.getItem("hf:hidden-posts") || "[]") as string[];
      setHiddenPostIds(hidden);
      const savedIds = new Set(saved.map((post) => post.id));
      setPosts([...saved, ...seedPosts.filter((post) => !savedIds.has(post.id) && !hidden.includes(post.id))]);
    } catch { setPosts(seedPosts); }
  }, []);

  function commit(next: Post[]) {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setPosts(next); return true; }
    catch { setMessage(t(locale, "Storage is full. Remove an old photo post.")); return false; }
  }
  async function publish(event: FormEvent) {
    event.preventDefault();
    if (!photo) { setMessage(t(locale, "Choose a photo first.")); return; }
    if (photo.size > 12 * 1024 * 1024) { setMessage(t(locale, "Photo must be smaller than 12 MB.")); return; }
    try {
      const image = await compress(photo);
      if (image.length > 600000) { setMessage(t(locale, "Choose a smaller photo.")); return; }
      const next = [{ id: `post-${Date.now()}`, author: author || "Есен", caption: caption.trim(), image, createdAt: new Date().toISOString(), likes: [], comments: [] }, ...posts].slice(0, 12 + seedPosts.length);
      if (commit(next)) { setCaption(""); setPhoto(null); const input = document.getElementById("community-photo") as HTMLInputElement | null; if (input) input.value = ""; setMessage(t(locale, "Photo published.")); setTab("mine"); }
    } catch (error) { setMessage(error instanceof Error ? error.message : t(locale, "Could not save the photo.")); }
  }
  function toggleLike(post: Post) {
    commit(posts.map((item) => item.id === post.id ? { ...item, likes: item.likes.includes(author) ? item.likes.filter((name) => name !== author) : [...item.likes, author] } : item));
  }
  function submitComment(post: Post, text: string) {
    const value = text.trim();
    if (!value) return;
    const next = posts.map((item) => item.id === post.id ? { ...item, comments: [...item.comments, { id: `comment-${Date.now()}`, author, text: value }] } : item);
    if (commit(next)) { setDrafts((current) => ({ ...current, [post.id]: "" })); setStickerPost(null); }
  }
  function addComment(event: FormEvent, post: Post) { event.preventDefault(); submitComment(post, drafts[post.id] || ""); }
  function remove(post: Post) { commit(posts.filter((item) => item.id !== post.id)); }
  async function copyPost(post: Post) {
    const url = `${window.location.origin}/community#post-${encodeURIComponent(post.id)}`;
    try { await navigator.clipboard.writeText(url); }
    catch { const input = document.createElement("textarea"); input.value = url; input.style.position = "fixed"; input.style.opacity = "0"; document.body.append(input); input.select(); document.execCommand("copy"); input.remove(); }
    setMenuPost(null); setMessage(t(locale, "Post link copied."));
  }
  function submitReport(event: FormEvent) {
    event.preventDefault();
    if (!reportPost || !reportReason) return;
    try {
      const previous = JSON.parse(localStorage.getItem(reportKey) || "[]") as Report[];
      const report: Report = { id: `report-${Date.now()}`, postId: reportPost.id, postAuthor: reportPost.author, reporter: author || t(locale, "Guest user"), reason: reportReason, details: reportDetails.trim(), createdAt: new Date().toISOString() };
      localStorage.setItem(reportKey, JSON.stringify([report, ...previous]));
      setReportPost(null); setReportReason(""); setReportDetails(""); setMessage(t(locale, "Report sent to administrators."));
    } catch { setMessage(t(locale, "Could not save the report.")); }
  }
  function openPostFromCard(event: MouseEvent<HTMLElement>, post: Post) {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, form, select")) return;
    setSelectedPost(post);
  }
  function openPostFromKeyboard(event: KeyboardEvent<HTMLElement>, post: Post) {
    if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault(); setSelectedPost(post);
  }

  const visiblePosts = posts.filter((post) => !hiddenPostIds.includes(post.id) && (tab === "recommendations" ? post.author !== author : post.author === author));
  const dateLocale = locale === "kk" ? "kk-KZ" : "ru-RU";
  return <section className="panel community-feed">
    <div className="panel-heading"><div><span className="eyebrow">{t(locale, "Community")}</span><h2>{t(locale, "Community posts")}</h2><p>{t(locale, "Share a photo and a short note")}</p></div><span className="panel-icon"><AppIcon name="community"/></span></div>
    <form className="post-composer" onSubmit={publish}><textarea value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={500} placeholder={t(locale, "Write a caption…")} aria-label={t(locale, "Write a caption…")}/><div className="composer-actions"><label className="button secondary upload-button" htmlFor="community-photo">＋ {t(locale, "Choose photo")}</label><input id="community-photo" type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)}/><span className="file-name">{photo?.name || t(locale, "Photo limit")}</span><button className="button primary" type="submit">{t(locale, "Publish")}</button></div><p className="local-note">{t(locale, "Community demo data is saved in this browser only.")}</p>{message && <p className="inline-message" role="status" aria-live="polite">{message}</p>}</form>
    <div className="community-tabs" role="tablist" aria-label={t(locale, "Community posts")}><button type="button" role="tab" aria-selected={tab === "recommendations"} className={tab === "recommendations" ? "selected" : ""} onClick={() => setTab("recommendations")}>{t(locale, "Recommendations")} <span>{posts.filter((post) => post.author !== author).length}</span></button><button type="button" role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "selected" : ""} onClick={() => setTab("mine")}>{t(locale, "My posts")} <span>{posts.filter((post) => post.author === author).length}</span></button></div>
    <div className="post-list">{visiblePosts.length ? visiblePosts.map((post) => <article className="post-card" key={post.id} id={`post-${post.id}`} role="button" tabIndex={0} onClick={(event) => openPostFromCard(event, post)} onKeyDown={(event) => openPostFromKeyboard(event, post)}>
      <header className="post-header"><button className="avatar community-author-avatar" type="button" onClick={() => setSelectedAuthor(post.author)} aria-label={`${t(locale, "Open profile")}: ${post.author}`}>{[...post.author][0]}</button><div><button className="community-author-name" type="button" onClick={() => setSelectedAuthor(post.author)}>{post.author}</button><small>{new Date(post.createdAt).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })}</small></div>{post.demo ? <span className="demo-tag">{t(locale, "Recommended")}</span> : post.author === author && <button className="text-button danger" type="button" onClick={() => remove(post)}>{t(locale, "Remove post")}</button>}<div className="post-menu-wrap"><button className="icon-button post-menu-trigger" type="button" aria-label={t(locale, "Post actions")} aria-expanded={menuPost === post.id} onClick={() => setMenuPost(menuPost === post.id ? null : post.id)}><AppIcon name="options"/></button>{menuPost === post.id && <div className="post-menu" role="menu"><button type="button" role="menuitem" onClick={() => void copyPost(post)}><AppIcon name="copy"/>{t(locale, "Copy post link")}</button><button type="button" role="menuitem" onClick={() => { setReportPost(post); setMenuPost(null); }}><AppIcon name="flag"/>{t(locale, "Report post")}</button></div>}</div></header>
      {post.image ? <NextImage className="post-photo" src={post.image} alt={post.caption || t(locale, "Community photo")} width={1000} height={800} unoptimized/> : <div className="post-art"><AppIcon name={post.art || "movement"}/></div>}
      <p className="post-caption">{post.caption}</p><div className="post-actions"><button className={post.likes.includes(author) ? "like-button liked" : "like-button"} type="button" onClick={() => toggleLike(post)} aria-pressed={post.likes.includes(author)}><AppIcon name="heart"/> {t(locale, "Like")} · {post.likes.length}</button><span>{post.comments.length} {t(locale, "comments")}</span><button className="post-detail-link" type="button" onClick={() => setSelectedPost(post)}>{t(locale, "View details")}</button></div>
      {post.comments.length > 0 && <div className="comments">{post.comments.map((comment) => <p key={comment.id}><b>{comment.author}:</b> {comment.text}</p>)}</div>}
      <form className="comment-form" onSubmit={(event) => addComment(event, post)}><input value={drafts[post.id] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder={t(locale, "Write a comment…")} maxLength={240} aria-label={t(locale, "Write a comment…")}/><button className="sticker-toggle" type="button" aria-label={t(locale, "Send a sticker")} aria-expanded={stickerPost === post.id} onClick={() => setStickerPost(stickerPost === post.id ? null : post.id)}><AppIcon name="sticker"/></button><button className="button secondary small" type="submit">{t(locale, "Comment")}</button></form>
      {stickerPost === post.id && <div className="sticker-picker" aria-label={t(locale, "Choose a sticker")}>{stickers.map((sticker) => <button type="button" key={sticker.label} aria-label={`${t(locale, "Send a sticker")} ${t(locale, sticker.label)}`} onClick={() => submitComment(post, t(locale, sticker.label))}><AppIcon name={sticker.icon}/></button>)}</div>}
    </article>) : <div className="community-empty"><span><AppIcon name={tab === "mine" ? "camera" : "trees"}/></span><b>{tab === "mine" ? t(locale, "No posts yet") : t(locale, "No recommendations yet")}</b><p>{tab === "mine" ? t(locale, "Share your first photo with the community.") : t(locale, "New community posts will appear here.")}</p></div>}</div>
    {selectedPost && <div className="modal-backdrop" onClick={() => setSelectedPost(null)}><section className="community-detail-modal" role="dialog" aria-modal="true" aria-labelledby="community-detail-title" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" type="button" aria-label={t(locale, "Close")} onClick={() => setSelectedPost(null)}><AppIcon name="close"/></button><span className="eyebrow">{t(locale, "Post details")}</span><h2 id="community-detail-title">{selectedPost.caption || t(locale, "Photo post")}</h2><button className="community-author-name" type="button" onClick={() => { setSelectedPost(null); setSelectedAuthor(selectedPost.author); }}>{selectedPost.author}</button><p>{t(locale, "Published")}: {new Date(selectedPost.createdAt).toLocaleString(dateLocale, { dateStyle: "full", timeStyle: "short" })}</p>{selectedPost.image && <NextImage className="post-photo" src={selectedPost.image} alt={selectedPost.caption || t(locale, "Community photo")} width={1000} height={800} unoptimized/>}<p>{selectedPost.caption || t(locale, "No description")}</p><p>{t(locale, "Like")} · {selectedPost.likes.length}　{t(locale, "comments")} · {selectedPost.comments.length}</p><div className="comments">{selectedPost.comments.map((comment) => <p key={comment.id}><b>{comment.author}:</b> {comment.text}</p>)}</div><button className="button secondary" type="button" onClick={() => setSelectedPost(null)}>{t(locale, "Close")}</button></section></div>}
    {selectedAuthor && <div className="modal-backdrop" onClick={() => setSelectedAuthor(null)}><section className="community-detail-modal author-profile-modal" role="dialog" aria-modal="true" aria-labelledby="community-author-title" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" type="button" aria-label={t(locale, "Close")} onClick={() => setSelectedAuthor(null)}><AppIcon name="close"/></button><span className="avatar author-profile-avatar">{[...selectedAuthor][0]}</span><span className="eyebrow">{t(locale, "Community profile")}</span><h2 id="community-author-title">{selectedAuthor}</h2><p>{t(locale, "Community member profile")}</p><div className="profile-stats"><div className="profile-stat"><span>{t(locale, "Posts")}</span><b>{posts.filter((item) => item.author === selectedAuthor).length}</b></div><div className="profile-stat"><span>{t(locale, "Total likes")}</span><b>{posts.filter((item) => item.author === selectedAuthor).reduce((sum, item) => sum + item.likes.length, 0)}</b></div></div><h3>{t(locale, "Recent posts")}</h3>{posts.filter((item) => item.author === selectedAuthor).slice(0, 3).map((item) => <button className="author-post-link" key={item.id} type="button" onClick={() => { setSelectedAuthor(null); setSelectedPost(item); }}>{item.caption || t(locale, "Photo post")}</button>)}<button className="button secondary" type="button" onClick={() => setSelectedAuthor(null)}>{t(locale, "Close")}</button></section></div>}
    {reportPost && <div className="modal-backdrop" onClick={() => setReportPost(null)}><section className="community-detail-modal" role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" type="button" aria-label={t(locale, "Close")} onClick={() => setReportPost(null)}><AppIcon name="close"/></button><span className="eyebrow">{t(locale, "Community moderation")}</span><h2 id="report-title">{t(locale, "Report post")}</h2><p>{t(locale, "Choose a reason for this report.")}</p><form className="community-report-form" onSubmit={submitReport}><label>{t(locale, "Report reason")}<select value={reportReason} onChange={(event) => setReportReason(event.target.value)} required><option value="">{t(locale, "Select a reason")}</option>{["Spam or advertising", "Harassment or hate", "False information", "Inappropriate content", "Other"].map((key) => <option key={key} value={key}>{t(locale, key)}</option>)}</select></label><label>{t(locale, "Additional details")}<textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={500}/></label><div className="modal-actions"><button className="button secondary" type="button" onClick={() => setReportPost(null)}>{t(locale, "Cancel")}</button><button className="button primary" type="submit">{t(locale, "Submit report")}</button></div></form></section></div>}
  </section>;
}
