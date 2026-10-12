// Forschung der Manufaktur. Das Atelier verbraucht fertige Uhren als Muster, teure Modelle forschen schneller.
// Jede Stufe ist die Antwort auf eine Bedrohung, keine Prozente ohne Grund.
const TECH2=[
 {k:"tresor",  n:"Tresor",                  d:TX.finished_watches_in_storage, cost:{klassik:8}},
 {k:"begleit", n:"Begleitschutz",           d:TX.a_guard_rides_along,                    cost:{klassik:12}},
 {k:"serien",  n:"Seriennummern",           d:TX.replicas_fade_twice_as,                           cost:{klassik:16}},
 {k:"alarm",   n:"Alarmanlage",             d:TX.the_alarm_goes_off,             cost:{klassik:12,chrono:6}},
 {k:"werfer",  n:TX.net_launcher_on_the, d:TX.slings_a_heavy_net, cost:{klassik:20,chrono:10}},
 {k:"weite",   n:TX.longer_range,       d:"Der Netzwerfer wirft deutlich weiter.",                                                        cost:{chrono:18}},
 {k:"tourbillon", n:"Tourbillon",           d:TX.the_finest_movement_there, cost:{klassik:24,chrono:12}}];

const RES2=()=>(S.uhr&&S.uhr.research)||{};
const werferWeite=()=>RES2().weite?7.5:4.5;
// Ein Netz vom Dach der Manufaktur auf ein Versteck
// Zwei Würfe räumen jedes Versteck, egal wie zäh es ist. Eine feste Schadenszahl kann das nicht:
// Verstecke wachsen mit dem Umsatz mit, bei 228 Verteidigung waren 70 Schaden noch fünf Würfe.
// Deshalb zwei Drittel der vollen Hütte pro Wurf, mindestens 70.
const WERFER_ANTEIL=0.65, WERFER_MIN=70, WERFER_KOSTEN=40, WERFER_LADEN=30;
const werferSchaden=nest=>Math.max(WERFER_MIN,Math.round((nest.max||40)*WERFER_ANTEIL));
function werferSchuss(nest){ if(!nest||!nest.alive||!RES2().werfer||!S.uhr||!S.uhr.ort) return false;
  if(dist(nest,S.uhr.ort)>werferWeite()){ pop(nest,TX.too_far_away,"#7A7366"); return false; }
  if(S.t<(S.werferCd||0)){ pop(nest,TX.net_launcher_reloading,"#7A7366"); return false; }
  if(S.ammo<WERFER_KOSTEN){ pop(nest,TX.not_enough_gear,"#B8432F"); return false; }
  S.werferCd=S.t+WERFER_LADEN; S.ammo-=WERFER_KOSTEN; stat("ammoUse",WERFER_KOSTEN);
  nest.hp-=werferSchaden(nest); nest.hitT=S.t; nest.wucht=S.t;   // Einschlag: die Hütte wackelt, Splitter fliegen
  S.werferT=S.t; S.shots.push({a:{x:S.uhr.ort.x,y:S.uhr.ort.y},b:{x:nest.x,y:nest.y},ttl:0.8,max:0.8,wucht:true});
  for(const r of S.raiders) if(dist(r,nest)<1.2){ r.hp-=20; r.hitT=S.t; }   // wer daneben steht, bekommt es ab
  pop(nest,"TREFFER","#7B5BC0");
  if(nest.hp<=0){ nest.alive=false; S.cleared++; S.lastClear=S.t; const dd=S.districts[nest.district]; if(dd) delete dd.nest;
    pop(nest,"AUSGEHOBEN","#1F7A55"); beuteZurueck(nest); }
  return true; }
const resTech2=()=>S.uhr&&S.uhr.curRes&&TECH2.find(x=>x.k===S.uhr.curRes);
function resPct2(){ const T=resTech2(); if(!T) return 0; let a=0,b=0;
  for(const [k,v] of Object.entries(T.cost)){ a+=Math.min(v,(S.uhr.resProg||{})[k]||0); b+=v; } return Math.floor(a/b*100); }
function checkRes2(){ const T=resTech2(); if(!T) return;
  if(Object.entries(T.cost).every(([k,v])=>((S.uhr.resProg||{})[k]||0)>=v)){
    S.uhr.research[T.k]=true; S.uhr.curRes=null; S.uhr.resProg={};
    pop(S.uhr.ort,"Erforscht: "+T.n,"#7B5BC0");
    if(T.k==="tourbillon") once("tourb","Das Tourbillon",`${TX.you_can_now_build}`);
    else if(T.k==="werfer") once("werfer",TX.net_launcher_on_the,`${TX.there_is_now_a}`);
    else hint("res2_"+T.k,[{id:"r2"+T.k, el:()=>$("tForsch"), info:true, t:`Erforscht: ${T.n}. ${T.d}`}],true); } }
// Ein Muster aus dem Atelier
function uhrMuster(modell){ const U=S.uhr; if(!U) return; const T=resTech2();
  U.rp=U.rp||{}; U.resProg=U.resProg||{};
  if(T&&T.cost[modell]&&(U.resProg[modell]||0)<T.cost[modell]){ U.resProg[modell]=(U.resProg[modell]||0)+1; checkRes2(); }
  else U.rp[modell]=(U.rp[modell]||0)+1; }
function selectRes2(k){ const U=S.uhr; U.rp=U.rp||{}; const alt=resTech2();
  if(alt) for(const m in U.resProg) U.rp[m]=(U.rp[m]||0)+U.resProg[m];
  U.curRes=k; U.resProg={}; const T=resTech2();
  for(const [m,v] of Object.entries(T.cost)){ const nimm=Math.min(v,U.rp[m]||0); U.resProg[m]=nimm; U.rp[m]-=nimm; }
  checkRes2(); }

function forschungSheet2(){ reopen=forschungSheet2; const U=S.uhr;
  const hatAtelier=U.floors.some(F=>F.slots.some(m=>m&&m.t==="atelier"));
  let h=`${TX.manufactory_research_a_studio}`;
  if(!hatAtelier) h+=`${TX.you_don_t_have}`;
  const T=resTech2();
  if(T) h+=`<div style="background:var(--bg);border:2px solid var(--ink);border-radius:12px;padding:12px;margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;font-weight:800"><span>${T.n}</span><span>${resPct2()} %</span></div>
    <div style="height:12px;background:var(--line);border-radius:7px;overflow:hidden;margin:8px 0 2px"><i style="display:block;height:100%;width:${resPct2()}%;background:#7B5BC0"></i></div>
    <div style="font-size:12.5px;color:var(--soft)">${Object.entries(T.cost).map(([m,v])=>((S.uhr.resProg||{})[m]||0)+TX.of+v+" "+UHREN[m].n).join(" · ")}</div></div>`;
  else h+=`${TX.nothing_is_being_researched}`;
  for(const X of TECH2){ const fertig=RES2()[X.k], laeuft=U.curRes===X.k;
    const offen = X.k!=="weite" || RES2().werfer;
    h+=`<div class="opt ${fertig||!offen?"off":""}" ${fertig||laeuft||!offen?"":`data-r2="${X.k}"`}>
      <div><b>${X.n}${fertig?TX.researched:laeuft?TX.running:""}</b><span>${offen?X.d:TX.only_with_the_net}</span>
      <span style="display:block;margin-top:4px">${Object.entries(X.cost).map(([m,v])=>v+" "+UHREN[m].n).join(", ")}</span></div>
      <em>${fertig?"✓":laeuft?resPct2()+"%":TX.pick}</em></div>`; }
  openSheet(h,()=>document.querySelectorAll("[data-r2]").forEach(b=>b.onclick=()=>{ selectRes2(b.dataset.r2); forschungSheet2(); }));
}
