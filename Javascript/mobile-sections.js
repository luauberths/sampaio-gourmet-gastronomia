(() => {
  const mobileQuery = window.matchMedia("(max-width: 950px)");
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const sectionContainer = document.getElementById("mobile-sections");
  if (!sectionContainer) return;

  const sectionPages = [
    { file: "cardapios.html", id: "cardapios" },
    { file: "orcamento.html", id: "orcamento" },
    { file: "sobre.html", id: "sobre" },
    { file: "parceiros.html", id: "parceiros" },
    { file: "feedbacks.html", id: "feedbacks" },
  ];
  const pageIds = new Map(sectionPages.map((page) => [page.file, page.id]));
  pageIds.set("clientes.html", "feedbacks");
  pageIds.set("feedback.html", "feedbacks");
  const normalizeSectionId = (id) =>
    ["clientes", "feedback"].includes(id) ? "feedbacks" : id;
  const validSections = new Set([
    "home",
    ...sectionPages.map((page) => page.id),
  ]);
  const redirectStorageKey = "sampaioMobileDestination";
  const initialMobileLoad = mobileQuery.matches;

  let sectionsPromise;
  let initialLoadHandled = false;
  let navigationRequested = false;
  let redirectDestination = null;
  let initialHashDestination = null;
  let accordionScrollRequest = 0;
  let navigationScrollRequest = 0;
  let sectionEntryObserver = null;

  function scrollToTop() {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;
  }

  function getFixedNavigationHeight() {
    const nav = document.querySelector(".nav-bar");
    if (!nav) return 0;
    const position = window.getComputedStyle(nav).position;
    return position === "fixed" || position === "sticky"
      ? nav.getBoundingClientRect().height
      : 0;
  }

  function scrollToElement(element, smooth = true) {
    if (!element || !element.isConnected) return;
    const gap = 16;
    const top = Math.max(
      0,
      window.scrollY +
        element.getBoundingClientRect().top -
        getFixedNavigationHeight() -
        gap,
    );

    if (smooth && !reducedMotionQuery.matches) {
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, top);
      root.style.scrollBehavior = previousScrollBehavior;
    }
  }

  function requestedSectionFromHash() {
    try {
      const id = normalizeSectionId(decodeURIComponent(location.hash.slice(1)));
      return validSections.has(id) ? id : null;
    } catch {
      return null;
    }
  }

  if (initialMobileLoad) {
    history.scrollRestoration = "manual";
    try {
      redirectDestination = sessionStorage.getItem(redirectStorageKey);
      sessionStorage.removeItem(redirectStorageKey);
    } catch {}

    redirectDestination = normalizeSectionId(redirectDestination);
    if (
      !validSections.has(redirectDestination) ||
      redirectDestination === "home"
    ) {
      redirectDestination = null;
    }
    initialHashDestination = requestedSectionFromHash();

    if (!redirectDestination && !initialHashDestination) {
      if (location.hash) {
        history.replaceState(
          history.state,
          "",
          location.pathname + location.search,
        );
      }
      scrollToTop();
    }
  }

  function initializeMobileCardapios() {
    const menus = sectionContainer.querySelector("#cardapios.menus-page");
    if (!menus || menus.dataset.mobileAccordionInitialized === "true") return;
    menus.dataset.mobileAccordionInitialized = "true";

    menus.addEventListener("click", (event) => {
      if (!mobileQuery.matches) return;
      if (!(event.target instanceof Element)) return;

      const summary = event.target.closest("summary.menu-choice-toggle");
      if (!summary || !menus.contains(summary)) return;
      const selected = summary.parentElement;
      if (!selected || !selected.matches("details.menu-choice")) return;

      event.preventDefault();
      const shouldOpen = !selected.open;
      const requestId = ++accordionScrollRequest;

      menus.querySelectorAll("details.menu-choice").forEach((details) => {
        if (details !== selected) details.open = false;
      });
      selected.open = shouldOpen;
      if (!shouldOpen) return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (requestId !== accordionScrollRequest) return;
          if (!mobileQuery.matches || !selected.open) return;
          scrollToElement(summary);
        });
      });
    });
  }

  async function initializeClientReviews() {
    await import("./reviews.js?v=20261016-feedbacks-partner-cards");
    window.SampaioReviews.init();
  }

  async function loadSections() {
    if (sectionsPromise) return sectionsPromise;
    sectionsPromise = (async () => {
      const pages = await Promise.all(
        sectionPages.map(async (page) => {
          const response = await fetch(page.file);
          if (!response.ok)
            throw new Error(`Não foi possível carregar ${page.file}`);
          const documentPage = new DOMParser().parseFromString(
            await response.text(),
            "text/html",
          );
          const content = documentPage.querySelector("main");
          if (!content)
            throw new Error(`Conteúdo não encontrado em ${page.file}`);
          content.id = page.id;
          return content;
        }),
      );
      sectionContainer.replaceChildren(...pages);
      initializeMobileCardapios();
      initializeClientReviews().catch((error) =>
        console.error("Erro ao carregar as avaliações:", error),
      );
      await import("./quote.js?v=20261016-calendar");
    })().catch((error) => {
      sectionsPromise = undefined;
      console.error("Erro ao carregar as seções do site:", error);
      sectionContainer.textContent =
        "Não foi possível carregar todas as seções. Recarregue a página.";
      throw error;
    });
    return sectionsPromise;
  }

  function animateSectionEntry(target) {
    if (sectionEntryObserver) {
      sectionEntryObserver.disconnect();
      sectionEntryObserver = null;
    }
    if (
      target.classList.contains("about-section") ||
      reducedMotionQuery.matches ||
      !("IntersectionObserver" in window)
    )
      return;
    const heading = target.querySelector(".page-header, .section-title, h1");
    if (!heading || typeof heading.animate !== "function") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (sectionEntryObserver === observer) sectionEntryObserver = null;
        heading.animate(
          [
            { opacity: 0.72, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 420,
            easing: "cubic-bezier(.22, 1, .36, 1)",
          },
        );
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    sectionEntryObserver = observer;
    observer.observe(heading);
  }

  function navigateToSection(id, updateHistory = true, smooth = true) {
    if (!validSections.has(id)) return;
    const target = document.getElementById(id);
    if (!target) return;

    if (updateHistory) {
      history.replaceState(
        { mobileSection: id },
        "",
        id === "home" ? "index.html" : `#${id}`,
      );
    }

    const requestId = ++navigationScrollRequest;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (requestId !== navigationScrollRequest || !mobileQuery.matches)
          return;
        if (smooth) animateSectionEntry(target);
        scrollToElement(target, smooth);
      }),
    );
  }

  async function initializeMobile() {
    if (!mobileQuery.matches) return;
    await loadSections();
    if (!initialMobileLoad || initialLoadHandled) return;
    initialLoadHandled = true;
    if (navigationRequested) return;

    const initialDestination = redirectDestination || initialHashDestination;
    if (initialDestination) {
      navigateToSection(initialDestination, false, false);
    } else {
      scrollToTop();
    }
  }

  document.addEventListener("click", async (event) => {
    if (!mobileQuery.matches || event.defaultPrevented) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || link.target === "_blank")
      return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;

    const file = url.pathname.split("/").pop() || "index.html";
    const fileName = file.endsWith(".html") ? file : `${file}.html`;
    let destination = pageIds.get(fileName);

    if (fileName === "index.html") {
      const requestedHash = url.hash
        ? (() => {
            try {
              return normalizeSectionId(decodeURIComponent(url.hash.slice(1)));
            } catch {
              return null;
            }
          })()
        : null;
      if (requestedHash && !validSections.has(requestedHash)) return;
      destination = requestedHash || "home";
    }
    if (!destination) return;

    event.preventDefault();
    navigationRequested = true;
    try {
      await loadSections();
      navigateToSection(destination);
    } catch {
      location.href = link.href;
    }
  });

  window.addEventListener("popstate", () => {
    if (!mobileQuery.matches) return;
    navigationRequested = true;
    loadSections()
      .then(() => {
        navigateToSection(requestedSectionFromHash() || "home", false);
      })
      .catch(() => {});
  });

  mobileQuery.addEventListener("change", () => {
    if (mobileQuery.matches) {
      initializeMobile().catch(() => {});
    } else if (sectionEntryObserver) {
      sectionEntryObserver.disconnect();
      sectionEntryObserver = null;
    }
  });
  initializeMobile().catch(() => {});
})();
