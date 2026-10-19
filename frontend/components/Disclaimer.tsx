export function Disclaimer({ text }: { text?: string }) {
  return (
    <aside aria-label="Medical disclaimer" className="rounded-2xl border border-dashed border-saffron/40 bg-saffron/[0.05] p-5 text-sm text-ink-2">
      <p className="mono-label saffron">Please read</p>
      <p className="mt-2">
        {text ??
          "TakeSure shows what published research says about a combination. It is educational information, not medical advice. Do not start, stop or change any medicine or Ayurvedic product on your own — show this result to your doctor, vaidya or pharmacist."}
      </p>
    </aside>
  );
}
