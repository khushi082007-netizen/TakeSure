"use client";
import { Container } from "@/components/ui";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-24">
      <div role="alert" className="tone-red verdict-card rounded-2xl p-8 max-w-xl">
        <p className="mono-label" style={{ color: "var(--red)" }}>Unexpected error</p>
        <p className="mt-2 display text-2xl text-ink">This page hit an unexpected error</p>
        <p className="mt-2 text-ink-2">{error.message || "The page could not be rendered."}</p>
        <button type="button" className="btn btn-primary mt-6" onClick={reset}>Try again</button>
      </div>
    </Container>
  );
}
