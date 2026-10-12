// Stadt zeichnen (Canvas)
/* ================= Zeichnen: Stadt ================= */
const W=9, H=14;
// Oben drei Reihen als Schaufenster, nach dem Exit vier Reihen Spielfläche.
// Vier statt sechs, damit die Stadt auf dem Handy fast ganz auf einen Blick passt.
const TOPR=()=>S&&S.exited?4:3; const cv=$("c"), ctx=cv&&cv.getContext?cv.getContext("2d"):null; let T=40, DPR=1;
function size(){ const w=cv.clientWidth||360; DPR=Math.min(2,window.devicePixelRatio||1); T=w/W; cv.style.height=(T*(H+TOPR()))+"px"; cv.width=w*DPR; cv.height=T*(H+TOPR())*DPR; }

/* Feste Zufallszahl pro Feld, damit die Stadt nicht flackert */
const hsh=(x,y,k)=>{ let h=(x*374761393+y*668265263+(k||0)*2246822519)|0; h=(h^(h>>>13))*1274126177; return ((h^(h>>>16))>>>0)/4294967296; };
const ROADS_X=[0.5,4.5,8.5], ROADS_Y=[2.6,5.3,7.9,10.2,12.5];
// Fahrzeuge fahren auf ihrem Weg zwischen zwei Rechenschritten weiter, statt zehnmal pro
// Sekunde ein Stück zu springen. Die Strecke ist bekannt, also lässt sie sich vorrechnen.
function weiter(weg,d,tempo){ if(!weg) return {x:0,y:0};
  const L2=pathLen(weg), dd=Math.max(0,Math.min(L2,d+tempo*Math.max(0,animT-S.t)));
  return pointAt(weg,dd); }
// Wer frei läuft (Diebe, Wachleute), wird weich nachgezogen
function weich(o){ if(o.rx===undefined||Math.hypot(o.rx-o.x,o.ry-o.y)>1.5){ o.rx=o.x; o.ry=o.y; }
  const k=Math.min(1,(animT-(o.rt||animT))*12); o.rt=animT;
  o.rx+=(o.x-o.rx)*k; o.ry+=(o.y-o.ry)*k; return {x:o.rx,y:o.ry}; }
function drawCity(){
  if(!ctx) return; const c=ctx, X=v=>v*T, F=`Archivo, system-ui, sans-serif`, t=animT; c.setTransform(DPR,0,0,DPR,0,0);
  drawZone(c,F,t);
  c.translate(0,TOPR()*T);
  // Unbewegliches (Blöcke, Parks, Straßen) einmal vorzeichnen und nur noch hinlegen
  const bgKey=T+"|"+DPR;
  if(!window._cityBg||window._cityBgKey!==bgKey){ const oc=document.createElement("canvas"); oc.width=Math.round(W*T*DPR); oc.height=Math.round(H*T*DPR);
    const c0=c; { const c=oc.getContext("2d"); c.setTransform(DPR,0,0,DPR,0,0);
  // Boden
  c.fillStyle="#CFC6B4"; c.fillRect(0,0,W*T,H*T);
  // Wasser am Hafen
  c.fillStyle="#9DB7C4"; c.fillRect(X(7.9),0,X(1.1),X(3.4));
  // Häuserblöcke mit Dächern und Schatten
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const cx=x+0.5, cy=y+0.5;
    if(ROADS_X.some(r=>Math.abs(cx-r)<0.55) || ROADS_Y.some(r=>Math.abs(cy-r)<0.5)) continue;
    if(x>=8&&y<=2) continue;
    const r=hsh(x,y), park=r<0.12;
    if(park){ c.fillStyle="#B9C79B"; c.fillRect(X(x)+2,X(y)+2,T-4,T-4); c.fillStyle="#8FA66C";
      for(let q=0;q<3;q++){ c.beginPath(); c.arc(X(x)+T*(0.25+hsh(x,y,q)*0.5),X(y)+T*(0.25+hsh(y,x,q)*0.5),T*0.14,0,7); c.fill(); } continue; }
    const inset=T*(0.10+hsh(x,y,3)*0.08), roof=["#E9E1D2","#DDD3C1","#E3D8C4","#D6CCB9"][Math.floor(hsh(x,y,5)*4)];
    c.fillStyle="rgba(60,50,35,.18)"; c.fillRect(X(x)+inset+3,X(y)+inset+4,T-inset*2,T-inset*2);
    c.fillStyle=roof; c.fillRect(X(x)+inset,X(y)+inset,T-inset*2,T-inset*2);
    c.fillStyle="rgba(0,0,0,.06)"; c.fillRect(X(x)+inset,X(y)+inset+T*0.35,T-inset*2,2);
  }
  // Straßen
  c.fillStyle="#8E877A";
  ROADS_X.forEach(r=>c.fillRect(X(r)-T*0.34,0,T*0.68,H*T)); ROADS_Y.forEach(r=>c.fillRect(0,X(r)-T*0.3,W*T,T*0.6));
  c.strokeStyle="rgba(255,255,255,.5)"; c.lineWidth=1.3; c.setLineDash([7,8]);
  ROADS_X.forEach(r=>{ c.beginPath(); c.moveTo(X(r),0); c.lineTo(X(r),H*T); c.stroke(); });
  ROADS_Y.forEach(r=>{ c.beginPath(); c.moveTo(0,X(r)); c.lineTo(W*T,X(r)); c.stroke(); }); c.setLineDash([]);
    } window._cityBg=oc; window._cityBgKey=bgKey; }
  c.drawImage(window._cityBg,0,0,W*T,H*T);
  c.strokeStyle="rgba(255,255,255,.35)"; c.lineWidth=1; for(let k=0;k<5;k++){ const yy=X(0.4+k*0.6)+Math.sin(t*1.5+k)*2; c.beginPath(); c.moveTo(X(8.05),yy); c.lineTo(X(8.9),yy); c.stroke(); }
  // Aktive Routen: bewegter Lieferfluss
  S.sources.forEach(s=>{ if(!s.trucks) return; const p=pathOf(s);
    c.strokeStyle="rgba(31,122,85,.55)"; c.lineWidth=3; c.setLineDash([4,10]); c.lineDashOffset=-t*30;
    c.beginPath(); c.moveTo(X(p[0].x),X(p[0].y)); for(let i=1;i<p.length;i++) c.lineTo(X(p[i].x),X(p[i].y)); c.stroke(); c.setLineDash([]); c.lineDashOffset=0; });
  // Viertel und Läden. Jedes Viertel hat zwei feste Bauplätze: links Sneaker, rechts Uhren.
  const bauplatz=(x,y,txt)=>{ c.setLineDash([4,4]); c.strokeStyle="rgba(43,42,38,.35)"; c.lineWidth=1.4;
    c.strokeRect(x-T*0.3,y-T*0.26,T*0.6,T*0.46); c.setLineDash([]);
    c.fillStyle="rgba(43,42,38,.45)"; c.font=`800 ${T*0.13}px ${F}`; c.textAlign="center"; c.fillText(txt,x,y+T*0.02); };
  S.districts.forEach(d=>{ const x=X(d.x), y=X(d.y), lx=X(ladenOrt(d).x), bx=X(boutiqueOrt(d).x);
    // Das Flagship steht auf dem Platz seiner Ware: Sneaker links, Uhren rechts
    const fx2=d.flagship==="uhren"?bx:lx;
    if(d.flagship){ c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(fx2-T*0.44+4,y-T*0.52+5,T*0.88,T*0.7);
      c.fillStyle="#2B2A26"; c.fillRect(fx2-T*0.44,y-T*0.52,T*0.88,T*0.7);
      for(let k=0;k<6;k++){ c.fillStyle=k%2?"#F2D38A":"#C98A1B"; c.fillRect(fx2-T*0.44+k*T*0.147,y-T*0.52,T*0.147,T*0.12); }
      c.fillStyle="#F2D38A"; c.font=`800 ${T*0.15}px ${F}`; c.textAlign="center"; c.fillText("FLAGSHIP",fx2,y-T*0.2); }
    if(d.shop&&d.flagship!=="sohle"){ c.fillStyle="rgba(0,0,0,.18)"; c.fillRect(lx-T*0.34+3,y-T*0.3+4,T*0.68,T*0.52);
      c.fillStyle="#FBF8F2"; c.fillRect(lx-T*0.34,y-T*0.3,T*0.68,T*0.52);
      for(let k=0;k<5;k++){ c.fillStyle=k%2?"#FBF8F2":"#1F7A55"; c.fillRect(lx-T*0.34+k*T*0.136,y-T*0.3,T*0.136,T*0.14); }
      c.fillStyle="#2B2A26"; c.fillRect(lx-T*0.1,y-T*0.02,T*0.2,T*0.24); }
    else if(!d.shop&&!d.flagship&&d.nest===undefined) bauplatz(lx,y,"LADEN");
    if(S.uhr&&!d.boutique&&d.nest===undefined&&d.flagship!=="uhren") bauplatz(bx,y,"UHREN");
    c.fillStyle=d.shop?"#1F7A55":"#6E685D"; c.font=`800 ${T*0.18}px ${F}`; c.textAlign="center";
    c.fillText(d.n.toUpperCase(),x,y+T*0.46); });
  // Solange Wachleute auf Razzia sind, steht die Stadt offen. Das zeigt der Kreis.
  const leer=S.posts.some(p=>p.away);
  c.strokeStyle=leer?"rgba(184,67,47,.75)":"rgba(31,122,85,.6)"; c.fillStyle=leer?"rgba(184,67,47,.07)":"rgba(31,122,85,.06)"; c.lineWidth=leer?3:2; c.setLineDash([8,6]); c.lineDashOffset=-t*6;
  c.beginPath(); c.arc(X(HQ.x),X(HQ.y),X(SUPPLY_R),0,7); c.fill(); c.stroke();
  if(S.uhr&&S.uhr.ort){ c.beginPath(); c.arc(X(S.uhr.ort.x),X(S.uhr.ort.y),X(SUPPLY_R),0,7); c.fill(); c.stroke();
    if(RES2().werfer){ c.strokeStyle="rgba(123,91,192,.55)"; c.fillStyle="rgba(123,91,192,.05)"; c.lineWidth=2;
      c.beginPath(); c.arc(X(S.uhr.ort.x),X(S.uhr.ort.y),X(werferWeite()),0,7); c.fill(); c.stroke();
      // Nachladebalken am Dach: man sieht, wann der nächste Wurf geht
      const ox=X(S.uhr.ort.x), oy=X(S.uhr.ort.y), laedt=Math.max(0,(S.werferCd||0)-S.t);
      c.setLineDash([]); c.fillStyle="rgba(0,0,0,.35)"; c.fillRect(ox-T*0.3,oy-T*0.62,T*0.6,4);
      c.fillStyle=laedt?"#7B5BC0":"#1F7A55"; c.fillRect(ox-T*0.3,oy-T*0.62,T*0.6*(laedt?1-laedt/WERFER_LADEN:1),4);
      c.setLineDash([8,6]); } }
  c.setLineDash([]); c.lineDashOffset=0;
  // Boutiquen für Uhren und ihre Replikas
  // Boutiquen stehen auf dem Uhrenplatz rechts. Beim Flagship für Uhren ist das Flagship die Boutique.
  if(S.uhr) (S.uhr.boutiquen||[]).forEach(B=>{ const d=S.districts[B.d]; if(!d||d.flagship==="uhren") return;
    const x=X(boutiqueOrt(d).x), y=X(d.y);
    c.fillStyle="rgba(0,0,0,.2)"; c.fillRect(x-T*0.3+3,y-T*0.3+4,T*0.6,T*0.4);
    c.fillStyle="#2B2A26"; c.fillRect(x-T*0.3,y-T*0.3,T*0.6,T*0.4);
    c.fillStyle="#C98A1B"; c.fillRect(x-T*0.3,y-T*0.3,T*0.6,T*0.08);
    c.fillStyle="#F2D38A"; c.beginPath(); c.arc(x,y-T*0.08,T*0.08,0,7); c.fill(); });
  if(S.uhr) (S.uhr.repliken||[]).forEach(r=>{ const x=X(r.x), y=X(r.y), w=T*0.34;
    c.fillStyle="#E7DDCC"; c.fillRect(x-w/2,y-w/2,w,w*0.7);
    c.fillStyle="#B8432F"; c.font=`800 ${T*0.12}px ${F}`; c.textAlign="center"; c.fillText("KOPIE",x,y-w/2-2); });
  // Reichweite der Wachen
  S.posts.forEach(po=>{ if(po.away) return; c.strokeStyle="rgba(31,122,85,.28)"; c.fillStyle="rgba(31,122,85,.05)"; c.lineWidth=1.2; c.setLineDash([3,5]);
    c.beginPath(); c.arc(X(po.x),X(po.y),X(RES().fern?3.4:2.6),0,7); c.fill(); c.stroke(); c.setLineDash([]); });
  // Rohstoffquellen als Gebäude
  S.sources.forEach(s=>{
    const x=X(s.x), y=X(s.y), f=1, col=RAW[s.k].col, w=T*0.86, h=T*0.62;
    c.fillStyle="rgba(0,0,0,.22)"; c.fillRect(x-w/2+4,y-h/2+5,w,h);
    c.fillStyle=col; c.fillRect(x-w/2,y-h/2,w,h);
    c.fillStyle="rgba(255,255,255,.18)"; for(let k=0;k<3;k++){ c.beginPath(); c.moveTo(x-w/2+k*w/3,y-h/2); c.lineTo(x-w/2+(k+1)*w/3,y-h/2-T*0.12); c.lineTo(x-w/2+(k+1)*w/3,y-h/2); c.fill(); }
    c.fillStyle=col; c.fillRect(x+w*0.28,y-h/2-T*0.32,T*0.1,T*0.34);
    if(f>0&&s.trucks){ c.fillStyle="rgba(200,195,185,.55)"; for(let k=0;k<3;k++){ const ph=(t*0.6+k*0.33)%1; c.beginPath(); c.arc(x+w*0.33+ph*T*0.25,y-h/2-T*0.36-ph*T*0.4,T*(0.06+ph*0.08),0,7); c.fill(); } }
    c.fillStyle="#fff"; c.font=`800 ${T*0.17}px ${F}`; c.textAlign="center"; c.fillText({leder:"LEDER",gummi:"GUMMI",metall:"METALL",sand:"SAND"}[s.k]||s.k.toUpperCase(),x,y+T*0.07);
    c.fillStyle="#1F7A55"; c.fillRect(x-w/2,y+h/2+4,w,4); });
  // Verstecke: Hütte mit Wellblech, Glut und Rauch
  S.nests.forEach(n=>{ if(!n.alive) return; const pl=1+Math.sin(t*3)*0.05;
    // Nach einem Volltreffer wackelt die Hütte
    const beben=n.wucht&&S.t-n.wucht<0.6?Math.sin((S.t-n.wucht)*50)*(1-(S.t-n.wucht)/0.6)*5:0;
    const x=X(n.x)+beben, y=X(n.y);
    if(S.awake){ const g=c.createRadialGradient(x,y,2,x,y,T*0.95*pl); g.addColorStop(0,"rgba(184,67,47,.35)"); g.addColorStop(1,"rgba(184,67,47,0)"); c.fillStyle=g; c.beginPath(); c.arc(x,y,T*0.95*pl,0,7); c.fill(); }
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x-T*0.36+4,y-T*0.18+5,T*0.72,T*0.46);
    c.fillStyle="#5B4636"; c.fillRect(x-T*0.36,y-T*0.18,T*0.72,T*0.46);
    c.fillStyle="#7A2A1E"; c.beginPath(); c.moveTo(x-T*0.44,y-T*0.16); c.lineTo(x,y-T*0.44); c.lineTo(x+T*0.44,y-T*0.16); c.closePath(); c.fill();
    c.strokeStyle="rgba(0,0,0,.25)"; c.lineWidth=1; for(let k=-2;k<=2;k++){ c.beginPath(); c.moveTo(x+k*T*0.08,y-T*0.38+Math.abs(k)*T*0.05); c.lineTo(x+k*T*0.16,y-T*0.17); c.stroke(); }
    c.fillStyle="#F2B441"; c.fillRect(x-T*0.08,y+T*0.02,T*0.16,T*0.18);
    if(S.awake){ c.fillStyle="rgba(90,80,70,.4)"; for(let k=0;k<3;k++){ const ph=(t*0.5+k*0.33)%1; c.beginPath(); c.arc(x+T*0.2+ph*T*0.2,y-T*0.5-ph*T*0.5,T*(0.05+ph*0.09),0,7); c.fill(); } }
    c.fillStyle="rgba(0,0,0,.3)"; c.fillRect(x-T*0.4,y+T*0.36,T*0.8,5); c.fillStyle="#B8432F"; c.fillRect(x-T*0.4,y+T*0.36,T*0.8*n.hp/n.max,5);
    if(S.posts.some(p=>!p.away&&p.hp>0)&&!S.squads.length){ const rr=T*(0.62+Math.sin(t*4)*0.06); c.strokeStyle="rgba(31,122,85,.8)"; c.lineWidth=2;
      c.beginPath(); c.arc(x,y,rr,0,7); c.stroke(); c.beginPath(); c.moveTo(x-rr-5,y); c.lineTo(x-rr+5,y); c.moveTo(x+rr-5,y); c.lineTo(x+rr+5,y); c.moveTo(x,y-rr-5); c.lineTo(x,y-rr+5); c.moveTo(x,y+rr-5); c.lineTo(x,y+rr+5); c.stroke(); } });
  // Fälscherbuden
  // Bauzaun, wo gerade ein Versteck entsteht
  if(S.pend){ const d=S.districts[S.pend.di], x=X(d.x), y=X(d.y-0.6), left=Math.max(0,60-(S.t-S.pend.t0));
    c.strokeStyle="#E4572E"; c.lineWidth=2; c.setLineDash([5,4]); c.strokeRect(x-T*0.42,y-T*0.3,T*0.84,T*0.6); c.setLineDash([]);
    for(let k=0;k<4;k++){ c.fillStyle=k%2?"#FBF8F2":"#E4572E"; c.fillRect(x-T*0.42+k*T*0.21,y+T*0.22,T*0.21,T*0.08); }
    c.fillStyle="#B8432F"; c.font=`800 ${T*0.2}px ${F}`; c.textAlign="center"; c.fillText(Math.ceil(left)+"s",x,y+T*0.05); }
  S.fakes.forEach(f=>{ const x=X(f.x), y=X(f.y), sc=0.6+f.str*0.14, w=T*0.46*sc, h=T*0.34*sc, hit=t-f.hit<0.4;
    c.fillStyle="rgba(0,0,0,.2)"; c.fillRect(x-w/2+3,y-h/2+4,w,h);
    c.fillStyle="#E7DDCC"; c.fillRect(x-w/2,y-h/2,w,h);
    for(let k=0;k<4;k++){ c.fillStyle=k%2?"#E7DDCC":"#B8432F"; c.fillRect(x-w/2+k*w/4,y-h/2,w/4,h*0.3); }
    c.fillStyle=MODELS[f.m].c2; c.beginPath(); c.ellipse(x,y+h*0.12,w*0.26,h*0.16,0,0,7); c.fill();
    c.fillStyle="#B8432F"; c.font=`800 ${T*0.13}px ${F}`; c.textAlign="center"; c.fillText("FAKE",x,y-h/2-3);
    for(let q=0;q<Math.round(f.str);q++){ c.fillStyle="#4E4A42"; c.beginPath(); c.arc(x-w/2+q*T*0.1,y+h/2+T*0.08+Math.sin(t*4+q)*1,T*0.045,0,7); c.fill(); }
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x-w/2,y+h/2+T*0.16,w,3); c.fillStyle="#B8432F"; c.fillRect(x-w/2,y+h/2+T*0.16,w*Math.min(1,f.str/4),3);
    if(hit){ c.strokeStyle="#E8B429"; c.lineWidth=3; c.beginPath(); c.arc(x,y,T*0.35*(1+(t-f.hit)*2),0,7); c.stroke(); } });
  // Dein Turm
  { const x=X(HQ.x), y=X(HQ.y), w=T*0.9, h=T*1.15;
    c.fillStyle="rgba(0,0,0,.28)"; c.fillRect(x-w/2+6,y-h*0.62+8,w,h);
    c.fillStyle="#24231F"; c.fillRect(x-w/2,y-h*0.62,w,h);
    for(let r=0;r<4;r++) for(let q=0;q<3;q++){ const lit=hsh(r,q,Math.floor(t*0.5))>0.25; c.fillStyle=lit?"#F2D38A":"#4A4843"; c.fillRect(x-w*0.36+q*w*0.27,y-h*0.54+r*h*0.2,w*0.16,h*0.11); }
    c.fillStyle="#E4572E"; c.fillRect(x-w/2,y-h*0.62,w,T*0.08);
    if(S.awake){ const k=Math.min(1,Math.max(0,1-((S.handCd||0)-S.t)/0.6)); c.strokeStyle=k>=1?"#C98A1B":"rgba(201,138,27,.4)"; c.lineWidth=3;
      c.beginPath(); c.arc(x+w*0.62,y-h*0.55,T*0.13,-Math.PI/2,-Math.PI/2+Math.PI*2*k); c.stroke();
      if(k>=1){ c.fillStyle="#C98A1B"; c.beginPath(); c.arc(x+w*0.62,y-h*0.55,T*0.06,0,7); c.fill(); } } }
  if(leer){ const n=S.posts.filter(p=>p.away).length, seit=Math.round(S.t-(S.razziaT||S.t));
    const txt=n+TX.posts_standing_empty+(seit>3?", seit "+seit+" s":""), yy=X(HQ.y)-X(SUPPLY_R)-T*0.16;
    c.font=`800 ${T*0.2}px ${F}`; c.textAlign="center"; const w=c.measureText(txt).width+T*0.3;
    c.fillStyle="rgba(251,248,242,.94)"; c.beginPath(); c.roundRect(X(HQ.x)-w/2,yy-T*0.2,w,T*0.3,6); c.fill();
    c.strokeStyle="#B8432F"; c.lineWidth=1.5; c.stroke();
    c.fillStyle="#B8432F"; c.fillText(txt,X(HQ.x),yy+T*0.03); }
  // Wachposten: Häuschen mit Wachmann
  S.posts.forEach(po=>{ const x=X(po.x), y=X(po.y);
    c.fillStyle="rgba(0,0,0,.22)"; c.fillRect(x-T*0.24+3,y-T*0.2+4,T*0.48,T*0.42);
    c.fillStyle=po.away?"#B9B0A0":"#FBF8F2"; c.fillRect(x-T*0.24,y-T*0.2,T*0.48,T*0.42);
    c.fillStyle=po.away?"#8E877A":"#1F7A55"; c.fillRect(x-T*0.28,y-T*0.26,T*0.56,T*0.1);
    if(!po.away){ c.fillStyle="#1F7A55"; c.beginPath(); c.arc(x,y-T*0.02,T*0.07,0,7); c.fill(); c.fillRect(x-T*0.08,y+T*0.05,T*0.16,T*0.12); }
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x+T*0.3,y-T*0.2,4,T*0.42); c.fillStyle=po.stock>5?"#C98A1B":"#B8432F"; const sh=T*0.42*po.stock/postMax(); c.fillRect(x+T*0.3,y-T*0.2+T*0.42-sh,4,sh);
    if(po.stock<=0){ c.fillStyle="#B8432F"; c.font=`800 ${T*0.16}px ${F}`; c.textAlign="center"; c.fillText("LEER",x,y-T*0.34); }
    if(po.hp<po.max){ c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x-T*0.28,y+T*0.28,T*0.56,4); c.fillStyle="#B8432F"; c.fillRect(x-T*0.28,y+T*0.28,T*0.56*po.hp/po.max,4); } });
  // Transporter, in Fahrtrichtung gedreht
  S.trucks.forEach(tr=>{ if(!tr.pos) return; const p=tr.path, a=pointAt(p,Math.max(0,tr.d-0.05)), b=pointAt(p,tr.d+0.05);
    let ang=Math.atan2(b.y-a.y,b.x-a.x); if(tr.dir===-1) ang+=Math.PI;
    const tp=weiter(p,tr.d,tr.wait?0:tr.dir*1.3);
    c.save(); c.translate(X(tp.x),X(tp.y)); c.rotate(ang);
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(-T*0.24+2,-T*0.13+3,T*0.48,T*0.26);
    c.fillStyle="#FBF8F2"; c.fillRect(-T*0.24,-T*0.13,T*0.34,T*0.26);
    c.fillStyle="#1F7A55"; c.fillRect(T*0.1,-T*0.12,T*0.14,T*0.24);
    c.fillStyle="#9DB7C4"; c.fillRect(T*0.18,-T*0.09,T*0.05,T*0.18);
    if(tr.cargo){ c.fillStyle=RAW[S.sources[tr.src].k].col; c.fillRect(-T*0.2,-T*0.09,T*0.26,T*0.18); }
    c.restore();
    if(tr.wait){ c.font=`800 ${T*0.15}px ${F}`; const txt=TX.storage_full, w=c.measureText(txt).width+8;
      c.fillStyle="#B8432F"; c.beginPath(); c.roundRect(X(tr.pos.x)-w/2,X(tr.pos.y)-T*0.42,w,T*0.2,4); c.fill(); c.fillStyle="#fff"; c.textAlign="center"; c.fillText(txt,X(tr.pos.x),X(tr.pos.y)-T*0.28); } });
  // Lockvögel: Wagen mit Pappkartons
  (S.decoys||[]).forEach(dc=>{ const x=X(dc.x), y=X(dc.y), sh=dc.hitT&&t-dc.hitT<0.2?Math.sin(t*60)*2:0;
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x-T*0.28+3+sh,y-T*0.15+4,T*0.56,T*0.3);
    c.fillStyle="#FBF8F2"; c.fillRect(x-T*0.28+sh,y-T*0.15,T*0.42,T*0.3); c.fillStyle="#7A7366"; c.fillRect(x+T*0.14+sh,y-T*0.14,T*0.14,T*0.28);
    c.fillStyle="#C9A36B"; c.fillRect(x-T*0.24+sh,y-T*0.22,T*0.16,T*0.14); c.fillRect(x-T*0.06+sh,y-T*0.26,T*0.16,T*0.18); c.fillStyle="#A9834B"; c.fillRect(x-T*0.24+sh,y-T*0.16,T*0.16,T*0.02);
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x-T*0.28,y+T*0.2,T*0.56,3); c.fillStyle="#C9A36B"; c.fillRect(x-T*0.28,y+T*0.2,T*0.56*dc.hp/dc.max,3); });
  S.vans.forEach(v=>{ if(v.state==="home"||!v.pos) return; const vp=weiter(v.path,v.d,1.5), x=X(vp.x), y=X(vp.y);
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x-T*0.2+2,y-T*0.12+3,T*0.4,T*0.24);
    c.fillStyle="#C98A1B"; c.beginPath(); c.roundRect(x-T*0.2,y-T*0.12,T*0.4,T*0.24,4); c.fill();
    if(v.cargo){ c.strokeStyle="#FBF8F2"; c.lineWidth=1.6; c.beginPath(); c.arc(x,y,T*0.07,0,7); c.moveTo(x-T*0.07,y); c.lineTo(x+T*0.07,y); c.stroke(); } });
  // Der gepanzerte Lieferwagen zwischen Sohle und der Manufaktur
  if(S.uhr) for(const v of lieferWagen()){ if(v.state==="laden") continue; const lp=weiter(v.weg,v.d,v.state==="hoch"?1.1:-1.4), x=X(lp.x), y=X(lp.y);
    c.fillStyle="rgba(0,0,0,.3)"; c.fillRect(x-T*0.26+3,y-T*0.16+4,T*0.52,T*0.32);
    c.fillStyle="#4E4A42"; c.beginPath(); c.roundRect(x-T*0.26,y-T*0.16,T*0.52,T*0.32,4); c.fill();
    c.fillStyle="#2B2A26"; c.fillRect(x-T*0.26,y-T*0.04,T*0.52,T*0.06);
    if(v.cargo){ c.fillStyle="#8A5A35"; for(let q=0;q<Math.min(3,v.cargo);q++) c.fillRect(x-T*0.18+q*T*0.12,y-T*0.1,T*0.08,T*0.1);
      c.fillStyle="#1B1A17"; c.font=`800 ${T*0.15}px ${F}`; c.textAlign="center"; c.fillText(v.cargo+TX.straps,x,y-T*0.24); } }
  // Die Expedition zum Meteoritengestein
  if(S.mw&&S.mw.exp){ const e=S.mw.exp, z=e.ziel||EXP_ZIELE[1], ep=weiter(e.weg,e.d,e.grab&&!e.hat?0:(e.zurueck?-1.1:1.1)),
      x=X(ep.x), y=X(ep.y), zx=X(z.x), zy=X(z.y);
    if(!e.hat){ c.strokeStyle="rgba(123,91,192,.7)"; c.lineWidth=2; c.setLineDash([5,4]); c.beginPath(); c.arc(zx,zy,T*0.3,0,7); c.stroke(); c.setLineDash([]);
      c.fillStyle="#7B5BC0"; c.font=`800 ${T*0.16}px ${F}`; c.textAlign="center"; c.fillText("Meteorit",zx,zy-T*0.4); }
    c.fillStyle="rgba(0,0,0,.3)"; c.fillRect(x-T*0.24+3,y-T*0.15+4,T*0.48,T*0.3);
    c.fillStyle="#5B4A7A"; c.beginPath(); c.roundRect(x-T*0.24,y-T*0.15,T*0.48,T*0.3,4); c.fill();
    c.fillStyle="#7B5BC0"; c.fillRect(x-T*0.24,y-T*0.03,T*0.48,T*0.06);
    if(e.hat){ c.fillStyle="#2B2A26"; c.beginPath(); c.arc(x,y-T*0.09,T*0.07,0,7); c.fill(); }
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x-T*0.24,y-T*0.26,T*0.48,3);
    c.fillStyle=e.hp>e.max*0.4?"#1F7A55":"#B8432F"; c.fillRect(x-T*0.24,y-T*0.26,T*0.48*Math.max(0,e.hp)/e.max,3); }
  // Der Melder zeigt, wo es klemmt: Quelle ohne Nachschub, Viertel ohne Laden
  if(melderZiel&&melderZiel.art==="stadt"&&melderZiel.ziel){ const z=melderZiel.ziel;
    // Leere Viertel zeigen nur ihren Namen, der steht etwas tiefer. Dorthin gehört der Ring.
    const leer=z.shop===false&&z.s!==undefined, zx=X(z.x), zy=X(z.y)+(leer?T*0.3:0), p=1+Math.sin(t*4)*0.07;
    c.save(); c.strokeStyle="#D6452E"; c.lineWidth=3.5; c.setLineDash([9,6]); c.lineDashOffset=-t*14;
    c.beginPath(); c.arc(zx,zy,T*0.62*p,0,7); c.stroke();
    c.setLineDash([]); c.strokeStyle="rgba(214,69,46,.22)"; c.lineWidth=9; c.stroke();
    if(melderZiel.text){ c.font=`800 ${T*0.19}px ${F}`; c.textAlign="center";
      const w2=c.measureText(melderZiel.text).width+12, ty=zy-T*0.78;
      c.fillStyle="#D6452E"; c.beginPath(); c.roundRect(zx-w2/2,ty-T*0.2,w2,T*0.28,6); c.fill();
      c.fillStyle="#fff"; c.fillText(melderZiel.text,zx,ty); }
    c.restore(); }
  // Netze
  S.shots.forEach(s=>{ const k=1-s.ttl/(s.max||0.25), e=Math.max(0,Math.min(1,k*1.6)), gr=s.wucht?2.6:1;
    // Der schwere Wurf fliegt im Bogen, der kleine geradeaus
    const bogen=s.wucht?Math.sin(Math.min(1,e)*Math.PI)*T*0.8:0;
    const bx=X(s.a.x+(s.b.x-s.a.x)*e), by=X(s.a.y+(s.b.y-s.a.y)*e)-bogen, r=T*(0.08+e*0.14)*gr;
    c.strokeStyle=s.wucht?"rgba(123,91,192,.9)":"rgba(201,138,27,.9)"; c.lineWidth=s.wucht?2.6:1.2;
    c.beginPath(); c.moveTo(X(s.a.x),X(s.a.y)); c.lineTo(bx,by); c.stroke();
    c.beginPath(); c.arc(bx,by,r,0,7); c.stroke();
    for(let q=-1;q<=1;q++){ c.beginPath(); c.moveTo(bx-r,by+q*r*0.5); c.lineTo(bx+r,by+q*r*0.5); c.moveTo(bx+q*r*0.5,by-r); c.lineTo(bx+q*r*0.5,by+r); c.stroke(); }
    // Einschlag: Ring und Splitter, sobald der Wurf angekommen ist
    if(s.wucht&&e>=1){ const f=Math.min(1,(k-0.62)/0.38), zx=X(s.b.x), zy=X(s.b.y);
      c.strokeStyle=`rgba(123,91,192,${(1-f)*0.8})`; c.lineWidth=3; c.beginPath(); c.arc(zx,zy,T*(0.2+f*0.9),0,7); c.stroke();
      c.fillStyle=`rgba(90,70,54,${1-f})`; for(let q=0;q<8;q++){ const w=q*0.785, d=T*(0.2+f*0.7);
        c.fillRect(zx+Math.cos(w)*d,zy+Math.sin(w)*d-T*0.1,3,3); } } });
  // Gefangene im Netz, zappelnd
  S.caught.forEach((g,idx)=>{ if(g.gone) return; const x=X(g.x), y=X(g.y), w=Math.sin(t*22+idx)*2.2;
    c.fillStyle="rgba(0,0,0,.2)"; c.beginPath(); c.ellipse(x,y+T*0.2,T*0.16,T*0.05,0,0,7); c.fill();
    c.save(); c.translate(x,y); c.rotate(Math.sin(t*14+idx)*0.35);
    c.fillStyle="#1B1A17"; c.beginPath(); c.roundRect(-T*0.1,-T*0.02,T*0.2,T*0.2,4); c.fill(); c.beginPath(); c.arc(0,-T*0.08,T*0.1,0,7); c.fill();
    c.strokeStyle="#1B1A17"; c.lineWidth=2.4; c.lineCap="round"; c.beginPath(); c.moveTo(-T*0.05,T*0.18); c.lineTo(-T*0.12+w,T*0.3); c.moveTo(T*0.05,T*0.18); c.lineTo(T*0.12-w,T*0.3); c.stroke();
    c.restore();
    c.strokeStyle="rgba(201,138,27,.95)"; c.lineWidth=1.3; const R=T*0.24; c.beginPath(); c.arc(x,y,R,0,7); c.stroke();
    for(let q=-2;q<=2;q++){ c.beginPath(); c.moveTo(x-R,y+q*R*0.38); c.lineTo(x+R,y+q*R*0.38); c.moveTo(x+q*R*0.38,y-R); c.lineTo(x+q*R*0.38,y+R); c.stroke(); } });
  // Streifenwagen mit Blaulicht
  S.cars.forEach(car=>{ const x=X(car.x), y=X(car.y); c.save(); c.translate(x,y); if(car.dir<0) c.scale(-1,1);
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(-T*0.3+2,-T*0.13+3,T*0.6,T*0.26);
    c.fillStyle="#FBF8F2"; c.beginPath(); c.roundRect(-T*0.3,-T*0.13,T*0.6,T*0.26,5); c.fill();
    c.fillStyle="#2E6FE4"; c.fillRect(-T*0.3,-T*0.02,T*0.6,T*0.06);
    c.fillStyle="#9DB7C4"; c.fillRect(T*0.08,-T*0.1,T*0.12,T*0.2);
    const on=Math.floor(t*8)%2; c.fillStyle=on?"#E4572E":"#2E6FE4"; c.fillRect(-T*0.08,-T*0.17,T*0.08,T*0.06); c.fillStyle=on?"#2E6FE4":"#E4572E"; c.fillRect(0,-T*0.17,T*0.08,T*0.06);
    c.restore(); });
  // Banden: Kapuzen mit Schatten und Gang
  S.raiders.forEach((r,idx)=>{ const rp=weich(r), x=X(rp.x), y=X(rp.y), bob=Math.sin(t*(r.flee?14:9)+idx)*1.5, hit=r.hitT&&t-r.hitT<0.25;
    if(hit){ c.save(); c.translate(x,y); c.rotate(Math.sin((t-r.hitT)*40)*0.5); c.translate(-x,-y); }
    c.fillStyle="rgba(0,0,0,.25)"; c.beginPath(); c.ellipse(x,y+T*0.2,T*0.13,T*0.05,0,0,7); c.fill();
    c.fillStyle="#1B1A17"; c.beginPath(); c.roundRect(x-T*0.1,y-T*0.02+bob,T*0.2,T*0.22,4); c.fill();
    c.beginPath(); c.arc(x,y-T*0.08+bob,T*0.1,0,7); c.fill();
    c.fillStyle="#B8432F"; c.fillRect(x-T*0.05,y-T*0.1+bob,T*0.1,T*0.03);
    if(r.loot){ c.fillStyle="#8A6A4A"; c.beginPath(); c.arc(x+T*0.12,y-T*0.02+bob,T*0.09,0,7); c.fill(); c.fillStyle="#6B5038"; c.fillRect(x+T*0.1,y-T*0.13+bob,T*0.04,T*0.04); }
    if(hit) c.restore();
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x-T*0.14,y-T*0.3,T*0.28,3); c.fillStyle="#B8432F"; c.fillRect(x-T*0.14,y-T*0.3,T*0.28*Math.max(0,r.hp)/r.max,3); });
  // Razzia-Trupp
  S.squads.forEach((q,idx)=>{ const qp=weich(q), x=X(qp.x), y=X(qp.y), bob=Math.sin(t*10+idx)*1.5;
    c.fillStyle="rgba(0,0,0,.25)"; c.beginPath(); c.ellipse(x,y+T*0.2,T*0.13,T*0.05,0,0,7); c.fill();
    c.fillStyle="#1F7A55"; c.beginPath(); c.roundRect(x-T*0.1,y-T*0.02+bob,T*0.2,T*0.22,4); c.fill(); c.beginPath(); c.arc(x,y-T*0.08+bob,T*0.1,0,7); c.fill();
    c.fillStyle="#FBF8F2"; c.fillRect(x-T*0.08,y+T*0.06+bob,T*0.16,T*0.04);
    c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(x-T*0.14,y-T*0.3,T*0.28,3); c.fillStyle="#1F7A55"; c.fillRect(x-T*0.14,y-T*0.3,T*0.28*Math.max(0,q.hp)/10,3); });
  // Einblendungen als Schilder
  S.pops.forEach(p=>{ const a=Math.min(1,p.ttl), yy=X(p.y)-T*0.6-(1.3-p.ttl)*T*0.5; c.globalAlpha=a; c.font=`800 ${T*0.2}px ${F}`;
    const w=c.measureText(p.t).width+10; c.fillStyle="rgba(251,248,242,.92)"; c.beginPath(); c.roundRect(X(p.x)-w/2,yy-T*0.2,w,T*0.28,6); c.fill();
    c.fillStyle=p.c; c.textAlign="center"; c.fillText(p.t,X(p.x),yy); c.globalAlpha=1; });
}
