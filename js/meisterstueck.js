// Das Finale von Kapitel 2. Kein "produziere mehr", sondern "erschaffe das eine".
// Eintrittskarte ist die Werkstatt für Einzelstücke, danach vier seltene Zutaten, dann mehrere Minuten Bangen.

const MEISTER_TEILE={
 saphir:  {n:"Saphirglas",        d:TX.forty_panes_of_glass, braucht:{glas:40}},
 werkE:   {n:"Tourbillon",        d:TX.thirty_movements_are_used, braucht:{uhrwerk:30}},
 stein:   {n:"Meteoritengestein", d:TX.lies_at_the_very,                    expedition:true},
 band:    {n:"Das Armband",       d:TX.sewn_by_the_very,                      mitarbeiter:true}};
const MEISTER_BAUZEIT=150;   // so lange liegt die Uhr halbfertig in der Werkstatt
// Die Werkstatt wird in drei Raten gebaut. Sonst spart man zwanzig Minuten am Stück,
// ohne dass unterwegs etwas passiert. Jede Rate macht etwas auf.
const MEISTER_STUFEN=[
 {n:"Der Raum",        d:TX.four_walls_and_a},
 {n:"Der Wagen",       d:TX.an_armoured_van_only},
 {n:"Die Montagebank", d:TX.the_bench_the_piece}];
const mwStufe=()=>S.mw?(S.mw.stufe||1):0;
const ratePreis=()=>Math.round((S.mw?S.mw.preis:grossPreis())/3/100)*100;

const werkstattDa=()=>!!(S.uhr&&S.uhr.floors.some(F=>F.slots.some(m=>m&&m.t==="werkstatt")));
const meisterOffen=()=>!!(S.uhr&&RES2().tourbillon&&werkstattDa());
// Kaufbar ist sie einmal: nicht ohne Forschung, nicht zweimal und nicht mehr, wenn das Stück gebaut ist
const werkstattKaufbar=()=>!!(S.uhr&&RES2().tourbillon&&!werkstattDa()&&!(S.mw&&S.mw.phase==="fertig"));
const werkstattGrund=()=>!S.uhr||!RES2().tourbillon?TX.only_with_the_tourbillon:werkstattDa()?TX.you_already_have_one:TX.your_masterpiece_is_built;
// Der erste Mitarbeiter: Steht in Sohle noch eine Werkbank, näht er das Band umsonst. Sonst muss man ihn zurückholen.
const mitarbeiterDa=()=>S.floors.some(F=>F.slots.some(m=>m&&m.t==="bench"));
const mitarbeiterPreis=()=>festPreis("mitarbeiter",()=>Math.max(4000,Math.round(umsatzProMin()*8/100)*100));
// Sein alter Platz in Sohle. Ist dort noch was frei, zeigt die Werkstatt hin statt zu erklären.
function freierPlatz(W){ for(let f=0;f<W.floors.length;f++){ const i=W.floors[f].slots.findIndex(x=>!x); if(i>=0) return [f,i]; } return null; }
const platzInSohle=()=>freierPlatz(sohleWerk());
function zeigMitarbeiterPlatz(){ const p=platzInSohle(); if(!p) return; S.haus="sohle";
  guide({tower:()=>p, opt:"[data-hb]", optT:`${TX.bring_him_back_he}`, done:()=>mitarbeiterDa()},
    TX.there_is_still_room); }
// Die Werkstatt selbst steht in der Manufaktur, irgendwo, sie braucht kein Band
function zeigWerkstattPlatz(){ if(!S.uhr||!werkstattKaufbar()) return; const p=freierPlatz(uhrWerk()); S.haus="uhren";
  if(!p){ switchView("turm"); openSheet(`${TX.no_room_for_the}`); return; }
  guide({tower:()=>p, opt:'[data-b="werkstatt"]', optT:TX.take_the_workshop_for, done:()=>werkstattDa()},
    TX.there_is_room_for); }

function meisterStart(){ if(S.mw||!S.uhr||!RES2().tourbillon) return;
  S.mw={phase:"sammeln", teile:{}, t0:S.t, preis:grossPreis(), lohn:Math.max(50000,Math.round(umsatzProMin()*60/1000)*1000), stufe:1};
  once("mw","Der Auftrag",`${TX.a_big_watch_house}`); }
function werkstattAusbauen(){ const M=S.mw; if(!M||M.stufe>=3) return; const c=ratePreis(); if(S.money<c) return;
  S.money-=c; M.stufe++; pop(S.uhr.ort,MEISTER_STUFEN[M.stufe-1].n+TX.is_ready,"#7B5BC0");
  if(M.stufe===2) once("mwstufe2",TX.the_van_is_ready,`${TX.the_armoured_van_is}`);
  if(M.stufe===3) once("mwstufe3",TX.the_bench_is_ready,`${TX.the_workshop_is_finished}`); }

// Zutaten abgeben. Was aus Teilen entsteht, sammelt die Werkstatt selbst ein, Stück für Stück.
// Vierzig Scheiben Glas passen in kein Teilelager, deshalb hebt die Werkstatt sie auf, nicht das Lager.
const sammelStand=(M,k)=>{ const T=MEISTER_TEILE[k]; if(!T.braucht) return null;
  return Object.entries(T.braucht).map(([t,v])=>({t, v, da:Math.min(v,(M.sammel||{})[t]||0)})); };
const sammeltGerade=(M,k)=>!!(M.auftrag&&M.auftrag[k]);
// Ein laufender Auftrag hat Vorrang. Ohne das ging kein einziges Uhrwerk in die Werkstatt:
// die Endmontage nimmt jedes vom Band, gemessen 0 von 30 in zehn Minuten, auch mit drei Feinmechaniken.
function meisterVorrang(W,k){ const M=S.mw;
  if(!M||!W||W.name!=="uhren"||M.phase!=="sammeln"||!M.auftrag) return false;
  for(const t in M.auftrag){ if(M.teile[t]) continue; const T=MEISTER_TEILE[t]; if(!T||!T.braucht) continue;
    if(T.braucht[k]!==undefined&&((M.sammel||{})[k]||0)<T.braucht[k]) return true; }
  return false; }
function meisterAuftrag(k){ const M=S.mw; if(!M||M.phase!=="sammeln"||M.teile[k]) return;
  M.auftrag=M.auftrag||{}; if(M.auftrag[k]) delete M.auftrag[k]; else M.auftrag[k]=true; }
function meisterSammeln(){ const M=S.mw, U=S.uhr; if(!M||!U||M.phase!=="sammeln"||!M.auftrag) return;
  M.sammel=M.sammel||{}; M.sammelT=(M.sammelT||0)+DT; if(M.sammelT<1) return; M.sammelT=0;
  for(const k of Object.keys(M.auftrag)){ if(M.teile[k]){ delete M.auftrag[k]; continue; }
    const T=MEISTER_TEILE[k]; if(!T.braucht) continue; let fertig=true;
    for(const t in T.braucht){ if((M.sammel[t]||0)>=T.braucht[t]) continue;
      if((U.parts[t]||0)>0){ U.parts[t]--; M.sammel[t]=(M.sammel[t]||0)+1; }
      if((M.sammel[t]||0)<T.braucht[t]) fertig=false; }
    if(fertig){ M.teile[k]=true; delete M.auftrag[k]; pop(U.ort,T.n+" fertig","#1F7A55"); if(alleDa()) alleDaHinweis(); } } }
function meisterGeben(k){ const M=S.mw; if(!M||M.phase!=="sammeln"||M.teile[k]) return;
  const T=MEISTER_TEILE[k];
  if(T.braucht) return meisterAuftrag(k);
  if(T.mitarbeiter&&!mitarbeiterDa()){ const c=mitarbeiterPreis(); if(S.money<c) return; S.money-=c; M.zurueckgeholt=true; }
  M.teile[k]=true; pop(S.uhr.ort,T.n+" bereit","#1F7A55"); if(alleDa()) alleDaHinweis();
}
const alleDa=()=>{ const M=S.mw; return !!M&&Object.keys(MEISTER_TEILE).every(x=>M.teile[x]); };
function alleDaHinweis(){ once("mwbereit","Alles da",`${TX.the_four_ingredients_are}${MEISTER_BAUZEIT}${TX.seconds_and_all_that}`); }
// Expedition an den Kartenrand. Ein einzelner Wagen, lange Strecke, und alle wissen, was er holt.
// Er gehört zur Manufaktur, startet dort und bringt das Gestein auch dorthin zurück.
const EXP_ZIELE=[{x:0.5,y:-3.8},{x:8.5,y:-3.8}];
const expZiel=()=>{ const o=S.uhr.ort; return EXP_ZIELE.slice().sort((a,b)=>dist(b,o)-dist(a,o))[0]; };
const laengs=x=>ROADS_X.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
// Über der alten Stadt gibt es keine Querstraßen: erst auf einer Längsstraße herunter, unten quer, dann wieder hoch.
function expeditionWeg(z){ const o=S.uhr.ort, ax=laengs(o.x), p=[{x:o.x,y:o.y}];
  if(Math.abs(ax-o.x)>0.01) p.push({x:ax,y:o.y});
  if(Math.abs(ax-z.x)>0.01) p.push({x:ax,y:ROADY[0]},{x:z.x,y:ROADY[0]});
  p.push({x:z.x,y:z.y}); return p; }
function expeditionStart(){ const M=S.mw; if(!M||M.teile.stein||M.exp||mwStufe()<2||!S.uhr) return;
  const z=expZiel(), o=S.uhr.ort;
  M.exp={pos:{x:o.x,y:o.y}, d:0, weg:expeditionWeg(z), ziel:z, zurueck:false, hp:90, max:90};
  expeditionWelle();
  once("exp","Die Expedition",`${TX.a_single_van_leaves}`); }
// Beim Losfahren und beim Aufladen bricht aus jedem Versteck eine eigene Welle auf, zusätzlich zum normalen Takt
function expeditionWelle(){ if(!S.awake) return 0; const e=evo(), leben=3*Math.sqrt(e)*3; let n=0;
  for(const nest of S.nests){ if(!nest.alive) continue;
    for(let q=0;q<1+Math.floor((e-1)*0.5);q++){ S.raiders.push({x:nest.x+(Math.random()-.5)*.6,y:nest.y+(Math.random()-.5)*.6,hp:leben,max:leben,cd:0,crew:true}); n++; } }
  if(n){ S.alarmT=S.t; pop(S.uhr.ort,n+TX.crews_want_the_rock,"#B8432F"); }
  return n; }
function expeditionVerloren(){ const M=S.mw; if(!M||!M.exp) return;
  pop(M.exp.pos,"Expedition verloren","#B8432F"); M.exp=null; S.alarmT=S.t;
  once("expweg",TX.the_van_is_gone,`${TX.they_caught_the_expedition}`); }
function expeditionStep(){ const M=S.mw; if(!M||!M.exp) return; const e=M.exp, L2=pathLen(e.weg);
  if(!e.zurueck&&e.d>=L2&&!e.hat){ e.grab=(e.grab||0)+DT; if(e.grab<6) return; e.hat=true; e.zurueck=true; pop(e.pos,"Gestein geladen","#1F7A55"); expeditionWelle(); }
  e.d += (e.zurueck?-1:1)*1.1*DT;
  if(!e.zurueck&&e.d>L2) e.d=L2;
  if(e.zurueck&&e.d<=0){ M.exp=null; M.teile.stein=true; pop(S.uhr.ort,"Meteoritengestein da","#1F7A55"); if(alleDa()) alleDaHinweis(); return; }
  e.pos=pointAt(e.weg,Math.max(0,Math.min(L2,e.d)));
}
// Zusammenbau: drei Minuten Bangen
function meisterBauen(){ const M=S.mw; if(!M||M.phase!=="sammeln"||!alleDa()||mwStufe()<3) return; M.phase="bau"; M.bauT=S.t;
  once("mwbau",TX.it_s_lying_in,`${TX.all_the_ingredients_are}`); }
function meisterStep(){ const M=S.mw; if(!M) return;
  if(M.exp) expeditionStep();
  meisterSammeln();
  if(M.phase!=="bau") return;
  if(S.t-M.bauT>=MEISTER_BAUZEIT){ M.phase="fertig"; meisterFertig(); }
}
// Ein Raub in der Bauzeit zerstört das Stück
function meisterUeberfall(){ const M=S.mw; if(!M||M.phase!=="bau") return;
  M.phase="sammeln"; M.teile={}; M.sammel={}; M.auftrag={}; M.kaputt=(M.kaputt||0)+1;
  once("mwweg"+M.kaputt,TX.they_took_it,`${TX.while_the_watch_lay}`); }
function meisterFertig(){ paused=true; setPauseUI();
  const conf=`<div class="confetti">${Array.from({length:40},(_,i)=>`<i style="left:${(i*29)%100}%;background:${["#E4572E","#2E6FE4","#1F9E6E","#F2B441","#7B5BC0"][i%5]};animation-delay:${(i%9)*0.1}s;animation-duration:${1.6+(i%5)*0.3}s"></i>`).join("")}</div>`;
  const preis=S.mw.lohn||Math.max(50000,Math.round(umsatzProMin()*60/1000)*1000);   // beim Auftrag festgelegt, eine Stunde Umsatz
  S.money+=preis; S.meisterFertig=true;
  $("overlay").innerHTML=`<div class="over"><div class="box win">${conf}${TX.the_masterpiece_it_s}${S.mw.zurueckgeholt?TX.your_first_employee_the:TX.your_very_first_employee}.</p>
    <p style="font-size:26px;font-weight:800;color:var(--money);margin:6px 0 10px">${preis.toLocaleString(TX.en_us)}</p>
    <p style="font-size:13px">${S.sold}${TX.pairs_sold}${(S.uhr.boutique.verkauft||0)+(S.uhr.boutiquen||[]).reduce((a,B)=>a+(B.verkauft||0),0)}${TX.watches_sold}${S.mw.kaputt?S.mw.kaputt+TX.times_lost:""}${Math.round(S.t/60)}${TX.minutes_continue}`;
  const b=$("mwok"); if(b) b.onclick=()=>{ $("overlay").innerHTML=""; paused=false; setPauseUI(); setTimeout(k3Angebot,700); };   // danach kommt das Angebot für Kapitel 3
}
function werkstattWeg(){ if(!S.uhr||!S.mw||S.mw.phase!=="fertig") return;
  S.uhr.floors.forEach(F=>F.slots.forEach((m,i)=>{ if(m&&m.t==="werkstatt") F.slots[i]=null; })); }
// Fenster in der Manufaktur
function meisterSheet(){ reopen=meisterSheet; const M=S.mw;
  if(!M){ openSheet(`${TX.the_masterpiece_a_big}${RES2().tourbillon?TX.tourbillon_researched:TX.tourbillon_still_missing}</p>`); return; }
  if(M.phase==="fertig"){ openSheet(`${TX.the_masterpiece_is_finished}`,
    ()=>{ const w=document.querySelector("[data-weg]"); if(w) w.onclick=()=>{ werkstattWeg(); $("sheet").innerHTML=""; }; }); return; }
  if(M.phase==="bau"){ const rest=Math.ceil(MEISTER_BAUZEIT-(S.t-M.bauT));
    openSheet(`${TX.the_watch_is_in}${rest}${TX.seconds_left_a_raid}`); return; }
  const U=S.uhr, st=mwStufe();
  let h=`${TX.the_masterpiece_your_workshop}${MEISTER_STUFEN[st-1].n}${TX.stage}${st}${TX.of_3}`;
  if(st<3){ const c=ratePreis(), ok=S.money>=c, naechste=MEISTER_STUFEN[st];
    h+=`<div class="opt ${ok?"":"off"}" ${ok?`data-aus="1"`:""}><div><b>Ausbauen: ${naechste.n}</b><span>${naechste.d}</span></div><em>${c.toLocaleString("de-DE")}</em></div>`; }
  h+=`${TX.four_ingredients_each_a}`;
  for(const [k,T] of Object.entries(MEISTER_TEILE)){ const da=M.teile[k];
    let kann=false, hinweis="";
    if(T.braucht){ const st=sammelStand(M,k), laeuft=sammeltGerade(M,k); kann=true;
      hinweis=st.map(x=>`${x.da}${TX.of_2}${x.v} ${x.t==="glas"?TX.glass:TX.movements}`).join(", ")
        +(laeuft?TX.the_workshop_is_collecting
                :TX.tap_and_the_workshop); }
    else if(T.expedition){ kann=false; hinweis=M.exp?TX.the_van_is_on:TX.send_the_van_out; }
    else if(T.mitarbeiter){ const platz=!mitarbeiterDa()&&platzInSohle();
      kann=mitarbeiterDa()||!!platz||S.money>=mitarbeiterPreis();
      hinweis=mitarbeiterDa()?TX.he_is_still_standing
        :platz?`${TX.you_removed_him_tap}${mitarbeiterPreis().toLocaleString("de-DE")}.`
        :`${TX.you_removed_him_and}${mitarbeiterPreis().toLocaleString("de-DE")}.`; }
    const em=da?"✓":T.braucht&&sammeltGerade(M,k)?"sammelt":"";
    h+=`<div class="opt ${da?"off":""}" ${!da&&kann?`data-mt="${k}"`:""}><div><b>${T.n}${da?" · bereit":""}</b><span>${T.d}</span><span style="display:block;margin-top:3px">${da?"":hinweis}</span></div><em>${em}</em></div>`;
    if(k==="stein"&&!da&&!M.exp) h+= st>=2
      ? `${TX.send_the_expedition_a}`
      : `${TX.send_the_expedition_the}`;
  }
  if(alleDa()) h+= st>=3
    ? `${TX.start_the_assembly_the}${MEISTER_BAUZEIT}${TX.seconds_a_raid_on}`
    : `${TX.start_the_assembly_the_2}`;
  openSheet(h,()=>{ const ab=document.querySelector("[data-aus]"); if(ab) ab.onclick=()=>{ werkstattAusbauen(); meisterSheet(); };
    const bb=document.querySelector("[data-bau]"); if(bb) bb.onclick=()=>{ meisterBauen(); meisterSheet(); };
    document.querySelectorAll("[data-mt]").forEach(b=>b.onclick=()=>{ const k=b.dataset.mt;
      // Der Mitarbeiter ist der einzige Teil, der nicht in der Manufaktur liegt: dann hin statt erklären
      if(k==="band"&&!mitarbeiterDa()&&platzInSohle()){ $("sheet").innerHTML=""; zeigMitarbeiterPlatz(); return; }
      meisterGeben(k); meisterSheet(); });
    const e=document.querySelector("[data-exp]"); if(e) e.onclick=()=>{ expeditionStart(); meisterSheet(); }; });
}
