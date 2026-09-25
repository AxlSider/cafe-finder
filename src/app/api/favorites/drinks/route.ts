import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

// NOTE: FavoriteDrink references the per-cafe Drink table. Saved "drinks" here
// are cafe menu items (available once menu data exists). Drink-TYPE preferences
// live in the coffee profile (see /api/preferences).

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const favorites = await prisma.favoriteDrink.findMany({
    where: { userId: user.id },
    include: { drink: { include: { cafe: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ drinks: favorites.map((f) => f.drink) });
}

const bodySchema = z.object({ drinkId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const drink = await prisma.drink.findUnique({ where: { id: parsed.data.drinkId } });
  if (!drink) return NextResponse.json({ error: "Drink not found" }, { status: 404 });

  await prisma.favoriteDrink.upsert({
    where: { userId_drinkId: { userId: user.id, drinkId: drink.id } },
    create: { userId: user.id, drinkId: drink.id },
    update: {},
  });
  return NextResponse.json({ ok: true, saved: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const drinkId = req.nextUrl.searchParams.get("drinkId");
  if (!drinkId) return NextResponse.json({ error: "Missing drinkId" }, { status: 400 });

  await prisma.favoriteDrink
    .delete({ where: { userId_drinkId: { userId: user.id, drinkId } } })
    .catch(() => {});
  return NextResponse.json({ ok: true, saved: false });
}
