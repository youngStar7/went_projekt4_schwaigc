import type { SuluPage } from "@/lib/sulu";
import { resolveUrl, mediaUrl, formatPrice } from "@/lib/sulu";

interface Props {
  page: SuluPage;
}

export default function PageContent({ page }: Props) {
  const { content, template, extension } = page;

  const title = content?.title as string | undefined;
  const article = content?.article as string | undefined;
  const canonicalUrl = resolveUrl(content?.url);

  const description = content?.description;
  const price = formatPrice(content?.price);
  const image = mediaUrl(content?.image);
  const category = content?.category?.name;

  const seoTitle = extension?.seo?.title;
  const seoDescription = extension?.seo?.description;
  const excerpt = extension?.excerpt;

  return (
    <article>
      {/* SEO metadata block (visible in dev as a hint) */}
      {(seoTitle || seoDescription) && (
        <aside
          style={{
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "6px",
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            fontSize: "0.8rem",
            color: "#0369a1",
          }}
        >
          {seoTitle && <div><strong>SEO Titel:</strong> {seoTitle}</div>}
          {seoDescription && <div><strong>SEO Beschreibung:</strong> {seoDescription}</div>}
        </aside>
      )}

      {/* Excerpt teaser */}
      {excerpt?.title && excerpt.title !== title && (
        <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "1rem" }}>
          {excerpt.title}
        </p>
      )}
      {excerpt?.description && (
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          {excerpt.description}
        </p>
      )}

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

      {title && <h1 className="page-title">{title}</h1>}

      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={content?.image?.title ?? title ?? ""}
          style={{
            width: "100%",
            maxWidth: "480px",
            borderRadius: "8px",
            margin: "1rem 0",
            objectFit: "cover",
          }}
        />
      )}

      {price && (
        <p style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0.5rem 0" }}>
          {price}
        </p>
      )}

      {description && (
        <p style={{ fontSize: "1.05rem", color: "#444", marginBottom: "1rem" }}>
          {description}
        </p>
      )}

      {canonicalUrl && (
        <p style={{ fontSize: "0.8rem", color: "#999", marginBottom: "1rem" }}>
          URL: <code>{canonicalUrl}</code>
        </p>
      )}

      {article ? (
        <div
          className="page-article"
          dangerouslySetInnerHTML={{ __html: article }}
        />
      ) : (
        <p style={{ color: "#999" }}>
          Keine Inhalte für Template <code>{template}</code> gefunden.
        </p>
      )}
    </article>
  );
}
