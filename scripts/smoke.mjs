import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const base="http://127.0.0.1:4173";
await mkdir("preview-screenshots",{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
async function visit(page,path){
  const response=await page.goto(base+path,{waitUntil:"networkidle",timeout:45000});
  assert.equal(response?.status(),200,path+" should load");
}
try{
  const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  desktop.on("pageerror",e=>errors.push("desktop "+e.message));
  await visit(desktop,"/");
  assert.match(await desktop.title(),/Novelo/);
  await desktop.locator("#gallery-grid .gallery-card").first().waitFor();
  const n=await desktop.locator("#gallery-grid .gallery-card").count();
  assert.ok(n>=6 && n<=8,"Only publicly available approved originals should appear");
  const logo=desktop.locator(".logo-showcase");
  const officialLoaded=await logo.evaluate(img=>img.complete&&img.naturalWidth>0);
  if(!officialLoaded) assert.equal(await desktop.locator(".logo-panel .missing-official").isVisible(),true,"Official logo must show a clear synchronization notice, never a fake mark");
  const joana=desktop.locator(".person-card img").first();
  assert.equal(await joana.evaluate(img=>img.complete&&img.naturalWidth>0),true,"Approved Joana original must load");
  await desktop.screenshot({path:"preview-screenshots/desktop-home.png",fullPage:true});
  await desktop.locator("#gallery-grid .gallery-preview").first().click();
  assert.equal(await desktop.locator("#viewer").evaluate(d=>d.open),true,"Image lightbox should open");
  await desktop.screenshot({path:"preview-screenshots/desktop-image-expanded.png"});
  await desktop.locator(".viewer-close").click();
  assert.equal(await desktop.locator("#viewer").evaluate(d=>d.open),false,"Image lightbox should close");

  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on("pageerror",e=>errors.push("mobile "+e.message));
  await visit(mobile,"/");
  await mobile.locator("#gallery-grid .gallery-card").first().waitFor();
  await mobile.screenshot({path:"preview-screenshots/mobile-home.png",fullPage:true});
  await mobile.locator(".nav-toggle").click();
  assert.equal(await mobile.locator(".nav-toggle").getAttribute("aria-expanded"),"true");
  await mobile.locator(".nav a[href='#experiencia']").click();
  assert.equal(await mobile.locator(".nav-toggle").getAttribute("aria-expanded"),"false");

  const admin=await browser.newPage({viewport:{width:1280,height:900}});
  admin.on("pageerror",e=>errors.push("curadoria "+e.message));
  await visit(admin,"/curadoria.html");
  await admin.locator(".review-card").first().waitFor();
  assert.equal(await admin.locator(".review-card").count(),27,"Review inventory should include every repo graphic");
  await admin.locator(".review-card .review-open").first().click();
  assert.equal(await admin.locator("#action-dialog").evaluate(d=>d.open),true,"Curadoria modal should open");
  assert.equal(await admin.locator("#approve").count(),1);
  assert.equal(await admin.locator("#reject").count(),1);
  assert.equal(await admin.locator("#alter").count(),1);
  await admin.screenshot({path:"preview-screenshots/curadoria-modal.png"});
  await admin.locator("#dialog-close").click();
  await admin.screenshot({path:"preview-screenshots/curadoria-gallery.png",fullPage:true});
  assert.deepEqual(errors,[],"No uncaught JavaScript errors");
  console.log("SMOKE OK: desktop and mobile, approved artworks, 27 review entries, private image placeholders, and three decision buttons.");
}finally{await browser.close();}