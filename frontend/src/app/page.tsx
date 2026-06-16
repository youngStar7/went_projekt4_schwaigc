import { fetchPage, fetchNavigation } from "@/lib/sulu";
import PageContent from "@/components/PageContent";
import type { SuluNavItem } from "@/lib/sulu";

interface LinkTile {
  href: string;
  title: string;
  description?: string;
}

export default async function HomePage() {
  const [page, navItems] = await Promise.all([
    fetchPage("/"),
    fetchNavigation("main", "en"),
  ]);

  // Bestehende Sulu-Unterseiten (Startseite "/" selbst ausgeblendet).
  const cmsTiles: LinkTile[] = flattenNav(navItems).filter(
    (tile) => tile.href !== "/"
  );

  // Feste Next-Routen, die nicht aus der Sulu-Navigation kommen.
  const routeTiles: LinkTile[] = [
    {
      href: "/articles",
      title: "Produkte",
      description: "Alle Produkte in der Listenansicht",
    },
  ];

  const tiles = [...routeTiles, ...cmsTiles];

  return (
    <>
      {page ? (
        <PageContent page={page} />
      ) : (
        <div className="not-found">
          <h1>Keine Startseite gefunden</h1>
          <p>Bitte eine Seite in Sulu als Startseite anlegen.</p>
        </div>
      )}

      {tiles.length > 0 && (
        <section style={{ marginTop: "3rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "1.25rem" }}>
            Unterseiten
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {tiles.map((tile) => (
              <a
                key={tile.href}
                href={tile.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "1.1rem 1.25rem",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>
                  {tile.title} →
                </span>
                {tile.description && (
                  <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {tile.description}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** Top-level navigation items plus their direct children, flattened to link tiles. */
function flattenNav(items: SuluNavItem[]): LinkTile[] {
  const tiles: LinkTile[] = [];
  for (const item of items) {
    tiles.push({ href: item.url, title: item.title });
    for (const child of item.children ?? []) {
      tiles.push({ href: child.url, title: child.title });
    }
  }
  return tiles;
}
