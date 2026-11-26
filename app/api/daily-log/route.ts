import { createSupabaseServerClient } from "@/lib/supabase/server";

const unavailable = () => Response.json({ error: "Supabase is not configured." }, { status: 503 });
const validDate = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const date = new URL(request.url).searchParams.get("date");
  if (!validDate(date)) return Response.json({ error: "A valid date is required." }, { status: 400 });
  const { data, error } = await supabase.from("daily_logs").select("log_date,steps,water_ml,sleep_start,sleep_end,mood,completed_habits,planned_activities,completed_activities,care_done,note").eq("user_id", user.id).eq("log_date", date).maybeSingle();
  if (error) return Response.json({ error: "Could not load daily log." }, { status: 500 });
  return Response.json({ log: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Authentication required." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const steps = Number(body.steps);
  const waterMl = Number(body.water_ml);
  const arrays = [body.completed_habits, body.planned_activities, body.completed_activities, body.care_done];
  if (!validDate(body.log_date) || !Number.isInteger(steps) || steps < 0 || steps > 100000 || !Number.isInteger(waterMl) || waterMl < 0 || waterMl > 20000 || arrays.some((items) => !Array.isArray(items) || items.length > 100 || items.some((item) => typeof item !== "string" || item.length > 120))) {
    return Response.json({ error: "Daily log fields are invalid." }, { status: 400 });
  }
  const optionalText = (key: string, max: number) => typeof body[key] === "string" ? (body[key] as string).slice(0, max) : "";
  const { data, error } = await supabase.from("daily_logs").upsert({
    user_id: user.id, log_date: body.log_date, steps, water_ml: waterMl,
    sleep_start: optionalText("sleep_start", 5), sleep_end: optionalText("sleep_end", 5),
    mood: optionalText("mood", 40), completed_habits: body.completed_habits,
    planned_activities: body.planned_activities, completed_activities: body.completed_activities,
    care_done: body.care_done, note: optionalText("note", 1000),
  }, { onConflict: "user_id,log_date" }).select("log_date,steps,water_ml,sleep_start,sleep_end,mood,completed_habits,planned_activities,completed_activities,care_done,note").single();
  if (error) return Response.json({ error: "Could not save daily log." }, { status: 500 });
  return Response.json({ log: data }, { headers: { "Cache-Control": "private, no-store" } });
}
