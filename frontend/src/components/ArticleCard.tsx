import type { SuluArticleItem } from "@/lib/sulu";
import { resolveUrl, mediaUrl, formatPrice } from "@/lib/sulu";

interface Props {
  article: SuluArticleItem;
}

export default function ArticleCard({ article }: Props) {
  const { content } = article;
  const title = content?.title ?? "Untitled";
  const url = resolveUrl(content?.url);
  const description = content?.description;
  const price = formatPrice(content?.price);
  const image = mediaUrl(content?.image);
  const category = content?.category?.name;

  return (
    <article
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={content?.image?.title ?? title}
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            background: "#f3f4f6",
          }}
        />
      )}

      <div
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          flex: 1,
        }}
      >
        {category && (
          <span
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6b7280",
            }}
          >
            {category}
          </span>
        )}

        <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>
          {url ? <a href={url}>{title}</a> : title}
        </h2>

        {description && (
          <p style={{ color: "#555", fontSize: "0.95rem" }}>{description}</p>
        )}

        {price && (
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>
            {price}
          </p>
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
            Details →
          </a>
        )}
      </div>
    </article>
  );
}
