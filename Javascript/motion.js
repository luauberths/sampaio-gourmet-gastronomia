(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!("IntersectionObserver" in window)) return;

  const selector = ".about-content > .section-description, .about-photo, .partner-card";
  const observed = new WeakSet();
  const animations = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (reducedMotion.matches || typeof entry.target.animate !== "function") return;

      const partners = entry.target.parentElement;
      const index = entry.target.matches(".partner-card")
        ? Array.from(partners.children).indexOf(entry.target)
        : 0;
      const animation = entry.target.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 320,
          delay: Math.min(index * 45, 180),
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "backwards",
        },
      );
      animations.add(animation);
      animation.finished.then(
        () => animations.delete(animation),
        () => animations.delete(animation),
      );
    });
  }, { threshold: 0.08 });

  function observe(root) {
    const elements = [];
    if (root.matches?.(selector)) elements.push(root);
    elements.push(...root.querySelectorAll(selector));
    elements.forEach((element) => {
      if (observed.has(element)) return;
      observed.add(element);
      observer.observe(element);
    });
  }

  observe(document);
  new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node.nodeType === 1) observe(node);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) animations.forEach((animation) => animation.cancel());
  });
})();
