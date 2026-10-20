import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Дәмді жоспар — айлық ас мәзірі", description: "Бір айға ас мәзірін жоспарлап, қажетті азық-түліктің жалпы мөлшерін автоматты есепте." };
export const viewport: Viewport = { themeColor: "#fbf8f2", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="kk"><body>{children}</body></html>; }
