import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

/**
 * Save an uploaded image to public/uploads and return its public URL.
 * Shared by admin and community photo uploads.
 *
 * Security (Sprint 0): we never trust the client-provided type. sharp decodes
 * the bytes (magic-byte validation via real decode), enforces a pixel cap
 * (decompression-bomb defense), auto-orients, resizes to a sane max, and
 * **re-encodes to WebP — which strips ALL metadata including EXIF/GPS** (a
 * privacy leak). The output is a randomized `.webp` filename, non-executable.
 */
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB input ceiling
const MAX_DIM = 1600; // longest edge after resize
const MAX_INPUT_PIXELS = 60_000_000; // ~60 MP decode cap

export type SaveImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number };

export async function saveImage(file: unknown): Promise<SaveImageResult> {
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided", status: 400 };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image must be 8 MB or smaller.", status: 413 };
  }

  const input = Buffer.from(await file.arrayBuffer());

  let output: Buffer;
  try {
    const img = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" });
    const meta = await img.metadata();
    // Real decode + format allow-list (defeats spoofed content types / polyglots).
    if (!meta.format || !["jpeg", "png", "webp", "gif"].includes(meta.format)) {
      return { ok: false, error: "Unsupported or invalid image.", status: 415 };
    }
    output = await img
      .rotate() // bake in EXIF orientation, then it's dropped on re-encode
      .resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 }) // re-encode strips EXIF/GPS + all metadata
      .toBuffer();
  } catch {
    return { ok: false, error: "That file isn't a valid image.", status: 415 };
  }

  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.webp`;
  const dir = path.join(process.cwd(), "public", "uploads");
  // Local disk works on a persistent host (XAMPP, a VM, a container with a
  // volume). On a read-only / ephemeral serverless filesystem (e.g. Vercel) this
  // throws — surface an honest error instead of a 500. Production persistence is
  // an object store (S3/R2/Vercel Blob); see docs/DEPLOYMENT.md.
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), output);
  } catch (err) {
    console.error("saveImage: failed to write upload to disk", err);
    return {
      ok: false,
      error:
        "Photo uploads aren't available on this deployment yet. Configure object storage to enable them.",
      status: 503,
    };
  }
  return { ok: true, url: `/uploads/${name}` };
}
