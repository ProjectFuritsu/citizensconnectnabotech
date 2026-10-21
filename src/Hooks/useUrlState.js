import { useSearchParams } from "react-router-dom";

// Choices kept in the address (/budget?year=2023&view=revenue), so a view can
// be shared or bookmarked. Changing them doesn't add browser history entries.
export function useUrlState() {
  const [params, setParams] = useSearchParams();

  // A setting's value when it's one of `allowed`, otherwise the fallback
  const get = (name, allowed, fallback) => (allowed.includes(params.get(name)) ? params.get(name) : fallback);

  // Changes several settings at once; null removes one
  const set = (changes) => {
    const next = new URLSearchParams(params);
    for (const [name, value] of Object.entries(changes)) {
      if (value == null) next.delete(name);
      else next.set(name, String(value));
    }
    setParams(next, { replace: true });
  };

  return { params, get, set };
}
