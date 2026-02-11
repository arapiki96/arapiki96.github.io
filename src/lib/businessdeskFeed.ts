const AUTHOR_URL = "https://businessdesk.co.nz/journalist/thomas-manch?page=1";

export interface Story {
  title: string;
  link: string;
  pubDate: string;
}

/**
 * Decodes HTML entities in text
 */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Cleans up whitespace and decodes entities in text
 */
function cleanText(text: string): string {
  return decodeEntities(text.replace(/\s+/g, " ").trim());
}

/**
 * Fetches and parses Thomas Manch's recent stories from BusinessDesk
 * @param limit - Maximum number of stories to return (default: 10)
 * @returns Array of story objects with title, link, and publication date
 * @throws Error if the fetch fails or times out
 */
export async function getThomasManchStories(limit = 10): Promise<Story[]> {
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

    const html = await res.text();
    const entries: Story[] = [];
    const regex =
      /<h2 class="card-title[^"]*">[\s\S]*?<a href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<span class="news-date[^"]*">([\s\S]*?)<\/span>/g;

    let match;
    while ((match = regex.exec(html)) && entries.length < limit) {
      const link = match[1];
      const title = cleanText(match[2]);
      const pubDate = cleanText(match[3]);
      if (link && title) {
        entries.push({ title, link, pubDate });
      }
    }

    return entries;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout: BusinessDesk took too long to respond');
    }
    throw error;
  }
}
