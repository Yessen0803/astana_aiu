import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./healthflow.css";
export const metadata: Metadata = { title: "HealthFlow — күнделікті саулық", description: "Күнделікті қозғалыс, пайдалы әдеттер, тамақтану жоспары және өзіңе қамқорлық." };
export const viewport: Viewport = { themeColor: "#f5f7f3", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="kk"><body>{children}</body></html>; }
