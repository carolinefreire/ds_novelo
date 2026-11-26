(() => {
"use strict";
const $ = id => document.getElementById(id);
const repo = "carolinefreire/ds_novelo";
let items = [], selected = null, focusOrigin = null;
const storageKey = "novelo-ds-curadoria-notas/v2";
let notes = {};
try {
  const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
  if (value && typeof value === "object" && !Array.isArray(value)) notes = value;
} catch {}
const E = (tag, cls, value) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (value !== undefined) node.textContent = value;
  return node;
};
const isApproved = item => item.status === "aprovado";
const readable = item => isApproved(item) ? "Aprovada" :
  item.status === "reprovado_historico" ? "Rejeitada anteriormente" : "Pendente";
const privateUrl = item => "https://github.com/carolinefreire/novelo/blob/main/" +
  item.path.split("/").map(encodeURIComponent).join("/");
function closeDialog() {
  if ($("action-dialog").open) $("action-dialog").close();
  focusOrigin?.focus();
}
function setPreview(img, item, fallback) {
  img.alt = item.name;
  img.loading = "lazy";
  img.onerror = () => {
    img.hidden = true;
    fallback.hidden = false;
  };
  if (item.image) {
    img.hidden = false;
    img.src = item.image;
    fallback.hidden = true;
  } else {
    img.removeAttribute("src");
    img.hidden = true;
    fallback.hidden = false;
  }
}
function openDialog(item, origin) {
  selected = item;
  focusOrigin = origin;
  $("dialog-title").textContent = item.name;
  $("dialog-category").textContent = item.category + " · " + readable(item);
  const img = $("dialog-preview"), unavailable = $("private-preview");
  setPreview(img, item, unavailable);
  // This link needs GitHub authorization, since the original repository is private.
  $("private-view").href = privateUrl(item);
  $("dialog-note").value = typeof notes[item.path] === "string" ? notes[item.path] : "";
  $("dialog-help").textContent = "A Issue registra seu pedido, sem alterar arquivos ou decisões.";
  $("action-dialog").showModal();
  $("dialog-close").focus();
}
function issueUrl(item, note) {
  const original = item.path;
  const body = [
    "## Solicitação de ajuste · Design System Novelo",
    "",
    "**Imagem:** " + item.name,
    "**Arquivo de origem:** `" + original + "`",
    "**Categoria:** " + item.category,
    "**Estado exibido:** " + readable(item),
    "**Prévia pública:** " + (item.image ?
      "https://carolinefreire.github.io/ds_novelo/" + item.image : "Ainda não disponível"),
    "",
    "### Ajuste ou observação",
    note,
    "",
    "> Este registro é uma sugestão pública. Não aprova, exclui nem modifica código ou imagens. A responsável revisará manualmente."
  ].join("\n");
  return "https://github.com/" + repo + "/issues/new?" +
    new URLSearchParams({title:"[Curadoria] Ajuste · " + item.name,body}).toString();
}
$("alter").addEventListener("click", () => {
  if (!selected) return;
  const note = $("dialog-note").value.trim();
  if (!note) {
    $("dialog-help").textContent = "Escreva o ajuste ou observação para abrir a Issue.";
    $("dialog-note").focus();
    return;
  }
  notes[selected.path] = note;
  try { localStorage.setItem(storageKey, JSON.stringify(notes)); } catch {}
  window.open(issueUrl(selected, note), "_blank", "noopener,noreferrer");
  $("dialog-help").textContent = "Issue preparada. Confirme o envio na página do GitHub. Nada é alterado automaticamente.";
});
$("dialog-close").addEventListener("click", closeDialog);
$("action-dialog").addEventListener("click", event => {
  if (event.target === $("action-dialog")) closeDialog();
});
function render() {
  const term = $("search").value.trim().toLocaleLowerCase("pt-BR");
  const status = $("filter").value;
  const visible = items.filter(item =>
    (status === "todos" || (status === "aprovado" ? isApproved(item) : !isApproved(item))) &&
    [item.name,item.category,item.path,item.notes || ""].join(" ").toLocaleLowerCase("pt-BR").includes(term)
  );
  const renderable = items.filter(item => Boolean(item.image)).length;
  $("status").textContent = visible.length + " de " + items.length +
    " itens · " + renderable + " com arquivos de prévia publicados · Issues não alteram o repositório";
  const grid = $("admin-gallery");
  grid.replaceChildren();
  if (!visible.length) {
    grid.append(E("p", "", "Nenhum arquivo encontrado."));
    return;
  }
  for (const item of visible) {
    const card = E("article","review-card");
    const thumb = E("button","review-thumb");
    thumb.type = "button";
    thumb.setAttribute("aria-label", "Ampliar " + item.name);
    const image = E("img");
    const unavailable = E("div","review-locked","Prévia indisponível · original privado");
    thumb.append(image, unavailable);
    setPreview(image,item,unavailable);
    thumb.addEventListener("click",() => openDialog(item,thumb));
    const data = E("div","review-details");
    data.append(E("span","review-label",item.category),E("h2","",item.name),E("p","",item.path));
    data.append(E("span","review-status " + (isApproved(item) ? "is-approved" :
      item.status === "reprovado_historico" ? "is-rejected" : ""), readable(item)));
    if (item.notes) data.append(E("p","",item.notes));
    const open = E("button","review-open",item.image ? "Ampliar e abrir Issue ↗" : "Detalhes e abrir Issue ↗");
    open.type = "button";
    open.addEventListener("click",() => openDialog(item,open));
    data.append(open);
    card.append(thumb,data);
    grid.append(card);
  }
}
$("search").addEventListener("input",render);
$("filter").addEventListener("change",render);
$("export").addEventListener("click", () => {
  const data = {
    schema:"novelo-ds-curadoria-export/v3",repository:repo,
    exportedAt:new Date().toISOString(),
    statusExplanation:"Exportação consultiva; registros de ajuste são feitos somente por Issues e nunca alteram arquivos automaticamente.",
    items:items.map(item => ({...item,note:typeof notes[item.path] === "string" ? notes[item.path] : ""}))
  };
  const href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  const anchor = E("a");
  anchor.href = href;
  anchor.download = "novelo-ds-curadoria.json";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(href),2000);
});
fetch("data/review-catalog.json",{cache:"no-cache"}).then(async response => {
  if (!response.ok) throw Error("HTTP " + response.status);
  return response.json();
}).then(data => {
  if (!Array.isArray(data.items)) throw Error("Catálogo inválido");
  items = data.items;
  $("total").textContent = String(items.length);
  $("aprovados").textContent = String(items.filter(isApproved).length);
  $("pendentes").textContent = String(items.filter(item => !isApproved(item)).length);
  render();
}).catch(() => {
  $("status").textContent = "Não foi possível carregar o catálogo. Acesse o site publicado no GitHub Pages.";
});
})();
