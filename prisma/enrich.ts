/**
 * Batch enrichment: pull ratings/reviews/hours/photos for all cafes from the
 * configured external provider (Google Places). Run with: `npm run db:enrich`.
 *
 * Requires GOOGLE_MAPS_API_KEY in .env. Without it, this exits with guidance and
 * changes nothing (no fabrication). Respects a small delay between calls.
 */
import { PrismaClient } from "@prisma/client";
import { getEnrichmentProvider } from "../src/lib/places/enrichment";
import { enrichCafe } from "../src/lib/places/applyEnrichment";

const prisma = new PrismaClient();

async function main() {
  const provider = getEnrichmentProvider();
  if (!provider) {
    console.error(
      "\n[enrich] No enrichment key set. Add FOURSQUARE_API_KEY (free, no card) or\n" +
        "         GOOGLE_MAPS_API_KEY to .env to enable rating/photo enrichment.\n" +
        "         See docs/DATA-SOURCES.md for setup, fields, cost, and attribution.\n",
    );
    process.exit(1);
  }

  const cafes = await prisma.cafe.findMany({ select: { id: true, name: true } });
  console.log(`[enrich] Enriching ${cafes.length} cafes via ${provider.name}…`);

  let matched = 0;
  for (const cafe of cafes) {
    const out = await enrichCafe(cafe.id);
    if (out.ok && out.matched) {
      matched++;
      console.log(`  ✓ ${cafe.name}`);
    } else if (out.ok) {
      console.log(`  – ${cafe.name} (no match)`);
    } else {
      console.log(`  ! ${cafe.name} (${out.reason})`);
    }
    await new Promise((r) => setTimeout(r, 300)); // gentle rate limiting
  }
  console.log(`[enrich] Done. Matched ${matched}/${cafes.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
