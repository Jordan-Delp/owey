import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;
  const { email } = await req.json();

  const requesterMembership = await prisma.groupMember.findFirst({
    where: { groupId, userId: session.user.id },
  });
  if (!requesterMembership) {
    return NextResponse.json({ message: "Not a member of this group" }, { status: 403 });
  }

  const userToAdd = await prisma.user.findUnique({ where: { email } });
  if (!userToAdd) {
    return NextResponse.json(
      { message: "No Owey account found with that email" },
      { status: 404 }
    );
  }

  const existing = await prisma.groupMember.findFirst({
    where: { groupId, userId: userToAdd.id },
  });
  if (existing) {
    return NextResponse.json({ message: "That person is already in this group" }, { status: 409 });
  }

  await prisma.groupMember.create({
    data: { groupId, userId: userToAdd.id },
  });

  return NextResponse.json({ name: userToAdd.name ?? userToAdd.email });
}
