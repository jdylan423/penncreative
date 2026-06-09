import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const migrationDir = path.join(root, "migration");

const ART_OLD_BASE = process.env.ART_OLD_BASE || "https://www.jeremypenn.com";
const ART_NEW_BASE = process.env.ART_NEW_BASE || "https://jeremypennart.com";
const CREATIVE_OLD_BASE = process.env.CREATIVE_OLD_BASE || "https://www.jeremypenn.co";
const CREATIVE_NEW_BASE = process.env.CREATIVE_NEW_BASE || "https://jeremypenn.com";
const MAX_REDIRECT_HOPS = Number(process.env.MAX_REDIRECT_HOPS || 1);
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 12000);

const failures = [];

function parseCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  const lines = text.split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value);
  return values;
}

function withBase(originalUrl, oldBase, newBase) {
  const source = new URL(originalUrl);
  return new URL(`${source.pathname}${source.search}`, newBase).toString();
}

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: options.method || "GET",
      redirect: options.redirect || "manual",
      signal: controller.signal,
      headers: { "user-agent": "jeremypenn-seo-migration-validator/1.0" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function traceRedirects(url) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop < 8; hop += 1) {
    const response = await request(current, { method: "GET", redirect: "manual" });
    const location = response.headers.get("location");
    chain.push({ url: current, status: response.status, location });
    if (!location || response.status < 300 || response.status >= 400) return chain;
    current = new URL(location, current).toString();
  }
  return chain;
}

async function assertRedirect(oldUrl, expectedUrl, label) {
  const chain = await traceRedirects(oldUrl);
  const first = chain[0];
  const final = chain[chain.length - 1];
  const firstLocation = first.location ? new URL(first.location, first.url).toString() : "";
  if (![301, 308].includes(first.status)) {
    failures.push(`${label}: expected first response to be 301/308 for ${oldUrl}, got ${first.status}`);
  }
  if (firstLocation !== expectedUrl) {
    failures.push(`${label}: expected Location ${expectedUrl}, got ${firstLocation || "(none)"}`);
  }
  if (chain.length - 1 > MAX_REDIRECT_HOPS) {
    failures.push(`${label}: redirect chain exceeds ${MAX_REDIRECT_HOPS} hop(s): ${chain.map((item) => item.url).join(" -> ")}`);
  }
  return final;
}

async function assertFinal200(url, label) {
  const response = await request(url, { method: "GET", redirect: "manual" });
  if (response.status !== 200) {
    failures.push(`${label}: expected 200 for ${url}, got ${response.status}`);
    return "";
  }
  return await response.text();
}

function assertNoNoindex(html, url) {
  const robots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1] || "";
  if (/\bnoindex\b/i.test(robots)) {
    failures.push(`noindex found on production page: ${url}`);
  }
}

function assertCanonical(html, url, expectedOrigin) {
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || "";
  if (!canonical) {
    failures.push(`missing canonical tag: ${url}`);
    return;
  }
  if (!canonical.startsWith(expectedOrigin)) {
    failures.push(`canonical mismatch on ${url}: expected ${expectedOrigin}, got ${canonical}`);
  }
}

async function assertSitemap(origin, expectedOrigin) {
  const sitemapUrl = new URL("/sitemap.xml", origin).toString();
  const xml = await assertFinal200(sitemapUrl, "sitemap");
  for (const loc of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (!loc[1].startsWith(expectedOrigin)) {
      failures.push(`sitemap contains non-final URL: ${loc[1]}`);
    }
  }
}

const artRows = parseCsv(path.join(migrationDir, "jeremypenn-art-migration-map.csv"));
const creativeRows = parseCsv(path.join(migrationDir, "jeremypenn-co-migration-map.csv"));

for (const row of artRows) {
  if (row.notes.startsWith("Launch conflict")) continue;
  const oldUrl = withBase(row.old_url, "https://www.jeremypenn.com", ART_OLD_BASE);
  const expectedUrl = withBase(row.new_url, "https://jeremypennart.com", ART_NEW_BASE);
  await assertRedirect(oldUrl, expectedUrl, "art redirect");
  if (!new URL(expectedUrl).pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    const html = await assertFinal200(expectedUrl, "new art URL");
    if (html) {
      assertNoNoindex(html, expectedUrl);
      assertCanonical(html, expectedUrl, ART_NEW_BASE);
    }
  }
}

for (const row of creativeRows) {
  const oldUrl = withBase(row.old_url, "https://www.jeremypenn.co", CREATIVE_OLD_BASE);
  const expectedUrl = withBase(row.new_url, "https://jeremypenn.com", CREATIVE_NEW_BASE);
  await assertRedirect(oldUrl, expectedUrl, "creative redirect");
}

const creativeHome = await assertFinal200(new URL("/", CREATIVE_NEW_BASE).toString(), "creative home");
if (creativeHome) {
  assertNoNoindex(creativeHome, CREATIVE_NEW_BASE);
  assertCanonical(creativeHome, CREATIVE_NEW_BASE, CREATIVE_NEW_BASE);
  if (creativeHome.includes("jeremypenn.co")) {
    failures.push("creative home still contains jeremypenn.co");
  }
}

await assertSitemap(CREATIVE_NEW_BASE, CREATIVE_NEW_BASE);
await assertSitemap(ART_NEW_BASE, ART_NEW_BASE);

if (failures.length) {
  console.error(`SEO migration validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEO migration validation passed.");
