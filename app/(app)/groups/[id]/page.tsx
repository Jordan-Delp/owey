import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ReceiptUploader from "@/components/ReceiptUploader";
import ProcessButton from "@/components/ProcessButton";
import AddMemberForm from "@/components/AddMemberForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Receipt, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <Link href="/dashboard" className="text-sm text-primary hover:underline">
        ← Dashboard
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <ReceiptUploader groupId={group.id} />
      </div>

      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {group.members.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5 rounded-full border bg-muted/50 pl-1 pr-3 py-1">
                  <Avatar size="sm">
                    <AvatarFallback className="text-xs">
                      {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{m.user.name ?? m.user.email}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Add a member by email</p>
              <AddMemberForm groupId={group.id} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4" />
              Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {group.receipts.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No receipts yet. Upload one to get started.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {group.receipts.map((r) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(r.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <Badge
                          variant={r.status === "done" ? "default" : "secondary"}
                          className="mt-0.5 h-4 text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </div>
                    </div>
                    {r.status === "pending" && <ProcessButton receiptId={r.id} />}
                    {r.status === "done" && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/groups/${group.id}/receipts/${r.id}`}>View →</Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
