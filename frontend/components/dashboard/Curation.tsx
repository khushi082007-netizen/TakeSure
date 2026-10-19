"use client";
import { useState } from "react";
import { api, toApiError } from "@/lib/api";
import { useQuery } from "@/lib/hooks";
import type { ApiError, CurationDraft, CurationStatus } from "@/types/api";

/**
 * Evidence curation panel: TinyFish as the research assistant behind the knowledge base.
 *  - Verify citations  (Fetch API)   -> flips sources to "verified" when the page matches the stored title
 *  - Discover rows     (Web Agent)   -> drafts candidate interactions from a monograph page
 *  - Map a product     (Search+Agent)-> drafts the ingredient list of an Indian product
 * Everything lands in a draft queue. Nothing here changes a verdict until a reviewer approves it.
 */
export function CurationPanel() {
  const [filter, setFilter] = useState<"pending" | "mismatch" | "approved" | "all">("pending");
  const [tick, setTick] = useState(0);
  const q = useQuery(
    () => Promise.all([api.curationStatus(), api.curationDrafts({ status: filter === "all" ? undefined : filter, limit: 40 })]),
    `curation-${filter}-${tick}`,
  );
  const status: CurationStatus | null = q.data ? q.data[0] : null;
  const drafts: CurationDraft[] = q.data ? q.data[1].items : [];
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [herb, setHerb] = useState("giloy");
  const [brand, setBrand] = useState("Dabur Giloy Ghanvati");
  const [open, setOpen] = useState<number | null>(null);

  const load = () => setTick((n) => n + 1);

  async function run(label: string, fn: () => Promise<string>) {
    setBusy(label);
    setMsg(null);
    try {
      const text = await fn();
      setMsg({ tone: "ok", text });
      load();
    } catch (e) {
      setMsg({ tone: "err", text: (toApiError(e) as ApiError).message });
    } finally {
      setBusy(null);
    }
  }

  const configured = status?.configured ?? false;
  const pct = status && status.sources_total ? Math.round((status.sources_verified / status.sources_total) * 100) : 0;

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-ink">Evidence curation · TinyFish research assistant</h2>
        <span className={`chip ${configured ? "chip-mint" : ""}`}>{configured ? "TinyFish connected" : "TinyFish not configured"}</span>
      </div>
      <p className="mt-2 text-sm text-ink-2 max-w-3xl">
        TinyFish opens the references, reads monographs and product pages, and drafts rows with the source attached. Drafts wait here for a reviewer.
        <strong className="text-ink"> The verdict path never touches the web.</strong>
      </p>

      {/* progress */}
      {status && (
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Stat label="Sources verified" value={`${status.sources_verified} / ${status.sources_total}`} sub={`${pct}% of citations re-opened and matched`} tone="mint" />
          <Stat label="Need review" value={String(status.drafts_mismatch)} sub="citation page did not match" tone="amber" />
          <Stat label="Pending drafts" value={String(status.drafts_pending)} sub="candidate rows / products" tone="saffron" />
          <Stat label="Approved" value={String(status.drafts_approved)} sub="reviewed by a person" tone="grey" />
        </div>
      )}
      {status && (
        <div className="mt-3 h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}

      {/* actions */}
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <Action title="1 · Verify citations" sub="Fetch API · free" body="Open the next 10 unverified DOI / PubMed / URL citations and compare each page with the stored source title.">
          <button type="button" className="btn btn-primary btn-sm" disabled={!configured || !!busy} onClick={() => run("verify", async () => { const r = await api.verifySources(10); return `Checked ${r.checked}: ${r.verified} verified, ${r.mismatched} need review, ${r.failed} could not be fetched.`; })}>
            {busy === "verify" ? "Fetching…" : "Verify next 10"}
          </button>
        </Action>
        <Action title="2 · Discover interactions" sub="Web Agent · per step" body="Read the MSKCC About Herbs monograph for a herb and draft every listed drug interaction as a candidate row.">
          <div className="flex gap-2">
            <input className="input input-sm flex-1" value={herb} onChange={(e) => setHerb(e.target.value)} placeholder="herb slug, e.g. giloy" aria-label="Herb" />
            <button type="button" className="btn btn-primary btn-sm" disabled={!configured || !!busy || !herb.trim()} onClick={() => run("discover", async () => { const d = await api.discover(herb.trim()); return `${(d.extracted as { count?: number }).count ?? 0} candidate interaction(s) drafted for ${herb} (run ${d.tinyfish_run_id ?? "—"}, ${d.steps ?? "?"} steps).`; })}>
              {busy === "discover" ? "Reading…" : "Draft rows"}
            </button>
          </div>
        </Action>
        <Action title="3 · Map a product" sub="Search + Web Agent" body="Find the official page of an Indian Ayurvedic product and extract its ingredient list for the bridge table.">
          <div className="flex gap-2">
            <input className="input input-sm flex-1" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="product, e.g. Dabur Giloy Ghanvati" aria-label="Product" />
            <button type="button" className="btn btn-primary btn-sm" disabled={!configured || !!busy || !brand.trim()} onClick={() => run("product", async () => { const d = await api.mapProduct(brand.trim()); const x = d.extracted as { ingredients?: unknown[]; known_herbs?: string[] }; return `${x.ingredients?.length ?? 0} ingredient(s) read for ${brand}; ${x.known_herbs?.length ?? 0} already known herbs.`; })}>
              {busy === "product" ? "Searching…" : "Map product"}
            </button>
          </div>
        </Action>
      </div>

      {msg && <p className={`mt-3 text-sm ${msg.tone === "ok" ? "text-mint-bright" : "text-red"}`}>{msg.text}</p>}
      {q.error && <p className="mt-3 text-sm text-red">{q.error.message}</p>}
      {status && !configured && <p className="mt-3 text-xs text-ink-3">{status.note}</p>}

      {/* queue */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">Draft queue</h3>
        <div role="group" aria-label="Filter" className="inline-flex rounded-xl border border-line bg-white/[0.03] p-1 text-xs">
          {(["pending", "mismatch", "approved", "all"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg font-semibold ${filter === f ? "bg-mint text-primary-ink" : "text-ink-2"}`}>{f}</button>
          ))}
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {drafts.map((d) => (
          <li key={d.id} className="rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2">
                <span className={`chip ${d.kind === "verify" ? "" : d.kind === "discover" ? "chip-mint" : "chip-saffron"}`}>{d.kind}</span>
                <StatusChip status={d.status} />
                <span className="text-sm text-ink truncate">{d.subject}</span>
                {typeof d.score === "number" && <span className="font-mono text-xs text-ink-3">match {Math.round(d.score * 100)}%</span>}
              </div>
              <div className="flex items-center gap-2">
                {d.source_url && <a className="text-xs text-mint-bright hover:underline" href={d.source_url} target="_blank" rel="noopener noreferrer">open source ↗</a>}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(open === d.id ? null : d.id)}>{open === d.id ? "Hide" : "Details"}</button>
                {d.status !== "approved" && d.status !== "rejected" && (
                  <>
                    <button type="button" className="btn btn-primary btn-sm" disabled={!!busy} onClick={() => run("review", async () => { await api.reviewDraft(d.id, true); return `Draft ${d.id} approved.`; })}>Approve</button>
                    <button type="button" className="btn btn-secondary btn-sm" disabled={!!busy} onClick={() => run("review", async () => { await api.reviewDraft(d.id, false); return `Draft ${d.id} rejected.`; })}>Reject</button>
                  </>
                )}
              </div>
            </div>
            {d.note && <p className="mt-1 text-xs text-ink-3">{d.note}</p>}
            {open === d.id && (
              <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-black/30 p-3 text-[11px] leading-snug text-ink-2 whitespace-pre-wrap">{JSON.stringify(d.extracted, null, 2)}</pre>
            )}
          </li>
        ))}
        {drafts.length === 0 && <li className="text-sm text-ink-3">No drafts {filter === "all" ? "yet" : `with status “${filter}”`}. Run a job above.</li>}
      </ul>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "mint" | "amber" | "saffron" | "grey" }) {
  const c = { mint: "text-mint-bright", amber: "text-amber", saffron: "text-saffron-bright", grey: "text-grey" }[tone];
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-3">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-3">{label}</p>
      <p className={`display mt-1 text-2xl ${c}`}>{value}</p>
      <p className="text-xs text-ink-3">{sub}</p>
    </div>
  );
}

function Action({ title, sub, body, children }: { title: string; sub: string; body: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold text-ink">{title}</p>
        <span className="font-mono text-[10px] tracking-wider uppercase text-ink-3">{sub}</span>
      </div>
      <p className="mt-1 text-xs text-ink-2">{body}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function StatusChip({ status }: { status: CurationDraft["status"] }) {
  const cls = { pending: "chip-saffron", mismatch: "tone-amber tone-chip", approved: "chip-mint", rejected: "" }[status];
  return <span className={`chip ${cls}`}>{status}</span>;
}
