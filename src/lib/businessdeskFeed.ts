import * as cheerio from "cheerio";

const AUTHOR_URL = "https://businessdesk.co.nz/journalist/thomas-manch?page=1";

export interface Story {
  title: string;
  link: string;
  pubDate: string;
}

/**
 * Fetches the author page HTML with timeout and abort support.
 */
async function fetchAuthorPage(): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(AUTHOR_URL, {
      headers: { "User-Agent": "ThomasManch-PersonalSite/1.0" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Author page fetch failed: ${res.status} ${res.statusText}`);
    }

    return await res.text();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: BusinessDesk took too long to respond");
    }
    throw error;
  }
}

/**
 * Parses stories from the author page HTML using cheerio.
 * Handles both h2 (featured) and h4 (regular) card layouts.
 */
function parseStories(html: string, limit: number): Story[] {
  const $ = cheerio.load(html);
  const entries: Story[] = [];

  $(".card-title a").each((_i, el) => {
    if (entries.length >= limit) return false;

    const $el = $(el);
    const link = $el.attr("href") ?? "";
    const title = $el.text().trim();

    // Find the associated date by traversing up to the card container
    const card = $el.closest(".card-body, .card-content, .news-card");
    const pubDate = card.find(".news-date").first().text().trim();

    // Security: Only accept businessdesk.co.nz links
    if (link && title && link.startsWith("https://businessdesk.co.nz/")) {
      entries.push({ title, link, pubDate });
    }
  });

  return entries;
}

/**
 * Fetches and parses Thomas Manch's recent stories from BusinessDesk.
 * Retries once on failure before throwing.
 * @param limit - Maximum number of stories to return (default: 10)
 */
export async function getThomasManchStories(limit = 10): Promise<Story[]> {
  try {
    const html = await fetchAuthorPage();
    return parseStories(html, limit);
  } catch (firstError) {
    // Single retry after a short delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const html = await fetchAuthorPage();
      return parseStories(html, limit);
    } catch {
      // Throw the original error for clearer diagnostics
      throw firstError;
    }
  }
}
