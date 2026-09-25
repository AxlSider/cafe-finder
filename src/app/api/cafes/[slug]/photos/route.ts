import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { resolveCafeId } from "@/lib/community";
import { saveImage } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Community photo upload. Signed-in users only. The uploader must have the
 * rights to the image (stated in the UI). Photos are visible immediately and
 * can be hidden by an admin (post-moderation). Basic per-user cap limits spam.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { slug } = await params;
  const cafeId = await resolveCafeId(slug);
  if (!cafeId) return NextResponse.json({ error: "Cafe not found" }, { status: 404 });

  const mine = await prisma.cafePhoto.count({ where: { cafeId, userId: user.id } });
  if (mine >= 5) {
    return NextResponse.json(
      { error: "You've already added several photos to this cafe." },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }
  const result = await saveImage(form.get("file"));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const photo = await prisma.cafePhoto.create({
    data: { cafeId, userId: user.id, url: result.url },
    select: { id: true, url: true },
  });

  // If the cafe has no lead photo yet, use this community photo so cards fill up.
  const cafe = await prisma.cafe.findUnique({ where: { id: cafeId }, select: { photoUrl: true } });
  if (!cafe?.photoUrl) {
    await prisma.cafe.update({
      where: { id: cafeId },
      data: { photoUrl: result.url, photoAttribution: "Community photo" },
    });
  }

  return NextResponse.json({ ok: true, photo }, { status: 201 });
}
