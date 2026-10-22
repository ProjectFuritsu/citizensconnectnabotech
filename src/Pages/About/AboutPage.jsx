import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BadgeCheck, Gift, RefreshCw, Scale, ShieldCheck, Smartphone } from "lucide-react";
import { Container, Page, PageHeader } from "../../Components/Page";
import { Section } from "../../Components/Section";
import { BudgetService } from "../../Services/BudgetService";
import { GuideService } from "../../Services/GuideService";
import { ProcurementService } from "../../Services/ProcurementService";
import { contactLink, hotlines, hotlinesUpdated, site, tools } from "../../Services/SiteService";
import { formatDate, pluralize } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";

// About the portal: mission, why it was built, objectives, what's on it,
// where the information comes from, the builders' commitments, the license,
// and who runs it. Counts and years come from src/Data, so they stay right
// as data changes. Linked from the footer only (src/Data/Site/site.config.json).

// ["2021", "2022", "2024"] -> "2021, 2022 and 2024"
const listOf = (items) =>
  items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : (items[0] ?? "");

const budgetYears = BudgetService.years.map((y) => y.year); // newest first
const procurementYears = ProcurementService.years.map((y) => y.year).sort((a, b) => a - b);
const liveTools = tools.filter((tool) => !tool.disabled);
const guideSource = GuideService.guides[0]?.sources;
const coa = BudgetService.sources.find((s) => /Commission on Audit/i.test(s.name));
const philgeps = ProcurementService.sources[0];

const MISSION =
  "To make public information about Panabo City easy to find, easy to understand, and easy to check, for every resident.";

// What each part of the portal sets out to do
const OBJECTIVES = [
  {
    title: "Get city services done in one trip",
    text: "Know the requirements, fees, steps and processing time before you go to the office.",
  },
  {
    title: "Make the city budget understandable",
    text: "Show what the city planned to spend, what it actually spent, and where the money came from, year by year.",
  },
  {
    title: "Open up government purchasing",
    text: "Show what government offices in Panabo City buy, how they buy it, and who wins the contracts.",
  },
  {
    title: "Put help one tap away",
    text: "Keep emergency numbers ready to call from any page.",
  },
  {
    title: "Invite everyone to check",
    text: "Link every figure to its official source, so anyone can see where it came from.",
  },
];

const SECTIONS = [
  {
    to: "/info",
    title: "Guide Hub",
    text: `${pluralize(GuideService.guides.length, "step-by-step guide")} to city services, with requirements, fees and processing times.`,
  },
  {
    to: "/budget",
    title: "Budget Transparency",
    text: `What the city planned to spend, what it actually spent, and where the money came from, ${budgetYears.at(-1)}–${budgetYears[0]}.`,
  },
  {
    to: "/procurement",
    title: "Procurement Transparency",
    text: `What government offices in Panabo City put up for bidding, and who won the contracts, for ${listOf(procurementYears)}.`,
  },
  {
    to: "/hotlines",
    title: "Emergency Hotlines",
    text: `${pluralize(hotlines.length, "emergency number")} you can tap to call.`,
  },
];

// Which part of the portal uses which official source
const SOURCES = [
  {
    part: "Guide Hub",
    source: guideSource,
    text: "Requirements, fees and steps as the charter states them. Each guide shows the date it was last checked.",
  },
  {
    part: "Budget Transparency",
    source: coa && { name: "Commission on Audit, Annual Audit Reports", url: coa.url },
    text: "Each year's Statement of Comparison of Budget and Actual Amounts. The figures were checked line by line against the reports and match them to the centavo. The original reports can be downloaded from the page.",
  },
  {
    part: "Procurement Transparency",
    source: philgeps,
    text: "The government's procurement records for offices in Panabo City, shown as published. Each year's full records can be downloaded from the page.",
  },
  {
    part: "Emergency Hotlines",
    source: null,
    text: `Collected by the portal team${hotlinesUpdated ? `, last checked ${formatDate(hotlinesUpdated)}` : ""}.`,
  },
];

// What the people who build the portal promise
const COMMITMENTS = [
  {
    icon: BadgeCheck,
    title: "Official sources only",
    text: "Nothing is estimated, guessed or filled in. Every figure links to where it came from, and when a source leaves something out, the page says so.",
  },
  {
    icon: RefreshCw,
    title: "Keep it accurate",
    text: "We check the information against its sources, show when it was last checked, and fix mistakes as soon as we find them.",
  },
  {
    icon: Scale,
    title: "Neutral",
    text: "Records are shown as published, explained without spin. A procurement notice or an audit observation is a public record, not proof of wrongdoing.",
  },
  {
    icon: Smartphone,
    title: "For everyone",
    text: "Plain language instead of jargon, and pages that work well on any phone.",
  },
  {
    icon: ShieldCheck,
    title: "Respect your privacy",
    text: "No accounts and no personal information. Visits are counted with Vercel Web Analytics, which doesn't use cookies.",
  },
  {
    icon: Gift,
    title: "Free to use and reuse",
    text: `No sign-up and no fees, and the content is in the public domain (${site.license.short}).`,
  },
];

export default function AboutPage() {
  usePageMeta({
    title: "About",
    description: `About ${site.name}: its mission and objectives, where its information comes from, its commitments and license, and who runs it.`,
  });

  return (
    <Page>
      <PageHeader
        title="About"
        path="/about"
        intro={`${site.name}, the ${site.tagline}, puts public information about Panabo City in one place, in plain language: how to get city services done, who to call in an emergency, and how public money is planned and spent.`}
      />

      <Container>
        <Section title="Our mission">
          <p className="max-w-3xl rounded-card border border-line border-l-4 border-l-brand-600 bg-surface px-6 py-5 text-xl md:text-2xl font-semibold leading-snug tracking-tight text-balance">
            {MISSION}
          </p>
        </Section>

        <Section title="Why we built it">
          <div className="max-w-3xl space-y-3 leading-relaxed text-ink-soft">
            <p>
              Information about city services and public money is public, but it's scattered. Requirements and fees
              are in the Citizen's Charter, the budget is in audit reports hundreds of pages long, and procurement
              records are in quarterly spreadsheets on a national website. Much of it is written in technical or
              legal language.
            </p>
            <p>
              The portal gathers that official information in one place and explains it in plain language, so
              residents can prepare before going to a city office, understand how public money is used, and check the
              figures for themselves.
            </p>
          </div>
        </Section>

        <Section title="Our objectives">
          <ol className="max-w-3xl divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {OBJECTIVES.map((objective, i) => (
              <li key={objective.title} className="flex gap-4 px-5 py-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-1">
                  <p className="font-semibold">{objective.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{objective.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="What's on the portal">
          <ul className="grid gap-3 md:grid-cols-2">
            {SECTIONS.map((section) => (
              <li key={section.to}>
                <Link
                  to={section.to}
                  className="group flex h-full gap-4 rounded-card border border-line bg-surface p-5 hover:border-brand-300 transition-colors"
                >
                  <div className="grow">
                    <p className="font-semibold group-hover:text-brand-700 transition-colors">{section.title}</p>
                    <p className="mt-1 text-sm text-muted">{section.text}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-faint group-hover:text-brand-600 transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
          {liveTools.length > 0 && (
            <p className="mt-4 text-sm text-muted">
              Plus community tools, such as{" "}
              {liveTools.map((tool, i) => (
                <span key={tool.path}>
                  {i > 0 && (i === liveTools.length - 1 ? " and " : ", ")}
                  <a href={tool.path} target="_blank" rel="noopener noreferrer" className="link-quiet text-ink-soft">
                    {tool.title}
                  </a>
                </span>
              ))}
              , under Services in the menu.
            </p>
          )}
        </Section>

        <Section
          title="Where the information comes from"
          desc="Every page names its source and links to it, so you can check it yourself."
        >
          <dl className="divide-y divide-line rounded-card border border-line bg-surface">
            {SOURCES.map((row) => (
              <div key={row.part} className="grid gap-1 px-5 py-4 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-6">
                <dt className="font-semibold">{row.part}</dt>
                <dd className="text-sm text-muted">
                  {row.source && (
                    <a
                      href={row.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-1 inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
                    >
                      {row.source.name}
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                  <span className="block">{row.text}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Our commitments" desc="What the people who build the portal promise its users.">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMMITMENTS.map(({ icon: IconComponent, title, text }) => (
              <li key={title} className="rounded-card border border-line bg-surface p-5">
                <span className="grid h-9 w-9 place-items-center rounded-control bg-brand-50 text-brand-600">
                  <IconComponent size={18} />
                </span>
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="License">
          <div className="max-w-3xl space-y-3 rounded-card border border-line bg-surface p-5 md:p-6 text-sm leading-relaxed text-ink-soft">
            <p>
              This project is released under the{" "}
              <a
                href={site.license.url}
                target="_blank"
                rel="noopener noreferrer"
                title={site.license.name}
                className="link-quiet font-semibold text-ink"
              >
                Creative Commons {site.license.short}
              </a>{" "}
              dedication. This means the work is dedicated to the public domain and can be freely used by anyone for
              any purpose without restriction under copyright law.
            </p>
            <p>
              The guides, budget figures and procurement records come from government sources: the Citizen's Charter,
              the Commission on Audit and PhilGEPS. When you reuse them, please cite the original source shown on the
              page, so others can check it too.
            </p>
            <p>
              See the{" "}
              <Link to="/terms" className="link-quiet">
                Terms of Use
              </Link>{" "}
              for the full terms.
            </p>
          </div>
        </Section>

        <Section title="Who runs the portal">
          <div className="max-w-3xl space-y-3 rounded-card border border-line bg-surface p-5 md:p-6 text-sm leading-relaxed text-ink-soft">
            <p>
              The portal is an independent community project. It is{" "}
              <strong className="font-semibold text-ink">not an official website</strong> of the City Government of
              Panabo.
            </p>
            <p>
              The information here is for guidance only, and requirements and fees can change. For official
              transactions and announcements, contact the city office concerned or visit the{" "}
              <a href="https://panabocity.gov.ph/" target="_blank" rel="noopener noreferrer" className="link-quiet">
                Panabo City Official Website
              </a>
              .
            </p>
            {contactLink && (
              <p>
                Spotted a mistake? Let us know:{" "}
                <a
                  href={contactLink.href}
                  target={contactLink.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  {contactLink.label}
                </a>
              </p>
            )}
          </div>
        </Section>
      </Container>
    </Page>
  );
}
