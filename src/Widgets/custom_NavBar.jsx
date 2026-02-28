import React, { useState, useEffect } from "react";
import contactData from "../Data/contacts.json";
import Custom_Banner from "./custom_Banner";
import * as LucideIcons from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGeoPage, setIsGeoPage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGeoPage(window.location.pathname === "/geo");
    }
  }, []);

  const navigation = [
    { title: "Home", path: "/" },
    { title: "Guide Hub", path: "/info" },
    { title: "News & Updates", path: "/news-updates" },
    { title: "Explore now", path: "/geo", isNew: true }, // Added 'isNew' flag
  ];

  return (
    <header className="relative w-full z-50">
      {/* 1. HOTLINE BANNER */}
      <Custom_Banner variant="ticker">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-2 text-white shrink-0 border-r border-white/20 pr-6">
            <LucideIcons.ShieldAlert size={14} className="animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
              Official Hotlines
            </span>
          </div>
          <div className="flex items-baseline gap-8">
            {contactData.essential_contacts.map((contact, idx) => (
              <a
                key={idx}
                href={`tel:${contact.number}`}
                className="flex items-baseline gap-2 text-white group whitespace-nowrap"
              >
                <span className="text-[10px] font-medium uppercase opacity-80">
                  {contact.name}
                </span>
                <span className="text-[13px] font-bold tracking-tight">
                  {contact.number}
                </span>
              </a>
            ))}
          </div>
        </div>
      </Custom_Banner>

      {/* 2. MAIN NAV */}
      <nav className="bg-white w-full border-b border-slate-200 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg">
                P
              </div>
              <div>
                <h1 className="text-slate-900 font-black text-sm md:text-base uppercase leading-none">
                  Panabo City
                </h1>
                <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">
                  Citizen's Portal
                </p>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center h-full absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center h-full">
              {navigation.map((item, idx) => (
                <li key={idx} className="h-full flex items-center">
                  <a
                    href={item.path}
                    className="relative px-5 h-full flex items-center text-slate-600 hover:text-slate-900 text-[13px] font-bold transition-all border-b-2 border-transparent hover:border-slate-900"
                  >
                    {item.title}
                   
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <LucideIcons.X size={28} /> : <LucideIcons.Menu size={28} />}
            </button>
          </div>
        </div>

        {/* 3. MOBILE DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 absolute w-full left-0 top-full shadow-lg">
            <ul className="flex flex-row items-center overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
              {navigation.map((item, idx) => (
                <li key={idx} className="shrink-0 h-14 flex items-center">
                  <a
                    href={item.path}
                    className="px-6 h-full flex items-center text-slate-700 font-bold text-sm transition-all border-b-2 border-transparent active:border-slate-900 relative"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                    {item.isNew && (
                      <span className="ml-1 text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md leading-none">
                        NEW
                      </span>
                    )}
                  </a>
                </li>
              ))}
              <li className="shrink-0 w-8 h-14"></li>
            </ul>
          </div>
        )}
      </nav>

      {/* 4. NEW FEATURE BANNER (Only on Geo Page) */}
      {isGeoPage && (
        <div className="bg-slate-900 text-white overflow-hidden relative">
          {/* Subtle animated background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[16px_16px]"></div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between relative z-10 gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1 rounded">
                <LucideIcons.Sparkles size={16} className="text-white" />
              </div>
              <p className="text-xs md:text-sm font-bold tracking-tight">
                <span className="text-blue-400">NEW FEATURE:</span> Explore some amenities on our Digital Panabo Map
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-white/10 rounded-full border border-white/20">
                Released Feb 2026
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
