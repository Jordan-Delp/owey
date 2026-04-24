"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-blue-400 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
    >
      Sign out
    </button>
  );
}
