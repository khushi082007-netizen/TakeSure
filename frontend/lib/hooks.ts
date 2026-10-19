"use client";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types/api";

/**
 * Minimal async-query hook. `loading` is derived (the current request key differs from the last
 * settled key), so no state is set synchronously inside the effect — only from the promise callbacks.
 */
export function useQuery<T>(fn: () => Promise<T>, key: string) {
  const [settled, setSettled] = useState<{ key: string; data: T | null; error: ApiError | null; attempt: number } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const loading = !settled || settled.key !== key || settled.attempt !== attempt;

  useEffect(() => {
    let cancelled = false;
    fn()
      .then((data) => !cancelled && setSettled({ key, data, error: null, attempt }))
      .catch((e) => !cancelled && setSettled({ key, data: null, error: toApiError(e), attempt }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return {
    data: settled && settled.key === key ? settled.data : null,
    error: settled && settled.key === key && settled.attempt === attempt ? settled.error : null,
    loading,
    retry,
  };
}

const noop = () => () => {};

/** Read a sessionStorage key safely during hydration: null on the server, the raw string on the client. */
export function useSessionRaw(key: string): string | null | undefined {
  // undefined = not yet hydrated (server snapshot); null = hydrated but empty
  return useSyncExternalStore(
    noop,
    () => {
      try {
        return window.sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => undefined,
  );
}

export function useSessionJSON<T>(key: string): T | null | undefined {
  const raw = useSessionRaw(key);
  return useMemo(() => {
    if (raw === undefined) return undefined;
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [raw]);
}
