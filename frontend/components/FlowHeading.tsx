"use client";
import { useLang, type TKey } from "@/lib/i18n";
import { PageHeading, UspBanner } from "@/components/ui";
import { StepBar } from "@/components/StepBar";

export function FlowHeading({ step, titleKey, ledeKey }: { step: 1 | 2 | 3; titleKey: TKey; ledeKey: TKey }) {
  const { t } = useLang();
  return (
    <PageHeading
      eyebrow={t("step_of", { n: step })}
      title={t(titleKey)}
      lede={t(ledeKey)}
      right={
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <StepBar current={step} />
          <UspBanner compact text={t("usp")} />
        </div>
      }
    />
  );
}

export function SimpleHeading({ eyebrowKey, titleKey, ledeKey, tone = "mint" }: { eyebrowKey?: TKey; titleKey: TKey; ledeKey?: TKey; tone?: "mint" | "saffron" | "muted" }) {
  const { t } = useLang();
  return <PageHeading eyebrow={eyebrowKey ? t(eyebrowKey) : undefined} title={t(titleKey)} lede={ledeKey ? t(ledeKey) : undefined} tone={tone} />;
}
