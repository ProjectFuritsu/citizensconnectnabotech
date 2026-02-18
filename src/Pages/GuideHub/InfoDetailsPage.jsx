import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { InfoDataService } from "../../Services/InfoLibServices/InfoLibService";
import Custom_PageLayout from "../../Widgets/custom_PageLayout";

export default function InfoDetailsPage() {
  const { id } = useParams();
  const doc = useMemo(() => InfoDataService.getProgramById(id), [id]);

  if (!doc) return <NotFoundState />;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Use "auto" for an instant jump
    });
  }, [id]);

  return (
    <Custom_PageLayout>
      {/* 2. Hero Header */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">
          <Link to="/" className="hover:text-blue-500">
            <LucideIcons.Home size={12} />
          </Link>
          <span>/</span>
          <Link to="/info" className="hover:text-blue-500">
            Library Directory
          </Link>
          <span>/</span>
          <span className="text-blue-500">{doc.title}</span>
        </nav>

        <div className="flex justify-between items-start">
          <div className="mb-1">
            <header className="mb-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                {doc.title}
              </h1>
              <p className="text-slate-500 leading-relaxed max-w-2xl">
                {doc.desc}
              </p>
            </header>

            {/* Clean Meta Row */}
            <div className="flex gap-10 mb-1  border-slate-100 py-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Processing Fee
                </p>
                <div className="flex items-center gap-2 text-slate-900">
                  <LucideIcons.CreditCard
                    size={18}
                    className="text-slate-400"
                  />
                  <span className="font-semibold">{doc.fee}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Total Duration
                </p>
                <div className="flex items-center gap-2 text-slate-900">
                  <LucideIcons.CalendarDays
                    size={18}
                    className="text-slate-400"
                  />
                  <span className="font-semibold">
                    {doc.total_duration || "10 Days, 2 Hours"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row gap-16">
        {/* 3. Left Sidebar: Contents Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 border-l border-slate-100 pl-6 space-y-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Contents
            </p>
            <nav className="flex flex-col gap-4">
              {["Requirements", "Procedure"].map((item, i) => (
                <a
                  key={i}
                  href={`#section-${i}`}
                  className="text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-3 group"
                >
                  <span className="text-[10px] text-slate-300 group-hover:text-blue-400">
                    0{i + 1}
                  </span>
                  {item}
                </a>
              ))}
            </nav>
            <div className="pt-6 border-t border-slate-50">
              <p className="text-[11px] italic text-slate-400 leading-relaxed">
                This guide is for informational purposes only. No actions can be
                taken directly from this page.
              </p>
            </div>
          </div>
        </aside>

        {/* 4. Document Body */}
        <section className="flex-1 space-y-24">
          {/* Section 1: Mandatory Prerequisites (Grid Layout) */}
          <div id="section-0" className="relative">
            {/* Modern Header with subtle accent */}
            <div className="flex flex-col mb-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-10 bg-blue-600 rounded-full" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600/80">
                  Phase 01
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Mandatory Prerequisites
              </h2>
              <p className="mt-3 text-slate-500 max-w-2xl leading-relaxed">
                Ensure you have these materials ready before initiating the{" "}
                <span className="text-slate-900 font-medium">
                  {doc.title.toLowerCase()}
                </span>{" "}
                process to avoid delays.
              </p>
            </div>

            {/* Grid using Informational Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {doc.requirements?.map((req, idx) => (
                <div
                  key={idx}
                  className="group relative flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  {/* Requirement Indicator (Dot + Icon) */}
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                    <LucideIcons.FileText
                      size={18}
                      className="text-slate-400 group-hover:text-white transition-colors"
                    />
                  </div>

                  <div className="flex flex-col pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                      Requirement {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-700 leading-snug">
                      {req}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Section 1.1: Situational Prerequisites (Grid Layout) */}

          <section className="mt-1">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <LucideIcons.Info size={20} className="text-blue-600" />
              Situational Requirements
            </h2>
            {doc.situational_requirements?.map((group, idx) => (
              <div className="space-y-6">
                <div
                  key={idx}
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-100"
                >
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {group.condition}
                  </h3>
                  <ul className="space-y-2">
                    {group.docs.map((docItem, dIdx) => (
                      <li
                        key={dIdx}
                        className="flex items-start gap-3 text-sm text-slate-600"
                      >
                        <LucideIcons.FileText
                          size={16}
                          className="mt-0.5 text-slate-400"
                        />
                        {docItem}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </section>

          {/* Section 2: Procedure Timeline */}
          <div id="section-1">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                The Standard Procedure
              </h2>
            </div>
            <div className="space-y-4">
              {doc.guidelines?.map((step, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-100 flex items-center justify-center text-blue-500 font-bold text-xs group-hover:border-blue-500 transition-colors">
                      0{idx + 1}
                    </div>
                    {idx !== doc.guidelines.length - 1 && (
                      <div className="w-px h-full bg-slate-100 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-12">
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm transition-all">
                      <h4 className="font-bold text-slate-800 mb-2">
                        {step.action}
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">
                        {step.details}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                        <LucideIcons.Clock size={12} /> Est. Duration:{" "}
                        {step.duration || "Not Stated"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Custom_PageLayout>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <LucideIcons.FileWarning size={48} className="text-slate-300 mb-4" />
      <h2 className="text-xl font-bold text-slate-800">Document Not Found</h2>
      <Link to="/library" className="mt-4 text-blue-500 hover:underline">
        Return to Directory
      </Link>
    </div>
  );
}
