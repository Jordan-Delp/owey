export interface Claim {
  userId: string;
}

export interface LineItem {
  id: string;
  price: number;
  claims: Claim[];
}

export interface UserTotal {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export function calculateSettlement(
  lineItems: LineItem[],
  tax: number,
  tip: number
): Record<string, UserTotal> {
  const subtotals: Record<string, number> = {};
  const totalReceiptValue = lineItems.reduce((sum, item) => sum + item.price, 0);

  for (const item of lineItems) {
    if (item.claims.length === 0) continue;
    const share = item.price / item.claims.length;
    for (const claim of item.claims) {
      subtotals[claim.userId] = (subtotals[claim.userId] ?? 0) + share;
    }
  }

  const result: Record<string, UserTotal> = {};
  for (const [userId, subtotal] of Object.entries(subtotals)) {
    const proportion = totalReceiptValue === 0 ? 0 : subtotal / totalReceiptValue;
    const userTax = tax * proportion;
    const userTip = tip * proportion;
    result[userId] = {
      subtotal,
      tax: userTax,
      tip: userTip,
      total: subtotal + userTax + userTip,
    };
  }

  return result;
}