import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo owner (Alex — paid the bill)
  const ownerPassword = await bcrypt.hash("owey-demo-owner", 12);
  const owner = await prisma.user.upsert({
    where: { email: "alex@owey-demo.app" },
    update: {},
    create: {
      name: "Alex",
      email: "alex@owey-demo.app",
      password: ownerPassword,
    },
  });

  // Create demo visitor (the person trying the app)
  const demoPassword = await bcrypt.hash("demo1234", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@owey.app" },
    update: {},
    create: {
      name: "You",
      email: "demo@owey.app",
      password: demoPassword,
    },
  });

  // Create group if it doesn't already exist
  let group = await prisma.group.findFirst({
    where: { ownerId: owner.id, name: "Friday Night Dinner" },
  });

  if (!group) {
    group = await prisma.group.create({
      data: {
        name: "Friday Night Dinner",
        ownerId: owner.id,
        members: {
          create: [{ userId: owner.id }, { userId: demoUser.id }],
        },
      },
    });
  } else {
    // Ensure demo user is a member
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: demoUser.id } },
      update: {},
      create: { groupId: group.id, userId: demoUser.id },
    });
  }

  // Create receipt if it doesn't already exist
  let receipt = await prisma.receipt.findFirst({
    where: { groupId: group.id },
  });

  if (!receipt) {
    receipt = await prisma.receipt.create({
      data: {
        groupId: group.id,
        uploadedBy: owner.id,
        imageKey: "demo",
        status: "done",
        tax: 4.32,
        tip: 8.0,
      },
    });

    // Create line items
    const [pizza, salad, pasta, bread, sodas] = await Promise.all([
      prisma.lineItem.create({ data: { receiptId: receipt.id, name: "Margherita Pizza", price: 16.0 } }),
      prisma.lineItem.create({ data: { receiptId: receipt.id, name: "House Salad", price: 9.0 } }),
      prisma.lineItem.create({ data: { receiptId: receipt.id, name: "Pasta Alfredo", price: 18.0 } }),
      prisma.lineItem.create({ data: { receiptId: receipt.id, name: "Garlic Bread", price: 6.0 } }),
      prisma.lineItem.create({ data: { receiptId: receipt.id, name: "Sodas (x2)", price: 5.0 } }),
    ]);

    // Alex already claimed his items
    await Promise.all([
      prisma.claim.create({ data: { lineItemId: pizza.id, userId: owner.id } }),
      prisma.claim.create({ data: { lineItemId: salad.id, userId: owner.id } }),
    ]);

    // Pasta, bread, sodas are unclaimed — the demo user can tap them
    console.log("Created receipt:", receipt.id);
  }

  console.log("\n✅ Demo data ready");
  console.log("   Email:    demo@owey.app");
  console.log("   Password: demo1234\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
