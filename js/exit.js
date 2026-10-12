// Fashion Week, Angebot der Investorin, gesperrtes Gebiet oben in der Stadt
/* ================= Fashion Week und Exit ================= */

function fwStart(){ S.fw={state:"live",t0:S.t,got:{runner:0,court:0,hightop:0}}; $("sheet").innerHTML=""; switchView("stadt");
  once("fwgo","Fashion Week",`${TX.you_have_five_minutes}`); }
function fwStep(){ const F=S.fw; if(!F||F.state!=="live") return;
  for(const m in FW_NEED){ while(F.got[m]<FW_NEED[m]){ const k=(S.fin[m+"_s"]||0)>0?m+"_s":S.fin[m]>0?m:null; if(!k) break; S.fin[k]--; F.got[m]++; } }
  if(Object.keys(FW_NEED).every(m=>F.got[m]>=FW_NEED[m])){ F.state="won"; exitOffer(); }
  else if(S.t-F.t0>FW_TIME){ F.state="lost"; F.retry=S.t+120; S.lastExplain=-99;
    once("fwlost"+Math.round(S.t),"Nicht geschafft",`${TX.fashion_week_is_over}`); } }
function valuation(){ const mins=Math.max(10,(S.t-(S.wakeT||0))/60); const perMinRev=S.earned/Math.max(10,S.t/60);
  return Math.round((perMinRev*45 + S.floors.length*800 + S.districts.filter(d=>d.shop).length*1500)/100)*100; }
function exitOffer(){ const v=valuation(); S.offer=v; paused=true; setPauseUI();
  const conf=`<div class="confetti">${Array.from({length:40},(_,i)=>`<i style="left:${(i*29)%100}%;background:${["#E4572E","#2E6FE4","#1F9E6E","#F2B441","#7B5BC0"][i%5]};animation-delay:${(i%9)*0.1}s;animation-duration:${1.6+(i%5)*0.3}s"></i>`).join("")}</div>`;
  $("overlay").innerHTML=`<div class="over"><div class="box win">${conf}${TX.fashion_week_is_yours}${v.toLocaleString(TX.en_us)}${TX.based_on_your_revenue}${S.sold}${TX.pairs_sold}${S.floors.length}${TX.floors}${S.cleared}${TX.hideouts_cleared}${Math.round(S.t/60)}${TX.minutes_accept_not_yet}`;
  $("acc").onclick=()=>{ S.exited=true; S.exitMoney=v; S.money+=v; S.earned+=v; S.exitBezahlt=true; $("overlay").innerHTML=""; paused=false; setPauseUI();
    once("ch2","Neues Gebiet freigeschaltet",`${TX.with}${v.toLocaleString(TX.en_us)}${TX.behind_you_you_can}`); };
  $("later").onclick=()=>{ $("overlay").innerHTML=""; paused=false; setPauseUI(); };
}
function regionCard(){ const el=$("region"); if(!el||!el.dataset) return; let h;
  const zst=zoneState(); if((zst==="locked"||zst==="wait")&&!S.exited){ if(el.dataset.h!==""){ el.dataset.h=""; el.innerHTML=""; } el.onclick=null; return; }
  if(S.exited&&!S.uhr) h=`${TX.chapter_2_pick_a}`;
  else if(S.exited){
    // Der Hinweis auf den Umschalter stand hier für immer. Jetzt steht hier nur noch, was gerade dran ist.
    const M=S.mw;
    if(M&&M.phase==="bau"){ const rest=Math.ceil(MEISTER_BAUZEIT-(S.t-M.bauT));
      h=`${TX.the_masterpiece}${rest}${TX.seconds_left_the_watch}`; }
    else if(M&&M.phase==="sammeln"){ const da=Object.keys(MEISTER_TEILE).filter(k=>M.teile[k]).length;
      h=`${TX.the_masterpiece_2}${da}${TX.of_4_ingredients_workshop}${mwStufe()}${TX.of_3_tap_to}`; }
    else if(!M&&RES2().tourbillon&&werkstattKaufbar())
      h=`${TX.workshop_for_one_off_2}`;
    else if(k3AngebotOffen()) h=`${TX.k3_karte_angebot}`;
    else h="";
  }
  else if(S.fw&&S.fw.state==="live"){ const left=Math.max(0,FW_TIME-(S.t-S.fw.t0)), mm=Math.floor(left/60), ss=String(Math.floor(left%60)).padStart(2,"0");
    h=`${TX.fashion_week}${mm}:${ss}${TX.left}${Object.keys(FW_NEED).map(m=>`<div>${shoeIcon(m,18)} ${S.fw.got[m]}/${FW_NEED[m]}<i><u style="width:${Math.round(S.fw.got[m]/FW_NEED[m]*100)}%;background:${MODELS[m].c2}"></u></i></div>`).join("")}</div></div>`; }
  else if(S.fw&&S.fw.state==="won") h=`${TX.offer_from_the_investor}${S.offer.toLocaleString(TX.en_us)}${TX.tap_to_look}`;
  else if(fwOffen()&&(!S.fw||S.t>=(S.fw.retry||0))) h=`${TX.start_fashion_week_the}`;
  else if(S.fw&&S.fw.state==="lost") h=`${TX.fashion_week_next_attempt}${Math.ceil((S.fw.retry-S.t))}${TX.seconds}`;
  else { const n=TECH.filter(x=>RES()[x.k]).length;
    h=`<div class="rg"><b>${lockSvgG()}${TX.restricted_area_finish}${FW_FORSCHUNGEN}${TX.research_steps}${n}${TX.of_2}${TECH.length}${TX.then_fashion_week_opens}`; }
  if(el.dataset.h!==h){ el.dataset.h=h; el.innerHTML=h; }
  el.onclick=()=>{ if(S.exited&&!S.uhr) return grundstueckSheet();
    if(k3AngebotOffen()&&!(S.mw&&S.mw.phase!=="fertig")) return k3Angebot();
    if(S.exited&&S.uhr){ if(S.mw) return meisterSheet();
      if(RES2().tourbillon&&werkstattKaufbar()) return zeigWerkstattPlatz(); return; }
    if(S.fw&&S.fw.state==="won"&&!S.exited) exitOffer(); else if(!S.exited&&fwOffen()&&(!S.fw||(S.fw.state!=="live"&&S.t>=(S.fw.retry||0)))) fwStart(); }; }
const lockSvgG=()=>`<svg width="11" height="13" viewBox="0 0 11 13" style="vertical-align:-1px;margin-right:6px"><rect x="1" y="6" width="9" height="7" rx="1.5" fill="currentColor"/><path d="M3 6V4a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>`;

function zoneState(){ if(S.exited) return "open"; if(S.fw&&S.fw.state==="live") return "live"; if(S.fw&&S.fw.state==="won") return "offer";
  if(fwOffen()&&(!S.fw||S.t>=(S.fw.retry||0))) return "ready"; if(S.fw&&S.fw.state==="lost") return "wait"; return "locked"; }
function drawZone(c,F,t){ const w=W*T, h=TOPR()*T, st=zoneState();
  if(st==="open"){ return drawOberstadt(c,F,t,w,h); }   // freigeschaltet: richtige Stadt statt Kulisse
  // Skyline eines vornehmeren Viertels
  c.fillStyle=st==="open"?"#D9D0BF":"#BDB5A6"; c.fillRect(0,0,w,h);
  for(let k=0;k<11;k++){ const bx=k*w/11, bh=h*(0.35+hsh(k,3,1)*0.45), bw=w/11-4;
    c.fillStyle=st==="open"?"#EFE8DA":"#A69E8F"; c.fillRect(bx+2,h-bh-T*0.35,bw,bh);
    c.fillStyle=st==="open"?"#F2D38A":"#958D7F"; for(let r=0;r<4;r++) for(let q=0;q<2;q++) if(hsh(k,r,q)>0.4) c.fillRect(bx+6+q*bw*0.45,h-bh-T*0.35+8+r*12,bw*0.22,5); }
  c.fillStyle="#8E877A"; c.fillRect(0,h-T*0.35,w,T*0.35);
  if(st!=="open"){ c.fillStyle="rgba(40,36,30,.42)"; c.fillRect(0,0,w,h-T*0.35);
    c.strokeStyle="rgba(255,255,255,.08)"; c.lineWidth=10; for(let k=-4;k<14;k++){ c.beginPath(); c.moveTo(k*T,0); c.lineTo(k*T+h,h); c.stroke(); } }
  // Absperrung
  for(let k=0;k<18;k++){ c.fillStyle=k%2?"#FBF8F2":"#B8432F"; c.fillRect(k*w/18,h-T*0.42,w/18,T*0.12); }
  c.textAlign="center";
  // Die eigene Manufaktur oben im Viertel
  if(S.uhr&&S.uhr.ort){ const ox=S.uhr.ort.x*T, oy=h-T*0.42;
    c.fillStyle="rgba(0,0,0,.35)"; c.fillRect(ox-T*0.36+4,oy-T*1.0+5,T*0.72,T*1.0);
    c.fillStyle="#24231F"; c.fillRect(ox-T*0.36,oy-T*1.0,T*0.72,T*1.0);
    c.fillStyle="#C98A1B"; c.fillRect(ox-T*0.36,oy-T*1.0,T*0.72,T*0.09);
    for(let r=0;r<3;r++) for(let q=0;q<2;q++){ c.fillStyle=hsh(r,q,Math.floor(t*0.5))>0.3?"#F2D38A":"#4A4843"; c.fillRect(ox-T*0.24+q*T*0.26,oy-T*0.78+r*T*0.22,T*0.18,T*0.13); } }
  const title = st==="open"?"KAPITEL 2 · BALD": st==="ready"?"FASHION WEEK STARTEN": st==="live"?TX.fashion_week_running: st==="offer"?"ANGEBOT ANSEHEN": st==="wait"?"NEUER VERSUCH GLEICH":"GESPERRT";
  const sub = st==="locked"?`${TX.noch}${FW_FORSCHUNGEN-resFertig()}${TX.research_steps_to_go}${resFertig()}${TX.of_2}${FW_FORSCHUNGEN}`: st==="ready"?"Hier tippen": st==="open"?`Startkapital ${S.exitMoney.toLocaleString("de-DE")}`: st==="wait"?`in ${Math.ceil(S.fw.retry-S.t)} Sekunden`: "";
  if(st==="ready"||st==="offer"){ c.fillStyle="rgba(242,180,65,"+(0.55+Math.sin(t*4)*0.25)+")"; c.beginPath(); c.roundRect(w/2-T*2.4,h*0.2,T*4.8,h*0.5,10); c.fill(); }
  // Schloss
  if(st==="locked"||st==="wait"){ const lx=w/2, ly=h*0.3; c.fillStyle="#FBF8F2"; c.beginPath(); c.roundRect(lx-T*0.2,ly,T*0.4,T*0.32,4); c.fill();
    c.strokeStyle="#FBF8F2"; c.lineWidth=3; c.beginPath(); c.arc(lx,ly,T*0.13,Math.PI,0); c.stroke(); }
  c.fillStyle=(st==="ready"||st==="offer")?"#1B1A17":"#FBF8F2"; c.font=`800 ${T*0.3}px ${F}`;
  c.fillText(title,w/2,(st==="locked"||st==="wait")?h*0.3+T*0.75:h*0.42);
  if(sub){ c.font=`700 ${T*0.2}px ${F}`; c.fillText(sub,w/2,(st==="locked"||st==="wait")?h*0.3+T*1.05:h*0.42+T*0.32); }
}
function grundstueckSheet(){ reopen=grundstueckSheet;
  let h=`${TX.chapter_2_pick_a_2}`;
  for(const g of GRUNDSTUECKE){ const c=grundPreis(g), ok=S.money>=c;
    h+=`<div class="opt ${ok?"":"off"}" ${ok?`data-gr="${g.id}"`:""}><div><b>${g.n}</b><span>${g.d}</span></div><em>${c.toLocaleString("de-DE")}</em></div>`; }
  h+=`${TX.you_have}${Math.round(S.money).toLocaleString(TX.en_us)}${TX.whatever_is_left_over}`;
  openSheet(h,()=>document.querySelectorAll("[data-gr]").forEach(b=>b.onclick=()=>{ kaufeGrundstueck(GRUNDSTUECKE.find(g=>g.id===b.dataset.gr)); $("sheet").innerHTML=""; }));
}

// Die Oberstadt: dieselben Blöcke und Straßen wie unten, dazu deine Manufaktur
function drawOberstadt(c,F,t,w,h){
  c.fillStyle="#CFC6B4"; c.fillRect(0,0,w,h);
  for(let y=0;y<TOPR();y++) for(let x=0;x<W;x++){ const cx=x+0.5, cy=y+0.5;
    if(ROADS_X.some(r=>Math.abs(cx-r)<0.55) || Math.abs(cy-(TOPR()-0.4))<0.5) continue;
    const r=hsh(x,y+40), park=r<0.1;
    if(park){ c.fillStyle="#B9C79B"; c.fillRect(x*T+2,y*T+2,T-4,T-4); continue; }
    const inset=T*(0.08+hsh(x,y+40,3)*0.06), roof=["#EFE8DA","#E4DCCD","#E9E1D2"][Math.floor(hsh(x,y+40,5)*3)];
    c.fillStyle="rgba(60,50,35,.2)"; c.fillRect(x*T+inset+3,y*T+inset+4,T-inset*2,T-inset*2);
    c.fillStyle=roof; c.fillRect(x*T+inset,y*T+inset,T-inset*2,T-inset*2);
    c.fillStyle="rgba(201,138,27,.25)"; c.fillRect(x*T+inset,y*T+inset+T*0.3,T-inset*2,2); }
  c.fillStyle="#8E877A"; ROADS_X.forEach(r=>c.fillRect(r*T-T*0.34,0,T*0.68,h)); c.fillRect(0,(TOPR()-0.4)*T-T*0.3,w,T*0.6);
  c.strokeStyle="rgba(255,255,255,.5)"; c.lineWidth=1.3; c.setLineDash([7,8]);
  ROADS_X.forEach(r=>{ c.beginPath(); c.moveTo(r*T,0); c.lineTo(r*T,h); c.stroke(); });
  c.beginPath(); c.moveTo(0,(TOPR()-0.4)*T); c.lineTo(w,(TOPR()-0.4)*T); c.stroke(); c.setLineDash([]);
  // Deine Manufaktur
  if(S.uhr&&S.uhr.ort){ const ox=S.uhr.ort.x*T, oy=(S.uhr.ort.y+TOPR())*T;
    c.fillStyle="rgba(0,0,0,.35)"; c.fillRect(ox-T*0.36+4,oy-T*1.0+5,T*0.72,T*1.0);
    c.fillStyle="#24231F"; c.fillRect(ox-T*0.36,oy-T*1.0,T*0.72,T*1.0);
    c.fillStyle="#C98A1B"; c.fillRect(ox-T*0.36,oy-T*1.0,T*0.72,T*0.09);
    for(let r=0;r<3;r++) for(let q=0;q<2;q++){ c.fillStyle=hsh(r,q,Math.floor(t*0.5))>0.3?"#F2D38A":"#4A4843"; c.fillRect(ox-T*0.24+q*T*0.26,oy-T*0.78+r*T*0.22,T*0.18,T*0.13); }
    c.fillStyle="#1B1A17"; c.font=`800 ${T*0.16}px ${F}`; c.textAlign="center"; c.fillText("MANUFAKTUR",ox,oy+T*0.18); }
}
function fwSheet(){ reopen=fwSheet;
  const zeile=m=>{ const habe=(S.fin[m]||0)+(S.fin[m+"_s"]||0), will=FW_NEED[m], ok=habe>=will;
    return `<div class="opt ${ok?"":""}"><div><b>${MODELS[m].n}</b><span>${S.open[m]?(ok?TX.enough:(will-habe)+TX.still_missing):TX.not_designed_yet_costs+MODELS[m].unlock}</span></div>
      <em style="color:${ok?"var(--money)":"var(--bad)"}">${habe}${TX.of_2}${will}</em></div>`; };
  const fehlt=Object.keys(FW_NEED).filter(m=>!S.open[m]||((S.fin[m]||0)+(S.fin[m+"_s"]||0))<FW_NEED[m]);
  openSheet(`${TX.fashion_week_an_order}${Object.keys(FW_NEED).map(zeile).join("")}
    ${fehlt.length?`${TX.your_storage_isn_t}`:`${TX.your_storage_is_enough}`}${TX.start_now_five_minutes}`,
    ()=>{ const b=document.querySelector("[data-fw]"); if(b) b.onclick=()=>{ $("sheet").innerHTML=""; fwStart(); }; });
}
function zoneTap(){ const st=zoneState();
  if(S.exited&&!S.uhr) return grundstueckSheet();
  if(st==="ready") return fwSheet();
  if(st==="offer") return exitOffer();
  else if(st==="open") openSheet(`${TX.chapter_2_your_watch}${testModus()?TX.k3_test_knopf:""}`,
    ()=>{ const b=document.querySelector("[data-test3]"); if(b) b.onclick=()=>testSprungKapitel3(); });
  else if(st==="locked") openSheet(`${TX.restricted_area_behind_the}${FW_FORSCHUNGEN}${TX.research_steps_2}${resFertig()}${TX.of_them_are_done}${testModus()?`${TX.for_testing_open_chapter}`+TX.k3_test_knopf:""}`,
    ()=>{ const b=document.querySelector("[data-test]"); if(b) b.onclick=()=>{ testSprungKapitel2(); };
      const b3=document.querySelector("[data-test3]"); if(b3) b3.onclick=()=>testSprungKapitel3(); });
}
