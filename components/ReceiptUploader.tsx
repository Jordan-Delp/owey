"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface Props {
  groupId: string;
}

export default function ReceiptUploader({ groupId }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const presignRes = await fetch("/api/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileType: file.type }),
    });

    if (!presignRes.ok) {
      setError("Failed to get upload URL");
      setUploading(false);
      return;
    }

    const { url, key } = await presignRes.json();

    const uploadRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      setError("Upload failed");
      setUploading(false);
      return;
    }

    const receiptRes = await fetch(`/api/groups/${groupId}/receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    if (!receiptRes.ok) {
      setError("Failed to save receipt");
      setUploading(false);
      return;
    }

    setUploading(false);
    router.refresh();
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? (
          "Uploading..."
        ) : (
          <>
            <Upload />
            Upload receipt
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
