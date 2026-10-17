(function () {
  const cardapios = Array.from(
    document.querySelectorAll(".menus-page .menu-choice"),
  );
  const nav = document.querySelector(".nav-bar");
  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

  function rolarParaCardapio(cardapio) {
    const titulo = cardapio.querySelector(".menu-choice-toggle");
    if (!titulo) return;

    const posicaoNav = nav ? window.getComputedStyle(nav).position : "";
    const navFixa = posicaoNav === "fixed" || posicaoNav === "sticky";
    const alturaNav = navFixa ? nav.getBoundingClientRect().height : 0;
    const margem = 16;
    const destino =
      window.scrollY + titulo.getBoundingClientRect().top - alturaNav - margem;

    window.scrollTo({
      top: Math.max(0, destino),
      behavior: reduzMovimento.matches ? "instant" : "smooth",
    });
  }

  cardapios.forEach(function (cardapio) {
    const titulo = cardapio.querySelector(".menu-choice-toggle");
    if (!titulo) return;

    titulo.addEventListener("click", function (event) {
      event.preventDefault();

      if (cardapio.open) {
        cardapio.open = false;
        return;
      }

      cardapios.forEach(function (outro) {
        if (outro !== cardapio) outro.open = false;
      });
      cardapio.open = true;

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (cardapio.open) rolarParaCardapio(cardapio);
        });
      });
    });
  });
})();
