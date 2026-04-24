import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg">
          O
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Snap a receipt.{" "}
          <span className="text-blue-600">Split the bill.</span>
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          Upload a receipt, tap what you ordered, and Owey handles the math 
        </p>
        
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
