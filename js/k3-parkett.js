// Kapitel 3: das Parkett. Der Handelssaal der Holding, hier klingeln ständig die Telefone.
// Es ist das, was in Kapitel 1 der Turm war: läuft immer, will immer etwas von dir.
// Wer nicht abhebt, schickt das Geschäft zu den Rivalen.
/* ================= Kapitel 3: Parkett ================= */
const K3P_VW=500, K3P_VH=430;
// Neun Plätze: 0 ist dein Chefschreibtisch vorn in der Mitte, dann vordere Reihe, dann hintere
const K3P_PLAETZE=[{x:250,y:372,s:1.18},{x:72,y:362,s:1},{x:428,y:362,s:1},{x:160,y:362,s:1},{x:340,y:362,s:1},
  {x:98,y:258,s:0.82},{x:202,y:258,s:0.82},{x:298,y:258,s:0.82},{x:402,y:258,s:0.82}];
// Sorten von Anrufen: Betrag als Vielfaches der Grundeinheit, wie lange es klingelt, Hype beim Abheben
const K3P_SORTEN={
 gruen:{farbe:"#1F9E6E", mal:1,   dauer:9, hype:0.4},
 gelb: {farbe:"#E0A21F", mal:2.6, dauer:8, hype:0.8},
 rot:  {farbe:"#D9372B", mal:6.5, dauer:7, hype:1.5},
 tipp: {farbe:"#7B5BC0", mal:0.8, dauer:8, hype:1}};
const K3P_START_TISCHE=3, K3P_BROKER_ANTEIL=0.7, K3P_BROKER_ZEIT=1.6;

function k3P(){ const K=S.k3; if(!K.p){ K.p={tische:K3P_PLAETZE.map((_,i)=>({offen:i<=K3P_START_TISCHE, broker:false, lvl:0})), anrufe:[], nextT:S.t+3, an:0, weg:0, nr:0}; } return K.p; }
// Grundeinheit eines Anrufs: wächst mit deiner Holding und mit dem Hype
const k3PEinheit=()=>S.k3.budget*0.015*(1+0.08*k3Meine().length)*k3HypeFaktor();
const k3PTischPreis=()=>{ const n=k3P().tische.filter(t=>t.offen).length-1-K3P_START_TISCHE; return Math.round(S.k3.budget*0.25*Math.pow(1.6,Math.max(0,n))/1000)*1000; };
const k3PBrokerPreis=()=>{ const n=k3P().tische.filter(t=>t.broker).length; return Math.round(S.k3.budget*0.15*Math.pow(1.5,n)/1000)*1000; };
const k3PSchulungPreis=()=>{ const n=k3P().tische.filter(t=>t.lvl>0).length; return Math.round(S.k3.budget*0.3*Math.pow(1.5,n)/1000)*1000; };
const k3PKlingelt=()=>(S.k3&&S.k3.p?S.k3.p.anrufe.length:0);
// Was ein Broker selbst annimmt
const k3PKannBroker=(t,a)=>t.broker&&(a.typ==="gruen"||(a.typ==="gelb"&&t.lvl>=1));
// Die Kriegskasse eines Rivalen: verpasste Anrufe landen dort. Sie macht ihn in Bieterkämpfen stärker.
const k3Kasse=k=>Math.min(0.4,((S.k3.r&&S.k3.r[k]&&S.k3.r[k].kk)||0)/S.k3.budget*0.15);

function k3PStep(){ const P=k3P();
  // Neuer Anruf an einem freien Tisch. Jede Werbeagentur lässt es öfter klingeln.
  if(S.t>=P.nextT){ P.nextT=S.t+2.8/(1+0.25*k3Anz("werbung"))*(0.75+Math.random()*0.5);
    const frei=P.tische.map((t,i)=>i).filter(i=>P.tische[i].offen&&!P.anrufe.some(a=>a.platz===i));
    if(frei.length){ const z=Math.random(), tipp=k3Anz("zeitung")>0;
      let typ=z<0.5?"gruen":z<0.82?"gelb":z<(tipp?0.94:1)?"rot":"tipp";
      let mal=K3P_SORTEN[typ].mal; const gross=typ==="gelb"&&k3Anz("bank")>0&&Math.random()<0.25; if(gross) mal*=2;
      const i=frei[Math.floor(Math.random()*frei.length)], namen=TX["k3_anrufer_"+typ];
      P.anrufe.push({id:++P.nr, platz:i, typ, gross, wert:Math.round(k3PEinheit()*mal*(0.8+Math.random()*0.4)/100)*100,
        t0:S.t, dauer:K3P_SORTEN[typ].dauer, name:namen[Math.floor(Math.random()*namen.length)],
        rival:typ==="tipp"?Object.keys(K3_RIVALEN)[Math.floor(Math.random()*4)]:null}); } }
  for(const a of P.anrufe.slice()){ const t=P.tische[a.platz];
    if(k3PKannBroker(t,a)&&S.t-a.t0>=K3P_BROKER_ZEIT){ k3PAnnehmen(a,true); continue; }
    if(S.t-a.t0>=a.dauer) k3PVerpasst(a); }
  // Kriegskassen der Rivalen schmelzen langsam
  for(const k in (S.k3.r||{})){ const R=S.k3.r[k]; if(R.kk) R.kk*=Math.pow(0.995,DT); } }

function k3PAnnehmen(a,broker){ const P=k3P(); if(!P.anrufe.includes(a)) return; P.anrufe=P.anrufe.filter(x=>x!==a);
  const n=Math.round(a.wert*(broker?K3P_BROKER_ANTEIL:1)); S.money+=n; S.earned+=n; stat('k3_ein',n); P.an++;
  k3Hoch(broker?0:K3P_SORTEN[a.typ].hype);   // Hype gibt es nur, wenn du selbst abhebst
  const p=K3P_PLAETZE[a.platz]; k3PPop(p.x,p.y-70*p.s,"+"+k3Fmt(n),broker?"#BFE9D2":"#7CE0A6");
  // Ein Insider-Tipp: der Rivale steht eine halbe Minute schlecht da, ohne die Zeitung zu verbrauchen
  if(a.typ==="tipp"&&a.rival){ S.k3.skandal=S.k3.skandal||{}; S.k3.skandal[a.rival]=Math.max(S.k3.skandal[a.rival]||0,S.t+30);
    k3PPop(p.x,p.y-100*p.s,TX.k3_p_tipp_pop(K3_RIVALEN[a.rival].n.split(" ").slice(-1)[0]),"#C9B3FF"); } }
function k3PVerpasst(a){ const P=k3P(); P.anrufe=P.anrufe.filter(x=>x!==a); P.weg++;
  const k=Object.keys(K3_RIVALEN)[Math.floor(Math.random()*4)], R=k3Rv(k); R.kk=(R.kk||0)+a.wert;
  const p=K3P_PLAETZE[a.platz]; k3PPop(p.x,p.y-70*p.s,TX.k3_p_an_rivale(K3_RIVALEN[k].n.split(" ").slice(-1)[0]),k3Farbe(k)); }

// ---------- Zeichnen ----------
const k3pcv=$("k3pc"), k3pctx=k3pcv&&k3pcv.getContext?k3pcv.getContext("2d"):null; let K3PS=1, k3PPops=[];
function k3PPop(x,y,text,farbe){ k3PPops.push({x,y,text,farbe,t0:animT}); if(k3PPops.length>30) k3PPops.shift(); }
function k3PGroesse(){ const w=k3pcv.clientWidth||360, d=Math.min(2,window.devicePixelRatio||1); K3PS=w/K3P_VW; const h=K3P_VH*K3PS;
  if(k3pcv.width!==Math.round(w*d)||k3pcv.height!==Math.round(h*d)){ k3pcv.style.height=h+"px"; k3pcv.width=Math.round(w*d); k3pcv.height=Math.round(h*d); } return d; }
function k3PFigur(c,x,y,s,chef,t,telefon){ c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle=chef?"#1B1A17":"#3A4452"; c.beginPath(); c.roundRect(-12,-34,24,28,6); c.fill();   // Anzug
  c.fillStyle="#FBF8F2"; c.beginPath(); c.moveTo(-4,-34); c.lineTo(0,-24); c.lineTo(4,-34); c.fill(); c.fillStyle=chef?"#E4572E":"#B8432F"; c.fillRect(-1.5,-31,3,9);
  c.fillStyle="#E8C4A0"; c.beginPath(); c.arc(0,-44,9,0,7); c.fill();
  c.fillStyle=chef?"#3A2A1E":"#2B2622"; c.beginPath(); c.arc(0,-47,9,Math.PI,0); c.fill();
  if(telefon){ c.strokeStyle="#1B1A17"; c.lineWidth=2; c.beginPath(); c.arc(0,-44,11,Math.PI*1.1,Math.PI*1.9); c.stroke(); c.fillStyle="#1B1A17"; c.fillRect(8,-44,4,6); }
  c.restore(); }
function k3PTisch(c,i,t,a){ const p=K3P_PLAETZE[i], P=k3P(), T=P.tische[i], s=p.s, chef=i===0;
  c.save(); c.translate(p.x,p.y);
  if(!T.offen){ c.strokeStyle="rgba(27,26,23,.25)"; c.setLineDash([6,6]); c.lineWidth=2; c.strokeRect(-40*s,-34*s,80*s,40*s); c.setLineDash([]);
    c.fillStyle="rgba(27,26,23,.35)"; c.font=`800 ${26*s}px Archivo, sans-serif`; c.textAlign="center"; c.fillText("+",0,-6*s); c.restore(); return; }
  // Stuhl und Figur hinter dem Tisch
  c.fillStyle="#2B2925"; c.fillRect(-12*s,-30*s,24*s,30*s);
  if(chef||T.broker) k3PFigur(c,0,-4*s,s,chef,t,!!a&&(chef||k3PKannBroker(T,a)));
  // Tisch
  c.fillStyle=chef?"#5A3A25":"#7A5A3E"; c.fillRect(-(chef?52:40)*s,-6*s,(chef?104:80)*s,9*s);
  c.fillStyle=chef?"#46301F":"#5F4630"; c.fillRect(-(chef?48:36)*s,3*s,6*s,24*s); c.fillRect((chef?42:30)*s,3*s,6*s,24*s);
  // Bildschirme mit Kurven
  for(const dx of chef?[-30,-6,18]:[-26,2]){ c.fillStyle="#1B1A17"; c.fillRect(dx*s,-30*s,22*s,16*s); c.fillStyle="#0E1A14"; c.fillRect((dx+2)*s,-28*s,18*s,12*s);
    c.strokeStyle=(i+dx)%3?"#4ADE80":"#F87171"; c.lineWidth=1.2*s; c.beginPath();
    for(let k=0;k<=6;k++){ const yy=-22+Math.sin(t*1.5+k+i*2+dx)*3.5; k?c.lineTo((dx+3+k*2.6)*s,yy*s):c.moveTo((dx+3)*s,yy*s); } c.stroke(); }
  // Telefon: wackelt, wenn es klingelt
  const ring=!!a, wx=ring?Math.sin(t*40)*1.6:0; c.fillStyle=ring?K3P_SORTEN[a.typ].farbe:"#2F2B27";
  c.fillRect((30+wx)*s,-14*s,12*s,8*s); c.fillRect((29+wx)*s,-17*s,14*s,4*s);
  if(chef){ c.fillStyle="#E4572E"; c.beginPath(); c.arc(-40*s,-12*s,5*s,0,7); c.fill(); }
  if(T.broker&&T.lvl>0){ c.fillStyle="#F2B441"; c.beginPath(); c.arc(-34*s,-34*s,5*s,0,7); c.fill(); c.fillStyle="#1B1A17"; c.font=`800 ${7*s}px Archivo`; c.textAlign="center"; c.fillText("★",-34*s,-31.5*s); }
  c.restore();
  // Sprechblase mit Betrag und Uhr
  if(a){ const rest=Math.max(0,1-(S.t-a.t0)/a.dauer), bx=p.x, by=p.y-78*s, bw=96*s, bh=34*s, F=K3P_SORTEN[a.typ];
    c.fillStyle=F.farbe; c.beginPath(); c.roundRect(bx-bw/2,by-bh/2,bw,bh,8*s); c.fill();
    c.beginPath(); c.moveTo(bx-6*s,by+bh/2); c.lineTo(bx,by+bh/2+8*s); c.lineTo(bx+6*s,by+bh/2); c.fill();
    c.fillStyle="rgba(255,255,255,.3)"; c.fillRect(bx-bw/2+4*s,by+bh/2-5*s,(bw-8*s)*rest,3*s);
    c.fillStyle="#fff"; c.textAlign="center"; c.font=`800 ${12.5*s}px Archivo, sans-serif`;
    c.fillText(a.typ==="tipp"?TX.k3_p_tipp:("+"+k3Fmt(a.wert)),bx,by+1*s); c.font=`600 ${8.5*s}px Archivo, sans-serif`;
    c.fillText(a.typ==="tipp"?K3_RIVALEN[a.rival].n.split(" ").slice(-1)[0]:(a.gross?TX.k3_p_grosskunde:a.name),bx,by+11*s); } }

function drawParkett(dt){ if(!k3pctx||!S||!S.k3) return; const d=k3PGroesse(), c=k3pctx, t=animT, P=k3P();
  c.setTransform(K3PS*d,0,0,K3PS*d,0,0);
  // Wand, Fenster mit der Stadt, Kurstafel
  c.fillStyle="#E4DCCD"; c.fillRect(0,0,K3P_VW,K3P_VH);
  const [h0,h1]=k3Himmel(); const g=c.createLinearGradient(0,96,0,178); g.addColorStop(0,h0); g.addColorStop(1,h1);
  c.fillStyle=g; c.fillRect(20,96,460,82); c.fillStyle=k3Mix(h1,"#262B40",0.5);
  for(let k=0;k<26;k++){ const w=12+hsh(k,4,4)*16, x=20+k*18, hh=20+hsh(k,5,4)*52; c.fillRect(x,178-hh,w,hh); }
  if(k3Licht()>0){ c.fillStyle=`rgba(255,215,140,${0.6*k3Licht()})`; for(let k=0;k<60;k++) c.fillRect(24+hsh(k,6,4)*450,120+hsh(k,7,4)*55,2,2); }
  c.fillStyle="#CFC5B0"; for(let x=20;x<=480;x+=92) c.fillRect(x-3,96,6,82); c.fillRect(17,94,466,5); c.fillRect(17,176,466,5);
  c.fillStyle="#1B1A17"; c.fillRect(40,18,420,62); c.fillStyle="#26241F"; c.fillRect(46,24,408,50);
  c.save(); c.beginPath(); c.rect(46,24,408,50); c.clip(); c.font="800 15px Archivo, sans-serif"; c.textAlign="left";
  const kurse=Object.keys(K3_RIVALEN).map(k=>({k,n:K3_RIVALEN[k].firma.toUpperCase(),p:k3Anteil(k)})).concat([{k:"du",n:TX.k3_du_firma.toUpperCase(),p:k3Anteil("du")}]);
  let x=46-((t*40)%900);
  for(let r=0;r<3;r++) for(const q of kurse){ const auf=Math.sin(t*0.4+q.n.length+r)>-0.2||q.k==="du"&&k3Hype()>50;
    c.fillStyle=q.k==="du"?"#F2B441":"#FBF8F2"; c.fillText(q.n,x,46); x+=c.measureText(q.n).width+8;
    c.fillStyle=auf?"#4ADE80":"#F87171"; const z=(auf?"▲ ":"▼ ")+(q.p*100).toFixed(1)+"%"; c.fillText(z,x,46); x+=c.measureText(z).width+26; }
  c.font="700 10px Archivo, sans-serif"; c.fillStyle="#ABA394"; c.fillText(TX.k3_p_tafel(P.an,P.weg),52,66); c.restore();
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
  if(v==="par"){ k3PGroesse(); k3Erklaer("k3parkett",TX.k3_p_titel,TX.k3_p_erkl); } else k3Groesse(); }
function k3PEingaben(){ if(!k3pcv) return; tippe(k3pcv,(cx,cy)=>{ if(S&&S.k3) k3PTipp(cx,cy); });
  $("k3tSky").onclick=()=>k3Ansicht("sky"); $("k3tPar").onclick=()=>k3Ansicht("par"); }
