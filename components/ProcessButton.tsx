"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

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

    const res = await fetch(`/api/receipts/${receiptId}/process`, { method: "POST" });

    if (!res.ok) {
      setError("Processing failed");
      setProcessing(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="text-right">
      <Button onClick={handleProcess} disabled={processing} size="sm">
        {processing ? (
          "Processing..."
        ) : (
          <>
            <Sparkles />
            Process
          </>
        )}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
