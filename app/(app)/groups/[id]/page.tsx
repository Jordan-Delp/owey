import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ReceiptUploader from "@/components/ReceiptUploader";
import ProcessButton from "@/components/ProcessButton";
import AddMemberForm from "@/components/AddMemberForm";

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
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-8">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Dashboard
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <ReceiptUploader groupId={group.id} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-500">Members</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {group.members.map((m) => (
            <li key={m.id} className="rounded-full border px-3 py-1 text-sm">
              {m.user.name ?? m.user.email}
            </li>
          ))}
        </ul>
        <AddMemberForm groupId={group.id} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-500">Receipts</h2>
        {group.receipts.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No receipts yet. Upload one to get started.
          </p>
        ) : (
          <ul className="mt-2 space-y-3">
            {group.receipts.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded border p-4">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs capitalize text-gray-400">{r.status}</p>
                </div>
                {r.status === "pending" && <ProcessButton receiptId={r.id} />}
                {r.status === "done" && (
                  <Link
                    href={`/groups/${group.id}/receipts/${r.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
