import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const REPORT_KINDS = [
  "WRONG_LOCATION",
  "WRONG_HOURS",
  "CLOSED",
  "DUPLICATE",
  "WRONG_MENU",
  "WRONG_INFO",
  "WRONG_PHOTO",
] as const;

const schema = z.object({
  cafeId: z.string().min(1),
  kind: z.enum(REPORT_KINDS),
  details: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid report", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { cafeId, kind, details } = parsed.data;

  // Validate the cafe exists (accept slug or id).
  const cafe = await prisma.cafe.findFirst({
    where: { OR: [{ id: cafeId }, { slug: cafeId }] },
    select: { id: true },
  });
  if (!cafe) {
    return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
  }

  await prisma.report.create({
    data: { cafeId: cafe.id, kind, details, status: "OPEN" },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
