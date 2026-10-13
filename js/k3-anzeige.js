// Kapitel 3: Kopfzeile, Übersichtskarte, Rivalen, Fenster für Gebäude und Rivalen
/* ================= Kapitel 3: Anzeige ================= */
const k3Fmt=n=>Math.round(n).toLocaleString(TX.en_us);
const k3Dez=(x,n)=>x.toLocaleString(TX.en_us,{minimumFractionDigits:n,maximumFractionDigits:n});
const k3Gesamt=()=>K3_GEB.reduce((a,b)=>a+S.k3.g[b.id].wert,0);
const k3Anteil=o=>{ const g=k3Gesamt(); return g?K3_GEB.filter(b=>S.k3.g[b.id].o===o).reduce((a,b)=>a+S.k3.g[b.id].wert,0)/g:0; };
const k3Prozent=o=>{ const p=k3Anteil(o)*100; return p>0&&p<1?"<1":String(Math.round(p)); };
const k3Name=o=>o==="du"?TX.k3_du_firma:o?K3_RIVALEN[o].firma:TX.k3_frei;

// Ältere Spielstände nachziehen. Die Agentur am Hafen war früher eine Kanzlei von Hammer.
function k3Migrieren(){ const K=S.k3; if((K.mig||0)>=1) return; K.mig=1;
  const G=K.g.kai; if(G&&G.o==="hammer"){ G.o=null; G.wert=Math.max(1000,Math.round(K.budget*0.7/1000)*1000); } }
// Kapitel 3 an oder aus: alte Ansichten weg, Skyline her
function k3Modus(an){ document.body.classList.toggle("k3",!!an); $("k3View").style.display=an?"":"none";
  if(an){ k3Migrieren(); tutOn=false; tutQ=[]; $("tutRing").style.display="none"; $("tutBox").style.display="none"; k3Groesse(); k3Kamera(S.k3.cam); } }

function k3Hud(){ releaseDeferred();
  setzeWennNeu($("money"),k3Fmt(S.money)+`<u>${TX.k3_kapital}</u>`); $("money").style.color=S.money<0?"var(--bad)":"";
  setzeWennNeu($("pairs"),k3Prozent("du")+`%<u>${TX.k3_skyline}</u>`);
  setzeWennNeu($("ammo"),k3Meine().length+`<u>${TX.k3_gebaeude}</u>`);
  k3Tipp(); k3Status(); k3Aktionen(); k3Karten();
  setzeWennNeu($("k3rivalen"),Object.keys(K3_RIVALEN).map(k=>{ const R=K3_RIVALEN[k];
    return `<button data-rv="${k}">${k3LogoSvg(k,26)}<b>${R.n.split(" ").slice(-1)[0]}</b><span>${k3Prozent(k)}%</span></button>`; }).join(""));
  document.querySelectorAll("#k3rivalen [data-rv]").forEach(b=>b.onclick=()=>k3RivalSheet(b.dataset.rv));
}
// Der Melder oben: was gerade dran ist, mit "Zeig mir" auf das günstigste Haus, das du dir leisten kannst
function k3Tipp(){ const ziel=K3_GEB.filter(b=>k3Kaufbar(b)&&k3Leistbar(b)).sort((a,b)=>k3Preis(a)-k3Preis(b))[0];
  const h = !k3Meine().length ? TX.k3_tipp_start
    : k3Hype()<25 ? TX.k3_tipp_hype
    : ziel ? TX.k3_tipp_ziel(ziel.n)
    : TX.k3_tipp_sparen;
  const html=tipKurz(h,false)+(ziel&&k3Meine().length?`<div class="knopfzeile"><button id="k3zeig">${TX.k3_zeig}</button></div>`:"");
  if($("tip").dataset.h!==html){ $("tip").dataset.h=html; $("tip").innerHTML=html;
    const z=$("k3zeig"); if(z) z.onclick=e=>{ e.stopPropagation(); const b=K3_GEB.filter(b=>k3Kaufbar(b)&&k3Leistbar(b)).sort((a,b)=>k3Preis(a)-k3Preis(b))[0]; if(!b) return;
      k3Fahre(b.x+b.w/2-k3Sicht()/2,0.8); setTimeout(()=>k3GebSheet(b.id),850); }; } }
// Hype und Einnahmen über der Skyline. Einmal gebaut, danach ändern sich nur Breite und Zahlen.
function k3Status(){ const el=$("k3status");
  if(!el.dataset.da){ el.dataset.da="1"; el.innerHTML=`<div class="k3h"><b>HYPE</b><div class="bar"><i id="k3hb"></i></div><span id="k3hx"></span></div><div class="k3e"><span id="k3ein"></span><span id="k3sch"></span></div>`;
    el.onclick=k3HypeSheet; }
  const h=k3Hype(); $("k3hb").style.width=h+"%"; $("k3hb").style.background=h<25?"var(--bad)":h<60?"#F2B441":"#1F9E6E";
  const x="×"+k3Dez(k3HypeFaktor(),1); if($("k3hx").textContent!==x) $("k3hx").textContent=x;
  const e=TX.k3_pro_min(k3Fmt(k3ProMin())); if($("k3ein").textContent!==e) $("k3ein").textContent=e;
  const sc=S.k3.schuld>0?TX.k3_schuld(k3Fmt(S.k3.schuld)):""; if($("k3sch").textContent!==sc) $("k3sch").textContent=sc; }
// Knöpfe für die Waffen. Neu gebaut nur, wenn eine dazukommt oder bereit wird, sonst nur die Sekunden.
function k3Aktionen(){ const el=$("k3aktionen"), a=[];
  const nw=k3Anz("werbung"), nz=k3Anz("zeitung");
  if(nw){ const cd=k3Cooldown(S.k3.kampagneT,K3_KAMPAGNE_CD,nw); a.push({k:"kamp", n:TX.k3_akt_kampagne, s:cd?TX.k3_noch_s(cd):TX.k3_akt_kampagne_s, ok:!cd}); }
  if(nz){ const cd=k3Cooldown(S.k3.zeitungT,K3_SCHLAGZEILE_CD,nz); a.push({k:"zeitung", n:TX.k3_akt_schlagzeile, s:cd?TX.k3_noch_s(cd):TX.k3_akt_schlagzeile_s, ok:!cd}); }
  if(k3Anz("bank")) a.push({k:"kredit", n:TX.k3_akt_kredit, s:TX.k3_frei_betrag(k3Fmt(k3KreditFrei())), ok:true});
  if(k3Anz("kanzlei")) a.push({k:"anwalt", n:TX.k3_akt_anwaelte, s:"×"+k3Dez(k3Aufschlag(),2), ok:true});
  const key=a.map(x=>x.k+(x.ok?1:0)).join("|")||"leer";
  if(el.dataset.k!==key){ el.dataset.k=key;
    el.innerHTML=a.length?a.map(x=>`<button data-ak="${x.k}" class="${x.ok?"bereit":""}"><b>${x.n}</b><span></span></button>`).join(""):`<p>${TX.k3_akt_leer}</p>`;
    el.querySelectorAll("[data-ak]").forEach(b=>b.onclick=()=>{ const k=b.dataset.ak;
      if(k==="kamp") k3Kampagne(); else if(k==="zeitung") k3ZeitungSheet(); else if(k==="kredit") k3KreditSheet(); else k3AnwaltSheet(); hud(); }); }
  el.querySelectorAll("[data-ak] span").forEach((sp,i)=>{ if(a[i]&&sp.textContent!==a[i].s) sp.textContent=a[i].s; }); }

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
  const wem = o ? `<div class="k3wem">${k3LogoSvg(o,36)}<div><b>${o==="du"?TX.k3_du_firma:K3_RIVALEN[o].n}</b><span>${o==="du"?TX.k3_gehoert_dir:K3_RIVALEN[o].firma}${k3Skandal(o)?` · <b style="color:var(--bad)">${TX.k3_skandal}</b>`:""}</span></div></div>`
    : `<div class="k3wem frei"><i>%</i><div><b>${TX.k3_zu_verkaufen_lang}</b><span>${TX.k3_frei_d}</span></div></div>`;
  let h=`<h3>${b.n}</h3><p style="margin-top:-4px">${v.n} · ${T.n}${T.waffe?` · <b style="color:#7B5BC0">${TX.k3_waffe}</b>`:""}</p>${wem}<p>${T.d}</p>`;
  if(o==="du"){ h+=`<p><b>${TX.k3_bringt(k3Fmt(k3Rate(b)))}</b>${b.typ==="tech"&&G.aus>S.t?` · ${TX.k3_server_weg}`:""}</p>`;
    if(b.typ==="werbung"){ const cd=k3Cooldown(S.k3.kampagneT,K3_KAMPAGNE_CD,k3Anz("werbung")); h+=`<div class="opt ${cd?"off":""}" ${cd?"":`data-kamp="1"`}><div><b>${TX.k3_akt_kampagne}</b><span>${cd?TX.k3_noch_s(cd):TX.k3_akt_kampagne_s}</span></div><em></em></div>`; }
    if(b.typ==="zeitung") h+=`<div class="opt" data-zeit="1"><div><b>${TX.k3_akt_schlagzeile}</b><span>${TX.k3_akt_schlagzeile_s}</span></div><em>›</em></div>`;
    if(b.typ==="bank") h+=`<div class="opt" data-kred="1"><div><b>${TX.k3_akt_kredit}</b><span>${TX.k3_frei_betrag(k3Fmt(k3KreditFrei()))}</span></div><em>›</em></div>`;
    h+=`<div class="opt" data-verk="1"><div><b>${TX.k3_verkaufen_80}</b><span>${TX.k3_verkaufen_d}</span></div><em>${k3Fmt(G.wert*0.8)}</em></div>`; }
  else if(b.typ==="turm") h+=`<p><b>${TX.k3_wert}</b> ${k3Fmt(G.wert)}</p><p style="color:var(--bad);font-weight:700">${TX.k3_turm_nicht}</p>`;
  else if(S.k3.auktion&&S.k3.auktion.id===id){ const A=S.k3.auktion, p=k3Schritt(A.preis), ok=A.fuehrt!=="du"&&S.money+k3KreditFrei()>=p;
    h+=`<p><b>${TX.k3_wert}</b> ${k3Fmt(G.wert)}</p><p style="color:var(--bad);font-weight:700">${TX.k3_auktion_laeuft}</p>
      <div class="opt ${ok?"":"off"}" ${ok?`data-biet="1"`:""}><div><b>${A.fuehrt==="du"?TX.k3_k_fuehrst_du(k3Fmt(A.preis)):TX.k3_k_bieten(k3Fmt(p))}</b><span></span></div><em>${k3Fmt(p)}</em></div>`; }
  else { const p=k3Preis(b), ok=k3Leistbar(b)&&!S.k3.auktion, kredit=Math.max(0,p-Math.max(0,Math.round(S.money)));
    const d=[]; if(o) d.push(TX.k3_aufschlag_d(k3Dez(k3Aufschlag(),2))); if(k3Skandal(o)) d.push(TX.k3_skandal_billig);
    if(o){ const name=K3_RIVALEN[o].n.split(" ").slice(-1)[0]; d.push(k3RivalMax(o,b,"wehr")>=k3Schritt(p)?TX.k3_wehrt_sich(name,k3Fmt(Math.round(k3RivalMax(o,b,"wehr")/10000)*10000)):TX.k3_wehrt_nicht(name)); }
    if(S.k3.auktion) d.push(TX.k3_erst_auktion);
    if(ok&&kredit>0) d.push(TX.k3_mit_kredit(k3Fmt(kredit))); if(!ok) d.push(TX.k3_fehlt(k3Fmt(p-Math.max(0,S.money)-k3KreditFrei())));
    h+=`<p><b>${TX.k3_wert}</b> ${k3Fmt(G.wert)}</p><div class="opt ${ok?"":"off"}" ${ok?`data-kauf="1"`:""}><div><b>${o?TX.k3_uebernehmen:TX.k3_kaufen}</b><span>${d.join(" ")}</span></div><em>${k3Fmt(p)}</em></div>`; }
  openSheet(h,()=>{ const q=s=>document.querySelector(s);
    if(q("[data-kauf]")) q("[data-kauf]").onclick=()=>{ if(k3Uebernehmen(id)){ $("sheet").innerHTML=""; reopen=null; hud(); } };
    if(q("[data-biet]")) q("[data-biet]").onclick=()=>{ k3Bieten(); $("sheet").innerHTML=""; reopen=null; hud(); };
    if(q("[data-verk]")) q("[data-verk]").onclick=()=>{ k3Verkaufen(id); $("sheet").innerHTML=""; reopen=null; hud(); };
    if(q("[data-kamp]")) q("[data-kamp]").onclick=()=>{ k3Kampagne(); $("sheet").innerHTML=""; reopen=null; hud(); };
    if(q("[data-zeit]")) q("[data-zeit]").onclick=()=>k3ZeitungSheet();
    if(q("[data-kred]")) q("[data-kred]").onclick=()=>k3KreditSheet(); }); }

function k3ZeitungSheet(){ reopen=k3ZeitungSheet; const cd=k3Cooldown(S.k3.zeitungT,K3_SCHLAGZEILE_CD,k3Anz("zeitung"));
  openSheet(`<h3>${TX.k3_akt_schlagzeile}</h3><p>${TX.k3_schlagzeile_d}</p>${cd?`<p style="color:var(--bad);font-weight:700">${TX.k3_noch_s(cd)}</p>`:""}
    ${Object.keys(K3_RIVALEN).map(k=>{ const R=K3_RIVALEN[k], n=K3_GEB.filter(b=>S.k3.g[b.id].o===k).length;
      return `<div class="opt ${cd||!n?"off":""}" ${cd||!n?"":`data-sz="${k}"`} style="justify-content:flex-start">${k3LogoSvg(k,30)}<div style="flex:1"><b>${R.n}</b><span>${n} ${TX.k3_gebaeude_klein}${k3Skandal(k)?" · "+TX.k3_skandal:""}</span></div></div>`; }).join("")}`,
    ()=>document.querySelectorAll("[data-sz]").forEach(el=>el.onclick=()=>{ k3Schlagzeile(el.dataset.sz); $("sheet").innerHTML=""; reopen=null; hud(); })); }
function k3KreditSheet(){ reopen=k3KreditSheet; const sch=S.k3.schuld||0, ok=sch>0&&S.money>=1;
  openSheet(`<h3>${TX.k3_akt_kredit}</h3><p>${TX.k3_kredit_d}</p>
    <div class="k3zeile"><span>${TX.k3_kredit_rahmen}</span><b>${k3Fmt(k3KreditRahmen())}</b></div><div class="k3zeile"><span>${TX.k3_kredit_schuld}</span><b>${k3Fmt(sch)}</b></div><div class="k3zeile"><span>${TX.k3_kredit_frei}</span><b>${k3Fmt(k3KreditFrei())}</b></div>
    ${sch>0?`<div class="opt ${ok?"":"off"}" ${ok?`data-tilg="1"`:""} style="margin-top:10px"><div><b>${TX.k3_tilgen}</b><span>${TX.k3_tilgen_d}</span></div><em>${k3Fmt(Math.min(sch,Math.max(0,S.money)))}</em></div>`:""}`,
    ()=>{ const t=document.querySelector("[data-tilg]"); if(t) t.onclick=()=>{ k3Tilgen(); k3KreditSheet(); hud(); }; }); }
function k3AnwaltSheet(){ reopen=k3AnwaltSheet; openSheet(`<h3>${TX.k3_akt_anwaelte}</h3><p>${TX.k3_anwalt_d(k3Anz("kanzlei"),k3Dez(k3Aufschlag(),2))}</p>`); }
function k3HypeSheet(){ reopen=k3HypeSheet; openSheet(`<h3>Hype</h3><p>${TX.k3_hype_d(Math.round(k3Hype()),k3Dez(k3HypeFaktor(),1))}</p>`); }

function k3RivalSheet(k){ reopen=()=>k3RivalSheet(k); const R=K3_RIVALEN[k], seine=K3_GEB.filter(b=>S.k3.g[b.id].o===k);
  openSheet(`<div class="k3wem">${k3LogoSvg(k,36)}<div><b>${R.n}</b><span>${R.firma}</span></div></div>
    <p>${R.d}</p><p><b>${k3Prozent(k)}%</b> ${TX.k3_der_skyline} · ${seine.length} ${TX.k3_gebaeude_klein}</p>
    ${seine.map(b=>`<div class="opt" data-zg="${b.id}"><div><b>${b.n}</b><span>${K3_TYPEN[b.typ].n}</span></div><em>${k3Fmt(S.k3.g[b.id].wert)}</em></div>`).join("")}`,
    ()=>document.querySelectorAll("[data-zg]").forEach(el=>el.onclick=()=>{ const b=k3Geb(el.dataset.zg); $("sheet").innerHTML=""; reopen=null; k3Fahre(b.x+b.w/2-k3Sicht()/2,0.9); })); }

// Karten unten am Rand: Bieterkampf und Angriff. Die Knöpfe bleiben stehen, nur Zahlen und Sekunden ändern sich.
function k3Karten(){ const el=$("k3karten"), K=S.k3, A=K.auktion, X=K.angriff, teile=[], werte=[];
  if(X){ const b=k3Geb(X.id), R=K3_RIVALEN[X.rival], c=k3AbwehrPreis(b), ok=S.money>=c, an=k3AnwaltBereit();
    teile.push(`<div class="k3karte bad" data-geh="${X.id}">${k3LogoSvg(X.rival,34)}<div class="txt"><b>${TX.k3_k_angriff(R.n.split(" ").slice(-1)[0],b.n)}</b><span data-w="${werte.length}"></span></div>
      <div class="kn"><button data-abw="1" ${ok?"":"disabled"}>${TX.k3_k_abwehren(k3Fmt(c))}</button>${k3Anz("kanzlei")?`<button data-anw="1" ${an?"":"disabled"}>${TX.k3_akt_anwaelte}</button>`:""}</div></div>`);
    werte.push(TX.k3_k_sonst_weg(Math.max(0,Math.ceil(X.ende-S.t)))); }
  if(A){ const b=k3Geb(A.id), R=K3_RIVALEN[A.rival], p=k3Schritt(A.preis), ok=A.fuehrt!=="du"&&S.money+k3KreditFrei()>=p;
    teile.push(`<div class="k3karte" data-geh="${A.id}">${k3LogoSvg(A.rival,34)}<div class="txt"><b>${TX.k3_k_bieterkampf(b.n)}</b><span data-w="${werte.length}"></span></div>
      <div class="kn"><button data-bt="1" ${ok?"":"disabled"}>${A.fuehrt==="du"?TX.k3_k_du_vorn:ok?TX.k3_k_bieten(k3Fmt(p)):TX.k3_k_zu_teuer}</button></div></div>`);
    werte.push((A.fuehrt==="du"?TX.k3_k_fuehrst_du(k3Fmt(A.preis)):TX.k3_k_fuehrt(R.n.split(" ").slice(-1)[0],k3Fmt(A.preis)))+" · "+TX.k3_k_sek(Math.max(0,Math.ceil(A.ende-S.t)))); }
  const html=teile.join("");
  if(el.dataset.h!==html){ el.dataset.h=html; el.innerHTML=html;
    const q=s=>el.querySelector(s);
    if(q("[data-abw]")) q("[data-abw]").onclick=e=>{ e.stopPropagation(); k3Abwehren(); hud(); };
    if(q("[data-anw]")) q("[data-anw]").onclick=e=>{ e.stopPropagation(); k3Anwaelte(); hud(); };
    if(q("[data-bt]")) q("[data-bt]").onclick=e=>{ e.stopPropagation(); k3Bieten(); hud(); };
    el.querySelectorAll("[data-geh]").forEach(k=>k.onclick=()=>{ const b=k3Geb(k.dataset.geh); k3Fahre(b.x+b.w/2-k3Sicht()/2,0.7); }); }
  el.querySelectorAll("[data-w]").forEach(sp=>{ const t=werte[+sp.dataset.w]; if(sp.textContent!==t) sp.textContent=t; }); }
