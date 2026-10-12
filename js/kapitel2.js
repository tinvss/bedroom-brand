// Kapitel 2: Uhren. Eigenes Haus oben im gesperrten Viertel, eigenes Lager, eigene Maschinen.
// Kapitel 1 ist Menge und Tempo, Kapitel 2 sind wenige, wertvolle Stücke.

// Rohstoffe: Metall vom Metallhof oder Schrottplatz, Sand aus der Sandgrube, Lederbänder liefert Sohle
const RAW2={metall:{n:TX.metal_yard,col:"#6C7A89"}, sand:{n:TX.sand_pit,col:"#D8C08A"}, band:{n:TX.leather_strap,col:"#8A5A35"}};

const UHREN={
 klassik:{n:TX.classic, p0:1200, col:"var(--ink)",   c2:"#2B2A26", unlock:0,    need:{gehaeuse:1,glas:1,uhrwerk:1,band:1}},
 chrono: {n:"Chrono",  p0:2100, col:"var(--court)", c2:"#2E6FE4", unlock:3000, need:{gehaeuse:1,glas:1,uhrwerk:2,band:1}}};

// Takte à 0,4 Sekunden. Die Feinmechanik ist bewusst der Engpass, ein Uhrwerk braucht drei Zahnräder.
const MACH2={
 giess:  {n:TX.foundry,       need:{metall:1},                cost:400,  d:TX.metal_in_cases_out, t:[6],  factory:true, out:"gehaeuse"},
 ofen:   {n:TX.glass_furnace,       need:{sand:1},                  cost:400,  d:TX.sand_in_glass_out,      t:[5],  factory:true, out:"glas"},
 fein:   {n:TX.precision_shop,   need:{metall:1},                cost:600,  d:TX.turns_metal_into_a, t:[10], factory:true, out:"zahnrad"},
 werk:   {n:TX.movement_assembly,need:{zahnrad:3},               cost:900,  d:TX.three_gears_become_one, t:[8], factory:true, out:"uhrwerk"},
 endm:   {n:TX.final_assembly,     need:"modell",                  cost:1200, d:TX.case_glass_movement_and, t:[10], factory:true, out:"modell"},
 atelier:{n:TX.studio,         need:{fertig:1},                cost:700,  d:TX.takes_finished_watches_as, t:[8], factory:true},
 zert:   {n:TX.certificate,     need:{fertig:1},                cost:800,  d:TX.certifies_finished_watches_certified, t:[5], factory:true, out:"siegel"},
 werkstatt:{n:TX.workshop_for_one_off, need:{}, cost:0, gross:true, factory:true, t:[1],
   d:TX.a_place_for_a}};

const UHR_TEILE=["gehaeuse","glas","zahnrad","uhrwerk"];

// Das Haus oben. Entsteht beim Einstieg in Kapitel 2, danach steht es im Spielstand.
function neuesUhrenwerk(){
  return {boutique:{s:{klassik:0,chrono:0}, cd:0, verkauft:0, umsatz:0}, boutiquen:[], repliken:[],
    research:{}, curRes:null, resProg:{}, rp:{},
    floors:[{lane:new Array(L).fill(null), slots:new Array(L).fill(null)}], lifts:[],
    intakes:[0], intakeLvl:{}, intakeAcc:{}, feedIdx:{},
    lager:{metall:0,sand:0,band:0}, lagerCap:30,
    parts:{gehaeuse:0,glas:0,zahnrad:0,uhrwerk:0}, fin:{klassik:0,chrono:0},
    open:{klassik:true,chrono:false}};
}
// Sicht auf das Uhrenwerk für die Turm-Simulation
function uhrWerk(){ const U=S.uhr; if(!U) return null;
  U.intakeAcc=U.intakeAcc||{}; U.feedIdx=U.feedIdx||{}; U.intakeLvl=U.intakeLvl||{};
  return {name:"uhren", floors:U.floors, lifts:U.lifts, intakes:U.intakes, intakeLvl:U.intakeLvl, intakeAcc:U.intakeAcc, feedIdx:U.feedIdx,
    lager:U.lager, lagerCap:U.lagerCap, parts:U.parts, fin:U.fin, open:U.open, mach:MACH2, models:UHREN, teile:UHR_TEILE}; }

// Grundstücke oben im Viertel. Der Preis hängt am Exit-Geld, das teuerste kostet die Hälfte davon.
// Näher an der Hauptstraße heißt kurzer Weg für den Lieferwagen aus Sohle und weniger Angriffsfläche.
// Viertel oben, Koordinaten mit negativem y liegen über der alten Stadt
const OBERSTADT=[{n:"Boulevard", x:2.2, y:-1.5}, {n:TX.gallery, x:6.8, y:-1.5}, {n:"Promenade", x:4.5, y:-3.2}];
const GRUNDSTUECKE=[
 {id:"mitte", n:TX.on_the_main_road, x:4.5, y:-0.9, teil:0.5,  d:TX.right_behind_the_barrier},
 {id:"west",  n:"Westseite",          x:1.5, y:-2.6, teil:0.34, d:TX.in_the_middle_of},
 {id:"rand",  n:TX.right_at_the_top,  x:8.1, y:-3.5, teil:0.2,  d:TX.the_corner_at_the}];
const grundPreis=g=>Math.round((S.exitMoney||10000)*g.teil/100)*100;
function kaufeGrundstueck(g){ if(S.uhr||S.money<grundPreis(g)) return;
  // Die Oberstadt wird echte Stadt: zwei Viertel für Boutiquen kommen dazu
  OBERSTADT.forEach(o=>{ if(!S.districts.some(d=>d.n===o.n)) S.districts.push({n:o.n, x:o.x, y:o.y, shop:false, oben:true, s:{runner:0,court:0,hightop:0}, heat:{runner:0,court:0,hightop:0}, cd:0}); });
  S.money-=grundPreis(g); S.uhr=neuesUhrenwerk(); S.uhr.ort={id:g.id,n:g.n,x:g.x,y:g.y}; S.haus="uhren";
  S.sources.push({x:6.2,y:3.0,k:"sand",n:TX.sand_pit,left:1500,max:1500,trucks:0});
  S.liefer={pos:{x:HQ.x,y:HQ.y}, d:0, cargo:0, state:"laden", weg:lieferWeg(g)};   // der gepanzerte Wagen gehört dazu
  S.bandAnteil=S.bandAnteil||0;
  once("ch2haus","Dein zweites Haus",`${TX.you_bought}${g.n}${TX.up_here_you_build}`); }

// Häuser: beliebig viele, angezeigt wird immer das aktive. Kapitel 1 hat nur Sohle.
function haeuser(){ const a=[{id:"sohle", n:"Sohle", werk:sohleWerk}];
  if(S.uhr) a.push({id:"uhren", n:TX.watches_2, werk:uhrWerk});
  return a; }
function aktivesHaus(){ const a=haeuser(); return a.find(h=>h.id===S.haus)||a[0]; }
function aktivesWerk(){ return aktivesHaus().werk(); }
// Was in einem Haus gerade klemmt, für den roten Punkt am Umschalter
function hausSorgen(h){ const W=h.werk(); let n=0;
  for(const F of W.floors) for(const m of F.slots){ if(!m) continue;
    if((m.blockT||0)>25) n++;                                   // kommt lange nicht los
    else if(!m.busy&&!m.out){ const nd=bedarfVon(W,m)||{};      // wartet auf Material, das auch im Lager fehlt
      for(const k in nd) if(k!=="fertig"&&!(m.buf[k]>=nd[k])&&W.lager[k]!==undefined&&W.lager[k]<1) { n++; break; } } }
  return n; }

// Der Weg des Lieferwagens: aus dem Turm über die Hauptstraßen nach oben zum Haus
function lieferWeg(ort){ const rx=ROADS_X.reduce((a,b)=>Math.abs(b-ort.x)<Math.abs(a-ort.x)?b:a);
  // erst auf der Querstraße nach oben, dann auf einer Längsstraße hoch, erst am Ende ins Viertel
  return [{x:HQ.x,y:HQ.y},{x:HQ.x,y:ROADY[0]},{x:rx,y:ROADY[0]},{x:rx,y:ort.y},{x:ort.x,y:ort.y}]; }
// Ladung pro Fahrt. Die Forschung für größere Transporter gilt auch für ihn, sonst ist sie ein
// Versprechen, das sie nicht hält. Gemessen waren es vorher 28 Bänder pro Minute an der
// Hauptstraße und 16 am oberen Kartenrand, eine Endmontage verbaut 15.
const LIEFER_LADUNG=()=>RES().laster?16:10;
const LIEFER_PREIS=2500;
// Alle Lieferwagen. Der erste gehört zum Haus, jeder weitere kostet einen Platz im Fuhrpark.
const lieferWagen=()=>[S.liefer].concat(S.liefer2||[]).filter(Boolean);
function lieferKaufen(){ if(!S.uhr||S.money<LIEFER_PREIS||fleetUsed()>=S.fleet) return;
  S.money-=LIEFER_PREIS; S.liefer2=S.liefer2||[];
  S.liefer2.push({pos:{x:HQ.x,y:HQ.y}, d:8, cargo:0, state:"laden", weg:lieferWeg(S.uhr.ort)}); }
// Er holt Bänder aus Sohle und bringt sie nach oben. Unterwegs ist er das beste Ziel für die Banden.
function lieferStep(){ if(!S.uhr) return; for(const v of lieferWagen()) einLieferStep(v); }
function einLieferStep(v){ const Lp=pathLen(v.weg);
  if(v.state==="laden"){ v.pos={x:HQ.x,y:HQ.y}; v.d=0;
    const n=Math.min(LIEFER_LADUNG(), S.parts.band||0, S.uhr.lagerCap-S.uhr.lager.band);
    if(n<=0) return; S.parts.band-=n; v.cargo=n; v.state="hoch"; return; }
  if(v.state==="hoch"){ v.d+=1.1*DT; if(v.d>=Lp){ v.d=Lp;
      const n=Math.min(v.cargo, S.uhr.lagerCap-S.uhr.lager.band);
      S.uhr.lager.band+=n; stat('band_hoch',n); if(n) pop(S.uhr.ort,"+"+n+TX.straps,"#1F7A55"); v.cargo=0; v.state="runter"; } }
  else if(v.state==="runter"){ v.d-=1.4*DT; if(v.d<=0){ v.d=0; v.state="laden"; } }
  v.pos=pointAt(v.weg,Math.max(0,Math.min(Lp,v.d))); }

// Der Markt für Uhren: wenige Käufer, hohe Preise. Die Sättigung hält länger an als bei Sneakern.
// Die erste Boutique sitzt am Haus, weitere eröffnest du in Vierteln der Stadt.
function boutiquen(){ const U=S.uhr; return U ? [U.boutique].concat(U.boutiquen||[]) : []; }
const replikaLast=(B,m)=>(S.uhr.repliken||[]).filter(r=>r.b===B&&r.m===m).reduce((a,r)=>a+r.str,0);
const uhrPreisIn=(B,m)=>Math.max(80,Math.round(UHREN[m].p0/(1+(B.s[m]||0)/3)/(1+replikaLast(B,m)/5)));
const uhrPreis=(m)=>{ const bs=boutiquen(); return bs.length?Math.max(...bs.map(B=>uhrPreisIn(B,m))):UHREN[m].p0; };
const boutiquePreis=()=>Math.round(4000*Math.pow(1.6,(S.uhr.boutiquen||[]).length));

function boutiqueStep(){ const U=S.uhr; if(!U) return;
  for(const B of boutiquen()){
    for(const m in B.s) B.s[m]*=Math.pow(0.96,DT);        // Sättigung klingt langsam ab
    B.cd-=DT; if(B.cd>0) continue;
    let best=null, bp=0, zert=false;
    for(const m in UHREN){ if((U.fin[m+"_s"]||0)>0){ const p=Math.round(uhrPreisIn(B,m)*1.35); if(p>bp){bp=p;best=m;zert=true;} }
      if(U.fin[m]>0){ const p=uhrPreisIn(B,m); if(p>bp){bp=p;best=m;zert=false;} } }
    const bd=B.d!==undefined?S.districts[B.d]:null;
    if(bd&&bd.nest!==undefined&&S.nests[bd.nest]&&S.nests[bd.nest].alive){ B.cd=2; continue; }   // Bande im Viertel: die Boutique bleibt zu
    const fd=bd&&bd.flagship==='uhren';
    if(!best){ B.cd=1; continue; }
    if(fd) bp=Math.round(bp*1.25);
    U.fin[zert?best+"_s":best]--; stat('umsatz',bp); S.money+=bp; S.earned+=bp; B.verkauft=(B.verkauft||0)+1; B.umsatz=(B.umsatz||0)+bp;
    B.s[best]+=1; B.heat=B.heat||{}; B.heat[best]=(B.heat[best]||0)+(zert?0.3:1);
    stat('uhr_verkauft'); stat('uhr_'+best);
    const ort=B.d!==undefined?S.districts[B.d]:U.ort; if(ort) pop(ort,"+"+bp.toLocaleString("de-DE"),"#1F7A55");
    B.cd=fd?8:14;                                         // etwa alle vierzehn Sekunden kommt ein Käufer, im Flagship öfter
    // Läuft ein Modell gut, tauchen Replikas auf. Zertifikate halten sie klein.
    if(zert){ const meine=(U.repliken||[]).filter(r=>r.b===B&&r.m===best); if(meine.length){ const w=meine.sort((a,b)=>b.str-a.str)[0]; w.str-=RES2().serien?2.4:1.2; w.hit=S.t; } }
    if((B.heat[best]||0)>=(fd?6:12)){ B.heat[best]=0; if((U.repliken||[]).filter(r=>r.b===B).length<3){
      U.repliken.push(Object.assign({b:B,m:best,str:1.2,hit:-9}, replikaOrt(ort)));
      once("replika","Replikas",`${TX.your_2}${UHREN[best].n}${TX.sells_so_well_that}`); } }
  }
  U.repliken=(U.repliken||[]).filter(r=>{ r.str=Math.min(4,r.str+0.01*DT); return r.str>0.1; });
}
// Die Kopie stellt sich neben die Boutique, aber nie außerhalb der Karte: am rechten Rand also links daneben.
const replikaOrt=o=>{ const x=(o&&o.x)||4.5, y=(o&&o.y)||0;
  return {x: Math.min(8.4, Math.max(0.6, x>7 ? x-1.1 : x+1.1)), y: Math.min(13.4, Math.max(-3.4, y+0.4))}; };
function boutiqueBauen(d,gratis){ const c=gratis?0:boutiquePreis(); if(!S.uhr||S.money<c) return;
  S.money-=c; S.uhr.boutiquen.push({d:S.districts.indexOf(d), s:{klassik:0,chrono:0}, cd:0, verkauft:0, umsatz:0, heat:{}});
  d.boutique=true; pop(d,TX.boutique_opened,"#1F7A55"); }
// Der Testknopf erscheint nur mit ?test in der Adresse, damit Tester nicht versehentlich alles überspringen
function testModus(){ try{ return /[?&]test/.test(location.search); }catch(e){ return false; } }
// Testknopf: bringt das Spiel in den Zustand nach dem Exit, damit Kapitel 2 ohne langes Vorspiel geprüft werden kann
function testSprungKapitel2(){ TECH.forEach(x=>S.research[x.k]=true);
  S.factory=true; S.tutDone=true; tutOn=false; tutQ=[];
  // Sohle so aufbauen, wie sie bei einem echten Spieler vor dem Exit aussieht: vier Etagen, volle Straßen, Routen, Posten, Läden
  const M2=(t,m)=>({t,buf:{},busy:false,p:0,model:m||"runner",lvl:0});
  S.money=99999; S.lagerCap=120; S.ammoCap=100; S.ammo=60; S.fleet=8;
  ["court","hightop"].forEach(k=>S.open[k]=true);
  while(S.floors.length<4){ const n=S.floors.length; S.floors.push({lane:new Array(L).fill(null), slots:new Array(L).fill(null)}); S.lifts.push({q:[],c:0,lvl:2}); }
  S.lifts.forEach(l=>l.lvl=2); S.intakes=[0,1,2,3]; S.intakeLvl={0:2,1:2,2:2,3:2};
  // Ausgewogen: ein Zuschnitt und eine Presse versorgen zwei Montagen, sonst staut sich der Turm
  S.floors[0].slots=[M2("cut"),M2("press"),M2("asm"),M2("asm"),null,M2("equip"),M2("seal")];
  S.floors[1].slots=[M2("cut"),M2("press"),M2("asm","court"),M2("asm","court"),null,M2("seal"),null];
  S.floors[2].slots=[M2("cut"),M2("press"),M2("asm","hightop"),M2("asm"),null,M2("lab"),null];
  S.floors[3].slots=[M2("cut"),M2("press"),M2("asm"),M2("asm"),null,M2("equip"),null];
  S.lager={leder:120,gummi:120,metall:120};
  if(!S.trucks.length){ [0,1,2,3,4].forEach(i=>{ addTruck(S.sources[i]); if(i<2) addTruck(S.sources[i]); }); }
  if(S.posts.length<3) [[4.5,10.5],[2.5,11.5],[6.5,11.5]].forEach(([x,y])=>S.posts.push({x,y,hp:70,max:70,cd:0,stock:30}));
  S.districts.forEach((d,i)=>{ if(i<3&&d.nest===undefined) d.shop=true; });
  S.fw={state:"won",t0:S.t,got:{runner:30,court:20,hightop:10}}; S.exited=true;
  S.exitMoney=Math.max(45000, valuation()); S.money=S.exitMoney;
  S.sold=Math.max(S.sold,600); S.lagerCap=Math.max(S.lagerCap,120);
  Object.assign(S.seen,{fac:1,raid:1,rob:1,fake:1,resHint:1,doorHint:1,liftHint:1,passHint:1,mktHint:1,shopHint:1,intakeUp:1,empty:1,firstPost:1,fwHint:1,fwgo:1,ch2:1});
  $("sheet").innerHTML=""; switchView("stadt"); grundstueckSheet(); }
