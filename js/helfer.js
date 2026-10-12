// Formeln und kleine Helfer: Wege, Preise, Kosten, Statistik
/* ================= Helfer ================= */
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const ROADY=[2.6,5.3,7.9,10.2,12.5];
const pathOf=src=>{ const r=ROADY.reduce((a,b)=>Math.abs(b-src.y)<Math.abs(a-src.y)?b:a);
  // Wohin die Route liefert, dorthin fährt der Transporter auch sichtbar
  const ziel = (S.uhr&&zielVon(src)==="uhren") ? S.uhr.ort : HQ;
  if(ziel===HQ) return [{x:src.x,y:src.y},{x:src.x,y:r},{x:HQ.x,y:r},{x:HQ.x,y:HQ.y}];
  const rx=ROADS_X.reduce((a,b)=>Math.abs(b-ziel.x)<Math.abs(a-ziel.x)?b:a);
  return [{x:src.x,y:src.y},{x:src.x,y:r},{x:rx,y:r},{x:rx,y:ziel.y},{x:ziel.x,y:ziel.y}]; };
const pathLen=p=>{ let l=0; for(let i=1;i<p.length;i++) l+=dist(p[i-1],p[i]); return l; };
function pointAt(p,d){ for(let i=1;i<p.length;i++){ const s=dist(p[i-1],p[i]); if(s<=0) continue;   // zwei gleiche Punkte im Weg
    if(d<=s){ const f=d/s; return {x:p[i-1].x+(p[i].x-p[i-1].x)*f, y:p[i-1].y+(p[i].y-p[i-1].y)*f}; } d-=s; } return {...p[p.length-1]}; }
function stat(k,n){ if(!S) return; S.stats=S.stats||{}; (S.stats[k]=S.stats[k]||[]).push([S.t,n||1]); }
function perMin(k){ const a=(S.stats||{})[k]; if(!a) return 0; const now=S.t; while(a.length&&now-a[0][0]>60) a.shift(); const span=Math.min(60,Math.max(15,now-(S.statStart||0))); return Math.round(a.reduce((x,y)=>x+y[1],0)*60/span); }
const lagerSum=()=>S.lager.leder+S.lager.gummi+S.lager.metall;
const fachVoll=k=>S.lager[k]>=S.lagerCap;
const basePrice=(d,m)=>MODELS[m].p0/(1+d.s[m]/10);
const fakeLoad=(d,m)=>S.fakes.filter(f=>f.d===d&&f.m===m).reduce((a,f)=>a+f.str,0);
const priceIn=(d,m)=>Math.max(4,Math.round(basePrice(d,m)/(1+fakeLoad(d,m)/6)));
const sealedIn=(d,m)=>Math.max(4,Math.round(basePrice(d,m)*1.3));
const sueCost=()=>150+S.sues*90;
// Wie stark die Banden sind. Vorher lief das fast nur über die Spielzeit: Wer nichts tat, bekam
// trotzdem immer härtere Wellen, und wer viel verdiente, merkte davon nichts. Jetzt zählt vor allem,
// was gerade an Geld durch die Stadt geht.
const umsatzJetzt=()=>Math.round(S.uSchnitt||0);
const evo=()=>1+Math.max(0,S.t-S.wakeT)/1600+umsatzJetzt()/3000+S.sold/2400;
const routeCost=src=>Math.round(50+14*pathLen(pathOf(src)));
const etagenPreis=n=>S.haus==='uhren'?[0,2500,6000,12000,20000,32000][n]:(S.uhr?undefined:FLOOR_COST[n]);   // Kapitel 2 baut teurer, Sohle ist danach fertig gebaut
const fleetCost=()=>Math.round(250*Math.pow(1.35,S.fleet-2));   // war 1.6, der zehnte Platz kostete damit 6.711
const postCost=()=>140+S.posts.length*40;
const truckUpkeep=0.6, SUPPLY_R=3.4;
const RES=()=>S.research||{}; const postMax=()=>RES().vorrat?30:20;
const speedOf=(W,m)=>{ const M=W.mach[m.t]||{t:[5]}, T=M.t[Math.min(m.lvl||0,M.t.length-1)]; return Math.max(1,Math.round(T*(RES().tempo?0.75:1))); };
const inRange=po=>dist(po,HQ)<=SUPPLY_R||(S.uhr&&S.uhr.ort&&dist(po,S.uhr.ort)<=SUPPLY_R);   // die Manufaktur versorgt ihre Posten selbst                   // pro Sekunde und Transporter
function pop(p,t,c){ S.pops.push({x:p.x,y:p.y,t,c,ttl:1.3}); }
// Was ein Dieb aus der Kasse nimmt: höchstens die Hälfte, nie den Rest.
// Wer auf null gesetzt wird, kann nichts mehr bauen und kommt aus eigener Kraft nicht zurück.
const beuteGeld=max=>Math.max(0,Math.min(Math.floor(S.money/2),max));

const fakeSkill=()=>1+S.t/900+S.sold/700;
// Beute, die Diebe ins Versteck geschleppt haben
function beuteRein(n,L){ if(!L) return; const b=n.beute=n.beute||{money:0,leder:0,gummi:0,metall:0,ammo:0,fin:{}};
  if(L.money) b.money+=L.money; if(L.k) b[L.k]=(b[L.k]||0)+L.n; if(L.ammo) b.ammo+=L.ammo; if(L.fin) b.fin[L.fin]=(b.fin[L.fin]||0)+1; if(L.uhr) b.uhren=(b.uhren||0)+1; }
function beuteWert(n){ const b=n.beute; if(!b) return 0; return Math.round(b.money+ (b.leder+b.gummi+b.metall)*8 + b.ammo*4 + Object.values(b.fin).reduce((a,c)=>a+c,0)*40); }
function beuteText(n){ const b=n.beute; if(!b||!beuteWert(n)) return ""; const t=[];
  if(b.money) t.push(Math.round(b.money)+TX.money); for(const k of ["leder","gummi","metall"]) if(b[k]) t.push(b[k]+" "+k[0].toUpperCase()+k.slice(1));
  if(b.uhren) t.push(b.uhren+TX.watches); if(b.band) t.push(b.band+TX.straps); if(b.ammo) t.push(b.ammo+TX.gear); const sch=Object.values(b.fin).reduce((a,c)=>a+c,0); if(sch) t.push(sch+TX.pairs_of_shoes);
  return t.join(", "); }
// Ausgehobenes Versteck gibt alles zurück
function beuteZurueck(n){ const b=n.beute; if(!b) return; n.beute=null;
  S.money+=b.money||0; for(const k of ["leder","gummi","metall"]) if(b[k]) S.lager[k]=Math.min(S.lagerCap,S.lager[k]+b[k]);
  if(b.band) S.parts.band=(S.parts.band||0)+b.band;
  if(b.uhren&&S.uhr) S.uhr.fin.klassik=(S.uhr.fin.klassik||0)+b.uhren;
  if(b.ammo) S.ammo=Math.min(S.ammoCap,S.ammo+b.ammo); for(const m in b.fin) S.fin[m]=(S.fin[m]||0)+b.fin[m];
  const w=beuteWert({beute:b}); if(w) pop({x:n.x,y:n.y-0.5},TX.loot_recovered,"#1F7A55"); }

// Wohin eine Route liefert. Sand kann nur die Manufaktur brauchen, Leder und Gummi nur Sohle.
const zielVon=src=> src.k==="sand" ? "uhren" : (src.k==="metall" ? (src.ziel||"sohle") : "sohle");
const zielWerk=tr=>{ const src=S.sources[tr.src]; return src&&zielVon(src)==="uhren"&&S.uhr?uhrWerk():sohleWerk(); };
const zielName=src=>zielVon(src)==="uhren"?TX.manufactory:"Sohle";
const fleetUsed=()=>S.trucks.length+S.vans.length+((S.liefer2||[]).length);
// Feste Bauplätze im Viertel: links der Laden, rechts die Boutique. Vorher lagen beide
// auf demselben Punkt, sie standen übereinander und man musste die Mitte erraten.
// Liegt das Haus selbst auf dem Viertel, rücken die Plätze weiter nach außen. Sonst
// verschwindet der Laden hinter dem Turm und der Tipp darauf öffnet das Haus statt das Viertel.
const nahHaus=d=>dist(d,HQ)<1.2||!!(S.uhr&&S.uhr.ort&&dist(d,S.uhr.ort)<1.2);
const ladenOrt=d=>({x:d.x-(nahHaus(d)?1.3:0.5),y:d.y});
const boutiqueOrt=d=>({x:d.x+(nahHaus(d)?1.3:0.5),y:d.y});

// Preise, die sich am Umsatz orientieren, legen sich einmal fest und bleiben dann stehen.
// Vorher wanderten sie mit jedem Verkauf, und man konnte nicht darauf sparen.
const umsatzProMin=()=>Math.max(200,Math.round(S.earned/Math.max(2,S.t/60)));
function festPreis(k,rechne){ S.preise=S.preise||{}; if(S.preise[k]===undefined) S.preise[k]=rechne(); return S.preise[k]; }
const grossPreis=()=>festPreis("gross",()=>Math.max(5000,Math.round(umsatzProMin()*20/500)*500));
const grossOffen=()=>!S.flagship&&(S.curRes||Object.keys(S.research||{}).length>0);
const allResearched=()=>TECH.every(x=>RES()[x.k]);
const alleRes2=()=>!!S.uhr&&TECH2.every(x=>RES2()[x.k]);
const FW_FORSCHUNGEN=5;   // so viele Stufen braucht die Modewoche, die beiden teuersten darfst du auslassen
const resFertig=()=>TECH.filter(x=>RES()[x.k]).length;
const fwOffen=()=>resFertig()>=FW_FORSCHUNGEN;
