"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, toApiError } from "@/lib/api";
import { session } from "@/lib/session";
import { ErrorPanel } from "@/components/ErrorPanel";
import { ArrowRight, Spinner } from "@/components/ui";
import type { ApiError } from "@/types/api";

function splitNames(s: string): string[] {
  return s
    .split(/[\n,;]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 20);
}

const QUICK_DRUGS = ["Thyronorm", "Glycomet", "Warfarin", "Ecosprin", "Amlong", "Pangraf", "Atorva"];
const QUICK_HERBS = ["Ashwagandha", "Giloy Ghanvati", "Guggul", "Haldi capsules", "Mulethi", "Karela", "Triphala", "Chyawanprash"];

export function ManualEntry({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [drugs, setDrugs] = useState("");
  const [herbs, setHerbs] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const append = (setter: React.Dispatch<React.SetStateAction<string>>, v: string) => setter((cur) => (cur.trim() ? `${cur.trim()}\n${v}` : v));

  const submit = async () => {
    setError(null);
    const d = splitNames(drugs);
    const h = splitNames(herbs);
    if (d.length === 0 && h.length === 0) {
      setError({ code: "VALIDATION_FAILED", message: "Type at least one medicine or Ayurvedic product name.", retryable: false });
      return;
    }
    setBusy(true);
    try {
      const res = await api.resolve([...d.map((text) => ({ kind: "drug" as const, text })), ...h.map((text) => ({ kind: "herb" as const, text }))]);
      session.setReview({ candidates: res.resolved, unrecognised: res.unrecognised, mode: "manual" });
      onDone?.();
      router.push("/review");
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <label htmlFor="drugs" className="block font-semibold text-ink">Medicines</label>
          <p className="text-sm text-ink-3">Brand or generic, one per line. e.g. Thyronorm, Glycomet, Warfarin</p>
          <textarea id="drugs" className="input mt-3 min-h-32 font-mono text-sm" value={drugs} onChange={(e) => setDrugs(e.target.value)} placeholder={"Thyronorm 50\nGlycomet 500"} />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_DRUGS.map((q) => (
              <button key={q} type="button" className="chip hover:border-mint/50 hover:text-ink transition-colors" onClick={() => append(setDrugs, q)}>+ {q}</button>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <label htmlFor="herbs" className="block font-semibold text-ink">Ayurvedic products or herbs</label>
          <p className="text-sm text-ink-3">Product or herb name, Hindi or English. e.g. Ashwagandha, Giloy Ghanvati, Chyawanprash</p>
          <textarea id="herbs" className="input mt-3 min-h-32 font-mono text-sm" value={herbs} onChange={(e) => setHerbs(e.target.value)} placeholder={"Himalaya Ashvagandha\nअश्वगंधा"} />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_HERBS.map((q) => (
              <button key={q} type="button" className="chip hover:border-saffron/50 hover:text-ink transition-colors" onClick={() => append(setHerbs, q)}>+ {q}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="btn btn-primary text-base px-6" onClick={submit} disabled={busy}>
          Match names and continue <ArrowRight />
        </button>
        {busy && <Spinner label="Matching against the knowledge base…" />}
      </div>
      {error && <ErrorPanel error={error} onRetry={submit} />}
    </div>
  );
}
