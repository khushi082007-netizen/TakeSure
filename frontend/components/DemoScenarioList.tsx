"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, toApiError } from "@/lib/api";
import { session } from "@/lib/session";
import { useQuery } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";
import { ErrorPanel } from "@/components/ErrorPanel";
import { Item, Stagger, fadeUp } from "@/components/motion";
import { ArrowRight, Spinner, VerdictPill } from "@/components/ui";
import type { ApiError, DemoScenario } from "@/types/api";

export function DemoScenarioList() {
  const router = useRouter();
  const { t } = useLang();
  const { data: scenarios, error: loadError, retry } = useQuery(() => api.demoScenarios(), "demo");
  const [runError, setRunError] = useState<ApiError | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const error = runError ?? loadError;

  const run = async (s: DemoScenario) => {
    setRunning(s.id);
    setRunError(null);
    try {
      const resolved = await api.demoScenario(s.id);
      session.setReview({ candidates: resolved.resolved, unrecognised: resolved.unrecognised, mode: "demo", demoTitle: s.title });
      router.push("/review?mode=demo");
    } catch (e) {
      setRunError(toApiError(e));
      setRunning(null);
    }
  };

  if (error) return <ErrorPanel error={error} onRetry={runError ? () => setRunError(null) : retry} />;
  if (!scenarios) return <Spinner label={t("loading")} />;
  return (
    <Stagger as="ul" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" delay={0.06}>
      {scenarios.map((s, k) => (
        <Item key={s.id} variants={fadeUp} className="card card-hover p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-3">{String(k + 1).padStart(2, "0")}</span>
              <h3 className="text-lg text-ink">{s.title}</h3>
            </div>
            <span className="chip chip-saffron shrink-0">{t("demo_chip")}</span>
          </div>
          <p className="mt-2 text-sm text-ink-2 flex-1">{s.description}</p>
          <p className="mt-3 text-xs text-ink-3 font-mono">{[...s.drugs, ...s.herbs, ...s.unknown_terms].join(" · ")}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-ink-3 inline-flex items-center gap-1.5">
              {t("expected")} <VerdictPill verdict={s.expected_verdict} size="sm" />
            </span>
            <button type="button" className="btn btn-primary btn-sm" disabled={running !== null} onClick={() => run(s)}>
              {running === s.id ? t("running") : t("run")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Item>
      ))}
    </Stagger>
  );
}
