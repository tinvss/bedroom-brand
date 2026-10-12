// Turm zeichnen (Canvas) und Symbole
/* ================= Zeichnen: Turm ================= */
function shoe(x,y,col,sc,high){ sc=sc||1;
  const body=high?`<path d="M-12 3c0-6 1-14 4-16h6l1 7c3 1 7 2 10 4 2 1 3 2 3 3v2h-24z" fill="${col}"/>`:`<path d="M-12 3c0-4 2-9 6-10l5 3c3 1 7 2 10 4 2 1 3 2 3 3v1h-24z" fill="${col}"/>`;
  return `<g transform="translate(${x},${y}) scale(${sc})">${body}<path d="M-12 4h24v3h-24z" fill="#F4F1EA" stroke="#1B1A17" stroke-width=".6"/></g>`; }
function itemSvg(k,x,y){
  if(k==="leder") return `<rect x="${x-8}" y="${y-5}" width="16" height="10" rx="2" fill="var(--leder)"/>`;
  if(k==="gummi") return `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="var(--gummi)"/>`;
  if(k==="metall") return `<rect x="${x-7}" y="${y-4}" width="14" height="8" fill="var(--metall)"/>`;
  if(k==="schaft") return `<path d="M${x-8} ${y+4}c0-4 2-8 5-9l4 3c3 1 5 2 7 3v3z" fill="var(--schaft)"/>`;
  if(k==="sohle") return `<rect x="${x-10}" y="${y-2}" width="20" height="5" rx="2" fill="var(--sohle)" stroke="#1B1A17" stroke-width=".6"/>`;
  if(k.endsWith("_s")) return shoe(x,y,MODELS[k.slice(0,-2)].col,0.8,k==="hightop_s")+`<circle cx="${x+8}" cy="${y-8}" r="4.2" fill="#E8B429" stroke="#1B1A17" stroke-width=".7"/>`;
  if(k==="ausr") return `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="var(--ausr)" stroke-width="2.4"/><path d="M${x-6} ${y}h12M${x} ${y-6}v12" stroke="var(--ausr)" stroke-width="1.4"/>`;
  return shoe(x,y,MODELS[k].col,0.8,k==="hightop"); }
const ICON={bench:`<rect x="-9" y="-2" width="18" height="4" rx="1"/><path d="M-7 2v7M7 2v7"/><circle cx="0" cy="-7" r="3"/>`,
  cut:`<path d="M-7 -6l14 12M-7 6l14-12"/><circle cx="-8" cy="-7" r="3"/><circle cx="-8" cy="7" r="3"/>`,
  press:`<rect x="-8" y="-9" width="16" height="6" rx="1"/><path d="M0 -3v5"/><rect x="-9" y="3" width="18" height="5" rx="1"/>`,
  asm:`<circle cx="0" cy="0" r="7"/><path d="M0 -7v-3M0 7v3M-7 0h-3M7 0h3"/><circle cx="0" cy="0" r="2.4"/>`,
  lab:`<path d="M-3 -9h6M-2 -9v6l-6 11h16l-6-11v-6"/><path d="M-5 4h10"/>`,
  seal:`<circle cx="0" cy="-1" r="6.5"/><path d="M-3 -1l2 2 4-4"/><path d="M-4 5l-2 5 3-1 1 3 2-5M4 5l2 5-3-1-1 3-2-5"/>`,
  giess:`<path d="M-8 -6h16l-3 6h-10z"/><path d="M-3 0v6M3 0v6"/><path d="M-6 6h12v4h-12z"/>`,
  ofen:`<circle cx="0" cy="1" r="7"/><path d="M-4 -6l2 3M4 -6l-2 3M0 -8v3"/>`,
  fein:`<circle cx="0" cy="0" r="4.5"/><path d="M0 -4.5v-3M0 4.5v3M-4.5 0h-3M4.5 0h3M-3.2 -3.2l-2-2M3.2 3.2l2 2M3.2 -3.2l2-2M-3.2 3.2l-2 2"/>`,
  werk:`<circle cx="-3" cy="0" r="4"/><circle cx="4" cy="3" r="3"/><path d="M-3 -6v-2M4 7v2"/>`,
  endm:`<circle cx="0" cy="0" r="7"/><path d="M0 0v-4M0 0l3 2"/><path d="M-3 -8h6M-3 8h6"/>`,
  atelier:`<path d="M-7 8V-2l7-6 7 6v10"/><path d="M-7 8h14"/><circle cx="0" cy="2" r="2.6"/><path d="M-3 -3h6"/>`,
  zert:`<circle cx="0" cy="-1" r="6"/><path d="M-2.5 -1l2 2 3.5-3.5"/><path d="M-3 5l-2 5 3-1 1 3 2-5M3 5l2 5-3-1-1 3-2-5"/>`,
  werkstatt:`<path d="M-10 9h20"/><path d="M-9 3a9 9 0 0 1 18 0"/><circle cx="0" cy="4" r="3.6"/><path d="M0 4v-3"/>`,
  equip:`<circle cx="0" cy="0" r="8"/><path d="M-7 -4h14M-7 0h14M-7 4h14M-4 -7v14M0 -8v16M4 -7v14" stroke-width="1.2"/>`};
const machIcon=k=>{ const col=MACH2[k]?"#7B5BC0":k==="equip"?"#C98A1B":k==="seal"?"#B8860B":k==="lab"?"#7B5BC0":k==="bench"?"#2E6FE4":"#1B1A17";
  return `<svg viewBox="-12 -12 24 24" width="30" height="30" style="flex:none;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:3px"><g stroke="${col}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</g></svg>`; };

// Markierung um eine klemmende Stelle. Sie pulsiert, damit man sie auch beim Bauen sieht.
// Ein Stück Ware gleitet in genau einem Turmtakt von Platz zu Platz. Vorher zog es mit einer
// Feder nach: erst stand es kurz, dann rutschte es. Das war das Ruckeln, das man gesehen hat.
function gleite(it,tx,ty,dt){
  if(it.dx===undefined||Math.abs(it.dy-ty)>20){ it.dx=tx; it.dy=ty; it.zx=tx; it.zt=TURM_TAKT; }
  if(it.zx!==tx){ it.vx=it.dx; it.zx=tx; it.zt=0; }
  it.zt=Math.min(TURM_TAKT,(it.zt||0)+dt);
  it.dx = it.vx===undefined ? tx : it.vx+(tx-it.vx)*(it.zt/TURM_TAKT);
  it.dy=ty;
}
function melderRing(c,r){ if(!r) return; const p=1+Math.sin(animT*4)*0.06, w=r.w*p, h=r.h*p, x=r.x-(w-r.w)/2, y=r.y-(h-r.h)/2;
  c.save(); c.strokeStyle="#D6452E"; c.lineWidth=3.5; c.setLineDash([9,6]); c.lineDashOffset=-animT*14;
  c.beginPath(); c.roundRect(x-4,y-4,w+8,h+8,10); c.stroke();
  c.setLineDash([]); c.strokeStyle="rgba(214,69,46,.25)"; c.lineWidth=9; c.stroke(); c.restore(); }
/* ---------- Turm auf Leinwand ---------- */
const tcv=$("tc"), tctx=tcv&&tcv.getContext?tcv.getContext("2d"):null; let TS=1, TDPR=1, hits=[], lastDraw=0;
const FH=132, SLW=60, X0=40, VW=500, ROOF=70, BAND_Y=94, DURCH_Y=BAND_Y+20;   // Höhe der Etage, Arbeitsband und Durchgangsband ab Oberkante
function towerH(){ const W=aktivesWerk(), n=W.floors.length, nextH=S.factory&&etagenPreis(n)!==undefined?60:0; return ROOF+nextH+n*FH+16; }
function sizeTower(){ const w=tcv.clientWidth||360; TDPR=Math.min(2,window.devicePixelRatio||1); TS=w/VW; const h=towerH()*TS;
  if(Math.abs(tcv.height-h*TDPR)>2||tcv.width!==Math.round(w*TDPR)){ tcv.style.height=h+"px"; tcv.width=Math.round(w*TDPR); tcv.height=Math.round(h*TDPR); } }
const SHOE_LOW=new (typeof Path2D!=="undefined"?Path2D:Object)("M-12 3c0-4 2-9 6-10l5 3c3 1 7 2 10 4 2 1 3 2 3 3v1h-24z");
const SHOE_HIGH=new (typeof Path2D!=="undefined"?Path2D:Object)("M-12 3c0-6 1-14 4-16h6l1 7c3 1 7 2 10 4 2 1 3 2 3 3v2h-24z");
const SCHAFT=new (typeof Path2D!=="undefined"?Path2D:Object)("M-8 4c0-4 2-8 5-9l4 3c3 1 5 2 7 3v3z");
function cShoe(c,x,y,col,sc,high){ c.save(); c.translate(x,y); c.scale(sc,sc); c.fillStyle=col; c.fill(high?SHOE_HIGH:SHOE_LOW);
  c.fillStyle="#F4F1EA"; c.fillRect(-12,4,24,3); c.strokeStyle="#1B1A17"; c.lineWidth=.6; c.strokeRect(-12,4,24,3); c.restore(); }
function cItem(c,k,x,y){
  if(k==="leder"){ c.fillStyle="#8A5A35"; c.beginPath(); c.roundRect(x-8,y-5,16,10,2); c.fill(); return; }
  if(k==="gummi"){ c.fillStyle="#3A3A3A"; c.beginPath(); c.ellipse(x,y,9,5,0,0,7); c.fill(); return; }
  if(k==="metall"){ c.fillStyle="#6C7A89"; c.fillRect(x-7,y-4,14,8); c.fillStyle="rgba(255,255,255,.3)"; c.fillRect(x-7,y-4,14,2); return; }
  if(k==="schaft"){ c.save(); c.translate(x,y); c.fillStyle="#C9824A"; c.fill(SCHAFT); c.restore(); return; }
  if(k==="sohle"){ c.fillStyle="#EDEDED"; c.beginPath(); c.roundRect(x-10,y-2,20,5,2); c.fill(); c.strokeStyle="#1B1A17"; c.lineWidth=.6; c.stroke(); return; }
  if(k==="ausr"){ c.strokeStyle="#C98A1B"; c.lineWidth=2.2; c.beginPath(); c.arc(x,y,6,0,7); c.stroke(); c.lineWidth=1.2; c.beginPath(); c.moveTo(x-6,y); c.lineTo(x+6,y); c.moveTo(x,y-6); c.lineTo(x,y+6); c.stroke(); return; }
  // Kapitel 2
  if(k==="sand"){ c.fillStyle="#D8C08A"; c.beginPath(); c.moveTo(x-8,y+4); c.lineTo(x,y-5); c.lineTo(x+8,y+4); c.closePath(); c.fill(); return; }
  if(k==="band"){ c.fillStyle="#8A5A35"; c.beginPath(); c.roundRect(x-9,y-3,18,6,2); c.fill(); c.fillStyle="#6B4526"; c.fillRect(x-2,y-3,2,6); return; }
  if(k==="gehaeuse"){ c.strokeStyle="#6C7A89"; c.lineWidth=3; c.beginPath(); c.arc(x,y,6,0,7); c.stroke(); return; }
  if(k==="glas"){ c.fillStyle="rgba(157,183,196,.75)"; c.beginPath(); c.arc(x,y,6,0,7); c.fill(); c.strokeStyle="#FBF8F2"; c.lineWidth=1; c.beginPath(); c.arc(x-2,y-2,3,3.4,5.2); c.stroke(); return; }
  if(k==="zahnrad"){ c.fillStyle="#C98A1B"; c.beginPath(); c.arc(x,y,4,0,7); c.fill(); c.strokeStyle="#C98A1B"; c.lineWidth=1.6;
    for(let q=0;q<6;q++){ const a=q*Math.PI/3; c.beginPath(); c.moveTo(x+Math.cos(a)*4,y+Math.sin(a)*4); c.lineTo(x+Math.cos(a)*7,y+Math.sin(a)*7); c.stroke(); } return; }
  if(k==="uhrwerk"){ c.fillStyle="#B08A3A"; c.beginPath(); c.arc(x-2,y,4.5,0,7); c.fill(); c.fillStyle="#C98A1B"; c.beginPath(); c.arc(x+3,y+2,3,0,7); c.fill(); return; }
  if(UHREN[k]||UHREN[k.replace(/_s$/,"")]){ const u=k.replace(/_s$/,"");
    c.fillStyle="#8A5A35"; c.fillRect(x-2.5,y-9,5,18);
    c.fillStyle=UHREN[u].c2; c.beginPath(); c.arc(x,y,6.5,0,7); c.fill();
    c.fillStyle="#FBF8F2"; c.beginPath(); c.arc(x,y,4.5,0,7); c.fill();
    c.strokeStyle="#1B1A17"; c.lineWidth=1; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-3); c.moveTo(x,y); c.lineTo(x+2.5,y+1); c.stroke();
    if(k.endsWith("_s")){ c.fillStyle="#E8B429"; c.beginPath(); c.arc(x+7,y-7,3.6,0,7); c.fill(); } return; }
  const sealed=k.endsWith("_s"), m=sealed?k.slice(0,-2):k;
  cShoe(c,x,y,MODELS[m].c2,0.8,m==="hightop");
  if(sealed){ c.fillStyle="#E8B429"; c.beginPath(); c.arc(x+8,y-8,4.2,0,7); c.fill(); c.strokeStyle="#1B1A17"; c.lineWidth=.7; c.stroke(); }
}
function cIcon(c,t,x,y,col,busy){
  c.save(); c.translate(x,y); c.strokeStyle=col; c.fillStyle=col; c.lineWidth=2; c.lineCap="round"; c.lineJoin="round";
  const rot=busy?animT*4:0;
  if(t==="cut"){ c.rotate(busy?Math.sin(animT*10)*0.25:0); c.beginPath(); c.moveTo(-7,-6); c.lineTo(7,6); c.moveTo(-7,6); c.lineTo(7,-6); c.stroke();
    c.beginPath(); c.arc(-8,-7,3,0,7); c.arc(-8,7,3,0,7); c.stroke(); }
  else if(t==="press"){ const d=busy?Math.abs(Math.sin(animT*6))*4:0; c.strokeRect(-8,-10+d,16,6); c.beginPath(); c.moveTo(0,-4+d); c.lineTo(0,2); c.stroke(); c.strokeRect(-9,3,18,5); }
  else if(t==="equip"){ c.beginPath(); c.arc(0,0,8,0,7); c.stroke(); c.lineWidth=1.3;
    for(let k=-1;k<=1;k++){ c.beginPath(); c.moveTo(-7,k*4); c.lineTo(7,k*4); c.moveTo(k*4,-7); c.lineTo(k*4,7); c.stroke(); }
    if(busy){ c.rotate(Math.sin(animT*6)*0.2); } }
  else if(t==="asm"){ c.rotate(rot); c.beginPath(); c.arc(0,0,7,0,7); c.stroke();
    for(let k=0;k<6;k++){ c.save(); c.rotate(k*Math.PI/3); c.fillRect(-1.5,-10,3,3.5); c.restore(); } c.beginPath(); c.arc(0,0,2.4,0,7); c.fill(); }
  else if(t==="lab"){ c.beginPath(); c.moveTo(-3,-9); c.lineTo(3,-9); c.moveTo(-2,-9); c.lineTo(-2,-3); c.lineTo(-8,8); c.lineTo(8,8); c.lineTo(2,-3); c.lineTo(2,-9); c.stroke();
    if(busy){ c.beginPath(); c.arc(-2+Math.sin(animT*6)*2,3-((animT*3)%1)*6,1.6,0,7); c.fill(); } }
  // Kapitel 2
  else if(t==="giess"){ c.beginPath(); c.moveTo(-8,-6); c.lineTo(8,-6); c.lineTo(5,0); c.lineTo(-5,0); c.closePath(); c.stroke();
    const g=busy?Math.abs(Math.sin(animT*4))*3:0; c.beginPath(); c.moveTo(0,0); c.lineTo(0,4+g); c.stroke();
    c.strokeRect(-6,5+g,12,5); }
  else if(t==="ofen"){ c.beginPath(); c.arc(0,1,7,0,7); c.stroke();
    if(busy){ c.fillStyle="#E4572E"; c.beginPath(); c.arc(0,1,3+Math.sin(animT*8)*1.2,0,7); c.fill(); c.fillStyle=col; }
    c.beginPath(); c.moveTo(-4,-7); c.lineTo(-2,-4); c.moveTo(4,-7); c.lineTo(2,-4); c.stroke(); }
  else if(t==="fein"){ c.rotate(busy?animT*2:0); c.beginPath(); c.arc(0,0,4.5,0,7); c.stroke();
    for(let q=0;q<8;q++){ const a=q*Math.PI/4; c.beginPath(); c.moveTo(Math.cos(a)*4.5,Math.sin(a)*4.5); c.lineTo(Math.cos(a)*7.5,Math.sin(a)*7.5); c.stroke(); } }
  else if(t==="werk"){ c.save(); c.rotate(busy?animT*2:0); c.beginPath(); c.arc(-3,-1,4,0,7); c.stroke(); c.restore();
    c.save(); c.rotate(busy?-animT*3:0); c.beginPath(); c.arc(4,3,3,0,7); c.stroke(); c.restore();
    c.beginPath(); c.arc(-3,-1,1.2,0,7); c.fill(); }
  else if(t==="endm"){ c.beginPath(); c.arc(0,0,7,0,7); c.stroke();
    c.beginPath(); c.moveTo(0,0); c.lineTo(0,-4); c.moveTo(0,0); c.lineTo(3,2); c.stroke();
    c.save(); c.rotate(busy?animT*3:0); c.beginPath(); c.arc(0,0,1.5,0,7); c.fill(); c.restore();
    c.beginPath(); c.moveTo(-3,-9); c.lineTo(3,-9); c.moveTo(-3,9); c.lineTo(3,9); c.stroke(); }
  else if(t==="atelier"){ c.beginPath(); c.moveTo(-7,8); c.lineTo(-7,-2); c.lineTo(0,-8); c.lineTo(7,-2); c.lineTo(7,8); c.stroke();
    c.beginPath(); c.moveTo(-7,8); c.lineTo(7,8); c.stroke();
    c.beginPath(); c.arc(0,2,2.6,0,7); c.stroke();
    if(busy){ c.save(); c.rotate(animT*2); c.beginPath(); c.moveTo(0,2); c.lineTo(0,-0.4); c.stroke(); c.restore(); } }
  else if(t==="zert"){ c.beginPath(); c.arc(0,-2,5.5,0,7); c.stroke();
    c.beginPath(); c.moveTo(-2.5,-2); c.lineTo(-0.5,0); c.lineTo(3,-4); c.stroke();
    c.beginPath(); c.moveTo(-3,4); c.lineTo(-5,10); c.lineTo(-2,9); c.lineTo(-1,12); c.lineTo(1,6); c.moveTo(3,4); c.lineTo(5,10); c.lineTo(2,9); c.lineTo(1,12); c.stroke(); }
  else if(t==="seal"){ c.beginPath(); c.arc(0,-1,6.5,0,7); c.stroke(); c.beginPath(); c.moveTo(-3,-1); c.lineTo(-1,1); c.lineTo(3,-3); c.stroke();
    c.beginPath(); c.moveTo(-4,5); c.lineTo(-6,10); c.lineTo(-3,9); c.lineTo(-2,12); c.lineTo(0,7); c.moveTo(4,5); c.lineTo(6,10); c.lineTo(3,9); c.lineTo(2,12); c.lineTo(0,7); c.stroke(); }
  else if(t==="werkstatt"){ c.beginPath(); c.moveTo(-10,9); c.lineTo(10,9); c.stroke();
    c.beginPath(); c.arc(0,3,9,Math.PI,0); c.stroke();
    c.beginPath(); c.arc(0,4,3.6,0,7); c.stroke();
    c.save(); c.rotate(busy?animT*2:0.6); c.beginPath(); c.moveTo(0,4); c.lineTo(0,1.2); c.stroke(); c.restore(); }
  c.restore();
}
function drawWorker(c,x,y,busy){
  const arm=busy?Math.sin(animT*8)*4:0;
  c.fillStyle="#2E6FE4"; c.beginPath(); c.roundRect(x-6,y-4,12,14,4); c.fill();
  c.fillStyle="#E8C4A0"; c.beginPath(); c.arc(x,y-9,5,0,7); c.fill();
  c.fillStyle="#3A2A1E"; c.beginPath(); c.arc(x,y-11,5,Math.PI,0); c.fill();
  c.strokeStyle="#2E6FE4"; c.lineWidth=3; c.lineCap="round"; c.beginPath(); c.moveTo(x+5,y); c.lineTo(x+12,y+4+arm); c.stroke();
}
function drawTower(dt){
  if(!tctx) return; const W=aktivesWerk(); sizeTower();
  const c=tctx, n=W.floors.length, nextH=S.factory&&etagenPreis(n)!==undefined?60:0, H2=towerH();
  c.setTransform(TDPR*TS,0,0,TDPR*TS,0,0); hits=[];
  const floorTop=f=>ROOF+nextH+(n-1-f)*FH;
  // Himmel und Straße
  const sky=c.createLinearGradient(0,0,0,H2); sky.addColorStop(0,"#E9E3D6"); sky.addColorStop(1,"#DCD3C3"); c.fillStyle=sky; c.fillRect(0,0,VW,H2);
  c.fillStyle="#8E877A"; c.fillRect(0,H2-14,VW,14);
  // Dach
  c.fillStyle="rgba(0,0,0,.15)"; c.beginPath(); c.moveTo(26,ROOF+6); c.lineTo(256,16); c.lineTo(486,ROOF+6); c.fill();
  c.fillStyle="#7A2A1E"; c.beginPath(); c.moveTo(14,ROOF); c.lineTo(250,10); c.lineTo(486,ROOF); c.closePath(); c.fill();
  c.strokeStyle="rgba(0,0,0,.18)"; c.lineWidth=1; for(let k=1;k<9;k++){ const f=k/9; c.beginPath(); c.moveTo(14+f*236,ROOF-f*60); c.lineTo(486-f*236,ROOF-f*60); c.stroke(); }
  c.fillStyle="#E4572E"; c.fillRect(186,ROOF-24,128,20); c.fillStyle="#FBF8F2"; c.font="800 12px Archivo, system-ui, sans-serif"; c.textAlign="center"; c.fillText(aktivesHaus().n.toUpperCase(),250,ROOF-9);
  // Außenmauer
  c.fillStyle="#2B2A26"; c.fillRect(14,ROOF,472,nextH+n*FH+4);
  // Nächste Etage
  if(nextH){ const cost=etagenPreis(n), can=S.money>=cost; c.fillStyle="#3A3833"; c.fillRect(24,ROOF+6,452,nextH-8);
    c.setLineDash([6,6]); c.strokeStyle="rgba(255,255,255,.25)"; c.strokeRect(30,ROOF+10,440,nextH-16); c.setLineDash([]);
    c.fillStyle=can?"#FBF8F2":"rgba(255,255,255,.12)"; c.beginPath(); c.roundRect(150,ROOF+12,200,34,17); c.fill();
    c.fillStyle=can?"#1B1A17":"rgba(255,255,255,.5)"; c.font="800 13px Archivo, system-ui, sans-serif"; c.fillText(`${TX.build_floor}${n+1}${TX.etage_bauen}${cost}`,250,ROOF+34);
    hits.push({x:140,y:ROOF-2,w:220,h:60,act:()=>buildFloor()}); }
  for(let f=0;f<n;f++){
    const Y=floorTop(f), F=W.floors[f], d=dirOf(f), laneY=Y+BAND_Y, kid=f===0&&!S.factory;
    // Raum
    const wall=c.createLinearGradient(0,Y,0,Y+FH); wall.addColorStop(0,kid?"#EBDCC6":"#EDE4D3"); wall.addColorStop(1,kid?"#E2CFB4":"#E1D6C2");
    c.fillStyle=wall; c.fillRect(24,Y+6,452,FH-12);
    if(kid){ c.fillStyle="rgba(228,87,46,.035)"; for(let k=0;k<12;k++) c.fillRect(24+k*38,Y+6,19,FH-12); }
    // Lampe mit Lichtkegel
    for(const lx of [140,360]){ const g=c.createRadialGradient(lx,Y+10,4,lx,Y+40,90); g.addColorStop(0,"rgba(255,226,160,.45)"); g.addColorStop(1,"rgba(255,226,160,0)");
      c.fillStyle=g; c.fillRect(lx-100,Y+6,200,FH-12); c.fillStyle="#1B1A17"; c.fillRect(lx-1,Y+6,2,8); c.fillStyle="#F2D38A"; c.beginPath(); c.arc(lx,Y+16,5,0,7); c.fill(); }
    // Fenster in der Außenwand
    c.fillStyle="#9DB7C4"; c.fillRect(16,Y+28,8,34); c.fillRect(476,Y+28,8,34);
    if(kid){ c.fillStyle="rgba(46,111,228,.35)"; c.fillRect(430,Y+12,22,16); c.fillStyle="rgba(242,180,65,.4)"; c.fillRect(404,Y+14,18,12); }
    c.fillStyle="#8E877A"; c.font="800 10px Archivo, system-ui, sans-serif"; c.textAlign="left";
    c.fillText(kid?TX.bedroom_2:f===0?(W.name==="uhren"?TX.manufactory_2:TX.workshop):`${TX.floor_2}${f+1}${TX.etage}`,32,Y+20);
    // Förderband mit laufenden Rollen
    c.fillStyle="#2B2A26"; c.beginPath(); c.roundRect(X0-2,laneY-7,SLW*L+4,16,5); c.fill();
    c.fillStyle="#3E3C36"; c.fillRect(X0,laneY-4,SLW*L,10);
    const off=((animT*24*d)%12+12)%12; c.fillStyle="#57544C"; for(let k=-1;k<SLW*L/12+1;k++){ const xx=X0+k*12+off; if(xx>X0&&xx<X0+SLW*L-3) c.fillRect(xx,laneY-4,3,10); }
    // Maschinenplätze
    for(let i=0;i<L;i++){ const x=X0+i*SLW, m=F.slots[i];
      if(!m){ c.setLineDash([4,4]); c.strokeStyle="rgba(122,115,102,.55)"; c.lineWidth=1.4; c.beginPath(); c.roundRect(x+7,laneY-70,SLW-14,54,7); c.stroke(); c.setLineDash([]);
        c.strokeStyle="rgba(122,115,102,.7)"; c.lineWidth=1.8; c.beginPath(); c.moveTo(x+SLW/2,laneY-49); c.lineTo(x+SLW/2,laneY-37); c.moveTo(x+SLW/2-6,laneY-43); c.lineTo(x+SLW/2+6,laneY-43); c.stroke(); }
      else { const col=(m.t==="asm"||m.t==="endm")?(W.models[m.model]||{}).c2||"#1B1A17":m.t==="equip"?"#C98A1B":(m.t==="seal"||m.t==="zert")?"#B8860B":m.t==="lab"?"#7B5BC0":m.t==="ofen"?"#C9824A":(m.t==="fein"||m.t==="werk")?"#6C7A89":"#1B1A17";
        const T0=speedOf(W,m);
        c.fillStyle="rgba(0,0,0,.18)"; c.beginPath(); c.roundRect(x+8,laneY-68,SLW-12,58,8); c.fill();
        c.fillStyle="#FBF8F2"; c.beginPath(); c.roundRect(x+5,laneY-72,SLW-10,58,8); c.fill();
        c.fillStyle=col; c.beginPath(); c.roundRect(x+5,laneY-72,SLW-10,8,[8,8,0,0]); c.fill();
        // Zustandslampe: grün läuft, gelb wartet, rot kommt nicht los
        const need=bedarfVon(W,m);
        const miss=Object.keys(need).find(k=>(m.buf[k]||0)<need[k]);
        const state=m.busy?"run":(m.blockT>2)?"block":m.full?"full":miss?"wait":"run";
        const lamp=state==="run"?"#2FA36B":state==="block"?"#D6452E":state==="full"?"#C98A1B":"#E8B429";
        c.fillStyle=lamp; c.beginPath(); c.arc(x+13,laneY-60,4.5,0,7); c.fill(); c.strokeStyle="#1B1A17"; c.lineWidth=.8; c.stroke();
        if(m.prio){ c.fillStyle="#E4572E"; c.font="800 11px Archivo, system-ui, sans-serif"; c.textAlign="center"; c.fillText("★",x+SLW-13,laneY-56); }
        m._state=state; m._miss=miss;
        if(m.t==="bench"){ c.fillStyle="#8A6A4A"; c.fillRect(x+10,laneY-34,SLW-20,4); drawWorker(c,x+SLW/2-6,laneY-44,m.busy);
          c.fillStyle="#7A7366"; c.font="800 8px Archivo, system-ui, sans-serif"; c.textAlign="right"; c.fillText(TX.level_2+((m.lvl||0)+1),x+SLW-9,laneY-58); }
        else cIcon(c,m.t,x+SLW/2,laneY-42,col,m.t==="werkstatt"?(S.mw&&S.mw.phase==="bau"):m.busy);
        if(m.t==="werkstatt"){ const Mw=S.mw, txt=!Mw?"AUFTRAG WARTET":Mw.phase==="bau"?Math.ceil(MEISTER_BAUZEIT-(S.t-Mw.bauT))+" S":Mw.phase==="fertig"?"FERTIG":Object.keys(Mw.teile).length+TX.of_4_2;
          c.fillStyle=Mw&&Mw.phase==="bau"?"#B8432F":"#7B5BC0"; c.font="800 8px Archivo, system-ui, sans-serif"; c.textAlign="center"; c.fillText(txt,x+SLW/2,laneY-18); }
        if(m.busy){ const pr=Math.min(1,(m.p+taktPhase())/T0);
          c.strokeStyle=col; c.lineWidth=3; c.beginPath(); c.arc(x+SLW/2,laneY-42,17,-Math.PI/2,-Math.PI/2+Math.PI*2*pr); c.stroke(); }
        if(m.out) cItem(c,m.out.k,x+SLW-16,laneY-60);
        if(m._state==="wait"&&m._miss&&!m.full&&!(m.t==="seal")){ c.fillStyle="rgba(232,180,41,.25)"; c.beginPath(); c.arc(x+SLW/2,laneY-20,8,0,7); c.fill();
          c.save(); c.translate(x+SLW/2,laneY-20); c.scale(.6,.6); cItem(c,m._miss==="fertig"?Object.keys(W.models)[0]:m._miss,0,0); c.restore(); }
        if(m._state==="block"){ c.fillStyle="#D6452E"; c.font="800 9px Archivo, system-ui, sans-serif"; c.textAlign="center"; c.fillText(TX.jam,x+SLW/2,laneY-18); }
        if(m.full){ c.fillStyle="#C98A1B"; c.font="800 8px Archivo, system-ui, sans-serif"; c.textAlign="center"; c.fillText("LAGER VOLL",x+SLW/2,laneY-18); }
        if(m.t==="seal"&&S.t-(m.last||m.born||0)>15&&!W.floors.some(F2=>F2.slots.some(a=>a&&a!==m&&a.t==="seal"&&S.t-(a.last||-99)<10))&&W.floors.some(F2=>F2.slots.some(a=>a&&a.t==="asm"&&S.t-(a.last||-99)<10))){ c.fillStyle="#B8432F"; c.font="800 8px Archivo, system-ui, sans-serif"; c.textAlign="center"; c.fillText("KEINE SCHUHE",x+SLW/2,laneY-18); }
        c.fillStyle=col; c.fillRect(x+SLW/2-1.5,laneY-14,3,7); }
      if(moving&&moving.f===f&&moving.i===i){ c.strokeStyle="#1F7A55"; c.lineWidth=2.6; c.beginPath(); c.roundRect(x+2,laneY-76,SLW-4,66,9); c.stroke(); }
      if(melderZiel&&melderZiel.art==="platz"&&melderZiel.f===f&&melderZiel.i===i) melderRing(c,{x:x+5,y:laneY-72,w:SLW-10,h:58});
      hits.push({x,y:laneY-76,w:SLW,h:84,act:()=>openSlot(f,i)}); }
    // Waren gleiten weich
    F.lane.forEach((it,i)=>{ if(!it) return; const tx=X0+i*SLW+SLW/2, ty=laneY+1;
      gleite(it,tx,ty,dt); cItem(c,it.k,it.dx,it.dy);
      if(it.to){ const tm=W.floors[it.to.f]&&W.floors[it.to.f].slots[it.to.i]; if(tm){ c.fillStyle=tm.t==="equip"?"#C98A1B":tm.t==="bench"?"#2E6FE4":tm.t==="press"?"#7A7366":"#1B1A17";
        c.beginPath(); c.arc(it.dx,it.dy-9,2.6,0,7); c.fill(); } } });
    // Durchgangsband ab der zweiten Etage: schmaler, dunkler, Ware kleiner
    if(f>0){ const py=Y+DURCH_Y;
      c.fillStyle="#1F1E1B"; c.beginPath(); c.roundRect(X0-2,py-5,SLW*L+4,11,4); c.fill(); c.fillStyle="#34322D"; c.fillRect(X0,py-3,SLW*L,7);
      c.fillStyle="#4A4740"; for(let k=-1;k<SLW*L/12+1;k++){ const xx=X0+k*12+off; if(xx>X0&&xx<X0+SLW*L-3) c.fillRect(xx,py-3,2,7); }
      (F.pass||[]).forEach((it,i)=>{ if(!it) return; const tx=X0+i*SLW+SLW/2;
        gleite(it,tx,py,dt);
        c.save(); c.translate(it.dx,py); c.scale(.62,.62); cItem(c,it.k,0,0); c.restore(); });
      // Beschriftung: Solange Ware durchfährt, hell, sonst dezent. Ein Etikett erklärt mehr als ein Satz.
      { const faehrt=(F.pass||[]).some(Boolean);
        c.fillStyle=faehrt?"#C9A36B":"rgba(160,152,138,.5)"; c.font=`800 8px Archivo, system-ui, sans-serif`;
        c.textAlign=d===1?"left":"right"; c.fillText(TX.bypass, d===1?X0+4:X0+SLW*L-4, py+12); } }
    // Warenannahme dieser Etage
    { const side=d===1?18:472, has=W.intakes.includes(f);
      const dy=laneY-74;
      if(has){ c.fillStyle="#1F7A55"; c.fillRect(side,dy,10,28); c.fillStyle="#F2B441"; c.fillRect(side+2,dy+4,6,3); }
      else if(S.factory&&f>0){ c.setLineDash([3,3]); c.strokeStyle="rgba(255,255,255,.7)"; c.strokeRect(side,dy,10,28); c.setLineDash([]); }
      hits.push({x:side-18,y:dy-16,w:50,h:70,act:()=>openIntake(f)}); }
    // Warenausgang am Etagenende: Hier rutscht fertige Ware direkt ins Lager
    { const ende=d===1?X0+SLW*L-2:X0+2, ri=d===1?1:-1, ry=laneY+8, frisch=F.ausgang&&S.t-F.ausgang<0.6;
      c.fillStyle="#4A4740"; c.beginPath();
      c.moveTo(ende,ry-10); c.lineTo(ende+ri*22,ry+4); c.lineTo(ende+ri*22,ry+18); c.lineTo(ende,ry+4); c.closePath(); c.fill();
      c.strokeStyle=frisch?"#F2B441":"rgba(242,180,65,.65)"; c.lineWidth=2.4; c.lineCap="round"; c.beginPath();
      c.moveTo(ende+ri*10,ry-1); c.lineTo(ende+ri*10,ry+11); c.moveTo(ende+ri*5,ry+6); c.lineTo(ende+ri*10,ry+12); c.lineTo(ende+ri*15,ry+6); c.stroke();
      if(frisch){ c.save(); c.translate(ende+ri*12,ry+7); c.scale(.6,.6); cItem(c,F.ausgangK||"runner",0,0); c.restore(); } }
    // Boden
    c.fillStyle="#8E877A"; c.fillRect(24,Y+FH-6,452,6);
  }
  // Aufzüge
  for(let f=0;f<n-1;f++){ const d=dirOf(f), sx=d===1?468:18, Yt=floorTop(f+1)+BAND_Y-20, Yb=floorTop(f)+(f>0?DURCH_Y+8:BAND_Y+14), Lf=W.lifts[f];
    c.fillStyle="#57544C"; c.fillRect(sx,Yt,14,Yb-Yt); c.strokeStyle="#8E877A"; c.lineWidth=1; c.beginPath(); c.moveTo(sx+7,Yt); c.lineTo(sx+7,Yb); c.stroke();
    const pr=Lf.q.length?Math.min(1,(Lf.c+taktPhase())/LIFT_SPEED[Lf.lvl]):0, cy=Yb-14-(Yb-Yt-18)*pr;
    c.fillStyle=Lf.q.length>=2?"#B8432F":"#FBF8F2"; c.beginPath(); c.roundRect(sx+1,cy,12,14,2); c.fill();
    if(Lf.q.length){ c.fillStyle="#1B1A17"; c.font="800 8px Archivo, system-ui, sans-serif"; c.textAlign="center"; c.fillText(Lf.q.length,sx+7,cy+10); }
    // Weiche oben am Aufzug: zwei Abzweige, der zuletzt benutzte leuchtet
    { const up=W.floors[f+1], w=up.weiche, ly=floorTop(f+1)+BAND_Y, py=floorTop(f+1)+DURCH_Y, ax=d===1?sx-2:sx+16, bx=d===1?sx-12:sx+26;
      const frisch=w&&S.t-w.t<1.2;
      for(const [band,yy] of [["oben",ly],["unten",py]]){ const an=w&&w.band===band;
        c.strokeStyle=an?(frisch?"#F2B441":"rgba(242,180,65,.55)"):"rgba(255,255,255,.18)"; c.lineWidth=an&&frisch?3:2; c.lineCap="round";
        c.beginPath(); c.moveTo(ax,ly+6); c.quadraticCurveTo(bx,ly+6,bx,yy); c.stroke(); } }
    hits.push({x:sx-18,y:Yt,w:50,h:Yb-Yt,act:()=>openLift(f)}); }
  // Zum Schluss der Ring auf die klemmende Stelle, damit er über allem liegt
  if(melderZiel){
    if(melderZiel.art==="aufzug") melderRing(c,liftRect(melderZiel.f));
    else if(melderZiel.art==="annahme") melderRing(c,doorRect(melderZiel.f)); }
}
function renderHand(){
  const canSew=S.lager.leder>0&&S.lager.gummi>0;
  $("hand").innerHTML = S.factory ? "" : `<div class="hand"><button id="sew" ${canSew?"":"disabled style='opacity:.4'"}${TX.sew_i_style_width}${S.hand/6*100}%"></i></div><span>${canSew?TX.six_stitches_one_pair:TX.out_of_material_build}</span></div></div>`;
  if($("sew")) $("sew").onclick=()=>{ sew(); renderHand(); hud(); };
}
function renderTower(){ renderHand(); }
