"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export function FileDrop({
  id,
  label,
  hint,
  file,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File | null) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const preview = useMemo(() => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-ink">
        {label}
      </label>
      <p className="text-sm text-ink-3">{hint}</p>
      <motion.div
        animate={{ scale: over ? 1.015 : 1 }}
        className={`mt-3 relative overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${over ? "border-mint bg-mint/10" : file ? "border-mint/40 bg-mint/[0.04]" : "border-line-2 bg-white/[0.02] hover:border-line-2 hover:bg-white/[0.04]"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (disabled) return;
          onChange(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <input
          ref={input}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          capture="environment"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="text-sm">
            {preview ? (
              <div className="relative mx-auto h-36 w-full max-w-xs overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <div className="scan-line" aria-hidden />
              </div>
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl border border-line bg-white/[0.04] text-3xl">📄</div>
            )}
            <p className="mt-3 font-medium text-ink break-all">{file.name}</p>
            <p className="text-ink-3 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <div className="mt-3 flex justify-center gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => input.current?.click()} disabled={disabled}>
                Replace
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)} disabled={disabled}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/15 border border-mint/30 text-2xl" aria-hidden>
              📷
            </div>
            <p className="mt-3 text-ink-2 text-sm">Drag a photo here, or</p>
            <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => input.current?.click()} disabled={disabled}>
              Choose photo
            </button>
            <p className="mt-3 text-[11px] text-ink-3 font-mono tracking-wider">JPG · PNG · WEBP · PDF · ≤ 8 MB</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
