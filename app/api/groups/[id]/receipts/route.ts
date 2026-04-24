import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;
  const { key } = await req.json();

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });

  if (!member) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const receipt = await prisma.receipt.create({
    data: {
      groupId,
      uploadedBy: session.user.id,
      imageKey: key,
    },
  });

  return NextResponse.json(receipt, { status: 201 });
}