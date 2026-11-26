"use client";

import { FormEvent, useState } from "react";
import AppIcon from "@/components/AppIcon";
import { t, type Locale, type Theme } from "@/lib/healthflow";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Registration = { name: string; email: string; city: string; bio?: string; role?: string };

export default function RegistrationScreen({ locale, theme, initialName, initialCity, onLocale, onTheme, onRegister, onContinueAsGuest, onAdminDemo }: {
  locale: Locale;
  theme: Theme;
  initialName: string;
  initialCity: string;
  onLocale: (locale: Locale) => void;
  onTheme: (theme: Theme) => void;
  onRegister: (registration: Registration) => void;
  onContinueAsGuest: () => void;
  onAdminDemo: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState("");
  const [city, setCity] = useState(initialCity);
  const [password, setPassword] = useState("");
  const [signInMode, setSignInMode] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const backendEnabled = isSupabaseConfigured();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    const cleanEmail = email.trim().toLocaleLowerCase();
    if (!backendEnabled) { onRegister({ name: name.trim(), email: cleanEmail, city }); return; }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    try {
      if (signInMode) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error || !data.user) { setAuthMessage(t(locale, "Authentication failed. Check your email and password.")); return; }
        const response = await fetch("/api/profile", { cache: "no-store" });
        const result = response.ok ? await response.json() as { profile?: { display_name?: string; city?: string; bio?: string; role?: string } | null } : null;
        onRegister({ name: result?.profile?.display_name || String(data.user.user_metadata.display_name || initialName), email: cleanEmail, city: result?.profile?.city || String(data.user.user_metadata.city || initialCity), bio: result?.profile?.bio || "", role: result?.profile?.role || "user" });
      } else {
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password, options: { data: { display_name: name.trim(), city } } });
        if (error || !data.user) { setAuthMessage(t(locale, "Could not create the account. Check the details and try again.")); return; }
        if (!data.session) {
          setSignInMode(true);
          setAuthMessage(t(locale, "Account created. Confirm your email, then sign in."));
          return;
        }
        onRegister({ name: name.trim(), email: cleanEmail, city });
      }
    } catch {
      setAuthMessage(t(locale, "Could not reach the backend. Check the Supabase setup."));
    } finally { setBusy(false); }
  }

  return <main className={`registration-screen ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
    <header className="registration-topbar">
      <a className="app-brand" href="#registration"><span className="brand-symbol">H</span><span><b>healthflow</b><small>{t(locale,"Move a little each day")}</small></span></a>
      <div className="registration-controls">
        <label className="sr-only" htmlFor="registration-language">{t(locale,"Language")}</label>
        <select id="registration-language" value={locale} onChange={(event) => onLocale(event.target.value as Locale)}><option value="kk">Қазақша</option><option value="ru">Русский</option><option value="en">English</option></select>
        <button className="icon-button" type="button" aria-label={t(locale,"Theme")} onClick={() => onTheme(theme === "light" ? "dark" : "light")}><AppIcon name={theme === "light" ? "moon" : "sun"}/></button>
      </div>
    </header>
    <div className="registration-layout">
      <section className="registration-story"><span className="eyebrow">HEALTHFLOW · {t(locale,"Registration")}</span><h1>{t(locale,"Create your HealthFlow profile")}</h1><p>{t(locale,"Save your name, email, and city to start your personal health space.")}</p><div className="registration-benefits"><span><AppIcon name="check"/> {t(locale,"Daily habits")}</span><span><AppIcon name="check"/> {t(locale,"Movement library")}</span><span><AppIcon name="check"/> {t(locale,"Your weekly rhythm")}</span></div><div className="registration-art" aria-hidden="true"><span><AppIcon name="trees"/></span><i>✦</i><b>H</b></div></section>
      <section className="registration-card"><div className="registration-card-heading"><span className="registration-icon">✦</span><div><span className="eyebrow">{t(locale,"Registration")}</span><h2>{t(locale, signInMode ? "Sign in" : "Create profile")}</h2></div></div>
        <form onSubmit={submit} className="registration-form">
          {!signInMode && <label>{t(locale,"Name")}<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required/></label>}
          <label>{t(locale,"Email")}<input type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={120} required/></label>
          {backendEnabled && <label>{t(locale,"Password")}<input type="password" autoComplete={signInMode ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} required/></label>}
          {!signInMode && <label>{t(locale,"Choose a city")}<select value={city} onChange={(event) => setCity(event.target.value)}>{["Астана","Алматы","Шымкент","Қарағанды"].map((item) => <option key={item} value={item}>{t(locale,item)}</option>)}</select></label>}
          <button className="button primary full-width" type="submit" disabled={busy}>{busy ? t(locale,"Please wait…") : t(locale, signInMode ? "Sign in" : "Create profile")} <span><AppIcon name="arrowRight"/></span></button>
        </form>
        {authMessage && <p className="inline-message" role="status">{authMessage}</p>}
        {backendEnabled && <button type="button" className="text-button guest-button" onClick={() => { setSignInMode((value) => !value); setAuthMessage(""); }}>{t(locale, signInMode ? "Need an account?" : "Already have an account?")}</button>}
        <div className="registration-note"><span><AppIcon name="lock"/></span><p>{t(locale, backendEnabled ? "Supabase authentication and database are connected." : "Supabase is not configured. Local demo mode is active.")}</p></div>
        <button type="button" className="text-button guest-button" onClick={onContinueAsGuest}>{t(locale,"Continue as a guest")}</button>
        <button type="button" className="text-button guest-button admin-demo-button" onClick={onAdminDemo}><AppIcon name="lock"/> {t(locale,"Admin demo")} · admin@healthflow.local</button>
      </section>
    </div>
    <footer className="registration-footer">© 2026 HealthFlow · {t(locale,"A little movement")}</footer>
  </main>;
}
