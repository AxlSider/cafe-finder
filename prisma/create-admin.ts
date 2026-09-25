/**
 * One-time admin bootstrap (Sprint 0).
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='<strong>' npm run db:create-admin
 *   npm run db:create-admin -- you@example.com     # email via arg, password via env
 *
 * Always enforces a strong password (see validateAdminPassword). Creates the
 * admin, or promotes/updates an existing user to ADMIN with the new password.
 * This is the ONLY supported way to create an admin in production.
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { validateAdminPassword } from "../src/lib/auth/adminSecurity";

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    console.error("[create-admin] Provide a valid ADMIN_EMAIL (env or arg).");
    process.exit(1);
  }
  const check = validateAdminPassword(password);
  if (!check.ok) {
    console.error(`[create-admin] Weak ADMIN_PASSWORD: ${check.reason}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, passwordHash, suspended: false },
    create: { email, passwordHash, displayName: "Administrator", role: Role.ADMIN },
  });
  // Any existing sessions for this account are invalidated (password changed).
  await prisma.session.deleteMany({ where: { userId: user.id } });

  console.log(`[create-admin] Admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
