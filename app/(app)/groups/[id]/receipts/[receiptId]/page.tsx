import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ItemizationUI from "@/components/ItemizationUI";

interface Props {
  params: Promise<{ id: string; receiptId: string }>;
}

export default async function ReceiptPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id: groupId, receiptId } = await params;

  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      lineItems: {
        include: { claims: { include: { user: true } } },
      },
      group: {
        include: { members: { include: { user: true } } },
      },
    },
  });

  if (!receipt) notFound();

  const isMember = receipt.group.members.some((m) => m.userId === session.user.id);
  if (!isMember) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-8">
      <Link
        href={`/groups/${groupId}`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to group
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Split this receipt</h1>
      <p className="mt-1 text-sm text-gray-500">
        Tap the items you ordered.
      </p>

      <ItemizationUI
        receipt={receipt}
        currentUserId={session.user.id}
      />
    </main>
  );
}