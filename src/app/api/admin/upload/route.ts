import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { saveImage } from "@/lib/uploads";

/**
 * Admin image upload → public/uploads. Admin-only. The admin is responsible for
 * having the rights to any image uploaded. See docs/DATA-SOURCES.md.
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const result = await saveImage(form.get("file"));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ url: result.url }, { status: 201 });
}
