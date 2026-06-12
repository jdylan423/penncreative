import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const migrationDir = path.join(root, "migration");
fs.mkdirSync(migrationDir, { recursive: true });

const ART_PATHS = [
  "/",
  "/galleries",
  "/installs",
  "/about",
  "/contact",
  "/sunsets",
  "/sunsets/september-sunset",
  "/sunsets/august-sunset",
  "/sunsets/july-sunset",
  "/sunsets/june-sunset",
  "/sunsets/may-sunset",
  "/sunsets/april-sunset",
  "/sunsets/march-sunset",
  "/beauty-in-the-breakdown",
  "/beauty-in-the-breakdown/into-abstraction-1",
  "/beauty-in-the-breakdown/into-abstraction-2",
  "/beauty-in-the-breakdown/street-poetry",
  "/beauty-in-the-breakdown/self-love",
  "/beauty-in-the-breakdown/love-in-color",
  "/beauty-in-the-breakdown/lift-the-clouds-of-the-past",
  "/beauty-in-the-breakdown/eyes-of-seduction",
  "/beauty-in-the-breakdown/fragments-2",
  "/beauty-in-the-breakdown/fragments-1",
  "/hotlips",
  "/hotlips/hot-lips-color-crash",
  "/hotlips/hot-lips-sunset",
  "/hotlips/hot-lips-excursion",
  "/hotlips/hot-lips-elevate",
  "/hotlips/hot-lips-drift",
  "/hotlips/hot-lips-je-t-aime",
  "/hotlips/hot-lips-double-vision",
  "/hotlips/hot-lips-wave",
  "/hotlips/hot-lips-chinatown-alley",
  "/vice-virtue",
  "/vice-and-virtue/vice",
  "/vice-and-virtue/paradise",
  "/vice-and-virtue/muse",
  "/vice-and-virtue/lust",
  "/vice-and-virtue/luscious",
  "/vice-and-virtue/love",
  "/vice-and-virtue/indulge",
  "/vice-and-virtue/halo",
  "/vice-and-virtue/goddess",
  "/vice-and-virtue/evol",
  "/vice-and-virtue/enlighten",
  "/vice-and-virtue/eden",
  "/vice-and-virtue/desire",
  "/evolution-ego",
  "/evolution-and-ego/prey",
  "/evolution-and-ego/power",
  "/evolution-and-ego/master",
  "/evolution-and-ego/hunt",
  "/evolution-and-ego/lust",
  "/evolution-and-ego/evolve",
  "/evolution-and-ego/gaze",
];

const ART_ASSET_PATHS = [
  "/images/about/Jeremy-Penn-2.jpg",
  "/images/beauty-in-the-breakdown/eyes-of-seduction.jpg",
  "/images/beauty-in-the-breakdown/fragments-2.jpg",
  "/images/beauty-in-the-breakdown/fragments.jpg",
  "/images/beauty-in-the-breakdown/into-abstraction-1.jpg",
  "/images/beauty-in-the-breakdown/into-abstraction-2.jpg",
  "/images/beauty-in-the-breakdown/lift-the-clouds.jpg",
  "/images/beauty-in-the-breakdown/love.jpg",
  "/images/beauty-in-the-breakdown/self-love.jpg",
  "/images/beauty-in-the-breakdown/street-poetry.jpg",
  "/images/evolution-and-ego/Evolve-Jeremy-Penn-Evolution-Painting-WebRes.jpg",
  "/images/evolution-and-ego/Gaze-Jeremy-Penn-Evolution-Painting-WebRes.jpg",
  "/images/evolution-and-ego/Master-JeremyPenn-Evolution-Painting-HighRes.jpg",
  "/images/evolution-and-ego/Power-Jeremy-Penn-Evolution-Painting-WebRes.jpg",
  "/images/evolution-and-ego/Prey-JeremyPenn-Evolution-Painting-HighRes.jpg",
  "/images/evolution-and-ego/image-asset-1.jpeg",
  "/images/evolution-and-ego/image-asset.jpeg",
  "/images/home/hero-new.jpg",
  "/images/hotlips/h-lips-1.jpg",
  "/images/hotlips/h-lips-10.jpg",
  "/images/hotlips/h-lips-2.jpg",
  "/images/hotlips/h-lips-3.jpg",
  "/images/hotlips/h-lips-4.jpg",
  "/images/hotlips/h-lips-8.jpg",
  "/images/hotlips/h-lips-9.jpg",
  "/images/hotlips/hl-1.jpg",
  "/images/hotlips/hot-lips-dimensions.jpg",
  "/images/installs/install-01.jpg",
  "/images/installs/install-02.jpg",
  "/images/installs/install-03.jpg",
  "/images/installs/install-04.jpg",
  "/images/installs/install-05.jpg",
  "/images/installs/install-06.jpg",
  "/images/installs/install-07.jpg",
  "/images/installs/install-08.jpg",
  "/images/installs/install-09.jpg",
  "/images/installs/install-10.jpg",
  "/images/installs/install-11.jpg",
  "/images/installs/install-12.jpg",
  "/images/installs/install-13.jpg",
  "/images/installs/install-14.jpg",
  "/images/installs/install-15.jpg",
  "/images/installs/install-16.jpg",
  "/images/installs/install-17.jpg",
  "/images/installs/install-18.jpg",
  "/images/installs/install-19.jpg",
  "/images/installs/install-20.jpg",
  "/images/installs/install-21.jpg",
  "/images/installs/install-22.jpg",
  "/images/installs/install-23.jpg",
  "/images/installs/install-24.jpg",
  "/images/installs/install-25.jpg",
  "/images/installs/install-26.jpg",
  "/images/installs/install-27.jpg",
  "/images/logo/penn-logo-black.png",
  "/images/sunsets/jeremy-penn-april-sunset.jpg",
  "/images/sunsets/jeremy-penn-august-sunset.jpg",
  "/images/sunsets/jeremy-penn-july-sunset.jpg",
  "/images/sunsets/jeremy-penn-june-sunset.jpg",
  "/images/sunsets/jeremy-penn-march-sunset.jpg",
  "/images/sunsets/jeremy-penn-may-sunset.jpg",
  "/images/sunsets/jeremy-penn-september-sunset.jpg",
  "/images/vice-and-virtue/desire-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/eden-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/enlighten-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/evole-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/goddess-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/halo-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/indulge-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/love-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/luscious-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/lust-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/muse-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/paradise-jeremy-penn-artist.jpg",
  "/images/vice-and-virtue/vice-jeremy-penn-artist.jpg",
];

const CREATIVE_PATHS = ["/", "/privacy.html", "/tos.html"];
const HIDDEN_CREATIVE_PATHS = [
  "/fine-art-link-preview.html",
  "/skills-preview.html",
  "/test-animations.html",
];

const quoteCsv = (value) => `"${String(value).replaceAll('"', '""')}"`;
const row = (values) => values.map(quoteCsv).join(",");
const url = (origin, pathname) => new URL(pathname, origin).toString();

const artRows = [
  row(["old_url", "new_url", "status", "notes"]),
  ...ART_PATHS.map((pathname) =>
    row([
      url("https://www.jeremypenn.com", pathname),
      url("https://jeremypennart.com", pathname),
      "301/308",
      pathname === "/"
        ? "Launch conflict: jeremypenn.com homepage cannot both redirect to art and serve the new creative homepage. Do not add a domain-wide .com to art redirect."
        : "Preserve path on jeremypennart.com.",
    ]),
  ),
  ...ART_ASSET_PATHS.map((pathname) =>
    row([
      url("https://www.jeremypenn.com", pathname),
      url("https://jeremypennart.com", pathname),
      "301/308",
      "Specific image redirect. Avoid a blanket /images redirect because the creative site also uses /images.",
    ]),
  ),
];
fs.writeFileSync(
  path.join(migrationDir, "jeremypenn-art-migration-map.csv"),
  `${artRows.join("\n")}\n`,
);

const creativeRows = [
  row(["old_url", "new_url", "status", "notes"]),
  ...CREATIVE_PATHS.map((pathname) =>
    row([
      url("https://www.jeremypenn.co", pathname),
      url("https://jeremypenn.com", pathname),
      "301/308",
      "Canonical creative URL on jeremypenn.com.",
    ]),
  ),
  ...HIDDEN_CREATIVE_PATHS.map((pathname) =>
    row([
      url("https://www.jeremypenn.co", pathname),
      url("https://jeremypenn.com", pathname),
      "301/308",
      "Legacy/hidden utility page found in static repo. Keep noindex or remove from production if not needed.",
    ]),
  ),
];
fs.writeFileSync(
  path.join(migrationDir, "jeremypenn-co-migration-map.csv"),
  `${creativeRows.join("\n")}\n`,
);

const hostRedirect = (host, source, destination) => ({
  source,
  has: [{ type: "host", value: host }],
  destination,
  permanent: true,
});

const redirects = [
  hostRedirect("jeremypenn.co", "/:path*", "https://jeremypenn.com/:path*"),
  hostRedirect("www.jeremypenn.co", "/:path*", "https://jeremypenn.com/:path*"),
];

for (const pathname of ART_PATHS.filter((value) => value !== "/")) {
  redirects.push(
    hostRedirect("jeremypenn.com", pathname, `https://jeremypennart.com${pathname}`),
    hostRedirect("www.jeremypenn.com", pathname, `https://jeremypennart.com${pathname}`),
  );
}

for (const pathname of ART_ASSET_PATHS) {
  redirects.push(
    hostRedirect("jeremypenn.com", pathname, `https://jeremypennart.com${pathname}`),
    hostRedirect("www.jeremypenn.com", pathname, `https://jeremypennart.com${pathname}`),
  );
}

fs.writeFileSync(
  path.join(root, "vercel.json"),
  `${JSON.stringify({ redirects }, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(root, "robots.txt"),
  [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://jeremypenn.com/sitemap.xml",
    "",
  ].join("\n"),
);

fs.writeFileSync(
  path.join(root, "sitemap.xml"),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    "    <loc>https://jeremypenn.com/</loc>",
    "    <changefreq>monthly</changefreq>",
    "    <priority>1.0</priority>",
    "  </url>",
    "</urlset>",
    "",
  ].join("\n"),
);

console.log("Generated SEO migration assets:");
console.log("- migration/jeremypenn-art-migration-map.csv");
console.log("- migration/jeremypenn-co-migration-map.csv");
console.log("- vercel.json");
console.log("- robots.txt");
console.log("- sitemap.xml");
