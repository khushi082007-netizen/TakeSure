import { Container, EmptyState } from "@/components/ui";
export default function NotFound() {
  return (
    <Container className="py-24">
      <EmptyState title="Page not found" body="The link may be out of date." action={{ href: "/", label: "Back to home" }} />
    </Container>
  );
}
