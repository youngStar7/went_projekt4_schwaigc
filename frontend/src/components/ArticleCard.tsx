import type { SuluArticleItem } from "@/lib/sulu";
import { resolveUrl } from "@/lib/sulu";

interface Props {
  article: SuluArticleItem;
}

export default function ArticleCard({ article }: Props) {
  const title = article.content?.title ?? "Untitled";
  const url = resolveUrl(article.content?.url);
  const excerpt = (article as unknown as { content: { excerpt?: string } })
    .content?.excerpt;

  return (
    <article
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>
        {url ? <a href={url}>{title}</a> : title}
      </h2>

      {excerpt && (
        <p style={{ color: "#555", fontSize: "0.95rem" }}>{excerpt}</p>
      )}

      {url && (
        <a
          href={url}
          style={{
            marginTop: "auto",
            fontSize: "0.875rem",
            color: "#0070f3",
          }}
        >
          Weiterlesen →
        </a>
      )}
    </article>
  );
}
