// Kapitel 3: Kopfzeile, Übersichtskarte, Rivalen, Fenster für Gebäude und Rivalen
/* ================= Kapitel 3: Anzeige ================= */
const k3Fmt=n=>Math.round(n).toLocaleString(TX.en_us);
const k3Gesamt=()=>K3_GEB.reduce((a,b)=>a+S.k3.g[b.id].wert,0);
const k3Anteil=o=>{ const g=k3Gesamt(); return g?K3_GEB.filter(b=>S.k3.g[b.id].o===o).reduce((a,b)=>a+S.k3.g[b.id].wert,0)/g:0; };
const k3Prozent=o=>{ const p=k3Anteil(o)*100; return p>0&&p<1?"<1":String(Math.round(p)); };
const k3Name=o=>o==="du"?TX.k3_du_firma:o?K3_RIVALEN[o].firma:TX.k3_frei;

// Kapitel 3 an oder aus: alte Ansichten weg, Skyline her
function k3Modus(an){ document.body.classList.toggle("k3",!!an); $("k3View").style.display=an?"":"none";
  if(an){ tutOn=false; tutQ=[]; $("tutRing").style.display="none"; $("tutBox").style.display="none"; k3Groesse(); k3Kamera(S.k3.cam); } }

function k3Hud(){
  setzeWennNeu($("money"),k3Fmt(S.money)+`<u>${TX.k3_kapital}</u>`); $("money").style.color=S.money<0?"var(--bad)":"";
  setzeWennNeu($("pairs"),k3Prozent("du")+`%<u>${TX.k3_skyline}</u>`);
  setzeWennNeu($("ammo"),K3_GEB.filter(b=>S.k3.g[b.id].o==="du").length+`<u>${TX.k3_gebaeude}</u>`);
  setzeWennNeu($("tip"),TX.k3_tipp_start);
  setzeWennNeu($("k3rivalen"),Object.keys(K3_RIVALEN).map(k=>{ const R=K3_RIVALEN[k];
    return `<button data-rv="${k}">${k3LogoSvg(k,26)}<b>${R.n.split(" ").slice(-1)[0]}</b><span>${k3Prozent(k)}%</span></button>`; }).join(""));
  document.querySelectorAll("#k3rivalen [data-rv]").forEach(b=>b.onclick=()=>k3RivalSheet(b.dataset.rv));
}

// Übersicht unter der Skyline: alle Gebäude als Balken in der Farbe ihres Besitzers, dazu der sichtbare Ausschnitt
const k3kv=$("k3karte"), k3kctx=k3kv&&k3kv.getContext?k3kv.getContext("2d"):null;
function k3KarteZeichnen(){ if(!k3kctx) return; const w=k3kv.clientWidth||360, h=k3kv.clientHeight||44, d=K3DPR;
  if(k3kv.width!==Math.round(w*d)||k3kv.height!==Math.round(h*d)){ k3kv.width=Math.round(w*d); k3kv.height=Math.round(h*d); }
  const c=k3kctx, sx=w/K3_WW; c.setTransform(d,0,0,d,0,0);
  c.fillStyle="#2B2925"; c.fillRect(0,0,w,h); c.fillStyle="#3E6A86"; c.fillRect(K3_FLUSS.x0*sx,h-8,(K3_FLUSS.x1-K3_FLUSS.x0)*sx,8); c.fillRect(0,h-4,610*sx,4);
  for(const b of K3_GEB){ const o=S.k3.g[b.id].o, bh=Math.max(5,b.h/800*(h-12));
    c.fillStyle=k3Farbe(o); c.fillRect(b.x*sx,h-6-bh,Math.max(2,b.w*sx-1),bh);
    if(!o){ c.fillStyle="#2B2925"; c.fillRect(b.x*sx+1.5,h-6-bh+1.5,Math.max(0,b.w*sx-4),bh-3); } }
  const cam=S.k3.cam; c.strokeStyle="#FBF8F2"; c.lineWidth=1.5; c.strokeRect(cam*sx+0.75,1,k3Sicht()*sx-1.5,h-2); }

function k3Eingaben(){ if(!k3cv) return;
  let d=null;
  k3cv.addEventListener("pointerdown",e=>{ if(!S||!S.k3) return; d={x:e.clientX,cam:S.k3.cam,id:e.pointerId,lx:e.clientX,lt:performance.now()}; k3V=0; k3Fahrt=null; });
  k3cv.addEventListener("pointermove",e=>{ if(!d||e.pointerId!==d.id) return;
    if(!k3Zug&&Math.abs(e.clientX-d.x)>10){ k3Zug=true; d.x=e.clientX; d.cam=S.k3.cam; try{ k3cv.setPointerCapture(e.pointerId); }catch(_){} }
    if(!k3Zug) return; k3Kamera(d.cam-(e.clientX-d.x)/K3S);
    const now=performance.now(), dt=Math.max(8,now-d.lt); k3V=-(e.clientX-d.lx)/K3S/dt*1000; d.lx=e.clientX; d.lt=now; });
  const ende=e=>{ if(!d||e.pointerId!==d.id) return; if(k3Zug){ k3ZugEnde=performance.now(); if(performance.now()-d.lt>80) k3V=0; } k3Zug=false; d=null; };
  k3cv.addEventListener("pointerup",ende); k3cv.addEventListener("pointercancel",ende);
  tippe(k3cv,(cx,cy)=>{ if(!S||!S.k3||performance.now()-k3ZugEnde<250) return;
    const r=k3cv.getBoundingClientRect(), b=k3Treffer(S.k3.cam+(cx-r.left)/K3S,(cy-r.top)/K3S); if(b) k3GebSheet(b.id); });
  // Auf der Übersicht tippen oder ziehen springt dorthin
  let kz=false; const spring=e=>{ const r=k3kv.getBoundingClientRect(); k3Fahrt=null; k3V=0; k3Kamera((e.clientX-r.left)/r.width*K3_WW-k3Sicht()/2); };
  k3kv.addEventListener("pointerdown",e=>{ if(!S||!S.k3) return; kz=true; try{ k3kv.setPointerCapture(e.pointerId); }catch(_){} spring(e); });
  k3kv.addEventListener("pointermove",e=>{ if(kz) spring(e); });
  k3kv.addEventListener("pointerup",()=>kz=false); k3kv.addEventListener("pointercancel",()=>kz=false);
}

function k3GebSheet(id){ reopen=()=>k3GebSheet(id); const b=k3Geb(id), G=S.k3.g[id], T=K3_TYPEN[b.typ], o=G.o, v=K3_VIERTEL.find(x=>x.id===b.v);
  S.k3.sel=id;
  const wem = o ? `<div class="k3wem">${k3LogoSvg(o,36)}<div><b>${o==="du"?TX.k3_du_firma:K3_RIVALEN[o].n}</b><span>${o==="du"?TX.k3_gehoert_dir:K3_RIVALEN[o].firma}</span></div></div>`
    : `<div class="k3wem frei"><i>%</i><div><b>${TX.k3_zu_verkaufen_lang}</b><span>${TX.k3_frei_d}</span></div></div>`;
  openSheet(`<h3>${b.n}</h3><p style="margin-top:-4px">${v.n} · ${T.n}${T.waffe?` · <b style="color:#7B5BC0">${TX.k3_waffe}</b>`:""}</p>${wem}
    <p>${T.d}</p><p><b>${TX.k3_wert}</b> ${k3Fmt(G.wert)}</p><p style="font-size:12.5px;color:var(--soft)">${TX.k3_kaufen_bald}</p>`); }

function k3RivalSheet(k){ reopen=()=>k3RivalSheet(k); const R=K3_RIVALEN[k], seine=K3_GEB.filter(b=>S.k3.g[b.id].o===k);
  openSheet(`<div class="k3wem">${k3LogoSvg(k,36)}<div><b>${R.n}</b><span>${R.firma}</span></div></div>
    <p>${R.d}</p><p><b>${k3Prozent(k)}%</b> ${TX.k3_der_skyline} · ${seine.length} ${TX.k3_gebaeude_klein}</p>
    ${seine.map(b=>`<div class="opt" data-zg="${b.id}"><div><b>${b.n}</b><span>${K3_TYPEN[b.typ].n}</span></div><em>${k3Fmt(S.k3.g[b.id].wert)}</em></div>`).join("")}`,
    ()=>document.querySelectorAll("[data-zg]").forEach(el=>el.onclick=()=>{ const b=k3Geb(el.dataset.zg); $("sheet").innerHTML=""; reopen=null; k3Fahre(b.x+b.w/2-k3Sicht()/2,0.9); })); }
