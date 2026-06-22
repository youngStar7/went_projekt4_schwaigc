import { fetchArticles, fetchPage, mediaUrl, type SuluArticleItem, type SuluPage } from './sulu';

export interface Product {
  id: string;
  name: string;
  cat: string;
  price: number;
  tag: string;
  c: string;
  desc: string;
  dims?: string;
  mat?: string;
  clrs?: string[];
  image?: string | null;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Stühle: '#c8c0b0',
  Tische: '#a08868',
  Sofas: '#b8b0a8',
  Schränke: '#706050',
  Betten: '#c0b098',
  Regale: '#a89880',
};

export const CATEGORIES = [
  { name: 'Stühle', color: '#c8c0b0', count: 7 },
  { name: 'Tische', color: '#a08868', count: 6 },
  { name: 'Sofas', color: '#b8b0a8', count: 5 },
  { name: 'Schränke', color: '#706050', count: 6 },
  { name: 'Betten', color: '#c0b098', count: 5 },
  { name: 'Regale', color: '#a89880', count: 6 },
];

function articleToProduct(a: SuluArticleItem): Product {
  const catName = (a.content.category as { name?: string } | null | undefined)?.name ?? '';
  return {
    id: a.id,
    name: a.content.title ?? 'Produkt',
    cat: catName,
    price: Number(a.content.price ?? 0),
    tag: '',
    c: CATEGORY_COLORS[catName] ?? '#9a9080',
    desc: (a.content.description as string | undefined) ?? '',
    image: a.content.image ? mediaUrl(a.content.image) : null,
  };
}

function pageToProduct(p: SuluPage): Product {
  const catName = (p.content.category as { name?: string } | null | undefined)?.name ?? '';
  return {
    id: p.id,
    name: p.content.title ?? 'Produkt',
    cat: catName,
    price: Number(p.content.price ?? 0),
    tag: '',
    c: CATEGORY_COLORS[catName] ?? '#9a9080',
    desc: (p.content.description as string | undefined) ?? '',
    image: p.content.image ? mediaUrl(p.content.image) : null,
  };
}

export async function getProducts(locale = 'de', page = 1, limit = 20): Promise<Product[]> {
  try {
    const data = await fetchArticles(locale, page, limit);
    return data._embedded.articles.map(articleToProduct);
  } catch {
    return [];
  }
}

export async function getProductById(id: string, locale = 'de'): Promise<Product | null> {
  try {
    const page = await fetchPage(`/api/articles/${id}`, locale);
    if (!page) return null;
    return pageToProduct(page);
  } catch {
    return null;
  }
}
