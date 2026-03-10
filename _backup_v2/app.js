/* ═══════════════════════════════════════════════════════════
   Jeremy Penn — Portfolio
   Scroll-driven canvas hero + site interactions
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  const FIRST_FRAME = 1;
  const LAST_FRAME = 313;
  const TOTAL_FRAMES = LAST_FRAME - FIRST_FRAME + 1; // 313
  const PHASE1_COUNT = 25;
  const FRAME_PATH = (num) =>
    `frames/snow-monkey_${String(num).padStart(4, '0')}.png`;

  /* ── DOM ─────────────────────────────────────────────────── */
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const heroScroll = document.getElementById('hero-scroll');
  const whitewash = document.getElementById('whitewash');
  const scrollCue = document.getElementById('scroll-cue');
  const heroText = document.getElementById('hero-text');
  const heroGradient = document.getElementById('hero-gradient');
  const transitionHL = document.getElementById('transition-headline');
  const navEl = document.getElementById('nav');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const subtitleEls = document.querySelectorAll('.subtitle');

  /* ── STATE ──────────────────────────────────────────────── */
  const frames = new Array(TOTAL_FRAMES).fill(null);
  let currentFrameIndex = 0;
  let currentSub = 0;
  let isMobile = window.innerWidth < 768;

  /* ═══════════════════════════════════════════════════════════
     LENIS SMOOTH SCROLL
     ═══════════════════════════════════════════════════════════ */
  const lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ═══════════════════════════════════════════════════════════
     FRAME LOADER
     ═══════════════════════════════════════════════════════════ */
  function loadFrame(num) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = FRAME_PATH(num);
    });
  }

  async function loadFrames() {
    // Phase 1
    const p1End = Math.min(FIRST_FRAME + PHASE1_COUNT - 1, LAST_FRAME);
    for (let i = FIRST_FRAME; i <= p1End; i++) {
      const img = await loadFrame(i);
      frames[i - FIRST_FRAME] = img;
      loaderBar.style.width = `${((i - FIRST_FRAME + 1) / PHASE1_COUNT) * 100}%`;
    }

    // Draw first frame + hide loader
    if (frames[0]) renderFrame(frames[0]);
    loader.classList.add('hidden');
    initScrollSystem();

    // Phase 2 — background load remaining
    for (let i = FIRST_FRAME + PHASE1_COUNT; i <= LAST_FRAME; i++) {
      const img = await loadFrame(i);
      frames[i - FIRST_FRAME] = img;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CANVAS RENDERER — Always in frame
     Desktop: right-aligned cover
     Mobile: center-aligned contain (monkey always visible)
     ═══════════════════════════════════════════════════════════ */
  let lastCanvasW = 0;
  let lastCanvasH = 0;

  function renderFrame(img) {
    if (!img) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    if (W !== lastCanvasW || H !== lastCanvasH) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      lastCanvasW = W;
      lastCanvasH = H;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fill background to prevent gaps
    ctx.fillStyle = '#e8e6e2';
    ctx.fillRect(0, 0, W, H);

    const imgR = img.naturalWidth / img.naturalHeight;
    const canvasR = W / H;
    let dw, dh, dx, dy;

    if (isMobile) {
      // MOBILE: cover mode, center-aligned (subject always centered)
      if (imgR > canvasR) {
        dh = H;
        dw = H * imgR;
        dx = (W - dw) / 2; // center horizontally
        dy = 0;
      } else {
        dw = W;
        dh = W / imgR;
        dx = 0;
        dy = (H - dh) / 2; // center vertically
      }
    } else {
      // DESKTOP: cover mode, right-aligned
      if (imgR > canvasR) {
        dh = H;
        dw = H * imgR;
        dx = W - dw; // right edge flush
        dy = 0;
      } else {
        dw = W;
        dh = W / imgR;
        dx = 0;
        dy = (H - dh) / 2;
      }
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ═══════════════════════════════════════════════════════════
     HERO SCROLL SYSTEM
     ═══════════════════════════════════════════════════════════ */
  function initScrollSystem() {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: heroScroll,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.15, // very responsive
      onUpdate(self) {
        const p = self.progress;

        // ── Frame advance ──
        const idx = Math.min(
          Math.round(p * (TOTAL_FRAMES - 1)),
          TOTAL_FRAMES - 1
        );
        if (idx !== currentFrameIndex && frames[idx]) {
          currentFrameIndex = idx;
          renderFrame(frames[idx]);
        }

        // ── Hero text + gradient fade (0% → 70% progress) ──
        const heroFade = Math.max(0, 1 - p * 2.5);
        heroText.style.opacity = heroFade;
        heroGradient.style.opacity = heroFade;

        // ── Scroll cue — disappears immediately ──
        scrollCue.style.opacity = Math.max(0, 1 - p * 15);

        // ── Canvas to white: starts at 60%, complete at 85% ──
        const fadeStart = 0.60;
        const fadeEnd = 0.85;
        const canvasFade = Math.max(0, Math.min(1, (p - fadeStart) / (fadeEnd - fadeStart)));
        whitewash.style.opacity = canvasFade;
        canvas.style.opacity = 1 - canvasFade;

        // ── "Concept to Culture" headline ──
        // Appears from 70% to 95%, peaks at 80%-85%
        let hlOpacity = 0;
        if (p >= 0.70 && p <= 0.95) {
          if (p <= 0.80) {
            hlOpacity = (p - 0.70) / 0.10; // fade in
          } else if (p <= 0.88) {
            hlOpacity = 1; // hold
          } else {
            hlOpacity = 1 - (p - 0.88) / 0.07; // fade out
          }
        }
        transitionHL.style.opacity = Math.max(0, Math.min(1, hlOpacity));

        // ── Nav solid state ──
        navEl.classList.toggle('nav--solid', p > 0.02);

        // ── Subtitle cycling (no pause — purely scrub-driven) ──
        updateSubtitle(p);
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SUBTITLE — scrub-driven, no pause
     ═══════════════════════════════════════════════════════════ */
  function updateSubtitle(p) {
    // Cycle through subtitles at 15%, 30%, 45% progress
    const thresholds = [0.15, 0.30, 0.45];
    let target = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (p >= thresholds[i]) target = i + 1;
    }
    target = Math.min(target, subtitleEls.length - 1);

    if (target !== currentSub) {
      // Immediate swap with CSS transition
      subtitleEls[currentSub].classList.remove('is-active');
      subtitleEls[currentSub].style.opacity = '0';

      subtitleEls[target].classList.add('is-active');
      gsap.fromTo(
        subtitleEls[target],
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );

      currentSub = target;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════════════════════════ */
  function initNav() {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('is-active');
      mobileOverlay.classList.toggle('open');
      document.body.style.overflow = mobileOverlay.classList.contains('open')
        ? 'hidden'
        : '';
    });

    mobileOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-active');
        mobileOverlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Smooth scroll nav links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const el = document.querySelector(link.getAttribute('href'));
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el, { offset: -80 });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SECTION REVEAL ANIMATIONS
     ═══════════════════════════════════════════════════════════ */
  function initReveals() {
    const sections = document.querySelectorAll(
      '.about, .trusted-by, .project, .process'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ═══════════════════════════════════════════════════════════
     SELECTED WORKS EXPAND / COLLAPSE
     ═══════════════════════════════════════════════════════════ */
  function initWorks() {
    document.querySelectorAll('.project-header').forEach((header) => {
      header.addEventListener('click', () => {
        const project = header.closest('.project');
        const body = project.querySelector('.project-body');
        const isOpen = project.classList.contains('is-open');

        // Close others
        document.querySelectorAll('.project.is-open').forEach((p) => {
          if (p !== project) closeProject(p);
        });

        if (isOpen) {
          closeProject(project);
        } else {
          openProject(project, body);
        }
      });
    });
  }

  function openProject(project, body) {
    project.classList.add('is-open');
    const inner = body.querySelector('.project-body__inner');
    const h = inner.offsetHeight;
    gsap.fromTo(body, { height: 0, opacity: 0 }, {
      height: h,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      onComplete() { body.style.height = 'auto'; },
    });
    const label = project.querySelector('.project-toggle__label');
    if (label) label.textContent = 'Close';
  }

  function closeProject(project) {
    const body = project.querySelector('.project-body');
    const h = body.offsetHeight;
    gsap.fromTo(body, { height: h, opacity: 1 }, {
      height: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.in',
      onComplete() { project.classList.remove('is-open'); },
    });
    const label = project.querySelector('.project-toggle__label');
    if (label) label.textContent = 'View Case Study';
  }

  /* ═══════════════════════════════════════════════════════════
     LOGO MARQUEE
     ═══════════════════════════════════════════════════════════ */
  function initMarquee() {
    const r1 = document.querySelector('.marquee-row--1 .marquee-inner');
    const r2 = document.querySelector('.marquee-row--2 .marquee-inner');
    if (r1) gsap.to(r1, { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
    if (r2) {
      gsap.set(r2, { xPercent: -50 });
      gsap.to(r2, { xPercent: 0, duration: 32, ease: 'none', repeat: -1 });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     RESIZE
     ═══════════════════════════════════════════════════════════ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      isMobile = window.innerWidth < 768;
      lastCanvasW = 0; // force re-render
      if (frames[currentFrameIndex]) renderFrame(frames[currentFrameIndex]);
    }, 80);
  });

  /* ═══════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════ */
  function init() {
    initNav();
    loadFrames();
    initReveals();
    initWorks();
    initMarquee();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
