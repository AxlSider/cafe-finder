import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recommendDrinks, type DrinkPreferences } from "@/lib/drinks/recommend";

const boolish = z
  .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
  .transform((v) => v === true || v === "true" || v === "1")
  .optional();

const schema = z.object({
  sweet: boolish,
  bitter: boolish,
  strong: boolish,
  light: boolish,
  milkBased: boolish,
  black: boolish,
  matcha: boolish,
  tea: boolish,
  chocolate: boolish,
  hot: boolish,
  iced: boolish,
  limit: z.coerce.number().int().positive().max(20).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });
  }
  const { limit, ...prefs } = parsed.data;

  const drinkTypes = await prisma.drinkType.findMany();
  if (drinkTypes.length === 0) {
    return NextResponse.json({
      recommendations: [],
      message: "Drink guide isn't available yet.",
    });
  }

  const recs = recommendDrinks(prefs as DrinkPreferences, drinkTypes);
  return NextResponse.json({
    recommendations: (limit ? recs.slice(0, limit) : recs).map((r) => ({
      drink: r.drink,
      reasons: r.reasons,
    })),
  });
}
