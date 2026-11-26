/**
 * Curadoria Novelo no GitHub Actions.
 * Somente Issues criadas por carolinefreire disparam alterações.
 * GITHUB_TOKEN modifica ds_novelo; NOVELO_GITHUB_TOKEN (fine-grained)
 * modifica carolinefreire/novelo com permissão Contents: Read & Write.
 */
import fs from "node:fs";
import { createHash } from "node:crypto";

const admin = "carolinefreire";
const dsRepo = "carolinefreire/ds_novelo";
const appRepo = "carolinefreire/novelo";
const ghToken = process.env.GITHUB_TOKEN;
const appToken = process.env.NOVELO_GITHUB_TOKEN;
const eventPath = process.env.GITHUB_EVENT_PATH;

function validPath(path) {
  if(typeof path !== "string" || path.length>270 || path.includes("..") || path.includes("\\") || path.startsWith("/") || !/^[\p{L}\p{N}_/.\- ]+$/u.test(path)) throw Error("Caminho inválido.");
  if(!/^(public\/|src\/assets\/)/.test(path) || !/\.(svg|png|jpe?g|webp|ico)$/i.test(path)) throw Error("Fora do acervo visual permitido.");
  return path;
}
function normalizeCategory(cat) {
  const slug=String(cat||"diversos").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,55);
  return slug||"diversos";
}
const encodePath = path => path.split("/").map(encodeURIComponent).join("/");
function asUrl(route){return "https://api.github.com/"+route;}
async function request(token, method, route, data) {
  if(!token)throw Error("Credencial de servidor não configurada.");
  const response=await fetch(asUrl(route),{
    method,headers:{
      "Authorization":"Bearer "+token,
      "Accept":"application/vnd.github+json",
      "X-GitHub-Api-Version":"2022-11-28",
      ...(data?{"Content-Type":"application/json"}:{})
    },...(data?{body:JSON.stringify(data)}:{})
  });
  if(response.status===404 && method==="GET")return null;
  if(!response.ok)throw Error("GitHub "+response.status+" ("+method+" "+route.split("?")[0]+")");
  if(response.status===204)return null;
  return response.json();
}
async function readFile(token, repo, path) {
  const file=await request(token,"GET","repos/"+repo+"/contents/"+encodePath(path)+"?ref=main");
  if(!file)return null;
  if(Array.isArray(file) || !file.sha)throw Error("Caminho não é um arquivo.");
  let content=file.content;
  if(file.encoding!=="base64"){
    const blob=await request(token,"GET","repos/"+repo+"/git/blobs/"+file.sha);
    if(!blob||blob.encoding!=="base64")throw Error("Não foi possível recuperar bytes do original.");
    content=blob.content;
  }
  return {path,sha:file.sha,bytes:Buffer.from(content.replace(/\s/g,""),"base64")};
}
async function writeFile(token,repo,path,bytes,message) {
  const old=await readFile(token,repo,path);
  const raw=bytes.toString("base64");
  if(old && old.bytes.equals(bytes))return {path,changed:false};
  await request(token,"PUT","repos/"+repo+"/contents/"+encodePath(path),{
    message,branch:"main",content:raw,...(old?{sha:old.sha}:{})
  });
  return {path,changed:true};
}
async function deleteFile(token,repo,path,sha,message) {
  await request(token,"DELETE","repos/"+repo+"/contents/"+encodePath(path),{message,sha,branch:"main"});
}
async function readJson(token,repo,path,fallback){
  const f=await readFile(token,repo,path);
  return f?JSON.parse(f.bytes.toString("utf8")):fallback;
}
async function appendHistory(data) {
  const path="data/historico-curadoria.json";
  const historical=await readJson(ghToken,dsRepo,path,{schema:"novelo-curadoria-historico/v1",decisions:[]});
  if(!Array.isArray(historical.decisions))throw Error("Histórico inválido.");
  historical.decisions.push(data);
  await writeFile(ghToken,dsRepo,path,Buffer.from(JSON.stringify(historical,null,2)+"\n"),"docs(curadoria): "+data.action+" "+data.sourcePath);
}
async function addCatalogue(sourcePath, localPath, category, sha){
  const path="data/acervo.json";
  const catalog=await readJson(ghToken,dsRepo,path,{schema:"novelo-ds-acervo/v1",records:[]});
  if(!Array.isArray(catalog.records))throw Error("Catálogo inválido.");
  const id="revisado-"+createHash("sha256").update(sourcePath).digest("hex").slice(0,12);
  const name=sourcePath.split("/").at(-1);
  const same=catalog.records.find(i=>i.source===sourcePath || i.id===id);
  const record={id,name,category,status:"aprovado",path:localPath,source:sourcePath,alt:name,
    caption:"Versão aprovada em curadoria. Original preservado no histórico Git.",sha};
  if(same) Object.assign(same,record);
  else catalog.records.push(record);
  catalog.updatedAt=new Date().toISOString();
  await writeFile(ghToken,dsRepo,path,Buffer.from(JSON.stringify(catalog,null,2)+"\n"),"data(ds): incluir arte aprovada "+name);
}
async function updateReviewCatalog(sourcePath, action) {
  const path="data/review-catalog.json";
  const catalog=await readJson(ghToken,dsRepo,path,{items:[]});
  if(!Array.isArray(catalog.items))throw Error("Inventário visual inválido.");
  if(action==="desaprovar"){
    catalog.items=catalog.items.filter(i=>i.path!==sourcePath);
  }else{
    const found=catalog.items.find(i=>i.path===sourcePath);
    if(found){found.status="aprovado";found.notes="Aprovado pela administradora e publicado no acervo oficial.";}
  }
  catalog.updatedAt=new Date().toISOString();
  await writeFile(ghToken,dsRepo,path,Buffer.from(JSON.stringify(catalog,null,2)+"\n"),
    "data(curadoria): sincronizar "+action+" "+sourcePath);
}
async function removeCatalogue(sourcePath){
  const path="data/acervo.json";
  const catalog=await readJson(ghToken,dsRepo,path,{records:[]});
  if(!Array.isArray(catalog.records))throw Error("Catálogo inválido.");
  catalog.records=catalog.records.filter(i=>i.source!==sourcePath);
  catalog.updatedAt=new Date().toISOString();
  await writeFile(ghToken,dsRepo,path,Buffer.from(JSON.stringify(catalog,null,2)+"\n"),"data(ds): remover arte desaprovada "+sourcePath);
}
async function ensureNotUsed(token, repo, path){
  const filename=path.split("/").at(-1);
  const tree=await request(token,"GET","repos/"+repo+"/git/trees/main?recursive=1");
  if(!tree||tree.truncated||!Array.isArray(tree.tree))throw Error("Uso não verificável: exclusão bloqueada.");
  const candidates=tree.tree.filter(i=>i.type==="blob" &&
    (i.path==="index.html" || i.path==="curadoria.html" || i.path.startsWith("src/")) &&
    /(\.tsx?|\.css|\.html|\.jsx?)$/i.test(i.path) &&
    i.path!=="src/routes/ds.tsx" && i.path!=="src/routeTree.gen.ts" &&
    !i.path.startsWith("src/components/ui/"));
  for(const item of candidates){
    const source=await readFile(token,repo,item.path);
    if(source && source.bytes.toString("utf8").includes(filename))
      throw Error("Arquivo utilizado em "+repo+"/"+item.path+". Exclusão bloqueada.");
  }
}
function parseAction(body) {
  const m=String(body||"").match(/<!-- NOVELO_CURADORIA_V1\n([\s\S]*?)\n-->/);
  if(!m)throw Error("Registro de curadoria não encontrado.");
  const params={};
  for(const line of m[1].split("\n")){
    const i=line.indexOf("=");
    if(i<=0)throw Error("Registro de curadoria inválido.");
    params[line.slice(0,i)]=line.slice(i+1);
  }
  if(!["aprovar","desaprovar","ajustar"].includes(params.acao))throw Error("Ação desconhecida.");
  if(params.repo!==appRepo)throw Error("Repositório de origem não autorizado.");
  validPath(params.arquivo);
  return params;
}
async function comment(issueNumber,message) {
  await request(ghToken,"POST","repos/"+dsRepo+"/issues/"+issueNumber+"/comments",{body:message});
}
async function close(issueNumber) {
  await request(ghToken,"PATCH","repos/"+dsRepo+"/issues/"+issueNumber,{state:"closed",state_reason:"completed"});
}
async function approve(params,issueNumber){
  if(!appToken)throw Error("Configure o secret NOVELO_GITHUB_TOKEN com Contents Read & Write no repositório Novelo.");
  const current=await readFile(appToken,appRepo,params.arquivo);
  if(!current)throw Error("Imagem não encontrada no repositório principal. Não é possível aprovar sem original.");
  const ext=params.arquivo.split(".").at(-1);
  const filename=params.arquivo.split("/").at(-1);
  const category=normalizeCategory(params.categoria);
  const folder="public/brand/curadoria/aprovados/"+category+"/";
  let target=folder+filename;
  const exists=await readFile(appToken,appRepo,target);
  if(exists && !exists.bytes.equals(current.bytes)){
    const hash=createHash("sha256").update(current.bytes).digest("hex").slice(0,10);
    target=folder+filename.slice(0,-ext.length-1)+"-"+hash+"."+ext;
  }
  // O original nunca é sobrescrito. GitHub conserva todas as versões.
  await writeFile(appToken,appRepo,target,current.bytes,"feat(curadoria): aprovar "+filename+" (issue "+issueNumber+")");
  const local="assets/aprovados/"+category+"/"+target.split("/").at(-1);
  await writeFile(ghToken,dsRepo,local,current.bytes,"assets(ds): publicar original aprovado "+filename);
  await addCatalogue(params.arquivo,local,params.categoria,current.sha);
  await updateReviewCatalog(params.arquivo,"aprovar");
  await appendHistory({action:"aprovar",sourcePath:params.arquivo,publishedPath:target,issueNumber,when:new Date().toISOString(),actor:admin});
  await comment(issueNumber,"✅ **Aprovação concluída.** Original preservado. Cópia publicada em \`"+target+"\` e incluída no acervo público do Design System.");
  await close(issueNumber);
}
async function reject(params,issueNumber){
  if(!appToken)throw Error("Configure o secret NOVELO_GITHUB_TOKEN com Contents Read & Write no repositório Novelo.");
  const protectedFiles=new Set(["public/logo-novelo.png","public/fio-coracoes.png","public/fio-floral.png","public/favicon.ico","public/brand/maleta-novelo.svg"]);
  if(protectedFiles.has(params.arquivo))throw Error("Arquivo essencial da marca: exclusão protegida.");
  if(params.arquivo.startsWith("public/brand/curadoria/"))throw Error("Arquivo do registro curatorial protegido.");
  const original=await readFile(appToken,appRepo,params.arquivo);
  if(!original)throw Error("Arquivo não encontrado no repositório principal; nenhuma exclusão realizada.");
  await ensureNotUsed(appToken,appRepo,params.arquivo);
  await ensureNotUsed(ghToken,dsRepo,params.arquivo);
  // Exclusão em main é imediata após verificação. O Git preserva histórico e SHA.
  await deleteFile(appToken,appRepo,params.arquivo,original.sha,"chore(curadoria): desaprovar "+params.arquivo+" (issue "+issueNumber+")");
  await removeCatalogue(params.arquivo);
  await updateReviewCatalog(params.arquivo,"desaprovar");
  await appendHistory({action:"desaprovar",sourcePath:params.arquivo,deleted:true,sourceSha:original.sha,issueNumber,when:new Date().toISOString(),actor:admin});
  await comment(issueNumber,"✅ **Desaprovação concluída.** Arquivo excluído da \`main\` do aplicativo após a verificação de referências. Versão recuperável no histórico Git.");
  await close(issueNumber);
}
async function main(){
  if(!eventPath)throw Error("Evento do GitHub não encontrado.");
  const event=JSON.parse(fs.readFileSync(eventPath,"utf8"));
  const issue=event.issue;
  if(!issue||event.action!=="opened")return;
  // Security: issuing user and event actor must be the repo owner.
  if(issue.user?.login!==admin || process.env.GITHUB_ACTOR!==admin){
    console.log("Solicitação não autorizada; nenhum arquivo foi modificado.");
    return;
  }
  const params=parseAction(issue.body);
  if(params.acao==="ajustar"){
    await appendHistory({action:"ajustar",sourcePath:params.arquivo,issueNumber:issue.number,when:new Date().toISOString(),actor:admin,note:"Pedido na Issue; revisão visual manual pendente"});
    await comment(issue.number,"🧶 **Pedido de ajuste registrado.** Abra esta Issue na conversa com o assistente para preparar uma nova imagem. Nenhum original foi modificado.");
    return;
  }
  if(params.acao==="aprovar")return approve(params,issue.number);
  return reject(params,issue.number);
}
main().catch(async error=>{
  console.error(error);
  try {
    const event=JSON.parse(fs.readFileSync(eventPath,"utf8"));
    if(event.issue?.user?.login===admin && process.env.GITHUB_ACTOR===admin)
      await comment(event.issue.number,"⚠️ **Curadoria não concluída.** "+String(error.message||error)+" Nenhuma confirmação de sucesso foi registrada. Verifique as etapas do GitHub Actions.");
  } catch(e){console.error("Falha ao comentar o erro:",e);}
  process.exitCode=1;
});