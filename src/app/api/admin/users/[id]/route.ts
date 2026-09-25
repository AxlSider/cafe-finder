import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

const schema = z.object({ suspended: z.boolean() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Cannot suspend an admin account." }, { status: 400 });
  }
  if (target.id === admin.id) {
    return NextResponse.json({ error: "Cannot suspend yourself." }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { suspended: parsed.data.suspended } });
  return NextResponse.json({ ok: true });
}
