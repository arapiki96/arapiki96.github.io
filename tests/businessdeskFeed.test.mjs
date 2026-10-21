import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getThomasManchStories, parseStories } from "../src/lib/businessdeskFeed.ts";
import { formatDate } from "../src/lib/dateUtils.ts";

// Reduced from the live author page on 21 October 2026, retaining its data shape.
const fixture = readFileSync(new URL("./fixtures/businessdesk-author.html", import.meta.url), "utf8");
const page = (items) => `<script>Fusion.globalContent = ${JSON.stringify(items)};Fusion.globalContentConfig={};</script>`;
const story = (overrides = {}) => ({
  contentType: "story",
  headline: "A reporting headline",
  displayDate: "2026-10-20T16:00:00Z",
  websiteUrl: "/infrastructure/example/ABC/",
  authors: [{ name: "Thomas Manch", slug: "thomas-manch" }],
  ...overrides,
});

test("reads the current publisher format and excludes recommendations by other authors", () => {
  const stories = parseStories(fixture);
  assert.equal(stories.length, 3);
  assert.equal(stories[0].title, "Counter-drone system won't provide full protection");
  assert.equal(stories[0].pubDate, "2026-10-20T16:00:00Z");
  assert.match(stories[0].link, /^https:\/\/www\.businessdesk\.co\.nz\/infrastructure\//);
  assert.equal(parseStories(fixture, 2).length, 2);
});

test("deduplicates links, keeps coauthored work and sorts before applying the limit", () => {
  const stories = parseStories(page([
    story({ displayDate: "2026-10-18T16:00:00Z", websiteUrl: "https://businessdesk.co.nz/older/" }),
    story({ websiteUrl: "https://businessdesk.co.nz/newer/?ref=author#story", authors: [{ name: "Someone Else" }, { slug: "thomas-manch" }] }),
    story({ websiteUrl: "https://www.businessdesk.co.nz/newer/" }),
  ]));
  assert.deepEqual(stories.map((s) => s.link), [
    "https://www.businessdesk.co.nz/newer/",
    "https://www.businessdesk.co.nz/older/",
  ]);
  assert.equal(parseStories(page([
    story({ displayDate: "2026-10-18T16:00:00Z", websiteUrl: "/older/" }),
    story({ websiteUrl: "/newer/" }),
  ]), 1)[0].link, "https://www.businessdesk.co.nz/newer/");
});

test("handles punctuation and escaped quotes without executing publisher scripts", () => {
  const title = 'An array ]; and a quote " ;Fusion.globalContent= [ in a headline';
  const html = page([story({ headline: title })]) + '<script>throw new Error("must not execute")</script>';
  assert.equal(parseStories(html)[0].title, title);
});

test("skips malformed records, invalid dates, unrelated authors and unsafe URLs", () => {
  const invalid = [null, {}, story({ headline: " " }), story({ displayDate: "invalid" }),
    story({ contentType: "advertisement" }), story({ authors: [{ name: "Another Writer" }] }),
    ...["", "javascript:alert(1)", "http://businessdesk.co.nz/article/", "https://businessdesk.co.nz.evil.test/article/",
      "https://www.businessdesk.co.nz@evil.test/article/", "//evil.test/article/", "https://businessdesk.co.nz:8443/article/",
      "https://user:password@businessdesk.co.nz/article/"].map((websiteUrl) => story({ websiteUrl }))];
  assert.equal(parseStories(page([...invalid, story()])).length, 1);
  assert.throws(() => parseStories(page(invalid)), /no valid Thomas Manch stories/);
});

test("falls back to publishDate and singular author metadata", () => {
  const stories = parseStories(page([story({ displayDate: undefined, publishDate: "2026-10-20T16:00:00Z", authors: undefined, author: { slug: "thomas-manch" } })]));
  assert.equal(stories[0].pubDate, "2026-10-20T16:00:00Z");
});

test("missing, changed, malformed or empty data fails instead of publishing an empty feed", () => {
  for (const html of ["<html>Unavailable</html>", page([]), "<script>Fusion.globalContent={};</script>",
    "<script>Fusion.globalContent=[broken];</script>", "<script>Fusion.globalContent=[</script>"]) {
    assert.throws(() => parseStories(html), /BusinessDesk/);
  }
});

test("rejects invalid story limits", () => {
  for (const limit of [0, -1, 1.5, NaN]) assert.throws(() => parseStories(fixture, limit), /positive integer/);
});

test("retries a transient publisher failure and returns valid stories", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => ++calls === 1
    ? new Response("Unavailable", { status: 503 })
    : new Response(fixture));
  assert.equal((await getThomasManchStories()).length, 3);
  assert.equal(calls, 2);
});

test("propagates collection failure after retry so the build cannot replace the live feed", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("<html>Changed layout</html>"));
  await assert.rejects(getThomasManchStories(), /missing its structured story data/);
});

test("publication dates use New Zealand time even when the build runs in UTC", () => {
  assert.equal(formatDate("2026-10-20T16:00:00Z"), "21 Oct 2026");
  assert.equal(formatDate("2026-07-01T16:00:00Z"), "2 Jul 2026");
});
