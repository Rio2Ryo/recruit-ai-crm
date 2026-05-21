"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LineCopyField({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500">{label}</p>
          <code className="mt-1 block break-all text-sm font-semibold text-gray-900">
            {value}
          </code>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="mt-0.5 shrink-0"
          onClick={handleCopy}
          title={`${label}をコピー`}
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
      {helper ? <p className="mt-2 text-xs leading-5 text-gray-500">{helper}</p> : null}
    </div>
  );
}
