(() => {
"use strict";
const $ = id => document.getElementById(id);
const repo = "carolinefreire/ds_novelo";
let items = [];
let selected = null;
let selectedButton = null;
const storageKey = "novelo-ds-curadoria-notas/v2";
let notes = {};
try { const saved = JSON.parse(localStorage.getItem(storageKey) || "{}"); if(saved && typeof saved==="object") notes=saved; } catch {}
function E(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n;}
function noteFor(i){return typeof notes[i.path]==="string"?notes[i.path]:"";}
function saveNote(i,note){notes[i.path]=note;try{localStorage.setItem(storageKey,JSON.stringify(notes));}catch{}}
function isApproved(i){return i.status==="aprovado"}
function readable(i){return isApproved(i)?"Aprovada":i.status==="reprovado_historico"?"Rejeitada em uso anterior":"Pendente"}
function dialogClose(){if($("action-dialog").open)$("action-dialog").close();if(selectedButton)selectedButton.focus();}
function openDialog(item,button){
  selected=item;selectedButton=button;
  $("dialog-title").textContent=item.name;
  $("dialog-category").textContent=item.category+" · "+readable(item);
  $("dialog-preview").src=item.image;$("dialog-preview").alt=item.name;
  $("dialog-note").value=noteFor(item);
  $("dialog-help").textContent="O GitHub solicitará seu login e a confirmação antes de registrar esta decisão.";
  $("action-dialog").showModal();
  $("dialog-close").focus();
}
function issueUrl(item,action,note){
  const machine = [
    "<!-- NOVELO_CURADORIA_V1",
    "acao="+action,
    "repo=carolinefreire/novelo",
    "arquivo="+item.path,
    "categoria="+item.category.replace(/[\r\n=]/g,""),
    "-->"
  ].join("\n");
  const actionName={aprovar:"Aprovar",desaprovar:"Desaprovar",ajustar:"Ajustar"}[action];
  const text=[
    "### "+actionName+" · Design System Novelo",
    "**Arquivo original:** \`"+item.path+"\`",
    "**Situação no catálogo:** "+readable(item),
    "**Visualização:** "+item.image,
    "",
    "### Comentário",
    note.trim()||"Sem observações adicionais.",
    "",
    "### Registro de decisão (não editar)",
    machine,
    "",
    "> Só solicitações criadas por carolinefreire podem executar alterações automáticas. Ajustar registra o pedido para revisão visual, mas não gera a imagem sozinho."
  ].join("\n");
  return "https://github.com/"+repo+"/issues/new?"+
   new URLSearchParams({title:"[Curadoria] "+actionName+" · "+item.name,body:text}).toString();
}
function submitAction(action){
  if(!selected)return;
  const note=$("dialog-note").value.trim();
  if(action==="ajustar"&&!note){
    $("dialog-help").textContent="Descreva a alteração antes de abrir a solicitação.";
    $("dialog-note").focus();return;
  }
  if(action==="desaprovar"&&!window.confirm("Confirmar o pedido de exclusão do arquivo selecionado? O GitHub bloqueará arquivos protegidos ou usados no app."))return;
  saveNote(selected,note);
  const url=issueUrl(selected,action,note);
  window.open(url,"_blank","noopener,noreferrer");
  $("dialog-help").textContent="Solicitação preparada e aberta no GitHub. O status só muda depois do envio e da confirmação no repositório.";
}
$("approve").addEventListener("click",()=>submitAction("aprovar"));
$("reject").addEventListener("click",()=>submitAction("desaprovar"));
$("alter").addEventListener("click",()=>submitAction("ajustar"));
$("dialog-close").addEventListener("click",dialogClose);
$("action-dialog").addEventListener("click",event=>{if(event.target===$("action-dialog"))dialogClose();});
function render(){
  const term=$("search").value.trim().toLocaleLowerCase("pt-BR");
  const status=$("filter").value;
  const visible=items.filter(i=>{
    const matches=status==="todos"||(status==="aprovado"?isApproved(i):!isApproved(i));
    return matches&&[i.name,i.category,i.path,i.notes||""].join(" ").toLocaleLowerCase("pt-BR").includes(term);
  });
  $("status").textContent=visible.length+" de "+items.length+" arquivos públicos · somente decisões autorizadas são executadas";
  const grid=$("admin-gallery");grid.replaceChildren();
  if(!visible.length){grid.append(E("p","","Nenhum arquivo encontrado."));return;}
  for(const item of visible){
    const card=E("article","review-card");
    const imageButton=E("button","review-thumb");imageButton.type="button";imageButton.setAttribute("aria-label","Ampliar "+item.name);
    const image=E("img");image.src=item.image;image.alt=item.name;image.loading="lazy";
    imageButton.append(image);imageButton.addEventListener("click",()=>openDialog(item,imageButton));
    const data=E("div","review-details");
    data.append(E("span","review-label",item.category),E("h2","",item.name),E("p","",item.path));
    const chip=E("span","review-status "+(isApproved(item)?"is-approved":item.status==="reprovado_historico"?"is-rejected":""),readable(item));data.append(chip);
    if(item.notes)data.append(E("p","",item.notes));
    const act=E("button","review-open","Ver e decidir ↗");act.type="button";act.addEventListener("click",()=>openDialog(item,act));data.append(act);
    card.append(imageButton,data);grid.append(card);
  }
}
$("search").addEventListener("input",render);
$("filter").addEventListener("change",render);
$("export").addEventListener("click",()=>{
  const exportData={schema:"novelo-ds-curadoria-export/v2",repository:repo,exportedAt:new Date().toISOString(),statusExplanation:"Exportação local; ações do GitHub só são efetivadas após envio e autorização.",items:items.map(i=>({...i,note:noteFor(i)}))};
  const href=URL.createObjectURL(new Blob([JSON.stringify(exportData,null,2)],{type:"application/json"}));
  const anchor=E("a");anchor.href=href;anchor.download="novelo-ds-curadoria.json";document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(href),2000);
});
fetch("data/review-catalog.json",{cache:"no-cache"}).then(async r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json();}).then(data=>{
  if(!Array.isArray(data.items))throw Error("Catálogo inválido");
  items=data.items;$("total").textContent=String(items.length);
  $("aprovados").textContent=String(items.filter(isApproved).length);
  $("pendentes").textContent=String(items.filter(i=>!isApproved(i)).length);
  render();
}).catch(()=>{$("status").textContent="Não foi possível carregar o catálogo. Acesse o site pelo GitHub Pages em vez de abrir o HTML diretamente.";});
})();