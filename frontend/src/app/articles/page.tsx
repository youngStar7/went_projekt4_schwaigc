import { fetchArticles } from "@/lib/sulu";
import ArticleCard from "@/components/ArticleCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Produkte" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam ?? 1));

  let data;
  try {
    data = await fetchArticles("en", currentPage, 20);
  } catch {
    return (
      <div className="error-box">
        <strong>Produkte konnten nicht geladen werden.</strong>
        <p>Stelle sicher, dass das Sulu-Backend läuft und Produkte veröffentlicht sind.</p>
      </div>
    );
  }

  const articles = data._embedded.articles;

  return (
    <section>
      <h1 className="page-title">Produkte</h1>

      {articles.length === 0 ? (
        <p style={{ color: "#999" }}>
          Noch keine Produkte vorhanden. Erstelle Produkte im Sulu-Admin und veröffentliche sie.
        </p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
              marginTop: "1.5rem",
            }}
          >
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <nav
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                marginTop: "2.5rem",
              }}
            >
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/articles?page=${p}`}
                  style={{
                    padding: "0.4rem 0.9rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    background: p === currentPage ? "#1a1a1a" : "#fff",
                    color: p === currentPage ? "#fff" : "#1a1a1a",
                    fontWeight: p === currentPage ? 600 : 400,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                  }}
                >
                  {p}
                </a>
              ))}
            </nav>
          )}

          <p
            style={{
              textAlign: "center",
              marginTop: "1rem",
              fontSize: "0.875rem",
              color: "#999",
            }}
          >
            {data.total} Produkte gesamt
          </p>
        </>
      )}
    </section>
  );
}
