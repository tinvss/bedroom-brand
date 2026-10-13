// Kapitel 3: Kaufen, Einnahmen, Hype und die Waffen der Holding
/* ================= Kapitel 3: Wirtschaft ================= */
// Grundregel: Warten verliert. Der Hype sinkt ständig und mit ihm jede Einnahme.
// Wer kauft, übernimmt und seine Waffen einsetzt, hält ihn oben.
const K3_AUFSCHLAG=1.6, K3_KAMPAGNE_CD=90, K3_SCHLAGZEILE_CD=120, K3_SKANDAL=60;
const k3Meine=()=>K3_GEB.filter(b=>S.k3.g[b.id].o==="du");
const k3Anz=typ=>k3Meine().filter(b=>b.typ===typ).length;
const k3Hype=()=>S.k3.hype===undefined?50:S.k3.hype;
const k3HypeFaktor=()=>0.5+k3Hype()/100;
// Jede Kanzlei findet eine Lücke mehr im Vertrag: der Aufschlag für Übernahmen sinkt
// Je mehr dir gehört, desto teurer wird jeder Rest: die anderen wissen, was du vorhast
const k3Macht=()=>1+k3Anteil("du")*2.5;
const k3Aufschlag=()=>Math.max(1.2,K3_AUFSCHLAG-0.15*k3Anz("kanzlei"))*k3Macht();
const k3Skandal=o=>!!(o&&o!=="du"&&S.k3.skandal&&S.k3.skandal[o]>S.t);
const k3Gesperrt=b=>(S.k3.g[b.id].sperreT||0)>S.t;
const k3Kaufbar=b=>b.typ!=="turm"&&S.k3.g[b.id].o!=="du"&&!(S.k3.auktion&&S.k3.auktion.id===b.id)&&!k3Gesperrt(b);
function k3Preis(b){ const G=S.k3.g[b.id]; if(!G.o) return G.wert;
  return Math.round(G.wert*k3Aufschlag()*(k3Skandal(G.o)?0.75:1)/1000)*1000; }
// Was ein Gebäude pro Minute bringt
function k3Rate(b){ const G=S.k3.g[b.id], T=K3_TYPEN[b.typ]; if(b.typ==="tech"&&G.aus>S.t) return 0;
  let r=T.rate; if(b.typ==="parkhaus") r+=0.08*k3Meine().filter(x=>x.v===b.v&&x!==b).length;
  // Trophäen rentieren sich langsamer: ein kleines Haus verdient sein Geld schnell, ein Prestigeturm nicht
  r*=Math.pow(S.k3.budget/G.wert,0.8);
  return G.wert*r*k3HypeFaktor(); }
const k3ProMin=()=>k3Meine().reduce((a,b)=>a+k3Rate(b),0);
// Die Bank leiht bis zu vier Fünftel ihres Werts. Zurück geht es von selbst, mit einem Zehntel Zins.
const k3KreditRahmen=()=>Math.round(k3Meine().filter(b=>b.typ==="bank").reduce((a,b)=>a+S.k3.g[b.id].wert*0.8,0)/1000)*1000;
const k3KreditFrei=()=>Math.max(0,k3KreditRahmen()-(S.k3.schuld||0));
const k3Leistbar=b=>S.money+k3KreditFrei()>=k3Preis(b);
const k3Cooldown=(t,cd,n)=>Math.max(0,Math.ceil((t===undefined?-1e9:t)+cd/(1+0.5*Math.max(0,n-1))-S.t));

// Zahlen, die über einem Dach aufsteigen. Nur zum Anschauen, nicht im Spielstand.
let k3Pops=[];
function k3Pop(b,text,farbe){ k3Pops.push({x:b.x+b.w/2, y:K3_GY-b.h-70, text, farbe, t0:animT}); if(k3Pops.length>40) k3Pops.shift(); }

function k3Hoch(n){ S.k3.hype=Math.max(0,Math.min(100,k3Hype()+n)); }
// preis: was ein Bieterkampf am Ende gekostet hat, sonst der normale Preis
function k3Kaufen(id,preis){ const b=k3Geb(id), G=S.k3.g[id], p=preis||k3Preis(b), vorher=G.o;
  if(!k3Kaufbar(b)||S.money+k3KreditFrei()<p) return false;
  if(S.money<p){ const k=p-Math.max(0,Math.round(S.money)); S.k3.schuld=(S.k3.schuld||0)+Math.round(k*1.1); S.money+=k; }
  S.money-=p; G.o="du"; G.kaufT=S.t; G.zahlT=S.t; G.topf=0; S.k3.kaeufe=(S.k3.kaeufe||0)+1;
  k3Hoch((vorher?18:12)+Math.min(10,4*p/S.k3.budget));
  k3Pop(b,vorher?TX.k3_pop_uebernommen:TX.k3_pop_gekauft,"#F2B441");
  if(K3_TYPEN[b.typ].waffe) once("k3w_"+b.typ,K3_TYPEN[b.typ].n,TX["k3_waffe_"+b.typ]);
  return true; }
function k3Verkaufen(id){ const b=k3Geb(id), G=S.k3.g[id]; if(G.o!=="du") return;
  G.o=null; G.kaufT=S.t; S.money+=Math.round(G.wert*0.8); k3Hoch(-8); k3Pop(b,TX.k3_pop_verkauft,"#FBF8F2"); }
function k3Tilgen(){ const n=Math.min(Math.max(0,Math.floor(S.money)),S.k3.schuld||0); S.money-=n; S.k3.schuld-=n; }

// Die Waffen
function k3Kampagne(){ const n=k3Anz("werbung"); if(!n||k3Cooldown(S.k3.kampagneT,K3_KAMPAGNE_CD,n)>0) return;
  S.k3.kampagneT=S.t; k3Hoch(30); const b=k3Meine().find(x=>x.typ==="werbung"); if(b) k3Pop(b,TX.k3_pop_kampagne,"#F2B441"); }
function k3Schlagzeile(o){ const n=k3Anz("zeitung"); if(!n||!K3_RIVALEN[o]||k3Cooldown(S.k3.zeitungT,K3_SCHLAGZEILE_CD,n)>0) return;
  S.k3.zeitungT=S.t; S.k3.skandal=S.k3.skandal||{}; S.k3.skandal[o]=S.t+K3_SKANDAL;
  K3_GEB.filter(b=>S.k3.g[b.id].o===o).forEach(b=>k3Pop(b,TX.k3_pop_skandal,"#FF6B5B")); }

function k3Step(){ const K=S.k3; if(K.hype===undefined) K.hype=50;
  // Oben fällt der Hype schneller als unten. Eine Werbeagentur bremst den Fall.
  K.hype=Math.max(0,K.hype-(0.05+K.hype*0.007)*(k3Anz("werbung")?0.7:1)*DT);
  if(K.hype<12&&k3Meine().length) once("k3hypeweg",TX.k3_hypeweg_titel,TX.k3_hypeweg);
  for(const b of k3Meine()){ const G=K.g[b.id];
    // Die Techfirma hat Launen: ab und zu ist der Server weg und sie bringt nichts
    if(b.typ==="tech"&&!(G.aus>S.t)&&Math.random()<DT/45){ G.aus=S.t+12; k3Pop(b,TX.k3_pop_server,"#FF6B5B"); }
    G.topf=(G.topf||0)+k3Rate(b)/60*DT;
    if(S.t-(G.zahlT||0)>=5){ G.zahlT=S.t; let n=Math.round(G.topf); G.topf=0; if(n<1) continue;
      if(K.schuld>0){ const t=Math.min(K.schuld,Math.round(n*0.4)); K.schuld-=t; n-=t; }
      S.money+=n; S.earned+=n; k3Pop(b,"+"+k3Fmt(n),"#7CE0A6"); } }
  k3RivalenStep(); }

// Das kleine Tutorial nach der Ankunft: ein Haus kaufen, Logo, Hype, Waffen
function k3Tutorial(){ if(S.k3.seen.tut) return; S.k3.seen.tut=true; tutOn=true; tutI=TUT.length; tutQ=[];
  // Zuerst die Werbeagentur am Hafen: damit gibt es sofort einen Knopf und etwas zu tun
  const erstes=()=>[k3Geb("kai")].concat(K3_GEB).find(b=>!S.k3.g[b.id].o&&k3Leistbar(b))||k3Geb("pier9"), agentur=erstes().id==="kai";
  tutQ.push({id:"k3a", k3:()=>erstes().id, opt:"[data-kauf]", t:agentur?TX.k3_tut_1_agentur:TX.k3_tut_1, optT:TX.k3_tut_1b, done:()=>k3Meine().length>0},
    {id:"k3b", k3:()=>(k3Meine()[0]||erstes()).id, info:true, t:TX.k3_tut_2},
    {id:"k3c", el:()=>$("k3status"), info:true, t:TX.k3_tut_3},
    {id:"k3d", el:()=>$("k3aktionen"), info:true, t:agentur?TX.k3_tut_4_agentur:TX.k3_tut_4}); }
