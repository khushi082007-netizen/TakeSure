import { Container } from "@/components/ui";
import { DemoScenarioList } from "@/components/DemoScenarioList";
import { SimpleHeading } from "@/components/FlowHeading";

export const metadata = { title: "Demo mode" };

export default function DemoPage() {
  return (
    <>
      <SimpleHeading eyebrowKey="demo_label" titleKey="demo_title" ledeKey="demo_sub" tone="saffron" />
      <Container className="py-10 pb-20">
        <DemoScenarioList />
      </Container>
    </>
  );
}
