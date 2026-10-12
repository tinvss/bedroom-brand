// Speichern im Browser
/* ================= Speichern ================= */
const SAVE_KEY=TX.sohle_save_v1_en+(testModus()?".test":"");
// In eingebetteten Seiten sperren Safari und die App den Speicher, bis der Spieler die Seite berührt hat.
// Deshalb: erst prüfen, bei Bedarf Zugriff anfordern, und ehrlich sagen, wenn es nicht geht.
let speicherGeht=null;
function pruefeSpeicher(){ try{ localStorage.setItem(TX.sohle_probe_en,"1"); localStorage.removeItem(TX.sohle_probe_en); speicherGeht=true; }
  catch(e){ speicherGeht=false; } return speicherGeht; }
async function speicherFreigeben(){ if(speicherGeht) return true;
  try{ if(document.hasStorageAccess && !(await document.hasStorageAccess())){ await document.requestStorageAccess(); } }catch(e){}
  return pruefeSpeicher(); }
// Wo der Browser den dauerhaften Speicher sperrt (eingebettete Seiten auf dem iPhone),
// bleibt der Stand wenigstens für diese Sitzung erhalten: sessionStorage überlebt das Neuladen,
// window.name überlebt es auch dann, wenn selbst das gesperrt ist.
const NAME_KOPF=TX.sohle_save_en+(testModus()?"test:":"");
function schreibeStand(text){ let wohin=[];
  try{ localStorage.setItem(SAVE_KEY,text); wohin.push("dauerhaft"); speicherGeht=true; }catch(e){ speicherGeht=false; }
  try{ sessionStorage.setItem(SAVE_KEY,text); wohin.push("Sitzung"); }catch(e){}
  try{ window.name=NAME_KOPF+text; wohin.push("Fenster"); }catch(e){}
  return wohin; }
// Ältere Fassungen dieser Seite haben unter anderen Namen gespeichert. Die werden mitgelesen,
// damit ein Stand nicht verloren geht, nur weil sich der Name geändert hat.
const ALT_KEYS=["sohle.save"+".v1"];   // bewusst zusammengesetzt, damit die englische Fassung den Namen nicht mitübersetzt
function lieseStand(){
  try{ const t=localStorage.getItem(SAVE_KEY); if(t) return t; }catch(e){}
  for(const k of ALT_KEYS){ if(k===SAVE_KEY) continue;
    try{ const t=localStorage.getItem(k); if(t) return t; }catch(e){} }
  try{ const t=sessionStorage.getItem(SAVE_KEY); if(t) return t; }catch(e){}
  try{ if(window.name&&window.name.startsWith(NAME_KOPF)) return window.name.slice(NAME_KOPF.length); }catch(e){}
  return null; }
function saveGame(){ try{ if(!S) return;
  const data=Object.assign({},S,{
    fakes:S.fakes.map(f=>Object.assign({},f,{d:S.districts.indexOf(f.d)})),
    vans:S.vans.map(v=>({state:"home",cargo:v.cargo||0,pos:{x:HQ.x,y:HQ.y},d:0,stops:[]})),
    squads:[], shots:[], pops:[], caught:[], cars:[]});
  schreibeStand(JSON.stringify({v:1, S:data, tut:{on:tutOn,i:tutI}, at:Date.now()}));
}catch(e){} }
function loadGame(){ try{ const raw=lieseStand(); if(!raw) return false; const o=JSON.parse(raw); if(!o||!o.S) return false;
  S=o.S; S.fakes=S.fakes.map(f=>Object.assign(f,{d:S.districts[f.d]})).filter(f=>f.d);
  S.vans.forEach(v=>{ S.ammo+=v.cargo||0; v.state="home"; v.cargo=0; v.stops=[]; });
  if(S.exited&&S.exitMoney&&!S.exitBezahlt){ S.money+=S.exitMoney; S.exitBezahlt=true; }   // Auszahlung wurde früher vergessen
  S.sources.forEach(s=>{ s.left=s.max; s.gone=false; });   // Quellen gehen nicht mehr aus
  S.posts.forEach(po=>po.away=false); S.caught=S.caught||[]; S.cars=S.cars||[]; S.research=S.research||{}; S.decoys=S.decoys||[]; S.parts=S.parts||{schaft:0,sohle:0}; S.rp=S.rp||{runner:0,court:0,hightop:0}; S.resProg=S.resProg||{}; S.curRes=S.curRes||null;
  tutOn=o.tut&&o.tut.on; tutI=(o.tut&&o.tut.i)||0; if(tutI>=TUT.length||!tutOn&&S.factory) S.tutDone=true; return true; }catch(e){ return false; } }
const hasSave=()=>!!lieseStand();
function loescheStand(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
  try{ sessionStorage.removeItem(SAVE_KEY); }catch(e){} try{ window.name=""; }catch(e){} }
