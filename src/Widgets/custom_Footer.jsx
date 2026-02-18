export default function Custom_Footer() {
  const footerNavs = [
    {
      label: "INFORMATION",
      items: [
        { href: "/", name: "Home" },
        { href: "/info", name: "Guide Hub" },
        { href: "/news-updates", name: "News & Updates" },
      ],
    },
    {
      label: "Resources",
      items: [
        {
          href: "https://panabocity.gov.ph/",
          name: "Panabo City Official Website",
        },
      ],
    },
  ];

  return (
    <footer className="bg-white px-4 py-10 max-w-7xl mx-auto md:px-8 font-sans">
      <div className="md:flex gap-12">
        {/* Branding and Mission */}
        <div className="flex-1 mb-10 md:mb-0">
          <div className="flex items-center gap-4 mb-2">
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
          <p className="max-w-lg text-slate-900 text-sm leading-relaxed">
            Your official source for public information. Ensuring transparency
            and access to knowledge for everyone.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 grid grid-cols-2 gap-0.5 sm:flex sm:justify-end sm:gap-20">
          {footerNavs.map((nav, idx) => (
            <ul className="space-y-4" key={idx}>
              <h4 className="text-gray-900 font-bold text-sm tracking-wider">
                {nav.label}
              </h4>
              {nav.items.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.href}
                    className="text-slate-900 hover:text-blue-600 text-sm transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="mt-16 pt-8 border-t border-blue-50 text-center">
        <p className="text-slate-900 text-sm">© 2026 Made by NaboTech.org</p>
      </div>
    </footer>
  );
}
