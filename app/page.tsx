import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Receipt, Users, Wallet } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-lg font-black text-primary">Owey</span>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground shadow-lg">
            O
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Snap a receipt.
            <br />
            <span className="text-primary">Split the bill.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">
            Upload a photo of any receipt, tap what you ordered, and Owey splits
            tax and tip proportionally — then sends everyone a Venmo link.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Get started free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Upload the receipt</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Take a photo or upload an image. Claude AI reads every line item automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Tap what you ordered</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Each person taps their items. Shared dishes split automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Pay with Venmo</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tax and tip split proportionally. One tap sends money on Venmo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
