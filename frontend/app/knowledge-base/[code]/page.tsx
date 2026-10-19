import { Container } from "@/components/ui";
import { InteractionDetailView } from "@/components/InteractionDetailView";

export const metadata = { title: "Interaction detail" };

export default async function InteractionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-80 grid-bg opacity-60 pointer-events-none" aria-hidden />
      <Container className="relative py-10 pb-20">
        <InteractionDetailView code={decodeURIComponent(code)} />
      </Container>
    </div>
  );
}
