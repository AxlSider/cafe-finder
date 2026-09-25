/**
 * Import real cafes from OpenStreetMap for one or all preset areas.
 *   npm run db:import            # all preset cities
 *   npm run db:import baguio     # a single city
 *
 * Free, no key. OSM data © OpenStreetMap contributors (ODbL). No ratings are
 * imported (OSM has none) — this adds density honestly.
 */
import { PrismaClient } from "@prisma/client";
import { fetchCafesFromOverpass } from "../src/lib/places/import/overpass";
import { applyImportedCafes } from "../src/lib/places/import/apply";
import { IMPORT_AREAS, findArea } from "../src/lib/places/import/presets";

const prisma = new PrismaClient();

async function main() {
  const arg = process.argv[2];
  const areas = arg
    ? [findArea(arg)].filter(Boolean)
    : IMPORT_AREAS;
  if (arg && areas.length === 0) {
    console.error(`Unknown area "${arg}". Options: ${IMPORT_AREAS.map((a) => a.key).join(", ")}`);
    process.exit(1);
  }

  let total = 0;
  for (const area of areas) {
    if (!area) continue;
    process.stdout.write(`[import] ${area.label}… `);
    try {
      const cafes = await fetchCafesFromOverpass(
        { lat: area.lat, lng: area.lng },
        area.radiusM,
        area.label,
      );
      const summary = await applyImportedCafes(cafes);
      total += summary.created;
      console.log(`${summary.created} new, ${summary.updated} updated (${summary.total} found)`);
    } catch (e) {
      console.log(`failed (${(e as Error).message})`);
    }
    // Be gentle with the public Overpass instance.
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log(`[import] Done. ${total} new cafes added.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
