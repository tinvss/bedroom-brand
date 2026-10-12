// Menüs in der Stadt: Tippen auf die Karte, Fuhrpark
/* ================= Eingaben: Stadt ================= */
function cityTap(x,y){
  const rd=S.raiders.filter(r=>dist(r,{x,y})<0.85).sort((a,b)=>dist(a,{x,y})-dist(b,{x,y}))[0];
  if(rd){ const beimTrupp=S.squads.some(q=>dist(q,rd)<2.2);   // während einer Razzia deckst du deinen Trupp
    const nah = dist(rd,HQ)<=SUPPLY_R+0.3 || (S.uhr&&S.uhr.ort&&dist(rd,S.uhr.ort)<=SUPPLY_R+0.3);
    if(!nah&&!beimTrupp){ pop(rd,TX.too_far_away,"#B8432F"); return; }
    if(S.t<(S.handCd||0)){ pop(HQ,TX.net_reloading,"#7A7366"); return; }
    S.handCd=S.t+0.6; rd.hp-=4; rd.hitT=S.t; S.seen.tapped=true; for(const o of S.raiders) if(o!==rd&&dist(o,rd)<0.8){ o.hp-=2; o.hitT=S.t; }
    if(S.tapPause){ S.tapPause=false; paused=false; setPauseUI(); }
    const von=beimTrupp?S.squads.slice().sort((a,b)=>dist(a,rd)-dist(b,rd))[0]:{x:HQ.x,y:HQ.y-0.4};
    S.shots.push({a:{x:von.x,y:von.y},b:{x:rd.x,y:rd.y},ttl:0.25,max:0.25}); return; }
  const src=S.sources.find(s=>dist(s,{x,y})<0.85);
  if(src){ const has=src.trucks>0, full=fleetUsed()>=S.fleet, c=has?90:routeCost(src), ok=!full&&S.money>=c;
    const fc=fleetCost(), fok=S.money>=fc;
    const zielZeile = S.uhr ? (src.k==="metall"
      ? `${TX.delivers_to}${[["sohle","Sohle"],["uhren",TX.manufactory]].map(([id,n])=>`<button data-zl="${id}" style="flex:1;appearance:none;font:inherit;font-weight:800;font-size:13px;padding:9px 0;border-radius:9px;border:1px solid var(--line);cursor:pointer;background:${zielVon(src)===id?"var(--ink)":"var(--card)"};color:${zielVon(src)===id?"var(--card)":"var(--soft)"}">${n}</button>`).join("")}</div>`
      : `${TX.delivers_to_2}${zielName(src)}</b>. ${src.k==="sand"?TX.only_the_manufactory_needs:TX.only_sohle_needs_leather}</p>`) : "";
    openSheet(`<h3>${src.n||RAW[src.k].n}</h3>${zielZeile}<p>${has?src.trucks+TX.trucks_run_here:TX.no_route_yet}${TX.your_fleet}${S.trucks.length}${TX.of_2}${S.fleet}${TX.every_truck_costs_you}${ok?"":"off"}" ${ok?'data-go="1"':""}><div><b>${has?TX.one_more_truck:TX.build_route_2}</b><span>${full?TX.fleet_is_full:TX.delivers_into_your_storage}</span></div><em>${c}</em></div>
      <div class="opt ${fok?"":"off"}" ${fok?'data-fl="1"':""}${TX.make_fleet_bigger_room}${fc}</em></div>`,
      ()=>{ const b=document.querySelector("[data-go]"); if(b) b.onclick=()=>{ S.money-=c; addTruck(src); $("sheet").innerHTML=""; };
        document.querySelectorAll("[data-zl]").forEach(z=>z.onclick=()=>{ src.ziel=z.dataset.zl;
          const i2=S.sources.indexOf(src), p2=pathOf(src);
          S.trucks.forEach(t=>{ if(t.src===i2){ t.path=p2; t.d=0; t.dir=-1; t.cargo=0; t.pos={...p2[0]}; } });
          cityTap(x,y); });
        const f=document.querySelector("[data-fl]"); if(f) f.onclick=()=>{ S.money-=fc; S.fleet++; $("sheet").innerHTML=""; }; });
    return; }
  if(!S.movePost) reopen=()=>cityTap(x,y);
  if(S.uhr&&S.uhr.ort&&dist({x,y},S.uhr.ort)<0.9){ S.haus="uhren"; switchView("turm"); return; }
  if(dist({x,y},HQ)<0.9){ S.haus="sohle"; switchView("turm"); return; }
  const fk=S.fakes.find(f=>dist(f,{x,y})<0.45);
  if(fk){ const c=sueCost(), ok=S.money>=c;
    openSheet(`${TX.counterfeit_stall_sells_fake}${MODELS[fk.m].n} in ${fk.d.n}${TX.strength}${fk.str.toFixed(1)}${TX.a_cease_and_desist}${ok?"":"off"}" ${ok?'data-go="1"':""}${TX.send_cease_and_desist}${c}</em></div>`,
      ()=>{ const b=document.querySelector("[data-go]"); if(b) b.onclick=()=>{ S.money-=c; S.sues++; S.fakes=S.fakes.filter(g=>g!==fk); pop(fk,"ABGEMAHNT","#1F7A55"); $("sheet").innerHTML=""; }; });
    return; }
  const nest=S.nests.find(n=>n.alive&&dist(n,{x,y})<0.8);
  if(nest){ const laeuft=S.squads.filter(q=>S.nests[q.nest]===nest&&!q.back);
    if(laeuft.length){   // Während der Razzia hilfst du selbst: Netz aus dem Turm auf das Versteck
      if(S.t<(S.handCd||0)){ pop(nest,TX.net_reloading,"#7A7366"); return; }
      S.handCd=S.t+0.6; nest.hp-=4; nest.hitT=S.t;   // aus dem Turm geworfen, kostet nichts, wie bei Dieben
      S.shots.push({a:{x:HQ.x,y:HQ.y-0.4},b:{x:nest.x,y:nest.y},ttl:0.25,max:0.25});
      if(nest.hp<=0){ nest.alive=false; S.cleared++; S.lastClear=S.t; const dd=S.districts[nest.district]; if(dd) delete dd.nest; pop(nest,"AUSGEHOBEN","#1F7A55"); beuteZurueck(nest); }
      return; }
    const avail=S.posts.filter(p=>!p.away&&p.hp>0), mitAus=avail.filter(p=>p.stock>=10).length, str=avail.length*10+mitAus*4;
    const cost=200+S.razzias*100, ok=avail.length>0&&S.money>=cost;
    // Der Netzwerfer ist eine Zeile im Fenster. Vorher fing er jeden Tipp ab, und die Razzia war nicht mehr erreichbar.
    const werfer=RES2().werfer&&S.uhr&&S.uhr.ort&&dist(nest,S.uhr.ort)<=werferWeite();
    const wGrund=!werfer?"":S.ammo<WERFER_KOSTEN?`${TX.not_enough_gear_2}${WERFER_KOSTEN}${TX.are_needed}`
      :S.t<(S.werferCd||0)?`${TX.still_reloading}${Math.ceil(S.werferCd-S.t)}${TX.seconds_2}`:"";
    const wText=wGrund||`${werferSchaden(nest)}${TX.damage_in_one_throw}${WERFER_LADEN}${TX.seconds_of_reloading_in}`;
    const wZeile=werfer?`<div class="opt ${wGrund?"off":""}" ${wGrund?"":'data-wf="1"'}${TX.throw_a_net_from}${wText}</span></div><em>${WERFER_KOSTEN}${TX.gear_4}`:"";
    openSheet(`${TX.hideout}${beuteText(nest)?`${TX.your_loot_is_here}${beuteText(nest)}${TX.a_raid_gets_it}`:""}${TX.defence}${Math.round(nest.hp)}${TX.you_can_pull_the}${avail.length}${TX.posts_strength_about}${str}. <b>${mitAus}${TX.posts_have_enough_gear}${wZeile}<div class="opt ${ok?"":"off"}" ${ok?'data-go="1"':""}${TX.raid_with_every_available}${avail.length?"":TX.build_guard_posts_first}</span></div><em>${cost}</em></div>`,
      ()=>{ const w=document.querySelector("[data-wf]"); if(w) w.onclick=()=>{ werferSchuss(nest); if(nest.alive) cityTap(x,y); else $("sheet").innerHTML=""; };
        const b=document.querySelector("[data-go]"); if(b) b.onclick=()=>{ S.money-=cost; S.razzias++; S.razziaT=S.t; const ni=S.nests.indexOf(nest);
        avail.forEach(po=>{ po.away=true; const eq=po.stock>=10; if(eq) po.stock-=10;   // Ausrüstung kommt mit
          S.squads.push({x:po.x,y:po.y,home:{x:po.x,y:po.y},post:po,nest:ni,hp:eq?14:10,eq}); }); $("sheet").innerHTML=""; }; });
    return; }
  const mann=S.squads.find(q=>dist(q,{x,y})<0.6);
  if(mann){ const trupp=S.squads.filter(q=>q.nest===mann.nest&&!q.back), n2=S.nests[mann.nest], mit=trupp.filter(q=>q.eq).length;
    openSheet(`${TX.raid_in_progress}${trupp.length}${TX.guards_on_the_way}${mit}${TX.of_them_with_gear}${Math.round(n2.hp)}${TX.of_2}${Math.round(n2.max)}${TX.tap_the_hideout_and}`,
      ()=>{ const b=document.querySelector("[data-rc]"); if(b) b.onclick=()=>{ trupp.forEach(q=>q.back=true); pop(n2,TX.squad_turning_back,"#7A7366"); $("sheet").innerHTML=""; }; });
    return; }
  // Ein Viertel, ein Fenster. Vorher entschied die Tippstelle, welche der drei Varianten kam,
  // und ein Viertel mit Laden gab gar kein Fenster mehr, sondern einen Wachposten.
  const shopD=S.districts.find(d=>dist(d,{x,y})<0.95||dist(ladenOrt(d),{x,y})<0.5||dist(boutiqueOrt(d),{x,y})<0.5);
  if(shopD){ viertelSheet(shopD); return; }
  const dcy=(S.decoys||[]).find(p=>dist(p,{x,y})<0.75);
  if(dcy){ const rc=Math.round((dcy.max-dcy.hp)*1.5), ok=rc>0&&S.money>=rc;
    openSheet(`${TX.decoy_a_truck_full}${Math.round(dcy.hp)}${TX.of_2}${dcy.max}.</p>
      <div class="opt ${ok?"":"off"}" ${ok?'data-go="1"':""}${TX.load_fresh_boxes}${rc||""}${TX.remove}`,
      ()=>{ const b=document.querySelector("[data-go]"); if(b) b.onclick=()=>{ S.money-=rc; dcy.hp=dcy.max; $("sheet").innerHTML=""; };
        document.querySelector("[data-rm]").onclick=()=>{ S.decoys=S.decoys.filter(o=>o!==dcy); $("sheet").innerHTML=""; }; });
    return; }
  const post=S.posts.find(p=>dist(p,{x,y})<0.75);
  if(post){ const rc=Math.round((post.max-post.hp)*3), ok=rc>0&&S.money>=rc;
    // Nach einer Razzia kommen alle Posten beschädigt zurück. Einer nach dem anderen ist Arbeit ohne Entscheidung.
    const kaputt=S.posts.filter(q=>q.hp<q.max), rcAll=Math.round(kaputt.reduce((a2,q)=>a2+(q.max-q.hp)*3,0)), okAll=rcAll>0&&S.money>=rcAll;
    // Eigene Variable statt Backtick im Backtick, sonst zerschneidet der Textextraktor die englische Fassung
    const alleZeile = kaputt.length>1 ? `<div class="opt ${okAll?"":"off"}" ${okAll?'data-all="1"':""}${TX.repair_every_guard_post}${kaputt.length}${TX.posts_are_damaged_after}${rcAll}</em></div>` : "";
    openSheet(`${TX.guard_post_condition}${Math.round(post.hp)}${TX.of_2}${post.max}${TX.supply}${post.stock}${TX.of_2}${postMax()}, ${inRange(post)?TX.refilled_directly:TX.needs_a_supply_van}.${post.away?TX.the_people_are_out:""}</p>
      ${post.away?`${TX.call_the_squad_back}`:""}
      <div class="opt ${ok?"":"off"}" ${ok?'data-go="1"':""}${TX.repair}${rc||""}</em></div>
      ${alleZeile}${TX.move_then_tap_an}`,
      ()=>{ const b=document.querySelector("[data-go]"); if(b) b.onclick=()=>{ S.money-=rc; post.hp=post.max; $("sheet").innerHTML=""; };
        const ab=document.querySelector("[data-all]"); if(ab) ab.onclick=()=>{ if(S.money<rcAll) return; S.money-=rcAll; kaputt.forEach(q=>q.hp=q.max); pop(post,TX.all_repaired,"#1F7A55"); $("sheet").innerHTML=""; };
        const rcb=document.querySelector("[data-rc]"); if(rcb) rcb.onclick=()=>{ S.squads.forEach(q=>q.back=true); $("sheet").innerHTML=""; };
        const mv=document.querySelector("[data-mv]"); if(mv) mv.onclick=()=>{ S.movePost=post; $("sheet").innerHTML=""; pop(post,TX.tap_an_empty_square,"#1F7A55"); };
        const sl=document.querySelector("[data-sell]"); if(sl) sl.onclick=()=>{ S.money+=60; S.ammo=Math.min(S.ammoCap,S.ammo+post.stock); S.posts=S.posts.filter(o=>o!==post); $("sheet").innerHTML=""; }; });
    return; }
  if(S.movePost){ const mp=S.movePost; S.movePost=null; if(S.posts.includes(mp)&&dist({x,y},HQ)>=0.9){ mp.x=Math.floor(x)+.5; mp.y=Math.floor(y)+.5; pop(mp,"verschoben","#1F7A55"); } return; }
  const c=postCost(), ok=S.money>=c;
  const inside=dist({x:Math.floor(x)+.5,y:Math.floor(y)+.5},HQ)<=SUPPLY_R;
  openSheet(`${TX.guard_post_guards_catch}${postMax()}${TX.supplies_at_the_post}${S.seen.firstPost?(dist({x:Math.floor(x)+.5,y:Math.floor(y)+.5},HQ)<=1.8?TX.right_by_the_tower:TX.a_new_post_starts):TX.your_first_post_comes} ${inside?TX.this_spot_is_inside:TX.this_spot_is_outside}</p>
    <div class="opt ${ok?"":"off"}" ${ok?'data-go="1"':""}${TX.build_post}${c}</em></div>
    ${S.awake?`<div class="opt ${S.money>=120&&(S.decoys||[]).length<3?"":"off"}" ${S.money>=120&&(S.decoys||[]).length<3?'data-dc="1"':""}${TX.place_a_decoy_a}`:""}`,
    ()=>{ const dcb=document.querySelector("[data-dc]"); if(dcb) dcb.onclick=()=>{ S.money-=120; S.decoys=S.decoys||[]; S.decoys.push({x:Math.floor(x)+.5,y:Math.floor(y)+.5,hp:40,max:40}); $("sheet").innerHTML=""; };
      const b=document.querySelector("[data-go]"); if(b) b.onclick=()=>{ postBauen(x,y); $("sheet").innerHTML=""; }; });
}
// Wachposten bauen, von der Karte aus oder aus dem Viertel heraus
function postBauen(x,y){ const c=postCost(); if(S.money<c) return;
  const p={x:Math.floor(x)+.5, y:Math.floor(y)+.5};
  if(S.posts.some(q=>dist(q,p)<0.7)) return;
  S.money-=c; const first=!S.seen.firstPost; S.seen.firstPost=true;
  const nearHQ=dist(p,HQ)<=1.8;
  S.posts.push({x:p.x,y:p.y,hp:70,max:70,cd:0,stock:first?postMax():nearHQ?10:0});
  if(first) pop(p,"Grundausstattung","#C98A1B"); else if(!inRange(p)) pop(p,TX.empty_needs_supplies,"#B8432F"); }

function truckState(tr){ return tr.wait?"voll":TX.driving; }
function removeTruck(src){ const i=S.sources.indexOf(src);
  const cand=S.trucks.filter(t=>t.src===i).sort((a,b)=>(b.dir===-1?1:0)-(a.dir===-1?1:0))[0];
  if(!cand) return; if(cand.cargo){ const room=S.lagerCap-S.lager[src.k]; S.lager[src.k]+=Math.max(0,Math.min(room,cand.cargo)); }
  S.trucks=S.trucks.filter(t=>t!==cand); src.trucks--; }
function fleetSheet(){ reopen=fleetSheet;
  const fc=fleetCost(), steht=S.trucks.filter(t=>t.wait).length, cost=Math.round((fleetUsed()-steht*2/3)*truckUpkeep*60);
  let h=`${TX.fleet}${fleetUsed()}${TX.of_2}${S.fleet}${TX.slots_taken}${cost}${TX.per_minute_in_total}${steht?", "+steht+TX.of_them_idle_and:""}${TX.every_raw_material_has}${S.lagerCap}${TX.slots_leather}${S.lager.leder}${TX.rubber_2}${S.lager.gummi}${TX.metal_2}${S.lager.metall}.</p>`;
  if(fleetUsed()>=S.fleet) h+=`${TX.all}${S.fleet}${TX.slots_are_taken_for}`;
  S.sources.forEach((src,i)=>{ const trs=S.trucks.filter(t=>t.src===i);
    const st=trs.map(truckState);
    const status = !trs.length ? TX.no_route : st.includes("voll") ? TX.waiting+(src.k==="leder"?TX.leather:src.k==="gummi"?TX.rubber:TX.metal)+TX.bay_full : "fahren";
    const addCost=src.trucks?90:routeCost(src), canAdd=fleetUsed()<S.fleet&&S.money>=addCost;
    h+=`<div class="frow"><div><b>${src.n||RAW[src.k].n} <span style="font-weight:600">· ${src.k==="metall"?TX.centre:i<2?TX.near:TX.far_out}</span></b><span><span style="color:${/voll|full/.test(status)?"var(--bad)":"inherit"}">${status}</span>${S.uhr?` · an <b>${zielName(src)}</b>`:""}</span></div>
      <button data-rm="${i}" ${trs.length?"":"disabled"}>−</button><div class="cnt">${trs.length}</div>
      <button data-ad="${i}" ${canAdd?"":"disabled"} title="${addCost}">+</button></div>`; });
  const vok=fleetUsed()<S.fleet&&S.money>=150;
  h+=`${TX.supply_van_brings_gear}${S.vans.length?"":"disabled"}>−</button><div class="cnt">${S.vans.length}</div><button data-va="1" ${vok?"":"disabled"} title="150">+</button></div>`;
  if(S.uhr){ const lok=S.money>=LIEFER_PREIS&&fleetUsed()<S.fleet;
    h+=`${TX.van_for_straps_brings}${LIEFER_LADUNG()}${TX.straps_up_per_trip}${(S.liefer2||[]).length?"":"disabled"}>−</button><div class="cnt">${lieferWagen().length}</div>
      <button data-la="1" ${lok?"":"disabled"} title="${LIEFER_PREIS}">+</button></div>`; }
  const fok=S.money>=fc;
  h+=`<div class="opt ${fok?"":"off"}" ${fok?'data-fl="1"':""}${TX.make_fleet_bigger_room}${fc}</em></div>`;
  const lc=Math.round(300*Math.pow(1.35,Math.max(0,S.lagerCap-40)/20)), lok=S.money>=lc;
  h+=`<div class="opt ${lok?"":"off"}" ${lok?'data-lg="1"':""}${TX.make_storage_bigger_20}${lc}</em></div>`;
  const ac=Math.round(250*Math.pow(1.5,(S.ammoCap-60)/40)), aok=S.money>=ac;
  h+=`<div class="opt ${aok?"":"off"}" ${aok?'data-al="1"':""}${TX.make_gear_store_bigger}${S.ammoCap}${TX.t_40_more_so_the}${ac}</em></div>`;
  h+=`${TX.plus_on_a_new}`;
  openSheet(h,()=>{
    document.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{ removeTruck(S.sources[+b.dataset.rm]); fleetSheet(); });
    document.querySelectorAll("[data-ad]").forEach(b=>b.onclick=()=>{ const src=S.sources[+b.dataset.ad], c=src.trucks?90:routeCost(src); if(S.money<c) return; S.money-=c; addTruck(src); fleetSheet(); });
    const la=document.querySelector("[data-la]"); if(la) la.onclick=()=>{ lieferKaufen(); fleetSheet(); };
    const lr=document.querySelector("[data-lr]"); if(lr) lr.onclick=()=>{ const w=(S.liefer2||[]).pop();
      if(w){ S.parts.band=(S.parts.band||0)+(w.cargo||0); S.money+=Math.round(LIEFER_PREIS*0.4); } fleetSheet(); };
    const f=document.querySelector("[data-fl]"); if(f) f.onclick=()=>{ S.money-=fc; S.fleet++; fleetSheet(); };
    const al=document.querySelector("[data-al]"); if(al) al.onclick=()=>{ S.money-=ac; S.ammoCap+=40; fleetSheet(); };
    const va=document.querySelector("[data-va]"); if(va) va.onclick=()=>{ if(S.money<150) return; S.money-=150; S.vans.push({state:"home",cargo:0,pos:{x:HQ.x,y:HQ.y},d:0}); fleetSheet(); };
    const vr=document.querySelector("[data-vr]"); if(vr) vr.onclick=()=>{ const v=S.vans.find(v=>v.state==="home")||S.vans[0]; if(v){ S.ammo+=v.cargo||0; S.vans=S.vans.filter(o=>o!==v); } fleetSheet(); };
    // (Wagen fahren Rundtouren)
    const g=document.querySelector("[data-lg]"); if(g) g.onclick=()=>{ S.money-=lc; S.lagerCap+=20; fleetSheet(); };
  });
}
function addTruck(src){ const i=S.sources.indexOf(src), p=pathOf(src); src.trucks++;
  S.trucks.push({src:i,path:p,d:0,dir:-1,cargo:0,pos:{...p[0]}}); }

/* ================= Ein Viertel: alles an einem Ort ================= */
const ladenPreis=()=>500+S.districts.filter(d=>d.shop).length*300;
const vOpt=(ok,attr,titel,text,preis)=>`<div class="opt ${ok?"":"off"}" ${ok?attr:""}><div><b>${titel}</b><span>${text}</span></div><em>${preis?preis.toLocaleString("de-DE"):""}</em></div>`;
function viertelSheet(d){ reopen=()=>viertelSheet(d);
  const blocked=d.nest!==undefined, gross=d.flagship;
  let h=`<h3>${d.n}</h3><p>${blocked?TX.a_gang_sits_here
    :gross?TX.your_flagship_store_stands
    :TX.on_the_left_is}</p>`;
  if(d.shop&&!gross) h+=`${TX.sneaker_shop_is_open}`;
  if(d.boutique) h+=`${TX.boutique_is_open}`;
  if(!blocked&&!d.shop){ const c=ladenPreis();
    h+=vOpt(S.money>=c,'data-go="1"',TX.open_a_sneaker_shop,TX.sells_pairs_from_sohle,c); }
  if(!blocked&&S.uhr&&!d.boutique){ const bc=boutiquePreis();
    h+=vOpt(S.money>=bc,'data-bt="1"',TX.open_a_boutique_for,TX.about_every_fourteen_seconds,bc); }
  if(!blocked&&grossOffen()){ const gc=grossPreis(), gok=S.money>=gc;
    h+=`${TX.big_project_once_per}`;
    h+=vOpt(gok,'data-fs="sohle"',TX.flagship_store_for_sneakers,TX.sells_twice_as_often,gc);
    if(S.uhr) h+=vOpt(gok,'data-fs="uhren"',TX.flagship_store_for_watches,TX.sells_almost_twice_as,gc); }
  { const pc=postCost(); h+=vOpt(S.money>=pc,'data-wp="1"',TX.build_a_guard_post_3,TX.catches_thieves_nearby_needs,pc); }
  openSheet(h,()=>{
    const b=document.querySelector("[data-go]"); if(b) b.onclick=()=>{ const c=ladenPreis(); if(S.money<c) return; S.money-=c; d.shop=true; $("sheet").innerHTML=""; };
    const bt=document.querySelector("[data-bt]"); if(bt) bt.onclick=()=>{ boutiqueBauen(d); $("sheet").innerHTML=""; };
    document.querySelectorAll("[data-fs]").forEach(f=>f.onclick=()=>{ const art=f.dataset.fs, gc=grossPreis(); if(S.money<gc) return;
      S.money-=gc; S.flagship=art; d.flagship=art;
      if(art==="sohle") d.shop=true; else boutiqueBauen(d,true);   // im Flagship-Preis ist die Boutique schon drin
      once("flagship","Dein Flagship-Store",`${TX.your_flagship_store_now}${d.n}${TX.it_sells}${art==="sohle"?TX.sneakers_twice_as_often:TX.watches_almost_twice_as}${TX.than_a_normal_shop}${art==="sohle"?TX.counterfeiters_2:TX.replicas}${TX.turn_up_there_twice}`);
      $("sheet").innerHTML=""; });
    const w=document.querySelector("[data-wp]"); if(w) w.onclick=()=>{ postBauen(Math.floor(d.x)+.5,Math.floor(d.y)+.5); $("sheet").innerHTML=""; }; });
}
