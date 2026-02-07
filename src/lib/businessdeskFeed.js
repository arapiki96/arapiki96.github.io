import { XMLParser } from "fast-xml-parser";

const FEED_URL = "https://businessdesk.co.nz/feed";
const BYLINE = "Thomas Manch";

function getCreatorString(creator) {
  if (typeof creator === "string") return creator;
  if (creator && typeof creator === "object") {
    if (typeof creator["#text"] === "string") return creator["#text"];
    if (typeof creator["$text"] === "string") return creator["$text"];
  }
  return "";
}

export async function getThomasManchStories(limit = 10) {
  const res = await fetch(FEED_URL, {
    headers: { "User-Agent": "GitHubActions-Astro" },
  });

  if (!res.ok) {
    throw new Error(`RSS fetch failed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: false,
  });

  const data = parser.parse(xml);
  const items = data?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];

  return list
    .filter((it) => getCreatorString(it["dc:creator"]).trim() === BYLINE)
    .filter((it) => typeof it.link === "string" && it.link.includes("/article/"))
    .filter((it) => !it.link.includes("/sponsored/") && !it.link.includes("/the-quiz/"))
    .slice(0, limit)
    .map((it) => ({
      title: it.title,
      link: it.link,
      pubDate: it.pubDate,
    }));
}
