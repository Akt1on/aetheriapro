type Props = Record<string, string | number | boolean | undefined>;

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  plausible?: (event: string, opts?: { props?: Props }) => void;
  gtag?: (...args: unknown[]) => void;
}

/**
 * Lightweight, provider-agnostic event tracking.
 * Forwards to dataLayer / gtag / plausible when present, otherwise no-ops.
 */
export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  const w = window as AnalyticsWindow;
  try {
    w.dataLayer = w.dataLayer ?? [];
    w.dataLayer.push({ event, ...props });
    w.gtag?.("event", event, props);
    w.plausible?.(event, { props });
  } catch {
    /* analytics must never break the UI */
  }
}
