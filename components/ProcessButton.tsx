"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  receiptId: string;
}

export default function ProcessButton({ receiptId }: Props) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleProcess() {
    setProcessing(true);
    setError(null);

    const res = await fetch(`/api/receipts/${receiptId}/process`, {
      method: "POST",
    });

    if (!res.ok) {
      setError("Processing failed");
      setProcessing(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        onClick={handleProcess}
        disabled={processing}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {processing ? "Processing..." : "Process"}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}