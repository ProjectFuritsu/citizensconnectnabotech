// schema.org structured data for <JsonLd data={...} />
import { site } from "../Config/links";

const PANABO = {
  "@type": "City",
  name: "Panabo City",
  containedInPlace: { "@type": "AdministrativeArea", name: "Davao del Norte" },
};

// The whole site (home page)
export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: `${site.url}/`,
  description: site.description,
  inLanguage: "en-PH",
  about: PANABO,
  publisher: { "@type": "Organization", name: site.publisher },
});

// Breadcrumb trail: [{ name: "Home", path: "/" }, { name: "Guide Hub", path: "/info" }]
export const breadcrumbSchema = (crumbs) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: `${site.url}${crumb.path}`,
  })),
});

// One guide: the government service it describes, plus its breadcrumbs
export const guideSchema = (doc) => {
  const path = `/info/${encodeURIComponent(doc.id)}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "GovernmentService",
      name: doc.title,
      description: doc.desc,
      url: `${site.url}${path}`,
      serviceType: doc.tags[0],
      areaServed: PANABO,
      provider: {
        "@type": "GovernmentOrganization",
        name: "City Government of Panabo",
        url: "https://panabocity.gov.ph/",
      },
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Guide Hub", path: "/info" },
      { name: doc.title, path },
    ]),
  ];
};
