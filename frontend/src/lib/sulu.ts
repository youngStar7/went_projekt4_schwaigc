const API_URL = process.env.SULU_API_URL ?? "http://localhost:8000";
const DEFAULT_LOCALE = process.env.SULU_DEFAULT_LOCALE ?? "en";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SuluSeo {
  title?: string;
  description?: string;
  keywords?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  hideInSitemap?: boolean;
}

export interface SuluExcerpt {
  title?: string;
  description?: string;
  more?: string;
  tags?: string[];
  categories?: number[];
}

export interface SuluExtension {
  seo?: SuluSeo;
  excerpt?: SuluExcerpt;
}

/** Full page / article response from the Sulu Headless Bundle */
export interface SuluPage {
  id: string;
  type: string;
  template: string;
  content: {
    title?: string;
    article?: string;
    url?: string;
    [key: string]: unknown;
  };
  view: Record<string, unknown>;
  extension?: SuluExtension;
  authored?: string;
  changed?: string;
  created?: string;
}

/** Article list item returned by GET /api/articles */
export interface SuluArticleItem {
  id: string;
  type: string;
  template: string;
  content: {
    title?: string;
    url?: string;
  };
}

/** Navigation item from GET /api/navigations/{context} */
export interface SuluNavItem {
  id: string;
  uuid: string;
  title: string;
  url: string;
  template: string;
  children: SuluNavItem[];
}

/** Paginated article list response */
export interface SuluArticleList {
  _embedded: { articles: SuluArticleItem[] };
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Throw if the response is not JSON (guards against Sulu returning HTML error pages). */
function assertJson(res: Response): void {
  const ct = res.headers.get("Content-Type") ?? "";
  if (!ct.includes("application/json") && !ct.includes("application/ld+json")) {
    throw new Error(
      `Sulu returned non-JSON response (${ct}) for ${res.url} – status ${res.status}`
    );
  }
}

/** Resolve a Sulu url field to a path string. */
export function resolveUrl(url: string | undefined | null): string | null {
  return url ?? null;
}

// ─── Page content ─────────────────────────────────────────────────────────────

/**
 * Fetch any Sulu page or article by its URL path.
 * Uses ?_format=json to trigger the HeadlessWebsiteController.
 */
export async function fetchPage(
  path: string,
  locale: string = DEFAULT_LOCALE
): Promise<SuluPage | null> {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_URL}${normalised}?_format=json`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Sulu API error ${res.status} for path: ${path}`);
  }

  assertJson(res);
  return res.json() as Promise<SuluPage>;
}

// ─── Articles ─────────────────────────────────────────────────────────────────

/**
 * Fetch paginated article list from the custom /api/articles endpoint.
 */
export async function fetchArticles(
  locale: string = DEFAULT_LOCALE,
  page = 1,
  limit = 20
): Promise<SuluArticleList> {
  const url = `${API_URL}/api/articles?locale=${locale}&page=${page}&limit=${limit}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.status}`);
  }

  assertJson(res);
  return res.json() as Promise<SuluArticleList>;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

/**
 * Fetch a Sulu navigation context.
 * The context key "main" is defined in webspaces/website.xml.
 */
export async function fetchNavigation(
  context = "main",
  locale: string = DEFAULT_LOCALE,
  depth = 3
): Promise<SuluNavItem[]> {
  const url = `${API_URL}/api/navigations/${context}?locale=${locale}&depth=${depth}&flat=false`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error(`Navigation fetch failed: ${res.status}`);
    return [];
  }

  if (!res.headers.get("Content-Type")?.includes("application/json")) {
    console.error("Navigation returned non-JSON response");
    return [];
  }

  const data = await res.json();
  return (data?._embedded?.items ?? []) as SuluNavItem[];
}

// ─── Snippet areas ────────────────────────────────────────────────────────────

export async function fetchSnippetArea(
  area: string,
  locale: string = DEFAULT_LOCALE
): Promise<Record<string, unknown> | null> {
  const url = `${API_URL}/api/snippet-areas/${area}?locale=${locale}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return (data?.content as Record<string, unknown>) ?? null;
}
