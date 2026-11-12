"use client";

import { FormEvent, useState } from "react";
import AppIcon from "@/components/AppIcon";
import { t, type Locale, type Theme } from "@/lib/healthflow";

type Registration = { name: string; email: string; city: string };

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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onRegister({ name: name.trim(), email: email.trim().toLocaleLowerCase(), city });
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
      <section className="registration-story"><span className="eyebrow">HEALTHFLOW · {t(locale,"Registration")}</span><h1>{t(locale,"Create your HealthFlow profile")}</h1><p>{t(locale,"Save your name, email, and city to start your personal health space.")}</p><div className="registration-benefits"><span><AppIcon name="check"/> {t(locale,"Daily habits")}</span><span><AppIcon name="check"/> {t(locale,"Movement library")}</span><span><AppIcon name="check"/> {t(locale,"Your weekly rhythm")}</span></div><div className="registration-art" aria-hidden="true"><span><AppIcon name="🌱"/></span><i>✦</i><b>H</b></div></section>
      <section className="registration-card"><div className="registration-card-heading"><span className="registration-icon">✦</span><div><span className="eyebrow">{t(locale,"Registration")}</span><h2>{t(locale,"Create profile")}</h2></div></div>
        <form onSubmit={submit} className="registration-form">
          <label>{t(locale,"Name")}<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required/></label>
          <label>{t(locale,"Email")}<input type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={120} required/></label>
          <label>{t(locale,"Choose a city")}<select value={city} onChange={(event) => setCity(event.target.value)}>{["Астана","Алматы","Шымкент","Қарағанды"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <button className="button primary full-width" type="submit">{t(locale,"Create profile")} <span>{<AppIcon name="↗"/>}</span></button>
        </form>
        <div className="registration-note"><span><AppIcon name="lock"/></span><p>{t(locale,"This prototype keeps profile details in this browser only. It does not create a server account.")}</p></div>
        <button type="button" className="text-button guest-button" onClick={onContinueAsGuest}>{t(locale,"Continue as a guest")}</button>
        <button type="button" className="text-button guest-button admin-demo-button" onClick={onAdminDemo}><AppIcon name="lock"/> Admin demo · admin@healthflow.local</button>
      </section>
    </div>
    <footer className="registration-footer">© 2026 HealthFlow · {t(locale,"A little movement")}</footer>
  </main>;
}
