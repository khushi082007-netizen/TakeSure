"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { Item, Reveal, Stagger, fadeUp } from "@/components/motion";
import { ArrowRight, Container, SectionLabel } from "@/components/ui";

const CAPS = [
  { n: "01", title: "Photo-to-verdict in a minute", body: "Prescription + product label → confirmed names → Green/Amber/Red/Not-in-database, with the exact rule that fired.", href: "/check", icon: "📷", tone: "mint" },
  { n: "02", title: "Hindi & English explanation", body: "Plain-language summary of the matched evidence and three questions to carry to the clinic — grounded in the knowledge base rows only.", href: "/how-it-works", icon: "🗣️", tone: "saffron" },
  { n: "03", title: "Evidence you can click", body: "Every row cites a DOI, PMID or monograph with an A/B/C grade and a verification status. Weak evidence is shown as weak.", href: "/knowledge-base", icon: "📚", tone: "mint" },
  { n: "04", title: "Timing gaps, not just alarms", body: "Bulk laxatives like Triphala or Isabgol with any oral medicine? Green — keep 2–3 hours apart. Nuance the label never gives you.", href: "/knowledge-base?q=timing", icon: "⏱️", tone: "mint" },
  { n: "05", title: "Suspected-reaction report", body: "Pre-filled PDF in the Ministry of Ayush ADR field format, ready for the Ayush Suraksha portal or your Pharmacovigilance Centre.", href: "/adr", icon: "🧾", tone: "saffron" },
  { n: "06", title: "Ministry-grade analytics", body: "Anonymised co-use patterns by state, verdict trends and reaction reports — signal detection for a network that has received ~1,473 reports since 2018.", href: "/dashboard", icon: "📊", tone: "mint" },
];

export function Capabilities() {
  const { t } = useLang();
  return (
    <section className="relative py-24">
      <Container>
        <Reveal className="max-w-3xl">
          <SectionLabel>{t("caps_label")}</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-5xl text-ink">
            {t("caps_title_a")} <span className="text-gradient-mint">{t("caps_title_b")}</span>
          </h2>
          <p className="mt-4 text-lg text-ink-2">{t("caps_sub")}</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.07}>
          {CAPS.map((c) => (
            <Item key={c.n} variants={fadeUp}>
              <Link href={c.href} className="card card-hover p-6 flex flex-col h-full group">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl ${c.tone === "saffron" ? "bg-saffron/15 border border-saffron/30" : "bg-mint/15 border border-mint/30"}`} aria-hidden>
                    {c.icon}
                  </span>
                  <span className="font-mono text-xs tracking-widest text-ink-3">{c.n}</span>
                </div>
                <h3 className="mt-5 text-xl text-ink">{c.title}</h3>
                <p className="mt-2 text-sm text-ink-2 flex-1">{c.body}</p>
                <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${c.tone === "saffron" ? "text-saffron-bright" : "text-mint-bright"}`}>
                  {t("view_details")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Item>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
