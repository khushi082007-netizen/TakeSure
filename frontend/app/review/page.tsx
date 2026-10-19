import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui";
import { ReviewFlow } from "@/components/ReviewFlow";
import { FlowHeading } from "@/components/FlowHeading";

export const metadata = { title: "Review & confirm" };

export default function ReviewPage() {
  return (
    <>
      <FlowHeading step={2} titleKey="review_title" ledeKey="review_lede" />
      <Container className="py-10 pb-20">
        <Suspense fallback={<Spinner label="Loading…" />}>
          <ReviewFlow />
        </Suspense>
      </Container>
    </>
  );
}
