import { notFound } from "next/navigation";
import type { AdminPageId } from "@/components/sections/AdminSection";

const adminSections: Exclude<AdminPageId, "overview">[] = [
  "reports",
  "bookings",
  "posts",
  "support",
  "users",
  "roles",
  "announcements",
  "settings",
  "audit",
];

export function generateStaticParams() {
  return adminSections.map((adminSection) => ({ adminSection }));
}

export default async function AdminSectionRoute({ params }: { params: Promise<{ adminSection: string }> }) {
  const { adminSection } = await params;
  if (!adminSections.includes(adminSection as Exclude<AdminPageId, "overview">)) notFound();
  return null;
}
