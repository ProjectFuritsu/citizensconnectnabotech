import { useEffect, useState } from "react";
import { BudgetService } from "../Services/BudgetServices/BudgetService";

// Loads the budget data files (src/Data/Budget).
// status: "loading" | "ready" | "error"; retry() tries again after an error.
export function useBudgetData() {
  const [state, setState] = useState({ status: "loading", budget: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
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
