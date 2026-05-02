import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST() {

const cutoff = new Date(Date.now() - 60 * 60 * 1000);

const oldVisitors = await prisma.user.findMany({
  where: {
    email: { endsWith: "-visitor@owey-demo.app" },
    createdAt: { lt: cutoff },
  },
  include: { groupMembers: { select: { groupId: true } } },
});

const groupIds = oldVisitors.flatMap((v) => v.groupMembers.map((g) => g.groupId));

if (groupIds.length > 0) {
  await prisma.group.deleteMany({ where: { id: { in: groupIds } } });
}

await prisma.user.deleteMany({
  where: {
    email: { endsWith: "-visitor@owey-demo.app" },
    createdAt: { lt: cutoff },
  },
});

  const owner = await prisma.user.findUnique({
    where: { email: "alex@owey-demo.app" },
  });

  if (!owner) {
    return NextResponse.json({ error: "Demo not configured" }, { status: 500 });
  }

  const uid = randomBytes(4).toString("hex");
  const email = `demo-${uid}-visitor@owey-demo.app`;
  const password = randomBytes(8).toString("hex");
  const hashed = await bcrypt.hash(password, 12);

  const visitor = await prisma.user.create({
    data: { name: "You", email, password: hashed },
  });

  const group = await prisma.group.create({
    data: {
      name: "Friday Night Dinner",
      ownerId: owner.id,
      members: {
        create: [{ userId: owner.id }, { userId: visitor.id }],
      },
    },
  });

  const receipt = await prisma.receipt.create({
    data: {
      groupId: group.id,
      uploadedBy: owner.id,
      imageKey: "demo",
      status: "done",
      tax: 4.32,
      tip: 8.0,
    },
  });

  const [pizza, salad, pasta, bread, sodas] = await Promise.all([
    prisma.lineItem.create({ data: { receiptId: receipt.id, name: "Margherita Pizza", price: 16.0 } }),
    prisma.lineItem.create({ data: { receiptId: receipt.id, name: "House Salad", price: 9.0 } }),
    prisma.lineItem.create({ data: { receiptId: receipt.id, name: "Pasta Alfredo", price: 18.0 } }),
    prisma.lineItem.create({ data: { receiptId: receipt.id, name: "Garlic Bread", price: 6.0 } }),
    prisma.lineItem.create({ data: { receiptId: receipt.id, name: "Sodas (x2)", price: 5.0 } }),
  ]);

  await Promise.all([
    prisma.claim.create({ data: { lineItemId: pizza.id, userId: owner.id } }),
    prisma.claim.create({ data: { lineItemId: salad.id, userId: owner.id } }),
    prisma.claim.create({ data: { lineItemId: sodas.id, userId: owner.id } })
  ]);

  return NextResponse.json({ email, password });
}