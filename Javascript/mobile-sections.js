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
  let navigationScrollRequest = 0;
  let sectionEntryFrame = null;

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
    } catch { }

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

  async function initializeClientReviews() {
    await import("./reviews.js");
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
      await import("./menus.js");
      initializeClientReviews().catch((error) =>
        console.error("Erro ao carregar as avaliações:", error),
      );
      await import("./quote.js");
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
    if (sectionEntryFrame !== null) cancelAnimationFrame(sectionEntryFrame);
    sectionEntryFrame = null;
    if (reducedMotionQuery.matches) return;
    const started = performance.now();
    let previousScroll = window.scrollY;
    let stableFrames = 0;
    const finish = () => {
      if (!mobileQuery.matches || !target.isConnected) {
        sectionEntryFrame = null;
        return;
      }
      const currentScroll = window.scrollY;
      stableFrames = Math.abs(currentScroll - previousScroll) < 0.5 ? stableFrames + 1 : 0;
      previousScroll = currentScroll;
      const elapsed = performance.now() - started;
      if ((elapsed > 100 && stableFrames >= 3) || elapsed > 1600) {
        sectionEntryFrame = null;
        window.SampaioMotion?.enterSection(target);
        return;
      }
      sectionEntryFrame = requestAnimationFrame(finish);
    };
    sectionEntryFrame = requestAnimationFrame(finish);
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
        scrollToElement(target, smooth);
        animateSectionEntry(target);
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
      .catch(() => { });
  });

  mobileQuery.addEventListener("change", () => {
    if (mobileQuery.matches) {
      initializeMobile().catch(() => { });
    } else if (sectionEntryFrame !== null) {
      cancelAnimationFrame(sectionEntryFrame);
      sectionEntryFrame = null;
    }
  });
  initializeMobile().catch(() => { });
})();
