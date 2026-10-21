import { CloudOff, RefreshCw, SearchX } from "lucide-react";
import { Button } from "./Controls";

// Loading, error and empty states (DESIGN.md "Empty state")

export const LoadingState = ({ children }) => (
  <div
    role="status"
    className="mt-10 flex items-center justify-center gap-3 rounded-card border border-line bg-surface px-6 py-16 text-sm text-muted"
  >
    <RefreshCw size={18} className="animate-spin text-subtle motion-reduce:animate-none" />
    {children}
  </div>
);

// A dashed box: icon, plain-language heading, a hint, and an optional action
export const EmptyState = ({ icon: IconComponent = SearchX, title, children, action, role, className = "mt-10" }) => (
  <div
    role={role}
    className={`rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center ${className}`}
  >
    <IconComponent size={32} className="mx-auto text-subtle" />
    <h2 className="mt-3 text-lg font-semibold">{title}</h2>
    {children && <div className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</div>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// "Couldn't load …", the error's message and a Try again button
export const ErrorState = ({ title, error, onRetry, children }) => (
  <EmptyState
    role="alert"
    icon={CloudOff}
    title={title}
    action={
      <Button variant="primary" size="md" icon={RefreshCw} onClick={onRetry}>
        Try again
      </Button>
    }
  >
    {children}
    {error?.message && <p className="mt-2 text-xs text-subtle">{error.message}</p>}
  </EmptyState>
);

// One year's data on screen, from useYearData(): a loading box until the first
// year arrives, an error box with Try again, and while another year loads the
// current one stays visible (dimmed only if it takes a moment).
// children is a function: (data) => content.
export function YearContent({ status, data, error, retry, what, errorHint, children }) {
  if (status === "error") {
    return (
      <ErrorState title={`Couldn't load the ${what}`} error={error} onRetry={retry}>
        {errorHint}
      </ErrorState>
    );
  }
  if (!data) return <LoadingState>Loading {what}…</LoadingState>;
  return (
    <div
      aria-busy={status === "loading"}
      className={status === "loading" ? "opacity-60 transition-opacity delay-150" : undefined}
    >
      {children(data)}
    </div>
  );
}
