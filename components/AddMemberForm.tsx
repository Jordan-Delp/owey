"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddMemberForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage({ text: data.message ?? "Something went wrong", type: "error" });
    } else {
      setMessage({ text: `${data.name ?? email} added.`, type: "success" });
      setEmail("");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@email.com"
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Adding..." : "Add"}
        </Button>
      </form>
      {message && (
        <p className={`mt-1.5 text-xs ${message.type === "error" ? "text-destructive" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
