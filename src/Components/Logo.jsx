import { Link } from "react-router-dom";
import { site } from "../Services/SiteService";
import logo from "../Theme/logo.svg";

// Shared brand mark for the navbar and footer: the banana-plant-and-sun mark,
// the name as a wordmark, and the tagline (both from src/Data/Site/site.config.json)
export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 shrink-0">
      {/* Decorative: the name next to it already labels the link */}
      <img src={logo} alt="" className="h-12 w-12 shrink-0" />
      <span className="leading-tight">
        <span className="block text-lg font-bold tracking-tight text-logo">{site.name}</span>
        <span className="block text-xs text-muted">{site.tagline}</span>
      </span>
    </Link>
  );
}
