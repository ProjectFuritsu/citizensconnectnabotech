import { ArrowUpRight, Info } from "lucide-react";
import { Section } from "./Section";

// Where the figures come from

// Cards linking to official sources: [{ name, url, description }]
export function SourceList({ title = "Official sources", desc = "Read the original reports for yourself.", sources }) {
  if (sources.length === 0) return null;
  return (
    <Section title={title} desc={desc}>
      <ul className="grid gap-3 md:grid-cols-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full gap-4 rounded-card border border-line bg-surface p-5 hover:border-brand-300 transition-colors"
            >
              <div className="grow">
                <p className="font-semibold group-hover:text-brand-700 transition-colors">{source.name}</p>
                {source.description && <p className="mt-1 text-sm text-muted">{source.description}</p>}
              </div>
              <ArrowUpRight size={16} className="shrink-0 text-faint group-hover:text-brand-600 transition-colors" />
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// The "Source: …" line above a dashboard
export const SourceNote = ({ children }) => (
  <p className="flex items-start gap-2 pt-6 text-sm text-muted">
    <Info size={16} className="mt-0.5 shrink-0 text-subtle" />
    <span>{children}</span>
  </p>
);
