"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Users } from "lucide-react";
import { calculateSettlement } from "@/lib/settlement";

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
  ownerId: string;
  ownerVenmoHandle?: string | null;
}

export default function ItemizationUI({ receipt, currentUserId, ownerId, ownerVenmoHandle }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  // Track current user's claims locally for instant UI feedback
  const [myClaims, setMyClaims] = useState<Set<string>>(
    () => new Set(
      receipt.lineItems
        .filter((item) => item.claims.some((c) => c.userId === currentUserId))
        .map((item) => item.id)
    )
  );

  // Sync myClaims when server data arrives (from polling)
  useEffect(() => {
    setMyClaims(
      new Set(
        receipt.lineItems
          .filter((item) => item.claims.some((c) => c.userId === currentUserId))
          .map((item) => item.id)
      )
    );
  }, [receipt, currentUserId]);

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
    setMyClaims((prev) => {
      const next = new Set(prev);
      if (claimed) next.delete(lineItemId);
      else next.add(lineItemId);
      return next;
    });

    setLoading(lineItemId);
    await fetch(`/api/line-items/${lineItemId}/claim`, {
      method: claimed ? "DELETE" : "POST",
    });
    setLoading(null);
    router.refresh();
  }

  const settlement = calculateSettlement(
  receipt.lineItems,
  receipt.tax ?? 0,
  receipt.tip ?? 0
  );

  const totalReceiptValue = receipt.lineItems.reduce((sum, item) => sum + item.price, 0);
  const unclaimedSubtotal = receipt.lineItems
    .filter((item) => item.claims.length === 0)
    .reduce((sum, item) => sum + item.price, 0);

  function unclaimedTotal() {
    if (totalReceiptValue === 0) return 0;
    const proportion = unclaimedSubtotal / totalReceiptValue;
    return unclaimedSubtotal + (receipt.tax ?? 0) * proportion + (receipt.tip ?? 0) * proportion;
  }

  function venmoLink(amount: number, note: string) {
    const encodedNote = encodeURIComponent(`Owey: ${note}`);
    if (ownerVenmoHandle) {
      return `https://account.venmo.com/payment-link?txn=pay&recipients=${ownerVenmoHandle}&amount=${amount.toFixed(2)}&note=${encodedNote}`;
    }
    return `https://account.venmo.com/payment-link?txn=pay&amount=${amount.toFixed(2)}&note=${encodedNote}`;
  }

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <div className="mt-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            Items
          </CardTitle>
          <p className="text-xs text-muted-foreground">Tap the items you ordered.</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {receipt.lineItems.map((item) => {
              const claimed = myClaims.has(item.id);
              return (
                <li
                  key={item.id}
                  onClick={() => toggleClaim(item.id, claimed)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all select-none active:scale-[0.99] ${
                    claimed
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.claims.length === 0 ? (
                        <Badge variant="outline" className="h-4 text-[10px]">Unclaimed</Badge>
                      ) : (
                        item.claims.map((c) => (
                          <Badge
                            key={c.userId}
                            variant={c.userId === currentUserId ? "default" : "secondary"}
                            className="h-4 text-[10px]"
                          >
                            {c.user.name ?? c.user.email.split("@")[0]}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                    {loading === item.id && <p className="text-xs text-muted-foreground">...</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Settlement
          </CardTitle>
          {(receipt.tax ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground">
              Tax ${receipt.tax?.toFixed(2)} and tip ${receipt.tip?.toFixed(2)} split proportionally.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {(() => {
              const ownerMember = receipt.group.members.find((m) => m.userId === ownerId);
              const ownerName = ownerMember?.user.name ?? ownerMember?.user.email.split("@")[0] ?? "host";
              return receipt.group.members.map((m, i) => {
              const userTotals = settlement[m.userId];
              const subtotal = userTotals?.subtotal ?? 0;
              const tax = userTotals?.tax ?? 0;
              const tip = userTotals?.tip ?? 0;
              const isOwner = m.userId === ownerId;
              const isCurrentUser = m.userId === currentUserId;
              const total = isOwner
                ? (userTotals?.total ?? 0) + unclaimedTotal()
                : (userTotals?.total ?? 0);
              const displayName = m.user.name ?? m.user.email;
              const showVenmo = isCurrentUser && !isOwner && total > 0;

              return (
                <li key={m.userId}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className={`text-sm font-semibold ${isCurrentUser ? "bg-primary text-primary-foreground" : ""}`}>
                        {initials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {displayName}
                        {isOwner && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(host)</span>}
                      </p>
                      {(subtotal > 0 || (isOwner && unclaimedTotal() > 0)) && (
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          {subtotal > 0 && <span>Food ${subtotal.toFixed(2)}</span>}
                          {tax > 0 && <span>Tax ${tax.toFixed(2)}</span>}
                          {tip > 0 && <span>Tip ${tip.toFixed(2)}</span>}
                          {isOwner && unclaimedTotal() > 0 && (
                            <span>Unclaimed ${unclaimedTotal().toFixed(2)}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-bold">${total.toFixed(2)}</p>
                      {showVenmo && (
                        <a
                          href={venmoLink(total, displayName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block rounded-md bg-[#3D95CE] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#3585b8]"
                        >
                          Pay {ownerName}
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
              });
            })()}
            {false && (
              <>
                <Separator />
                <li className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Unclaimed</span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    ${unclaimedTotal().toFixed(2)}
                  </span>
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
