// Tutorial, Hinweise zur richtigen Zeit, Erklärfenster
function once(key,title,html){ if(S.seen[key]) return; if(tutOn&&key==="empty") return;
  const urgent = key==="fac"||key==="raid"||key==="fwgo"||key==="ch2"||key.startsWith("fwlost");
  const tooSoon = !urgent && S.t-(S.lastExplain??-99)<25;
  if(!urgent && ((tutOn&&tutI<TUT.length) || tooSoon)){ S.defer=S.defer||[]; if(!S.defer.some(d=>d.key===key)) S.defer.push({key,title,html}); return; }
  S.lastExplain=S.t;
  if(key==="fac"){ html=`<div class="confetti">${Array.from({length:28},(_,i)=>`<i style="left:${(i*37)%100}%;background:${["#E4572E","#2E6FE4","#1F9E6E","#F2B441","#7B5BC0"][i%5]};animation-delay:${(i%7)*0.12}s;animation-duration:${1.6+(i%5)*0.25}s"></i>`).join("")}</div>`+html; } S.seen[key]=true; paused=true; setPauseUI();
  $("overlay").innerHTML=`<div class="over"><div class="box"><h2>${title}</h2>${html}${TX.continue}`;
  $("ok").onclick=()=>{ $("overlay").innerHTML=""; paused=false; setPauseUI(); }; }

/* ================= Tutorial ================= */
let tutOn=false, tutI=0, tutScrolled=-1, tutQ=[], tutSheetScrolled=null;
const hasM=t=>S.floors.some(F=>F.slots.some(m=>m&&m.t===t));
const emptySlot=pref=>{ const F=S.floors[0]; if(!F.slots[pref]) return [0,pref]; const i=F.slots.findIndex(x=>!x); return i<0?null:[0,i]; };
const TUT=[
 {t:TX.tap_sew_six_stitches, view:"turm", el:()=>$("sew"), done:()=>S.sold+S.fin.runner>=1},
 {t:TX.your_shop_at_home, view:"turm", el:()=>$("sew"), done:()=>S.money>=100||hasM("bench"), prog:()=>Math.round(S.money)+TX.of_100},
 {t:TX.tap_an_empty_spot, optT:TX.take_the_workbench_with, view:"turm", tower:()=>emptySlot(3), opt:'[data-b="bench"]', done:()=>hasM("bench")},
 {t:TX.he_is_still_slow, optT:TX.train_him_he_sews, view:"turm",
   tower:()=>findM(m=>m.t==="bench"), opt:"[data-tr]", done:()=>{ const b=findM(m=>m.t==="bench"); return !b||(S.floors[b[0]].slots[b[1]].lvl||0)>=1; },
   prog:()=>S.money<60?Math.round(S.money)+TX.of_60_in_cash:""},
 {t:TX.tap_the_tannery_that, optT:TX.build_a_route_a, view:"stadt", city:()=>S.sources[0], opt:"[data-go]", done:()=>S.sources[0].trucks>0, prog:()=>S.money<routeCost(S.sources[0])?Math.round(S.money)+TX.of+routeCost(S.sources[0])+TX.in_cash_your_employee:""},
 {t:TX.now_the_rubber_plant, optT:TX.build_a_route_here, view:"stadt", city:()=>S.sources[1], opt:"[data-go]", done:()=>S.sources[1].trucks>0, prog:()=>S.money<routeCost(S.sources[1])?Math.round(S.money)+TX.of+routeCost(S.sources[1])+TX.in_cash:""},
 {t:TX.up_there_is_your, view:"stadt", el:()=>$("fleet"), info:true},
 {t:TX.at_15_pairs_sold, view:"turm", el:()=>$("pairs"), done:()=>S.factory, prog:()=>S.sold+TX.of_15},
 {t:TX.the_workshop_is_open, optT:TX.take_a_cutter_it, view:"turm", tower:()=>emptySlot(0), opt:'[data-b="cut"]', done:()=>hasM("cut")},
 {t:TX.a_press_next_to, optT:TX.the_press_turns_rubber, view:"turm", tower:()=>emptySlot(1), opt:'[data-b="press"]', done:()=>hasM("press")},
 {t:TX.goods_travel_to_the, optT:TX.take_assembly_it_builds, view:"turm", tower:()=>emptySlot(2), opt:'[data-b="asm"]', done:()=>hasM("asm")},
 {t:TX.gangs_are_coming_soon, optT:TX.the_gear_shop_turns, view:"turm", tower:()=>emptySlot(6), opt:'[data-b="equip"]', done:()=>hasM("equip")},
 {t:TX.the_gear_shop_needs, optT:TX.build_route, view:"stadt", city:()=>S.sources[4], opt:"[data-go]", done:()=>S.sources[4].trucks>0, prog:()=>S.money<routeCost(S.sources[4])?Math.round(S.money)+TX.of+routeCost(S.sources[4])+TX.in_cash:""},
 {t:TX.the_green_circle_is, optT:TX.build_a_guard_post, view:"stadt", city:()=>({x:5.5,y:10.5}), opt:"[data-go]", done:()=>S.posts.length>0},
 {t:TX.from_here_it_s, info:true, last:true}
];
function rectOf(st){
  if(st.el){ const e=st.el(); if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height}; }
  if(st.tower){ const t=st.tower(); if(!t) return null; const r=tcv.getBoundingClientRect(), n=aktivesWerk().floors.length, nextH=S.factory&&etagenPreis(n)!==undefined?60:0;
    const Y=ROOF+nextH+(n-1-t[0])*FH, laneY=Y+BAND_Y; return {x:r.left+(X0+t[1]*SLW)*TS, y:r.top+(laneY-76)*TS, w:SLW*TS, h:84*TS}; }
  if(st.tw){ const q=st.tw(); if(!q) return null; const r=tcv.getBoundingClientRect(); return {x:r.left+q.x*TS, y:r.top+q.y*TS, w:q.w*TS, h:q.h*TS}; }
  if(st.k3){ const b=k3Geb(st.k3()); if(!b||!S.k3) return null; const r=k3cv.getBoundingClientRect(), sw=k3Sicht();
    // Zu Beginn des Schritts fährt die Kamera hin, falls nötig. Danach darf man frei wischen.
    if(!st.gefahren&&!k3Fahrt&&!k3Zug){ st.gefahren=true; if(b.x<S.k3.cam||b.x+b.w>S.k3.cam+sw) k3Fahre(b.x+b.w/2-sw/2,0.8); }
    const x0=Math.max(r.left,r.left+(b.x-S.k3.cam)*K3S), x1=Math.min(r.right,r.left+(b.x+b.w-S.k3.cam)*K3S), y0=r.top+(K3_GY-b.h-62)*K3S;
    return {x:x0, y:y0, w:Math.max(20,x1-x0), h:(b.h+62)*K3S}; }
  if(st.zone){ const r=cv.getBoundingClientRect(); return {x:r.left+4, y:r.top+4, w:W*T-8, h:TOPR()*T-8}; }
  if(st.city){ const p=st.city(), r=cv.getBoundingClientRect(), rad=0.62; return {x:r.left+(p.x-rad)*T, y:r.top+(p.y+TOPR()-rad)*T, w:2*rad*T, h:2*rad*T}; }
  return null;
}
function tutUpdate(){
  const ring=$("tutRing"), box=$("tutBox");
  if(!tutOn||$("overlay").innerHTML){ ring.style.display="none"; box.style.display="none"; return; }
  while(tutQ.length&&tutQ[0].done&&tutQ[0].done()) tutQ.shift();
  let st=tutQ[0];
  if(!st){ st=TUT[tutI]; while(st&&st.done&&st.done()){ tutI++; st=TUT[tutI]; } }
  if(!st){ if(tutI>=TUT.length&&!S.tutDone){ S.tutDone=true; S.lastExplain=S.t; } tutOn=false; ring.style.display="none"; box.style.display="none"; return; }
  const fromQ=st===tutQ[0], stepKey=fromQ?"q"+st.id:tutI;
  let text=st.t, r=null;
  const sheetOpen=!!$("sheet").innerHTML;
  if(st.view&&view!==st.view&&!sheetOpen){ const tab=st.view==="stadt"?$("tStadt"):$("tTurm"); const b=tab.getBoundingClientRect(); r={x:b.left,y:b.top,w:b.width,h:b.height};
    text=(st.view==="stadt"?TX.switch_to_the_city:TX.switch_to_the_tower)+st.t; }
  else if(sheetOpen){ const o=st.opt&&document.querySelector(st.opt);
    if(o){ if(tutSheetScrolled!==stepKey){ tutSheetScrolled=stepKey; o.scrollIntoView({block:"nearest"}); }
      const b=o.getBoundingClientRect(); r={x:b.left,y:b.top,w:b.width,h:b.height}; text=st.optT||st.t; }
    else if(st.opt){ const off=[...document.querySelectorAll("#sheet .opt.off")].find(e=>st.optT&&e.textContent.includes((st.optT.match(/(Labor|Zuschnitt|Presse|Montage|Ausrüster|Werkbank|Route|Posten|Runner|Court|Hightop)/)||[])[1]||"@@"));
      const locked=off&&/Erst /.test(off.textContent);
      const c=$("cl"); if(c){ const b=c.getBoundingClientRect(); r={x:b.left,y:b.top,w:b.width,h:b.height}; }
      text=locked?TX.that_s_still_locked:TX.you_don_t_have_3; }
    else r=null; }
  else { r=rectOf(st);
    if(r&&tutScrolled!==stepKey&&(r.y+r.h<40||r.y>innerHeight-190)){ tutScrolled=stepKey; window.scrollBy({top:r.y-innerHeight*0.3,behavior:"smooth"}); } }
  if(r){ ring.style.display="block"; ring.style.left=(r.x+window.scrollX-6)+"px"; ring.style.top=(r.y+window.scrollY-6)+"px"; ring.style.width=(r.w+12)+"px"; ring.style.height=(r.h+12)+"px"; }
  else ring.style.display="none";
  const key=stepKey+"|"+text+"|"+(st.prog?st.prog():"");
  if(box.dataset.key!==key){ box.dataset.key=key;
    box.innerHTML=`<div class="st">${fromQ?TX.what_just_happened:TX.step+(tutI+1)+TX.of_4+TUT.length}</div>${text}${st.prog?`<div style="color:#F2B441;font-weight:800;margin-top:4px">${st.prog()}</div>`:""}${TX.end_tutorial}${st.info?`<button id="tutNext">${st.last?"Los":TX.continue_2}</button>`:""}</div>`;
    $("tutEnd").onclick=()=>{ tutOn=false; tutQ=[]; S.tutDone=true; if(S.tapPause||S.alarmPause){ S.tapPause=false; S.alarmPause=false; paused=false; setPauseUI(); } tutUpdate(); };
    if($("tutNext")) $("tutNext").onclick=()=>{ if(fromQ){ const q=tutQ.shift(); if(q&&q.onNext) q.onNext(); } else tutI++; box.dataset.key=""; tutUpdate(); }; }
  box.style.display="block";
  if(sheetOpen){ box.style.top="calc(12px + env(safe-area-inset-top,0px))"; box.style.bottom="auto"; return; }
  const below = !r || r.y+r.h+170 < innerHeight;
  box.style.top = below ? ((r?r.y+r.h+14:innerHeight-190))+"px" : "auto";
  box.style.bottom = below ? "auto" : (innerHeight-r.y+14)+"px";
}

const towerTop=f=>{ const n=aktivesWerk().floors.length, nextH=S.factory&&etagenPreis(n)!==undefined?60:0; return ROOF+nextH+(n-1-f)*FH; };
function liftRect(f){ if(!aktivesWerk().lifts[f]) return null; const sx=dirOf(f)===1?468:18, Yt=towerTop(f+1)+BAND_Y-20, Yb=towerTop(f)+(f>0?DURCH_Y+8:BAND_Y+14); return {x:sx-8,y:Yt,w:30,h:Yb-Yt}; }
function bandRect(f){ if(!aktivesWerk().floors[f]) return null; const laneY=towerTop(f)+BAND_Y; return {x:X0-6,y:laneY-12,w:SLW*L+12,h:(DURCH_Y-BAND_Y)+24}; }
function doorRect(f){ if(!aktivesWerk().floors[f]) return null; const side=dirOf(f)===1?18:472, laneY=towerTop(f)+BAND_Y; return {x:side-10,y:laneY-80,w:30,h:40}; }
function hint(key,steps,force){ if(S.seen[key]) return; if(!S.tutDone&&tutOn&&tutI<TUT.length&&!force) return; if(!force&&(S.t-(S.lastExplain??-99)<25||$("overlay").innerHTML)) return; S.lastExplain=S.t; S.seen[key]=true; if(!tutOn) tutI=TUT.length; tutOn=true; switchView(steps[0].view||"turm"); tutQ.push(...steps); }
function robGuide(p,src){
  const nPosts=S.posts.length, name=src.k==="leder"?TX.leather:src.k==="gummi"?TX.rubber:TX.metal;
  // Vorschlag: ein freies Feld an dieser Route, möglichst im grünen Kreis
  const path=pathOf(src); let spot=null;
  for(let k=0;k<=20&&!spot;k++){ const q=pointAt(path,pathLen(path)*(1-k/20)); const c={x:Math.floor(q.x)+1.5,y:Math.floor(q.y)+0.5};
    if(dist(c,HQ)<=SUPPLY_R&&dist(c,HQ)>0.9) spot=c; }
  spot=spot||{x:HQ.x+1,y:HQ.y-1.5};
  paused=true; setPauseUI(); if(!tutOn) tutI=TUT.length; tutOn=true; switchView("stadt");
  tutQ.push({id:1, view:"stadt", city:()=>p, info:true, t:`${TX.raid_your}${name}${TX.truck_was_robbed_the}${name}${TX.will_run_short_in}${name}${TX.will_stand_still}`, onNext:()=>{ paused=false; setPauseUI(); }},
    {id:2, view:"stadt", city:()=>spot, opt:"[data-go]", t:TX.this_is_how_you, optT:TX.build_a_guard_post_2, done:()=>S.posts.length>nPosts,
     prog:()=>S.money<postCost()?Math.round(S.money)+TX.of+postCost()+TX.in_cash:""},
    {id:3, view:"stadt", city:()=>S.posts[S.posts.length-1]||spot, info:true, t:TX.the_yellow_bar_on});
}

function shopHint(){ if(S.seen.shopHint||!S.tutDone) return; const fin=Object.values(S.fin).reduce((a,b)=>a+b,0);
  const freeD=S.districts.find(d=>!d.shop&&d.nest===undefined&&d.n!=="Zuhause");
  if(fin>=12&&freeD) hint("shopHint",[{id:"sh1", view:"stadt", city:()=>freeD, info:true,
    t:`${TX.you_re_making_more}${freeD.n}${TX.sells_on_top_of}`}]); }
function intakeHint(){ if(!S.tutDone||S.seen.intakeUp||S.floors.length<3||((S.intakeLvl||{})[0]||0)>0) return;
  hint("intakeUp",[{id:"iu1", view:"turm", tw:()=>doorRect(0), info:true,
    t:TX.this_is_your_goods}]); }
function fwHint(){ if(S.seen.fwHint||!fwOffen()||S.fw) return;
  hint("fwHint",[{id:"fw1", view:"stadt", zone:true, info:true, t:TX.five_research_steps_done}],true); }
function marketHint(){ if(S.seen.mktHint||!S.factory||!S.tutDone) return; const home=S.districts[0];
  if(priceIn(home,"runner")<MODELS.runner.p0*0.8) hint("mktHint",[{id:"mk1", view:"turm", el:()=>document.querySelector(".mk .m"), info:true,
    t:TX.look_at_the_runner}]); }

function guide(target,text){ $("sheet").innerHTML=""; if(!tutOn) tutI=TUT.length; tutOn=true; switchView("turm");
  tutQ.push(Object.assign({id:"g"+Math.round(S.t*10), info:!target.done, t:text, view:"turm"},target)); }

function releaseDeferred(){ if(!S.defer||!S.defer.length||$("overlay").innerHTML||(tutOn&&(tutQ.length||tutI<TUT.length))) return;
  if(S.t-(S.lastExplain??-99)<25) return; const d=S.defer.shift(); once(d.key,d.title,d.html); }
