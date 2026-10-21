import { Phone } from "lucide-react";
import Icon from "../../Components/Icon";
import { Container, Page, PageHeader } from "../../Components/Page";
import { Section } from "../../Components/Section";
import { hotlineGroups, hotlinesUpdated } from "../../Services/SiteService";
import { formatDate } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";

// Kept deliberately light so it loads fast: numbers come from
// src/Data/Site/hotlines.json, grouped by their "category"
export default function HotlinesPage() {
  usePageMeta({
    title: "Emergency Hotlines",
    description: "Police, fire, rescue and other emergency numbers for Panabo City. Tap a number to call.",
  });

  return (
    <Page>
      <PageHeader
        title="Emergency Hotlines"
        path="/hotlines"
        intro="Tap a number to call. Save the ones you need before an emergency happens."
        note={hotlinesUpdated && `Numbers last checked ${formatDate(hotlinesUpdated)}`}
      />

      <Container>
        {hotlineGroups.map((group) => (
          <Section
            key={group.label}
            title={group.label}
            icon={
              <Icon
                name={group.icon}
                className={`h-5 w-5 ${group.id === "emergency" ? "text-danger" : "text-subtle"}`}
              />
            }
          >
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((hotline) => (
                <li key={hotline.name}>
                  <a
                    href={hotline.tel}
                    className="group flex h-full items-center justify-between gap-4 rounded-card border border-line bg-surface p-5 hover:border-danger hover:bg-danger-soft transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{hotline.name}</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight group-hover:text-danger-strong transition-colors">
                        {hotline.number}
                      </p>
                      {hotline.description && <p className="mt-1 text-sm text-muted">{hotline.description}</p>}
                    </div>
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-canvas text-muted group-hover:bg-danger group-hover:text-white transition-colors"
                    >
                      <Phone size={18} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        ))}
      </Container>
    </Page>
  );
}
