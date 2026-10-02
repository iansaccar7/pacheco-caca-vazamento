(() => {
  const root = document.documentElement;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const heading = document.querySelector("h1");
  if (heading) {
    heading.innerHTML = heading.innerHTML
      .split(/<br\s*\/?\s*>/i)
      .map((line) => `<span class="hero-line"><span>${line}</span></span>`)
      .join("");
  }
  const reveal = [
    ...document.querySelectorAll(
      ".section-head, .sign, .meter, .quotes blockquote, .gallery-grid figure, .step, .faq-list article, .service, .service-featured, .garden-strip .photo, .comparison-cover figure, .studio-photo",
    ),
  ];
  reveal.forEach((el, i) => {
    el.dataset.reveal = el.matches("figure, .photo") ? "image" : "text";
    el.style.setProperty("--reveal-delay", `${el.matches(".step") ? (i % 3) * 90 : 0}ms`);
  });
  let observer;
  const gallery = document.querySelector("body.mge #galeria");
  const track = gallery?.querySelector(".gallery-grid");
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    if (root.dataset.motion !== "enabled") return;
    if (track) {
      const wide = innerWidth > 760;
      const rect = gallery.getBoundingClientRect();
      const distance = Math.max(1, gallery.offsetHeight - innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      const travel = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
      track.style.transform = wide ? `translate3d(${-progress * travel}px,0,0)` : "";
    }
    document.querySelectorAll(".steps-grid").forEach((grid) => {
      const rect = grid.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (innerHeight * 0.7 - rect.top) / rect.height));
      grid.style.setProperty("--step-progress", progress);
    });
  }
  function requestUpdate() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateScroll);
    }
  }
  function initialize() {
    observer?.disconnect();
    if (preference.matches || !("IntersectionObserver" in window)) {
      root.dataset.motion = "reduced";
      reveal.forEach((el) => el.classList.add("is-visible"));
      if (track) track.style.transform = "";
      return;
    }
    root.dataset.motion = "enabled";
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -35px 0px" },
    );
    reveal.forEach((el) => observer.observe(el));
    updateScroll();
  }
  initialize();
  preference.addEventListener("change", initialize);
  addEventListener("scroll", requestUpdate, { passive: true });
  addEventListener("resize", requestUpdate);
  // Anchor navigation and keyboard focus must never land on hidden content.
  addEventListener("focusin", (event) =>
    event.target.closest("[data-reveal]")?.classList.add("is-visible"),
  );
})();

// Goteiras: cada gota cai do topo do hero e abre uma onda na faixa de água.
(() => {
  const wrap = document.querySelector(".hero > .wrap");
  const pool = wrap?.querySelector(".conversation-bottom");
  if (!pool) return;
  const rain = document.createElement("div");
  rain.className = "rain";
  rain.setAttribute("aria-hidden", "true");
  [[3, 0], [7, 1.4], [11, 2.5], [89, 0.7], [93, 2], [97, 3]].forEach(([x, delay]) => {
    for (const [el, parent] of [[document.createElement("i"), rain], [document.createElement("i"), pool]]) {
      el.className = parent === rain ? "drop" : "ripple";
      el.style.cssText = `left:${x}%;animation-delay:${delay}s`;
      parent.append(el);
    }
  });
  wrap.prepend(rain);
  const measure = () =>
    rain.style.setProperty(
      "--fall",
      `${pool.getBoundingClientRect().top - rain.getBoundingClientRect().top + 8}px`,
    );
  measure();
  addEventListener("resize", measure);
  document.fonts?.ready.then(measure);
  pool.addEventListener("pointerdown", (event) => {
    if (document.documentElement.dataset.motion !== "enabled") return;
    const box = pool.getBoundingClientRect();
    const ring = document.createElement("i");
    ring.className = "tap-ripple";
    ring.style.cssText = `left:${event.clientX - box.left}px;top:${event.clientY - box.top}px`;
    ring.addEventListener("animationend", () => ring.remove());
    pool.append(ring);
  });
})();

// Teste do hidrômetro: a resposta mostra o próximo passo e muda o giro do ponteiro.
(() => {
  const test = document.querySelector("[data-meter]");
  if (!test) return;
  const buttons = test.querySelectorAll("[data-answer]");
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      test.dataset.state = button.dataset.answer;
      buttons.forEach((b) => b.setAttribute("aria-pressed", b === button));
      test.querySelectorAll(".meter-result").forEach((r) => {
        r.hidden = r.dataset.result !== button.dataset.answer;
      });
    }),
  );
})();
