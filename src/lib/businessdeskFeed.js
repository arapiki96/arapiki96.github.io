const AUTHOR_URL = "https://businessdesk.co.nz/journalist/thomas-manch?page=1";

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(text) {
  return decodeEntities(text.replace(/\s+/g, " ").trim());
}

export async function getThomasManchStories(limit = 10) {
  const res = await fetch(AUTHOR_URL, {
    headers: { "User-Agent": "GitHubActions-Astro" },
  });

  if (!res.ok) {
    throw new Error(`Author page fetch failed: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const entries = [];
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
}
