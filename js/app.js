/* ═══════════════════════════════════════════════════════════
   Jeremy Penn — Portfolio
   Scroll-driven canvas hero + site interactions
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  // Scene: monkey-12fps (129 frames, 0001–0129)
  // Previous scene archived at: scroll-scenes/monkey-v1/
  const FIRST_FRAME = 1;
  const LAST_FRAME = 129;
  const TOTAL_FRAMES = LAST_FRAME - FIRST_FRAME + 1; // 129
  const PHASE1_COUNT = 20;
  const FRAME_PATH = (num) =>
    `scroll-scenes/monkey-12fps/snow-monkey_${String(num).padStart(4, '0')}.webp`;

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
  // Handoff flag — once concept-reveal takes over #transition-headline, hero stops touching it
  let hlOwnedByConceptReveal = false;

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

    // /about and /contact rewrites serve index.html — scroll to matching section
    const pathSection = { '/about': 'about', '/contact': 'contact' };
    const target = pathSection[window.location.pathname.replace(/\/$/, '')];
    if (target) {
      const el = document.getElementById(target);
      if (el) requestAnimationFrame(() => {
        lenis.scrollTo(el, { immediate: true });
      });
    }

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

        // ── Canvas fade: starts 60%, complete at 78% — finishes before
        //    .site-content scrolls into view at ~80%, so no visible
        //    "black slate" edge slides over the canvas. ──
        const fadeStart = 0.60;
        const fadeEnd = 0.78;
        const canvasFade = Math.max(0, Math.min(1, (p - fadeStart) / (fadeEnd - fadeStart)));
        whitewash.style.opacity = canvasFade;
        canvas.style.opacity = 1 - canvasFade;

        // ── Creative: slide up from below as background darkens ──
        // V5: p=0.58→0.78 (was 0.38→0.56) — rises with the canvas fade so the
        // dwell before the concept-reveal pin takes over is much shorter.
        // Single element: #transition-headline only (in-section brand stays opacity:0).
        // concept-reveal ST onEnter takes ownership via flag.
        if (!hlOwnedByConceptReveal) {
          const slideP = Math.max(0, Math.min(1, (p - 0.58) / 0.20));
          transitionHL.style.opacity   = Math.min(1, slideP * 1.4); // opacity leads slightly
          transitionHL.style.transform = `translateY(${(1 - slideP) * 35}vh)`;
        }

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
    if (!subtitleEls.length) return; // no subtitle elements present
    const thresholds = [0.10, 0.20, 0.30, 0.40];
    let target = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (p >= thresholds[i]) target = i + 1;
    }
    target = Math.min(target, subtitleEls.length - 1);

    if (target !== currentSub) {
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
      '.about, .process, .contact'
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

    const trustedBy = document.querySelector('.trusted-by');
    if (trustedBy) {
      ScrollTrigger.create({
        trigger: trustedBy,
        start: 'top 98%',
        once: true,
        onEnter() { trustedBy.classList.add('in-view'); },
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     V8: SELECTED WORKS — HOVER-EXPAND GALLERY + PARALLAX
     ═══════════════════════════════════════════════════════════ */
  function initWorksReveals() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const panelsEl = document.querySelector('.v8-panels');
    if (!panelsEl) return;

    // Scroll-triggered entrance
    if (!reducedMotion) {
      const rect = panelsEl.getBoundingClientRect();
      if (rect.top >= window.innerHeight) {
        gsap.set(panelsEl, { opacity: 0, y: 40 });
        ScrollTrigger.create({
          trigger: panelsEl,
          start: 'top 85%',
          once: true,
          onEnter() {
            gsap.to(panelsEl, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
          },
        });
      }
    }

    // Parallax on each panel's image
    if (!reducedMotion) {
      document.querySelectorAll('.v8-panel').forEach((panel) => {
        const img = panel.querySelector('.v8-panel__image');
        if (!img) return;
        gsap.fromTo(img, { yPercent: -3 }, {
          yPercent: 3,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      });
    }
  }

  function initWorks() {
    const panels = document.querySelectorAll('.v8-panel');
    const mobile = window.innerWidth < 768;

    // Mobile: tap to expand (since hover doesn't work on touch)
    if (mobile) {
      panels.forEach((panel) => {
        panel.addEventListener('click', (e) => {
          if (e.target.closest('.v8-panel__toggle')) return;
          const wasExpanded = panel.classList.contains('is-expanded');
          panels.forEach((p) => p.classList.remove('is-expanded'));
          if (!wasExpanded) panel.classList.add('is-expanded');
        });
      });
    }

    // Toggle button opens case study
    document.querySelectorAll('.v8-panel__toggle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const panel = btn.closest('.v8-panel');
        const key = panel.dataset.project;
        const caseStudy = document.getElementById('project-' + key);
        if (!caseStudy) return;

        const isOpen = caseStudy.classList.contains('is-open');
        document.querySelectorAll('.v8-case-study.is-open').forEach((cs) => {
          if (cs !== caseStudy) closeProject(cs);
        });

        if (isOpen) {
          closeProject(caseStudy);
        } else {
          openProject(caseStudy);
        }
      });
    });
  }

  document.querySelectorAll('.project-close-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const project = btn.closest('.project');
      if (project && project.classList.contains('is-open')) {
        closeProject(project);
        const panelsEl = document.querySelector('.v8-panels');
        if (panelsEl) {
          setTimeout(() => { lenis.scrollTo(panelsEl, { offset: -80 }); }, 100);
        }
      }
    });
  });

  function openProject(caseStudy) {
    const body = caseStudy.querySelector('.project-body');
    if (!body) return;
    const inner = body.querySelector('.project-body__inner');

    // Temporarily expand to measure natural height
    body.style.height = 'auto';
    body.style.overflow = 'hidden';
    const h = inner.offsetHeight;
    body.style.height = '0px';

    caseStudy.classList.add('is-open');
    gsap.fromTo(body, { height: 0, opacity: 0 }, {
      height: h,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      onComplete() { body.style.height = 'auto'; },
    });

    const key = caseStudy.id.replace('project-', '');
    const panel = document.querySelector(`.v8-panel[data-project="${key}"]`);
    if (panel) {
      const label = panel.querySelector('.v8-panel__toggle-label');
      if (label) label.textContent = 'Close';
    }

    setTimeout(() => { lenis.scrollTo(caseStudy, { offset: -20 }); }, 100);
  }

  function closeProject(caseStudy) {
    const body = caseStudy.querySelector('.project-body');
    if (!body) return;
    const h = body.offsetHeight;

    gsap.fromTo(body, { height: h, opacity: 1 }, {
      height: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.in',
      onComplete() {
        caseStudy.classList.remove('is-open');
        body.style.height = '';
      },
    });

    const key = caseStudy.id.replace('project-', '');
    const panel = document.querySelector(`.v8-panel[data-project="${key}"]`);
    if (panel) {
      const label = panel.querySelector('.v8-panel__toggle-label');
      if (label) label.textContent = 'View Case Study';
    }
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
     FORM SUBMISSION
     ═══════════════════════════════════════════════════════════ */
  function initFormHandler() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        const response = await fetch('https://formspree.io/f/mpqypndb', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          // Show success message
          form.style.display = 'none';
          successMsg.style.display = 'block';
          // Scroll success into view
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          errorMsg.style.display = 'block';
        }
      } catch (error) {
        console.error('Form submission error:', error);
        errorMsg.style.display = 'block';
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     CONCEPT REVEAL v5 — scroll-built kinetic line sequence.
     Each line gets its own reveal language:
       L0 — word cascade: rise + de-blur, staggered from start
       L1 — char bloom: settles in from the center outward
       L2 — word cascade + bold coda punch ("is the work.")
     Lines drift gently upward during their dwell so the frame
     never feels frozen. Progress ticks track the active line.
     Timing follows scrub-standard ratios: ~20% transition,
     ~60% dwell per segment, ease-out in / ease-in out.
     ═══════════════════════════════════════════════════════════ */

  // Split a line into word/char spans. Original text preserved for
  // screen readers via aria-label on the parent.
  function splitFragments(el, mode) {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    const wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');

    if (mode === 'words') {
      const words = text.split(' ');
      words.forEach((w, i) => {
        const s = document.createElement('span');
        s.className = 'cr-word';
        s.textContent = w;
        wrap.appendChild(s);
        if (i < words.length - 1) wrap.appendChild(document.createTextNode(' '));
      });
    } else {
      Array.from(text).forEach((ch) => {
        if (ch === ' ') {
          wrap.appendChild(document.createTextNode(' '));
          return;
        }
        const s = document.createElement('span');
        s.className = 'cr-char';
        s.textContent = ch;
        wrap.appendChild(s);
      });
    }

    el.textContent = '';
    el.appendChild(wrap);
    return Array.from(wrap.querySelectorAll('.cr-word, .cr-char'));
  }

  function initConceptReveal() {
    const section = document.getElementById('concept-reveal');
    if (!section) return;

    const lines = Array.from(section.querySelectorAll('.concept-reveal__line'));
    const hlText = transitionHL.querySelector('.transition-headline__text');
    const ticks = Array.from(section.querySelectorAll('.concept-reveal__tick'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(transitionHL, { opacity: 0 });
      const last = lines[lines.length - 1];
      gsap.set(last, { opacity: 1 });
      const rmCoda = last.querySelector('.line-coda');
      if (rmCoda) gsap.set(rmCoda, { opacity: 1, y: 0 });
      return;
    }

    // ── Split ──
    const words0 = splitFragments(lines[0], 'words');
    const chars1 = splitFragments(lines[1], 'chars');
    const words2 = splitFragments(lines[2].querySelector('.line-main'), 'words');
    const coda   = lines[2].querySelector('.line-coda');

    // Lines themselves stay visible; fragments carry the animation.
    gsap.set(lines, { opacity: 1, transformOrigin: 'center center' });
    gsap.set(words0, { opacity: 0, yPercent: 70, filter: 'blur(6px)' });
    gsap.set(chars1, { opacity: 0, yPercent: 45, rotateX: -40, transformOrigin: 'center bottom', transformPerspective: 600 });
    gsap.set(words2, { opacity: 0, yPercent: 60, filter: 'blur(6px)' });
    if (coda) gsap.set(coda, { opacity: 0, y: 10, scale: 1.12 });

    /* Segment map (timeline units — 1 unit ≈ 100vh of scroll at 320% pin):
       L0: in 0.02–0.24 · dwell → 0.78 · out 0.78–0.94
       L1: in 0.90–1.12 · dwell → 1.78 · out 1.78–1.94
       L2: in 1.92–2.16 · coda 2.24–2.44 · holds to unpin (no exit) */
    const TOTAL = 3.2;
    const L1_START = 0.90;
    const L2_START = 1.92;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=320%',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onEnter()     { hlOwnedByConceptReveal = true;  },
        // Hard-set opacity on leave: on fast scrolls/jumps the hero's
        // onUpdate can write opacity 1 after the scrubbed fade already
        // finished, stranding the fixed headline over the page.
        onLeave()     { hlOwnedByConceptReveal = false; gsap.set(transitionHL, { opacity: 0 }); },
        onEnterBack() { hlOwnedByConceptReveal = true;  },
        onLeaveBack() { hlOwnedByConceptReveal = false; },
        onUpdate(self) {
          const t = self.progress * TOTAL;
          const active = t < L1_START ? 0 : t < L2_START ? 1 : 2;
          ticks.forEach((tick, i) => tick.classList.toggle('is-active', i === active));
        },
      },
    });

    // ── "Creative" hands off immediately — no pre-roll dwell ──
    tl.to(transitionHL, { opacity: 0, duration: 0.10, ease: 'none' }, 0);
    if (hlText) {
      tl.to(hlText, { scale: 1.08, filter: 'blur(8px)', duration: 0.10, ease: 'power1.in' }, 0);
    }

    // ── L0: word cascade ──
    tl.to(words0, {
      opacity: 1, yPercent: 0, filter: 'blur(0px)',
      duration: 0.14, ease: 'power3.out',
      stagger: { each: 0.016, from: 'start' },
    }, 0.02);
    // dwell drift — keeps the frame alive while the line holds
    tl.to(lines[0], { y: -14, duration: 0.54, ease: 'none' }, 0.24);
    // exit — words lift away with a soft blur
    tl.to(words0, {
      opacity: 0, yPercent: -50, filter: 'blur(4px)',
      duration: 0.12, ease: 'power2.in',
      stagger: { each: 0.008, from: 'start' },
    }, 0.78);

    // ── L1: char bloom from center ──
    tl.to(chars1, {
      opacity: 1, yPercent: 0, rotateX: 0,
      duration: 0.14, ease: 'power3.out',
      stagger: { each: 0.006, from: 'center' },
    }, L1_START);
    tl.to(lines[1], { y: -14, duration: 0.52, ease: 'none' }, 1.12);
    tl.to(chars1, {
      opacity: 0, yPercent: -40,
      duration: 0.12, ease: 'power2.in',
      stagger: { each: 0.004, from: 'center' },
    }, 1.78);

    // ── L2: word cascade, then the coda lands bold ──
    tl.to(words2, {
      opacity: 1, yPercent: 0, filter: 'blur(0px)',
      duration: 0.14, ease: 'power3.out',
      stagger: { each: 0.022, from: 'start' },
    }, L2_START);
    if (coda) {
      tl.to(coda, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.18, ease: 'power3.out',
      }, 2.24);
    }
    // L2 stays on screen — section unpins with the thesis still standing.
    tl.to(lines[2], { y: -10, duration: 0.6, ease: 'none' }, 2.5);

    // pad timeline so positions map 1:1 against TOTAL
    tl.set({}, {}, TOTAL);
  }

  /* ═══════════════════════════════════════════════════════════
     PROCESS — Editorial row animations
     ═══════════════════════════════════════════════════════════ */
  async function initProcess() {
    const section = document.querySelector('.process');
    const grid    = document.querySelector('.practice__grid');
    if (!grid || !section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── 1. Fetch & inject SVGs ──────────────────────────────────
    const wraps = grid.querySelectorAll('.practice__icon-wrap[data-icon]');

    await Promise.all(Array.from(wraps).map(async (wrap) => {
      const key = wrap.dataset.icon;
      try {
        const res  = await fetch(`brand_assets/icons/${key}.svg`);
        const text = await res.text();
        const parser = new DOMParser();
        const doc    = parser.parseFromString(text, 'image/svg+xml');
        const svg    = doc.querySelector('svg');
        if (!svg) return;
        svg.setAttribute('aria-hidden', 'true');
        svg.style.width   = '100%';
        svg.style.height  = '100%';
        svg.style.display = 'block';
        wrap.appendChild(svg);
      } catch (e) {
        console.warn('Icon load failed:', key, e);
      }
    }));

    if (reduced) return;

    const cols = grid.querySelectorAll('.practice__col');

    // ── 2. Initial hidden state ──────────────────────────────────
    cols.forEach(col => {
      const rule = col.querySelector('.practice__rule');
      const num  = col.querySelector('.practice__num');
      const name = col.querySelector('.practice__name');
      const tag  = col.querySelector('.practice__tag');
      gsap.set([num, name, tag], { opacity: 0, y: 10 });
      if (rule) gsap.set(rule, { scaleX: 0 });
    });

    // Stroke-draw setup: fill starts transparent, stroke draws first
    wraps.forEach(wrap => {
      wrap.querySelectorAll('path, circle, rect, ellipse, polygon, polyline').forEach(el => {
        const len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 400;
        el.setAttribute('fill', 'white');
        el.setAttribute('fill-opacity', '0');
        el.setAttribute('stroke', 'white');
        el.setAttribute('stroke-width', '1');
        el.setAttribute('stroke-linecap', 'round');
        el.setAttribute('stroke-linejoin', 'round');
        el.setAttribute('stroke-dasharray', len);
        el.setAttribute('stroke-dashoffset', len);
      });
    });

    // ── 3. TWO-PHASE SCROLL ANIMATION ───────────────────────────
    // Phase 1 (no pin): BUILD fires as section enters viewport
    //   Starts when section top hits 85% of viewport, completes at 'top top'
    //   No empty dead scroll — icons draw immediately as section comes into view
    //
    // Phase 2 (pin): LOCK + DISMANTLE at top of viewport
    //   Section pins at 'top top' (already fully built), holds, then dismantles slowly

    const buildTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        end: 'top top',
        scrub: 0.5,
      },
    });

    // Collect all text elements for forced cleanup on leave
    const allTags  = Array.from(grid.querySelectorAll('.practice__tag'));
    const allNames = Array.from(grid.querySelectorAll('.practice__name'));
    const allNums  = Array.from(grid.querySelectorAll('.practice__num'));
    const allRules = Array.from(grid.querySelectorAll('.practice__rule'));

    const dismantleTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: 0.5,
        onEnter() {
          gsap.set([...allTags, ...allNames, ...allNums], { opacity: 1, y: 0, overwrite: true });
          gsap.set(allRules, { scaleX: 1, overwrite: true });
        },
        onLeave() {
          gsap.set([...allTags, ...allNames, ...allNums], { opacity: 0, overwrite: true });
          gsap.set(allRules, { scaleX: 0, overwrite: true });
        },
        onEnterBack() {
          gsap.set([...allTags, ...allNames, ...allNums], { opacity: 1, y: 0, overwrite: true });
          gsap.set(allRules, { scaleX: 1, overwrite: true });
        },
      },
    });

    // ── BUILD (Phase 1) — all 4 cols assemble during viewport entry ──
    cols.forEach((col, i) => {
      const wrap   = col.querySelector('.practice__icon-wrap');
      const shapes = wrap
        ? Array.from(wrap.querySelectorAll('path, circle, rect, ellipse, polygon, polyline'))
        : [];
      const num  = col.querySelector('.practice__num');
      const name = col.querySelector('.practice__name');
      const tag  = col.querySelector('.practice__tag');
      const rule = col.querySelector('.practice__rule');

      const n    = shapes.length;
      const each = n <= 1 ? 0 : Math.max(0.005, 0.20 / n);
      const span = each * Math.max(0, n - 1);
      const o    = i * 0.06;

      if (rule) buildTl.to(rule, { scaleX: 1, duration: 0.08 }, o);

      if (n) {
        buildTl.to(shapes, {
          attr: { 'stroke-dashoffset': 0 },
          duration: 0.08,
          stagger: { each, from: 'start' },
        }, o + 0.02);

        buildTl.to(shapes, {
          attr: { 'fill-opacity': 1 },
          duration: 0.06,
          stagger: { each, from: 'start' },
        }, o + 0.02 + span * 0.30);

        buildTl.to(shapes, {
          attr: { 'stroke-width': 0 },
          duration: 0.05,
          stagger: { each, from: 'start' },
        }, o + 0.02 + span * 0.65);
      }

      const textAt = o + 0.02 + span + 0.08;
      if (num)  buildTl.to(num,  { opacity: 1, y: 0, duration: 0.06 }, textAt);
      if (name) buildTl.to(name, { opacity: 1, y: 0, duration: 0.06 }, textAt + 0.04);
      if (tag)  buildTl.to(tag,  { opacity: 1, y: 0, duration: 0.06 }, textAt + 0.08);
    });

    // ── LOCK (Phase 2) — brief hold before dismantle ──
    dismantleTl.to(grid, { opacity: 1, duration: 0.01 }, 0.15);

    // ── DISMANTLE (Phase 2) — slow, right-to-left ──
    cols.forEach((col, i) => {
      const wrap   = col.querySelector('.practice__icon-wrap');
      const shapes = wrap
        ? Array.from(wrap.querySelectorAll('path, circle, rect, ellipse, polygon, polyline'))
        : [];
      const num  = col.querySelector('.practice__num');
      const name = col.querySelector('.practice__name');
      const tag  = col.querySelector('.practice__tag');
      const rule = col.querySelector('.practice__rule');

      const n    = shapes.length;
      const each = n <= 1 ? 0 : Math.max(0.005, 0.20 / n);
      const span = each * Math.max(0, n - 1);
      const o    = 0.15 + (3 - i) * 0.18;

      if (tag)  dismantleTl.fromTo(tag,  { opacity: 1, y: 0, immediateRender: false }, { opacity: 0, y: -8, duration: 0.10, overwrite: 'auto' }, o);
      if (name) dismantleTl.fromTo(name, { opacity: 1, y: 0, immediateRender: false }, { opacity: 0, y: -8, duration: 0.10, overwrite: 'auto' }, o + 0.05);
      if (num)  dismantleTl.fromTo(num,  { opacity: 1, y: 0, immediateRender: false }, { opacity: 0, y: -8, duration: 0.10, overwrite: 'auto' }, o + 0.10);
      if (rule) dismantleTl.fromTo(rule, { scaleX: 1,   immediateRender: false }, { scaleX: 0, duration: 0.12, overwrite: 'auto' }, o + 0.10);

      if (n) {
        dismantleTl.to(shapes, {
          attr: { 'fill-opacity': 0 },
          duration: 0.40,
          stagger: { each, from: 'end' },
        }, o + 0.18);
      }
    });

    ScrollTrigger.refresh();
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════ */
  function init() {
    initNav();
    loadFrames();
    initReveals();
    initWorksReveals();
    initConceptReveal();
    initProcess();
    initWorks();
    initLightbox();
    initMarquee();
    initFormHandler();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
