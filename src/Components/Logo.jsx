import { Link } from "react-router-dom";
import logo from "../Theme/logo.svg";

// Shared brand mark for the navbar and footer
export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 shrink-0">
      {/* Decorative: the name next to it already labels the link */}
      <img src={logo} alt="" className="h-10 w-10 shrink-0" />
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-ink">
          Panabo City
        </span>
        <span className="block text-xs text-muted">Citizen's Portal</span>
      </span>
    </Link>
  );
}
