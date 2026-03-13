interface NavDataPoint {
  date: string;
  nav: number;
}

interface MfApiSearchResult {
  schemeCode: number;
  schemeName: string;
}

interface MfApiNavResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
  };
  data: Array<{ date: string; nav: string }>;
}

const MFAPI_BASE = "https://api.mfapi.in/mf";
const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function pickBestMatch(results: MfApiSearchResult[]): MfApiSearchResult | null {
  if (!results?.length) return null;
  const directGrowth = results.find(
    (r) =>
      /direct/i.test(r.schemeName) &&
      /growth/i.test(r.schemeName) &&
      !/idcw|dividend|bonus|fof/i.test(r.schemeName)
  );
  const growth = results.find(
    (r) =>
      /growth/i.test(r.schemeName) &&
      !/idcw|dividend|bonus|fof/i.test(r.schemeName)
  );
  return directGrowth ?? growth ?? results[0] ?? null;
}

// Build a list of progressively shorter / simpler queries to try
function buildSearchQueries(fundName: string, amcName?: string): string[] {
  const clean = (s: string) =>
    s
      .replace(/\(.*?\)/g, "")
      .replace(/- direct plan/gi, "")
      .replace(/- growth/gi, "")
      .replace(/direct plan/gi, "")
      .replace(/direct/gi, "")
      .replace(/growth/gi, "")
      .replace(/fund/gi, "")
      .replace(/[-–]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const base = clean(fundName);
  const words = base.split(" ").filter(Boolean);

  const queries: string[] = [];

  // Try: full cleaned name
  if (words.length > 0) queries.push(words.join(" "));
  // Try: first 4 words
  if (words.length > 4) queries.push(words.slice(0, 4).join(" "));
  // Try: first 3 words
  if (words.length > 3) queries.push(words.slice(0, 3).join(" "));
  // Try: first 2 words
  if (words.length > 2) queries.push(words.slice(0, 2).join(" "));
  // Try: AMC name if provided
  if (amcName) {
    const amcClean = clean(amcName);
    const amcWords = amcClean.split(" ").slice(0, 2).join(" ");
    if (amcWords) queries.push(amcWords);
  }

  return [...new Set(queries)]; // deduplicate
}

async function searchSchemeCode(fundName: string, amcName?: string): Promise<{ schemeCode: number; matchedName: string } | null> {
  const queries = buildSearchQueries(fundName, amcName);

  for (const query of queries) {
    try {
      const encoded = encodeURIComponent(query);
      const res = await fetchWithTimeout(`${MFAPI_BASE}/search?q=${encoded}`);
      if (!res.ok) continue;

      const results: MfApiSearchResult[] = await res.json();
      const best = pickBestMatch(results);
      if (best) {
        return { schemeCode: best.schemeCode, matchedName: best.schemeName };
      }
    } catch {
      // try next query
    }
  }

  return null;
}

function parseNavDate(raw: string): Date {
  const [day, month, year] = raw.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function downsampleMonthly(
  data: Array<{ date: string; nav: string }>
): NavDataPoint[] {
  if (!data?.length) return [];

  const sorted = [...data].sort(
    (a, b) =>
      parseNavDate(a.date).getTime() - parseNavDate(b.date).getTime()
  );

  const monthlyMap = new Map<string, NavDataPoint>();
  for (const point of sorted) {
    const d = parseNavDate(point.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const navVal = parseFloat(point.nav);
    if (!isNaN(navVal)) {
      monthlyMap.set(key, {
        date: d.toISOString().split("T")[0],
        nav: Math.round(navVal * 100) / 100,
      });
    }
  }

  const points = Array.from(monthlyMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Keep last 120 months (10 years) maximum
  return points.length <= 120 ? points : points.slice(points.length - 120);
}

export async function enrichFundWithNavData(fund: Record<string, unknown>): Promise<Record<string, unknown>> {
  const fundName = fund.name as string;
  const amcName = fund.amcName as string | undefined;

  try {
    const match = await searchSchemeCode(fundName, amcName);

    if (!match) {
      console.warn(`[NAV] No scheme match found for: "${fundName}"`);
      return { ...fund, schemeCode: null, navHistory: [] };
    }

    console.log(`[NAV] "${fundName}" → matched "${match.matchedName}" (${match.schemeCode})`);

    const res = await fetchWithTimeout(`${MFAPI_BASE}/${match.schemeCode}`);
    if (!res.ok) {
      console.warn(`[NAV] NAV fetch failed (HTTP ${res.status}) for scheme ${match.schemeCode}`);
      return { ...fund, schemeCode: match.schemeCode, navHistory: [] };
    }

    const navResponse: MfApiNavResponse = await res.json();
    const navHistory = downsampleMonthly(navResponse.data ?? []);

    console.log(`[NAV] "${fundName}" → ${navHistory.length} monthly data points`);
    return { ...fund, schemeCode: match.schemeCode, navHistory };
  } catch (err) {
    console.warn(`[NAV] Enrichment error for "${fundName}":`, err);
    return { ...fund, schemeCode: null, navHistory: [] };
  }
}
