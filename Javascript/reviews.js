(() => {
  const widgetId = "b406c879-6e29-4eca-a6ad-973fbe9e9706";
  const hostId = `featurable-${widgetId}`;
  const googleFallback =
    "https://www.google.com/maps/search/?api=1&query=Sampaio+Gourmet+Gastronomia";
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  };
  const externalLink = (text, href, className) => {
    const link = element("a", className, text);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  };
  const ratingValue = (value) =>
    Math.max(
      0,
      Math.min(
        5,
        Number(value) ||
          { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[value] ||
          0,
      ),
    );
  const stars = (rating) => {
    const node = element(
      "span",
      "review-stars",
      "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating)),
    );
    node.setAttribute("role", "img");
    node.setAttribute(
      "aria-label",
      `${rating.toLocaleString("pt-BR")} de 5 estrelas`,
    );
    return node;
  };
  const originalComment = (value) => {
    const comment = String(value || "").trim();
    const original = comment.indexOf("(Original)");
    return original >= 0
      ? comment.slice(original + 10).trim()
      : comment.split("(Translated by Google)")[0].trim();
  };
  function reviewCard(review) {
    const card = element("article", "review-card");
    const header = element("div", "review-card-header");
    const name = String(review.reviewer?.displayName || "Usuário do Google");
    const avatar = element(
      "span",
      "review-avatar",
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    );
    avatar.setAttribute("aria-hidden", "true");
    const photo = safeUrl(review.reviewer?.profilePhotoUrl);
    if (photo) {
      const image = document.createElement("img");
      image.src = photo;
      image.alt = "";
      image.width = 42;
      image.height = 42;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => image.remove());
      avatar.append(image);
    }
    const identity = element("div", "review-identity");
    identity.append(element("h3", "review-name", name));
    const date = new Date(review.createTime);
    if (!Number.isNaN(date.getTime())) {
      const time = element(
        "time",
        "review-date",
        date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      );
      time.dateTime = date.toISOString();
      identity.append(time);
    }
    header.append(avatar, identity);
    card.append(header, stars(ratingValue(review.starRating)));
    const comment = originalComment(review.comment);
    if (comment) {
      const paragraph = element("p", "review-comment", comment);
      card.append(paragraph);
      if (comment.length > 120) {
        paragraph.classList.add("is-collapsed");
        const more = element(
          "button",
          "review-read-more",
          "Ler avaliação completa",
        );
        more.type = "button";
        more.setAttribute("aria-expanded", "false");
        more.addEventListener("click", () => {
          const expanded = more.getAttribute("aria-expanded") !== "true";
          more.setAttribute("aria-expanded", String(expanded));
          paragraph.classList.toggle("is-collapsed", !expanded);
          more.textContent = expanded
            ? "Mostrar menos"
            : "Ler avaliação completa";
        });
        card.append(more);
      }
    }
    card.append(element("span", "review-source", "Avaliação do Google"));
    return card;
  }
  function renderReviews(host, data) {
    const reviews = data.reviews.filter(
      (review) => review && typeof review === "object",
    );
    const fragment = document.createDocumentFragment();
    const profileUrl = safeUrl(data.profileUrl) || googleFallback;
    const summary = element("div", "reviews-summary");
    const overview = element("div", "reviews-overview");
    const average = Number(data.averageRating);
    if (Number.isFinite(average) && average >= 0 && average <= 5) {
      const score = element("div", "reviews-score");
      score.append(
        element(
          "strong",
          "",
          average.toLocaleString("pt-BR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
        ),
        stars(average),
      );
      overview.append(score);
    }
    const total = Number(data.totalReviewCount);
    overview.append(
      element(
        "p",
        "reviews-total",
        Number.isFinite(total)
          ? `${total.toLocaleString("pt-BR")} ${total === 1 ? "avaliação no Google" : "avaliações no Google"}`
          : "Avaliações de nossos clientes no Google",
      ),
    );
    summary.append(
      overview,
      externalLink("Avaliar no Google", profileUrl, "reviews-google-button"),
    );
    fragment.append(summary);
    if (reviews.length) {
      const track = element("div", "reviews-track");
      track.id = "feedbacks-reviews-track";
      track.setAttribute("role", "region");
      track.setAttribute("aria-label", "Avaliações dos clientes");
      track.tabIndex = 0;
      reviews.forEach((review) => track.append(reviewCard(review)));
      fragment.append(track);
      const navigation = element("div", "reviews-navigation");
      const previous = element("button", "reviews-arrow", "‹");
      const next = element("button", "reviews-arrow", "›");
      for (const [button, label] of [
        [previous, "Avaliação anterior"],
        [next, "Próxima avaliação"],
      ]) {
        button.type = "button";
        button.setAttribute("aria-label", label);
        button.setAttribute("aria-controls", track.id);
      }
      const position = element("span", "reviews-position");
      position.setAttribute("aria-live", "polite");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const geometry = () => {
        const style = getComputedStyle(track);
        const padding = parseFloat(style.paddingLeft) || 0;
        const gap = parseFloat(style.columnGap) || 0;
        const left = track.getBoundingClientRect().left + track.clientLeft;
        const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
        const targets = Array.from(track.children)
          .map((card) =>
            Math.max(
              0,
              Math.min(
                maximum,
                track.scrollLeft +
                  card.getBoundingClientRect().left -
                  left -
                  padding,
              ),
            ),
          )
          .filter(
            (value, index, all) =>
              index === 0 || Math.abs(value - all[index - 1]) > 0.5,
          );
        const index = targets.reduce(
          (closest, target, i) =>
            Math.abs(target - track.scrollLeft) <
            Math.abs(targets[closest] - track.scrollLeft)
              ? i
              : closest,
          0,
        );
        const step =
          track.firstElementChild.getBoundingClientRect().width + gap;
        const innerWidth =
          track.clientWidth - padding - (parseFloat(style.paddingRight) || 0);
        const visible = step
          ? Math.max(1, Math.round((innerWidth + gap) / step))
          : 1;
        return { targets, index, visible, maximum };
      };
      const move = (direction) => {
        const { targets, index } = geometry();
        const nextIndex = Math.max(
          0,
          Math.min(targets.length - 1, index + direction),
        );
        track.scrollTo({
          left: targets[nextIndex],
          behavior: reduced.matches ? "auto" : "smooth",
        });
      };
      previous.addEventListener("click", () => move(-1));
      next.addEventListener("click", () => move(1));
      const updateNavigation = () => {
        const { index, visible, maximum } = geometry();
        position.textContent = `${Math.min(index + 1, reviews.length)}–${Math.min(index + visible, reviews.length)} de ${reviews.length}`;
        previous.disabled = track.scrollLeft < 2;
        next.disabled = track.scrollLeft >= maximum - 2;
      };
      let scrollFrame;
      track.addEventListener(
        "scroll",
        () => {
          if (scrollFrame) cancelAnimationFrame(scrollFrame);
          scrollFrame = requestAnimationFrame(updateNavigation);
        },
        { passive: true },
      );
      if ("ResizeObserver" in window)
        new ResizeObserver(updateNavigation).observe(track);
      else window.addEventListener("resize", updateNavigation);
      navigation.append(previous, position, next);
      fragment.append(navigation);
      requestAnimationFrame(updateNavigation);
    } else
      fragment.append(
        element(
          "p",
          "reviews-status",
          "As avaliações aparecerão aqui quando estiverem disponíveis.",
        ),
      );
    const credit = element("p", "reviews-credit");
    credit.append(
      externalLink("Powered by Featurable", "https://featurable.com/", ""),
    );
    fragment.append(credit);
    host.replaceChildren(fragment);
    host.setAttribute("aria-busy", "false");
  }
  function originalEmbed(host) {
    host.replaceChildren();
    host.setAttribute("aria-busy", "false");
    host.setAttribute("data-featurable-async", "");
    const script = document.createElement("script");
    script.src = "https://featurable.com/assets/bundle.js";
    script.defer = true;
    script.charset = "UTF-8";
    script.addEventListener("error", () => {
      host.replaceChildren(
        element(
          "p",
          "reviews-status",
          "Não foi possível carregar as avaliações agora.",
        ),
        externalLink("Ver no Google", googleFallback, "reviews-google-button"),
      );
    });
    host.append(script);
  }
  function init() {
    const host = document.getElementById(hostId);
    if (!host || host.dataset.reviewsInitialized) return;
    host.dataset.reviewsInitialized = "true";
    host.setAttribute("aria-busy", "true");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    fetch(`https://api.featurable.com/v1/widgets/${widgetId}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Reviews unavailable");
        return response.json();
      })
      .then((data) => {
        if (
          !data.success ||
          data.published === false ||
          !Array.isArray(data.reviews)
        )
          throw new Error("Reviews unavailable");
        if (
          data.allowedDomains?.length &&
          !data.allowedDomains.includes(window.location.hostname)
        )
          throw new Error("Domain restriction");
        renderReviews(host, data);
      })
      .catch(() => originalEmbed(host))
      .finally(() => clearTimeout(timeout));
  }
  window.SampaioReviews = { init };
  init();
})();
