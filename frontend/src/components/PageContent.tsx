import type { SuluPage } from "@/lib/sulu";

interface Props {
  page: SuluPage;
}

export default function PageContent({ page }: Props) {
  const { content, template } = page;
  const title = content?.title as string | undefined;
  const article = content?.article as string | undefined;

  return (
    <article>
      {title && <h1 className="page-title">{title}</h1>}

      {article ? (
        // Sulu text_editor fields return HTML – render as-is
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
