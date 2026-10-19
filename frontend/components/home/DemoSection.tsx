"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/motion";
import { Container, SectionLabel } from "@/components/ui";
import { DemoScenarioList } from "@/components/DemoScenarioList";

export function DemoSection() {
  const { t } = useLang();
  return (
    <section className="relative py-24" id="demo">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <SectionLabel tone="saffron">{t("demo_label")}</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-5xl text-ink">{t("demo_title")}</h2>
            <p className="mt-4 text-lg text-ink-2">{t("demo_sub")}</p>
          </div>
          <Link href="/check" className="btn btn-secondary">{t("demo_own")}</Link>
        </Reveal>
        <div className="mt-10">
          <DemoScenarioList />
        </div>
      </Container>
    </section>
  );
}
