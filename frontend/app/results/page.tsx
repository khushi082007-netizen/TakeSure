import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui";
import { ResultsView } from "@/components/ResultsView";

export const metadata = { title: "Safety result" };

export default function ResultsPage() {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-96 grid-bg opacity-60 pointer-events-none" aria-hidden />
      <Container className="relative py-10 pb-20">
        <Suspense fallback={<Spinner label="Loading…" />}>
          <ResultsView />
        </Suspense>
      </Container>
    </div>
  );
}
