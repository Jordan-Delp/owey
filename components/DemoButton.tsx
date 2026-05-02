"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function DemoButton() {
  const [loading, setLoading] = useState(false);

  async function handleDemo() {
    setLoading(true);
    
    const res = await fetch("/api/demo", { method: "POST" });
    const { email, password } = await res.json();

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
  }

  return (
    <Button variant="outline" size="lg" onClick={handleDemo} disabled={loading}>
      {loading ? "Setting up demo..." : "Try demo"}
    </Button>
  );
}