import { NextRequest, NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "nodejs";

/** Admin: delete (moderate) a community photo. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;

  const photo = await prisma.cafePhoto.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ ok: true });

  await prisma.cafePhoto.delete({ where: { id } }).catch(() => {});

  // If this was the cafe's lead photo, clear it (a remaining community photo can
  // become the lead on the next upload; the card falls back to a placeholder).
  await prisma.cafe.updateMany({
    where: { id: photo.cafeId, photoUrl: photo.url },
    data: { photoUrl: null, photoAttribution: null },
  });

  // Best-effort remove the local file.
  if (photo.url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", photo.url)).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
