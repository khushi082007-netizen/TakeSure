"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api, toApiError } from "@/lib/api";
import { ErrorPanel } from "@/components/ErrorPanel";
import type { ApiError, FeedbackCreate } from "@/types/api";

export function FeedbackForm({ page, interactionCodes = [] }: { page: string; interactionCodes?: string[] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackCreate["issue_type"]>("wrong_severity");
  const [code, setCode] = useState(interactionCodes[0] ?? "");
  const [desc, setDesc] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const submit = async () => {
    setError(null);
    if (desc.trim().length < 5) {
      setError({ code: "VALIDATION_FAILED", message: "Please describe the problem in a sentence or two.", retryable: false });
      return;
    }
    setBusy(true);
    try {
      await api.feedback({ issue_type: type, description: desc.trim(), interaction_code: code || undefined, page });
      setDone(true);
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="feedback" className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono-label saffron">Report incorrect information</p>
          <p className="mt-1 text-sm text-ink-2">Spotted a wrong severity, a broken citation or a missing interaction? Tell us — every report is reviewed before the next knowledge-base version.</p>
        </div>
        {!open && !done && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
            Report a problem
          </button>
        )}
      </div>
      {done && <p className="mt-3 text-sm text-green font-medium" role="status">✓ Thank you — your report has been recorded.</p>}
      <AnimatePresence>
        {open && !done && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="font-medium text-ink">What is wrong?</span>
                <select className="input mt-1" value={type} onChange={(e) => setType(e.target.value as FeedbackCreate["issue_type"])}>
                  <option value="wrong_severity">Severity / verdict looks wrong</option>
                  <option value="wrong_source">Citation is wrong or does not support the claim</option>
                  <option value="missing_interaction">A known interaction is missing</option>
                  <option value="ocr_error">Names were read incorrectly</option>
                  <option value="translation">Hindi translation problem</option>
                  <option value="other">Something else</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="font-medium text-ink">Interaction code (optional)</span>
                {interactionCodes.length > 0 ? (
                  <select className="input mt-1" value={code} onChange={(e) => setCode(e.target.value)}>
                    <option value="">— none —</option>
                    {interactionCodes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <input className="input mt-1" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. INT-ASHWA-THYROID" />
                )}
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="font-medium text-ink">Details</span>
                <textarea className="input mt-1 min-h-24" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What did you expect, and what did you see? Include a source if you have one." />
              </label>
              {error && <div className="sm:col-span-2"><ErrorPanel error={error} onRetry={submit} /></div>}
              <div className="sm:col-span-2 flex gap-2">
                <button type="button" className="btn btn-primary btn-sm" onClick={submit} disabled={busy}>{busy ? "Sending…" : "Send report"}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
