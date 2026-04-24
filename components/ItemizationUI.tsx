"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Claim {
  id: string;
  userId: string;
  user: User;
}

interface LineItem {
  id: string;
  name: string;
  price: number;
  claims: Claim[];
}

interface Member {
  userId: string;
  user: User;
}

interface Receipt {
  id: string;
  tax: number | null;
  tip: number | null;
  lineItems: LineItem[];
  group: { members: Member[] };
}

interface Props {
  receipt: Receipt;
  currentUserId: string;
}

export default function ItemizationUI({ receipt, currentUserId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 1500);

    function handleVisible() {
      if (!document.hidden) router.refresh();
    }
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [router]);

  async function toggleClaim(lineItemId: string, claimed: boolean) {
    setLoading(lineItemId);

    await fetch(`/api/line-items/${lineItemId}/claim`, {
      method: claimed ? "DELETE" : "POST",
    });

    setLoading(null);
    router.refresh();
  }

  const subtotals: Record<string, number> = {};
  for (const item of receipt.lineItems) {
    if (item.claims.length === 0) continue;
    const share = item.price / item.claims.length;
    for (const claim of item.claims) {
      subtotals[claim.userId] = (subtotals[claim.userId] ?? 0) + share;
    }
  }

  const totalReceiptValue = receipt.lineItems.reduce((sum, item) => sum + item.price, 0);
  const unclaimedSubtotal = receipt.lineItems
    .filter((item) => item.claims.length === 0)
    .reduce((sum, item) => sum + item.price, 0);

  function unclaimedTotal() {
    if (totalReceiptValue === 0) return 0;
    const proportion = unclaimedSubtotal / totalReceiptValue;
    const tax = (receipt.tax ?? 0) * proportion;
    const tip = (receipt.tip ?? 0) * proportion;
    return unclaimedSubtotal + tax + tip;
  }

  function venmoLink(amount: number, name: string) {
    const note = encodeURIComponent(`Owey: ${name}'s share`);
    return `venmo://paycharge?txn=pay&amount=${amount.toFixed(2)}&note=${note}`;
  }

  return (
    <div className="mt-6 space-y-8">
      <section>
        <h2 className="text-sm font-medium text-gray-500">Items</h2>
        <p className="mt-1 text-xs text-gray-400">Tap the items you ordered.</p>
        <ul className="mt-2 space-y-2">
          {receipt.lineItems.map((item) => {
            const claimed = item.claims.some((c) => c.userId === currentUserId);
            return (
              <li
                key={item.id}
                onClick={() => toggleClaim(item.id, claimed)}
                className={`flex cursor-pointer items-center justify-between rounded border p-3 transition-colors active:scale-[0.99] ${
                  claimed
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {item.claims.length > 0
                      ? `Split: ${item.claims.map((c) => c.user.name ?? c.user.email).join(", ")}`
                      : "Unclaimed"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                  {loading === item.id && (
                    <p className="text-xs text-gray-400">...</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-500">Settlement</h2>
        <ul className="mt-2 space-y-2">
          {receipt.group.members.map((m) => {
            const subtotal = subtotals[m.userId] ?? 0;
            const proportion = totalReceiptValue === 0 ? 0 : subtotal / totalReceiptValue;
            const tax = (receipt.tax ?? 0) * proportion;
            const tip = (receipt.tip ?? 0) * proportion;
            const total = subtotal + tax + tip;

            return (
              <li key={m.userId} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {m.user.name ?? m.user.email}
                  </span>
                  <span className="text-sm font-semibold">${total.toFixed(2)}</span>
                </div>
                {subtotal > 0 && (
                  <>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      <span>Food ${subtotal.toFixed(2)}</span>
                      <span>Tax ${tax.toFixed(2)}</span>
                      <span>Tip ${tip.toFixed(2)}</span>
                    </div>
                    {m.userId !== currentUserId && (
                      <div className="mt-2">
                        <a
                          href={venmoLink(total, m.user.name ?? m.user.email)}
                          className="inline-block rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 active:bg-blue-700"
                        >
                          Pay with Venmo
                        </a>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
          {unclaimedTotal() > 0 && (
            <li className="flex items-center justify-between rounded border border-dashed p-3">
              <span className="text-sm text-gray-500">Unclaimed</span>
              <span className="text-sm font-medium text-gray-500">
                ${unclaimedTotal().toFixed(2)}
              </span>
            </li>
          )}
        </ul>
        {(receipt.tax ?? 0) > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            Tax ${receipt.tax?.toFixed(2)} and tip ${receipt.tip?.toFixed(2)} split proportionally.
          </p>
        )}
      </section>
    </div>
  );
}
