// Kapitel 3: die Skyline von Nova Harbor. Seitenansicht wie der Turm, nur breit und zum Wischen.
/* ================= Kapitel 3: Skyline zeichnen ================= */
const k3cv=$("k3c"), k3ctx=k3cv&&k3cv.getContext?k3cv.getContext("2d"):null;
let K3S=0.5, K3DPR=1, k3V=0, k3Fahrt=null, k3Zug=false, k3ZugEnde=0;
let k3Bilder={}, k3BildKey="";

function k3Groesse(){ if(!k3cv) return; const w=k3cv.clientWidth||360, h=Math.round(Math.min(Math.max(innerHeight*0.56,340),540));
  K3DPR=Math.min(2,window.devicePixelRatio||1); K3S=h/K3_HH;
  if(k3cv.width!==Math.round(w*K3DPR)||k3cv.height!==Math.round(h*K3DPR)){ k3cv.style.height=h+"px"; k3cv.width=Math.round(w*K3DPR); k3cv.height=Math.round(h*K3DPR); } }
const k3Sicht=()=>(k3cv&&k3cv.clientWidth||360)/K3S;
function k3Kamera(x){ if(S&&S.k3) S.k3.cam=Math.max(0,Math.min(K3_WW-k3Sicht(),x)); }
// Eine Kamerafahrt, zum Beispiel beim Ankommen: vom Goldhorn Tower bis zum Hafen
function k3Fahre(nach,dauer){ k3Fahrt={von:S.k3.cam, nach, t0:performance.now(), dauer:dauer*1000}; }

// Tag und Nacht: ein ganzer Tag dauert fünf Minuten. Beim Ankommen ist später Nachmittag.
const K3_TAG=300;
const k3Phase=()=>(((S.t-(S.k3?S.k3.t0:0))/K3_TAG)+0.18)%1;
const k3Dunkel=()=>(1-Math.cos(k3Phase()*Math.PI*2))/2;                        // 0 Mittag, 1 Mitternacht
const k3Licht=()=>Math.max(0,Math.min(1,(k3Dunkel()-0.38)/0.3));               // wie viele Fenster brennen
function k3Mix(a,b,t){ const p=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)), A=p(a), B=p(b);
  return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join(""); }
function k3Himmel(){ const n=k3Dunkel();
  const tag=["#86B4D6","#E8E1D0"], abend=["#3E4B80","#F0A35E"], nacht=["#0D1430","#29325A"];
  return n<0.5 ? [k3Mix(tag[0],abend[0],n*2),k3Mix(tag[1],abend[1],n*2)] : [k3Mix(abend[0],nacht[0],(n-0.5)*2),k3Mix(abend[1],nacht[1],(n-0.5)*2)]; }
const k3Zahl=id=>{ let h=0; for(const ch of id) h=(h*31+ch.charCodeAt(0))%9973; return h; };

// Hintergrund: zwei Reihen Silhouetten, die beim Wischen langsamer wandern
const K3_FERNE=[0.22,0.48].map((p,L)=>{ const a=[]; let x=-200; const bis=K3_WW*p+1600;
  while(x<bis){ const w=40+hsh(Math.round(x),L,7)*70, h=(L?110:170)+hsh(Math.round(x),L,9)*(L?300:360);
    a.push({x,w,h,spitze:hsh(Math.round(x),L,11)>0.82}); x+=w+4+hsh(Math.round(x),L,13)*18; } return {p,a}; });
const K3_WOLKEN=Array.from({length:7},(_,i)=>({x:i*420+hsh(i,1,3)*200, y:60+hsh(i,2,3)*230, s:0.7+hsh(i,3,3)*0.8}));

// Ein Fensterraster. Im Tagbild dunkel, im Lichtbild nur die beleuchteten.
function k3Fenster(c,m,b,x0,y0,spalten,reihen,dx,dy,fw,fh,dunkel,warm){ const id=k3Zahl(b.id);
  for(let r=0;r<reihen;r++) for(let s=0;s<spalten;s++){ const an=hsh(s,r,id)>0.42;
    if(m==="tag"){ c.fillStyle=dunkel; c.fillRect(x0+s*dx,y0+r*dy,fw,fh); }
    else if(an){ c.fillStyle=warm||(hsh(s,r,id+5)>0.8?"#CFE6FF":"#FFD58A"); c.fillRect(x0+s*dx,y0+r*dy,fw,fh); } } }
function k3Tank(c,x,y){ c.fillStyle="#3B2C22"; c.fillRect(x+3,y-10,2,12); c.fillRect(x+19,y-10,2,12);
  c.fillStyle="#6B4A2F"; c.fillRect(x,y-30,24,22); c.fillStyle="#4E3524"; c.beginPath(); c.moveTo(x-2,y-30); c.lineTo(x+12,y-42); c.lineTo(x+26,y-30); c.fill();
  c.fillStyle="rgba(0,0,0,.18)"; for(let i=0;i<4;i++) c.fillRect(x,y-27+i*6,24,1.5); }
const K3_TON={container:["#8DB8B0","#3F6E68"], laut:["#9DB4D6","#41557A"], bloomhaus:["#EBC0D2","#9A5D7C"]};

// Die Baustile. Ursprung oben links am Dach, Breite b.w, Höhe b.h, darüber ist Platz für Spitzen.
function k3Stil(c,b,m){ const w=b.w, h=b.h, tag=m==="tag";
  if(b.stil==="lager"){
    if(tag){ c.fillStyle="#8E4B36"; c.fillRect(0,18,w,h-18);
      c.fillStyle="rgba(0,0,0,.12)"; for(let y=26;y<h;y+=9) c.fillRect(0,y,w,1.4);
      const z=Math.max(2,Math.round(w/45)), zb=w/z;
      for(let i=0;i<z;i++){ c.fillStyle="#6B3828"; c.beginPath(); c.moveTo(i*zb,18); c.lineTo(i*zb+zb*0.72,0); c.lineTo(i*zb+zb*0.72,18); c.fill();
        c.fillStyle="#9DB2BC"; c.beginPath(); c.moveTo(i*zb+zb*0.72,0); c.lineTo(i*zb+zb,18); c.lineTo(i*zb+zb*0.72,18); c.fill(); }
      c.fillStyle="#3B2A22"; c.fillRect(w*0.12,h-46,w*0.3,46); c.fillRect(w*0.56,h-46,w*0.3,46);
      c.fillStyle="rgba(255,255,255,.12)"; for(let y=h-42;y<h;y+=7){ c.fillRect(w*0.12,y,w*0.3,1.2); c.fillRect(w*0.56,y,w*0.3,1.2); } }
    k3Fenster(c,m,b,10,30,Math.floor((w-14)/22),Math.max(1,Math.floor((h-90)/24)),22,24,12,12,"#2C2A2E"); return; }
  if(b.stil==="backstein"||b.stil==="brown"){ const br=b.stil==="brown";
    if(tag){ c.fillStyle=br?"#6E4430":"#9A5440"; c.fillRect(0,0,w,h);
      c.fillStyle=br?"#A47A5C":"#7C4231"; c.fillRect(-3,0,w+6,9); if(br) for(let y=60;y<h-30;y+=70) c.fillRect(0,y,w,3);
      if(br){ c.fillStyle="#5A3726"; for(let i=0;i<5;i++) c.fillRect(w/2-14-i*3,h-6-i*5,28+i*6,5); }
      k3Tank(c,w*0.66,0); }
    const sp=Math.max(2,Math.floor((w-12)/20)), rh=br?30:26, rr=Math.floor((h-(br?60:40))/rh), x0=(w-(sp-1)*20-11)/2;
    if(tag&&br){ c.fillStyle="#E7DAC4"; for(let r=0;r<rr;r++) for(let s=0;s<sp;s++) c.fillRect(x0+s*20-2,18+r*rh-2,15,21); }
    k3Fenster(c,m,b,x0,18,sp,rr,20,rh,11,17,"#2B2830"); return; }
  if(b.stil==="altbau"){
    if(tag){ c.fillStyle="#D8CBB0"; c.fillRect(0,0,w,h); c.fillStyle="#BFAE90"; c.fillRect(0,h-34,w,34); c.fillRect(-4,0,w+8,12); c.fillRect(-2,40,w+4,4);
      c.fillStyle="#A8977A"; for(let x=6;x<w;x+=18) c.fillRect(x,h-30,2,30); }
    const zt=b.typ==="zeitung", oben=zt?Math.min(w*0.22,26)*2+40:52, sp=Math.max(2,Math.floor((w-12)/18)), x0=(w-(sp-1)*18-10)/2;
    k3Fenster(c,m,b,x0,oben,sp,Math.floor((h-oben-44)/24),18,24,10,15,"#39404C");
    if(zt){ const r=Math.min(w*0.22,26), cx=w/2, cy=22+r;
      if(tag){ c.fillStyle="#2F2B27"; c.beginPath(); c.arc(cx,cy,r+3,0,7); c.fill(); c.fillStyle="#F4EEDF"; c.beginPath(); c.arc(cx,cy,r,0,7); c.fill();
        c.strokeStyle="#2F2B27"; c.lineWidth=2.5; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx-r*0.5,cy-r*0.35); c.moveTo(cx,cy); c.lineTo(cx+r*0.15,cy-r*0.75); c.stroke(); }
      else { c.fillStyle="rgba(255,236,180,.85)"; c.beginPath(); c.arc(cx,cy,r,0,7); c.fill(); } }
    return; }
  if(b.stil==="beton"){
    if(b.typ==="parkhaus"){
      if(tag){ c.fillStyle="#8F8D86"; c.fillRect(0,0,w,h); }
      for(let y=14;y<h-12;y+=26){ if(tag){ c.fillStyle="#34322F"; c.fillRect(4,y,w-8,13);
          for(let x=8;x<w-20;x+=22){ if(hsh(x,y,k3Zahl(b.id))>0.45){ c.fillStyle=["#B8432F","#2E6FE4","#E8E1D0","#1F9E6E","#F2B441"][Math.floor(hsh(x,y,3)*5)]; c.fillRect(x,y+5,15,7); } } }
        else { c.fillStyle="rgba(205,226,255,.55)"; c.fillRect(4,y,w-8,3); } }
      if(tag){ c.fillStyle="#2E6FE4"; c.fillRect(-6,10,20,22); c.fillStyle="#fff"; c.font="800 17px Archivo, sans-serif"; c.textAlign="center"; c.fillText("P",4,28); }
      return; }
    if(tag){ c.fillStyle="#7C7A74"; c.fillRect(0,0,w,h); c.fillStyle="#9C9A93"; for(let x=0;x<w;x+=14) c.fillRect(x,0,4,h); c.fillRect(-4,0,w+8,10); }
    k3Fenster(c,m,b,6,18,Math.floor((w-6)/14),Math.floor((h-30)/16),14,16,8,11,"#2E3A44"); return; }
  if(b.stil==="glas"){ const ton=K3_TON[b.id]||["#7FA6C0","#3F6079"];
    if(tag){ const g=c.createLinearGradient(0,0,0,h); g.addColorStop(0,ton[0]); g.addColorStop(1,ton[1]); c.fillStyle=g; c.fillRect(0,0,w,h);
      c.fillStyle="rgba(255,255,255,.17)"; for(let y=0;y<h;y+=14) c.fillRect(0,y,w,1); for(let x=0;x<w;x+=18) c.fillRect(x,0,1,h);
      c.fillStyle="rgba(255,255,255,.14)"; c.beginPath(); c.moveTo(w*0.15,0); c.lineTo(w*0.55,0); c.lineTo(w*0.05,h*0.5); c.lineTo(0,h*0.5); c.lineTo(0,h*0.2); c.fill();
      c.fillStyle="#2E3A44"; c.fillRect(w*0.3,-14,w*0.4,14); c.fillRect(w/2-1,-60,2,48); }
    k3Fenster(c,m,b,3,3,Math.floor(w/18),Math.floor(h/14),18,14,15,11,"rgba(0,0,0,0)"); return; }
  if(b.stil==="neon"){
    if(tag){ c.fillStyle="#2C2838"; c.fillRect(0,0,w,h); c.fillStyle="#3B3550"; c.fillRect(-3,0,w+6,8); }
    k3Fenster(c,m,b,8,26,Math.floor((w-10)/16),Math.floor((h-40)/20),16,20,9,12,"#4A4060",hsh(b.x,1,1)>0.5?"#F07AC0":"#7EE2F0"); return; }
  if(b.stil==="tech"){
    if(tag){ c.fillStyle="#1F2B38"; c.fillRect(0,0,w,h); c.fillStyle="rgba(255,255,255,.08)"; for(let y=0;y<h;y+=12) c.fillRect(0,y,w,1);
      c.fillStyle="#2E3A44"; c.fillRect(w*0.2,-24,w*0.6,24); c.fillRect(w/2-2,-120,4,96); }
    k3Fenster(c,m,b,4,h*0.45,Math.floor((w-4)/12),Math.floor(h*0.52/12),12,12,8,7,"#2A3A4C","#9FD8FF"); return; }
  if(b.stil==="klassik"){
    if(tag){ c.fillStyle="#6B6458"; c.fillRect(6,h*0.28,w-12,h*0.62);
      c.fillStyle="#E9E1D0"; c.beginPath(); c.moveTo(-4,h*0.2); c.lineTo(w/2,0); c.lineTo(w+4,h*0.2); c.fill(); c.fillRect(-4,h*0.2,w+8,h*0.1);
      const n=Math.max(4,Math.round(w/24)); for(let i=0;i<n;i++){ const x=8+i*(w-24)/(n-1); c.fillStyle="#F1EADC"; c.fillRect(x,h*0.3,9,h*0.6); c.fillStyle="rgba(0,0,0,.15)"; c.fillRect(x+6,h*0.3,3,h*0.6); }
      c.fillStyle="#D9D0BE"; for(let i=0;i<3;i++) c.fillRect(-2-i*4,h*0.9+i*(h*0.033),w+4+i*8,h*0.034); }
    else { c.fillStyle="rgba(255,214,140,.7)"; c.fillRect(10,h*0.35,w-20,h*0.5); }
    return; }
  if(b.stil==="artdeco"||b.stil==="goldhorn"){ const gh=b.stil==="goldhorn";
    const tiers=gh?[[1,0.5],[0.8,0.22],[0.6,0.12],[0.42,0.07]]:[[1,0.56],[0.76,0.26],[0.52,0.12]];
    const fass=gh?"#34302B":"#CFC5B0", kante=gh?"#C9A227":"#B3A78E";
    let y=h; const stufen=[];
    for(const [bw,bh] of tiers){ const ww=w*bw, hh=h*bh, x=(w-ww)/2; y-=hh; stufen.push({x,y,ww,hh});
      if(tag){ c.fillStyle=fass; c.fillRect(x,y,ww,hh); c.fillStyle=kante; c.fillRect(x-2,y,ww+4,4);
        c.fillStyle=gh?"rgba(201,162,39,.25)":"rgba(0,0,0,.12)"; for(let px=x+5;px<x+ww-3;px+=12) c.fillRect(px,y+4,2,hh-4); } }
    for(const s of stufen) k3Fenster(c,m,b,s.x+8,s.y+10,Math.max(1,Math.floor((s.ww-12)/12)),Math.max(1,Math.floor((s.hh-14)/18)),12,18,5,11,gh?"#1E1B18":"#454A52",gh?"#F5CF6A":null);
    const top=stufen[stufen.length-1], kw=top.ww*0.8, kx=w/2;
    if(tag){ c.fillStyle=gh?"#C9A227":"#E8E0CF";
      for(let i=0;i<4;i++){ const r=kw/2-i*kw/9; c.beginPath(); c.arc(kx,top.y,r,Math.PI,0); c.fill(); c.fillStyle=i%2?(gh?"#C9A227":"#E8E0CF"):(gh?"#2A2622":"#9C9078"); }
      c.fillStyle=gh?"#E6C35A":"#BDB29A"; c.beginPath(); c.moveTo(kx-5,top.y-kw/2+4); c.lineTo(kx,top.y-kw/2-(gh?150:110)); c.lineTo(kx+5,top.y-kw/2+4); c.fill(); }
    else if(gh){ c.fillStyle="rgba(245,207,106,.85)"; for(let i=0;i<3;i++){ c.beginPath(); c.arc(kx,top.y,kw/2-i*kw/6,Math.PI,0); c.lineTo(kx+kw/2-i*kw/6-6,top.y); c.arc(kx,top.y,kw/2-i*kw/6-6,0,Math.PI,true); c.fill(); } }
    return; }
}
const K3_RAND=12, k3Oben=b=>(b.stil==="artdeco"||b.stil==="goldhorn"||b.stil==="tech")?190:80;
// Jedes Gebäude einmal vorzeichnen, im Tag- und im Lichtbild. Neu nur, wenn sich die Größe ändert.
function k3Bild(b){ const key=K3S.toFixed(4)+"|"+K3DPR; if(k3BildKey!==key){ k3BildKey=key; k3Bilder={}; }
  if(k3Bilder[b.id]) return k3Bilder[b.id]; const o=k3Oben(b), f=K3S*K3DPR, mk=m=>{ const cv=document.createElement("canvas");
    cv.width=Math.ceil((b.w+K3_RAND*2)*f); cv.height=Math.ceil((b.h+o)*f); const c=cv.getContext("2d"); c.setTransform(f,0,0,f,K3_RAND*f,o*f); k3Stil(c,b,m); return cv; };
  const tag=mk("tag"), schatten=document.createElement("canvas"); schatten.width=tag.width; schatten.height=tag.height;
  { const c=schatten.getContext("2d"); c.drawImage(tag,0,0); c.globalCompositeOperation="source-atop"; c.fillStyle="#0A0E28"; c.fillRect(0,0,tag.width,tag.height); }
  return k3Bilder[b.id]={tag, schatten, licht:mk("licht"), o}; }

// Die Logos. Der Spieler hat den Sneaker aus dem Kinderzimmer.
function k3Logo(c,o,cx,cy,r){ const R=o==="du"?K3_DU:K3_RIVALEN[o]; if(!R) return;
  c.fillStyle=R.farbe; c.beginPath(); c.arc(cx,cy,r,0,7); c.fill(); c.strokeStyle="rgba(255,255,255,.75)"; c.lineWidth=r*0.1; c.stroke();
  c.fillStyle=R.schrift; c.strokeStyle=R.schrift;
  if(o==="du"){ c.save(); c.translate(cx+r*0.05,cy+r*0.05); c.scale(r/17,r/17); c.fillStyle="#fff"; c.fill(SHOE_LOW); c.restore(); }
  else if(o==="goldhorn"){ c.font=`800 ${r*1.25}px Georgia, serif`; c.textAlign="center"; c.textBaseline="middle"; c.fillText("G",cx,cy+r*0.06); c.textBaseline="alphabetic"; }
  else if(o==="blink"){ c.beginPath(); c.moveTo(cx+r*0.15,cy-r*0.7); c.lineTo(cx-r*0.4,cy+r*0.08); c.lineTo(cx-r*0.02,cy+r*0.08); c.lineTo(cx-r*0.15,cy+r*0.7); c.lineTo(cx+r*0.4,cy-r*0.1); c.lineTo(cx+r*0.02,cy-r*0.1); c.closePath(); c.fill(); }
  else if(o==="bloom"){ c.fillStyle="#fff"; for(let i=0;i<5;i++){ const a=i*Math.PI*0.4-Math.PI/2; c.beginPath(); c.arc(cx+Math.cos(a)*r*0.38,cy+Math.sin(a)*r*0.38,r*0.28,0,7); c.fill(); }
    c.fillStyle="#F2B441"; c.beginPath(); c.arc(cx,cy,r*0.22,0,7); c.fill(); }
  else if(o==="hammer"){ c.save(); c.translate(cx,cy); c.rotate(-0.6); c.fillStyle="#fff"; c.fillRect(-r*0.09,-r*0.25,r*0.18,r*0.85); c.fillRect(-r*0.45,-r*0.55,r*0.9,r*0.32); c.restore(); }
}
function k3LogoSvg(o,px){ const R=o==="du"?K3_DU:K3_RIVALEN[o]; if(!R) return ""; const s=R.schrift; let g="";
  if(o==="du") g=`<path transform="translate(1 1) scale(1.06)" fill="#fff" d="M-12 3c0-4 2-9 6-10l5 3c3 1 7 2 10 4 2 1 3 2 3 3v1h-24z"/>`;
  else if(o==="goldhorn") g=`<text x="0" y="8" text-anchor="middle" font-family="Georgia,serif" font-weight="800" font-size="23" fill="${s}">G</text>`;
  else if(o==="blink") g=`<path fill="${s}" d="M3-13-7 1.5h6.6L-3 13 7-2h-6.6z"/>`;
  else if(o==="bloom") g=[0,1,2,3,4].map(i=>{ const a=i*Math.PI*0.4-Math.PI/2; return `<circle cx="${(Math.cos(a)*7).toFixed(1)}" cy="${(Math.sin(a)*7).toFixed(1)}" r="5" fill="#fff"/>`; }).join("")+`<circle r="4" fill="#F2B441"/>`;
  else if(o==="hammer") g=`<g transform="rotate(-34)" fill="#fff"><rect x="-1.7" y="-4.5" width="3.4" height="16"/><rect x="-8" y="-10" width="16" height="6"/></g>`;
  return `<svg width="${px}" height="${px}" viewBox="-20 -20 40 40" style="flex:none;display:block"><circle r="18.5" fill="${R.farbe}" stroke="rgba(255,255,255,.8)" stroke-width="1.5"/>${g}</svg>`; }
// Wem ein Gebäude gehört, sieht man oben drauf: Schild auf dem Dach, bei Türmen eine Plakette an der Fassade
function k3Markierung(c,b,o){ const top=K3_GY-b.h, gross=b.h>=400, G=S.k3.g[b.id];
  if(!o){ const bw=Math.min(b.w*0.9,150), x=b.x+(b.w-bw)/2, y=top+16;
    c.fillStyle="#FBF8F2"; c.fillRect(x,y,bw,26); c.strokeStyle="#B8432F"; c.lineWidth=2.5; c.strokeRect(x+2,y+2,bw-4,22);
    c.font="800 10px Archivo, sans-serif"; const fs=Math.min(13,10*(bw-12)/c.measureText(TX.k3_zu_verkaufen).width);
    c.fillStyle="#B8432F"; c.font=`800 ${fs}px Archivo, sans-serif`; c.textAlign="center"; c.fillText(TX.k3_zu_verkaufen,x+bw/2,y+13+fs*0.38); return; }
  const tank=b.stil==="backstein"||b.stil==="brown", stufen=b.stil==="artdeco"||b.stil==="goldhorn";
  const cx=gross?b.x+b.w/2:b.x+(tank?b.w*0.3:b.w/2), y=top-(b.stil==="klassik"?8:4), cy=gross?top+b.h*0.08+26:y-33;
  // Frisch gekauft: das Logo springt aufs Dach, ein Ring in seiner Farbe läuft nach außen
  const p=G.kaufT!==undefined?(animT-G.kaufT)/1.4:2;
  if(p>=0&&p<1){ c.strokeStyle=k3Farbe(o); c.globalAlpha=1-p; c.lineWidth=6; c.beginPath(); c.arc(cx,cy,30+p*150,0,7); c.stroke(); c.globalAlpha=1; }
  const sk=p<0||p>=1?1:p<0.25?p/0.25*1.5:1+0.5*(1-(p-0.25)/0.75)*Math.cos((p-0.25)*14);
  c.save(); c.translate(cx,cy); c.scale(sk,sk); c.translate(-cx,-cy);
  if(gross){ if(!stufen){ c.fillStyle=k3Farbe(o); c.fillRect(b.x+b.w*0.02,top-4,b.w*0.96,5); } k3Logo(c,o,cx,cy,24); }
  else { const pw=56, ph=38;
    c.fillStyle="#2F2B27"; c.fillRect(cx-pw*0.35,y-14,3,14); c.fillRect(cx+pw*0.35-3,y-14,3,14);
    c.fillStyle=k3Farbe(o); c.fillRect(cx-pw/2,y-14-ph,pw,ph); c.fillStyle="rgba(0,0,0,.18)"; c.fillRect(cx-pw/2,y-18,pw,4);
    k3Logo(c,o,cx,cy,13); }
  c.restore();
  // Skandal: ein roter Aufkleber quer über dem Logo
  if(k3Skandal(o)){ c.save(); c.translate(cx,cy); c.rotate(-0.25); c.fillStyle="#D9372B"; c.fillRect(-46,-11,92,22);
    c.fillStyle="#fff"; c.font="800 14px Archivo, sans-serif"; c.textAlign="center"; c.fillText(TX.k3_skandal.toUpperCase(),0,5); c.restore(); } }

// Lebendiges, das nicht ins vorgezeichnete Bild passt: Neon, Bildschirme, Blinklichter
function k3Leben(c,b,t,licht){ const top=K3_GY-b.h;
  if(b.id==="palast"){ const an=Math.sin(t*3)>-0.6||licht<0.2; c.save(); c.translate(b.x+b.w/2,top+70); c.scale(2.6,2.6);
    c.strokeStyle=an?"#FF5FA8":"#5A3A50"; c.lineWidth=1.4; c.stroke(SHOE_LOW); c.restore();
    c.fillStyle=an?"#FF5FA8":"#5A3A50"; c.fillRect(b.x+10,top+112,b.w-20,4); }
  if(b.id==="nudel"){ for(let i=0;i<6;i++){ c.fillStyle=(Math.floor(t*2)+i)%3===0?"#FFE45E":"#E4572E"; c.fillRect(b.x-8,top+30+i*18,8,14); } }
  if(b.stil==="tech"){ const sx=b.x+8, sy=top+18, sw=b.w-16, sh=b.h*0.36, R=k3Farbe(S.k3.g[b.id].o);
    c.fillStyle="#0B1118"; c.fillRect(sx,sy,sw,sh);
    for(let i=0;i<6;i++){ const yy=sy+((i*sh/6+t*22)%sh); c.fillStyle=i%2?R:"rgba(255,255,255,.25)"; c.fillRect(sx+4,yy,sw-8,3); }
    if(Math.sin(t*4)>0) { c.fillStyle="#FF4A3D"; c.fillRect(b.x+b.w/2-3,top-124,6,6); } }
  // Spitze des Goldhorn Tower: oberste Stufe bei 9 % der Höhe, darüber der Fächer und 150 Spitze
  if(b.stil==="goldhorn"&&Math.sin(t*2.4)>0.2){ c.fillStyle="#FF4A3D"; c.beginPath(); c.arc(b.x+b.w/2,top+b.h*0.09-b.w*0.42*0.4-150,5,0,7); c.fill(); }
}

function drawK3(dt){ if(!k3ctx||!S||!S.k3) return; k3Groesse();
  const c=k3ctx, f=K3S*K3DPR, sw=k3Sicht(), t=animT, licht=k3Licht(), dunkel=k3Dunkel();
  // Kamera: Fahrt, sonst Schwung nach dem Wischen
  if(k3Fahrt){ const p=Math.min(1,(performance.now()-k3Fahrt.t0)/k3Fahrt.dauer), e=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
    k3Kamera(k3Fahrt.von+(k3Fahrt.nach-k3Fahrt.von)*e); if(p>=1) k3Fahrt=null; }
  else if(!k3Zug&&Math.abs(k3V)>4){ k3Kamera(S.k3.cam+k3V*dt); k3V*=Math.pow(0.03,dt); }
  else if(!k3Zug) k3Kamera(S.k3.cam);
  const cam=S.k3.cam;
  // Himmel
  const [h0,h1]=k3Himmel(); c.setTransform(f,0,0,f,0,0);
  const g=c.createLinearGradient(0,0,0,K3_GY); g.addColorStop(0,h0); g.addColorStop(1,h1); c.fillStyle=g; c.fillRect(0,0,sw,K3_HH);
  if(licht>0){ c.fillStyle=`rgba(255,255,255,${0.8*licht})`; for(let i=0;i<70;i++){ const x=(hsh(i,1,77)*K3_WW*0.12-cam*0.05+K3_WW)%(sw+40); c.fillRect(x,hsh(i,2,77)*520,1.6,1.6); } }
  { const ph=k3Phase(), sonne=ph<0.3||ph>0.75, a=sonne?((ph+0.25)%1)/0.55:(ph-0.3)/0.45, x=sw*(0.1+a*0.8), y=380-Math.sin(Math.min(1,Math.max(0,a))*Math.PI)*300;
    c.fillStyle=sonne?"rgba(255,226,150,.9)":"rgba(240,236,220,.9)"; c.beginPath(); c.arc(x,y,sonne?34:22,0,7); c.fill(); }
  for(const w of K3_WOLKEN){ const x=((w.x+t*6-cam*0.12)%(K3_WW*0.5+400)+K3_WW*0.5+400)%(K3_WW*0.5+400)-200;
    if(x>sw+200) continue; c.fillStyle=`rgba(255,255,255,${0.55-0.4*dunkel})`;
    for(let k=0;k<4;k++){ c.beginPath(); c.ellipse(x+k*34*w.s,w.y-(k%2)*12*w.s,46*w.s,20*w.s,0,0,7); c.fill(); } }
  // Ferne Skyline
  K3_FERNE.forEach((L,i)=>{ const col=k3Mix(h1,"#262B40",i?0.6:0.35); c.fillStyle=col;
    for(const s of L.a){ const x=s.x-cam*L.p; if(x+s.w<0||x>sw) continue; c.fillRect(x,K3_GY-s.h,s.w,s.h);
      if(s.spitze){ c.beginPath(); c.moveTo(x+s.w*0.4,K3_GY-s.h); c.lineTo(x+s.w/2,K3_GY-s.h-60); c.lineTo(x+s.w*0.6,K3_GY-s.h); c.fill(); }
      if(licht>0){ c.fillStyle=`rgba(255,215,140,${0.55*licht})`; for(let k=0;k<6;k++) if(hsh(Math.round(s.x),k,i)>0.5) c.fillRect(x+4+hsh(Math.round(s.x),k,i+3)*(s.w-8),K3_GY-s.h+10+hsh(Math.round(s.x),k,i+5)*(s.h-20),3,3); c.fillStyle=col; } } });
  // Ab hier Weltkoordinaten mit der Kamera
  c.setTransform(f,0,0,f,-cam*f,0);
  // Fluss und Brücke zur Insel
  const wasser=k3Mix("#5D8BA3","#16233A",dunkel);
  c.fillStyle=wasser; c.fillRect(K3_FLUSS.x0,K3_GY-20,K3_FLUSS.x1-K3_FLUSS.x0,K3_HH);
  c.fillStyle="#3A3632"; for(const x of [K3_FLUSS.x0+26,K3_FLUSS.x1-26]){ c.fillRect(x-6,K3_GY-250,12,250); c.fillRect(x-14,K3_GY-252,28,8); }
  c.strokeStyle="#3A3632"; c.lineWidth=3; c.beginPath(); c.moveTo(K3_FLUSS.x0-80,K3_GY-40); c.quadraticCurveTo(K3_FLUSS.x0+26,K3_GY-250,K3_FLUSS.x0+26,K3_GY-250);
  c.quadraticCurveTo((K3_FLUSS.x0+K3_FLUSS.x1)/2,K3_GY-60,K3_FLUSS.x1-26,K3_GY-250); c.quadraticCurveTo(K3_FLUSS.x1-26,K3_GY-250,K3_FLUSS.x1+80,K3_GY-40); c.stroke();
  c.lineWidth=1; for(let x=K3_FLUSS.x0+34;x<K3_FLUSS.x1-30;x+=10){ const m=(K3_FLUSS.x0+K3_FLUSS.x1)/2, d=(x-m)/((K3_FLUSS.x1-K3_FLUSS.x0)/2-26); c.beginPath(); c.moveTo(x,K3_GY-60-190*d*d); c.lineTo(x,K3_GY); c.stroke(); }
  // Gebäude
  for(const b of K3_GEB){ if(b.x+b.w+K3_RAND<cam||b.x-K3_RAND>cam+sw) continue; const B=k3Bild(b), dx=b.x-K3_RAND, dy=K3_GY-b.h-B.o;
    c.drawImage(B.tag,dx,dy,b.w+K3_RAND*2,b.h+B.o);
    if(dunkel>0.1){ c.globalAlpha=0.42*Math.min(1,(dunkel-0.1)/0.6); c.drawImage(B.schatten,dx,dy,b.w+K3_RAND*2,b.h+B.o); c.globalAlpha=1; }
    if(licht>0){ c.globalAlpha=licht; c.drawImage(B.licht,dx,dy,b.w+K3_RAND*2,b.h+B.o); c.globalAlpha=1; }
    k3Leben(c,b,t,licht); k3Markierung(c,b,S.k3.g[b.id].o);
    if(S.k3.sel===b.id&&$("sheet").innerHTML){ c.strokeStyle=`rgba(255,255,255,${0.6+0.4*Math.sin(t*6)})`; c.lineWidth=4; c.setLineDash([10,8]); c.strokeRect(b.x-6,K3_GY-b.h-60,b.w+12,b.h+60); c.setLineDash([]); } }
  // Zahlen über den Dächern: steigen auf und verblassen
  k3Pops=k3Pops.filter(q=>animT-q.t0<1.8&&animT>=q.t0-0.1);
  c.textAlign="center"; c.font="800 24px Archivo, sans-serif"; c.lineJoin="round";
  for(const q of k3Pops){ const a=(animT-q.t0)/1.8; if(q.x<cam-100||q.x>cam+sw+100) continue; c.globalAlpha=Math.min(1,(1-a)*1.6);
    c.lineWidth=5; c.strokeStyle="rgba(20,18,14,.75)"; c.strokeText(q.text,q.x,q.y-a*70); c.fillStyle=q.farbe; c.fillText(q.text,q.x,q.y-a*70); }
  c.globalAlpha=1;
  // Kran am Hafen
  c.strokeStyle=k3Mix("#C9862E","#3A2A18",dunkel); c.lineWidth=5; c.beginPath(); c.moveTo(600,K3_GY); c.lineTo(600,K3_GY-300); c.lineTo(450,K3_GY-300); c.moveTo(600,K3_GY-300); c.lineTo(640,K3_GY-300); c.stroke();
  c.lineWidth=1.5; c.beginPath(); c.moveTo(600,K3_GY-340); c.lineTo(450,K3_GY-300); c.moveTo(600,K3_GY-340); c.lineTo(640,K3_GY-300); c.moveTo(600,K3_GY-300); c.lineTo(600,K3_GY-340);
  const hk=500+Math.sin(t*0.3)*40; c.moveTo(hk,K3_GY-300); c.lineTo(hk,K3_GY-150-Math.sin(t*0.5)*30); c.stroke();
  c.fillStyle="#B8432F"; c.fillRect(hk-22,K3_GY-150-Math.sin(t*0.5)*30,44,22);
  // Bürgersteig, Straße, Vordergrund
  c.fillStyle=k3Mix("#B9B0A0","#3A3832",dunkel); c.fillRect(cam-10,K3_GY-8,sw+20,8);
  c.fillStyle=k3Mix("#45413C","#1C1B19",dunkel); c.fillRect(cam-10,K3_GY,sw+20,46);
  c.fillStyle="rgba(255,255,255,.45)"; for(let x=Math.floor(cam/60)*60;x<cam+sw;x+=60) c.fillRect(x,K3_GY+22,28,2);
  c.fillStyle=k3Mix("#8C857A","#24231F",dunkel); c.fillRect(cam-10,K3_GY+46,sw+20,K3_HH);
  c.fillStyle=wasser; c.fillRect(-10,K3_GY+52,620,K3_HH); c.fillRect(K3_FLUSS.x0,K3_GY+46,K3_FLUSS.x1-K3_FLUSS.x0,K3_HH);
  c.fillStyle="rgba(255,255,255,.25)"; for(let i=0;i<24;i++){ const x=(i*53+t*12)%610, y=K3_GY+64+(i%5)*16; c.fillRect(x,y,18,1.5); }
  { const bx=60+((t*14)%500); c.fillStyle="#B8432F"; c.fillRect(bx,K3_GY+76,58,14); c.fillStyle="#FBF8F2"; c.fillRect(bx+12,K3_GY+62,24,14); c.fillStyle="#2F2B27"; c.fillRect(bx+28,K3_GY+52,6,12); }
  c.fillStyle="#3A3632"; for(let x=10;x<610;x+=40) c.fillRect(x,K3_GY+46,5,18);
  // Laternen
  for(let x=Math.floor(cam/130)*130+40;x<cam+sw;x+=130){ if(x>K3_FLUSS.x0&&x<K3_FLUSS.x1) continue; c.fillStyle="#2F2B27"; c.fillRect(x,K3_GY-70,3,62); c.fillRect(x,K3_GY-70,14,3);
    if(licht>0){ c.fillStyle=`rgba(255,220,140,${0.28*licht})`; c.beginPath(); c.moveTo(x+12,K3_GY-66); c.lineTo(x-14,K3_GY); c.lineTo(x+38,K3_GY); c.fill(); c.fillStyle="#FFE3A0"; c.fillRect(x+10,K3_GY-67,6,4); } }
  // Autos und Taxis, zwei Spuren
  for(let i=0;i<18;i++){ const rechts=i%2===0, v=55+hsh(i,4,5)*55, span=K3_WW+300;
    const x=rechts?((i*337+t*v)%span)-150:span-150-((i*337+t*v)%span), y=rechts?K3_GY+30:K3_GY+8;
    if(x<cam-60||x>cam+sw+60) continue; const taxi=hsh(i,5,5)<0.35, col=taxi?"#F2B441":["#2E6FE4","#E8E1D0","#1B1A17","#B8432F","#6C7A89"][i%5];
    c.fillStyle=col; c.fillRect(x-17,y-8,34,10); c.fillRect(x-9,y-14,18,7); c.fillStyle="#1B1A17"; c.fillRect(x-12,y+1,7,4); c.fillRect(x+5,y+1,7,4);
    if(taxi){ c.fillStyle="#1B1A17"; c.fillRect(x-3,y-17,6,3); }
    if(licht>0){ c.fillStyle=`rgba(255,240,180,${0.5*licht})`; const fx=rechts?x+17:x-17; c.beginPath(); c.moveTo(fx,y-5); c.lineTo(fx+(rechts?40:-40),y-12); c.lineTo(fx+(rechts?40:-40),y+4); c.fill(); } }
  // Viertelnamen im Vordergrund
  c.font="800 22px Archivo, sans-serif"; c.textAlign="center"; c.fillStyle="rgba(255,255,255,.7)";
  for(const v of K3_VIERTEL){ const x=(v.x0+v.x1)/2; if(x<cam-200||x>cam+sw+200) continue; c.fillText(v.n.toUpperCase(),x,K3_HH-36); }
  k3KarteZeichnen();
}

// Wohin ein Tipp zeigt. Oben gehört das Schild mit dazu.
function k3Treffer(wx,wy){ for(const b of K3_GEB){ if(wx>=b.x-4&&wx<=b.x+b.w+4&&wy>=K3_GY-b.h-70&&wy<=K3_GY) return b; } return null; }
