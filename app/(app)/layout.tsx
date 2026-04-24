import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <>
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-8">
          <Link href="/dashboard" className="text-base font-bold tracking-tight">
            Owey
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:block">
              {session?.user?.name ?? session?.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
