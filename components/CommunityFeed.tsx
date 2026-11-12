"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { FormEvent, useEffect, useState } from "react";
import NextImage from "next/image";
import AppIcon from "@/components/AppIcon";
import { recommendedPosts } from "@/data/community";
import { t, type Locale } from "@/lib/healthflow";

type Comment = { id: string; author: string; text: string };
type Post = { id: string; author: string; caption: string; image?: string; createdAt: string; likes: string[]; comments: Comment[]; demo?: boolean; art?: string };
const storageKey = "hf:posts";
const stickers = ["🌿", "💪", "👏", "❤️", "✨", "🔥", "🤍", "🎉"];
const seedPosts: Post[] = recommendedPosts.map((post) => ({ ...post, demo: true }));
function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Сурет файлын таңда."));
    const reader = new FileReader(), img = new Image();
    reader.onerror = () => reject(new Error("Суретті оқу мүмкін болмады."));
    reader.onload = () => { img.onload = () => { const scale = Math.min(1, 1000 / Math.max(img.width, img.height)), canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale)); canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", .7)); }; img.onerror = () => reject(new Error("Сурет ашылмады.")); img.src = String(reader.result); };
    reader.readAsDataURL(file);
  });
}

export default function CommunityFeed({ locale, author }: { locale: Locale; author: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [caption, setCaption] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"recommendations" | "mine">("recommendations");
  const [stickerPost, setStickerPost] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]") as Post[];
      const savedIds = new Set(saved.map((post) => post.id));
      setPosts([...saved, ...seedPosts.filter((post) => !savedIds.has(post.id))]);
    } catch { setPosts(seedPosts); }
  }, []);

  function commit(next: Post[]) {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setPosts(next); return true; }
    catch { setMessage("Сақтау орны толды. Ескі фото жазбаларды өшіріп көр."); return false; }
  }
  async function publish(event: FormEvent) {
    event.preventDefault();
    if (!photo) { setMessage("Фото таңда."); return; }
    if (photo.size > 12 * 1024 * 1024) { setMessage("Фото 12 МБ-тан аз болуы керек."); return; }
    try {
      const image = await compress(photo);
      if (image.length > 600000) { setMessage("Көлемі кішірек фото таңда."); return; }
      const next = [{ id: `post-${Date.now()}`, author: author || "Есен", caption: caption.trim(), image, createdAt: new Date().toISOString(), likes: [], comments: [] }, ...posts].slice(0, 12 + seedPosts.length);
      if (commit(next)) { setCaption(""); setPhoto(null); const input = document.getElementById("community-photo") as HTMLInputElement | null; if (input) input.value = ""; setMessage("Фото жарияланды."); setTab("mine"); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Сурет сақталмады."); }
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

  const visiblePosts = posts.filter((post) => tab === "recommendations" ? post.author !== author : post.author === author);
  return <section className="panel community-feed">
    <div className="panel-heading"><div><span className="eyebrow">ҚАУЫМДАСТЫҚ</span><h2>{t(locale, "Community posts")}</h2><p>{t(locale, "Share a photo and a short note")}</p></div><span className="panel-icon">✦</span></div>
    <form className="post-composer" onSubmit={publish}><textarea value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={500} placeholder={t(locale, "Write a caption…")} aria-label={t(locale, "Write a caption…")}/><div className="composer-actions"><label className="button secondary upload-button" htmlFor="community-photo">＋ {t(locale, "Choose photo")}</label><input id="community-photo" type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)}/><span className="file-name">{photo?.name || "Фото міндетті · 12 МБ дейін"}</span><button className="button primary" type="submit">{t(locale, "Publish")}</button></div><p className="local-note">Демо-нұсқа: жазба, лайк және пікір осы браузерде сақталады, басқа аккаунттарға жіберілмейді.</p>{message && <p className="inline-message" role="status">{message}</p>}</form>
    <div className="community-tabs" role="tablist" aria-label={t(locale, "Community posts")}><button type="button" role="tab" aria-selected={tab === "recommendations"} className={tab === "recommendations" ? "selected" : ""} onClick={() => setTab("recommendations")}>{t(locale, "Recommendations")} <span>{posts.filter((post) => post.author !== author).length}</span></button><button type="button" role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "selected" : ""} onClick={() => setTab("mine")}>{t(locale, "My posts")} <span>{posts.filter((post) => post.author === author).length}</span></button></div>
    <div className="post-list">{visiblePosts.length ? visiblePosts.map((post) => <article className="post-card" key={post.id}>
      <header className="post-header"><span className="avatar">{[...post.author][0]}</span><div><b>{post.author}</b><small>{new Date(post.createdAt).toLocaleDateString(locale === "kk" ? "kk-KZ" : locale === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short" })}</small></div>{post.demo ? <span className="demo-tag">{t(locale, "Recommended")}</span> : post.author === author && <button className="text-button danger" type="button" onClick={() => remove(post)}>Өшіру</button>}</header>
      {post.image ? <NextImage className="post-photo" src={post.image} alt={post.caption || "Қауымдастық фотосы"} width={1000} height={800} unoptimized/> : <div className="post-art"><AppIcon name={post.art || "movement"}/></div>}
      <p className="post-caption">{post.caption}</p><div className="post-actions"><button className={post.likes.includes(author) ? "like-button liked" : "like-button"} type="button" onClick={() => toggleLike(post)} aria-pressed={post.likes.includes(author)}><AppIcon name={post.likes.includes(author) ? "♥" : "♡"}/> {t(locale, "Like")} · {post.likes.length}</button><span>{post.comments.length} пікір</span></div>
      {post.comments.length > 0 && <div className="comments">{post.comments.map((comment) => <p key={comment.id}><b>{comment.author}:</b> {comment.text}</p>)}</div>}
      <form className="comment-form" onSubmit={(event) => addComment(event, post)}><input value={drafts[post.id] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder={t(locale, "Write a comment…")} maxLength={240} aria-label={t(locale, "Write a comment…")}/><button className="sticker-toggle" type="button" aria-label={t(locale, "Send a sticker")} aria-expanded={stickerPost === post.id} onClick={() => setStickerPost(stickerPost === post.id ? null : post.id)}><AppIcon name="sticker"/></button><button className="button secondary small" type="submit">{t(locale, "Comment")}</button></form>
      {stickerPost === post.id && <div className="sticker-picker" aria-label={t(locale, "Choose a sticker")}>{stickers.map((sticker) => <button type="button" key={sticker} aria-label={`${t(locale, "Send a sticker")} ${sticker}`} onClick={() => submitComment(post, sticker)}>{sticker}</button>)}</div>}
    </article>) : <div className="community-empty"><span><AppIcon name={tab === "mine" ? "camera" : "🌱"}/></span><b>{tab === "mine" ? t(locale, "No posts yet") : t(locale, "No recommendations yet")}</b><p>{tab === "mine" ? t(locale, "Share your first photo with the community.") : t(locale, "New community posts will appear here.")}</p></div>}</div>
  </section>;
}
