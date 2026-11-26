(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const navButton = document.querySelector(".nav-toggle");
  const nav = $("menu");
  navButton?.addEventListener("click", () => {
    const expanded = navButton.getAttribute("aria-expanded") !== "true";
    navButton.setAttribute("aria-expanded", String(expanded));
    nav.classList.toggle("is-open", expanded);
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navButton?.setAttribute("aria-expanded", "false");
  }));
  const year = $("year");
  if (year) year.textContent = String(new Date().getFullYear());
  const grid = $("gallery-grid");
  if (!grid) return;
  let catalogue = [];
  let selectedFilter = "Todos";
  const approved = (item) => item.status === "aprovado" && item.path;
  function element(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  const viewer = $("viewer");
  const viewerClose = viewer?.querySelector(".viewer-close");
  const viewerImage = $("viewer-img");
  const viewerCat = $("viewer-cat");
  const viewerTitle = $("viewer-title");
  const viewerCaption = $("viewer-caption");
  const viewerSource = $("viewer-source");
  let focusOrigin = null;
  function closeViewer() {
    if (viewer?.open) viewer.close();
    focusOrigin?.focus();
  }
  viewerClose?.addEventListener("click", closeViewer);
  viewer?.addEventListener("click", (event) => {
    if (event.target === viewer) closeViewer();
  });
  function openViewer(item, origin) {
    if (!viewer?.showModal) { window.open(item.path, "_blank", "noopener,noreferrer"); return; }
    focusOrigin = origin;
    viewerImage.src = item.path;
    viewerImage.alt = item.alt || item.name;
    viewerCat.textContent = item.category + " · Arte aprovada";
    viewerTitle.textContent = item.name;
    viewerCaption.textContent = item.caption || "";
    viewerSource.href = "https://github.com/carolinefreire/novelo/blob/main/" + encodeURI(item.source || "");
    viewer.showModal();
    viewerClose?.focus();
  }
  function render() {
    const active = catalogue.filter(i => approved(i) && (selectedFilter === "Todos" || selectedFilter === i.category));
    $("gallery-count").textContent = active.length + (active.length === 1 ? " elemento" : " elementos");
    grid.replaceChildren();
    if (!active.length) {
      grid.append(element("p", "", "Nenhuma imagem aprovada corresponde ao filtro."));
      return;
    }
    for (const item of active) {
      const card = element("article", "gallery-card");
      const button = element("button", "gallery-preview");
      button.type = "button";
      button.setAttribute("aria-label", "Ampliar " + item.name);
      const image = element("img");
      image.src = item.path;
      image.alt = item.alt || item.name;
      image.loading = "lazy";
      const zoom = element("span", "gallery-zoom", "⤢");
      zoom.setAttribute("aria-hidden", "true");
      button.append(image, zoom);
      button.addEventListener("click", () => openViewer(item, button));
      const body = element("div", "gallery-body");
      body.append(element("small", "", item.category), element("h3", "", item.name), element("p", "", item.caption));
      card.append(button, body);
      grid.append(card);
    }
  }
  document.querySelectorAll(".chip[data-filter]").forEach(button => button.addEventListener("click", () => {
    selectedFilter = button.dataset.filter || "Todos";
    document.querySelectorAll(".chip[data-filter]").forEach(other => {
      const isActive = other === button;
      other.classList.toggle("active", isActive);
      other.setAttribute("aria-pressed", String(isActive));
    });
    render();
  }));
  fetch("data/acervo.json", { cache: "no-cache" })
    .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(data => {
      if (!Array.isArray(data.records)) throw new Error("Catálogo inválido");
      catalogue = data.records;
      render();
    })
    .catch(() => {
      grid.replaceChildren(element("p", "", "Não foi possível carregar o catálogo. Abra a versão publicada no GitHub Pages; arquivos locais podem bloquear a leitura de JSON."));
      $("gallery-count").textContent = "Indisponível";
    });
})();