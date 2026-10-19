import { useEffect, useState } from "react";
import { BudgetService } from "../Services/BudgetServices/BudgetService";

// Loads one year's budget lines when that year is selected.
// status: "loading" | "ready" | "error"; retry() tries again after an error.
// While another year loads, `data` still holds the last year shown, so the
// page can keep it on screen instead of collapsing to a loading message.
export function useBudgetYear(year) {
  const [state, setState] = useState({ data: null, failedYear: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (year == null) return;
    let cancelled = false;
    BudgetService.loadYear(year).then(
      (data) => {
        if (!cancelled) setState({ data, failedYear: null, error: null });
      },
      (error) => {
        if (!cancelled) setState((s) => ({ ...s, failedYear: year, error }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [year, attempt]);

  const status =
    state.failedYear === year ? "error" : state.data?.year === year ? "ready" : "loading";

  const retry = () => {
    setState((s) => ({ ...s, failedYear: null, error: null }));
    setAttempt((n) => n + 1);
  };

  return { status, data: state.data, error: state.error, retry };
}
