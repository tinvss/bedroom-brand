// Kapitel 3: die Rivalen. Sie kaufen, wenn du wartest, wehren sich, wenn du übernimmst,
// und greifen an, sobald du groß genug bist. Die Aufsicht bestraft später, wer zu dreckig gewinnt,
// die Rivalen bestrafen schon jetzt, wer zu langsam ist.
/* ================= Kapitel 3: Rivalen ================= */
// takt: Sekunden zwischen zwei Zügen, erst: erster Zug nach der Ankunft
// frei: wie weit sie für ein freies Haus mitbieten, wehr: wie weit sie ihr eigenes verteidigen (je mal Wert)
// angriff: wie oft ein Zug ein Angriff auf dich ist, sobald dir etwas gehört
const K3_CHARAKTER={
 goldhorn:{takt:80, erst:220, frei:1.25, wehr:1.95, angriff:0.25,
   mag:b=>(b.v==="banken"||b.v==="insel")?3:(b.stil==="klassik"||b.stil==="altbau")?2:1},
 blink:   {takt:42, erst:120, frei:1.75, wehr:1.45, angriff:0.35,
   mag:b=>(b.stil==="neon"||b.stil==="tech"||b.typ==="werbung"||b.typ==="sneaker"||b.typ==="tech")?3:b.stil==="glas"?2:1},
 bloom:   {takt:58, erst:150, frei:1.5,  wehr:1.6,  angriff:0.3,
   mag:b=>(b.v==="uptown"||b.v==="midtown")?3:(b.typ==="hotel"||b.typ==="imbiss")?2:1},
 hammer:  {takt:50, erst:180, frei:1.3,  wehr:1.35, angriff:0.7,
   mag:b=>(b.typ==="bank"||b.typ==="kanzlei"||b.typ==="parkhaus")?3:(b.v==="hafen"||b.v==="banken")?2:1}};
const K3_BIETEN_ZEIT=9, K3_NACHLEGEN=4, K3_ANGRIFF_ZEIT=20, K3_ANWALT_CD=150;
const k3Rv=k=>{ const R=S.k3.r=S.k3.r||{}; return R[k]=R[k]||{nextT:S.k3.t0+K3_CHARAKTER[k].erst}; };
const k3Schritt=p=>Math.round(Math.max(p*1.1,p+1000)/1000)*1000;
// Wie weit ein Rivale bei diesem Haus mitgeht. Jede deiner Kanzleien nimmt seiner Verteidigung etwas.
function k3RivalMax(k,b,art){ const C=K3_CHARAKTER[k], G=S.k3.g[b.id];
  if(k3Skandal(k)) return 0;
  const f=art==="frei"?C.frei:Math.max(1,C.wehr-0.1*k3Anz("kanzlei"));
  return Math.round(G.wert*f*(C.mag(b)>=3?1.1:1)*(art==="frei"?1:k3Macht())*(1+k3Kasse(k))); }

// ---------- Bieterkampf ----------
// Ein Haus, zwei Bieter. Jedes neue Gebot verlängert die Uhr. Wer am Ende vorne liegt, bekommt es.
function k3AuktionStart(id,rival,art,start,fuehrt){ const K=S.k3; if(K.auktion) return false;
  K.auktion={id, rival, art, preis:start, fuehrt, ende:S.t+K3_BIETEN_ZEIT, antwortT:S.t+1.2, du:fuehrt==="du"};
  const b=k3Geb(id); k3Pop(b,TX.k3_pop_bieterkampf,"#F2B441");
  k3Erklaer("k3auktion",TX.k3_auktion_titel,TX.k3_auktion_erkl);
  return true; }
function k3Bieten(){ const A=S.k3.auktion; if(!A||A.fuehrt==="du") return; const b=k3Geb(A.id), p=k3Schritt(A.preis);
  if(S.money+k3KreditFrei()<p) return; A.preis=p; A.fuehrt="du"; A.du=true; A.ende=Math.max(A.ende,S.t+K3_NACHLEGEN); A.antwortT=S.t+1.2; k3Pop(b,"+"+k3Fmt(p),K3_DU.farbe); }
function k3AuktionStep(){ const A=S.k3.auktion; if(!A) return; const b=k3Geb(A.id), G=S.k3.g[A.id];
  // Der Rivale legt nach, solange es sich für ihn lohnt
  if(A.fuehrt==="du"&&S.t>=A.antwortT&&!A.raus){ const p=k3Schritt(A.preis);
    if(p<=k3RivalMax(A.rival,b,A.art)){ A.preis=p; A.fuehrt=A.rival; A.ende=Math.max(A.ende,S.t+K3_NACHLEGEN); k3Pop(b,"+"+k3Fmt(p),k3Farbe(A.rival)); }
    else { A.raus=true; k3Pop(b,TX.k3_pop_steigt_aus(K3_RIVALEN[A.rival].n.split(" ").slice(-1)[0]),"#FBF8F2"); A.ende=Math.min(A.ende,S.t+1.5); } }
  if(S.t<A.ende) return;
  S.k3.auktion=null;
  if(A.fuehrt==="du"){ if(!k3Kaufen(A.id,A.preis)){ G.o=A.art==="frei"?A.rival:G.o; G.kaufT=S.t; } }
  else if(A.art==="frei"){ G.o=A.rival; G.kaufT=S.t; k3Pop(b,TX.k3_pop_rivale_kauft(K3_RIVALEN[A.rival].n.split(" ").slice(-1)[0]),k3Farbe(A.rival)); if(A.du) k3Hoch(-5); }
  else k3Verloren(A,b,G); }
// Ein verlorener Übernahmeversuch hat Folgen: Blamage, das Haus ist zu, und der Rivale schlägt zurück
const K3_SPERRE=120;
function k3Verloren(A,b,G){ G.sperreT=S.t+K3_SPERRE; k3Hoch(-12); k3Pop(b,TX.k3_pop_blamiert,"#FF6B5B");
  const R=k3Rv(A.rival); R.rache=true; R.nextT=Math.min(R.nextT,S.t+8);
  k3Erklaer("k3blamage",TX.k3_blamage_titel,TX.k3_blamage(K3_RIVALEN[A.rival].n)); }

// Übernehmen: wehrt sich der Besitzer, wird es ein Bieterkampf, sonst gehört es dir sofort
function k3Uebernehmen(id){ const b=k3Geb(id), G=S.k3.g[id]; if(!k3Kaufbar(b)||!k3Leistbar(b)||S.k3.auktion) return false;
  const p=k3Preis(b);
  if(G.o&&k3RivalMax(G.o,b,"wehr")>=k3Schritt(p)) return k3AuktionStart(id,G.o,"wehr",p,"du");
  return k3Kaufen(id); }

// ---------- Angriffe auf dich ----------
const k3AbwehrPreis=b=>Math.round(S.k3.g[b.id].wert*0.4*(1+k3Anteil("du"))/1000)*1000;
const k3AnwaltBereit=()=>k3Anz("kanzlei")>0&&k3Cooldown(S.k3.anwaltT,K3_ANWALT_CD,k3Anz("kanzlei"))===0;
function k3AngriffStart(k){ const K=S.k3; if(K.angriff) return false; const C=K3_CHARAKTER[k];
  const ziel=k3Meine().filter(b=>!(K.auktion&&K.auktion.id===b.id)).sort((a,b)=>C.mag(b)*K.g[b.id].wert-C.mag(a)*K.g[a.id].wert)[0];
  if(!ziel) return false; K.angriff={id:ziel.id, rival:k, ende:S.t+K3_ANGRIFF_ZEIT};
  k3Pop(ziel,TX.k3_pop_angriff,"#FF6B5B"); k3Erklaer("k3angriff",TX.k3_angriff_titel,TX.k3_angriff_erkl); return true; }
function k3Abwehren(){ const A=S.k3.angriff; if(!A) return; const b=k3Geb(A.id), c=k3AbwehrPreis(b); if(S.money<c) return;
  S.money-=c; S.k3.angriff=null; k3Hoch(6); k3Pop(b,TX.k3_pop_abgewehrt,"#7CE0A6"); }
function k3Anwaelte(){ const A=S.k3.angriff; if(!A||!k3AnwaltBereit()) return; S.k3.anwaltT=S.t; S.k3.angriff=null; k3Hoch(4); k3Pop(k3Geb(A.id),TX.k3_pop_anwaelte,"#7CE0A6"); }
function k3AngriffStep(){ const A=S.k3.angriff; if(!A) return; const G=S.k3.g[A.id];
  if(G.o!=="du"){ S.k3.angriff=null; return; }                              // verkauft oder schon weg
  if(k3Skandal(A.rival)){ S.k3.angriff=null; k3Pop(k3Geb(A.id),TX.k3_pop_rueckzug,"#7CE0A6"); return; }   // wer in der Zeitung steht, zieht zurück
  if(S.t<A.ende) return;
  S.k3.angriff=null; const b=k3Geb(A.id), ersatz=Math.round(G.wert*0.6);
  G.o=A.rival; G.kaufT=S.t; S.money+=ersatz; k3Hoch(-10);
  k3Pop(b,TX.k3_pop_verloren(k3Fmt(ersatz)),"#FF6B5B"); }

// ---------- Der Zug eines Rivalen ----------
function k3RivalenStep(){ const K=S.k3; if(!K.seen.ankunft) return;
  k3AuktionStep(); k3AngriffStep();
  const anteil=k3Anteil("du");
  for(const k of Object.keys(K3_CHARAKTER)){ const R=k3Rv(k), C=K3_CHARAKTER[k];
    if(S.t<R.nextT) continue;
    if(k3Skandal(k)){ R.nextT=S.t+5; continue; }
    const frei=K3_GEB.filter(b=>!K.g[b.id].o&&b.typ!=="turm"&&!(K.auktion&&K.auktion.id===b.id));
    // Je größer du bist, desto öfter wirst du zum Ziel
    // Nach einem verlorenen Übernahmeversuch kommt die Rache sicher
    const angreifen=k3Meine().length>=1&&(R.rache||(k3Meine().length>=2&&S.t>=(K.ruheT||0)&&Math.random()<Math.min(0.8,C.angriff*(0.35+anteil*1.6))));
    let getan=false;
    if(angreifen&&!K.angriff){ getan=k3AngriffStart(k); if(getan){ K.ruheT=S.t+K3_ANGRIFF_ZEIT+25; R.rache=false; } }
    else if(R.rache&&K.angriff){ R.nextT=S.t+5; continue; }   // die Rache wartet, bis der laufende Angriff vorbei ist   // nach einem Angriff kurz Ruhe
    if(!getan&&frei.length&&!K.auktion){ const b=frei.sort((a,c)=>C.mag(c)-C.mag(a)||K.g[a.id].wert-K.g[c.id].wert)[0];
      getan=k3AuktionStart(b.id,k,"frei",K.g[b.id].wert,k); }
    R.nextT=S.t+(getan?C.takt*(0.8+Math.random()*0.4)/(0.8+anteil*1.5):6); } }

// Erklärung beim ersten Mal, auch wenn kurz vorher schon eine kam
function k3Erklaer(key,titel,html){ if(S.seen[key]) return; S.lastExplain=-99; once(key,titel,html); }
