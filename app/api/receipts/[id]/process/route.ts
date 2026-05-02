import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: { group: { include: { members: true } } },
  });

  if (!receipt) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const isMember = receipt.group.members.some((m) => m.userId === session.user.id);
  if (!isMember) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  

const imageUrl = await getSignedUrl(
  s3,
  new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_RECEIPTS!,
    Key: receipt.imageKey,
  }),
  { expiresIn: 60 }
);

  await prisma.receipt.update({
    where: { id },
    data: { status: "processing" },
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "url", url: imageUrl },
          },
          {
            type: "text",
            text: `Extract all line items from this restaurant receipt. Return ONLY valid JSON with no markdown, no code blocks, no explanation. Use exactly this shape:
            {
                "items": [{ "name": "string", "price": number }],
                "tax": number,
                "tip": number
            }
            If an item has modifiers or add-ons (e.g. "Add Sprite", "Add Pepperoni"), merge them into the parent item: combine the names and add the prices together.If tax or tip are not present, use 0.`,
          },
        ],
      },
    ],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/^```json\s*|^```\s*|```$/gm, "").trim();
  const parsed = JSON.parse(cleaned);

  await prisma.$transaction([
    prisma.lineItem.createMany({
      data: parsed.items.map((item: { name: string; price: number }) => ({
        receiptId: id,
        name: item.name,
        price: item.price,
      })),
    }),
    prisma.receipt.update({
      where: { id },
      data: {
        tax: parsed.tax,
        tip: parsed.tip,
        status: "done",
      },
    }),
  ]);

  return NextResponse.json({ message: "Processed" });
}