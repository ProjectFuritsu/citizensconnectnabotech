import { useEffect, useState } from "react";
import { BudgetService } from "../Services/BudgetServices/BudgetService";

// Loads the budget data from Cloudflare R2.
// status: "unconfigured" (no data.r2Url yet) | "loading" | "ready" | "error";
// retry() tries again after an error.
export function useBudgetData() {
  const [state, setState] = useState({
    status: BudgetService.configured ? "loading" : "unconfigured",
    budget: null,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!BudgetService.configured) return;
    let cancelled = false;
    BudgetService.load()
      .then((budget) => {
        if (!cancelled) setState({ status: "ready", budget, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "error", budget: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: "loading", budget: null, error: null });
    setAttempt((n) => n + 1);
  };

  return { ...state, retry };
}
