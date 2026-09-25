/**
 * Cafe Finder seed — CURATED dataset.
 *
 * DATA-INTEGRITY CONTRACT (see docs/DATA-SOURCES.md):
 *  - Cafe names and localities are real, publicly-known cafes.
 *  - Coordinates are APPROXIMATE (area-level) and flagged as curated; they are
 *    intentionally correctable via the in-app "report wrong location" flow.
 *  - Tags & amenities are CupScout EDITORIAL classifications, not scraped
 *    facts. They are our own curated data category.
 *  - Ratings, review counts, opening hours, prices and menus are NOT fabricated.
 *    Where we do not have a licensed source, they are left null/empty and the UI
 *    shows "unavailable". Ratings/menus await a licensed provider.
 */
import { PrismaClient, Region, DataSource, DrinkCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { validateAdminPassword } from "../src/lib/auth/adminSecurity";

const prisma = new PrismaClient();

/**
 * DrinkType = GENERAL coffee-drink knowledge (not any cafe's menu/prices).
 * Flavor attributes are widely-accepted characteristics, used by the honest
 * "What should I order?" recommender. See docs/RECOMMENDATIONS.md.
 */
interface SeedDrink {
  slug: string;
  name: string;
  category: DrinkCategory;
  description: string;
  hot: boolean;
  iced: boolean;
  sweet: boolean;
  bitter: boolean;
  strong: boolean;
  light: boolean;
  milkBased: boolean;
  caffeine: boolean;
}

const DRINK_TYPES: SeedDrink[] = [
  { slug: "espresso", name: "Espresso", category: DrinkCategory.ESPRESSO, description: "A concentrated shot — intense, bitter, and strong.", hot: true, iced: false, sweet: false, bitter: true, strong: true, light: false, milkBased: false, caffeine: true },
  { slug: "americano", name: "Americano", category: DrinkCategory.COFFEE, description: "Espresso diluted with hot water — bold but smoother than a shot.", hot: true, iced: true, sweet: false, bitter: true, strong: true, light: false, milkBased: false, caffeine: true },
  { slug: "filter-coffee", name: "Filter / Brewed Coffee", category: DrinkCategory.COFFEE, description: "Clean, aromatic drip or pour-over coffee, taken black.", hot: true, iced: true, sweet: false, bitter: true, strong: false, light: true, milkBased: false, caffeine: true },
  { slug: "cappuccino", name: "Cappuccino", category: DrinkCategory.LATTE, description: "Espresso with steamed milk and a thick layer of foam.", hot: true, iced: false, sweet: false, bitter: false, strong: true, light: false, milkBased: true, caffeine: true },
  { slug: "latte", name: "Caffè Latte", category: DrinkCategory.LATTE, description: "Espresso with lots of steamed milk — mild and creamy.", hot: true, iced: true, sweet: false, bitter: false, strong: false, light: true, milkBased: true, caffeine: true },
  { slug: "flat-white", name: "Flat White", category: DrinkCategory.LATTE, description: "Espresso-forward with velvety microfoam; stronger than a latte.", hot: true, iced: false, sweet: false, bitter: false, strong: true, light: false, milkBased: true, caffeine: true },
  { slug: "spanish-latte", name: "Spanish Latte", category: DrinkCategory.LATTE, description: "A sweet, creamy latte made with condensed milk.", hot: true, iced: true, sweet: true, bitter: false, strong: false, light: false, milkBased: true, caffeine: true },
  { slug: "caramel-macchiato", name: "Caramel Macchiato", category: DrinkCategory.LATTE, description: "Vanilla-sweetened milk, espresso, and caramel.", hot: true, iced: true, sweet: true, bitter: false, strong: false, light: false, milkBased: true, caffeine: true },
  { slug: "mocha", name: "Café Mocha", category: DrinkCategory.CHOCOLATE, description: "Espresso and chocolate with steamed milk — dessert-like.", hot: true, iced: true, sweet: true, bitter: false, strong: false, light: false, milkBased: true, caffeine: true },
  { slug: "cold-brew", name: "Cold Brew", category: DrinkCategory.COLD_COFFEE, description: "Slow-steeped cold coffee — smooth, strong, low bitterness.", hot: false, iced: true, sweet: false, bitter: false, strong: true, light: false, milkBased: false, caffeine: true },
  { slug: "iced-coffee", name: "Iced Coffee", category: DrinkCategory.COLD_COFFEE, description: "Chilled brewed coffee over ice; refreshing and light.", hot: false, iced: true, sweet: false, bitter: false, strong: false, light: true, milkBased: false, caffeine: true },
  { slug: "matcha-latte", name: "Matcha Latte", category: DrinkCategory.MATCHA, description: "Whisked green tea with steamed milk — earthy and mellow.", hot: true, iced: true, sweet: true, bitter: false, strong: false, light: true, milkBased: true, caffeine: true },
  { slug: "hot-chocolate", name: "Hot Chocolate", category: DrinkCategory.CHOCOLATE, description: "Rich cocoa with milk; sweet and caffeine-free.", hot: true, iced: false, sweet: true, bitter: false, strong: false, light: false, milkBased: true, caffeine: false },
  { slug: "chai-latte", name: "Chai Latte", category: DrinkCategory.TEA, description: "Spiced black tea with steamed milk — warm and sweet.", hot: true, iced: true, sweet: true, bitter: false, strong: false, light: false, milkBased: true, caffeine: true },
  { slug: "green-tea", name: "Green Tea", category: DrinkCategory.TEA, description: "Light, grassy, and refreshing; a gentle caffeine lift.", hot: true, iced: true, sweet: false, bitter: false, strong: false, light: true, milkBased: false, caffeine: true },
  { slug: "herbal-tea", name: "Herbal Tea", category: DrinkCategory.NON_COFFEE, description: "Caffeine-free infusion — soothing and light.", hot: true, iced: true, sweet: false, bitter: false, strong: false, light: true, milkBased: false, caffeine: false },
];

const AMENITIES: { key: string; label: string }[] = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "outlets", label: "Power outlets" },
  { key: "parking", label: "Parking" },
  { key: "outdoor", label: "Outdoor seating" },
  { key: "quiet", label: "Quiet space" },
];

const TAGS: { key: string; label: string }[] = [
  { key: "study", label: "Study" },
  { key: "work", label: "Work" },
  { key: "date", label: "Date" },
  { key: "quiet", label: "Quiet" },
  { key: "hangout", label: "Hangout" },
  { key: "specialty", label: "Specialty Coffee" },
  { key: "budget", label: "Budget-Friendly" },
  { key: "groups", label: "Groups" },
  { key: "open_late", label: "Open Late" },
];

interface SeedCafe {
  slug: string;
  name: string;
  region: Region;
  locality: string;
  latitude: number;
  longitude: number;
  description: string;
  tags: string[];
  amenities: string[];
}

// Coordinates are area-level approximations for a curated foundation dataset.
const CAFES: SeedCafe[] = [
  // ---------------- Luzon, Philippines ----------------
  {
    slug: "yardstick-coffee-makati",
    name: "Yardstick Coffee",
    region: Region.LUZON,
    locality: "Makati City",
    latitude: 14.5601,
    longitude: 121.0223,
    description:
      "Specialty coffee bar and roastery known among Manila's third-wave coffee scene.",
    tags: ["specialty", "work", "hangout"],
    amenities: ["wifi", "outlets"],
  },
  {
    slug: "tobys-estate-bgc",
    name: "Toby's Estate",
    region: Region.LUZON,
    locality: "Bonifacio Global City, Taguig",
    latitude: 14.5509,
    longitude: 121.0487,
    description:
      "Australian-rooted specialty coffee chain with a well-known BGC location.",
    tags: ["specialty", "work", "groups"],
    amenities: ["wifi", "outlets", "outdoor"],
  },
  {
    slug: "commune-cafe-makati",
    name: "Commune Cafe + Bar",
    region: Region.LUZON,
    locality: "Poblacion, Makati City",
    latitude: 14.5645,
    longitude: 121.0293,
    description:
      "Community-focused cafe and bar championing Philippine-grown coffee.",
    tags: ["hangout", "work", "groups", "open_late"],
    amenities: ["wifi", "outlets"],
  },
  {
    slug: "choco-late-de-batirol-baguio",
    name: "Choco-late de Batirol",
    region: Region.LUZON,
    locality: "Baguio City",
    latitude: 16.4118,
    longitude: 120.6255,
    description:
      "Garden cafe in Baguio famed for traditional tsokolate (hot chocolate).",
    tags: ["date", "quiet", "hangout"],
    amenities: ["outdoor", "parking"],
  },
  {
    slug: "bag-of-beans-tagaytay",
    name: "Bag of Beans",
    region: Region.LUZON,
    locality: "Tagaytay City",
    latitude: 14.1153,
    longitude: 120.9621,
    description:
      "Long-standing Tagaytay garden restaurant and bakery with a coffee menu.",
    tags: ["date", "groups", "hangout"],
    amenities: ["parking", "outdoor"],
  },
  {
    slug: "craft-coffee-revolution-qc",
    name: "Craft Coffee Revolution",
    region: Region.LUZON,
    locality: "Quezon City",
    latitude: 14.6488,
    longitude: 121.0509,
    description:
      "Cozy neighborhood specialty coffee spot popular with students and remote workers.",
    tags: ["study", "work", "quiet", "specialty"],
    amenities: ["wifi", "outlets", "quiet"],
  },
  // ---------------- Switzerland ----------------
  {
    slug: "mame-zurich",
    name: "MAME",
    region: Region.SWITZERLAND,
    locality: "Zürich",
    latitude: 47.3776,
    longitude: 8.5401,
    description:
      "Award-winning specialty coffee bar in Zürich with a strong barista pedigree.",
    tags: ["specialty", "quiet", "date"],
    amenities: ["wifi"],
  },
  {
    slug: "bros-coffee-zurich",
    name: "Bros Coffee Roasters",
    region: Region.SWITZERLAND,
    locality: "Zürich",
    latitude: 47.3901,
    longitude: 8.5155,
    description: "Local Zürich roaster and cafe focused on filter and espresso.",
    tags: ["specialty", "work"],
    amenities: ["wifi", "outlets"],
  },
  {
    slug: "boreal-coffee-geneva",
    name: "Boréal Coffee Shop",
    region: Region.SWITZERLAND,
    locality: "Genève",
    latitude: 46.2044,
    longitude: 6.1432,
    description:
      "Swiss specialty coffee shop chain with a well-known Geneva presence.",
    tags: ["work", "hangout", "specialty"],
    amenities: ["wifi", "outlets"],
  },
  {
    slug: "cafe-odeon-zurich",
    name: "Café Odeon",
    region: Region.SWITZERLAND,
    locality: "Zürich",
    latitude: 47.3668,
    longitude: 8.5453,
    description:
      "Historic Zürich café-bar dating to 1911, known for its grand-café atmosphere.",
    tags: ["date", "hangout", "open_late"],
    amenities: ["outdoor"],
  },
];

async function main() {
  console.log("Seeding CupScout curated dataset…");

  // Lookup tables (idempotent).
  for (const a of AMENITIES) {
    await prisma.amenity.upsert({
      where: { key: a.key },
      update: { label: a.label },
      create: a,
    });
  }
  for (const t of TAGS) {
    await prisma.tag.upsert({
      where: { key: t.key },
      update: { label: t.label },
      create: t,
    });
  }

  const amenityByKey = Object.fromEntries(
    (await prisma.amenity.findMany()).map((a) => [a.key, a.id]),
  );
  const tagByKey = Object.fromEntries(
    (await prisma.tag.findMany()).map((t) => [t.key, t.id]),
  );

  for (const c of CAFES) {
    const cafe = await prisma.cafe.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        region: c.region,
        locality: c.locality,
        latitude: c.latitude,
        longitude: c.longitude,
        description: c.description,
        source: DataSource.CURATED,
        sourceName: "CupScout curated",
      },
      create: {
        slug: c.slug,
        name: c.name,
        region: c.region,
        locality: c.locality,
        latitude: c.latitude,
        longitude: c.longitude,
        description: c.description,
        source: DataSource.CURATED,
        sourceName: "CupScout curated",
        // rating / reviewCount / priceLevel / hours / drinks intentionally omitted.
      },
    });

    // Reset & re-link editorial tags/amenities.
    await prisma.cafeTag.deleteMany({ where: { cafeId: cafe.id } });
    await prisma.cafeAmenity.deleteMany({ where: { cafeId: cafe.id } });

    for (const key of c.tags) {
      const tagId = tagByKey[key];
      if (tagId) {
        await prisma.cafeTag.create({ data: { cafeId: cafe.id, tagId } });
      }
    }
    for (const key of c.amenities) {
      const amenityId = amenityByKey[key];
      if (amenityId) {
        await prisma.cafeAmenity.create({
          data: { cafeId: cafe.id, amenityId },
        });
      }
    }
  }

  // Drink-type guide (general knowledge for recommendations).
  for (const d of DRINK_TYPES) {
    await prisma.drinkType.upsert({
      where: { slug: d.slug },
      update: {
        name: d.name,
        category: d.category,
        description: d.description,
        hotAvailable: d.hot,
        icedAvailable: d.iced,
        sweet: d.sweet,
        bitter: d.bitter,
        strong: d.strong,
        light: d.light,
        milkBased: d.milkBased,
        hasCaffeine: d.caffeine,
      },
      create: {
        slug: d.slug,
        name: d.name,
        category: d.category,
        description: d.description,
        hotAvailable: d.hot,
        icedAvailable: d.iced,
        sweet: d.sweet,
        bitter: d.bitter,
        strong: d.strong,
        light: d.light,
        milkBased: d.milkBased,
        hasCaffeine: d.caffeine,
      },
    });
  }

  // Admin bootstrap (Sprint 0): the seed NEVER creates a default admin in
  // production, and never uses a weak/default password. In production the ONLY
  // way to create an admin is `npm run db:create-admin` (strength-enforced).
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const isProd = process.env.NODE_ENV === "production";
  let adminNote = "no admin created (run `npm run db:create-admin`)";

  if (adminEmail && adminPassword) {
    const check = validateAdminPassword(adminPassword);
    if (isProd && !check.ok) {
      throw new Error(
        `[seed] Refusing to create a weak/default admin in production: ${check.reason}. ` +
          `Set a strong ADMIN_PASSWORD or use \`npm run db:create-admin\`.`,
      );
    }
    if (!isProd && !check.ok) {
      console.warn(`[seed] DEV admin password is weak (${check.reason}). Fine for dev only.`);
    }
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: Role.ADMIN, passwordHash, suspended: false },
      create: { email: adminEmail, passwordHash, displayName: "Administrator", role: Role.ADMIN },
    });
    adminNote = `admin (${adminEmail})`;
  } else if (isProd) {
    console.log("[seed] Production: skipping admin creation. Use `npm run db:create-admin`.");
  }

  console.log(
    `Seeded ${CAFES.length} cafes, ${DRINK_TYPES.length} drink types, ${adminNote}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
