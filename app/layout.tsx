import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./healthflow.css";
export const metadata: Metadata = { title: "HealthFlow — өз ырғағыңмен", description: "Күнделікті пайдалы әдеттеріңді жоспарла, бақыла және өзіңе қамқор бол." };
export const viewport: Viewport = { themeColor: "#fbf8f2", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="kk"><body>{children}</body></html>; }
