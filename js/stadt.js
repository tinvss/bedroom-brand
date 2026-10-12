// Simulation in der Stadt: Transporter, Läden, Banden, Wachen, Razzia, Fälscher
/* ================= Stadt ================= */
// Wohin eine Bande zieht: erst in leere Viertel, dann auch neben deine Läden. Zuhause bleibt tabu.
const viertelFrei=()=>S.districts.filter(d=>d.nest===undefined&&d.n!=="Zuhause")
  .sort((a,b)=>(a.shop?1:0)-(b.shop?1:0)||dist(b,HQ)-dist(a,HQ));
// Plätze, auf denen neue Vorkommen auftauchen können
const SRC_SPOTS=[{x:2.5,y:4.2},{x:6.6,y:4.0},{x:1.5,y:8.4},{x:7.6,y:8.8},{x:3.4,y:9.4},{x:5.6,y:6.0},{x:2.2,y:7.0},{x:6.4,y:11.4},{x:1.2,y:3.0},{x:8.2,y:6.6}];
function cityStep(){
  // Transporter
  for(const tr of S.trucks){
    const src=S.sources[tr.src], p=tr.path, Lp=pathLen(p);
    if(tr.dir===-1 && tr.d<=0){ tr.d=0;
      tr.dir=1; tr.cargo=RES().laster?10:6; }
    else if(tr.dir===1 && tr.d>=Lp){ tr.d=Lp;
      if(tr.cargo){ const Z=zielWerk(tr); const room=Z.lagerCap-Z.lager[src.k]; if(room<=0){ tr.wait=true; } else { const n=Math.min(room,tr.cargo); Z.lager[src.k]+=n; stat('in_'+src.k,n); tr.cargo-=n; tr.wait=tr.cargo>0; } }
      if(!tr.cargo) tr.dir=-1; }
    if(!tr.wait) tr.d+=tr.dir*1.3*DT;
    tr.pos=pointAt(p,Math.max(0,Math.min(Lp,tr.d)));
  }
  // Wer wartet oder an einer leeren Quelle steht, kostet nur ein Drittel: kein Sprit, keine Fahrt
  { const faehrt=S.trucks.filter(t=>!t.wait).length, steht=S.trucks.length-faehrt;
    S.money-=(faehrt+S.vans.length+steht/3)*truckUpkeep*DT; }
  // Ohne Quelle für einen Rohstoff, den eine Maschine braucht, steht die Fabrik für immer.
  // Deshalb hier ein Netz darunter: fehlt eine Sorte ganz und ist nichts unterwegs, wird sie angefordert.
  if(S.t-(S.srcCheck||0)>10){ S.srcCheck=S.t;
    const werke=[sohleWerk()].concat(S.uhr?[uhrWerk()]:[]);
    const braucht=k=>werke.some(W=>W&&W.floors.some(F=>F.slots.some(m=>m&&(bedarfVon(W,m)||{})[k])));
    for(const k of ["leder","gummi","metall","sand"])
      if(braucht(k)&&!S.sources.some(s=>s.k===k&&s.left>0)&&!(S.newSrc||[]).some(n=>n.k===k)){
        S.newSrc=S.newSrc||[]; S.newSrc.push({k,t:S.t+10}); } }
  // Neue Vorkommen, wenn eins erschöpft ist
  if(S.newSrc&&S.newSrc.length&&S.t>=S.newSrc[0].t){ const ns=S.newSrc[0];
    // Leer gefahrene Quellen halten keinen Platz mehr besetzt, und notfalls entsteht eine auch neben einem Wachposten
    const frei=p=>!S.sources.some(s=>s.left>0&&dist(s,p)<1.2);
    let spots=SRC_SPOTS.filter(p=>frei(p)&&!S.posts.some(s=>dist(s,p)<0.8));
    if(!spots.length) spots=SRC_SPOTS.filter(frei);
    if(!spots.length){ ns.t=S.t+20; }   // alles dicht: später noch einmal versuchen, nicht verwerfen
    else { S.newSrc.shift(); const p=spots[Math.floor(Math.random()*spots.length)];
      S.sources.push({x:p.x,y:p.y,k:ns.k,left:1500,max:1500,trucks:0});
      pop(p,"Neue "+(ns.k==="leder"?TX.tannery:ns.k==="gummi"?TX.rubber_plant:ns.k==="sand"?TX.sand_pit:TX.metal_yard)+" entdeckt","#1F7A55"); } }
  // Läden verkaufen aus dem Fertiglager
  for(const d of S.districts){ if(!d.shop) continue;
    // Sitzt eine Bande im Viertel, kassiert sie. Der Laden verkauft nichts, bis das Versteck weg ist.
    if(d.nest!==undefined&&S.nests[d.nest]&&S.nests[d.nest].alive){ d.cd=2;
      once("kassiert",TX.they_are_shaking_down,`${TX.a_gang_has_moved}${d.n}${TX.while_they_are_there}`);
      continue; }
    const flag=d.flagship==="sohle";
    d.cd-=DT; for(const m in d.s) d.s[m]*=Math.pow(0.9,DT);
    if(d.cd<=0){ let best=null,bp=0,sealed=false;
      for(const m in MODELS){ if((S.fin[m+"_s"]||0)>0){ const p=sealedIn(d,m); if(p>bp){bp=p;best=m;sealed=true;} }
                              if(S.fin[m]>0){ const p=priceIn(d,m); if(p>bp){bp=p;best=m;sealed=false;} } }
      if(best){ if(flag) bp=Math.round(bp*1.3); S.fin[sealed?best+"_s":best]--; stat('sold'); stat('sold_'+best); stat('umsatz',bp); S.money+=bp; S.earned+=bp; S.sold++; d.s[best]+=1; d.heat[best]+=(sealed?0:1)*(flag?2:1);
        pop(d,"+"+bp,"#1F7A55"); d.cd=flag?0.8:1.6;
        if(sealed){ const mine=S.fakes.filter(f=>f.d===d&&f.m===best); if(mine.length){ const w=mine.reduce((a,b)=>b.str>a.str?b:a); w.str-=(RES().holo?2.2:1.1)/(1+Math.max(0,fakeSkill()-1)*0.4); w.hit=S.t; } } }
      else d.cd=0.5;
      // Wer gut verkauft, lockt Fälscher an
      for(const m in MODELS){ const thr=RES().serien?40:18; if(!S.tutDone||S.exited) d.heat[m]=Math.min(d.heat[m],thr-1); if(d.heat[m]>=thr){ d.heat[m]-=thr; if(S.fakes.filter(f=>f.d===d).length<5){
        const ang=S.fakes.length*2.4; S.fakes.push({d,m,str:Math.min(3.5,0.8+(fakeSkill()-1)),hit:-9,x:d.x+Math.cos(ang)*0.9,y:d.y+Math.sin(ang)*0.55-0.2});
        once("fake",TX.counterfeiters,`${TX.your}${MODELS[m].n}${TX.sells_so_well_in}${d.n}${TX.that_someone_is_copying}`); } } }
    }
  }
  // Banden wachen auf, sobald du in der Stadt Routen fährst
  if(!S.awake && S.factory && S.trucks.length>=1){ S.awake=true; S.wakeT=S.t; S.nests.forEach((n,i)=>n.cd=100+i*35); }
  if(S.awake){
    for(const n of S.nests){ if(!n.alive) continue;
      n.cd-=DT;
      // Die erste Welle wartet, bis gerade keine andere Erklärung läuft. Sonst kommen zwei Fenster hintereinander.
      if(n.cd<=0 && !S.seen.raid && S.t-(S.lastExplain??-99)<20){ n.cd=5; continue; }
      if(n.cd<=0){ const e=evo(), count=1+Math.floor((e-1)*1.1);
        let leben=3*Math.sqrt(e), anzahl=count;   // Wellen werden größer, jeder Dieb wird nur langsam zäher
        // Mit der Manufaktur kommen Crews statt Kleindiebe: halb so viele, dreimal so zäh
        const crew=!!S.uhr; if(crew){ anzahl=Math.max(1,Math.round(count/2)); leben*=3; }
        for(let q=0;q<anzahl;q++) S.raiders.push({x:n.x+(Math.random()-.5)*.6,y:n.y+(Math.random()-.5)*.6,hp:leben,max:leben,cd:0,crew});
        n.cd=(Math.max(11,38-(S.t-S.wakeT)/40)+Math.random()*4)*(S.fw&&S.fw.state==="live"?0.75:1);   // Fashion Week: ein Drittel mehr Angriffe
        if(!S.seen.raid) switchView("stadt");
        once("raid",TX.raids,`${TX.the_first_ones_are}`); }
      n.max=Math.max(n.max,Math.round(40*evo())); n.hp=Math.min(n.max,n.hp+0.8*DT);
      // Verstecke wehren sich: Posten in ihrer Nähe werden sofort angegriffen
      for(const po of S.posts){ if(dist(po,n)<1.4) po.hp-=1.5*DT; }
    }
    // Unbehelligte Verstecke gründen neue. Leere Viertel zuerst, danach auch Viertel mit Laden:
    // sonst hört die Stadt auf zu leben, sobald überall ein Laden steht. Gemessen waren das
    // in zwanzig Minuten 0 neue Verstecke und 0 Diebe.
    if(!S.pend && S.t-S.lastExpand>240 && S.nests.filter(n=>n.alive).length<4){
      S.lastExpand=S.t;
      const free=viertelFrei();
      const d=free[0], alive=S.nests.filter(n=>n.alive);
      if(d&&alive.length){ const src=alive.sort((a,b)=>dist(a,d)-dist(b,d))[0];
        S.pend={di:S.districts.indexOf(d), src:S.nests.indexOf(src), t0:S.t};
        if(!S.seen.pendHint){ S.seen.pendHint=true; S.lastExplain=S.t; if(!tutOn) tutI=TUT.length; tutOn=true; switchView("stadt"); paused=true; setPauseUI();
          tutQ.push({id:"pend1", view:"stadt", city:()=>S.pend?{x:S.districts[S.pend.di].x,y:S.districts[S.pend.di].y-0.6}:HQ, info:true,
            t:`${TX.in}${d.n}${TX.a_gang_is_building}`},
          {id:"pend2", view:"stadt", city:()=>S.nests[S.pend?S.pend.src:0]||HQ, info:true, onNext:()=>{ paused=false; setPauseUI(); },
            t:TX.raid_this_hideout_and}); }
        else pop(d,TX.gang_is_building_a,"#B8432F"); }
    }
    // Sind fast alle Verstecke weg, zieht nach einer Weile eine neue Bande in die Stadt
    if(!S.pend && S.nests.filter(n=>n.alive).length<2 && S.t-(S.lastClear||0)>150){
      const free=viertelFrei();
      if(free.length){ S.pend={di:S.districts.indexOf(free[0]), src:-1, t0:S.t}; pop(free[0],"Neue Bande zieht ein","#B8432F"); } }
    if(S.pend){ const P=S.pend, d=S.districts[P.di], srcN=P.src>=0?S.nests[P.src]:{alive:true};
      if(!srcN||!srcN.alive){ pop(d,"Bau abgebrochen","#1F7A55"); S.pend=null; }
      else if(S.t-P.t0>=60){
        const plaetze=[{x:d.x,y:d.y-0.6},{x:d.x-1,y:d.y-0.5},{x:d.x+1,y:d.y-0.5},{x:d.x,y:d.y+0.7},{x:d.x-1,y:d.y+0.5},{x:d.x+1,y:d.y+0.5}];
        const platz=plaetze.find(p=>p.x>0.3&&p.x<8.7&&!S.posts.some(q=>dist(q,p)<1.3)&&!S.sources.some(q=>dist(q,p)<0.9)&&!S.nests.some(n=>n.alive&&dist(n,p)<1));
        if(!platz){ pop(d,TX.the_gang_backs_off,"#1F7A55"); S.pend=null; }
        // Ein neues Versteck steht sofort so fest wie die alten. Vorher startete es mit 50 Leben,
        // während die Obergrenze schon bei 250 lag: der Balken sah leer aus und es war ein Geschenk.
        else { const leben=Math.max(50,Math.round(40*evo()));
          S.nests.push({x:platz.x,y:platz.y,hp:leben,max:leben,cd:40,alive:true,district:P.di}); d.nest=S.nests.length-1; pop(d,"NEUES VERSTECK","#B8432F"); S.pend=null; } } }
  }
  for(const r of S.raiders){
    if(r.flee){ const home=S.nests.filter(n=>n.alive).sort((a,b)=>dist(a,r)-dist(b,r))[0]||{x:r.x,y:-1};
      const dd=dist(r,home); if(dd<0.4){ r.gone=true; beuteRein(home,r.loot); pop(r,"entkommen","#B8432F"); } else { r.x+=(home.x-r.x)/dd*0.8*DT; r.y+=(home.y-r.y)/dd*0.8*DT; } continue; }
    let best=null,bd=1e9;
    for(const tr of S.trucks){ if(!tr.pos||!tr.cargo) continue; const d=dist(r,tr.pos)*0.8; if(d<bd){bd=d;best={k:"truck",o:tr,p:tr.pos};} }
    for(const v of S.vans){ if(!v.cargo||!v.pos) continue; const d=dist(r,v.pos)*0.7; if(d<bd){bd=d;best={k:"van",o:v,p:v.pos};} }
    for(const dc of (S.decoys||[])){ const d=dist(r,dc)*0.45; if(d<bd){bd=d;best={k:"decoy",o:dc,p:dc};} }
    // Der Lieferwagen mit Bändern ist das beste Ziel: wenige Stücke, hoher Wert
    for(const lw of lieferWagen()){ if(!lw.cargo||lw.state==="laden") continue;
      const d=dist(r,lw.pos)*0.5; if(d<bd){bd=d;best={k:"liefer",o:lw,p:lw.pos};} }
    // Die Expedition trägt das Meteoritengestein. Jede Crew weiß das.
    if(S.mw&&S.mw.exp){ const d=dist(r,S.mw.exp.pos)*0.45; if(d<bd){bd=d;best={k:"exp",o:S.mw.exp,p:S.mw.exp.pos};} }
    for(const po of S.posts){ const d=dist(r,po); if(d<bd){bd=d;best={k:"post",o:po,p:po};} }
    { const d=dist(r,HQ); if(d<bd){bd=d;best={k:"hq",p:HQ};} }
    if(S.uhr){ const o=S.uhr.ort; if(o){ const d=dist(r,o)*0.8; if(d<bd){bd=d;best={k:"werk",p:o};} }
      for(const B of (S.uhr.boutiquen||[])){ const dd=S.districts[B.d]; if(!dd) continue; const d=dist(r,dd)*0.7; if(d<bd){bd=d;best={k:"boutique",o:B,p:dd};} } }
    const dd=dist(r,best.p);
    if(dd>0.45){ r.x+=(best.p.x-r.x)/dd*0.7*DT; r.y+=(best.p.y-r.y)/dd*0.7*DT; }
    else { r.cd-=DT; if(r.cd<=0){ r.cd=1;
      if(best.k==="truck"&&RES().panzer&&Math.random()<0.5){ pop(best.p,"abgewehrt","#1F7A55"); r.flee=true; }
      else if(best.k==="truck"){ pop(best.p,"ausgeraubt","#B8432F"); if(!S.seen.rob){ S.seen.rob=true; robGuide({x:best.p.x,y:best.p.y}, S.sources[best.o.src]); }
        // Wird die lange Metallroute überfallen, findet sich ein Schrottplatz gleich beim Turm
        if(S.sources[best.o.src].k==="metall"&&!S.schrott){ S.schrott=true; const p={x:3.2,y:10.8};
          S.sources.push({x:p.x,y:p.y,k:"metall",n:TX.scrapyard,left:700,max:700,trucks:0});
          pop(p,TX.scrapyard_found,"#1F7A55");
          hint("schrott",[{id:14, city:()=>p, view:"stadt", info:true, t:TX.your_metal_came_all}]); }
        r.loot={k:S.sources[best.o.src].k, n:best.o.cargo}; best.o.cargo=0; r.flee=true; S.alarmT=S.t; }
      if(best.k==="van"){ pop(best.p,TX.supplies_stolen,"#B8432F"); r.loot={ammo:best.o.cargo}; best.o.cargo=0; r.flee=true; S.alarmT=S.t; }
      if(best.k==="liefer"){ if((RES().panzer&&Math.random()<0.5)||(RES2().begleit&&Math.random()<0.6)){ pop(best.p,"abgewehrt","#1F7A55"); r.flee=true; }
        else { pop(best.p,TX.straps_stolen,"#B8432F"); r.loot={k:"band",n:best.o.cargo,parts:true}; best.o.cargo=0; best.o.state="runter"; r.flee=true; S.alarmT=S.t;
          once("liefer","Der Lieferwagen",TX.your_armoured_van_brings); } }
      if(best.k==="exp"){ S.alarmT=S.t;
        if(RES2().begleit&&Math.random()<0.5) pop(best.p,TX.escort_holds,"#1F7A55");
        else { best.o.hp-=r.crew?9:6; best.o.hitT=S.t; if(best.o.hp<=0) expeditionVerloren(); } }
      if(best.k==="post"){ best.o.hp-=r.crew?6:4; S.alarmT=S.t; }
      if(best.k==="decoy"){ best.o.hp-=3; best.o.hitT=S.t; if(Math.random()<0.3) pop(best.p,TX.just_cardboard,"#7A7366"); }
      if(best.k==="werk"&&S.mw&&S.mw.phase==="bau"){ S.alarmT=S.t; meisterUeberfall(); r.flee=true; }
      else if(best.k==="werk"||best.k==="boutique"){ S.alarmT=S.t; const U=S.uhr;
        if(best.k==="boutique"&&RES2().alarm&&Math.random()<0.5){ pop(best.p,"Alarm, geschnappt","#1F7A55"); r.hp=0; }
        else {
        const uhr=RES2().tresor?null:Object.keys(U.fin).find(m=>U.fin[m]>0);
        if(uhr){ U.fin[uhr]--; r.loot={uhr}; pop(best.p,TX.watch_stolen,"#B8432F");
          once("uhrraub",TX.they_re_going_for,TX.the_crews_know_what); }
        else { const st=beuteGeld(120); S.money-=st; pop(best.p,"-"+st+" geklaut","#B8432F"); r.loot={money:st}; }
        r.flee=true; } }
      if(best.k==="flagship"){ S.alarmT=S.t; const fd=best.o; r.loot=r.loot||{};
        if(fd.flagship==="uhren"&&S.uhr){ const u=Object.keys(S.uhr.fin).find(m=>S.uhr.fin[m]>0);
          if(u){ S.uhr.fin[u]--; r.loot.uhr=u; pop(fd,TX.watch_from_the_flagship,"#B8432F"); } }
        else { const k=Object.keys(S.fin).find(m=>S.fin[m]>0); if(k){ S.fin[k]--; r.loot.fin=k; } }
        const st=beuteGeld(90); S.money-=st; r.loot.money=st; pop(fd,"-"+st+TX.from_the_flagship,"#B8432F");
        r.flee=true; }
      else if(best.k==="hq"){ S.alarmT=S.t; const st=beuteGeld(40); S.money-=st; const k=Object.keys(S.fin).find(m=>S.fin[m]>0); if(k) S.fin[k]--; pop(HQ,"-"+st+" geklaut","#B8432F"); r.loot={money:st, fin:k}; r.flee=true; } } }
  }
  if(S.money<0&&!S.seen.notbremse&&S.awake&&!$("overlay").innerHTML){
    const nah=S.raiders.filter(r=>!r.flee).sort((a,b)=>dist(a,HQ)-dist(b,HQ))[0];
    if(nah){ S.seen.notbremse=true; S.lastExplain=S.t; if(!tutOn) tutI=TUT.length; tutOn=true; switchView("stadt"); paused=true; S.tapPause=true; setPauseUI();
      tutQ.push({id:"not1", view:"stadt", city:()=>S.raiders.includes(nah)?nah:HQ, done:()=>S.seen.tapped||!S.raiders.includes(nah),
        t:TX.you_re_in_the},
      {id:"not2", view:"stadt", el:()=>$("fleet"), info:true, onNext:()=>{ if(S.tapPause){ S.tapPause=false; paused=false; setPauseUI(); } },
        t:TX.and_this_is_what}); } }
  if(S.awake&&!S.seen.tapHint){ const near=S.raiders.find(r=>dist(r,HQ)<SUPPLY_R-0.4);
    if(near&&!$("overlay").innerHTML){ S.seen.tapHint=true; if(!tutOn) tutI=TUT.length; tutOn=true; switchView("stadt"); paused=true; S.tapPause=true; setPauseUI();
      tutQ.push({id:31, city:()=>S.raiders.includes(near)?near:HQ, view:"stadt", done:()=>S.seen.tapped||!S.raiders.includes(near),
        t:TX.a_thief_is_in}); } }
  // Wachleute fangen, solange Ausrüstung da ist
  S.shots=S.shots.filter(s=>(s.ttl-=DT)>0);
  for(const po of S.posts){ if(po.hp<=0||po.away) continue; po.cd-=DT; if(po.cd>0) continue;
    let t=null,td=1e9; const rng2=RES().fern?3.4:2.6; for(const r of S.raiders){ const d=dist(po,r); if(d<rng2&&d<td){td=d;t=r;} }
    if(t){ if(po.stock>0){ po.stock--; stat('ammoUse'); po.dry=false; t.hp-=RES().netze?3:2; t.hitT=S.t; { const dd=dist(po,t)||1; t.x+=(t.x-po.x)/dd*0.08; t.y+=(t.y-po.y)/dd*0.08; } S.shots.push({a:{x:po.x,y:po.y},b:{x:t.x,y:t.y},ttl:0.25,max:0.25}); po.cd=0.45; } else po.dry=true; } }
  for(const po of S.posts){ if(inRange(po)&&po.stock<postMax()&&S.ammo>0){ po.tick=(po.tick||0)+DT; if(po.tick>=0.3){ po.tick=0; po.stock++; S.ammo--; stat('ammoOut'); } } }
  const roadY=p=>ROADY.reduce((a,b)=>Math.abs(b-p.y)<Math.abs(a-p.y)?b:a);
  // Über der alten Stadt gibt es keine Querstraßen. Dorthin fährt er erst auf einer Längsstraße hoch,
  // sonst schneidet die Strecke quer durch die Häuserblöcke.
  const naechsteLaengs=x=>ROADS_X.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
  const oben=p=>p.y<ROADY[0]-0.5;
  const roadPath=(a,b)=>{ const ra=roadY(a), rb=roadY(b), p=[{x:a.x,y:a.y}];
    if(oben(a)){ const ax=naechsteLaengs(a.x); p.push({x:ax,y:a.y},{x:ax,y:ra}); } else p.push({x:a.x,y:ra});
    p.push({x:HQ.x,y:ra},{x:HQ.x,y:rb});
    if(oben(b)){ const bx=naechsteLaengs(b.x); p.push({x:bx,y:rb},{x:bx,y:b.y}); } else p.push({x:b.x,y:rb});
    p.push({x:b.x,y:b.y}); return p; };
  for(const v of S.vans){
    if(v.state==="home"){ v.pos={x:HQ.x,y:HQ.y};
      const needy=S.posts.filter(po=>!inRange(po)&&po.stock<postMax()-5&&!S.vans.some(o=>o!==v&&o.stops&&o.stops.some(st=>st.po===po)));
      if(!needy.length||S.ammo<=0) continue;
      // Rundtour: immer der nächste Posten von der aktuellen Stelle aus
      let cur={x:HQ.x,y:HQ.y}, left=Math.min(40,S.ammo), path=[], stops=[], todo=needy.slice();
      while(todo.length&&left>0){ todo.sort((a,b)=>dist(a,cur)-dist(b,cur)); const po=todo.shift(), n=Math.min(left,postMax()-po.stock);
        const seg=roadPath(cur,po); path=path.concat(path.length?seg.slice(1):seg); stops.push({po,n,at:pathLen(path)}); left-=n; cur=po; }
      const back=roadPath(cur,HQ); path=path.concat(back.slice(1));
      v.cargo=stops.reduce((a,b)=>a+b.n,0); S.ammo-=v.cargo; v.path=path; v.stops=stops; v.d=0; v.state="go"; continue; }
    const Lp=pathLen(v.path);
    v.d+=1.5*DT;
    for(const st of v.stops){ if(!st.done&&v.d>=st.at){ st.done=true; const n=Math.min(st.n,v.cargo); if(n>0&&S.posts.includes(st.po)){ st.po.stock+=n; stat('ammoOut',n); pop(st.po,"+"+n+TX.gear,"#C98A1B"); } v.cargo-=n; } }
    if(v.d>=Lp){ S.ammo+=v.cargo||0; v.cargo=0; v.state="home"; v.stops=[]; }
    v.pos=pointAt(v.path,Math.max(0,Math.min(Lp,v.d)));
  }
  // Razzia
  for(const q of S.squads){
    const n=S.nests[q.nest];
    if(q.back){ const dd=dist(q,q.home); if(dd>0.3){ q.x+=(q.home.x-q.x)/dd*1.2*DT; q.y+=(q.home.y-q.y)/dd*1.2*DT; } else { q.done=true; q.post.away=false; } continue; }
    if(!n.alive){ q.back=true; continue; }
    const near=S.raiders.find(r=>dist(r,q)<0.8);
    if(near){ near.hp-=2*DT*3; q.hp-=1.2*DT; }
    else { const d=dist(q,n); if(d>0.6){ q.x+=(n.x-q.x)/d*1.2*DT; q.y+=(n.y-q.y)/d*1.2*DT; }
      else { n.hp-=(q.eq?5.4:3.4)*DT; q.hp-=(0.4+n.hp/n.max)*2.6*DT;   // Wachleute mit Ausrüstung schlagen härter und halten länger durch
        if(n.hp<=0){ n.alive=false; S.cleared++; S.lastClear=S.t; const dd=S.districts[n.district]; if(dd) delete dd.nest; pop(n,"AUSGEHOBEN","#1F7A55"); beuteZurueck(n); } } }
    if(q.hp<=0){ q.done=true; q.post.away=false; q.post.hp=Math.max(10,q.post.hp-30); pop(q,"verloren","#B8432F"); }
  }
  S.squads=S.squads.filter(q=>!q.done);
  for(const r of S.raiders){ if(r.hp>0) continue;
    S.caught.push({x:r.x,y:r.y,t:S.t}); pop(r,"FESTGENOMMEN","#2E6FE4");
    if(r.loot){ const L=r.loot; if(L.k&&L.parts) S.parts[L.k]=(S.parts[L.k]||0)+L.n; else if(L.k) S.lager[L.k]=Math.min(S.lagerCap,S.lager[L.k]+L.n); if(L.money) S.money+=L.money;
      if(L.fin) S.fin[L.fin]=(S.fin[L.fin]||0)+1; if(L.uhr&&S.uhr) S.uhr.fin[L.uhr]=(S.uhr.fin[L.uhr]||0)+1; if(L.ammo) S.ammo=Math.min(S.ammoCap,S.ammo+L.ammo);
      pop({x:r.x,y:r.y-0.45},TX.loot_recovered,"#1F7A55"); } }
  S.raiders=S.raiders.filter(r=>r.hp>0&&!r.gone);
  // Streifenwagen holen Gefangene ab
  for(const c of S.caught){ if(c.car||S.t-c.t<0.8) continue;
    const ry=ROADY.reduce((a,b)=>Math.abs(b-c.y)<Math.abs(a-c.y)?b:a), sx=c.x<4.5?-0.7:9.7;
    const car={x:sx,y:ry,home:{x:sx,y:ry},to:{x:c.x,y:ry},state:"in",c}; c.car=car; S.cars.push(car); }
  for(const car of S.cars){ const tgt=car.state==="out"?car.home:car.to, dd=dist(car,tgt);
    if(dd>0.05){ const sp=Math.min(dd,3.2*DT); car.x+=(tgt.x-car.x)/dd*sp; car.y+=(tgt.y-car.y)/dd*sp; car.dir=Math.sign(tgt.x-car.x)||car.dir||1; }
    else if(car.state==="in"){ car.state="wait"; car.w=0.5; }
    if(car.state==="wait"){ car.w-=DT; if(car.w<=0){ car.state="out"; car.c.gone=true; } }
    if(car.state==="out"&&dd<=0.05) car.done=true; }
  S.cars=S.cars.filter(c=>!c.done);
  S.caught=S.caught.filter(c=>!c.gone&&S.t-c.t<10);
  S.decoys=(S.decoys||[]).filter(dc=>{ if(dc.hp<=0){ pop(dc,"Lockvogel zerlegt","#7A7366"); return false; } return true; });
  S.posts=S.posts.filter(po=>{ if(po.hp<=0){ pop(po,TX.overrun,"#B8432F"); return false; } return true; });
  S.pops=S.pops.filter(p=>(p.ttl-=DT)>0);
  // Fälscherbuden wachsen, solange dort dein Modell läuft. Verkaufst du dort nichts mehr,
  // lohnt sich die Kopie nicht und die Bude macht von selbst zu. Vorher wuchsen sie ewig weiter.
  const born=[];
  for(const f of S.fakes){ const laeuft=(f.d.s&&f.d.s[f.m]||0)>0.25;
    f.str = laeuft ? Math.min(4,f.str+0.016*(1+(fakeSkill()-1)*0.5)*DT) : f.str-0.02*DT;
    if(!laeuft) continue;
    if(f.str>=3&&Math.random()<0.0007&&S.fakes.filter(g=>g.d===f.d).length+born.length<5){ f.str=2; const a=Math.random()*6.3;
      born.push({d:f.d,m:f.m,str:0.8,hit:-9,x:f.d.x+Math.cos(a)*0.95,y:f.d.y+Math.sin(a)*0.55-0.2}); } }
  S.fakes.push(...born);
  S.fakes=S.fakes.filter(f=>{ if(f.str<=0.05){ pop(f,"GESCHLOSSEN","#1F7A55"); return false; } return true; });
}
