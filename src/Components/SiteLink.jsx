import { NavLink } from "react-router-dom";

// A link from the site config (src/Data/Site/site.config.json), handled the
// same way everywhere: a page of this site, an outside tool (opens in a new
// tab), or a disabled item ("Soon"), which is plain text that can't be clicked
// or tabbed to. `className` can be a function ({ isActive }) => classes.
export default function SiteLink({ item, className, onClick, children }) {
  const classes = (isActive) => (typeof className === "function" ? className({ isActive }) : className);

  if (item.disabled) {
    return (
      <span aria-disabled="true" title={`${item.title} is coming soon`} className={classes(false)}>
        {children}
      </span>
    );
  }

  if (item.external) {
    return (
      <a href={item.path} target="_blank" rel="noopener noreferrer" onClick={onClick} className={classes(false)}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      onClick={onClick}
      className={({ isActive }) => classes(isActive)}
    >
      {children}
    </NavLink>
  );
}
