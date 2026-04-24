"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function DemoButton() {
  const [loading, setLoading] = useState(false);

  async function handleDemo() {
    setLoading(true);
    await signIn("credentials", {
      email: "demo@owey.app",
      password: "demo1234",
      callbackUrl: "/dashboard",
    });
  }

  return (
    <Button variant="outline" size="lg" onClick={handleDemo} disabled={loading}>
      {loading ? "Loading..." : "Try demo"}
    </Button>
  );
}
