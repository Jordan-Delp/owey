"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewGroupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const venmoHandle = (form.elements.namedItem("venmoHandle") as HTMLInputElement).value || undefined;


    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, venmoHandle }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="space-y-1 pb-4">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              ← Back to dashboard
            </Link>
            <CardTitle className="text-2xl">New group</CardTitle>
            <CardDescription>Give your group a name to get started. You can add members after.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Group name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Tokyo Trip, Apartment 4B"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venmoHandle">
                  Your Venmo username <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                  <Input id="venmoHandle" name="venmoHandle" type="text" placeholder="your-venmo" className="pl-7" />
                </div>
                <p className="text-xs text-muted-foreground">Members will use this to pay you back.</p>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "Creating..." : "Create group"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
