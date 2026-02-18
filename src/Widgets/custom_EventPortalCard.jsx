import { ExternalLink, CalendarDays, ArrowRight } from "lucide-react";
export default function Custom_EventPortalCard() {
  const eventUrl = "https://evently-panabo.vercel.app/";

  return (
    <a
      href="https://evently-panabo.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-1">
        {/* Header with Activity Dot */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors">
              <CalendarDays
                size={18}
                className="text-blue-600 group-hover:text-white transition-colors"
              />
            </div>
            <h3 className="font-bold text-slate-800">City Events Portal</h3>
          </div>
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            Discover and join upcoming community activities, festivals, and
            official city gatherings.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
              Explore Evently
              <ExternalLink size={12} />
            </span>
            <ArrowRight
              size={18}
              className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
            />
          </div>
        </div>
      </div>
    </a>
  );
}
