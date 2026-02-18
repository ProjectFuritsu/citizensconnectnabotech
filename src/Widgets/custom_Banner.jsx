export default function Custom_Banner({
  children,
  variant = "primary",
  className = "",
}) {
  const variants = {
    primary:
      "from-blue-600 to-indigo-700 text-white rounded-3xl p-8 md:p-12 shadow-xl mx-8 my-12",
    soft: "from-slate-50 to-white text-slate-900 border border-slate-200 rounded-3xl p-8 md:p-12 mx-8 my-12",
    // GOVERNMENT TICKER: No rounding, no outer margin, flush against the screen edges
    ticker: "bg-[#b91c1c] border-b border-red-900 py-2.5 w-full",
  };

  const isTicker = variant === "ticker";

  return (
    /* We remove the outer padding (px-8 py-12) if it's a ticker */
    <section className={`${isTicker ? "" : "px-8 py-12"} ${className}`}>
      <div className={`relative overflow-hidden ${variants[variant]}`}>
        {/* Only show decorative orbs on floating banners, not the official ticker */}
        {!isTicker && (
          <>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          </>
        )}
        <div className="relative z-10">{children}</div>
      </div>
    </section>
  );
}
