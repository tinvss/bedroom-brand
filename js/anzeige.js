// Anzeige: Kopfzeile, Markt, Tipps, Alarm, Übersicht, Ansicht wechseln, Startfenster
function shoeIcon(k,w){ w=w||22; const high=k==="hightop";
  const d=high?"M-12 3c0-6 1-14 4-16h6l1 7c3 1 7 2 10 4 2 1 3 2 3 3v2h-24z":"M-12 3c0-4 2-9 6-10l5 3c3 1 7 2 10 4 2 1 3 2 3 3v1h-24z";
  return `<svg viewBox="-14 -15 28 24" width="${w}" height="${Math.round(w*0.86)}" style="vertical-align:middle"><path d="${d}" fill="${MODELS[k].c2}"/><rect x="-12" y="4" width="24" height="3" fill="#F4F1EA" stroke="#1B1A17" stroke-width=".6"/></svg>`; }

/* ================= Alarm ================= */

function alarmCheck(){ releaseDeferred(); marketHint(); fwHint(); shopHint(); intakeHint();
  if(!S||!S.awake) { $("alarm").style.display="none"; return; }
  const near=S.raiders.filter(r=>!r.flee&&dist(r,HQ)<SUPPLY_R+1.5).length;
  const hot = near>=2 || S.t-(S.alarmT||-99)<5;
  $("tStadt").classList.toggle("alarm", hot && view!=="stadt");
  if(!hot||view==="stadt"||$("overlay").innerHTML){ $("alarm").style.display="none"; return; }
  if(!S.seen.alarm1){ S.seen.alarm1=true; paused=true; S.alarmPause=true; setPauseUI(); if(!tutOn) tutI=TUT.length; tutOn=true;
    tutQ.push({id:"alarm1", el:()=>$("tStadt"), done:()=>view==="stadt",
      t:TX.alarm_while_you_re}); return; }
  if(tutOn&&tutQ.length){ $("alarm").style.display="none"; return; }
  const what = near>=2 ? `${near}${TX.thieves_close_to_your}` : TX.something_is_being_raided;
  const al=$("alarm");
  if(al.dataset.what!==what){ al.dataset.what=what; al.innerHTML=`<div class="ab"><div><b>Alarm</b><br><span>${what}${TX.to_the_city}`; }
  al.style.display="block"; al.onclick=()=>switchView("stadt");
}

/* ================= Übersicht ================= */
// Katya hat auf den Court getippt, um herauszufinden, wie man ihn baut. Hier steht es.
// Was gerade markiert werden soll. Der Melder setzt es, die Zeichnung liest es.
// Katyas Test: Text unten wird überlesen, ein Ring am Objekt nicht.
let melderZiel=null;
// Katya hat auf die Uhr getippt, um zu sehen, in welcher Reihenfolge die Maschinen stehen müssen.
function uhrSheet(k){ reopen=()=>uhrSheet(k); const M=UHREN[k], U=S.uhr, W=uhrWerk();
  const hat=t=>W.floors.some(F=>F.slots.some(m=>m&&m.t===t));
  const zeile=(von,masch,raus,da)=>`<div class="frow" style="grid-template-columns:1fr auto"><div><b>${MACH2[masch].n}</b><span>${von} → ${raus}</span></div>
    <div style="font-weight:800;color:${da?"var(--money)":"var(--bad)"}">${da?TX.built:TX.missing_2}</div></div>`;
  let h=`<h3>${M.n}${TX.a_watch_is_built}`;
  h+=zeile(TX.metal,"giess",TX.a_case,hat("giess"));
  h+=zeile("Sand","ofen","Glas",hat("ofen"));
  h+=zeile(TX.metal,"fein","ein Zahnrad, drei davon je Uhrwerk",hat("fein"));
  h+=zeile(TX.three_gears,"werk","ein Uhrwerk",hat("werk"));
  h+=`${TX.leather_strap_cut_for}${U.lager.band>0?"var(--money)":"var(--bad)"}">${U.lager.band}${TX.here_2}`;
  h+=zeile(TX.case_glass_movement_and_2,"endm",TX.a+M.n,hat("endm"));
  if(!U.open[k]) h+=`<div class="opt ${S.money>=M.unlock?"":"off"}" ${S.money>=M.unlock?'data-ue="1"':""}${TX.design_the}${M.n}${TX.one_off_after_that}${M.unlock}</em></div>`;
  else { const laeuft=W.floors.some(F=>F.slots.some(m=>m&&m.t==="endm"&&m.model===k));
    h+= laeuft?`<p style="color:var(--money);font-weight:700">Eine Endmontage baut gerade ${M.n}.</p>`
             : `${TX.no_final_assembly_is}${M.n}${TX.tap_one_and_switch}`; }
  openSheet(h,()=>{ const e=document.querySelector("[data-ue]"); if(e) e.onclick=()=>{ if(S.money<M.unlock) return; S.money-=M.unlock; U.open[k]=true; uhrSheet(k); }; });
}
function modellSheet(k){ reopen=()=>modellSheet(k); const M=MODELS[k];
  const laufen=S.floors.reduce((a,F)=>a+F.slots.filter(m=>m&&m.t==="asm"&&m.model===k).length,0);
  const andere=findM(m=>m.t==="asm"&&m.model!==k);
  const braucht=Object.entries(M.need).map(([t,n])=>n+" "+(t==="schaft"?TX.upper:"Sohle")).join(TX.and);
  let h=`<h3>${M.n}</h3>`;
  if(!S.open[k]) h+=`${TX.not_designed_yet_designing}${M.unlock}${TX.after_that_you_can}${S.factory&&S.money>=M.unlock?"":"off"}" ${S.factory&&S.money>=M.unlock?'data-ent="1"':""}${TX.design_one_off}${M.unlock}</em></div>`;
  else { h+=`${TX.sells_for_about}${Math.round(S.districts.filter(d=>d.shop).reduce((a,d)=>a+priceIn(d,k),0)/Math.max(1,S.districts.filter(d=>d.shop).length))}${TX.needs_2}${braucht}${TX.per_pair}`;
    h+= laufen ? `<p><b>${laufen} ${laufen>1?TX.assemblies_are_building:TX.assembly_is_building}${TX.gerade}${M.n}${TX.right_now}`
              : `${TX.no_assembly_is_building}${M.n}${TX.switch_one_over_otherwise}`;
    if(andere) h+=`${TX.switch_an_assembly_to}${M.n}${TX.shows_you_which_machine}`; }
  openSheet(h,()=>{
    const e=document.querySelector("[data-ent]"); if(e) e.onclick=()=>{ if(S.money<M.unlock) return; S.money-=M.unlock; S.open[k]=true; modellSheet(k); };
    const u=document.querySelector("[data-um]"); if(u) u.onclick=()=>{ $("sheet").innerHTML="";
      guide({tower:()=>andere, opt:`[data-mo="${k}"]`, optT:`${TX.pick_2}${M.n}.`, done:()=>!!findM(m=>m.t==="asm"&&m.model===k)},
        `${TX.tap_this_assembly_and}${M.n}${TX.it_then_builds}${M.n}${TX.instead_of}${MODELS[S.floors[andere[0]].slots[andere[1]].model].n}.`); }; });
}
function overview(){
  const row=(name,a,b,labA,labB,warn)=>`<div class="frow" style="grid-template-columns:1fr auto auto"><div><b>${name}</b>${warn?`<span style="color:var(--bad);font-weight:700;display:block">${warn}</span>`:""}</div>
    <div style="text-align:right"><b style="color:var(--money)">${a}</b><span style="display:block">${labA}</span></div><div style="text-align:right"><b style="color:${b>a?"var(--bad)":"var(--ink)"}">${b}</b><span style="display:block">${labB}</span></div></div>`;
  let h=`${TX.overview_what_happened_in}`;
  for(const k of ["leder","gummi","metall"]){ const a=perMin("in_"+k), b=perMin("use_"+k), n=k[0].toUpperCase()+k.slice(1);
    const trs=S.trucks.filter(t=>S.sources[t.src].k===k).length;
    const warn = b>a&&S.lager[k]<8 ? `${TX.not_enough}${n}${TX.more_trucks_to_the}${k==="leder"?TX.tannery_2:k==="gummi"?TX.rubber_plant_2:TX.metal_yard_2}.` : S.lager[k]>=S.lagerCap&&trs ? `${TX.bay_full_trucks_waiting}` : "";
    if(a||b||trs) h+=row(n+` <span style="font-weight:600">· ${trs}${TX.trucks}`,a,b,TX.coming_in,"wird verbraucht",warn); }
  const shoes=perMin("mk_schuh"), sold=perMin("sold"), fin=Object.values(S.fin).reduce((x,y)=>x+y,0);
  h+=row(TX.shoes,shoes,sold,TX.made_2,TX.sold, fin>12?TX.your_shops_can_t:"");
  const made=perMin("mk_equip")*10, used=perMin("ammoUse"), out=perMin("ammoOut"), eq=S.floors.reduce((a,F)=>a+F.slots.filter(m=>m&&m.t==="equip").length,0);
  const lowPosts=S.posts.filter(p=>p.stock<5).length;
  h+=row(`${TX.gear_5}${eq}${TX.gear_shops}${S.vans.length}${TX.vans}`,made,used,TX.made_2,"verbraucht",
    used>made&&S.ammo<15 ? (S.lager.metall<3?TX.the_gear_shop_is:TX.you_use_more_than)
    : lowPosts&&S.ammo>20 ? `${TX.enough_in_storage_but}${lowPosts}${TX.posts_nearly_empty_more}` : "");
  if(S.uhr){ const geb=perMin("uhr_gebaut"), verk=perMin("uhr_verkauft"), lager=Object.values(S.uhr.fin).reduce((a,b)=>a+b,0);
    h+=row(`${TX.watches_3}${(S.uhr.boutiquen||[]).length+1}${TX.boutiques}`,geb,verk,TX.made_2,TX.sold,
      lager>8?TX.your_boutiques_can_t:"");
    h+=row(TX.leather_straps,perMin("band_hoch"),perMin("band_weg"),TX.arriving_up_top,"werden verbraucht",
      S.uhr.lager.band<2?TX.without_straps_final_assembly:""); }
  h+=`${TX.supplies_to_your_posts}${out}${TX.per_minute_in_the}${S.ammo}${TX.of_2}${S.ammoCap}.</p>`;
  h+=`<p style="margin-top:10px">${speicherGeht===false?TX.this_browser_saves_nothing:TX.your_game_is_saved}${TX.new_game_starts_over}`;
  openSheet(h,()=>{ const b=document.querySelector("[data-neu]"); if(b) b.onclick=()=>{
    b.outerHTML=`${TX.really_start_over_tap}`;
    document.querySelector("[data-ja]").onclick=()=>{ loescheStand();
      newGame(); tutOn=true; tutI=0; tutQ=[]; $("sheet").innerHTML=""; $("overlay").innerHTML=""; paused=false; setPauseUI(); renderTower(); hud(); }; }; });
}

/* ================= Anzeige ================= */
// Eine Zeile nur dann neu bauen, wenn sich ihr Inhalt geändert hat. Wer den Inhalt
// zehnmal pro Sekunde ersetzt, reißt dem Finger das Ziel unter der Kuppe weg.
function setzeWennNeu(el,html){ if(!el||el.dataset.h===html) return; el.dataset.h=html; el.innerHTML=html; }
function hud(){
  if(S.k3) return k3Hud();
  $("money").innerHTML=Math.round(S.money)+`<u>${S.money<0?TX.debt:TX.cash}</u>`; $("money").style.color=S.money<0?"var(--bad)":"";
  $("pairs").innerHTML=S.sold+TX.sold_2;
  $("ammo").innerHTML=S.ammo+`${TX.gear_6}${S.ammoCap}</u>`;
  const finW=aktivesWerk();
  const fin=Object.entries(finW.fin).filter(([k,v])=>v>0).map(([k,v])=>v+" "+(k.endsWith("_s")?finW.models[k.slice(0,-2)].n+(finW.name==="uhren"?TX.certified:TX.sealed):finW.models[k].n)).join(", ");
  const W=aktivesWerk(), roh=Object.keys(W.lager), nam={leder:TX.leather,gummi:TX.rubber,metall:TX.metal,sand:"Sand",band:TX.straps_2};
  const fx=k=>`<b style="color:${W.lager[k]>=W.lagerCap?"var(--bad)":W.lager[k]===0?"var(--ammo)":"var(--ink)"}">${W.lager[k]}</b>`;
  const teile=W.teile.filter(k=>W.parts[k]>0).map(k=>W.parts[k]+" "+k[0].toUpperCase()+k.slice(1)).join(", ");
  setzeWennNeu($("stock"),`${TX.overview_storage}${roh.map(k=>fx(k)+" "+nam[k]).join(" · ")}${TX.up_to}${W.lagerCap}${TX.each}${teile?TX.parts+teile:""}${fin?TX.finished+fin:""}`);
  { const st=S.trucks.map(truckState), wait=st.filter(x=>x==="voll").length, park=st.filter(x=>x==="leer").length;
    const stehen=S.trucks.filter(t=>t.wait).length;
    setzeWennNeu($("fleet"),`${TX.fleet_2}${fleetUsed()}${TX.of_2}${S.fleet}</b><span>${Math.round((fleetUsed()-stehen*2/3)*truckUpkeep*60)}${TX.per_minute}${wait?` · <span class="warn">${wait}${TX.waiting_bay_full}`:""}${park?` · <span class="warn">${park}${TX.idle_at_an_empty}`:""}${TX.manage}`); }
  { const uhrenHaus=S.uhr&&aktivesHaus().id==="uhren";
    const T=uhrenHaus?resTech2():resTech(), pct=uhrenHaus?resPct2():resPct();
    const fehlt=uhrenHaus?resFehltText(T,S.uhr.resProg,UHREN):resFehltText(T,S.resProg,MODELS);
    const blk=T&&!uhrenHaus?resBlock():null;
    if(!T) setzeWennNeu($("resbar"), uhrenHaus ? `${TX.research_nothing_picked_tap}`
      : (S.floors.length>=3&&S.seen.resDone ? `${TX.research_done_tap_for}` : ""));
    else setzeWennNeu($("resbar"),`<div class="rb"><b>${T.n}</b><div class="bar"><i style="width:${pct}%"></i></div><span class="eta ${blk?"bad":""}">${blk?TX.stalled_tap:fehlt?TX.still_need+fehlt:TX.almost_done}</span></div>`); }
  { const hs=haeuser(), el=$("haeuser");
    const html = hs.length<2 ? "" : hs.map(h=>{ const n=hausSorgen(h);
      return `<button data-haus="${h.id}" class="${h.id===aktivesHaus().id?"on":""}">${h.n}${n?`<i>${n}</i>`:""}</button>`; }).join("");
    if(el.dataset.h!==html){ el.dataset.h=html; el.innerHTML=html;
      document.querySelectorAll("#haeuser [data-haus]").forEach(b=>b.onclick=()=>{ S.haus=b.dataset.haus; reopen=null; $("sheet").innerHTML=""; hud(); }); } }
  alarmCheck(); regionCard();
  const lockSvg=`<svg width="11" height="13" viewBox="0 0 11 13" style="vertical-align:-1px;margin-right:4px"><rect x="1" y="6" width="9" height="7" rx="1.5" fill="currentColor"/><path d="M3 6V4a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>`;
  $("tForsch").style.opacity=(S.uhr?S.haus==="uhren":S.floors.length>=3)?"":".5";
  if(S.floors.length<3){ $("tForsch").innerHTML=lockSvg+TX.research; } else
  $("tForsch").innerHTML=S.curRes?`${TX.research_2}${resPct()}%</span>`:TX.research;
  $("tStadt").innerHTML=TX.city+(S.raiders.length?`<i>${S.raiders.length}</i>`:"");
  const home=S.districts[0];
  if(aktivesWerk().name==="uhren"){ const U=S.uhr, B=U.boutique;
    setzeWennNeu($("market"),Object.entries(UHREN).map(([k,M])=>{
      if(!U.open[k]) return `<div class="m" data-uk="${k}"><b>${M.n}</b><div class="p">${M.p0}${TX.not_designed_yet_button}${S.money>=M.unlock?"":"disabled"} data-uh="${k}${TX.design}${M.unlock}</button></div>`;
      const lager=(U.fin[k]||0)+(U.fin[k+"_s"]||0);
      return `<div class="m" data-uk="${k}"><b>${M.n}</b><div class="p">${uhrPreis(k)}</div><div class="h">${Math.round(uhrPreis(k)/M.p0*100)}${TX.in_the_boutique}${perMin("uhr_"+k)}${TX.per_minute}${lager?", "+lager+TX.in_storage:""}</div></div>`; }).join(""));
    document.querySelectorAll("[data-uh]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); const k=b.dataset.uh; if(S.money<UHREN[k].unlock) return; S.money-=UHREN[k].unlock; U.open[k]=true; uhrSheet(k); });
    document.querySelectorAll("#market [data-uk]").forEach(el=>el.onclick=()=>uhrSheet(el.dataset.uk));
    { const mU=stockung(), tU = mU ? tipKurz(mU.t,true) : tipKurz(`${TX.someone_buys_in_the}`);
      if($("tip").dataset.h!==tU){ $("tip").dataset.h=tU; $("tip").innerHTML=tU; $("tip").classList.remove("auf");
        const gb=$("tipGo"); if(gb&&mU) gb.onclick=e=>{ e.stopPropagation(); mU.go(); }; } }
    alarmCheck(); regionCard(); return; }
  setzeWennNeu($("market"),Object.entries(MODELS).map(([k,M])=>{
    if(!S.open[k]) return `<div class="m" data-mk="${k}"><b>${shoeIcon(k)}${M.n}</b><div class="p">${M.p0}${TX.fresh_market_button}${S.factory&&S.money>=M.unlock?"":"disabled"} data-un="${k}${TX.design}${M.unlock}</button></div>`;
    const shops=S.districts.filter(d=>d.shop), avg=Math.round(shops.reduce((a,d)=>a+priceIn(d,k),0)/shops.length);
    const nf=S.fakes.filter(f=>f.m===k).length;
    return `<div class="m" data-mk="${k}"><b>${shoeIcon(k)}${M.n}</b><div class="p">${avg}</div><div class="h">${Math.round(avg/M.p0*100)+"% in "+shops.length+" "+(shops.length>1?TX.shops:TX.shop)}</div><div class="h">${perMin("sold_"+k)}${TX.per_minute}${S.fin[k]+(S.fin[k+"_s"]||0)>8?", "+(S.fin[k]+(S.fin[k+"_s"]||0))+TX.waiting_2:""}</div>${nf?`<div class="h" style="color:var(--bad);font-weight:700">${nf}${TX.counterfeit_stall}${nf>1?TX.s:""}</div>`:""}</div></div>`; }).join(""));
  document.querySelectorAll("[data-un]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); const k=b.dataset.un; if(S.money<MODELS[k].unlock) return;
    S.money-=MODELS[k].unlock; S.open[k]=true; modellSheet(k); });
  document.querySelectorAll("#market [data-mk]").forEach(el=>el.onclick=()=>modellSheet(el.dataset.mk));
  const noEquip=!S.floors.some(F=>F.slots.some(m=>m&&m.t==="equip"));
  const melder=stockung();
  const tipHtml = melder ? melder.t+` <button id="tipGo">Zeig mir wo</button>` :
    moving ? `${TX.where_to_tap_another}`
    : !S.factory && S.sold<3 ? `${TX.you_start_in_your}`
    : !S.factory && !S.floors[0].slots.some(Boolean) ? `${TX.sewing_takes_time_tap}`
    : lagerSum()===0 ? `${TX.no_material_in_the}`
    : S.raiders.length && noEquip ? `${TX.gangs_are_on_the}`
    : S.posts.some(p=>p.dry)&&S.ammo<=0 ? `${TX.your_guards_are_out}`
    : S.floors.some(F=>F.slots.some(m=>m&&m.t==="seal"&&S.t-(m.last||m.born||0)>15)) && S.floors.some(F2=>F2.slots.some(a=>a&&a.t==="asm"&&S.t-(a.last||-99)<10)) ? `${TX.a_sealing_machine_gets}`
    : ["leder","gummi","metall"].some(k=>fachVoll(k)&&S.trucks.some(t=>t.wait&&S.sources[t.src].k===k)) ? `${TX.one_storage_bay_is}`
    : S.factory && !S.floors.some(F=>F.slots.some(m=>m&&m.t==="asm")) ? `${TX.workshop_open_an_assembly}`
    : `${TX.cleared_hideouts_free_up}`;
  // Nur neu aufbauen, wenn sich der Text ändert, sonst verschluckt die Zeile Tipps auf den Knopf
  melderZiel = melder && melder.zeig ? melder.zeig : null;
  $("fleet").classList.toggle("zeig", !!(melderZiel&&melderZiel.art==="fuhrpark"));
  document.querySelectorAll("#haeuser [data-haus]").forEach(b=>b.classList.toggle("zeig", !!(melderZiel&&melderZiel.art==="haus"&&melderZiel.id===b.dataset.haus)));
  const tipKurzHtml=tipKurz(tipHtml.replace(/ <button id="tipGo">Zeig mir wo<\/button>/,""), !!melder);
  if($("tip").dataset.h!==tipKurzHtml){ $("tip").dataset.h=tipKurzHtml; $("tip").innerHTML=tipKurzHtml; $("tip").classList.remove("auf");
    $("tip").classList.toggle("knopf", !!melder);
    const g=$("tipGo"); if(g&&melder) g.onclick=e=>{ e.stopPropagation(); melder.go(); }; }
}
// Der Melder zeigt nur den ersten Satz. Wer mehr wissen will, tippt darauf.
// Katyas Test: Lange Meldungen werden überlesen, kurze nicht.
function tipKurz(html,mitKnopf){
  // Der Punkt steht oft noch im fetten Teil, vor dem schließenden b-Tag.
  // Ohne das im Blick blieb der ganze Text der erste Satz, und der Melder war lang statt kurz.
  const teile=html.split(/(?<=\.(?:<\/b>)?)\s+/);
  const ersterSatz=teile.shift()||html, rest=teile.join(" ");
  return `<span class="kurz">${ersterSatz}</span>${rest?`<span class="rest">${rest}</span>`:""}`
    +(mitKnopf?`<div class="knopfzeile"><button id="tipGo">Zeig mir wo</button></div>`:"");
}
// Der Melder: sucht die erste Ursache, die gerade bremst, und liefert Text und Ziel für "Zeig mir wo"
function stockung(){
  if(aktivesWerk().name==="uhren") return stockungUhren();
  const rohNamen={leder:TX.leather,gummi:TX.rubber,metall:TX.metal}, quelle=k=>S.sources.find(s=>s.k===k&&s.left>0);
  const braucht={bench:["leder","gummi"],cut:["leder"],press:["gummi"],equip:["metall","gummi"]};
  // Wartet eine Maschine gerade auf diesen Rohstoff?
  const wartet=k=>S.floors.some(F=>F.slots.some(m=>m&&!m.busy&&!m.out&&(braucht[m.t]||[]).includes(k)&&!(m.buf[k]>0)));
  // 1. Das Konto blutet: mehr laufende Kosten als Verkäufe
  if(S.money<40&&S.trucks.length){ const kosten=Math.round((fleetUsed()-S.trucks.filter(t=>t.wait).length*2/3)*truckUpkeep*60), ein=perMin("sold")*Math.round(MODELS.runner.p0*0.6);
    if(kosten>ein) return {t:`${TX.you_re_paying_out}${kosten}${TX.per_minute_and_you}${ein}${TX.pull_a_truck_or}`,
      go:()=>{ switchView("stadt"); guideEl(()=>$("fleet"),TX.this_is_where_you_2); }}; }
  // 1. Nachschub reicht nicht: Lager leer und jemand wartet darauf
  for(const k of ["leder","gummi","metall"]){ const rein=perMin("in_"+k), raus=perMin("use_"+k);
    if(S.lager[k]<2 && wartet(k) && quelle(k))
      return {t:`${TX.not_enough_2}${rohNamen[k]}${TX.your_machines_are_waiting}${rein}${TX.arrive_per_minute}${raus}${TX.are_used_build_a}`,
        zeig:{art:"stadt", ziel:quelle(k), text:TX.get+rohNamen[k]},
        go:()=>{ switchView("stadt"); guideCity(quelle(k), `${TX.this_is_where_you_3}${rohNamen[k]}${TX.tap_the_source_and}`); }}; }
  // 2. Fuhrpark ist voll, deshalb kommt nichts nach
  if(fleetUsed()>=S.fleet && ["leder","gummi","metall"].some(k=>S.lager[k]<2&&wartet(k)))
    return {t:`${TX.your_fleet_is_full}`, go:()=>{ switchView("stadt"); guideEl(()=>$("fleet"),TX.this_is_where_you_4); }};
  // 3. Lagerfach voll, Transporter stehen
  for(const k of ["leder","gummi","metall"]) if(fachVoll(k)&&S.trucks.some(t=>t.wait&&S.sources[t.src].k===k))
    return {t:`${TX.the}${rohNamen[k]}${TX.bay_is_full_its}${rohNamen[k]}${TX.or_pull_one_from}`,
      zeig:{art:"fuhrpark"},
      go:()=>{ switchView("stadt"); guideEl(()=>$("fleet"),TX.in_the_fleet_you); }};
  // 3b. Der Aufzug staut: Kabine voll und darunter wartet Ware
  { const W3=aktivesWerk();
    const f=W3.lifts.findIndex((l,i)=>l.q.length>=2&&(l.jam||0)>20&&l.lvl<2);
    if(f>=0) return {t:`${TX.your_lift_can_t}`,
      zeig:{art:"aufzug", f},
      go:()=>{ switchView("turm"); guide({tw:()=>liftRect(f)},TX.that_is_the_lift); }}; }
  // 4. Warenannahme zu langsam
  { const f=S.intakes.find(fi=>((S.intakeLvl||{})[fi]||0)<2 && ["leder","gummi","metall"].some(k=>wartet(k)));
    if(f!==undefined && lagerSum()>20)
      return {t:`${TX.your_goods_intake_can}`,
        zeig:{art:"annahme", f},
        go:()=>{ switchView("turm"); guide({tw:()=>doorRect(f)},TX.that_s_the_goods); }}; }
  // 4b. Zu viele Maschinen auf einer Etage: Das Band schafft nur etwa ein Teil pro Takt
  { const W2=aktivesWerk();
    for(let f=0;f<W2.floors.length;f++){ const F=W2.floors[f];
      const stehen=F.slots.filter(m=>m&&(m.blockT||0)>40).length;
      if(stehen>=2&&F.slots.filter(Boolean).length>=5)
        return {t:`${TX.too_many_machines_on}${stehen}${TX.spots_at_the_front}${W2.name==="sohle"&&S.uhr?TX.in_sohle_you_can:TX.build_one_machine_less}`,
          zeig:{art:"platz", f, i:F.slots.findIndex(m=>m&&(m.blockT||0)>40)},
          go:()=>{ switchView("turm"); const i=F.slots.findIndex(m=>m&&(m.blockT||0)>40); guide({tower:()=>[f,i]},TX.this_machine_can_t); }}; } }
  // 4c. Eine Bande sitzt neben einem deiner Läden. Der verkauft nichts, und das sieht man sonst nirgends.
  { const d=S.districts.find(x=>x.shop&&x.nest!==undefined&&S.nests[x.nest]&&S.nests[x.nest].alive);
    if(d) return {t:`${TX.your_shop_in}${d.n}${TX.is_shut_a_gang}`,
      zeig:{art:"stadt", ziel:S.nests[d.nest], text:TX.hideout_2},
      go:()=>{ switchView("stadt"); guideCity(S.nests[d.nest],`${TX.this_hideout_keeps_your}${d.n}${TX.shut_a_raid_clears}`); }}; }
  // 5. Schuhe stapeln sich, ein Laden fehlt
  { const fin=Object.values(S.fin).reduce((a,b)=>a+b,0), her=perMin("mk_schuh"), verk=perMin("sold");
    const frei=S.districts.find(d=>!d.shop&&d.nest===undefined&&d.n!=="Zuhause");
    if(fin>15&&her>verk+5&&frei)
      return {t:`${TX.your_shops_can_t_2}${her}${TX.shoes_made_per_minute}${verk}${TX.sold_one_more_shop}`,
        zeig:{art:"stadt", ziel:frei, text:TX.open_a_shop},
        go:()=>{ switchView("stadt"); guideCity(frei,`${TX.you_can_open_a}`); }}; }
  // 5c. Nur Werkbänke: Damit gibt es nie Court oder Hightop, also auch keine Fashion Week
  { const benches=S.floors.reduce((a,F)=>a+F.slots.filter(m=>m&&m.t==="bench").length,0);
    const asm=S.floors.some(F=>F.slots.some(m=>m&&m.t==="asm"));
    if(S.factory&&benches>=3&&!asm)
      return {t:`${TX.your_workbenches_only_build}`,
        zeig:{art:"platz", f:0, i:S.floors[0].slots.findIndex(m=>!m)},
        go:()=>{ switchView("turm"); const frei=firstEmptyAfterAsm()||[0,S.floors[0].slots.findIndex(m=>!m)];
          guide({tower:()=>frei, opt:'[data-b="asm"]', optT:TX.take_the_assembly, done:()=>S.floors.some(F=>F.slots.some(m=>m&&m.t==="asm"))},
            TX.an_assembly_fits_here); }}; }
  // 6. Die Forschung kriecht, weil kaum jemand das Modell baut, dessen Muster fehlt
  { const T=resTech(), e=T?resEta():null;
    if(T&&findM(m=>m.t==="lab")&&e!==null&&e!==-1&&e>240){
      const f=resFehlt(T,S.resProg,MODELS)[0];
      const stelle=f&&findM(m=>m.t==="asm"&&m.model!==f.m);
      if(f&&stelle&&S.open[f.m]){ const jetzt=MODELS[S.floors[stelle[0]].slots[stelle[1]].model].n;
        const wie = e===Infinity ? `${TX.not_a_single_one}` : `${TX.so_few_reach_your}${Math.ceil(e/60)}${TX.minutes}`;
        return {t:`<b>${T.n}${TX.still_needs}${f.r} ${f.n}.</b> ${wie}${TX.switch_an_assembly_from}${jetzt}${TX.to}${f.n}${TX.um}`,
          go:()=>{ switchView("turm"); guide({tower:()=>stelle, opt:`[data-mo="${f.m}"]`, optT:`${TX.pick_2}${f.n}.`, done:()=>!!findM(m=>m.t==="asm"&&m.model===f.m)},
            `${TX.this_assembly_builds}${jetzt}${TX.switch_it_to}${f.n}${TX.then_your_lab_gets}`); }}; } } }
  // 5b2. Fälscher drücken den Preis, und niemand versiegelt
  { const buden=S.fakes.length, siegel=S.floors.some(F=>F.slots.some(m=>m&&m.t==="seal"));
    if(buden>=5&&!siegel)
      return {t:`<b>${buden}${TX.counterfeit_stalls_are_pushing}`,
        zeig:{art:"platz", f:(firstEmptyAfterAsm()||[0,0])[0], i:(firstEmptyAfterAsm()||[0,0])[1]},
        go:()=>{ switchView("turm"); guide({tower:firstEmptyAfterAsm, opt:'[data-b="seal"]', optT:TX.take_the_sealing_machine,
          done:()=>S.floors.some(F=>F.slots.some(m=>m&&m.t==="seal"))},
          TX.a_sealing_machine_fits); }}; }
  return null;
}
// Der Melder für die Manufaktur: sagt, welches Glied der Kette fehlt
function stockungUhren(){ const W=aktivesWerk(), U=S.uhr;
  const hat=t=>W.floors.some(F=>F.slots.some(m=>m&&m.t===t));
  const namen={metall:TX.metal,sand:"Sand",band:TX.leather_straps,gehaeuse:TX.cases,glas:"Glas",zahnrad:TX.gears,uhrwerk:"Uhrwerke"};
  const quelle=k=>S.sources.find(s=>s.k===k&&s.left>0);
  // Kette von hinten: Was fehlt der Endmontage?
  if(!hat("endm")) return {t:`${TX.no_watch_without_final}`, go:()=>guide({tower:()=>[0,W.floors[0].slots.findIndex(x=>!x)]},TX.place_a_final_assembly)};
  if(!hat("werk")) return {t:`${TX.the_movement_assembly_is}`, go:()=>guide({tower:()=>[0,W.floors[0].slots.findIndex(x=>!x)]},TX.the_movement_assembly_fits)};
  if(!hat("fein")) return {t:`${TX.the_precision_shop_is}`, go:()=>guide({tower:()=>[0,W.floors[0].slots.findIndex(x=>!x)]},TX.the_precision_shop_fits)};
  if(!hat("giess")) return {t:`${TX.the_foundry_is_missing}`, go:()=>guide({tower:()=>[0,W.floors[0].slots.findIndex(x=>!x)]},TX.the_foundry_fits_here)};
  if(!hat("ofen")) return {t:`${TX.the_glass_furnace_is}`, go:()=>guide({tower:()=>[0,W.floors[0].slots.findIndex(x=>!x)]},TX.the_glass_furnace_fits)};
  // Rohstoffe
  for(const k of ["metall","sand"]) if(U.lager[k]<2 && quelle(k)){
    const falsch = k==="metall" && S.sources.some(s=>s.k==="metall"&&s.trucks>0&&zielVon(s)==="sohle");
    return {t:`${TX.not_enough_2}${namen[k]}.</b> ${falsch?TX.your_metal_route_delivers:TX.your_machines_are_waiting_2}`,
      go:()=>{ switchView("stadt"); guideCity(quelle(k),`${TX.von_hier_kommt}${namen[k]}${TX.comes_from_here_tap}${k==="metall"?TX.and_set_which_house:TX.and_build_a_route}.`); }}; }
  if(U.lager.band<2){ const anteil=Math.round((S.bandAnteil||0)*100);
    return {t:`${TX.no_leather_straps}${anteil?TX.the_delivery_van_is:TX.the_straps_come_from}${TX.without_straps_final_assembly_2}`,
      zeig:{art:"haus", id:"sohle"},
      go:()=>{ S.haus="sohle"; switchView("turm"); const c=findM(m=>m.t==="cut"); if(c) guide({tower:()=>c},TX.tap_a_cutter_and); }};
  }
  // Zwischenteile
  const fehlt=["zahnrad","gehaeuse","glas","uhrwerk"].find(k=>W.floors.some(F=>F.slots.some(m=>m&&!m.busy&&!m.out&&(bedarfVon(W,m)||{})[k]&&!(m.buf[k]>0))));
  if(fehlt) return {t:`${TX.es_fehlen}${namen[fehlt]}${TX.are_missing}${fehlt==="zahnrad"?TX.a_movement_assembly_needs:TX.place_one_more_machine}`, go:null};
  // Forschung der Manufaktur: ohne Atelier geht nichts, und das Atelier braucht das richtige Modell
  { const T=resTech2();
    if(T&&!hat("atelier")) return {t:`<b>${T.n}${TX.isn_t_moving_for}`,
      go:()=>guide({tower:()=>[0,W.floors[0].slots.findIndex(x=>!x)]},TX.a_studio_fits_here)};
    if(T){ const f=resFehlt(T,U.resProg,UHREN)[0];
      if(f&&!U.open[f.m]) return {t:`<b>${T.n}${TX.needs_3}${f.r} ${f.n}${TX.that_model_isn_t}`, go:null};
      if(f&&!W.floors.some(F=>F.slots.some(m=>m&&m.t==="endm"&&m.model===f.m)))
        return {t:`<b>${T.n}${TX.still_needs}${f.r} ${f.n}${TX.your_final_assembly_is}`,
          go:()=>guide({tower:()=>findMW(W,m=>m.t==="endm"), opt:`[data-mo="${f.m}"]`, optT:`${TX.pick_2}${f.n}.`},`${TX.switch_this_final_assembly}${f.n}${TX.then_the_studio_gets}`)}; } }
  const lager=Object.values(U.fin).reduce((a,b)=>a+b,0);
  if(lager>8) return {t:`<b>${lager}${TX.watches_are_waiting_in}`, go:null};
  return null;
}
function guideCity(ziel,text){ $("sheet").innerHTML=""; if(!tutOn) tutI=TUT.length; tutOn=true;
  tutQ.push({id:"s"+Math.round(S.t*10), view:"stadt", city:()=>ziel, info:true, t:text}); }
function guideEl(el,text){ $("sheet").innerHTML=""; if(!tutOn) tutI=TUT.length; tutOn=true;
  tutQ.push({id:"s"+Math.round(S.t*10), view:"stadt", el, info:true, t:text}); }
function switchView(v){ view=v; if(v==="stadt"&&S&&S.alarmPause){ S.alarmPause=false; paused=false; setPauseUI(); } $("tTurm").classList.toggle("on",v==="turm"); $("tStadt").classList.toggle("on",v==="stadt");
  $("turmView").style.display=v==="turm"?"":"none"; $("stadtView").style.display=v==="stadt"?"":"none"; if(v==="stadt") size(); }
function setPauseUI(){ $("pause").textContent=paused?TX.continue_2:"Pause"; $("pause").classList.toggle("on",paused); document.body.classList.toggle("paused",paused); }
function intro(){ paused=true;
  // Wer wiederkommt, spielt weiter. Kein Fenster mit "Neues Spiel" direkt daneben, das kostet sonst eine ganze Partie.
  if(hasSave()&&loadGame()){ $("overlay").innerHTML=""; paused=false; setPauseUI();
    if(S.k3){ k3Modus(true); if(!S.k3.seen.ankunft) k3Ankunft(); } return; }
  $("overlay").innerHTML=`${TX.sohle_a_bedroom_ten}`;
  $("go").onclick=()=>{ $("overlay").innerHTML=""; paused=false; setPauseUI(); tutOn=true; tutI=0; }; }
