"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
    >
      <LogOut />
      Sign out
    </Button>
  );
}
