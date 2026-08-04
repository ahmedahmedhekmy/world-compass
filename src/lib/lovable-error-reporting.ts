/**
 * Error reporting utility for client-side errors.
 * Works with both Lovable Cloud (when available) and standard deployments (Vercel).
 * On Vercel, errors are logged to console and can be sent to error tracking services like Sentry.
 */

type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
    __lovableReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  }
}

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // Try to report to Lovable if available (Lovable Cloud editor preview)
  if (window.__lovableEvents) {
    window.__lovableEvents.captureException?.(
      error,
      {
        source: "react_error_boundary",
        route: window.location.pathname,
        ...context,
      },
      {
        mechanism: "react_error_boundary",
        handled: false,
        severity: "error",
      },
    );
  }

  // Also log to console for Vercel deployments and debugging
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[Error] ${message}`, {
    route: typeof window !== "undefined" ? window.location.pathname : "unknown",
    ...context,
  });

  if (stack) {
    console.error(stack);
  }

  // Forward to Lovable reporter if available
  window.__lovableReportRuntimeError?.({
    message,
    stack,
    filename: typeof window !== "undefined" ? window.location.pathname : undefined,
  });
}
