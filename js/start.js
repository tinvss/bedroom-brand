// Start: neues Spiel, Eingaben verbinden, Spielschleife
/* ================= Start ================= */
newGame();
let pressing=false;
// Tipps auf die Leinwände direkt aus Finger runter und hoch, nicht über "click".
// Der Browser schickt "click" erst nach seiner Gestenerkennung, und auf dem Handy kam er oft gar
// nicht an (Doppeltipp-Zoom, leicht verrutschter Finger). Dann musste man zwei-, dreimal tippen.
function tippe(el,fn){ let d=null, erledigt=0;
  el.addEventListener("pointerdown",e=>{ d=e.button>0?null:{x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId}; });
  el.addEventListener("pointercancel",()=>d=null);
  el.addEventListener("pointerup",e=>{ const a=d; d=null; if(!a||a.id!==e.pointerId) return;
    if(Math.hypot(e.clientX-a.x,e.clientY-a.y)>16||performance.now()-a.t>900) return;
    erledigt=performance.now(); fn(a.x,a.y); });
  // Den Klick hinterher schlucken, sonst landet er im gerade geöffneten Fenster und schließt es wieder
  el.addEventListener("touchend",e=>{ if(performance.now()-erledigt<300) e.preventDefault(); },{passive:false});
  el.addEventListener("click",e=>{ if(performance.now()-erledigt<700) return; fn(e.clientX,e.clientY); }); }
if(typeof window!=="undefined" && typeof requestAnimationFrame!=="undefined"){
  $("tTurm").onclick=()=>switchView("turm"); $("tStadt").onclick=()=>switchView("stadt");
  $("tForsch").onclick=()=>{ if(S.uhr&&S.haus==="uhren") forschungSheet2(); else if(S.uhr) openSheet(`${TX.research_complete_sohle_has}`); else if(S.floors.length>=3) researchSheet(); else openSheet(`${TX.research_research_opens_once}`); };
  $("pause").onclick=()=>{ paused=!paused; setPauseUI(); };
  $("tip").onclick=()=>$("tip").classList.toggle("auf");   // Tipp auf den Melder zeigt den Rest
  $("fleet").onclick=fleetSheet; $("resbar").onclick=()=>$("tForsch").onclick(); $("stock").onclick=overview;
  tippe(tcv,(cx,cy)=>{ const r=tcv.getBoundingClientRect(), x=(cx-r.left)/TS, y=(cy-r.top)/TS;
    for(let k=hits.length-1;k>=0;k--){ const h=hits[k]; if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){ h.act(); return; } } });
  tippe(cv,(cx,cy)=>{ const r=cv.getBoundingClientRect(), y=(cy-r.top)/T-TOPR();
    if(y<0&&zoneState()!=="open"){ zoneTap(); return; }
    cityTap((cx-r.left)/T,y); });
  addEventListener("resize",()=>{ if(view==="stadt") size(); });
  pruefeSpeicher();
  addEventListener("pointerdown",()=>{ pressing=true; if(speicherGeht===false) speicherFreigeben(); },true); const loslassen=()=>setTimeout(()=>pressing=false,120); addEventListener("pointerup",loslassen,true); addEventListener("pointercancel",loslassen,true);
  let acc=0,last=performance.now(),ui=0,saveT=0;
  (function loop(now){ const dt=Math.min(0.25,(now-last)/1000); last=now;
    if(!paused){ acc+=dt; while(acc>=DT){ step(); acc-=DT; } }
    // Zeichenuhr: Spielzeit plus der angefangene Rechenschritt. Damit läuft alles weich,
    // und Vergleiche mit S.t (Treffer, Blitze) stimmen weiter.
    animT=S.t+(paused?0:acc);
    if(view==="stadt") drawCity(); else drawTower(dt); if(!pressing){ tutUpdate(); sheetAuffrischen(dt); } ui+=dt; if(ui>0.2&&!pressing){ ui=0; if(view==="turm") renderHand(); hud(); }
    saveT+=dt; if(saveT>2){ saveT=0; saveGame(); }
    requestAnimationFrame(loop); })(last);
  addEventListener("pagehide",saveGame); document.addEventListener("visibilitychange",()=>{ if(document.hidden) saveGame(); });
  renderTower(); hud(); intro();
}
