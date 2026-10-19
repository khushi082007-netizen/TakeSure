"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { Aurora, Reveal } from "@/components/motion";
import { ArrowRight, Container, SectionLabel } from "@/components/ui";

export function CTA() {
  const { t } = useLang();
  return (
    <section className="relative py-28 overflow-hidden border-t border-line">
      <Aurora className="opacity-70" />
      <Container className="relative text-center">
        <Reveal>
          <SectionLabel className="justify-center">{t("cta_label")}</SectionLabel>
          <h2 className="mt-5 text-4xl sm:text-6xl lg:text-7xl text-ink">
            {t("cta_title_a")} <br className="hidden sm:block" />
            <span className="text-gradient-mint">{t("cta_title_b")}</span>
          </h2>
          <p className="mt-6 text-lg text-ink-2 max-w-2xl mx-auto">{t("cta_sub")}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/check" className="btn btn-saffron text-base px-8">
              {t("hero_cta")} <ArrowRight />
            </Link>
            <Link href="/knowledge-base" className="btn btn-ghost text-base">
              {t("nav_kb")}
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
