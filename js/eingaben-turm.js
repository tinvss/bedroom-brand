// Menüs im Turm: Platz, Maschine, Warenannahme, Etage, Aufzug
/* ================= Eingaben: Turm ================= */
let reopen=null, sheetGeld=0, sheetT=0;
// Ein offenes Fenster baut sich nur neu auf, wenn es dort etwas Gesperrtes gibt und das Geld
// inzwischen reicht. Sonst würde es dauernd neu zeichnen und Tipps verschlucken.
function sheetAuffrischen(dt){ if(!S||!reopen||!$("sheet").innerHTML) return;
  sheetT+=dt; if(sheetT<1) return; sheetT=0;
  if(S.money<=sheetGeld) { sheetGeld=Math.min(sheetGeld,S.money); return; }
  const gesperrt=[...document.querySelectorAll("#sheet .opt.off, #sheet button:disabled")];
  if(!gesperrt.length){ sheetGeld=S.money; return; }
  // Die Scrollstelle merken, sonst springt ein langes Fenster wie der Fuhrpark bei jedem Aufbau nach oben
  const box=document.querySelector("#sheet .in"), pos=box?box.scrollTop:0;
  reopen();
  const neu=document.querySelector("#sheet .in"); if(neu&&pos) neu.scrollTop=pos; }
function openSheet(html,bind){ $("sheet").innerHTML=`<div class="sheet"><div class="in">${html}${TX.close}`;
  $("cl").onclick=()=>{ $("sheet").innerHTML=""; reopen=null; }; bind&&bind();
  // Tipp neben das Fenster schließt es auch. Katya hat genau das versucht.
  const hg=document.querySelector("#sheet .sheet");
  if(hg) hg.onclick=e=>{ if(e.target===hg){ $("sheet").innerHTML=""; reopen=null; } };
  sheetGeld=S?S.money:0;
  document.querySelectorAll("#sheet .opt.off").forEach((el,_,all)=>el.onclick=()=>{ if(!reopen) return;
    const idx=[...document.querySelectorAll("#sheet .opt")].indexOf(el); reopen();
    const el2=document.querySelectorAll("#sheet .opt")[idx]; if(el2&&!el2.classList.contains("off")) el2.click(); }); }
// Großprojekte kosten nicht fix, sondern so viel wie 20 Minuten Umsatz
const machPreis=(W,k)=>W.mach[k].gross?ratePreis():W.mach[k].cost;
let moving=null;
function openSlot(f,i){ const W=aktivesWerk(); if(!W||!W.floors[f]) return;   // Etage gibt es in diesem Haus nicht
  if(!moving) reopen=()=>openSlot(f,i);
  if(moving){ const a=moving; moving=null; if(a.haus!==aktivesHaus().id||!W.floors[a.f]) return;   // nur innerhalb eines Hauses verschieben
    const A=W.floors[a.f].slots,B=W.floors[f].slots,t=B[i]; B[i]=A[a.i]; A[a.i]=t; return; }
  const m=W.floors[f].slots[i];
  if(!m){
    // Eine Ausnahme: Für das Armband des Meisterstücks kommt der erste Mitarbeiter auf seinen alten Platz zurück.
    if(W.name==="sohle"&&S.uhr&&S.mw&&S.mw.phase==="sammeln"&&!S.mw.teile.band&&!mitarbeiterDa()){
      const c=mitarbeiterPreis(), ok=S.money>=c;
      openSheet(`${TX.your_first_employee_this}${ok?"":"off"}" ${ok?'data-hb="1"':""}><div style="display:flex;gap:10px;align-items:center">${machIcon("bench")}${TX.bring_him_back_a}${c}</em></div>`,
        ()=>{ const b=document.querySelector("[data-hb]"); if(b) b.onclick=()=>{ S.money-=c; S.mw.zurueckgeholt=true;
          W.floors[f].slots[i]={t:"bench",buf:{},busy:false,p:0,model:"runner",lvl:0,born:S.t}; $("sheet").innerHTML=""; }; });
      return; }
    if(W.name==="sohle"&&S.uhr){ openSheet(`${TX.sohle_is_finished_since}`); return; }
    let h=`<h3>${f===0&&!S.factory?TX.bedroom:f+1+TX.floor}${TX.spot}${i+1}${TX.goods_run}${dirOf(f)===1?TX.to_the_right:TX.to_the_left}${TX.here}`;
    for(const [k,M] of Object.entries(W.mach)){
      const grossZu=M.gross&&!werkstattKaufbar(), preis=machPreis(W,k);
      const locked=(M.factory&&!S.factory)||(k==="lab"&&W.floors.length<3)||grossZu, ok=!locked&&S.money>=preis;
      h+=`<div class="opt ${ok?"":"off"}" ${ok?`data-b="${k}"`:""}><div style="display:flex;gap:10px;align-items:center">${machIcon(k)}<div><b>${M.n}</b><span>${grossZu?werkstattGrund():locked?(k==="lab"&&S.factory?MACH_LOCK.lab:"Erst ab "+FACTORY_AT+" verkauften Paaren"):M.d}</span></div></div><em>${preis}</em></div>`; }
    openSheet(h,()=>document.querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{ const k=b.dataset.b; S.money-=machPreis(W,k);
      W.floors[f].slots[i]={t:k,buf:{},busy:false,p:0,model:Object.keys(W.models)[0],lvl:0,born:S.t};
      if(k==="werkstatt") meisterStart();   // der Raum steht, der Auftrag liegt darin
      $("sheet").innerHTML=""; }));
    return; }
  if(m.t==="werkstatt"){ meisterSheet(); return; }   // die Werkstatt zeigt den Auftrag, nicht Puffer und Vorrang
  const M=W.mach[m.t];
  const nd=bedarfVon(W,m)||{}, fehlt=Object.keys(nd).filter(k=>(m.buf[k]||0)<nd[k]);
  // Einzahl und Mehrzahl, damit "1 Uhrwerke" nicht dasteht
  const TEILE={leder:[TX.leather,TX.leather],gummi:[TX.rubber,TX.rubber],metall:[TX.metal,TX.metal],schaft:[TX.upper,TX.uppers],sohle:[TX.sole,TX.soles],
    sand:["Sand","Sand"],band:[TX.leather_strap,TX.leather_straps],gehaeuse:[TX.case,TX.case],glas:[TX.glass_2,TX.glass_2],zahnrad:[TX.gear_2,TX.gears],
    uhrwerk:[TX.movement,TX.movements_2],fertig:W.name==="uhren"?[TX.finished_watch,TX.finished_watches]:[TX.finished_shoe,TX.finished_shoes]};
  const teilName=(k,n)=>(TEILE[k]||[k,k])[n===1?0:1];
  const bufTxt=Object.entries(m.buf||{}).filter(([k,v])=>v>0).map(([k,v])=>v+" "+(W.models[k]?W.models[k].n:teilName(k,v))).join(", ");
  let h=`<h3>${M.n}</h3><p>${M.d}</p>`;
  // Kein verschachteltes Backtick weiter unten: der Textextraktor für die englische Fassung bricht daran ab
  const vorrangSatz = fehlt.some(k=>meisterVorrang(W,k)) ? TX.the_order_in_your : "";
  if(m.out) h+=`${TX.stuck_the_finished_part}`;
  else if(sattVonForschung(m)) h+=`${TX.everything_researched}${m.t==="lab"?TX.the_lab_takes_no:TX.the_atelier_takes_no}</p>`;
  else if(m.full) h+=`${TX.paused_the_gear_store}`;
  else if(fehlt.length&&!m.busy) h+=`${TX.missing}${fehlt.map(k=>(nd[k]>1?nd[k]+" ":"")+teilName(k,nd[k])).join(", ")}${vorrangSatz}</p>`;
  h+=`${TX.made}${m.made||0}</b>${bufTxt?TX.in_buffer+bufTxt:TX.buffer_empty}${m.prio?TX.has_priority:""}</p>`;
  if(M.t&&M.t.length>1){ const nx=(m.lvl||0)+1, c=(M.up||[0,60,300])[nx];
    if(nx<M.t.length){ const ok=S.money>=c; h+=`<div class="opt ${ok?"":"off"}" ${ok?'data-tr="1"':""}><div><b>${m.t==="bench"?TX.train:TX.upgrade}${TX.then_needs}${M.t[nx]}${TX.ticks_per_piece_instead}${M.t[m.lvl||0]}${TX.takte_pro_stck}${c}</em></div>`; }
    else h+=`<p><b>${m.t==="bench"?"Voll ausgebildet.":"Voll ausgebaut."}</b></p>`; }
  // Modellwahl bei jeder Maschine, die nach Modell baut: Montage in Sohle, Endmontage in der Manufaktur
  if(W.mach[m.t].need==="modell") for(const [k,Mo] of Object.entries(W.models)){ const ok=W.open?W.open[k]:S.open[k];
    const braucht=Object.entries(Mo.need).map(([t,n])=>n+" "+teilName(t,n)).join(", ");
    h+=`<div class="opt ${ok?"":"off"}" ${ok?`data-mo="${k}"`:""}><div><b>${Mo.n}${m.model===k?TX.running:""}</b><span>${ok?TX.needs+braucht:TX.not_designed_yet}</span></div><em>${ok?Mo.p0:Mo.unlock}</em></div>`; }
  // Regler für Lederbänder: nur in Sohle und erst, wenn es die Manufaktur gibt
  if(m.t==="cut"&&W.name==="sohle"&&S.uhr){ const a=Math.round((S.bandAnteil||0)*100);
    h+=`${TX.leather_straps_for_the}${a}${TX.of_all_cuts_the}${[0,25,50,75,100].map(v=>`<button data-band="${v}" style="flex:1;appearance:none;font:inherit;font-weight:800;font-size:13px;padding:9px 0;border-radius:9px;border:1px solid var(--line);cursor:pointer;background:${v===a?"var(--ink)":"var(--card)"};color:${v===a?"var(--card)":"var(--soft)"}">${v} %</button>`).join("")}</div>`; }
  if(Object.keys(bedarfVon(W,m)||{}).some(k=>W.lager[k]!==undefined)) h+=`${TX.vorrang}${m.prio?TX.remove_priority:TX.give_priority}</b><span>${m.prio?TX.currently_gets_twice_as:TX.gets_twice_as_much}</span></div><em>${m.prio?TX.on:""}</em></div>`;
  if(m.t==="lab"||m.t==="atelier") h+=`${TX.open_research_this_is}`;
  h+=`${TX.move_then_tap_a}`;
  h+=`${TX.remove_you_get_everything}${M.cost}</em></div>`;
  openSheet(h,()=>{
    const tr=document.querySelector("[data-tr]"); if(tr) tr.onclick=()=>{ const c=(M.up||[0,60,300])[(m.lvl||0)+1]; if(S.money<c) return; S.money-=c; m.lvl=(m.lvl||0)+1; $("sheet").innerHTML=""; };
    document.querySelectorAll("[data-mo]").forEach(b=>b.onclick=()=>{ m.model=b.dataset.mo; m.buf={}; m.busy=false; $("sheet").innerHTML=""; });
    const fo=document.querySelector("[data-fo]"); if(fo) fo.onclick=()=>{ $("sheet").innerHTML=""; $("tForsch").onclick(); };
    document.querySelector("[data-mv]").onclick=()=>{ moving={f,i,haus:aktivesHaus().id}; $("sheet").innerHTML=""; };
    const pr=document.querySelector("[data-pr]"); if(pr) pr.onclick=()=>{ m.prio=!m.prio; $("sheet").innerHTML=""; };
    document.querySelectorAll("[data-band]").forEach(b=>b.onclick=()=>{ S.bandAnteil=+b.dataset.band/100; openSlot(f,i); });
    document.querySelector("[data-se]").onclick=()=>{ S.money+=M.cost; W.floors[f].slots[i]=null; $("sheet").innerHTML=""; };
  });
}

function openIntake(f){ const W=aktivesWerk(); if(!W||!W.floors[f]) return;
  reopen=()=>openIntake(f);
  if(W.name==="sohle"&&S.uhr&&!W.intakes.includes(f)){ openSheet(`${TX.sohle_is_finished_nothing}`); return; }
  const has=W.intakes.includes(f), c=INTAKE_COST[f]||4000, ok=S.money>=c;
  const nextI=W.intakes.filter(x=>x>f).sort((a,b)=>a-b)[0]??W.floors.length;
  const rawUsers=W.floors.slice(f,nextI).some(F=>F.slots.some(m=>m&&["bench","cut","press","equip"].includes(m.t)));
  const lvl=(W.intakeLvl||{})[f]||0, upC=[350,900][lvl]||0;
  openSheet(`${TX.goods_intake}${has?TX.level+(lvl+1):TX.build}</h3><p>${has?TX.this_is_where_material+(lvl===0?TX.one_part_every_two:lvl===1?TX.one_part_per_tick:TX.two_parts_per_tick)+(f>0||lvl>0?TX.straight_into_the_machine:TX.at_the_start_of)+TX.it_supplies_this_floor:TX.so_far_all_material}${TX.important_an_intake_only}${rawUsers?"":`${TX.nothing_here_needs_raw}`}
    ${has?"":`<div class="opt ${ok?"":"off"}" ${ok?'data-go="1"':""}><div><b>Annahme einbauen</b><span></span></div><em>${c}</em></div>`}
    ${has&&lvl<2?`<div class="opt ${S.money>=upC?"":"off"}" ${S.money>=upC?'data-up="1"':""}><div><b>Annahme ausbauen</b><span>${lvl===0?(f===0?TX.delivers_twice_as_often:"Liefert doppelt so oft."):TX.delivers_twice_as_fast}</span></div><em>${upC}</em></div>`:""}
    ${has&&lvl>=2?`<p><b>Voll ausgebaut.</b></p>`:""}`,
    ()=>{ const b=document.querySelector("[data-go]"); if(b) b.onclick=()=>{ S.money-=c; W.intakes.push(f); $("sheet").innerHTML=""; };
      const u=document.querySelector("[data-up]"); if(u) u.onclick=()=>{ S.money-=upC; W.intakeLvl[f]=lvl+1; $("sheet").innerHTML=""; }; });
}
function buildFloor(){ const W=aktivesWerk(), n=W.floors.length, c=etagenPreis(n); if(!S.factory||c===undefined||S.money<c) return;
  S.money-=c; W.floors.push({lane:new Array(L).fill(null), slots:new Array(L).fill(null)}); W.lifts.push({q:[],c:0,lvl:0});
  if(W.floors.length===2) hint("doorHint",[{id:12, tw:()=>doorRect(1), info:true, t:TX.new_floors_get_their}]); }
// Ein Satz zur Weiche oben am Aufzug, mit der letzten Entscheidung und ihrem Grund
const teilName=(W,k)=> k.endsWith("_s")?"beglaubigte "+W.models[k.slice(0,-2)].n : W.models[k]?W.models[k].n : {leder:TX.leather,gummi:TX.rubber,metall:TX.metal,schaft:TX.upper,sohle:TX.sole,ausr:TX.gear_3}[k]||k;
function weicheText(W,up){ let t=TX.there_s_a_switch;
  const w=up&&up.weiche; if(!w) return t;
  const n=teilName(W,w.k), m=w.m&&W.mach[w.m].n;
  return t+TX.last+n+(w.band==="oben" ? TX.to_the_upper_belt+(w.m==="press"||w.m==="bench"||w.m==="asm"?"e ":" ")+m+"."
    : m ? TX.to_the_bypass_belt : TX.to_the_bypass_belt_2+n+".")+"</b>"; }
function openLift(f){ const W=aktivesWerk(); if(!W||!W.lifts[f]) return;
  reopen=()=>openLift(f); const Lf=W.lifts[f], nx=Lf.lvl+1;
  let h=`${TX.lift_one_load_every}${LIFT_SPEED[Lf.lvl]}${TX.ticks}${weicheText(W,W.floors[f+1])}</p>`;
  if(nx<LIFT_SPEED.length){ const c=LIFT_UP[nx], ok=S.money>=c; h+=`<div class="opt ${ok?"":"off"}" ${ok?'data-lu="1"':""}${TX.faster_every}${LIFT_SPEED[nx]}${TX.ticks_2}${c}</em></div>`; }
  openSheet(h,()=>{ const b=document.querySelector("[data-lu]"); if(b) b.onclick=()=>{ S.money-=LIFT_UP[nx]; Lf.lvl=nx; $("sheet").innerHTML=""; }; }); }
