import { notFound } from "next/navigation";
import { fetchPage } from "@/lib/sulu";
import PageContent from "@/components/PageContent";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  const page = await fetchPage(path);

  if (!page) return {};

  const title = page.content?.title as string | undefined;
  return { title: title ?? "Seite" };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const path = "/" + slug.join("/");

  const page = await fetchPage(path);
  if (!page) notFound();

  return <PageContent page={page} />;
}
