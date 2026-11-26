import { createSupabaseServerClient } from "@/lib/supabase/server";

const unavailable = () => Response.json({ error: "Supabase is not configured." }, { status: 503 });

async function getAdminContext() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { response: unavailable() } as const;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { response: Response.json({ error: "Authentication required." }, { status: 401 }) } as const;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) return { response: Response.json({ error: "Could not verify administrator access." }, { status: 500 }) } as const;
  if (profile?.role !== "admin") return { response: Response.json({ error: "Administrator access required." }, { status: 403 }) } as const;

  return { supabase, user } as const;
}

export async function GET() {
  const context = await getAdminContext();
  if ("response" in context) return context.response;

  const { data, error } = await context.supabase
    .from("profiles")
    .select("id,display_name,city,role,created_at")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: "Could not load users." }, { status: 500 });

  return Response.json(
    { currentUserId: context.user.id, users: data ?? [] },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function PATCH(request: Request) {
  const context = await getAdminContext();
  if ("response" in context) return context.response;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }

  const userId = typeof body.userId === "string" ? body.userId : "";
  const role = body.role;
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !["user", "moderator", "admin"].includes(String(role))) {
    return Response.json({ error: "User ID or role is invalid." }, { status: 400 });
  }
  if (userId === context.user.id) {
    return Response.json({ error: "You cannot change your own role here." }, { status: 400 });
  }

  const { data, error } = await context.supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id,display_name,city,role,created_at")
    .maybeSingle();
  if (error) return Response.json({ error: "Could not update role." }, { status: 500 });
  if (!data) return Response.json({ error: "User was not found." }, { status: 404 });

  return Response.json({ user: data }, { headers: { "Cache-Control": "private, no-store" } });
}
