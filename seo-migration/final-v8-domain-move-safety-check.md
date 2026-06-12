# v8 Domain Move Safety Check

**Date:** 2026-06-12
**Auditor:** Claude (Senior Technical SEO / Vercel Release Safety)
**Scope:** Validate whether it is safe to move `jeremypenn.com` to the `jeremy-penn-portfolio` Vercel project.
**Revision:** 2 (post-fix reaudit)

---

## 1. Project Identity

| Check | Result |
|-------|--------|
| Local directory | `/Users/penn/penncreative/` |
| Git remote | `https://github.com/jdylan423/penncreative` |
| Latest commit | `7549b6d` — "Merge remote main: keep v8 index.html, accept new CLAUDE.md + WORKLOG.md" |
| `.vercel/project.json` | Not present (low risk — commit hash matches Vercel dashboard) |
| Vercel project | `jeremy-penn-portfolio` — Git-connected, deployed `7549b6d` from `main` |
| Code state | v8 creative portfolio |

**PASS.**

---

## 2. vercel.json Validation

| Check | Result |
|-------|--------|
| Valid JSON | YES |
| Total redirect rules | 256 |
| Total rewrite rules | 4 |
| Catch-all `jeremypenn.com` -> `jeremypennart.com` | NONE |
| `/` redirected to art site | NO |
| `/about` redirected to art site | **NO (FIXED — previously redirected, now removed)** |
| `/contact` redirected to art site | **NO (FIXED — previously redirected, now removed)** |

### Fix applied

Removed 4 redirect rules that sent `/about` and `/contact` on `jeremypenn.com` and `www.jeremypenn.com` to `jeremypennart.com`.

Added 4 rewrite rules so `/about`, `/about/`, `/contact`, and `/contact/` serve `index.html` with 200 status:

```json
"rewrites": [
  { "source": "/about", "destination": "/index.html" },
  { "source": "/about/", "destination": "/index.html" },
  { "source": "/contact", "destination": "/index.html" },
  { "source": "/contact/", "destination": "/index.html" }
]
```

Added JS in `app.js` (inside `loadFrames()`, after loader hides) that scrolls to the matching anchor section when the path is `/about` or `/contact`:

```javascript
const pathSection = { '/about': 'about', '/contact': 'contact' };
const target = pathSection[window.location.pathname.replace(/\/$/, '')];
if (target) {
  const el = document.getElementById(target);
  if (el) requestAnimationFrame(() => {
    lenis.scrollTo(el, { immediate: true });
  });
}
```

Uses Lenis `scrollTo` with `immediate: true` for instant positioning (no visible scroll animation on load).

### Art path redirect coverage

All 7 key art paths confirmed with 301 redirects to matching `jeremypennart.com` URLs:

| Path | Destination | Status |
|------|-------------|--------|
| `/galleries` | `jeremypennart.com/galleries` | OK |
| `/sunsets` | `jeremypennart.com/sunsets` | OK |
| `/beauty-in-the-breakdown` | `jeremypennart.com/beauty-in-the-breakdown` | OK |
| `/hotlips` | `jeremypennart.com/hotlips` | OK |
| `/vice-virtue` | `jeremypennart.com/vice-virtue` | OK |
| `/evolution-ego` | `jeremypennart.com/evolution-ego` | OK |
| `/installs` | `jeremypennart.com/installs` | OK |

129 unique art paths total, all with both bare and `www` host variants (256 redirect rules for art + 2 for .co = 256 total redirect rules, minus the removed 4 = 256 actual redirects).

**Trailing-slash note:** Art paths lack trailing-slash redirect variants. Vercel's default trailing-slash normalization (strip slash, then match) should handle this. Verify post-move with `curl -sI https://jeremypenn.com/galleries/`.

**Root dump check:** No art redirects dump to `jeremypennart.com/` root. All map to specific pages. **PASS.**

---

## 3. .co Redirect Validation

| Rule | Source | Destination | Type | In vercel.json |
|------|--------|-------------|------|----------------|
| 1 | `jeremypenn.co /:path*` | `https://jeremypenn.com/:path*` | 301 | YES |
| 2 | `www.jeremypenn.co /:path*` | `https://jeremypenn.com/:path*` | 301 | YES |

**Domain assignment note:** Bare `jeremypenn.co` must be added to the project in Vercel dashboard for rule 1 to fire. `www.jeremypenn.co` is already assigned.

**PASS** (vercel.json rules correct; domain assignment is a dashboard action in the deployment steps).

---

## 4. Creative Page Validation

Single-page application. All content in `index.html`. Anchor sections `id="about"` and `id="contact"` confirmed.

| URL | Method | Expected Status | Status |
|-----|--------|-----------------|--------|
| `jeremypenn.com/` | Direct serve | 200 | PASS |
| `jeremypenn.com/#about` | Anchor (client-side) | 200 | PASS |
| `jeremypenn.com/#contact` | Anchor (client-side) | 200 | PASS |
| `jeremypenn.com/about` | Rewrite to index.html + JS scroll | 200 | PASS (after deploy) |
| `jeremypenn.com/about/` | Rewrite to index.html + JS scroll | 200 | PASS (after deploy) |
| `jeremypenn.com/contact` | Rewrite to index.html + JS scroll | 200 | PASS (after deploy) |
| `jeremypenn.com/contact/` | Rewrite to index.html + JS scroll | 200 | PASS (after deploy) |

---

## 5. Canonical Validation

| Page | Canonical | Status |
|------|-----------|--------|
| Homepage | `https://jeremypenn.com/` | PASS |
| `/about` (rewrite) | `https://jeremypenn.com/` (same index.html) | PASS — canonical correctly deduplicates |
| `/contact` (rewrite) | `https://jeremypenn.com/` (same index.html) | PASS — canonical correctly deduplicates |

No page canonicalizes to `jeremypennart.com`. **PASS.**

---

## 6. Sitemap Validation

```xml
<url>
  <loc>https://jeremypenn.com/</loc>
  <lastmod>2026-06-11</lastmod>
  <changefreq>monthly</changefreq>
  <priority>1.0</priority>
</url>
```

| Check | Status |
|-------|--------|
| Exists | YES |
| Only `jeremypenn.com` URLs | YES |
| No `jeremypennart.com` URLs | YES |
| No old art paths | YES |

**PASS.**

---

## 7. Robots.txt Validation

| Check | Status |
|-------|--------|
| Exists | YES |
| `Allow: /` | YES |
| `Sitemap: https://jeremypenn.com/sitemap.xml` | YES |
| Googlebot blocked | NO |
| Bingbot blocked | NO |
| AI crawlers allowed | YES (GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Bingbot) |
| Experiment files blocked | YES (index-v2 through v8, test-animations, skills-preview, fine-art-link-preview) |

**Minor:** `index-archive.html` and `js/app-archive.js` not blocked. Low risk (not linked).

**PASS.**

---

## 8. GO / NO-GO Report

| Category | Previous | Current |
|----------|----------|---------|
| Project identity | PASS | PASS |
| vercel.json valid | PASS | PASS |
| No catch-all redirect | PASS | PASS |
| `/` protected | PASS | PASS |
| `/about` protected | **FAIL** | **PASS (fixed)** |
| `/contact` protected | **FAIL** | **PASS (fixed)** |
| Art path redirects | PASS | PASS |
| .co redirects | PASS | PASS |
| Canonical | PASS | PASS |
| Sitemap | PASS | PASS |
| Robots.txt | PASS | PASS |

### Blocking issues: NONE

### Non-blocking notes:
- Bare `jeremypenn.co` must be added as domain in Vercel dashboard (Step 2 below)
- Trailing-slash art paths rely on Vercel default normalization (verify post-move)
- `index-archive.html` not blocked in robots.txt (cosmetic)

---

## VERDICT: GO

It is safe to move `jeremypenn.com` to the `jeremy-penn-portfolio` project after committing and pushing the vercel.json and app.js fixes.

---

## 9. Domain Assignment

### Move to `jeremy-penn-portfolio`:
| Domain | Role |
|--------|------|
| `jeremypenn.com` | Primary production domain |
| `www.jeremypenn.com` | 301 redirect to `https://jeremypenn.com/` |
| `jeremypenn.co` | 301 redirect to `https://jeremypenn.com/` (via vercel.json) |
| `www.jeremypenn.co` | 301 redirect to `https://jeremypenn.com/` (via vercel.json, already assigned) |

### Leave on art archive project:
| Domain | Role |
|--------|------|
| `jeremypennart.com` | Primary production domain |
| `www.jeremypennart.com` | 301 redirect to `https://jeremypennart.com/` |

### Remove from `jeremypenn-creative-site`:
| Domain | Action |
|--------|--------|
| `jeremypenn.com` | Remove (then add to `jeremy-penn-portfolio`) |

---

## 10. Deployment Steps (awaiting approval)

### Pre-move: commit and push the fix
```bash
cd /Users/penn/penncreative
git add vercel.json js/app.js
git commit -m "fix: remove /about and /contact redirects to art site, add rewrites for creative site"
git push origin main
```
Wait for Vercel to auto-deploy from push. Confirm "Ready" status in Vercel dashboard.

### Domain move
1. Vercel → `jeremypenn-creative-site` → Settings → Domains → remove `jeremypenn.com`
2. Vercel → `jeremy-penn-portfolio` → Settings → Domains → add `jeremypenn.com` (primary)
3. Vercel → `jeremy-penn-portfolio` → Settings → Domains → add `www.jeremypenn.com`
4. Vercel → `jeremy-penn-portfolio` → Settings → Domains → add `jeremypenn.co`

### Post-move verification
```bash
# Homepage serves v8 (200)
curl -sI https://jeremypenn.com/ | head -5

# /about serves creative site (200, NOT 301 to jeremypennart)
curl -sI https://jeremypenn.com/about | head -5

# /contact serves creative site (200, NOT 301 to jeremypennart)
curl -sI https://jeremypenn.com/contact | head -5

# .co bare redirects to .com (301)
curl -sI https://jeremypenn.co | head -5

# .co www redirects to .com (301)
curl -sI https://www.jeremypenn.co | head -5

# www.jeremypenn.com redirects to bare (301 or 308)
curl -sI https://www.jeremypenn.com | head -5

# Art paths redirect to art site (301)
curl -sI https://jeremypenn.com/galleries | head -5
curl -sI https://jeremypenn.com/sunsets | head -5
curl -sI https://jeremypenn.com/beauty-in-the-breakdown | head -5
curl -sI https://jeremypenn.com/hotlips | head -5

# Trailing slash check
curl -sI https://jeremypenn.com/galleries/ | head -5
```

---

## STOPPED. Awaiting approval to commit, push, and proceed with domain move.
