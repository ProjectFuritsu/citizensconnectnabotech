import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Custom_DynamicIcon from "./custom_DynamicIcon";
import { formatDate, formatFee, isFree, pluralize } from "../Theme/display";

// Guide card for the Guide Hub: the whole card links to the guide's details
export default function Custom_InfoCard({ doc }) {
  const requirementCount = doc.requirements?.length ?? 0;
  const stepCount = doc.guidelines?.length ?? 0;

  return (
    <Link
      to={`/info/${doc.id}`}
      className="group flex h-full flex-col rounded-card border border-line bg-surface p-5 hover:border-brand-300 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-canvas">
          <Custom_DynamicIcon
            name={doc.icon_type}
            className={`h-4 w-4 ${doc.icon_color || "text-brand-500"}`}
          />
        </span>
        <span className="text-xs font-medium text-brand-600">
          {doc.tags[0]}
        </span>
        <span className="ml-auto text-xs text-subtle tabular-nums">
          {formatDate(doc.date)}
        </span>
      </div>

      <h3 className="mt-4 font-semibold leading-snug text-ink group-hover:text-brand-700 transition-colors">
        {doc.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
        {doc.desc}
      </p>

      {/* Key facts, pinned to the bottom so cards in a row line up */}
      <div className="mt-auto pt-5">
        <dl className="space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="shrink-0 text-muted">Fee</dt>
            <dd
              className={`text-right tabular-nums ${isFree(doc.fee) ? "font-medium text-success" : "text-ink-soft"}`}
            >
              {formatFee(doc.fee)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="shrink-0 text-muted">Processing time</dt>
            <dd className="text-right text-ink-soft">{doc.total_duration}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between gap-4 text-xs">
          <span className="text-subtle">
            {pluralize(requirementCount, "requirement")} ·{" "}
            {pluralize(stepCount, "step")}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 font-medium text-brand-600 group-hover:text-brand-700">
            {doc.button_text || "View details"}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
