(() => {
"use strict";
const $ = id => document.getElementById(id);
const repo = "carolinefreire/ds_novelo";
const source = "carolinefreire/novelo";
let items = [], historyItems = [], selected = null, focusOrigin = null, originalDocument = null;
let historyLoaded=false, historyLoading=null, historyError="";
const PAGE_SIZE=12;
let currentPage=1;
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
const itemStatus = item => item.kind==="historico" ?
  (item.status==="aprovado" ? "Aprovada (Issue #10)" : "Não avaliada no JSON original")
  : (statusLabel[item.status]||item.status);
const filePath = item => (typeof item.path === "string" ? item.path : "");
const encodePath = path => path.split("/").map(encodeURIComponent).join("/");
const privateUrl = item => "https://github.com/" + source + "/blob/main/" + encodePath(filePath(item));
const previewPath = item => {
  if (item.kind === "historico") return item.preview || null;
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
  if(item.kind === "arquivo" || item.kind === "historico") {
    const img = E("img","asset-image");
    img.alt = "Prévia do arquivo " + item.name + ", " + itemStatus(item);
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
  $("dialog-category").textContent=item.category+" · "+itemStatus(item)+(item.originalSize?" · "+item.originalSize:"");
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
    "**ID do registro:** \`"+item.id+"\`",
    "**Nome:** "+item.name,
    "**Tipo:** "+item.kind+" / "+item.category,
    "**Estado da curadoria:** "+itemStatus(item),
    "**Arquivo de origem:** "+(item.kind==="icone"?"Biblioteca Lucide: "+item.name:item.kind==="historico"?"Arquivo histórico da conversa: "+item.name:filePath(item)),
    ...(item.sourceSha256?["**SHA-256 do original:** "+item.sourceSha256,"**Tamanho original:** "+item.originalSize]:[]),
    "**Prévia no Design System:** https://carolinefreire.github.io/ds_novelo/curadoria.html",
    "",
    item.kind==="historico"?"### Observação histórica":"### Observação anterior (JSON original)",
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
  const collection=$("collection-filter").value;
  const pool=collection==="historico"?historyItems:collection==="todos"?[...historyItems,...items]:items;
  const visible=pool.filter(item=>
    (status==="todos"||item.status===status) &&
    (kind==="todos"||item.kind===kind) &&
    [item.name,item.category,item.path,item.id,item.note,...(item.sources||[])].join(" ").toLocaleLowerCase("pt-BR").includes(term)
  );
  const subtitle=collection==="json"?"JSON original: 92 registros · 27 arquivos + 52 ícones + 13 elementos":
    collection==="historico"?"Histórico: "+historyItems.length+" de 95 imagens da conversa":
    "Acervo completo: 92 registros do JSON + "+historyItems.length+" de 95 imagens históricas";
  $("status").textContent=visible.length+" itens exibidos · "+subtitle+(historyLoading?" · carregando prévias…":"")+
    (historyError?" · "+historyError:"")+" · Issues não alteram arquivos";
  const pageCount=Math.max(1,Math.ceil(visible.length/PAGE_SIZE));
  currentPage=Math.max(1,Math.min(currentPage,pageCount));
  $("page-label").textContent="Página "+currentPage+" de "+pageCount+" · "+visible.length+" resultados";
  $("page-prev").disabled=currentPage<=1;
  $("page-next").disabled=currentPage>=pageCount;
  const pageItems=visible.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
  const grid=$("admin-gallery");grid.replaceChildren();
  if(!visible.length){
    grid.append(E("p","",historyLoading?"Carregando imagens…":"Nenhum item encontrado."));
    return;
  }
  for(const item of pageItems){
    const card=E("article","review-card");
    const thumb=E("button","review-thumb");thumb.type="button";
    thumb.setAttribute("aria-label","Ampliar "+item.name);
    thumb.append(createPreview(item));
    thumb.addEventListener("click",()=>openDialog(item,thumb));
    const data=E("div","review-details");
    data.append(E("span","review-label",item.kind==="historico"?"Histórico · "+item.category:item.category),E("h2","",item.name));
    data.append(E("p","review-path",item.kind==="historico"?(item.originalSize+" · prévia reduzida"):item.kind==="icone"?"lucide-react":filePath(item)));
    const chip=E("span","review-status "+(item.status==="aprovado"?"is-approved":item.status==="reprovado"?"is-rejected":""),itemStatus(item));
    data.append(chip);
    if(item.note)data.append(E("p","review-comment","Comentário: "+item.note));
    const act=E("button","review-open","Ampliar · abrir Issue");
    act.type="button";act.addEventListener("click",()=>openDialog(item,act));
    data.append(act);card.append(thumb,data);grid.append(card);
  }
}
async function ensureHistory(){
  if(historyLoaded||historyLoading)return historyLoading;
  historyError="";
  historyLoading=(async()=>{
    const manifestResponse=await fetch("data/historico-manifest.json",{cache:"no-store"});
    if(!manifestResponse.ok)throw Error("manifesto histórico HTTP "+manifestResponse.status);
    const manifest=await manifestResponse.json();
    if(manifest.schema!=="novelo-historico-manifest/v1"||manifest.total!==95||!Array.isArray(manifest.batchFiles))
      throw Error("Manifesto histórico inválido");
    const chunks=await Promise.all(manifest.batchFiles.map(async file=>{
      const res=await fetch(file,{cache:"force-cache"});
      if(!res.ok)throw Error(file+" HTTP "+res.status);
      const doc=await res.json();
      if(doc.schema!=="novelo-historico-preview/v1"||!Array.isArray(doc.items))throw Error(file+" inválido");
      return doc.items;
    }));
    const combined=chunks.flat();
    if(combined.length!==95||new Set(combined.map(i=>i.id)).size!==95)
      throw Error("O histórico não contém os 95 arquivos esperados");
    historyItems=combined;
    historyLoaded=true;
  })().catch(error=>{historyError=error.message;}).finally(()=>{historyLoading=null;render();});
  render();
  return historyLoading;
}
function collectionChanged(){
  currentPage=1;
  const c=$("collection-filter").value;
  if(c!=="json")ensureHistory();
  render();
}
$("search").addEventListener("input",()=>{currentPage=1;render();});
$("filter").addEventListener("change",()=>{currentPage=1;render();});
$("kind-filter").addEventListener("change",()=>{
  const kind=$("kind-filter").value;
  if(kind==="historico")$("collection-filter").value="historico";
  else if(kind!=="todos"&&$("collection-filter").value==="historico")$("collection-filter").value="json";
  collectionChanged();
});
$("collection-filter").addEventListener("change",collectionChanged);
$("page-prev").addEventListener("click",()=>{if(currentPage>1){currentPage--;render();$("status").scrollIntoView({behavior:"smooth",block:"start"});}});
$("page-next").addEventListener("click",()=>{currentPage++;render();$("status").scrollIntoView({behavior:"smooth",block:"start"});});
$("export").addEventListener("click",()=>{
  const data={...originalDocument,exportedWithNotesAt:new Date().toISOString(),
    exportNote:"O original de 24/11/2026 foi preservado. Notas adicionais ficam em reviewNotes; criar Issues não muda o repositório.",
    reviewNotes:notes,
    historyInventory:historyItems.map(({preview,...item})=>item)};
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
  if($("collection-filter").value!=="json")void ensureHistory();
}).catch(error=>{
  $("status").textContent="Não foi possível carregar os 92 registros do JSON original: "+error.message;
});
})();