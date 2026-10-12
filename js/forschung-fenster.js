// Forschungsfenster
const etaTxt=e=> e===null?"": e===-1?"wird berechnet": e===Infinity?TX.stalled: e<60?TX.under_a_minute_left:TX.about+Math.ceil(e/60)+" Min";
function researchSheet(){ reopen=researchSheet;
  const T=resTech(), pct=resPct(), hasLab=S.floors.some(F=>F.slots.some(m=>m&&m.t==="lab"));
  let h=`${TX.research_pick_what_you}${resFertig()}${TX.of_2}${FW_FORSCHUNGEN}${TX.research_steps_for_fashion}`;
  if(T){ const blk=resBlock();
    h+=`<div style="background:var(--bg);border:2px solid var(--ink);border-radius:12px;padding:12px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-weight:800"><span>${T.n}</span><span>${blk?TX.stalled_2:etaTxt(resEta())}</span></div>
      <div style="height:12px;background:var(--line);border-radius:7px;overflow:hidden;margin:8px 0 6px"><i style="display:block;height:100%;width:${pct}%;background:#7B5BC0"></i></div>
      ${blk?`<div style="color:var(--bad);font-weight:700;font-size:13px">${blk.msg}</div><button id="showme" style="margin-top:8px;appearance:none;font:inherit;font-weight:800;border:0;border-radius:9px;padding:9px 14px;background:var(--ink);color:var(--card);cursor:pointer">Zeig mir wo</button>`:""}</div>`; }
  else h+=`${TX.nothing_is_being_researched}`;
  if(!hasLab&&!T) h+=`${TX.you_don_t_have_4}`;
  if((S.resQ||[]).length) h+=`<p style="margin-top:-4px">Danach in dieser Reihenfolge: ${S.resQ.map((k,i)=>(i+1)+". "+TECH.find(x=>x.k===k).n).join(" · ")}</p>`;
  for(const X of TECH){ const done=RES()[X.k], cur=S.curRes===X.k, warte=(S.resQ||[]).indexOf(X.k);
    h+=`<div class="opt ${done?"off":""}" ${done||cur?"":`data-rs="${X.k}"`} style="${cur?"border-color:#7B5BC0;box-shadow:inset 0 0 0 1px #7B5BC0":warte>=0?"border-color:var(--dim)":""}">
      <div><b>${X.n}${done?TX.researched:cur?TX.running:warte>=0?TX.queued:""}</b><span>${X.d}</span><span style="display:block;margin-top:4px">${Object.keys(X.cost).map(k=>shoeIcon(k,20)).join(" ")}</span></div><em>${done?"✓":cur?pct+"%":warte>=0?(warte+2)+".":TX.pick}</em></div>`; }
  openSheet(h,()=>{ document.querySelectorAll("[data-rs]").forEach(b=>b.onclick=()=>{ selectRes(b.dataset.rs); researchSheet(); });
    const sm=$("showme"); if(sm) sm.onclick=()=>{ const b=resBlock(); if(b) b.go(); }; });
}
