(() => {
"use strict";
const $ = id => document.getElementById(id);
const repo = "carolinefreire/ds_novelo";
const source = "carolinefreire/novelo";
let items = [], selected = null, focusOrigin = null, originalDocument = null;
const storageKey = "novelo-ds-curadoria-notas/v3";
let notes = {};
try {
  const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
  if (value && typeof value === "object" && !Array.isArray(value)) notes = value;
} catch {}

const E = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
};

const swatches = Object.freeze({
  "--yarn-red": "oklch(0.6 0.21 30)",
  "--yarn-orange": "oklch(0.72 0.17 55)",
  "--yarn-yellow": "oklch(0.83 0.15 85)",
  "--yarn-green": "oklch(0.55 0.12 160)",
  "--yarn-blue": "oklch(0.45 0.16 265)",
  "--yarn-purple": "oklch(0.52 0.18 310)",
  "--yarn-pink": "oklch(0.6 0.22 355)",
  "--blob-peach": "oklch(0.85 0.08 40)",
  "--blob-butter": "oklch(0.89 0.11 90)",
  "--blob-lavender": "oklch(0.84 0.06 305)"
});
const yarn = ["--yarn-red","--yarn-orange","--yarn-yellow","--yarn-green","--yarn-blue","--yarn-purple","--yarn-pink"];
const rainbow = "linear-gradient(90deg," + yarn.map(k => swatches[k]).join(",") + ")";
const statusLabel = {aprovado:"Aprovado",reprovado:"Reprovado",pendente:"Pendente"};
const filePath = item => (typeof item.path === "string" ? item.path : "");
const encodePath = path => path.split("/").map(encodeURIComponent).join("/");
const privateUrl = item => "https://github.com/" + source + "/blob/main/" + encodePath(filePath(item));
const previewPath = item => {
  if (item.kind !== "arquivo") return null;
  const path = filePath(item);
  if (path === "public/logo-novelo.png") return "assets/brand/logo-novelo.png";
  if (path.startsWith("public/brand/personagens/")) {
    const approvedName = path.slice("public/brand/personagens/".length);
    if (["diego_voluntario.svg","joana_voluntaria.svg","lucia_voluntaria.svg","marina_voluntaria.svg","rafael_voluntario.svg"].includes(approvedName))
      return "assets/" + approvedName;
  }
  if (path === "public/brand/tres-geracoes-tecendo-juntas.svg") return "assets/tres-geracoes-tecendo-juntas.svg";
  return "assets/previews/" + path + (/\.svg$/i.test(path) ? "" : ".svg");
};
function iconName(item) {
  // React exports FooIcon and Foo are the same Lucide drawing; their JSON records stay distinct.
  const raw = String(item.name || "").replace(/Icon$/,"");
  return raw.replace(/([a-z0-9])([A-Z])/g,"$1-$2").replace(/([A-Z])([A-Z][a-z])/g,"$1-$2").toLowerCase();
}
function createPreview(item, expanded = false) {
  const frame = E("div","asset-frame" + (expanded ? " is-expanded" : ""));
  if(item.kind === "arquivo") {
    const img = E("img","asset-image");
    img.alt = "Prévia do arquivo " + item.name + ", " + (statusLabel[item.status] || item.status);
    img.loading = expanded ? "eager" : "lazy";
    const unavailable = E("span","asset-unavailable","Prévia não disponível para este arquivo");
    unavailable.hidden = true;
    img.onerror = () => { img.hidden = true; unavailable.hidden = false; };
    img.onload = () => { img.hidden = false; unavailable.hidden = true; };
    const path = previewPath(item);
    if(path) img.src = path;
    else {img.hidden = true;unavailable.hidden = false;}
    frame.append(img,unavailable);
    return frame;
  }
  if(item.kind === "icone") {
    const img = E("img","asset-lucide");
    img.alt = "Ícone Lucide: " + item.name;
    img.loading = expanded ? "eager" : "lazy";
    const fallback = E("span","asset-unavailable", "Ícone " + item.name + " · Lucide");
    fallback.hidden = true;
    img.onerror = () => {img.hidden = true; fallback.hidden = false;};
    img.onload = () => {img.hidden = false; fallback.hidden = true;};
    img.src = "https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/icons/" + iconName(item) + ".svg";
    frame.append(img,fallback);
    return frame;
  }
  const kind = String(item.id || "");
  if (kind === "elemento:brand.tsx:BriefcaseYarn") {
    const wrap=E("div","brand-preview");
    // Exact paths and stroke width from src/components/novelo/brand.tsx, not the approved logo.
    wrap.innerHTML = '<svg viewBox="0 0 64 56" role="img" aria-label="Componente de código BriefcaseYarn"><defs><linearGradient id="yarn-briefcase"><stop offset="0%" stop-color="#D74C41"/><stop offset="18%" stop-color="#EF9542"/><stop offset="34%" stop-color="#F4C93C"/><stop offset="52%" stop-color="#439B74"/><stop offset="70%" stop-color="#3B68B5"/><stop offset="85%" stop-color="#9458B4"/><stop offset="100%" stop-color="#C65B99"/></linearGradient></defs><g stroke="url(#yarn-briefcase)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M22 14V9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v5"/><rect x="5" y="14" width="54" height="37" rx="9"/><path d="M5 28c14 8 24-6 54 4"/></g></svg>';
    wrap.append(E("span","visual-explainer","Componente do código, não é a maletinha oficial"));
    frame.append(wrap);return frame;
  }
  if (kind === "elemento:brand.tsx:Blob") {
    const blob=E("div","blob-preview");
    blob.style.backgroundColor=swatches["--blob-peach"];
    blob.style.borderRadius="58% 42% 52% 48% / 46% 56% 44% 54%";
    blob.append(E("span","","Blob"));
    frame.append(blob);return frame;
  }
  if (kind === "elemento:styles.css:gradient-yarn") {
    const gradient=E("div","gradient-preview");
    gradient.style.background=rainbow;
    frame.append(gradient);return frame;
  }
  const colorKey=String(item.name || "");
  if(swatches[colorKey]) {
    const chip=E("div","swatch-preview");
    chip.style.backgroundColor=swatches[colorKey];
    const legend=E("span","swatch-legend",swatches[colorKey]);
    frame.append(chip,legend);return frame;
  }
  frame.append(E("span","asset-unavailable",item.name));
  return frame;
}
function closeDialog(){
  if($("action-dialog").open) $("action-dialog").close();
  focusOrigin?.focus();
}
function openDialog(item,origin){
  selected=item;focusOrigin=origin;
  $("dialog-title").textContent=item.name;
  $("dialog-category").textContent=item.category+" · "+statusLabel[item.status];
  const render=$("dialog-render");
  render.replaceChildren(createPreview(item,true));
  $("dialog-preview").hidden=true;
  $("private-preview").hidden=true;
  $("dialog-note").value=typeof notes[item.id]==="string" ? notes[item.id] : "";
  $("dialog-help").textContent="Uma Issue registra o comentário para revisão. Não aprova, exclui nem altera arquivos.";
  $("action-dialog").showModal();
  $("dialog-close").focus();
}
function issueUrl(item,note){
  const body=[
    "## Solicitação de revisão · Design System Novelo",
    "",
    "**ID do JSON original:** \`"+item.id+"\`",
    "**Nome:** "+item.name,
    "**Tipo:** "+item.kind+" / "+item.category,
    "**Estado registrado em 24/11/2026:** "+(statusLabel[item.status]||item.status),
    "**Arquivo de origem:** "+(item.kind==="icone"?"Biblioteca Lucide: "+item.name:filePath(item)),
    "**Prévia no Design System:** https://carolinefreire.github.io/ds_novelo/curadoria.html",
    "",
    "### Observação anterior (JSON original)",
    item.note?.trim()||"Sem comentário anterior.",
    "",
    "### Ajuste solicitado agora",
    note,
    "",
    "> Esta Issue é uma solicitação pública de revisão. Nenhuma aprovação, exclusão ou alteração de arquivos é executada automaticamente."
  ].join("\n");
  return "https://github.com/"+repo+"/issues/new?"+new URLSearchParams({title:"[Curadoria] "+item.name+" · "+item.id,body}).toString();
}
$("alter").addEventListener("click",()=>{
  if(!selected)return;
  const note=$("dialog-note").value.trim();
  if(!note){$("dialog-help").textContent="Escreva um ajuste ou observação antes de abrir a Issue.";$("dialog-note").focus();return;}
  notes[selected.id]=note;
  try{localStorage.setItem(storageKey,JSON.stringify(notes));}catch{}
  window.open(issueUrl(selected,note),"_blank","noopener,noreferrer");
  $("dialog-help").textContent="Issue preparada. Envie-a no GitHub; nada será alterado automaticamente.";
});
$("dialog-close").addEventListener("click",closeDialog);
$("action-dialog").addEventListener("click",event=>{if(event.target===$("action-dialog"))closeDialog();});
function render(){
  const term=$("search").value.trim().toLocaleLowerCase("pt-BR");
  const status=$("filter").value;
  const kind=$("kind-filter").value;
  const visible=items.filter(item=>
    (status==="todos"||item.status===status) &&
    (kind==="todos"||item.kind===kind) &&
    [item.name,item.category,item.path,item.id,item.note,...(item.sources||[])].join(" ").toLocaleLowerCase("pt-BR").includes(term)
  );
  $("status").textContent=visible.length+" de "+items.length+" registros do JSON original · 27 arquivos gráficos + 52 ícones + 13 elementos · somente Issues";
  const grid=$("admin-gallery");grid.replaceChildren();
  if(!visible.length){grid.append(E("p","","Nenhum item encontrado."));return;}
  for(const item of visible){
    const card=E("article","review-card");
    const thumb=E("button","review-thumb");thumb.type="button";
    thumb.setAttribute("aria-label","Ampliar "+item.name);
    thumb.append(createPreview(item));
    thumb.addEventListener("click",()=>openDialog(item,thumb));
    const data=E("div","review-details");
    data.append(E("span","review-label",item.category),E("h2","",item.name));
    data.append(E("p","review-path",item.kind==="icone"?"lucide-react":filePath(item)));
    const chip=E("span","review-status "+(item.status==="aprovado"?"is-approved":item.status==="reprovado"?"is-rejected":""),statusLabel[item.status]||item.status);
    data.append(chip);
    if(item.note)data.append(E("p","review-comment","Comentário original: "+item.note));
    const act=E("button","review-open","Ampliar · abrir Issue");
    act.type="button";
    act.addEventListener("click",()=>openDialog(item,act));
    data.append(act);
    card.append(thumb,data);grid.append(card);
  }
}
$("search").addEventListener("input",render);
$("filter").addEventListener("change",render);
$("kind-filter").addEventListener("change",render);
$("export").addEventListener("click",()=>{
  const data={...originalDocument,exportedWithNotesAt:new Date().toISOString(),
    exportNote:"O original de 24/11/2026 foi preservado. Notas adicionais ficam em reviewNotes; criar Issues não muda o repositório.",
    reviewNotes:notes};
  const href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  const anchor=E("a");anchor.href=href;anchor.download="novelo-ds-curadoria-revisao.json";
  document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(href),2000);
});
fetch("data/curadoria-original-2026-11-24.json",{cache:"no-store"}).then(async response=>{
  if(!response.ok)throw Error("HTTP "+response.status);
  return response.json();
}).then(data=>{
  if(data.schema!=="novelo-ds-curadoria/v1"||!Array.isArray(data.items)||data.items.length!==92)
    throw Error("O JSON original não corresponde à versão esperada.");
  originalDocument=data;
  items=data.items;
  $("total").textContent=String(items.length);
  $("aprovados").textContent=String(items.filter(i=>i.status==="aprovado").length);
  $("reprovados").textContent=String(items.filter(i=>i.status==="reprovado").length);
  $("pendentes").textContent=String(items.filter(i=>i.status==="pendente").length);
  render();
}).catch(error=>{
  $("status").textContent="Não foi possível carregar os 92 registros do JSON original: "+error.message;
});
})();