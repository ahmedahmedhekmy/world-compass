import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component to catch and display errors gracefully.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container-page flex min-h-[50vh] items-center justify-center py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <svg
                className="size-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold">حدث خطأ غير متوقع</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو التواصل معنا إن استمرت المشكلة.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => window.location.reload()}>إعادة تحميل الصفحة</Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                العودة للصفحة السابقة
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mt-6 max-w-full overflow-auto rounded-lg bg-destructive/10 p-4 text-right text-xs">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to trigger error boundary from event handlers.
 */
export function useErrorBoundary() {
  return (error: Error) => {
    throw error;
  };
}
