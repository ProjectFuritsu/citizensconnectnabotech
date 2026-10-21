import { FileQuestionMark } from "lucide-react";
import { ButtonLink } from "../../Components/Controls";
import { Container } from "../../Components/Page";
import { usePageMeta } from "../../SEO/usePageMeta";

// "Not found" for any address the site doesn't have, and for a guide that
// doesn't exist (GuidePage passes its own wording)
export default function NotFoundPage({
  title = "Page not found",
  text = "The page you're looking for may have been moved or removed.",
  back = { to: "/", label: "Go to the home page" },
}) {
  usePageMeta({ title, noindex: true });

  return (
    <div className="bg-canvas font-sans text-ink">
      <Container className="py-24 flex flex-col items-center text-center">
        <FileQuestionMark size={40} className="text-subtle" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-sm text-muted">{text}</p>
        <div className="mt-6">
          <ButtonLink to={back.to}>{back.label}</ButtonLink>
        </div>
      </Container>
    </div>
  );
}
