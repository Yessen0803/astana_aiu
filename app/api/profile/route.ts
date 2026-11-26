import { createSupabaseServerClient } from "@/lib/supabase/server";

const unavailable = () => Response.json({ error: "Supabase is not configured." }, { status: 503 });

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await supabase.from("profiles").select("id,display_name,city,bio,instagram,tiktok,role,is_public,created_at,updated_at").eq("id", user.id).maybeSingle();
  if (error) return Response.json({ error: "Could not load profile." }, { status: 500 });
  return Response.json({ profile: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Authentication required." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const displayName = typeof body.display_name === "string" ? body.display_name.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const bio = typeof body.bio === "string" ? body.bio.trim() : "";
  const instagram = typeof body.instagram === "string" ? body.instagram.trim() : "";
  const tiktok = typeof body.tiktok === "string" ? body.tiktok.trim() : "";
  const validSocialUrl = (value: string, host: string) => {
    if (!value) return true;
    try { const parsed = new URL(value); return parsed.protocol === "https:" && [host, `www.${host}`].includes(parsed.hostname.toLowerCase()) && parsed.pathname !== "/"; }
    catch { return false; }
  };
  if (displayName.length < 1 || displayName.length > 60 || !["Астана", "Алматы", "Шымкент", "Қарағанды"].includes(city) || bio.length > 180 || instagram.length > 250 || tiktok.length > 250 || !validSocialUrl(instagram, "instagram.com") || !validSocialUrl(tiktok, "tiktok.com")) {
    return Response.json({ error: "Profile fields are invalid or too long." }, { status: 400 });
  }
  const { data, error } = await supabase.from("profiles").update({
    display_name: displayName, city, bio, instagram, tiktok,
  }).eq("id", user.id).select("id,display_name,city,bio,instagram,tiktok,role,is_public,created_at,updated_at").single();
  if (error) return Response.json({ error: "Could not save profile." }, { status: 500 });
  return Response.json({ profile: data }, { headers: { "Cache-Control": "private, no-store" } });
}
