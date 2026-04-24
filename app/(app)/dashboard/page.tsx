import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ChevronRight, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { receipts: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Groups</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {groups.length === 0 ? "No groups yet" : `${groups.length} group${groups.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button asChild>
          <Link href="/groups/new">
            <Plus />
            New group
          </Link>
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No groups yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create a group to start splitting bills with friends.</p>
            <Button asChild className="mt-4">
              <Link href="/groups/new">Create your first group</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-4 space-y-2">
          {groups.map((group) => (
            <li key={group.id}>
              <Link href={`/groups/${group.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base font-bold text-primary">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{group.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {group._count.receipts} {group._count.receipts === 1 ? "receipt" : "receipts"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
