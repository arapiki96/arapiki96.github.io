import * as cheerio from "cheerio";

export const AUTHOR_URL = "https://www.businessdesk.co.nz/author/thomas-manch/";

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

    if (!res.ok) {
      throw new Error(`Author page fetch failed: ${res.status} ${res.statusText}`);
    }

    return await res.text();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: BusinessDesk took too long to respond");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Read the JSON array assigned by Arc Publishing without executing page scripts.
 * Track strings and nesting so punctuation inside headlines cannot end the array.
 */
function readStoryData(html: string): unknown[] {
  const $ = cheerio.load(html);
  for (const script of $("script").toArray()) {
    const text = $(script).text();
    const marker = /\bFusion\.globalContent\s*=\s*/.exec(text);
    if (!marker) continue;
    const start = marker.index + marker[0].length;
    if (text[start] !== "[") break;

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < text.length; i++) {
      const char = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
      } else if (char === '"') {
        inString = true;
      } else if (char === "[") {
        depth++;
      } else if (char === "]" && --depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          throw new Error("BusinessDesk story data is not valid JSON");
        }
      }
    }
    break;
  }
  throw new Error("BusinessDesk author page is missing its structured story data");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** The author page also includes recommendations by other writers. */
export function parseStories(html: string, limit = 10): Story[] {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Story limit must be a positive integer");
  }
  const entries = new Map<string, Story>();
  for (const item of readStoryData(html)) {
    if (!isRecord(item) || item.contentType !== "story") continue;
    const authors = Array.isArray(item.authors) ? item.authors : [item.author];
    if (!authors.some((author) => isRecord(author) && (
      author.slug === "thomas-manch" ||
      (typeof author.name === "string" && author.name.trim().toLowerCase() === "thomas manch")
    ))) continue;

    const title = typeof item.headline === "string" ? item.headline.trim() : "";
    const pubDate = item.displayDate ?? item.publishDate;
    if (!title || typeof pubDate !== "string" || !Number.isFinite(Date.parse(pubDate))) continue;
    if (typeof item.websiteUrl !== "string" || !item.websiteUrl.trim()) continue;

    let url: URL;
    try {
      url = new URL(item.websiteUrl, AUTHOR_URL);
    } catch {
      continue;
    }
    if (url.protocol !== "https:" || url.port || url.username || url.password ||
      !["businessdesk.co.nz", "www.businessdesk.co.nz"].includes(url.hostname)) continue;
    url.hostname = "www.businessdesk.co.nz";
    url.search = "";
    url.hash = "";
    const link = url.href;
    if (!entries.has(link)) entries.set(link, { title, link, pubDate });
  }

  const stories = [...entries.values()]
    .sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate))
    .slice(0, limit);
  if (!stories.length) {
    throw new Error("BusinessDesk returned no valid Thomas Manch stories; keeping the existing deployment");
  }
  return stories;
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
