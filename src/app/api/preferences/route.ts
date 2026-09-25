import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const PREF_KEYS = [
  "sweet",
  "bitter",
  "strong",
  "light",
  "milkBased",
  "black",
  "iced",
  "hot",
  "matcha",
  "tea",
  "chocolate",
] as const;

const schema = z.object(
  Object.fromEntries(PREF_KEYS.map((k) => [k, z.boolean().optional()])) as Record<
    (typeof PREF_KEYS)[number],
    z.ZodOptional<z.ZodBoolean>
  >,
);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const pref = await prisma.coffeePreference.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ preference: pref });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data = parsed.data;
  const pref = await prisma.coffeePreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: { ...data },
  });
  return NextResponse.json({ preference: pref });
}
