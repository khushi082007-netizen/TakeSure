import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui";
import { KBExplorer } from "@/components/KBExplorer";
import { SimpleHeading } from "@/components/FlowHeading";

export const metadata = { title: "Knowledge base" };

export default function KBPage() {
  return (
    <>
      <SimpleHeading eyebrowKey="nav_kb" titleKey="kbpage_title" ledeKey="kbpage_lede" />
      <Container className="py-10 pb-20">
        <Suspense fallback={<Spinner label="Loading…" />}>
          <KBExplorer />
        </Suspense>
      </Container>
    </>
  );
}
