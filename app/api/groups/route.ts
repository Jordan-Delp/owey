import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const groups = await prisma.group.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      members: { include: { user: true } },
      _count: { select: { receipts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, venmoHandle } = await req.json();
  if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 });

  const group = await prisma.group.create({
    data: {
      name,
      venmoHandle: venmoHandle || null,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id },
      },
    },
  });

  return NextResponse.json(group, { status: 201 });
}