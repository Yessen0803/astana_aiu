import type { HealthStatusDto } from "@/lib/server/contracts";

export async function GET() {
  const result: HealthStatusDto = {
    ok: true,
    service: "healthflow-api",
    timestamp: new Date().toISOString(),
  };

  return Response.json(result);
}
