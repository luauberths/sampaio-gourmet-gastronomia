(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();
  const activeAnimations = new WeakMap();
  const observed = new WeakSet();
  const revealed = new WeakSet();
  let navigatingSection = false;
  const revealSelector = [
    ".page-layout .instagram-container",
    ".page-layout .services-subtitle",
    ".page-layout .hero-title",
    ".page-layout .hero-description-container",
    ".page-layout .slideshow-container",
    ".menus-page > .page-header",
    ".menus-page > .menu-extra",
    ".menus-page > .menus-container > .menu-choice",
    ".about-section .page-header",
    ".about-content > .section-description",
    ".about-photo",
    ".partners-header",
    ".partner-card",
    ".form-section .page-header",
    ".quote-container",
    ".clients-section .page-header",
    ".reviews-summary",
    ".reviews-track",
  ].join(", ");
  const controlSelector = ".menu-choice-toggle, .quote-button, .whatsapp-button, .quote-submit-button, .reviews-arrow, .date-calendar-toggle, .date-calendar-day";

  function play(element, frames, settings) {
    if (!element || reducedMotion.matches || typeof element.animate !== "function") return;
    activeAnimations.get(element)?.cancel();
    const animation = element.animate(frames, settings);
    activeAnimations.set(element, animation);
    animations.add(animation);
    const finish = () => {
      animations.delete(animation);
      if (activeAnimations.get(element) === animation) activeAnimations.delete(element);
    };
    animation.finished.then(finish, finish);
  }

  function reveal(element, delay = 0, force = false) {
    if (reducedMotion.matches || (!force && revealed.has(element))) return;
    revealed.add(element);
    if (navigatingSection) return;
    play(element, [
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], {
      duration: 360,
      delay,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "backwards",
    });
  }

  function enterSection(section, force = true) {
    if (!section || reducedMotion.matches) return;
    const visible = Array.from(section.querySelectorAll(revealSelector)).filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
    });
    visible.forEach((element, index) => {
      reveal(element, Math.min(index * 40, 120), force);
    });
  }

  function beginNavigation() {
    navigatingSection = true;
    document.querySelectorAll(revealSelector).forEach((element) => {
      activeAnimations.get(element)?.cancel();
    });
  }

  function endNavigation() {
    document.querySelectorAll(revealSelector).forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
        revealed.add(element);
      }
    });
    navigatingSection = false;
  }

  function press(element) {
    if (!element || element.matches(":disabled")) return;
    const transform = getComputedStyle(element).transform;
    const base = transform === "none" ? "" : transform;
    play(element, [
      { transform: `${base} scale(1)` },
      { transform: `${base} scale(0.975)`, offset: 0.4 },
      { transform: `${base} scale(1)` },
    ], { duration: 220, easing: "ease-out" });
  }

  document.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !(event.target instanceof Element)) return;
    press(event.target.closest(controlSelector));
    const slideshow = event.target.closest(".slideshow-container");
    if (slideshow) {
      play(slideshow.querySelector(".slide.active"), [
        { transform: "scale(1)" },
        { transform: "scale(1.015)" },
        { transform: "scale(1)" },
      ], { duration: 340, easing: "ease-out" });
    }
  }, { passive: true });

  document.addEventListener("click", (event) => {
    if (event.detail === 0 && event.target instanceof Element) {
      press(event.target.closest(controlSelector));
    }
  });

  window.SampaioMotion = { enterSection, beginNavigation, endNavigation };
  requestAnimationFrame(() => {
    enterSection(document.querySelector(".page-layout, main.page-section"), false);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const index = entry.target.matches(".partner-card")
          ? Array.from(entry.target.parentElement.children).indexOf(entry.target)
          : 0;
        reveal(entry.target, Math.min(index * 45, 180));
      });
    }, { threshold: 0.08 });

    function observe(root) {
      const elements = [];
      if (root.matches?.(revealSelector)) elements.push(root);
      elements.push(...root.querySelectorAll(revealSelector));
      elements.forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        observer.observe(element);
      });
    }

    observe(document);
    new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === 1) observe(node);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) animations.forEach((animation) => animation.cancel());
  });
})();
