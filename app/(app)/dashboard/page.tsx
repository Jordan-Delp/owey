import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { receipts: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Your Groups</h1>
        <Link
          href="/groups/new"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
        >
          + New group
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-slate-400">No groups yet.</p>
          <p className="mt-1 text-sm text-slate-400">Create one to start splitting bills.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-base font-bold text-blue-600">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-800">{group.name}</span>
                </div>
                <span className="text-sm text-slate-400">
                  {group._count.receipts}{" "}
                  {group._count.receipts === 1 ? "receipt" : "receipts"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
