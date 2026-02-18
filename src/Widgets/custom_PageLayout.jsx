export default function Custom_PageLayout({ children }) {
  return (
    <div className="bg-slate-50/50 font-sans text-slate-900 pt-0 ">
      <div>{children}</div>
    </div>
  );
}
