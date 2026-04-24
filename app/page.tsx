import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Snap a receipt. Split the bill.
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Upload the receipt, tap what you ordered, and Owey handles the math.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/register"
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Get started
          </Link>
          <Link
            href="/demo"
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Try the demo
          </Link>
        </div>
      </div>
    </main>
  );
}
