export default function   Custom_Footer() {
  const footerNavs = [
    {
      label: "INFORMATION",
      items: [
        { href: "/", name: "Home" },
        { href: "/info", name: "Guide Hub" },
        { href: "/news-updates", name: "News & Updates" }
      ],
    },
    {
      label: "Resources",
      items: [
        { href: "https://panabocity.gov.ph/", name: "Panabo City Official Website" },
      ],
    },
  ];

  return (
    <footer className="bg-white px-4 py-10 max-w-7xl mx-auto md:px-8 font-sans">
      <div className="md:flex gap-12">
        {/* Branding and Mission */}
        <div className="flex-1 mb-10 md:mb-0">
          <div className="flex items-center gap-2 mb-4">
            {/* Simple Portal Icon */}
            <div className="bg-blue-500 p-1.5 rounded-md">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
            </div>
            <span className="text-gray-800 font-bold text-lg">
              PublicInfo Portal
            </span>
          </div>
          <p className="max-w-lg text-blue-400 text-sm leading-relaxed">
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
                    className="text-blue-400 hover:text-blue-600 text-sm transition-colors"
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
        <p className="text-blue-300 text-sm">
          © 2023 Made by Fritz 🔥
        </p>
      </div>
    </footer>
  );
}
