import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordEvent } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

const schema = z.object({
  name: z.enum(ANALYTICS_EVENTS),
  // Keep properties small & non-PII; we cap size implicitly via JSON parse.
  properties: z.record(z.unknown()).optional().nullable(),
  region: z.enum(["LUZON", "SWITZERLAND"]).optional().nullable(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  await recordEvent(
    parsed.data.name,
    parsed.data.properties ?? undefined,
    parsed.data.region ?? undefined,
  );
  // 204-style ack; sendBeacon ignores the body.
  return NextResponse.json({ ok: true });
}
