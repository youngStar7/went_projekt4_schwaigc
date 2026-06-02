import { fetchPage } from "@/lib/sulu";
import PageContent from "@/components/PageContent";

export default async function HomePage() {
  const page = await fetchPage("/");

  if (!page) {
    return (
      <div className="not-found">
        <h1>Keine Startseite gefunden</h1>
        <p>Bitte eine Seite in Sulu als Startseite anlegen.</p>
      </div>
    );
  }

  return <PageContent page={page} />;
}
