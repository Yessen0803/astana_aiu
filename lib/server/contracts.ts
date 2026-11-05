export type HealthStatusDto = {
  ok: true;
  service: "healthflow-api";
  timestamp: string;
};

export type CreateSupportMessageInput = {
  name: string;
  email: string;
  text: string;
};

/** Returns validated, trimmed support input, or null for an invalid payload. */
export function parseSupportMessageInput(value: unknown): CreateSupportMessageInput | null {
  if (!value || typeof value !== "object") return null;

  const input = value as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const text = typeof input.text === "string" ? input.text.trim() : "";

  if (name.length < 1 || name.length > 60) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (text.length < 1 || text.length > 1000) return null;

  return { name, email, text };
}
