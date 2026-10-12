// Kapitel 3: der Verkauf von allem und die Ankunft in Nova Harbor
/* ================= Kapitel 3: Übergang ================= */
// Was Sohle und die Manufaktur zusammen bringen: zwei Stunden Umsatz, mindestens 250.000.
// Einmal festgelegt, damit die Zahl nicht wandert, während man überlegt.
const k3Verkauf=()=>festPreis("k3verkauf",()=>Math.max(250000,Math.round(umsatzProMin()*120/10000)*10000));
const k3Budget=()=>k3Verkauf()+Math.max(0,Math.round(S.money));
const k3AngebotOffen=()=>!!(S&&S.meisterFertig&&!S.k3);

// Eine Zahl, die hochzählt
function k3Zaehle(el,bis,ms){ if(!el) return; const t0=performance.now();
  const tick=()=>{ if(!el.isConnected) return; const p=Math.min(1,(performance.now()-t0)/ms), e=1-Math.pow(1-p,3);
    el.textContent=k3Fmt(bis*e); if(p<1) setTimeout(tick,30); }; tick(); }

function k3Angebot(){ if(!k3AngebotOffen()) return; paused=true; setPauseUI(); $("sheet").innerHTML=""; reopen=null;
  const v=k3Verkauf(), kasse=Math.max(0,Math.round(S.money)), z=v+kasse;
  $("overlay").innerHTML=`<div class="over"><div class="box"><h2>${TX.k3_angebot_titel}</h2><p>${TX.k3_angebot_text}</p>
    <div class="k3zeile"><span>${TX.k3_verkaufspreis}</span><b>${k3Fmt(v)}</b></div><div class="k3zeile"><span>${TX.k3_deine_kasse}</span><b>${k3Fmt(kasse)}</b></div>
    <p class="k3gross" id="k3az">0</p><p style="font-size:13px">${TX.k3_angebot_klein}</p>
    <button id="k3ja">${TX.k3_verkaufen}</button><button id="k3nein" style="background:none;color:var(--soft);border:1px solid var(--line);margin-top:8px">${TX.k3_noch_nicht}</button></div></div>`;
  k3Zaehle($("k3az"),z,1600);
  $("k3ja").onclick=()=>k3Uebergang(z);
  $("k3nein").onclick=()=>{ $("overlay").innerHTML=""; paused=false; setPauseUI(); }; }

// Schwarz, drei Zeilen, die große Zahl, Kapiteltitel. Ein Tipp überspringt alles.
function k3Uebergang(z){ $("overlay").innerHTML=""; paused=true; setPauseUI();
  const el=document.createElement("div"); el.id="k3intro"; document.body.appendChild(el);
  el.innerHTML=`<div class="z">${TX.k3_ue_sohle}</div><div class="z">${TX.k3_ue_manufaktur}</div><div class="z">${TX.k3_ue_boutiquen}</div>
    <div class="z zahl" id="k3iz">0</div><div class="z klein">${TX.k3_ue_budget}</div><div class="weiter">${TX.k3_ue_tippen}</div>`;
  const zz=[...el.querySelectorAll(".z")]; let fertig=false; const uhren=[];
  const ende=()=>{ if(fertig) return; fertig=true; uhren.forEach(clearTimeout); k3Start(z); el.classList.remove("an"); setTimeout(()=>el.remove(),900); k3Ankunft(); };
  const plan=[[60,()=>el.classList.add("an")],[900,()=>zz[0].classList.add("an")],[2000,()=>zz[1].classList.add("an")],[3100,()=>zz[2].classList.add("an")],
    [4300,()=>{ zz[3].classList.add("an"); k3Zaehle($("k3iz"),z,1800); }],[6300,()=>zz[4].classList.add("an")],
    [8200,()=>{ zz.forEach(x=>x.classList.remove("an")); }],
    [9000,()=>{ el.innerHTML=`<div class="z kap an">${TX.k3_kapitel}</div><div class="z titel an">${TX.k3_titel}</div><div class="weiter">${TX.k3_ue_tippen}</div>`; }],
    [11600,ende]];
  plan.forEach(([ms,fn])=>uhren.push(setTimeout(()=>{ if(!fertig) fn(); },ms)));
  el.onclick=ende; }

function k3Start(z){ if(S.k3) return;
  S.k3alt={money:Math.round(S.money), t:Math.round(S.t)};
  S.k3={t0:S.t, budget:z, cam:K3_WW, g:{}, seen:{}};
  K3_GEB.forEach(b=>S.k3.g[b.id]={o:b.o, wert:Math.max(1000,Math.round(z*b.f/1000)*1000)});
  S.money=z; $("sheet").innerHTML=""; reopen=null;
  k3Modus(true); k3Kamera(K3_WW); saveGame(); }

// Ankunft: die Kamera fährt vom Goldhorn Tower über die ganze Stadt bis zum Hafen, dann ein kurzes Wort
function k3Ankunft(){ paused=false; setPauseUI(); k3Kamera(K3_WW); k3Fahre(0,6.5);
  setTimeout(()=>{ if(!S.k3||S.k3.seen.ankunft) return; S.k3.seen.ankunft=true;
    $("overlay").innerHTML=`<div class="over k3an"><div class="box"><h2>${TX.k3_ankunft_titel}</h2><p>${TX.k3_ankunft_text(k3Fmt(S.k3.budget),k3Fmt(S.k3.g.goldhorn.wert))}</p>
      <p>${TX.k3_ankunft_rivalen}</p><button id="k3los">${TX.k3_los}</button></div></div>`;
    $("k3los").onclick=()=>{ $("overlay").innerHTML=""; }; },6900); }

// Testsprung: Kapitel 1 und 2 überspringen, direkt zum Angebot. Nur mit ?test in der Adresse.
function testSprungKapitel3(){ if(S.k3) return; if(!S.uhr){ testSprungKapitel2(); kaufeGrundstueck(GRUNDSTUECKE[0]); }
  S.meisterFertig=true; S.exitBezahlt=true; $("sheet").innerHTML=""; reopen=null; $("overlay").innerHTML=""; k3Angebot(); }
