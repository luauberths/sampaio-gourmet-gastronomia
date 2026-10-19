const slides = document.querySelectorAll(".slide");
const titleStart = document.getElementById("title-start");
const titleEnd = document.getElementById("title-end");
const heroDescription = document.getElementById("hero-description");
const serviceItems = document.querySelectorAll(".service-item");

if (slides.length > 1) {
  let currentSlideIndex = 0;

  setInterval(() => {
    slides[currentSlideIndex].classList.remove("active");
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    slides[currentSlideIndex].classList.add("active");
  }, 3500);
}

if (titleStart && titleEnd && heroDescription) {
  const heroTitle = document.querySelector(".hero-title");

  const heroMessages = [
    {
      start: "Sabores que tornam seus",
      end: "momentos especiais...",
      description:
        "Ce\u00adle\u00adbre com uma mesa cheia de sabor. Em ca\u00adsa\u00admen\u00adtos, ani\u00adver\u00adsá\u00adri\u00ados e fes\u00adtas, cui\u00adda\u00admos da co\u00admi\u00adda e do ser\u00advi\u00adço para que você apro\u00advei\u00adte cada mo\u00admen\u00adto com quem gosta.",
    },
    {
      start: "Detalhes que marcam",
      end: "encontros inesquecíveis...",
      description:
        "Re\u00adce\u00adber bem co\u00adme\u00adça nos de\u00adta\u00adlhes. Uni\u00admos boa co\u00admi\u00adda, cui\u00adda\u00addo no pre\u00adpa\u00adro e aten\u00adção ao ser\u00advir para aco\u00adlher seus con\u00advi\u00adda\u00addos e dar à festa o seu es\u00adti\u00adlo.",
    },
    {
      start: "Serviços pensados para",
      end: "encantar seus convidados...",
      description:
        "Do brun\u00adch ao cof\u00adfee break e buf\u00adfet, temos op\u00adções para cada en\u00adcon\u00adtro. Nos\u00adsos car\u00addá\u00adpi\u00ados unem sabor e va\u00adri\u00ade\u00adda\u00adde, com cui\u00adda\u00addo ao ser\u00advir do iní\u00adcio ao fim.",
    },
  ];

  const textElements = [titleStart, titleEnd, heroDescription];

  let currentMessageIndex = 0;
  const mobileHeroQuery = window.matchMedia("(max-width: 950px)");
  const fitMobileTitle = () => {
    [titleStart, titleEnd].forEach((element) => {
      element.style.transform = "";
      if (!mobileHeroQuery.matches || !heroTitle) return;
      const availableWidth = heroTitle.clientWidth;
      const textWidth = element.scrollWidth;
      if (availableWidth > 0 && textWidth > availableWidth) {
        element.style.transform = `scaleX(${availableWidth / textWidth})`;
      }
    });
  };

  const updateHeroMessage = () => {
    const message = heroMessages[currentMessageIndex];

    titleStart.textContent = message.start;
    titleEnd.textContent = message.end;
    heroDescription.textContent = message.description;
    fitMobileTitle();

    serviceItems.forEach((item, index) => {
      item.classList.toggle("highlighted", index === currentMessageIndex);
    });
  };

  const adjustHeroHeights = () => {
    if (!heroTitle) return;

    heroTitle.style.minHeight = "";
    heroDescription.style.minHeight = "";

    if (mobileHeroQuery.matches) {
      const originalDescription = heroDescription.textContent;
      let maxDescriptionHeight = 0;
      heroMessages.forEach((message) => {
        heroDescription.textContent = message.description;
        maxDescriptionHeight = Math.max(
          maxDescriptionHeight,
          heroDescription.scrollHeight,
        );
      });
      heroDescription.textContent = originalDescription;
      heroDescription.style.minHeight = `${Math.ceil(maxDescriptionHeight)}px`;
      fitMobileTitle();
      return;
    }
    fitMobileTitle();

    const minimumTitleHeight = parseFloat(getComputedStyle(heroTitle).minHeight) || 0;

    const minimumDescriptionHeight =
      parseFloat(getComputedStyle(heroDescription).minHeight) || 0;

    const originalText = {
      start: titleStart.textContent,
      end: titleEnd.textContent,
      description: heroDescription.textContent,
    };

    heroTitle.style.minHeight = "0px";
    heroDescription.style.minHeight = "0px";

    let maximumTitleHeight = 0;
    let maximumDescriptionHeight = 0;

    heroMessages.forEach((message) => {
      titleStart.textContent = message.start;
      titleEnd.textContent = message.end;
      heroDescription.textContent = message.description;

      maximumTitleHeight = Math.max(maximumTitleHeight, heroTitle.scrollHeight);

      maximumDescriptionHeight = Math.max(
        maximumDescriptionHeight,
        heroDescription.scrollHeight,
      );
    });

    titleStart.textContent = originalText.start;
    titleEnd.textContent = originalText.end;
    heroDescription.textContent = originalText.description;

    heroTitle.style.minHeight = `${Math.ceil(Math.max(maximumTitleHeight, minimumTitleHeight))}px`;

    heroDescription.style.minHeight = `${Math.ceil(Math.max(maximumDescriptionHeight, minimumDescriptionHeight))}px`;
  };

  updateHeroMessage();

  adjustHeroHeights();

  let resizeFrame = null;

  mobileHeroQuery.addEventListener("change", adjustHeroHeights);

  window.addEventListener("resize", () => {
    if (resizeFrame !== null) {
      cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = requestAnimationFrame(() => {
      adjustHeroHeights();
      resizeFrame = null;
    });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(adjustHeroHeights);
  }

  setInterval(() => {
    textElements.forEach((element) => {
      element.classList.add("fade-out");
    });

    setTimeout(() => {
      currentMessageIndex = (currentMessageIndex + 1) % heroMessages.length;

      updateHeroMessage();

      textElements.forEach((element) => {
        element.classList.remove("fade-out");
      });
    }, 500);
  }, 3500);
}
