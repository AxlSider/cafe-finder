import { prisma } from "@/lib/prisma";
import { UserActions } from "./UserActions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      suspended: true,
      createdAt: true,
      _count: { select: { favoriteCafes: true, reports: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Users ({users.length})</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-faint/20 text-left text-ink-muted">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Saved</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink-faint/10">
                <td className="p-3 font-medium text-ink">{u.email}</td>
                <td className="p-3 text-ink-soft">{u.displayName ?? "—"}</td>
                <td className="p-3">
                  <span className={`chip ${u.role === "ADMIN" ? "chip-active" : ""}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3 text-ink-soft">{u._count.favoriteCafes}</td>
                <td className="p-3">
                  {u.suspended ? (
                    <span className="text-danger">Suspended</span>
                  ) : (
                    <span className="text-success">Active</span>
                  )}
                </td>
                <td className="p-3">
                  <UserActions id={u.id} suspended={u.suspended} isAdmin={u.role === "ADMIN"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
