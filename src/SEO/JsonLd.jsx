// Structured data (schema.org JSON-LD) that search engines read to understand
// a page, e.g. breadcrumbs or the service a guide describes.
export default function JsonLd({ data }) {
  // Escape "<" so text from the data can never close the script tag early
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
