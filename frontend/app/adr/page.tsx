import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui";
import { ADRForm } from "@/components/ADRForm";
import { SimpleHeading } from "@/components/FlowHeading";

export const metadata = { title: "Report a suspected reaction" };

export default function ADRPage() {
  return (
    <>
      <SimpleHeading eyebrowKey="adr_label" titleKey="adr_title" ledeKey="adr_lede" tone="saffron" />
      <Container className="py-10 pb-20">
        <Suspense fallback={<Spinner label="Loading…" />}>
          <ADRForm />
        </Suspense>
      </Container>
    </>
  );
}
