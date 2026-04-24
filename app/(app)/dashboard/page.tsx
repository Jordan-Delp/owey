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
    <main className="mx-auto max-w-2xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Groups</h1>
        <Link
          href="/groups/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New group
        </Link>
      </div>

      {groups.length === 0 ? (
        <p className="mt-8 text-gray-500">
          No groups yet. Create one to get started.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="flex items-center justify-between rounded border p-4 hover:bg-gray-50"
              >
                <span className="font-medium">{group.name}</span>
                <span className="text-sm text-gray-500">
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