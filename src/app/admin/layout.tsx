import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

// Every /admin route is gated server-side. Non-admins never see admin data.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-faint/20 pb-3">
        <h1 className="text-xl font-bold">Admin</h1>
        <nav aria-label="Admin" className="flex flex-wrap gap-1 text-sm">
          <Link href="/admin" className="btn-ghost">
            Dashboard
          </Link>
          <Link href="/admin/cafes" className="btn-ghost">
            Cafes
          </Link>
          <Link href="/admin/import" className="btn-ghost">
            Import
          </Link>
          <Link href="/admin/reports" className="btn-ghost">
            Reports
          </Link>
          <Link href="/admin/users" className="btn-ghost">
            Users
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
