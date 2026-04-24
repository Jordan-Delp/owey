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
      <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
        ← Dashboard
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900">{group.name}</h1>
        <ReceiptUploader groupId={group.id} />
      </div>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Members</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {group.members.map((m) => (
            <li
              key={m.id}
              className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
            >
              {m.user.name ?? m.user.email}
            </li>
          ))}
        </ul>
        <AddMemberForm groupId={group.id} />
      </section>

      <section className="mt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Receipts</h2>
        {group.receipts.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-400">No receipts yet. Upload one to get started.</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {group.receipts.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-slate-400">{r.status}</p>
                </div>
                {r.status === "pending" && <ProcessButton receiptId={r.id} />}
                {r.status === "done" && (
                  <Link
                    href={`/groups/${group.id}/receipts/${r.id}`}
                    className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-100"
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
