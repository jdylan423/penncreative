/* ═══════════════════════════════════════════════════════════
   Jeremy Penn — Portfolio
   Scroll-driven canvas hero + site interactions
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  const FIRST_FRAME = 2;
  const LAST_FRAME = 313;
  const TOTAL_FRAMES = LAST_FRAME - FIRST_FRAME + 1; // 312
  const PHASE1_COUNT = 25;
  const FRAME_PATH = (num) =>
    `frames/snow-monkey_${String(num).padStart(4, '0')}.webp`;

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
  const aboutHeading = document.getElementById('about-heading');
  const transitionText = transitionHL.querySelector('.transition-headline__text');

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

        // ── Scroll cue — visible until 50%, fades out by 60% (before CONCEPT TO CULTURE) ──
        let cueOpacity = 1;
        if (p > 0.50) {
          cueOpacity = Math.max(0, 1 - (p - 0.50) / 0.10);
        }
        scrollCue.style.opacity = cueOpacity;

        // ── Canvas to white: starts at 60%, complete at 85% ──
        const fadeStart = 0.60;
        const fadeEnd = 0.85;
        const canvasFade = Math.max(0, Math.min(1, (p - fadeStart) / (fadeEnd - fadeStart)));
        whitewash.style.opacity = canvasFade;
        canvas.style.opacity = 1 - canvasFade;

        // ── "Concept to Culture" headline → settles down into about heading ──
        let hlOpacity = 0;
        if (p >= 0.70) {
          if (p <= 0.80) {
            // Fade in
            hlOpacity = (p - 0.70) / 0.10;
            transitionText.style.transform = '';
          } else if (p <= 0.88) {
            // Hold centered
            hlOpacity = 1;
            transitionText.style.transform = '';
          } else if (p <= 0.98) {
            // Morph: scale down slightly, drift downward, fade out
            const morphP = (p - 0.88) / 0.10;
            const t = morphP * morphP * (3 - 2 * morphP); // smoothstep

            const scale = 1 - (0.35 * t); // 1.0 → 0.65
            const moveY = 12 * t;          // drift downward (positive = down)
            const moveX = isMobile ? 0 : (-10 * t); // subtle left drift

            hlOpacity = 1 - t; // fade out as it settles

            transitionText.style.transform =
              `translate(${moveX}vw, ${moveY}vh) scale(${scale})`;
          } else {
            // Fully hidden — about heading takes over naturally
            hlOpacity = 0;
            transitionText.style.transform = '';
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
    const thresholds = [0.10, 0.20, 0.30, 0.40];
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
      '.about, .trusted-by, .project, .process, .contact'
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

  // Close buttons inside expanded case studies
  document.querySelectorAll('.project-close-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const project = btn.closest('.project');
      if (project && project.classList.contains('is-open')) {
        closeProject(project);
        // Scroll back to the project header
        setTimeout(() => {
          lenis.scrollTo(project, { offset: -100 });
        }, 100);
      }
    });
  });

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
     LIGHTBOX
     ═══════════════════════════════════════════════════════════ */
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lbImg = lightbox.querySelector('.lightbox__img');
    const lbCaption = lightbox.querySelector('.lightbox__caption-text');
    const btnClose = lightbox.querySelector('.lightbox__close');
    const btnPrev = lightbox.querySelector('.lightbox__arrow--prev');
    const btnNext = lightbox.querySelector('.lightbox__arrow--next');

    let currentGallery = [];
    let currentIndex = 0;

    // Attach click handlers to all gallery images
    document.querySelectorAll('.work-gallery img').forEach((img) => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        // Gather all images in this gallery
        const gallery = img.closest('.work-gallery');
        currentGallery = Array.from(gallery.querySelectorAll('img'));
        currentIndex = currentGallery.indexOf(img);
        openLightbox();
      });
    });

    function openLightbox() {
      showImage(currentIndex);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function showImage(idx) {
      const img = currentGallery[idx];
      if (!img) return;
      // Brief fade for image swap
      lbImg.style.opacity = '0';
      lbImg.style.transform = 'scale(0.96)';
      setTimeout(() => {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCaption.textContent = img.dataset.caption || '';
        // Force reflow
        lbImg.offsetHeight;
        lbImg.style.opacity = '1';
        lbImg.style.transform = 'scale(1)';
      }, 150);
      // Hide/show arrows based on position
      btnPrev.style.display = idx === 0 ? 'none' : 'flex';
      btnNext.style.display = idx === currentGallery.length - 1 ? 'none' : 'flex';
    }

    btnClose.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__backdrop').addEventListener('click', closeLightbox);

    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex > 0) {
        currentIndex--;
        showImage(currentIndex);
      }
    });

    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex < currentGallery.length - 1) {
        currentIndex++;
        showImage(currentIndex);
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        currentIndex--;
        showImage(currentIndex);
      }
      if (e.key === 'ArrowRight' && currentIndex < currentGallery.length - 1) {
        currentIndex++;
        showImage(currentIndex);
      }
    });
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
    initLightbox();
    initMarquee();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
