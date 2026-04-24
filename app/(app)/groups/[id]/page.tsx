import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ReceiptUploader from "@/components/ReceiptUploader";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GroupPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      receipts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!group) notFound();

  const isMember = group.members.some((m) => m.userId === session.user.id);
  if (!isMember) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <ReceiptUploader groupId={group.id} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-500">Members</h2>
        <ul className="mt-2 flex gap-2">
          {group.members.map((m) => (
            <li
              key={m.id}
              className="rounded-full border px-3 py-1 text-sm"
            >
              {m.user.name ?? m.user.email}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-500">Receipts</h2>
        {group.receipts.length === 0 ? (
          <p className="mt-2 text-gray-500">
            No receipts yet. Upload one to get started.
          </p>
        ) : (
          <ul className="mt-2 space-y-3">
            {group.receipts.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded border p-4">
                <span className="text-sm">{new Date(r.createdAt).toLocaleDateString()}</span>
                <span className="text-sm capitalize text-gray-500">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}