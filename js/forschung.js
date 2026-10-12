// Forschung: Muster, Fortschritt, Zeitschätzung, was blockiert
/* ================= Forschung ================= */

const resTech=()=>S.curRes&&TECH.find(x=>x.k===S.curRes);
function resPct(){ const T=resTech(); if(!T) return 0; let a=0,b=0; for(const [k,v] of Object.entries(T.cost)){ a+=Math.min(v,S.resProg[k]||0); b+=v; } return Math.floor(a/b*100); }
function checkRes(){ const T=resTech(); if(!T) return;
  if(Object.entries(T.cost).every(([k,v])=>(S.resProg[k]||0)>=v)){ S.research[T.k]=true; S.curRes=null; S.resProg={}; nextRes();
    pop(HQ,"Erforscht: "+T.n,"#7B5BC0");
    hint("resDone",[{id:40, el:()=>$("tForsch"), info:true, t:`${TX.researched_2}${T.n}. ${T.d}${TX.when_a_research_step}`}],true); } }
function addSample(m){ S.sampLog=(S.sampLog||[]).filter(x=>S.t-x.t<90); S.sampLog.push({t:S.t,m}); const T=resTech();
  if(T&&T.cost[m]&&(S.resProg[m]||0)<T.cost[m]){ S.resProg[m]=(S.resProg[m]||0)+1; checkRes(); } else S.rp[m]=(S.rp[m]||0)+1; }
// Wählt man etwas, während schon geforscht wird, kommt es in die Warteschlange. Noch einmal tippen nimmt es wieder raus.
function selectRes(k){ S.resQ=S.resQ||[];
  if(S.curRes&&S.curRes!==k){ const i=S.resQ.indexOf(k); if(i>=0) S.resQ.splice(i,1); else if(!RES()[k]) S.resQ.push(k); return; }
  starteRes(k); }
function nextRes(){ S.resQ=(S.resQ||[]).filter(k=>!RES()[k]); const k=S.resQ.shift(); if(k) starteRes(k); }
function starteRes(k){ S.resStart=S.t; const old=resTech(); if(old) for(const m in S.resProg) S.rp[m]=(S.rp[m]||0)+S.resProg[m];
  S.curRes=k; S.resProg={}; const T=resTech();
  for(const [m,v] of Object.entries(T.cost)){ const take=Math.min(v,S.rp[m]||0); S.resProg[m]=take; S.rp[m]-=take; } checkRes(); }
function sampRate(m){ const log=(S.sampLog||[]).filter(x=>x.m===m&&S.t-x.t<60);
  if(log.length>=2) return (log.length-1)/Math.max(1,log[log.length-1].t-log[0].t);
  if(log.length===1) return S.t-log[0].t>20 ? 1/(S.t-log[0].t) : null;
  return S.t-(S.resStart||0)>25 ? 0 : null; }
function resEta(){ const T=resTech(); if(!T) return null; let e=0; for(const [m,v] of Object.entries(T.cost)){ const rest=v-(S.resProg[m]||0); if(rest<=0) continue; const r=sampRate(m); if(r===null) return -1; if(r<=0) return Infinity; e=Math.max(e,rest/r); } return e; }
function firstEmptyAfterAsm(){ for(let f=0;f<S.floors.length;f++){ const F=S.floors[f], d=dirOf(f); for(let i=0;i<L;i++){ if(!F.slots[i]||F.slots[i].t!=="asm") continue;
    for(let j=i+d;j>=0&&j<L;j+=d) if(!F.slots[j]) return [f,j]; } }
  for(let f=0;f<S.floors.length;f++){ const i=S.floors[f].slots.findIndex(x=>!x); if(i>=0) return [f,i]; } return null; }
const findMW=(W,pred)=>{ for(let f=0;f<W.floors.length;f++) for(let i=0;i<L;i++){ const m=W.floors[f].slots[i]; if(m&&pred(m)) return [f,i]; } return null; };
const findM=(pred)=>{ for(let f=0;f<S.floors.length;f++) for(let i=0;i<L;i++){ const m=S.floors[f].slots[i]; if(m&&pred(m)) return [f,i]; } return null; };
// Welche Muster noch fehlen: "25 Runner, 8 Court". Ohne diese Angabe sieht man nur Prozente.
function resFehlt(T,prog,namen){ if(!T) return [];
  return Object.entries(T.cost).map(([m,v])=>[m,v-((prog||{})[m]||0)]).filter(([,r])=>r>0).map(([m,r])=>({m,r,n:namen[m].n})); }
const resFehltText=(T,prog,namen)=>resFehlt(T,prog,namen).map(x=>x.r+" "+x.n).join(", ");
function resBlock(){ const T=resTech(); if(!T) return null;
  const need=Object.entries(T.cost).filter(([k,v])=>(S.resProg[k]||0)<v).map(([k])=>k);
  if(!findM(m=>m.t==="lab")) return {msg:TX.you_don_t_have_2, go:()=>guide({tower:firstEmptyAfterAsm, opt:'[data-b="lab"]', optT:TX.take_the_lab, done:()=>!!findM(m=>m.t==="lab")},TX.tap_this_spot_here)};
  for(const k of need){ const n=MODELS[k].n;
    if(!S.open[k]) return {msg:`${TX.you_need}${n}${TX.shoes_for_that_design}`, go:()=>guide({el:()=>document.querySelector(`[data-un="${k}"]`), done:()=>S.open[k]},`${TX.this_is_where_you}${n}${TX.after_that_switch_an}${n}${TX.um}`)};
    if(!findM(m=>m.t==="asm"&&m.model===k)) return {msg:`${TX.your_lab_gets_no}${n}${TX.shoes_switch_an_assembly}${n}${TX.um}`, go:()=>guide({tower:()=>findM(m=>m.t==="asm"), opt:`[data-mo="${k}"]`, optT:`${TX.pick_2}${n}.`, done:()=>!!findM(m=>m.t==="asm"&&m.model===k)},`${TX.tap_this_assembly}`)}; }
  for(const k of need) if(S.t-(S.resStart||0)>25 && sampRate(k)===0 && findM(m=>m.t==="lab")) return {msg:`${TX.no}${MODELS[k].n}${TX.shoes_reach_your_labs}${MODELS[k].n}${TX.assembly_in_the_direction}`, go:()=>guide({tower:()=>findM(m=>m.t==="asm"&&m.model===k)},`${TX.that_s_a}${MODELS[k].n}${TX.assembly_a_lab_has}`)};
  if(S.t-(S.resStart||0)>25 && need.every(k=>sampRate(k)===0)) return {msg:TX.your_lab_gets_no_2, go:()=>guide({tower:()=>findM(m=>m.t==="lab"), opt:"[data-mv]", optT:TX.tap_move_then_an},TX.this_lab_sits_before)};
  return null; }
