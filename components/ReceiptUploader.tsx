"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload receipt"}
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
