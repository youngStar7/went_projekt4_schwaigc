const API_URL = process.env.SULU_API_URL ?? "http://localhost:8000";
const DEFAULT_LOCALE = process.env.SULU_DEFAULT_LOCALE ?? "en";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SuluPage {
  id: string;
  type: "page" | "article";
  template: string;
  content: Record<string, unknown>;
  view: Record<string, unknown>;
  _embedded?: Record<string, unknown>;
}

export interface SuluNavItem {
  id: string;
  title: string;
  url: string;
  nodeType: number;
  children: SuluNavItem[];
}

// ─── Page content ─────────────────────────────────────────────────────────────

/**
 * Fetch any Sulu page by its URL path.
 * Sulu Headless returns JSON when the Accept header is application/json.
 */
export async function fetchPage(
  path: string,
  locale: string = DEFAULT_LOCALE
): Promise<SuluPage | null> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}?_format=json`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
    // revalidate every 60 seconds in production
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Sulu API error ${res.status} for path: ${path}`);
  }

  return res.json() as Promise<SuluPage>;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

/**
 * Fetch a Sulu navigation context.
 * Default context key "main" is defined in webspaces/website.xml.
 */
export async function fetchNavigation(
  context: string = "main",
  locale: string = DEFAULT_LOCALE,
  depth: number = 3
): Promise<SuluNavItem[]> {
  const url = `${API_URL}/api/navigations/${context}?locale=${locale}&depth=${depth}&flat=false`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error(`Failed to fetch navigation: ${res.status}`);
    return [];
  }

  const data = await res.json();
  // Sulu returns { _embedded: { items: [...] } }
  return (data?._embedded?.items ?? data) as SuluNavItem[];
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
  return data?.content ?? null;
}
