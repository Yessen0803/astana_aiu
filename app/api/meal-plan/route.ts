import { createSupabaseServerClient } from "@/lib/supabase/server";

const unavailable = () => Response.json({ error: "Supabase is not configured." }, { status: 503 });
const validDate = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const validSlot = (value: unknown): value is "breakfast" | "lunch" | "dinner" =>
  value === "breakfast" || value === "lunch" || value === "dinner";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const month = new URL(request.url).searchParams.get("month") || "";
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return Response.json({ error: "A valid month is required." }, { status: 400 });
  const from = `${month}-01`;
  const date = new Date(`${from}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const to = date.toISOString().slice(0, 10);
  const { data, error } = await supabase.from("meal_plans").select("plan_date,meal_slot,recipe_id,servings")
    .eq("user_id", user.id).gte("plan_date", from).lt("plan_date", to).order("plan_date");
  if (error) return Response.json({ error: "Could not load meal plan." }, { status: 500 });
  return Response.json({ meals: data || [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Authentication required." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const servings = Number(body.servings);
  if (!validDate(body.plan_date) || !validSlot(body.meal_slot) || typeof body.recipe_id !== "string" || !/^[a-z0-9-]{1,120}$/i.test(body.recipe_id) || !Number.isInteger(servings) || servings < 1 || servings > 20) {
    return Response.json({ error: "Meal plan fields are invalid." }, { status: 400 });
  }
  const { error } = await supabase.from("meal_plans").upsert({
    user_id: user.id, plan_date: body.plan_date, meal_slot: body.meal_slot,
    recipe_id: body.recipe_id, servings,
  }, { onConflict: "user_id,plan_date,meal_slot" });
  if (error) return Response.json({ error: "Could not save meal plan." }, { status: 500 });
  return Response.json({ saved: true }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const slot = searchParams.get("slot");
  if (!validDate(date) || !validSlot(slot)) return Response.json({ error: "Meal plan fields are invalid." }, { status: 400 });
  const { error } = await supabase.from("meal_plans").delete().eq("user_id", user.id).eq("plan_date", date).eq("meal_slot", slot);
  if (error) return Response.json({ error: "Could not remove meal plan." }, { status: 500 });
  return Response.json({ saved: true }, { headers: { "Cache-Control": "private, no-store" } });
}
