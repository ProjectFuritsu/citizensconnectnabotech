import { Link } from "react-router-dom";

// Shared brand mark for the navbar and footer
export default function Custom_Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-control bg-ink text-base font-bold text-white">
        P
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-ink">
          Panabo City
        </span>
        <span className="block text-xs text-muted">Citizen's Portal</span>
      </span>
    </Link>
  );
}
