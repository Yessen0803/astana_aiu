import { notFound } from "next/navigation";

const sections = [
  "today", "schedule", "planning", "nutrition", "movement", "care", "progress",
  "notifications", "community", "friends", "restaurants", "profile", "support", "admin",
];

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export default async function SectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return null;
}
