import { Hero } from "@/components/home/Hero";
import { Problem } from "@/components/home/Problem";
import { Pipeline } from "@/components/home/Pipeline";
import { Capabilities } from "@/components/home/Capabilities";
import { Compare } from "@/components/home/Compare";
import { KBStatsStrip } from "@/components/KBStatsStrip";
import { DashboardPreview } from "@/components/home/DashboardPreview";
import { Architecture } from "@/components/home/Architecture";
import { DemoSection } from "@/components/home/DemoSection";
import { CTA } from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <Pipeline />
      <Capabilities />
      <Compare />
      <KBStatsStrip />
      <DashboardPreview />
      <Architecture />
      <DemoSection />
      <CTA />
    </>
  );
}
