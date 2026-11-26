import fs from "node:fs";
import assert from "node:assert/strict";

const read = path => JSON.parse(fs.readFileSync(path, "utf8"));
const original = read("data/curadoria-original-2026-11-24.json");
const subset = read("data/review-catalog.json");
const manifest = read("data/historico-manifest.json");

assert.equal(original.schema, "novelo-ds-curadoria/v1");
assert.equal(original.items.length, 92);
assert.deepEqual(original.counts, {pendente:66,aprovado:12,reprovado:14});
assert.equal(subset.items.length,27);
const originals = new Map(original.items.filter(i=>i.kind==="arquivo").map(i=>[i.path,i]));
assert.equal(originals.size,27);
for(const item of subset.items){
  const src=originals.get(item.path);
  assert.ok(src,"Arquivo no subconjunto ausente no JSON: "+item.path);
  assert.equal(item.status,src.status,"Status divergente: "+item.path);
  assert.equal(item.notes,src.note,"Comentário divergente: "+item.path);
  if(item.image)assert.ok(fs.existsSync(item.image),"Prévia ausente: "+item.image);
}
assert.equal(manifest.schema,"novelo-historico-manifest/v1");
assert.equal(manifest.total,95);
assert.equal(manifest.batchFiles.length,10);
const items=[];
for(const filename of manifest.batchFiles){
  assert.ok(fs.existsSync(filename),"Lote ausente: "+filename);
  const batch=read(filename);
  assert.equal(batch.schema,"novelo-historico-preview/v1",filename);
  assert.ok(Array.isArray(batch.items),filename);
  for(const item of batch.items){
    assert.ok(item.id&&item.name,"Item histórico sem identificação em "+filename);
    const match=String(item.preview||"").match(/^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)$/);
    assert.ok(match,"Prévia sem imagem embutida: "+item.name);
    const buf=Buffer.from(match[2],"base64");
    assert.ok(buf.length>500,"Prévia vazia: "+item.name);
    const type=match[1];
    if(type==="webp")assert.equal(buf.toString("ascii",0,4)+"|"+buf.toString("ascii",8,12),"RIFF|WEBP","WebP inválido: "+item.name);
    if(type==="png")assert.equal(buf.toString("hex",0,8),"89504e470d0a1a0a","PNG inválido: "+item.name);
    if(type==="jpeg")assert.equal(buf.toString("hex",0,2),"ffd8","JPEG inválido: "+item.name);
    items.push(item);
  }
}
assert.equal(items.length,95);
assert.equal(new Set(items.map(i=>i.id)).size,95);
assert.ok(items.some(i=>/Mapa Estético da Novelo/i.test(i.name)),"Mapa estético ausente");
assert.ok(items.some(i=>/a_vibrant_detailed_crochet_amigurumi_style_illust\.png/i.test(i.name) && i.status==="aprovado"),"Família final aprovada Issue 10 ausente");
const html=fs.readFileSync("curadoria.html","utf8"),js=fs.readFileSync("curadoria.js","utf8");
assert.ok(html.includes('id="alter"'),"Botão de Issue ausente");
assert.ok(!html.includes('id="approve"')&&!html.includes('id="reject"'),"Botões que alteram status não devem existir");
assert.ok(js.includes("issues/new"),"Abertura de Issues não encontrada");
console.log("AUDITORIA OK: 92 registros originais, 27 imagens com status e notas fiéis, 95 imagens históricas válidas, 187 itens disponíveis na curadoria.");
