import { Link } from "react-router-dom";
import { Container, Page, PageHeader } from "../../Components/Page";
import { Section } from "../../Components/Section";
import { contactLink, site } from "../../Services/SiteService";
import { formatDate } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";

// Terms of Use, in plain language. Linked from the footer's About column
// (src/Data/Site/site.config.json). When you change the wording, update
// UPDATED so visitors can see the terms changed.
const UPDATED = "2026-10-22";

const quietLink = "link-quiet font-medium text-ink";

export default function TermsPage() {
  usePageMeta({
    title: "Terms of Use",
    description: `The terms for using ${site.name}, an independent, information-only site.`,
  });

  return (
    <Page>
      <PageHeader
        title="Terms of Use"
        path="/terms"
        intro={`The terms for using ${site.name}, in plain language.`}
        note={`Last updated ${formatDate(UPDATED)}`}
      />

      <Container>
        <div className="max-w-3xl">
          <Term title="Using this site">
            <p>
              These terms apply when you use {site.name} (the “portal”). By using the portal, you agree to
              them. If you don't agree, please don't use it.
            </p>
          </Term>

          <Term title="Not an official government website">
            <p>
              The portal is an independent community project. It is not an official website of the City Government of
              Panabo, and it can't process applications, payments or requests. For official transactions and
              announcements, contact the city office concerned or visit the{" "}
              <a href="https://panabocity.gov.ph/" target="_blank" rel="noopener noreferrer" className={quietLink}>
                Panabo City Official Website
              </a>
              .
            </p>
          </Term>

          <Term title="Information is for guidance only">
            <p>
              The information here is copied with care from official sources, which every page names and links to. It
              may still be incomplete, out of date or wrong: requirements, fees, schedules and phone numbers can change.
              Confirm anything important with the office concerned before you act on it.
            </p>
            <p>
              The portal is provided “as is”. The people who run it aren't responsible for any loss or
              inconvenience that comes from relying on it.
            </p>
          </Term>

          <Term title="Public records">
            <p>
              The Budget and Procurement pages show government records (the Commission on Audit's Annual Audit Reports
              and PhilGEPS procurement records) as their publishers released them. A procurement notice, a contract or
              an audit observation is a public record, not proof of wrongdoing. For certified or official copies, go to
              the original publisher.
            </p>
          </Term>

          <Term title="Reusing the information">
            <p>
              All content on the portal is dedicated to the public domain under{" "}
              <a href={site.license.url} target="_blank" rel="noopener noreferrer" className={quietLink}>
                {site.license.name}
              </a>
              , unless otherwise specified: you're free to copy, share, adapt and reuse it, for any purpose, even
              commercially, without asking.
            </p>
            <p>
              The figures and records come from government sources. When you reuse them, please cite the original
              source shown on the page, so others can check it too.
            </p>
          </Term>

          <Term title="Links to other websites">
            <p>
              The portal links to other websites: official sources, the City Government's website, and community tools
              such as the city map. They're run by others, and their own terms apply; the portal isn't responsible
              for their content.
            </p>
          </Term>

          <Term title="Privacy">
            <p>
              The portal doesn't ask for accounts, names or any other personal information. It counts page visits with
              Vercel Web Analytics, which doesn't use cookies.
            </p>
          </Term>

          <Term title="Changes to these terms">
            <p>
              These terms may change as the portal grows. The date at the top of this page shows when they last
              changed; using the portal after a change means you accept the new terms.
            </p>
            <p>
              See also{" "}
              <Link to="/about" className={quietLink}>
                About this site
              </Link>
              {contactLink && (
                <>
                  , or contact us at{" "}
                  <a
                    href={contactLink.href}
                    target={contactLink.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className={quietLink}
                  >
                    {contactLink.label}
                  </a>
                </>
              )}
              .
            </p>
          </Term>
        </div>
      </Container>
    </Page>
  );
}

// One section of the terms: a heading and readable paragraphs
const Term = ({ title, children }) => (
  <Section title={title}>
    <div className="space-y-3 text-ink-soft leading-relaxed">{children}</div>
  </Section>
);
