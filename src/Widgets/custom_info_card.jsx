import * as LucideIcons from "lucide-react";
import { Link } from "react-router-dom";
export default function Custom_InfoCard({ doc }) {
  const DynamicIcon = ({ name, className }) => {
    const IconComponent = LucideIcons[name];
    // Fallback to Folder icon if the name in JSON is misspelled or missing
    if (!IconComponent) return <LucideIcons.Folder className={className} />;
    return <IconComponent className={className} />;
  };
  return (
    <div
      key={doc.id}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-blue-50 p-2.5 rounded-lg">
          <DynamicIcon
            name={doc.icon_type}
            className={`w-5 h-5 ${doc.icon_color || "text-blue-500"}`}
          />
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{doc.title}</h3>
      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-3">
        Date: {doc.date}
      </p>
      <p className="text-sm text-slate-500 leading-relaxed mb-6 grow">
        {doc.desc}
      </p>

      <div className="border-t border-slate-50 pt-4 mb-6 space-y-2">
        {doc.tags.map((tag) => (
          <div key={tag} className="flex items-center gap-2 text-blue-400">
            <LucideIcons.Folder size={12} className="fill-current opacity-60" />
            <span className="text-xs font-medium">{tag}</span>
          </div>
        ))}
      </div>

      <Link
        to={`/info/${doc.id}`}
        className="w-full py-2.5 border border-blue-100 rounded-lg text-blue-700 font-bold text-xs text-center hover:bg-blue-600 hover:text-white transition-all duration-200"
      >
        {doc.button_text}
      </Link>
    </div>
  );
}
