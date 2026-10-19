import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui";
import { CheckFlow } from "@/components/CheckFlow";
import { FlowHeading } from "@/components/FlowHeading";

export const metadata = { title: "Safety checker" };

export default function CheckPage() {
  return (
    <>
      <FlowHeading step={1} titleKey="check_title" ledeKey="check_lede" />
      <Container className="py-10 pb-20">
        <Suspense fallback={<Spinner label="Loading…" />}>
          <CheckFlow />
        </Suspense>
      </Container>
    </>
  );
}
