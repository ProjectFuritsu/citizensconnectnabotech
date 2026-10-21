import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { site } from "../Services/SiteService";

// Updates a <meta>/<link> that index.html already has, or adds it if missing
function setHeadTag(selector, create, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const metaByName = (name) => () => {
  const el = document.createElement("meta");
  el.setAttribute("name", name);
  return el;
};

const metaByProperty = (property) => () => {
  const el = document.createElement("meta");
  el.setAttribute("property", property);
  return el;
};

// Keeps descriptions within what search results show (~160 characters)
const truncate = (text, max = 160) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

/**
 * Sets the page title, description, canonical URL and social tags.
 * Call once per page: usePageMeta({ title: "Guide Hub", description: "..." })
 * - title: page name; " | Panabo City Citizen's Portal" is added. Omit for the home page.
 * - noindex: true for pages search engines should skip (e.g. not found)
 */
export function usePageMeta({ title, description, noindex = false } = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : site.title;
    const desc = truncate(description || site.description);
    // Canonical ignores query strings, so filtered views (/info?tag=Health)
    // point back to the main page
    const url = `${site.url}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;

    document.title = fullTitle;
    setHeadTag('meta[name="description"]', metaByName("description"), "content", desc);
    setHeadTag('meta[name="robots"]', metaByName("robots"), "content", noindex ? "noindex" : "index, follow");
    setHeadTag(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement("link"), { rel: "canonical" }),
      "href",
      url,
    );
    setHeadTag('meta[property="og:title"]', metaByProperty("og:title"), "content", fullTitle);
    setHeadTag('meta[property="og:description"]', metaByProperty("og:description"), "content", desc);
    setHeadTag('meta[property="og:url"]', metaByProperty("og:url"), "content", url);
  }, [title, description, noindex, pathname]);
}
