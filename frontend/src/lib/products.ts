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
  details?: string;
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

const BESTSELLER_TITLES = new Set([
  'Stuhl Hans', 'Couchtisch Rund', 'Sofa Lune', 'Sideboard Flach',
  'Bett Holz', 'Bücherregal Stave', 'Polstersessel Berg',
]);

const NEU_TITLES = new Set([
  'Essstuhl Clara', 'Beistelltisch Trio', 'Gartentisch Loft',
  'Sofa Arco', 'Daybed Zen', 'Vitrine Glas', 'Anrichte Bianco',
  'Hausbar Kuba', 'Bett Nora', 'Kinderbett Wald', 'Wandregal Schreib',
  'Bürostuhl Ergo',
]);

/** Extract the URL slug from a Sulu content.url like "/produkte/bett-nora" → "bett-nora" */
function slugFromUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? null;
}

function articleToProduct(a: SuluArticleItem): Product {
  const catName = (a.content.category as { name?: string } | null | undefined)?.name ?? '';
  const title = a.content.title ?? 'Produkt';
  const tag = BESTSELLER_TITLES.has(title) ? 'Bestseller' : NEU_TITLES.has(title) ? 'Neu' : '';
  const slug = slugFromUrl(a.content.url) ?? a.id;
  return {
    id: slug,
    name: title,
    cat: catName,
    price: Number(a.content.price ?? 0),
    tag,
    c: CATEGORY_COLORS[catName] ?? '#9a9080',
    desc: (a.content.description as string | undefined) ?? '',
    image: a.content.image ? mediaUrl(a.content.image) : null,
  };
}

function pageToProduct(p: SuluPage): Product {
  const catName = (p.content.category as { name?: string } | null | undefined)?.name ?? '';
  const title = p.content.title ?? 'Produkt';
  const tag = BESTSELLER_TITLES.has(title) ? 'Bestseller' : NEU_TITLES.has(title) ? 'Neu' : '';
  const slug = slugFromUrl(p.content.url) ?? p.id;
  return {
    id: slug,
    name: title,
    cat: catName,
    price: Number(p.content.price ?? 0),
    tag,
    c: CATEGORY_COLORS[catName] ?? '#9a9080',
    desc: (p.content.description as string | undefined) ?? '',
    image: p.content.image ? mediaUrl(p.content.image) : null,
    details: (p.content.article as string | undefined) ?? undefined,
  };
}

const TAG_ORDER: Record<string, number> = { Bestseller: 0, Neu: 1, '': 2 };

export async function getProducts(locale = 'de', page = 1, limit = 20): Promise<Product[]> {
  try {
    const data = await fetchArticles(locale, page, limit);
    const products = data._embedded.articles.map(articleToProduct);
    return products.sort((a, b) => (TAG_ORDER[a.tag] ?? 2) - (TAG_ORDER[b.tag] ?? 2));
  } catch {
    return [];
  }
}

export async function getBestsellers(locale = 'de'): Promise<Product[]> {
  const all = await getProducts(locale, 1, 100);
  return all.filter(p => p.tag === 'Bestseller').slice(0, 8);
}

export async function getProductById(slug: string, locale = 'de'): Promise<Product | null> {
  try {
    const page = await fetchPage(`/produkte/${slug}`, locale);
    if (!page) return null;
    return pageToProduct(page);
  } catch {
    return null;
  }
}
