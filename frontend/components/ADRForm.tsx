"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { api, downloadBlob, toApiError } from "@/lib/api";
import { ErrorPanel } from "@/components/ErrorPanel";
import { Item, Stagger, fadeUp } from "@/components/motion";
import { ArrowRight } from "@/components/ui";
import type { ADRCreate, ApiError } from "@/types/api";

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka","Kerala","Ladakh","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Other / outside India"];

type Form = Omit<ADRCreate, "drugs"> & { drugs: string };

export function ADRForm() {
  const sp = useSearchParams();
  const [f, setF] = useState<Form>({
    product: sp.get("product") ?? "",
    product_manufacturer: "",
    product_batch: "",
    drugs: sp.get("drugs") ?? "",
    reaction: "",
    onset_date: "",
    outcome: "unknown",
    seriousness: undefined,
    patient_age_group: undefined,
    patient_sex: undefined,
    reporter_type: "patient",
    state: "",
    consent_to_store: true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ reference: string; portal: string; note: string } | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const payload = (): ADRCreate => ({
    ...f,
    product: f.product.trim(),
    product_manufacturer: f.product_manufacturer?.trim() || undefined,
    product_batch: f.product_batch?.trim() || undefined,
    drugs: f.drugs.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean),
    reaction: f.reaction.trim(),
    onset_date: f.onset_date || undefined,
    state: f.state || undefined,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.product.trim().length < 2) e.product = "Enter the product name.";
    if (f.reaction.trim().length < 5) e.reaction = "Describe the reaction in at least a few words.";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setError(null);
    if (!validate()) return;
    setBusy(true);
    try {
      const { blob, filename } = await api.adrPdf(payload());
      downloadBlob(blob, filename);
      const ref = filename.replace(/\.pdf$/i, "");
      setDone({ reference: ref, portal: "https://ayushsuraksha.com", note: f.consent_to_store ? "A copy is stored anonymously to help the team understand reaction patterns." : "Nothing was stored; only the PDF was generated." });
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="tone-green verdict-card rounded-3xl p-8 max-w-2xl" role="status">
        <p className="mono-label">Report prepared</p>
        <h2 className="mt-2 text-3xl text-ink">Reference <span className="font-mono text-mint-bright">{done.reference}</span></h2>
        <p className="mt-3 text-ink-2">Your PDF has downloaded. {done.note}</p>
        <p className="mt-4 text-ink font-medium">This report has <u>not</u> been sent to any authority. To file it officially:</p>
        <ol className="mt-2 list-decimal pl-5 text-ink-2 space-y-1">
          <li>Open the Ayush Suraksha portal and choose “Report an adverse event”.</li>
          <li>Copy the details from the PDF — the fields are in the same order as the Ministry form.</li>
          <li>Or hand the PDF to your doctor, pharmacist or nearest Pharmacovigilance Centre.</li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-2">
          <a className="btn btn-saffron" href={done.portal} target="_blank" rel="noopener noreferrer">Open Ayush Suraksha portal ↗</a>
          <button type="button" className="btn btn-ghost" onClick={() => setDone(null)}>Prepare another report</button>
        </div>
      </motion.div>
    );
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[1fr_340px]" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
      <Stagger className="space-y-6" delay={0.06} amount={0.05}>
        <Item variants={fadeUp}>
          <Fieldset n="01" legend="Suspected Ayurvedic product">
            <Field label="Product name *" error={fieldErrors.product}>
              <input className="input" value={f.product} onChange={(e) => set("product", e.target.value)} aria-invalid={!!fieldErrors.product} required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Manufacturer"><input className="input" value={f.product_manufacturer ?? ""} onChange={(e) => set("product_manufacturer", e.target.value)} /></Field>
              <Field label="Batch / lot number"><input className="input" value={f.product_batch ?? ""} onChange={(e) => set("product_batch", e.target.value)} /></Field>
            </div>
          </Fieldset>
        </Item>

        <Item variants={fadeUp}>
          <Fieldset n="02" legend="Other medicines being taken">
            <Field label="Medicines (one per line or comma-separated)"><textarea className="input min-h-20" value={f.drugs} onChange={(e) => set("drugs", e.target.value)} /></Field>
          </Fieldset>
        </Item>

        <Item variants={fadeUp}>
          <Fieldset n="03" legend="The reaction">
            <Field label="Describe what happened *" error={fieldErrors.reaction}>
              <textarea className="input min-h-28" value={f.reaction} onChange={(e) => set("reaction", e.target.value)} aria-invalid={!!fieldErrors.reaction} required placeholder="Symptoms, when they started relative to taking the product, what was done." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date of onset"><input type="date" className="input" value={f.onset_date ?? ""} onChange={(e) => set("onset_date", e.target.value)} /></Field>
              <Field label="Outcome *">
                <select className="input" value={f.outcome} onChange={(e) => set("outcome", e.target.value as ADRCreate["outcome"])}>
                  <option value="recovered">Recovered</option>
                  <option value="recovering">Recovering</option>
                  <option value="not_recovered">Not recovered</option>
                  <option value="recovered_with_sequelae">Recovered with lasting effects</option>
                  <option value="fatal">Fatal</option>
                  <option value="unknown">Unknown</option>
                </select>
              </Field>
              <Field label="Seriousness">
                <select className="input" value={f.seriousness ?? ""} onChange={(e) => set("seriousness", (e.target.value || undefined) as ADRCreate["seriousness"])}>
                  <option value="">—</option>
                  <option value="not_serious">Not serious</option>
                  <option value="hospitalisation">Required hospitalisation</option>
                  <option value="life_threatening">Life-threatening</option>
                  <option value="disability">Disability</option>
                  <option value="other_medically_important">Other medically important</option>
                </select>
              </Field>
            </div>
          </Fieldset>
        </Item>

        <Item variants={fadeUp}>
          <Fieldset n="04" legend="Patient (no name or contact details are collected)">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Age group">
                <select className="input" value={f.patient_age_group ?? ""} onChange={(e) => set("patient_age_group", (e.target.value || undefined) as ADRCreate["patient_age_group"])}>
                  <option value="">—</option><option value="child">Child (&lt;18)</option><option value="adult">Adult</option><option value="elderly">Elderly (65+)</option>
                </select>
              </Field>
              <Field label="Sex">
                <select className="input" value={f.patient_sex ?? ""} onChange={(e) => set("patient_sex", (e.target.value || undefined) as ADRCreate["patient_sex"])}>
                  <option value="">—</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option><option value="undisclosed">Prefer not to say</option>
                </select>
              </Field>
              <Field label="State / UT">
                <select className="input" value={f.state ?? ""} onChange={(e) => set("state", e.target.value)}>
                  <option value="">—</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </Fieldset>
        </Item>

        <Item variants={fadeUp}>
          <Fieldset n="05" legend="Reporter">
            <Field label="I am the *">
              <select className="input" value={f.reporter_type} onChange={(e) => set("reporter_type", e.target.value as ADRCreate["reporter_type"])}>
                <option value="patient">Patient</option><option value="caregiver">Family member / caregiver</option><option value="pharmacist">Pharmacist</option><option value="doctor_mbbs">Doctor (MBBS)</option><option value="doctor_bams">Doctor (BAMS / Ayurveda)</option><option value="other">Other</option>
              </select>
            </Field>
            <label className="flex items-start gap-3 text-sm text-ink-2 rounded-xl border border-line bg-white/[0.02] p-3">
              <input type="checkbox" className="mt-1 h-5 w-5 rounded accent-[var(--mint)]" checked={f.consent_to_store} onChange={(e) => set("consent_to_store", e.target.checked)} />
              <span>Store an anonymous copy of this report (no name, no contact details) so the TakeSure team can spot patterns. Untick to generate the PDF only.</span>
            </label>
          </Fieldset>
        </Item>

        {error && <ErrorPanel error={error} onRetry={submit} />}
        <Item variants={fadeUp}>
          <button type="submit" className="btn btn-saffron text-base px-6" disabled={busy}>{busy ? "Generating PDF…" : "Generate ADR report PDF"} <ArrowRight /></button>
        </Item>
      </Stagger>

      <aside className="space-y-4 h-fit lg:sticky lg:top-24">
        <div className="card p-5 text-sm text-ink-2">
          <p className="mono-label">Where this goes</p>
          <p className="mt-3">The PDF mirrors the fields of the Ministry of Ayush suspected-ADR reporting form so it can be copied into the official portal or handed to a Pharmacovigilance Centre.</p>
          <a className="text-mint-bright hover:underline block mt-3" href="https://ayushsuraksha.com" target="_blank" rel="noopener noreferrer">ayushsuraksha.com ↗</a>
        </div>
        <div className="tone-red verdict-card rounded-2xl p-5 text-sm text-ink-2">
          <p className="mono-label" style={{ color: "var(--red)" }}>If this is an emergency</p>
          <p className="mt-3">Severe allergic reaction, breathing difficulty, chest pain or confusion need immediate medical care — call <b className="text-ink">112</b> or go to the nearest emergency department first.</p>
        </div>
        <div className="card p-5 text-sm text-ink-2">
          <p className="mono-label muted">Why it matters</p>
          <p className="mt-3">Only ~1,473 ASU&H adverse-event reports reached the national programme between 2018 and 2024. Every structured report helps detect a signal earlier.</p>
        </div>
      </aside>
    </form>
  );
}

function Fieldset({ n, legend, children }: { n: string; legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="card p-6 space-y-4">
      <legend className="px-2 font-semibold text-ink flex items-center gap-2"><span className="font-mono text-xs text-saffron-bright">{n}</span>{legend}</legend>
      {children}
    </fieldset>
  );
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-red font-medium" role="alert">{error}</span>}
    </label>
  );
}
