"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSessionJSON } from "@/lib/hooks";
import { api, toApiError } from "@/lib/api";
import { session, KEY_EXTRACT, type ReviewState } from "@/lib/session";
import { useLang } from "@/lib/i18n";
import { ErrorPanel } from "@/components/ErrorPanel";
import { ArrowRight, EmptyState, Spinner } from "@/components/ui";
import type { ApiError, Candidate } from "@/types/api";

type Row = Candidate & { key: string; confirmed: boolean };

function toRows(c: Candidate[]): Row[] {
  return c.map((x, i) => ({ ...x, key: `${x.kind}-${x.canonical_id}-${i}`, confirmed: x.status === "accepted" }));
}

export function ReviewFlow() {
  const state = useSessionJSON<ReviewState>(KEY_EXTRACT);
  const { t } = useLang();
  if (state === undefined) return <Spinner label={t("loading")} />;
  if (state === null) return <EmptyState title="Nothing to review yet" body="Start by uploading a photo or typing the names." action={{ href: "/check", label: "Go to the safety checker" }} />;
  return <ReviewEditor state={state} />;
}

function ReviewEditor({ state }: { state: ReviewState }) {
  const router = useRouter();
  const { t } = useLang();
  const [rows, setRows] = useState<Row[]>(() => toRows(state.candidates));
  const [unrec, setUnrec] = useState<string[]>(() => state.unrecognised);
  const [addKind, setAddKind] = useState<"drug" | "herb">("drug");
  const [addText, setAddText] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const pending = useMemo(() => rows.filter((r) => !r.confirmed), [rows]);
  const drugs = rows.filter((r) => r.kind === "drug");
  const herbs = rows.filter((r) => r.kind === "herb");

  const add = async () => {
    const text = addText.trim();
    if (!text) return;
    setAdding(true);
    setAddMsg(null);
    try {
      const res = await api.resolve([{ kind: addKind, text }]);
      if (res.resolved.length === 0) {
        setUnrec((u) => (u.includes(text) ? u : [...u, text]));
        setAddMsg(`"${text}" is not in the knowledge base. It will be shown as unrecognised, which keeps the overall verdict from being Green.`);
      } else {
        setRows((r) => [...r, ...toRows(res.resolved).filter((n) => !r.some((e) => e.kind === n.kind && e.canonical_id === n.canonical_id))]);
        setAddMsg(null);
      }
      setAddText("");
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setAdding(false);
    }
  };

  const evaluate = async () => {
    setError(null);
    const confirmed = rows.filter((r) => r.confirmed);
    const drug_ids = [...new Set(confirmed.filter((r) => r.kind === "drug").map((r) => r.canonical_id))];
    const herb_ids = [...new Set(confirmed.filter((r) => r.kind === "herb").map((r) => r.canonical_id))];
    const dropped = rows.filter((r) => !r.confirmed).map((r) => r.raw_text);
    const unrecognised = [...new Set([...unrec, ...dropped])];
    if (drug_ids.length + herb_ids.length + unrecognised.length === 0) {
      setError({ code: "VALIDATION_FAILED", message: "Nothing to check — confirm at least one item or add one.", retryable: false });
      return;
    }
    setBusy(true);
    try {
      const result = await api.evaluate({ drug_ids, herb_ids, unrecognised, language: "en", source: state.mode === "demo" ? "demo" : "web" });
      session.setConfirmed({
        drug_ids,
        herb_ids,
        unrecognised,
        names: { drugs: confirmed.filter((r) => r.kind === "drug").map((r) => r.canonical_name), herbs: confirmed.filter((r) => r.kind === "herb").map((r) => r.canonical_name) },
      });
      session.setResult(result);
      router.push("/results");
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        {state.mode === "demo" && <p className="chip chip-saffron">Demo mode · {state.demoTitle}</p>}
        <AnimatePresence>
          {pending.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="tone-amber verdict-card rounded-2xl p-5" role="status">
              <p className="font-semibold text-ink">
                {pending.length} match{pending.length > 1 ? "es" : ""} need your confirmation
              </p>
              <p className="text-sm text-ink-2 mt-1">These scored between 70 and 85 on name similarity. Tick the ones that are right; unticked items are treated as unrecognised, not ignored.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Section title="Medicines" rows={drugs} setRows={setRows} kind="drug" />
        <Section title="Ayurvedic products & herbs" rows={herbs} setRows={setRows} kind="herb" />

        <div>
          <h2 className="text-lg font-semibold text-ink">Not recognised</h2>
          {unrec.length === 0 ? (
            <p className="text-sm text-ink-3 mt-1">Everything we read matched the knowledge base.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {unrec.map((u) => (
                <li key={u} className="tone-grey chip tone-chip">
                  <span>{u}</span>
                  <button type="button" aria-label={`Remove ${u}`} className="ml-1 text-ink-3 hover:text-ink" onClick={() => setUnrec((x) => x.filter((y) => y !== u))}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {unrec.length > 0 && <p className="mt-2 text-sm text-ink-2">Unrecognised items keep the result from being Green: we report “not in database” rather than guessing.</p>}
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold text-ink">Add something we missed</h2>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <select aria-label="Type" className="input sm:w-44" value={addKind} onChange={(e) => setAddKind(e.target.value as "drug" | "herb")}>
              <option value="drug">Medicine</option>
              <option value="herb">Herb / product</option>
            </select>
            <input aria-label="Name" className="input" placeholder={addKind === "drug" ? "e.g. Ecosprin" : "e.g. Giloy"} value={addText} onChange={(e) => setAddText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
            <button type="button" className="btn btn-secondary" onClick={add} disabled={adding || !addText.trim()}>
              {adding ? "Matching…" : "Add"}
            </button>
          </div>
          {addMsg && <p className="mt-2 text-sm text-ink-2">{addMsg}</p>}
        </div>

        {state.extraction && (
          <div>
            <button type="button" className="text-sm text-mint-bright hover:underline" aria-expanded={showRaw} onClick={() => setShowRaw((v) => !v)}>
              {showRaw ? "Hide" : "Show"} the text that was read from the photos
            </button>
            <AnimatePresence>
              {showRaw && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 grid gap-4 md:grid-cols-2 overflow-hidden">
                  {state.extraction.documents.map((d) => (
                    <div key={d.document} className="card p-4">
                      <p className="text-sm font-semibold text-ink capitalize">{d.document}</p>
                      <p className="text-[11px] font-mono text-ink-3">engine: {d.engine}</p>
                      {d.warnings.map((w) => (
                        <p key={w} className="text-xs text-saffron-bright mt-1">{w}</p>
                      ))}
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-ink-2 max-h-56 overflow-auto">{d.raw_text || "(no text)"}</pre>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {error && <ErrorPanel error={error} onRetry={evaluate} />}
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="btn btn-saffron text-base px-6" onClick={evaluate} disabled={busy}>
            {t("confirm_check")} <ArrowRight />
          </button>
          {busy && <Spinner label="Looking up the knowledge base…" />}
        </div>
      </div>

      <aside className="card p-5 text-sm text-ink-2 h-fit">
        <p className="mono-label">How matching works</p>
        <ul className="mt-3 space-y-2">
          <li><strong className="text-mint-bright font-mono">100</strong> — exact name, brand or synonym from the database.</li>
          <li><strong className="text-mint-bright font-mono">85+</strong> — close spelling; accepted automatically but still shown here.</li>
          <li><strong className="text-saffron-bright font-mono">70–85</strong> — plausible; you must confirm.</li>
          <li><strong className="text-ink-3 font-mono">&lt;70</strong> — not recognised.</li>
        </ul>
        <p className="mt-3 text-ink-3">Thresholds come from the project roadmap and are configurable on the server.</p>
      </aside>
    </div>
  );
}

function Section({ title, rows, setRows, kind }: { title: string; rows: Row[]; setRows: React.Dispatch<React.SetStateAction<Row[]>>; kind: "drug" | "herb" }) {
  return (
    <section aria-labelledby={`sec-${kind}`}>
      <h2 id={`sec-${kind}`} className="text-lg font-semibold text-ink flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${kind === "drug" ? "bg-mint" : "bg-saffron"}`} /> {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-3 mt-1">None found.</p>
      ) : (
        <ul className="mt-3 card divide-y divide-line overflow-hidden">
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.li key={r.key} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className={`flex flex-wrap items-center gap-3 p-4 transition-colors ${r.confirmed ? "" : "bg-amber/[0.04]"}`}>
                <input
                  id={`cb-${r.key}`}
                  type="checkbox"
                  className="h-5 w-5 rounded accent-[var(--mint)]"
                  checked={r.confirmed}
                  onChange={(e) => setRows((all) => all.map((x) => (x.key === r.key ? { ...x, confirmed: e.target.checked } : x)))}
                />
                <label htmlFor={`cb-${r.key}`} className="flex-1 min-w-48 cursor-pointer">
                  <span className="font-semibold text-ink">{r.display_name}</span>
                  <span className="block text-xs text-ink-3">
                    read as “{r.raw_text}” → matched “{r.matched_term}” via {r.via}
                  </span>
                </label>
                <span className={`chip ${r.status === "accepted" ? "chip-mint" : "tone-amber tone-chip"}`}>
                  score {Math.round(r.score)} · {r.status === "accepted" ? "accepted" : "please confirm"}
                </span>
                <button type="button" className="btn btn-ghost btn-sm px-3" aria-label={`Remove ${r.display_name}`} onClick={() => setRows((all) => all.filter((x) => x.key !== r.key))}>
                  Remove
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
