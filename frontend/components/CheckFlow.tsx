"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api, toApiError } from "@/lib/api";
import { session } from "@/lib/session";
import { useLang } from "@/lib/i18n";
import { ErrorPanel } from "@/components/ErrorPanel";
import { ArrowRight, Spinner } from "@/components/ui";
import { FileDrop } from "@/components/FileDrop";
import { ManualEntry } from "@/components/ManualEntry";
import { EASE } from "@/components/motion";
import type { ApiError, HealthResponse } from "@/types/api";

type Mode = "photo" | "manual";

const MAX_MB = 8;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function CheckFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "manual" ? "manual" : "photo");
  const [rx, setRx] = useState<File | null>(null);
  const [label, setLabel] = useState<File | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [health, setHealth] = useState<HealthResponse | null | false>(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(false));
  }, []);
  const ocrOff = health && !health.ocr_available;

  const localValidate = (f: File | null): string | null => {
    if (!f) return null;
    if (!ACCEPT.includes(f.type)) return `${f.name}: only JPG, PNG, WebP or PDF files are accepted.`;
    if (f.size > MAX_MB * 1024 * 1024) return `${f.name}: larger than ${MAX_MB} MB.`;
    return null;
  };

  const runPhoto = useCallback(async () => {
    setError(null);
    const v = localValidate(rx) ?? localValidate(label);
    if (v) {
      setError({ code: "UNSUPPORTED_FILE", message: v, retryable: false });
      return;
    }
    if (!rx && !label) {
      setError({ code: "VALIDATION_FAILED", message: "Add at least one photo — the prescription, the product label, or both.", retryable: false });
      return;
    }
    try {
      setBusy("Uploading…");
      const ids: { prescription_upload_id?: string; product_upload_id?: string } = {};
      if (rx) ids.prescription_upload_id = (await api.upload(rx)).upload_id;
      if (label) ids.product_upload_id = (await api.upload(label)).upload_id;
      setBusy("Reading the photo… this can take up to a minute on a large image.");
      const ex = await api.extract(ids);
      const candidates = [...ex.drugs, ...ex.herbs];
      session.setReview({ candidates, unrecognised: ex.unrecognised, extraction: ex, mode: "ocr" });
      router.push("/review");
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(null);
    }
  }, [rx, label, router]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div role="tablist" aria-label="Input method" className="inline-flex rounded-2xl border border-line bg-white/[0.03] p-1">
          {(["photo", "manual"] as Mode[]).map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === m}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${mode === m ? "text-primary-ink" : "text-ink-2 hover:text-ink"}`}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
            >
              {mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-xl bg-mint" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className="relative z-10">{m === "photo" ? t("tab_photo") : t("tab_manual")}</span>
            </button>
          ))}
        </div>

        {health === false && (
          <div className="mt-4">
            <ErrorPanel error={{ code: "NETWORK_ERROR", message: "The TakeSure backend is not reachable. Start it with start-dev.ps1 or `uvicorn app.main:app --reload` in backend/.", retryable: true }} onRetry={() => window.location.reload()} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "photo" ? (
            <motion.div key="photo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE }} className="mt-6 space-y-6">
              {ocrOff && (
                <p className="rounded-xl border border-saffron/40 bg-saffron/10 p-4 text-sm text-ink-2">
                  Photo reading is switched off on this server. Use “{t("tab_manual")}” instead, or install Tesseract / add a Groq key in <code className="font-mono text-xs">backend/.env</code>.
                </p>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <FileDrop id="rx" label={t("rx_label")} hint={t("rx_hint")} file={rx} onChange={setRx} disabled={!!busy} />
                <FileDrop id="label" label={t("product_label")} hint={t("product_hint")} file={label} onChange={setLabel} disabled={!!busy} />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button type="button" className="btn btn-primary text-base px-6" onClick={runPhoto} disabled={!!busy || !!ocrOff}>
                  {t("read_continue")} <ArrowRight />
                </button>
                {busy && <Spinner label={busy} />}
              </div>
              {health && health.ocr_available && (
                <p className="text-xs text-ink-3 font-mono tracking-wider">
                  READER · {String(health.ocr_engine).toUpperCase()}
                  {health.ocr_detail?.tesseract_langs ? ` · ${health.ocr_detail.tesseract_langs.toUpperCase()}` : ""}
                  {health.ocr_detail?.groq_vision ? " · VISION MODEL ON" : ""}
                </p>
              )}
              {error && <ErrorPanel error={error} onRetry={runPhoto} manualHref="/check?mode=manual" />}
            </motion.div>
          ) : (
            <motion.div key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE }} className="mt-6" id="manual">
              <ManualEntry />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <aside className="space-y-4">
        <div className="card p-5 text-sm text-ink-2">
          <p className="mono-label">{t("tips_title")}</p>
          <ul className="mt-3 space-y-2">
            {["Fill the frame with the printed names; handwriting is often unreadable.", "Good light, no glare, no blur. Hold the phone parallel to the pack.", `JPG, PNG, WebP or PDF, up to ${MAX_MB} MB.`].map((x) => (
              <li key={x} className="flex gap-2"><span className="text-mint">◆</span>{x}</li>
            ))}
          </ul>
        </div>
        <div className="card p-5 text-sm text-ink-2">
          <p className="mono-label saffron">{t("privacy_title")}</p>
          <p className="mt-3">
            Photos go to the TakeSure server only to be read, and are deleted as soon as the text is extracted. We keep an anonymous record of <em>which</em> herbs and medicines were checked — never who checked them.
          </p>
        </div>
        <div className="card p-5 text-sm text-ink-2">
          <p className="mono-label muted">What happens next</p>
          <ol className="mt-3 space-y-2">
            {["You review every name we read.", "Rules look up the knowledge base.", "You get a verdict, sources and three questions."].map((x, k) => (
              <li key={x} className="flex gap-3"><span className="font-mono text-xs text-mint mt-0.5">0{k + 1}</span>{x}</li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
