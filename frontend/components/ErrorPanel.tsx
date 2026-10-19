"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { presentError } from "@/lib/errors";
import type { ApiError } from "@/types/api";

export function ErrorPanel({
  error,
  onRetry,
  manualHref = "/check?mode=manual",
}: {
  error: Pick<ApiError, "code" | "message" | "retryable" | "detail">;
  onRetry?: () => void;
  manualHref?: string;
}) {
  const p = presentError(error);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="alert" className="tone-red verdict-card rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <span className="tone-red verdict-pill inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold" aria-hidden>!</span>
        <div className="flex-1">
          <p className="font-semibold text-ink">{p.title}</p>
          <p className="mt-1 text-ink-2 text-sm">{p.body}</p>
          {p.suggestion && <p className="mt-2 text-sm text-ink-2">{p.suggestion}</p>}
          <p className="mt-2 text-[11px] font-mono tracking-wider text-ink-3">ERROR CODE · {error.code}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {onRetry && p.retryable && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
                Try again
              </button>
            )}
            {p.offerManual && (
              <Link href={manualHref} className="btn btn-ghost btn-sm">
                Enter names manually
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
