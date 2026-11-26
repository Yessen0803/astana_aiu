import { createSupabaseServerClient } from "@/lib/supabase/server";

const unavailable = () => Response.json({ error: "Supabase is not configured." }, { status: 503 });

async function getUserAndRole(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, role: null };
  const { data: profile } = await supabase.from("profiles").select("role,display_name").eq("id", user.id).maybeSingle();
  return { user, role: profile?.role || "user" };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();
  const { user, role } = await getUserAndRole(supabase);
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  let query = supabase.from("support_messages").select("id,user_id,sender_role,body,created_at").order("created_at", { ascending: true }).limit(500);
  if (role !== "admin") query = query.eq("user_id", user.id);
  const { data, error } = await query;
  if (error) return Response.json({ error: "Could not load support messages." }, { status: 500 });
  const userIds = [...new Set((data || []).map((message) => message.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id,display_name").in("id", userIds)
    : { data: [] as { id: string; display_name: string }[] };
  const names = new Map((profiles || []).map((profile) => [profile.id, profile.display_name]));
  return Response.json({ messages: (data || []).map((message) => ({ ...message, display_name: names.get(message.user_id) || "HealthFlow user" })) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();
  const { user, role } = await getUserAndRole(supabase);
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text || text.length > 2000) return Response.json({ error: "Message must contain 1–2000 characters." }, { status: 400 });
  const isAdminReply = role === "admin";
  const targetUserId = isAdminReply ? body.user_id : user.id;
  if (typeof targetUserId !== "string" || !/^[0-9a-f-]{36}$/i.test(targetUserId)) return Response.json({ error: "A valid conversation is required." }, { status: 400 });
  const { data, error } = await supabase.from("support_messages").insert({
    user_id: targetUserId, sender_role: isAdminReply ? "admin" : "user", body: text,
  }).select("id,user_id,sender_role,body,created_at").single();
  if (error) return Response.json({ error: "Could not save support message." }, { status: 500 });
  return Response.json({ message: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
