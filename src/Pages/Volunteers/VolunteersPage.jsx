import React from "react";
import { Search, MapPin, Download, BarChart3, Mail } from "lucide-react"; // Using Lucide for icons
import { usePageMeta } from "../../SEO/usePageMeta";

const OPPORTUNITIES = [
  {
    title: "Community Garden Lead",
    org: "Green Earth Alliance",
    desc: "Help oversee our downtown garden plots. Assist new gardeners, organize tools, and ensure space remains welcoming.",
    location: "Downtown District",
    type: "Weekly",
    category: "Environment",
    img: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=300",
  },
  {
    title: "After-School Math Tutor",
    org: "City Library District",
    desc: "Support high school students with algebra and geometry homework. No teaching certification required.",
    location: "Main Branch Library",
    type: "Twice Weekly",
    category: "Youth",
    img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=300",
  },
];

export default function VolunteersPage() {
  // Placeholder content for a coming-soon feature: keep it out of search results
  usePageMeta({ title: "Get Involved", noindex: true });

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Header & Search */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Find Your Way to Help</h1>
          <p className="text-slate-500 mb-6">
            Join thousands of neighbors making our city better, one hour at a
            time.
          </p>

          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by keyword, role, or organization..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
              Search Opportunities
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              "All",
              "Environment",
              "Youth & Education",
              "Seniors",
              "Crisis Response",
              "Events",
            ].map((cat, i) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap ${i === 0 ? "bg-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-500 uppercase tracking-wider text-sm">
                Active Opportunities (12 found)
              </h2>
              <select className="bg-transparent text-sm font-medium text-slate-600 outline-none">
                <option>Sort by: Newest First</option>
              </select>
            </div>

            {OPPORTUNITIES.map((job, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row p-4 gap-6"
              >
                <div className="relative w-full md:w-48 h-40 shrink-0">
                  <img
                    src={job.img}
                    className="w-full h-full object-cover rounded-lg"
                    alt={job.title}
                  />
                  <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                    {job.category}
                  </span>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{job.title}</h3>
                      <p className="text-blue-600 font-medium text-sm mb-3">
                        {job.org}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {job.desc}
                  </p>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex items-center text-slate-400 text-sm">
                      <MapPin className="w-4 h-4 mr-1" /> {job.location}
                    </div>
                    <button className="border border-blue-200 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-50">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Impact Card */}
            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-bold text-sm">Community Impact</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-3xl font-bold">10.5k</div>
                    <div className="text-[10px] uppercase opacity-80">
                      Hours Donated
                    </div>
                  </div>
                  <div className="border-l border-blue-400 pl-4">
                    <div className="text-3xl font-bold">1.2k</div>
                    <div className="text-[10px] uppercase opacity-80">
                      Active Volunteers
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  Together, we saved the city an estimated{" "}
                  <span className="font-bold">$320,000</span> in resources this
                  year!
                </p>
              </div>
            </div>

            {/* Resources Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold mb-4">Volunteer Resources</h3>
              <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4 mb-4">
                <div className="bg-red-50 p-2 rounded">
                  <Download className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-sm">Volunteer Handbook</p>
                  <p className="text-[10px] text-slate-400">
                    Guidelines and safety protocols...
                  </p>
                  <button className="text-blue-600 text-[10px] font-bold mt-1">
                    Download PDF (2.4 MB)
                  </button>
                </div>
              </div>
              <button className="w-full border border-slate-200 py-2 rounded-lg text-sm font-semibold text-slate-600">
                View All Forms
              </button>
            </div>

            {/* Subscribe Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl">
              <h3 className="font-bold mb-2">Never Miss an Opportunity</h3>
              <p className="text-xs text-slate-400 mb-4">
                Get weekly updates on new volunteer roles.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-slate-800 border-none rounded-lg p-2.5 text-sm"
                />
                <button className="w-full bg-blue-500 py-2.5 rounded-lg text-sm font-bold">
                  Subscribe
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
