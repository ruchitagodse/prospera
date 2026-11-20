"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type VisitState = { total: number | null; loading: boolean };
const VisitContext = createContext<VisitState>({ total: null, loading: true });
let pending: Promise<number> | undefined;

function loadVisits() {
  if (pending) return pending;
  pending = (async () => {
    let session = "";
    try {
      const cookie = "prospera_visit_session";
      session = document.cookie.split("; ").find(value => value.startsWith(`${cookie}=`))?.slice(cookie.length + 1) || "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session)) {
        session = crypto.randomUUID();
        document.cookie = `${cookie}=${session}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      }
      // Read only if cookies are blocked: counting every reload would mislead.
      if (!document.cookie.includes(`${cookie}=${session}`)) session = "";
    } catch { session = ""; }

    const response = await fetch("/api/visits", {
      method: session ? "POST" : "GET",
      headers: session ? { "x-visit-session": session } : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    if (!response.ok || !Number.isSafeInteger(data.total) || data.total < 0) throw new Error("Visits unavailable.");
    return data.total as number;
  })();
  // A failed load may be retried on the next page mount; successful loads are
  // shared across footer instances and React's development effect replay.
  void pending.catch(() => { pending = undefined; });
  return pending;
}

export function WebsiteVisitsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VisitState>({ total: null, loading: true });
  useEffect(() => {
    let active = true;
    void loadVisits().then(
      total => { if (active) setState({ total, loading: false }); },
      () => { if (active) setState({ total: null, loading: false }); },
    );
    return () => { active = false; };
  }, []);
  return <VisitContext.Provider value={state}>{children}</VisitContext.Provider>;
}

export function WebsiteVisits() {
  const { total, loading } = useContext(VisitContext);
  return <span className="p-website-visits" title={loading ? "Loading website visits" : total === null ? "Visit count temporarily unavailable" : "Total website visits · repeat visits within a browser session count once"}>
    Website visits: <span aria-live="polite" aria-atomic="true">{total === null ? "—" : total.toLocaleString("en-IN")}</span>
  </span>;
}
