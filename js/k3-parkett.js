// Kapitel 3: das Parkett. Pump and Dump: kauf billig eine Aktie, lass sie am Telefon hochjubeln,
// und verkauf, bevor die Blase platzt. Das ist die Mechanik, die immer läuft, wie der Turm in Kapitel 1.
// Die Entscheidungen: welche Aktie, wie viel Einsatz, welche Anrufe, und vor allem: wann raus.
/* ================= Kapitel 3: Parkett ================= */
const K3P_VW=500, K3P_VH=430;
// Neun Plätze: 0 ist dein Chefschreibtisch vorn in der Mitte, dann vordere Reihe, dann hintere
const K3P_PLAETZE=[{x:250,y:372,s:1.18},{x:72,y:362,s:1},{x:428,y:362,s:1},{x:160,y:362,s:1},{x:340,y:362,s:1},
  {x:98,y:258,s:0.82},{x:202,y:258,s:0.82},{x:298,y:258,s:0.82},{x:402,y:258,s:0.82}];
// Anrufe: jeder verkaufte Posten treibt den Kurs hoch, aber auch die Hitze. Rot ist schnell und heiß.
// Lila ist ein Gerücht aus deiner Zeitung: es kühlt die Blase und bringt einen Rivalen in die Zeitung.
const K3P_SORTEN={
 gruen:{farbe:"#1F9E6E", kurs:0.05, hitze:0.025, klingeln:7, hype:0.3},
 gelb: {farbe:"#E0A21F", kurs:0.11, hitze:0.06,  klingeln:7, hype:0.6},
 rot:  {farbe:"#D9372B", kurs:0.25, hitze:0.16,  klingeln:6, hype:1.2},
 tipp: {farbe:"#7B5BC0", kurs:0.02, hitze:-0.12, klingeln:7, hype:0.8}};
// Temperament einer Aktie: wie stark sie auf Anrufe springt und wie schnell sie heiß wird
const K3P_TEMP={ruhig:{kurs:0.8, hitze:0.75}, normal:{kurs:1, hitze:1}, wild:{kurs:1.35, hitze:1.3}};
const K3P_START_TISCHE=3, K3P_BROKER_ZEIT=1.2;
// Branchen: Häuser einer Branche lassen ihre Aktien schneller steigen, erlauben größere Einsätze,
// und ab dem ersten Haus bist du Insider: du siehst, wo die Blase platzt.
const K3_BRANCHEN={gastro:["imbiss"], immo:["hotel","parkhaus"], medien:["zeitung","werbung"], finanz:["bank","kanzlei"], tech:["tech"], mode:["sneaker"]};
const k3Branche=typ=>Object.keys(K3_BRANCHEN).find(k=>K3_BRANCHEN[k].includes(typ))||null;
const k3BranchenAnz=br=>k3Meine().filter(b=>k3Branche(b.typ)===br).length;
const k3BranchenFaktor=br=>br?Math.min(1.6,0.7+0.3*k3BranchenAnz(br)):1;
const k3Insider=br=>k3BranchenAnz(br)>0;
const k3PMax=br=>Math.round(S.k3.budget*0.45*(1+0.25*k3BranchenAnz(br))*(1+0.04*k3Meine().length)/1000)*1000;

function k3P(){ const K=S.k3; if(!K.p) K.p={tische:K3P_PLAETZE.map((_,i)=>({offen:i<=K3P_START_TISCHE, broker:false, lvl:0})), anrufe:[], nextT:S.t+3, an:0, weg:0, nr:0};
  const P=K.p; delete P.leitung; P.tische.forEach(t=>delete t.arbeit);   // Reste der Fassung mit einer Leitung
  if(P.akt===undefined) P.akt=null; if(!P.akt&&P.anrufe.length) P.anrufe=[]; if(!P.angebote||!P.angebote.length) P.angebote=k3PNeueAngebote(); P.gew=P.gew||0; P.platz=P.platz||0; return P; }
function k3PNeueAngebote(){ const brs=Object.keys(K3_BRANCHEN).sort(()=>Math.random()-0.5).slice(0,3), temps=["ruhig","normal","wild"].sort(()=>Math.random()-0.5);
  return brs.map((br,i)=>{ const namen=TX["k3_aktien_"+br]; return {br, temp:temps[i], name:namen[Math.floor(Math.random()*namen.length)]}; }); }
const k3PTischPreis=()=>{ const n=k3P().tische.filter(t=>t.offen).length-1-K3P_START_TISCHE; return Math.round(S.k3.budget*0.25*Math.pow(1.6,Math.max(0,n))/1000)*1000; };
const k3PBrokerPreis=()=>{ const n=k3P().tische.filter(t=>t.broker).length; return Math.round(S.k3.budget*0.15*Math.pow(1.5,n)/1000)*1000; };
const k3PSchulungPreis=()=>{ const n=k3P().tische.filter(t=>t.lvl>0).length; return Math.round(S.k3.budget*0.3*Math.pow(1.5,n)/1000)*1000; };
const k3PKlingelt=()=>(S.k3&&S.k3.p?S.k3.p.anrufe.length:0);
// Broker telefonieren von selbst, auch wenn es schon heiß ist. Grün, nach der Schulung auch gelb.
const k3PKannBroker=(t,a)=>t.broker&&(a.typ==="gruen"||(a.typ==="gelb"&&t.lvl>=1));
// Die Kriegskasse eines Rivalen: verpasste Anrufe landen dort. Sie macht ihn in Bieterkämpfen stärker.
const k3Kasse=k=>Math.min(0.4,((S.k3.r&&S.k3.r[k]&&S.k3.r[k].kk)||0)/S.k3.budget*0.15);
// Was ein Anruf am Kurs macht, in Prozent vom Einsatz
const k3PSprung=a=>{ const A=k3P().akt; return A?K3P_SORTEN[a.typ].kurs*k3BranchenFaktor(A.br)*K3P_TEMP[A.temp].kurs:0; };
const k3PWarnung=A=>A&&A.hitze>=A.grenze-0.15;

// Einsteigen: drei Größen, die größte hängt an deinen Häusern dieser Branche
function k3PEinsteigen(i,stufe){ const P=k3P(); if(P.akt) return false; const O=P.angebote[i]; if(!O) return false;
  const e=Math.round(k3PMax(O.br)*[1/3,2/3,1][stufe]/1000)*1000; if(S.money<e) return false;
  S.money-=e; P.akt={name:O.name, br:O.br, temp:O.temp, einsatz:e, kurs:1, hitze:0, grenze:0.82+Math.random()*0.18, t0:S.t};
  P.nextT=Math.min(P.nextT,S.t+0.8); return true; }
// Verkaufen: Einsatz mal Kurs. In Phase 5 schaut sich die Aufsicht das an.
function k3PVerkaufen(){ const P=k3P(), A=P.akt; if(!A) return 0; const n=Math.round(A.einsatz*A.kurs);
  S.money+=n; S.earned+=n; stat('k3_ein',Math.max(0,n-A.einsatz)); P.gew++; P.akt=null; P.anrufe=[]; P.angebote=k3PNeueAngebote();
  k3Hoch(Math.min(12,3+6*(A.kurs-1))); k3PPop(250,140,TX.k3_p_verkauft_pop(k3Fmt(n)),"#7CE0A6"); return n; }
function k3PPlatzt(){ const P=k3P(), A=P.akt; const rest=Math.round(A.einsatz*0.1); S.money+=rest; P.platz++; P.akt=null; P.anrufe=[]; P.angebote=k3PNeueAngebote();
  k3Hoch(-10); k3PPop(250,140,TX.k3_p_platzt_pop,"#FF6B5B"); P.knallT=animT; k3Erklaer("k3platzt",TX.k3_p_platzt_titel,TX.k3_p_platzt_erkl); }

function k3PStep(){ const P=k3P(), A=P.akt;
  for(const k in (S.k3.r||{})){ const R=S.k3.r[k]; if(R.kk) R.kk*=Math.pow(0.995,DT); }   // Kriegskassen schmelzen langsam
  if(!A) return;
  // Ohne Telefonieren sackt der Kurs, die Hitze kühlt ab
  A.kurs=Math.max(0.5,A.kurs-0.004*DT); A.hitze=Math.max(0,A.hitze-0.006*DT);
  // Wird es heiß, steigen die Rivalen aus, die mitgepumpt haben: der Kurs fällt
  if(A.hitze>0.55&&Math.random()<0.035*DT){ const k=Object.keys(K3_RIVALEN)[Math.floor(Math.random()*4)];
    A.kurs=Math.max(0.5,A.kurs*0.85); A.hitze=Math.max(0,A.hitze-0.12); k3PPop(250,120,TX.k3_p_aussteiger(K3_RIVALEN[k].n.split(" ").slice(-1)[0]),k3Farbe(k)); }
  if(A.hitze>=A.grenze){ k3PPlatzt(); return; }
  // Neuer Anruf an einem freien Tisch. Jede Werbeagentur lässt es öfter klingeln.
  if(S.t>=P.nextT){ P.nextT=S.t+1.6/(1+0.25*k3Anz("werbung"))*(0.75+Math.random()*0.5);
    const frei=P.tische.map((t,i)=>i).filter(i=>P.tische[i].offen&&!P.anrufe.some(a=>a.platz===i));
    if(frei.length){ const z=Math.random(), tipp=k3Anz("zeitung")>0;
      const typ=z<0.5?"gruen":z<0.8?"gelb":z<(tipp?0.92:1)?"rot":"tipp";
      const i=frei[Math.floor(Math.random()*frei.length)], namen=TX["k3_anrufer_"+typ];
      P.anrufe.push({id:++P.nr, platz:i, typ, t0:S.t, dauer:K3P_SORTEN[typ].klingeln, name:namen[Math.floor(Math.random()*namen.length)],
        rival:typ==="tipp"?Object.keys(K3_RIVALEN)[Math.floor(Math.random()*4)]:null}); } }
  for(const a of P.anrufe.slice()){ const t=P.tische[a.platz];
    if(k3PKannBroker(t,a)&&S.t-a.t0>=K3P_BROKER_ZEIT){ k3PAnnehmen(a,true); continue; }
    if(S.t-a.t0>=a.dauer) k3PVerpasst(a); } }

// Abheben: ein Posten mehr verkauft, der Kurs springt, die Hitze steigt
function k3PAnnehmen(a,broker){ const P=k3P(), A=P.akt; if(!A||!P.anrufe.includes(a)) return false;
  P.anrufe=P.anrufe.filter(x=>x!==a); P.an++; const F=K3P_SORTEN[a.typ], sp=k3PSprung(a);
  A.kurs+=sp; A.hitze=Math.max(0,A.hitze+F.hitze*K3P_TEMP[A.temp].hitze);
  if(!broker) k3Hoch(F.hype);
  const p=K3P_PLAETZE[a.platz]; k3PPop(p.x,p.y-70*p.s,a.typ==="tipp"?TX.k3_p_kuehlt:"▲ "+Math.round(sp*100)+" %",broker?"#BFE9D2":F.farbe==="#D9372B"?"#FF8A7A":"#7CE0A6");
  // Ein Gerücht aus deiner Zeitung: der Rivale steht eine halbe Minute schlecht da
  if(a.typ==="tipp"&&a.rival){ S.k3.skandal=S.k3.skandal||{}; S.k3.skandal[a.rival]=Math.max(S.k3.skandal[a.rival]||0,S.t+30);
    k3PPop(p.x,p.y-100*p.s,TX.k3_p_tipp_pop(K3_RIVALEN[a.rival].n.split(" ").slice(-1)[0]),"#C9B3FF"); }
  return true; }
function k3PVerpasst(a){ const P=k3P(); P.anrufe=P.anrufe.filter(x=>x!==a); P.weg++;
  const k=Object.keys(K3_RIVALEN)[Math.floor(Math.random()*4)], R=k3Rv(k); R.kk=(R.kk||0)+(P.akt?P.akt.einsatz*0.15:0);
  const p=K3P_PLAETZE[a.platz]; k3PPop(p.x,p.y-70*p.s,TX.k3_p_an_rivale(K3_RIVALEN[k].n.split(" ").slice(-1)[0]),k3Farbe(k)); }

// Symbole der Branchen, auf der Leinwand und als SVG
function k3BrIcon(c,br,x,y,r,f){ c.save(); c.translate(x,y); c.scale(r/10,r/10); c.fillStyle=f; c.strokeStyle=f; c.lineWidth=2; c.lineCap="round";
  if(br==="gastro"){ c.beginPath(); c.arc(0,1,6,0,7); c.stroke(); c.beginPath(); c.moveTo(-9,-7); c.lineTo(-9,8); c.moveTo(9,-7); c.lineTo(9,8); c.stroke(); }
  else if(br==="immo"){ c.beginPath(); c.moveTo(-9,0); c.lineTo(0,-8); c.lineTo(9,0); c.closePath(); c.fill(); c.fillRect(-6,0,12,8); }
  else if(br==="medien"){ c.strokeRect(-8,-7,16,14); c.fillRect(-5,-4,10,3); c.fillRect(-5,1,10,1.6); c.fillRect(-5,4,7,1.6); }
  else if(br==="finanz"){ c.beginPath(); c.arc(0,0,8,0,7); c.stroke(); c.fillRect(-1,-5,2,10); c.fillRect(-4,-3,8,1.8); c.fillRect(-4,1.5,8,1.8); }
  else if(br==="tech"){ c.strokeRect(-6,-6,12,12); c.fillRect(-3,-3,6,6); for(const q of [-3,1]){ c.fillRect(q,-9,2,3); c.fillRect(q,6,2,3); c.fillRect(-9,q,3,2); c.fillRect(6,q,3,2); } }
  else if(br==="mode"){ c.scale(0.7,0.7); c.translate(0,2); c.fill(SHOE_LOW); }
  c.restore(); }
function k3BrSvg(br,px){ const g={gastro:'<circle cx="0" cy="1" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M-9-7V8M9-7V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  immo:'<path d="M-9 0 0-8 9 0Z" fill="currentColor"/><rect x="-6" y="0" width="12" height="8" fill="currentColor"/>',
  medien:'<rect x="-8" y="-7" width="16" height="14" fill="none" stroke="currentColor" stroke-width="2"/><rect x="-5" y="-4" width="10" height="3" fill="currentColor"/><rect x="-5" y="1" width="10" height="1.6" fill="currentColor"/><rect x="-5" y="4" width="7" height="1.6" fill="currentColor"/>',
  finanz:'<circle r="8" fill="none" stroke="currentColor" stroke-width="2"/><rect x="-1" y="-5" width="2" height="10" fill="currentColor"/><rect x="-4" y="-3" width="8" height="1.8" fill="currentColor"/><rect x="-4" y="1.5" width="8" height="1.8" fill="currentColor"/>',
  tech:'<rect x="-6" y="-6" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"/><rect x="-3" y="-3" width="6" height="6" fill="currentColor"/>',
  mode:'<path transform="scale(.7) translate(0 2)" fill="currentColor" d="M-12 3c0-4 2-9 6-10l5 3c3 1 7 2 10 4 2 1 3 2 3 3v1h-24z"/>'}[br]||"";
  return `<svg width="${px}" height="${px}" viewBox="-11 -11 22 22" style="vertical-align:-3px">${g}</svg>`; }

// ---------- Zeichnen ----------
const k3pcv=$("k3pc"), k3pctx=k3pcv&&k3pcv.getContext?k3pcv.getContext("2d"):null; let K3PS=1, k3PPops=[];
function k3PPop(x,y,text,farbe){ k3PPops.push({x,y,text,farbe,t0:animT}); if(k3PPops.length>30) k3PPops.shift(); }
function k3PGroesse(){ const w=k3pcv.clientWidth||360, d=Math.min(2,window.devicePixelRatio||1); K3PS=w/K3P_VW; const h=K3P_VH*K3PS;
  if(k3pcv.width!==Math.round(w*d)||k3pcv.height!==Math.round(h*d)){ k3pcv.style.height=h+"px"; k3pcv.width=Math.round(w*d); k3pcv.height=Math.round(h*d); } return d; }
function k3PFigur(c,x,y,s,chef,t,telefon,schwitzt){ c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle=chef?"#1B1A17":"#3A4452"; c.beginPath(); c.roundRect(-12,-34,24,28,6); c.fill();   // Anzug
  c.fillStyle="#FBF8F2"; c.beginPath(); c.moveTo(-4,-34); c.lineTo(0,-24); c.lineTo(4,-34); c.fill(); c.fillStyle=chef?"#E4572E":"#B8432F"; c.fillRect(-1.5,-31,3,9);
  c.fillStyle="#E8C4A0"; c.beginPath(); c.arc(0,-44,9,0,7); c.fill();
  c.fillStyle=chef?"#3A2A1E":"#2B2622"; c.beginPath(); c.arc(0,-47,9,Math.PI,0); c.fill();
  if(telefon){ c.strokeStyle="#1B1A17"; c.lineWidth=2; c.beginPath(); c.arc(0,-44,11,Math.PI*1.1,Math.PI*1.9); c.stroke(); c.fillStyle="#1B1A17"; c.fillRect(8,-44,4,6); }
  // Schweißtropfen, wenn die Blase kurz vor dem Platzen ist
  if(schwitzt){ c.fillStyle="#7FC8F8"; for(const [dx,ph] of [[-11,0],[10,0.5]]){ const q=(t*1.6+ph)%1; c.globalAlpha=1-q; c.beginPath(); c.arc(dx,-50+q*14,2,0,7); c.fill(); } c.globalAlpha=1; }
  c.restore(); }
function k3PTisch(c,i,t,a){ const p=K3P_PLAETZE[i], P=k3P(), T=P.tische[i], s=p.s, chef=i===0, warn=k3PWarnung(P.akt);
  c.save(); c.translate(p.x,p.y);
  if(!T.offen){ c.strokeStyle="rgba(27,26,23,.25)"; c.setLineDash([6,6]); c.lineWidth=2; c.strokeRect(-40*s,-34*s,80*s,40*s); c.setLineDash([]);
    c.fillStyle="rgba(27,26,23,.35)"; c.font=`800 ${26*s}px Archivo, sans-serif`; c.textAlign="center"; c.fillText("+",0,-6*s); c.restore(); return; }
  c.fillStyle="#2B2925"; c.fillRect(-12*s,-30*s,24*s,30*s);
  if(chef||T.broker) k3PFigur(c,0,-4*s,s,chef,t,!!a&&(chef||k3PKannBroker(T,a)),warn);
  c.fillStyle=chef?"#5A3A25":"#7A5A3E"; c.fillRect(-(chef?52:40)*s,-6*s,(chef?104:80)*s,9*s);
  c.fillStyle=chef?"#46301F":"#5F4630"; c.fillRect(-(chef?48:36)*s,3*s,6*s,24*s); c.fillRect((chef?42:30)*s,3*s,6*s,24*s);
  for(const dx of chef?[-30,-6,18]:[-26,2]){ c.fillStyle="#1B1A17"; c.fillRect(dx*s,-30*s,22*s,16*s); c.fillStyle="#0E1A14"; c.fillRect((dx+2)*s,-28*s,18*s,12*s);
    c.strokeStyle=warn?"#F87171":(i+dx)%3?"#4ADE80":"#F87171"; c.lineWidth=1.2*s; c.beginPath();
    for(let k=0;k<=6;k++){ const yy=-22+Math.sin(t*(warn?5:1.5)+k+i*2+dx)*3.5; k?c.lineTo((dx+3+k*2.6)*s,yy*s):c.moveTo((dx+3)*s,yy*s); } c.stroke(); }
  const ring=!!a, wx=ring?Math.sin(t*40)*1.6:0; c.fillStyle=ring?K3P_SORTEN[a.typ].farbe:"#2F2B27";
  c.fillRect((30+wx)*s,-14*s,12*s,8*s); c.fillRect((29+wx)*s,-17*s,14*s,4*s);
  if(chef){ c.fillStyle="#E4572E"; c.beginPath(); c.arc(-40*s,-12*s,5*s,0,7); c.fill(); }
  if(T.broker&&T.lvl>0){ c.fillStyle="#F2B441"; c.beginPath(); c.arc(-34*s,-34*s,5*s,0,7); c.fill(); c.fillStyle="#1B1A17"; c.font=`800 ${7*s}px Archivo`; c.textAlign="center"; c.fillText("★",-34*s,-31.5*s); }
  c.restore();
  // Sprechblase: wie stark der Anruf den Kurs hebt, und wer da kauft
  if(a){ const rest=Math.max(0,1-(S.t-a.t0)/a.dauer), bx=p.x, by=p.y-78*s, bw=100*s, bh=34*s, F=K3P_SORTEN[a.typ];
    c.fillStyle=F.farbe; c.beginPath(); c.roundRect(bx-bw/2,by-bh/2,bw,bh,8*s); c.fill();
    c.beginPath(); c.moveTo(bx-6*s,by+bh/2); c.lineTo(bx,by+bh/2+8*s); c.lineTo(bx+6*s,by+bh/2); c.fill();
    c.fillStyle="rgba(255,255,255,.3)"; c.fillRect(bx-bw/2+4*s,by+bh/2-5*s,(bw-8*s)*rest,3*s);
    c.fillStyle="#fff"; c.textAlign="center"; c.font=`800 ${12.5*s}px Archivo, sans-serif`;
    c.fillText(a.typ==="tipp"?TX.k3_p_tipp:("▲ "+Math.round(k3PSprung(a)*100)+" %"+(a.typ==="rot"?" 🔥":"")),bx,by+1*s);
    const z2=a.typ==="tipp"?K3_RIVALEN[a.rival].n.split(" ").slice(-1)[0]:a.name; let fs=8.5*s; c.font=`600 ${fs}px Archivo, sans-serif`;
    while(fs>5.5*s&&c.measureText(z2).width>bw-10*s){ fs-=0.5*s; c.font=`600 ${fs}px Archivo, sans-serif`; }
    c.fillText(z2,bx,by+11*s); } }

// Die Kurstafel: ohne Aktie ein Laufband, mit Aktie Kurs und Hitze. Kurz vor dem Platzen wackelt sie.
function k3PTafel(c,t,P){ const A=P.akt, warn=k3PWarnung(A), wx=warn?Math.sin(t*35)*2.2:0, knall=P.knallT!==undefined&&animT-P.knallT<0.8;
  c.save(); c.translate(wx,0);
  c.fillStyle=knall?"#7C1D17":"#1B1A17"; c.fillRect(40,18,420,62); c.fillStyle="#26241F"; c.fillRect(46,24,408,50);
  c.save(); c.beginPath(); c.rect(46,24,408,50); c.clip();
  if(!A){ c.font="800 15px Archivo, sans-serif"; c.textAlign="left";
    const kurse=Object.keys(K3_RIVALEN).map(k=>({k,n:K3_RIVALEN[k].firma.toUpperCase(),p:k3Anteil(k)})).concat([{k:"du",n:TX.k3_du_firma.toUpperCase(),p:k3Anteil("du")}]);
    let x=46-((t*40)%900);
    for(let r=0;r<3;r++) for(const q of kurse){ const auf=Math.sin(t*0.4+q.n.length+r)>-0.2;
      c.fillStyle=q.k==="du"?"#F2B441":"#FBF8F2"; c.fillText(q.n,x,46); x+=c.measureText(q.n).width+8;
      c.fillStyle=auf?"#4ADE80":"#F87171"; const z=(auf?"▲ ":"▼ ")+(q.p*100).toFixed(1)+"%"; c.fillText(z,x,46); x+=c.measureText(z).width+26; }
    c.font="800 11px Archivo, sans-serif"; c.fillStyle=Math.sin(t*4)>0?"#F2B441":"#ABA394"; c.fillText(TX.k3_p_waehl_tafel,52,67); }
  else { k3BrIcon(c,A.br,62,40,10,"#FBF8F2"); c.textAlign="left"; c.fillStyle="#FBF8F2"; c.font="800 14px Archivo, sans-serif"; c.fillText(A.name.toUpperCase(),78,45);
    c.textAlign="right"; c.font="800 24px Archivo, sans-serif"; c.fillStyle=A.kurs>=1?"#4ADE80":"#F87171"; c.fillText("×"+k3Dez(A.kurs,2),448,47);
    // Hitze: Balken, bei Insidern mit der Linie, an der es knallt
    const x0=52, w=396, y=60; c.fillStyle="#3A3833"; c.fillRect(x0,y,w,8);
    const g=c.createLinearGradient(x0,0,x0+w,0); g.addColorStop(0,"#4ADE80"); g.addColorStop(0.6,"#F2B441"); g.addColorStop(1,"#F87171");
    c.fillStyle=g; c.fillRect(x0,y,w*Math.min(1,A.hitze),8);
    if(k3Insider(A.br)){ c.fillStyle="#fff"; c.fillRect(x0+w*A.grenze-1,y-3,2,14); }
    c.textAlign="left"; c.font="700 9px Archivo, sans-serif"; c.fillStyle="#ABA394"; c.fillText(k3Insider(A.br)?TX.k3_p_hitze_insider:TX.k3_p_hitze,52,57); }
  c.restore(); c.restore(); }

function drawParkett(dt){ if(!k3pctx||!S||!S.k3) return; const d=k3PGroesse(), c=k3pctx, t=animT, P=k3P();
  c.setTransform(K3PS*d,0,0,K3PS*d,0,0);
  // Wand, Fenster mit der Stadt, Kurstafel
  c.fillStyle="#E4DCCD"; c.fillRect(0,0,K3P_VW,K3P_VH);
  const [h0,h1]=k3Himmel(); const g=c.createLinearGradient(0,96,0,178); g.addColorStop(0,h0); g.addColorStop(1,h1);
  c.fillStyle=g; c.fillRect(20,96,460,82); c.fillStyle=k3Mix(h1,"#262B40",0.5);
  for(let k=0;k<26;k++){ const w=12+hsh(k,4,4)*16, x=20+k*18, hh=20+hsh(k,5,4)*52; c.fillRect(x,178-hh,w,hh); }
  if(k3Licht()>0){ c.fillStyle=`rgba(255,215,140,${0.6*k3Licht()})`; for(let k=0;k<60;k++) c.fillRect(24+hsh(k,6,4)*450,120+hsh(k,7,4)*55,2,2); }
  c.fillStyle="#CFC5B0"; for(let x=20;x<=480;x+=92) c.fillRect(x-3,96,6,82); c.fillRect(17,94,466,5); c.fillRect(17,176,466,5);
  k3PTafel(c,t,P);
  // Lampen, Boden
  c.fillStyle="#C9BEA8"; for(let x=60;x<K3P_VW;x+=95){ c.fillRect(x,0,2,8); c.beginPath(); c.arc(x+1,10,8,0,Math.PI); c.fill(); }
  c.fillStyle="#9A8468"; c.fillRect(0,196,K3P_VW,K3P_VH); c.fillStyle="rgba(0,0,0,.06)"; for(let y=200;y<K3P_VH;y+=22) c.fillRect(0,y,K3P_VW,1.5);
  c.fillStyle="#7C2E2A"; c.beginPath(); c.moveTo(150,K3P_VH); c.lineTo(205,200); c.lineTo(295,200); c.lineTo(350,K3P_VH); c.fill();
  // Tische, hinten zuerst
  for(const i of [5,6,7,8,1,3,4,2,0]) k3PTisch(c,i,t,P.anrufe.find(a=>a.platz===i));
  // Zahlen steigen auf
  k3PPops=k3PPops.filter(q=>animT-q.t0<1.6&&animT>=q.t0-0.1); c.textAlign="center"; c.font="800 17px Archivo, sans-serif"; c.lineJoin="round";
  for(const q of k3PPops){ const a=(animT-q.t0)/1.6; c.globalAlpha=Math.min(1,(1-a)*1.6); c.lineWidth=4; c.strokeStyle="rgba(20,18,14,.7)";
    c.strokeText(q.text,q.x,q.y-a*50); c.fillStyle=q.farbe; c.fillText(q.text,q.x,q.y-a*50); } c.globalAlpha=1; }

// ---------- Bedienung ----------
function k3PTreffer(x,y){ for(let i=0;i<K3P_PLAETZE.length;i++){ const p=K3P_PLAETZE[i], s=p.s;
  if(x>=p.x-56*s&&x<=p.x+56*s&&y>=p.y-100*s&&y<=p.y+30*s) return i; } return -1; }
function k3PTipp(cx,cy){ const r=k3pcv.getBoundingClientRect(), i=k3PTreffer((cx-r.left)/K3PS,(cy-r.top)/K3PS); if(i<0) return;
  const P=k3P(), a=P.anrufe.find(q=>q.platz===i); if(a){ k3PAnnehmen(a,false); return; } k3PTischSheet(i); }
function k3PTischSheet(i){ reopen=()=>k3PTischSheet(i); const P=k3P(), T=P.tische[i];
  let h;
  if(i===0) h=`<h3>${TX.k3_p_chef}</h3><p>${TX.k3_p_chef_d}</p>`;
  else if(!T.offen){ const c=k3PTischPreis(), ok=S.money>=c; h=`<h3>${TX.k3_p_tisch}</h3><p>${TX.k3_p_tisch_d}</p><div class="opt ${ok?"":"off"}" ${ok?`data-pt="1"`:""}><div><b>${TX.k3_p_tisch_kaufen}</b><span></span></div><em>${k3Fmt(c)}</em></div>`; }
  else if(!T.broker){ const c=k3PBrokerPreis(), ok=S.money>=c; h=`<h3>${TX.k3_p_leer}</h3><p>${TX.k3_p_broker_d}</p><div class="opt ${ok?"":"off"}" ${ok?`data-pb="1"`:""}><div><b>${TX.k3_p_broker_holen}</b><span>${TX.k3_p_broker_s}</span></div><em>${k3Fmt(c)}</em></div>`; }
  else if(T.lvl<1){ const c=k3PSchulungPreis(), ok=S.money>=c; h=`<h3>${TX.k3_p_broker}</h3><p>${TX.k3_p_broker_jetzt}</p><div class="opt ${ok?"":"off"}" ${ok?`data-ps="1"`:""}><div><b>${TX.k3_p_schulung}</b><span>${TX.k3_p_schulung_s}</span></div><em>${k3Fmt(c)}</em></div>`; }
  else h=`<h3>${TX.k3_p_broker}</h3><p>${TX.k3_p_broker_fertig}</p>`;
  openSheet(h,()=>{ const q=s=>document.querySelector(s);
    if(q("[data-pt]")) q("[data-pt]").onclick=()=>{ const c=k3PTischPreis(); if(S.money<c) return; S.money-=c; T.offen=true; $("sheet").innerHTML=""; reopen=null; };
    if(q("[data-pb]")) q("[data-pb]").onclick=()=>{ const c=k3PBrokerPreis(); if(S.money<c) return; S.money-=c; T.broker=true; $("sheet").innerHTML=""; reopen=null; k3Erklaer("k3broker",TX.k3_p_broker,TX.k3_p_broker_erkl); };
    if(q("[data-ps]")) q("[data-ps]").onclick=()=>{ const c=k3PSchulungPreis(); if(S.money<c) return; S.money-=c; T.lvl=1; $("sheet").innerHTML=""; reopen=null; }; }); }

// Zwischen Skyline und Parkett umschalten
function k3Ansicht(v){ S.k3.ansicht=v; $("k3sky").style.display=v==="par"?"none":""; $("k3par").style.display=v==="par"?"":"none";
  $("k3tSky").classList.toggle("on",v!=="par"); $("k3tPar").classList.toggle("on",v==="par");
  // Erklärung Nummer 3: die Fassung mit Pump and Dump, auch wer die alten schon kannte, sieht sie
  if(v==="par"){ k3PGroesse(); k3Erklaer("k3parkett3",TX.k3_p_titel,TX.k3_p_erkl); } else k3Groesse(); }
function k3PEingaben(){ if(!k3pcv) return; tippe(k3pcv,(cx,cy)=>{ if(S&&S.k3) k3PTipp(cx,cy); });
  $("k3tSky").onclick=()=>k3Ansicht("sky"); $("k3tPar").onclick=()=>k3Ansicht("par"); }
