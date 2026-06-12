# WORKLOG — Jeremy Penn Portfolio

Reverse-chronological log of changes made to this site.

---

## 2026-05-13 — Project audit & context setup

**What:** Initial audit of the codebase. No code changes made.

**Files inspected:** `index.html`, `css/style.css`, `js/app.js`, `.claude/launch.json`, `.gitignore`, all asset directories.

**Created:** `CLAUDE.md` (persistent project context), `WORKLOG.md` (this file).

**Findings / notes:**
- Pure static site — HTML/CSS/JS, no build system, no npm.
- Deployed to Vercel on every push to `main`.
- Hero uses a 312-frame WebP scroll-driven animation (snow monkey) on a fixed canvas with GSAP ScrollTrigger.
- Smooth scroll via Lenis. Marquee via GSAP infinite loop.
- Contact form via Formspree (fetch API, stays on page after submit — fixed in prior commit).
- Meta canonical tag points to `https://jeremypenn.com/` (not `.co`) — possible inconsistency to revisit.
- `_backup_v1/` and `_backup_v2/` folders are present in repo but not served as pages.

---

## Prior commits (from git log)

| Date | Commit | Description |
|------|--------|-------------|
| 2026 | `4952730` | Fix contact form UX: keep users on site after submission (fetch instead of Formspree redirect) |
| 2026 | `5c0d8b6` | Initial commit — Jeremy Penn portfolio site |
| 2026 | `9112325` | Initial commit |
