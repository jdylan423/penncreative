# Jeremy Penn SEO Migration Launch Checklist

## Current Audit

- Creative repo found at `/Users/penn/penncreative`.
- Creative framework: static HTML/CSS/JS, no package/build step required.
- Current creative hosting assumption: Vercel static deployment. `https://jeremypenn.co/` and `https://www.jeremypenn.co/` are served by Vercel.
- Current art hosting assumption: Vercel static deployment. `https://jeremypenn.com/` redirects to `https://www.jeremypenn.com/`.
- Art routing: static extensionless paths; 55 HTML routes found in `https://www.jeremypenn.com/sitemap.xml`.
- Art sitemap: `https://www.jeremypenn.com/sitemap.xml`, currently using `https://www.jeremypenn.com`.
- Art robots: `https://www.jeremypenn.com/robots.txt`, currently allows crawling and points to the `.com` sitemap.
- Art canonical logic: static per-page canonical tags currently point to `https://www.jeremypenn.com/...`.
- Creative canonical logic: static tags already point to `https://jeremypenn.com/...`.
- Creative sitemap/robots were missing and have been added.
- Redirect config was missing and has been added in `vercel.json`.

## Critical SEO Decisions

- Do not use Google Search Console Change of Address for `jeremypenn.com` to `jeremypennart.com` while `jeremypenn.com` remains active as the creative site.
- Google Search Console Change of Address is appropriate for `jeremypenn.co` to `jeremypenn.com` after all `.co` URLs 301/308 directly to `.com`, both properties are verified, and `.com` canonical/sitemap signals are live.
- `https://jeremypenn.com/` is a launch conflict: it cannot both redirect to the art homepage and serve the new creative homepage. This plan preserves the creative homepage on `.com` and redirects all indexed art subpaths plus known art image URLs.
- Avoid a blanket `/images/:path*` redirect on `.com` because the creative site also uses `/images`. Only known art image paths are redirected.

## DNS and Hosting

- Add `jeremypennart.com` and `www.jeremypennart.com` to the art-site hosting project.
- Add `jeremypenn.com`, `www.jeremypenn.com`, `jeremypenn.co`, and `www.jeremypenn.co` to the creative-site hosting project when ready to launch the creative site on `.com`.
- Set `jeremypennart.com` apex DNS to the host-required A/ALIAS/CNAME target.
- Set `www.jeremypennart.com` CNAME to the host-required target.
- Set `jeremypenn.com` and `www.jeremypenn.com` DNS to the creative hosting project.
- Keep `jeremypenn.co` and `www.jeremypenn.co` DNS on the creative hosting project until Google has processed the move.
- Verify SSL certificates are active for all apex and `www` hostnames before enabling redirects.

## Art Site Production Changes

- Deploy the current art site to `jeremypennart.com`.
- Update canonical base URL from `https://www.jeremypenn.com` to `https://jeremypennart.com`.
- Update `og:url`, structured data `url`, and image absolute URLs where applicable.
- Update sitemap URLs to `https://jeremypennart.com`.
- Update robots sitemap line to `Sitemap: https://jeremypennart.com/sitemap.xml`.
- Ensure production art pages do not have `noindex`.
- Keep internal art links relative or on `https://jeremypennart.com`.

## Creative Site Production Changes

- Confirm creative canonicals remain `https://jeremypenn.com`.
- Submit `https://jeremypenn.com/sitemap.xml`.
- Keep privacy and terms pages `noindex` unless they should rank.
- Confirm no `jeremypenn.co` canonicals remain.
- Confirm the fine-art footer link points to `https://jeremypennart.com`.

## Search Console

- Verify domain properties or URL-prefix properties for:
  - `jeremypenn.com`
  - `jeremypennart.com`
  - `jeremypenn.co`
- Submit `https://jeremypennart.com/sitemap.xml`.
- Submit `https://jeremypenn.com/sitemap.xml`.
- Use Change of Address only for `jeremypenn.co` to `jeremypenn.com`.
- Do not use Change of Address for `jeremypenn.com` to `jeremypennart.com`.

## Launch Validation Commands

```bash
cd /Users/penn/penncreative
node scripts/validate-seo-migration.mjs
```

For staging or preview domains:

```bash
ART_OLD_BASE=https://www.jeremypenn.com \
ART_NEW_BASE=https://staging.jeremypennart.com \
CREATIVE_OLD_BASE=https://www.jeremypenn.co \
CREATIVE_NEW_BASE=https://staging.jeremypenn.com \
node scripts/validate-seo-migration.mjs
```

Spot checks:

```bash
curl -I https://www.jeremypenn.com/sunsets/september-sunset
curl -I https://www.jeremypenn.com/images/sunsets/jeremy-penn-september-sunset.jpg
curl -I https://www.jeremypenn.co/
curl -s https://jeremypennart.com/sitemap.xml | grep jeremypennart.com
curl -s https://jeremypenn.com/ | grep -i canonical
```

## Rollback Plan

- Keep the previous art Vercel deployment available.
- Keep the previous creative `.co` deployment available until `.com` launch is validated.
- If art redirects misfire, remove only the art path/image redirects from `vercel.json` and redeploy the creative project.
- If `.co -> .com` migration misfires, remove only the `.co` host redirects from `vercel.json` and redeploy.
- Do not delete old art assets until image redirects or equivalent image URLs are confirmed.
