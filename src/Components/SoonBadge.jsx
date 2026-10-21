// Small "Soon" label for disabled (not yet available) links and cards
export default function SoonBadge({ className = "" }) {
  return (
    <span
      className={`shrink-0 rounded-full bg-canvas px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-subtle ${className}`}
    >
      Soon
    </span>
  );
}
