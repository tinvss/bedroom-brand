// Simulation im Turm: Nähen, Band, Maschinen, Aufzüge, Warenannahmen
/* ================= Turm ================= */
function sew(){
  if(S.lager.leder<1||S.lager.gummi<1){ return; }
  S.hand++;
  if(S.hand>=6){ S.hand=0; S.lager.leder--; S.lager.gummi--; S.fin.runner++; }
}
// Ware, die oben aus dem Turm kommt, ins passende Lager
function einlagern(W,it){ if(it.k.endsWith("_s")) W.fin[it.k]=(W.fin[it.k]||0)+1; else if(W.models[it.k]) W.fin[it.k]++;
  else if(it.k==="ausr") S.ammo=Math.min(S.ammoCap,S.ammo+10);
  else if(W.lager[it.k]!==undefined) W.lager[it.k]=Math.min(W.lagerCap,W.lager[it.k]+1);
  else if(W.teile.includes(it.k)) W.parts[it.k]=Math.min(W.lagerCap,(W.parts[it.k]||0)+1); }
// Ist alles erforscht, nimmt ein Labor oder Atelier keine Stücke mehr an. Sie sollen verkauft werden.
const sattVonForschung=m=>(m.t==="lab"&&allResearched())||(m.t==="atelier"&&alleRes2());
// Was eine Maschine gerade braucht. "modell" heißt: steht beim gewählten Modell.
const bedarfVon=(W,m)=>{ const M=W.mach[m.t]; if(!M) return {};   // Maschine gehört nicht in dieses Haus
  if(sattVonForschung(m)) return {};                              // nimmt nichts mehr, auch nicht vom Band
  return M.need==="modell" ? ((W.models[m.model]||{}).need||{}) : M.need; };
// "fertig" ist die Kategorie für fertige Stücke: Sneaker in Sohle, Uhren in Kapitel 2
const katVon=(W,k)=>W.models[k]?"fertig":k;
// Die erste Maschine auf Etage f, die dieses Teil verarbeiten kann (Rohstoffe mit Ziel weiter oben: keine)
function verarbeiter(W,x,f){ const c=katVon(W,x.k); if(x.to&&x.to.f>f) return null;
  if(meisterVorrang(W,c)) return null;   // sammelt die Werkstatt das gerade, fährt es aufs Durchgangsband
  return W.floors[f].slots.find(m=>m&&bedarfVon(W,m)[c])||null; }
const PASS_WARTET=2;   // so lange hat das Arbeitsband Vorrang, dann ist das Durchgangsband dran
// Ein Werk ist eine Fabrik: Etagen, Aufzüge, Annahmen, eigenes Lager, eigene Maschinen und Modelle.
// Sohle arbeitet weiter auf denselben Feldern in S, Kapitel 2 bekommt ein zweites Werk daneben.
function sohleWerk(){ S.intakeAcc=S.intakeAcc||{}; S.feedIdx=S.feedIdx||{}; S.intakeLvl=S.intakeLvl||{}; S.parts=S.parts||{schaft:0,sohle:0}; if(S.parts.band===undefined) S.parts.band=0;
  return {name:"sohle", floors:S.floors, lifts:S.lifts, intakes:S.intakes, intakeLvl:S.intakeLvl, intakeAcc:S.intakeAcc, feedIdx:S.feedIdx,
    lager:S.lager, lagerCap:S.lagerCap, parts:S.parts, fin:S.fin, mach:MACH, models:MODELS, teile:["schaft","sohle","band"]}; }
function towerStep(){ werkStep(sohleWerk()); }
function werkStep(W){
  const top=W.floors.length-1;
  for(let f=top;f>=0;f--){
    const F=W.floors[f], d=dirOf(f), e=endOf(f);
    for(let i=0;i<L;i++){
      const m=F.slots[i]; if(!m) continue; if(m.t==="werkstatt") continue;   // steht für sich, nimmt nichts vom Band
      const M=W.mach[m.t];
      if(m.cool>0) m.cool--;
      const need = bedarfVon(W,m);
      const cat=k=>katVon(W,k);
      const mine=x=> !x.to || (x.to.f===f&&x.to.i===i) || x.to.f<f || (x.to.f===f && (d===1 ? i>x.to.i : i<x.to.i));
      const cap=(W.mach[m.t]||{}).puffer||2;   // Eingangspuffer: Material für die nächste Runde darf schon warten
      const takes=x=>need[cat(x.k)] && (m.buf[cat(x.k)]||0)<need[cat(x.k)]*cap && mine(x) && !meisterVorrang(W,cat(x.k));
      const put=x=>{ const c=cat(x.k); m.buf[c]=(m.buf[c]||0)+1; if(c==="fertig") m.sm=x.k; };
      if(m.out){ const x=F.lane[i]; if(!x){ F.lane[i]=m.out; m.out=null; } else if(takes(x)){ put(x); F.lane[i]=m.out; m.out=null; } }
      m.blockT = m.out ? (m.blockT||0)+1 : 0;
      if(!m.out&&!(m.cool>0)){ const x=F.lane[i]; if(x&&takes(x)){ put(x); F.lane[i]=null; } }
      m.full = (m.t==="equip" && S.ammo>=S.ammoCap-10) || sattVonForschung(m);
      if(!m.busy&&!m.out&&!m.full&&Object.keys(need).every(k=>(m.buf[k]||0)>=need[k])){ m.busy=true; m.p=0; m.cur=m.sm; for(const k in need) m.buf[k]-=need[k]; if((W.mach[m.t]||{}).kosten) S.money-=W.mach[m.t].kosten; }
      if(m.busy){ m.p++; m.last=S.t; const T=speedOf(W,m);
        if(m.t==="lab"&&m.p>=T){ addSample(m.cur); m.busy=false; m.p=0; m.made=(m.made||0)+1; continue; }
        if(m.t==="atelier"&&m.p>=T){ uhrMuster((m.cur||"klassik").replace(/_s$/,"")); m.busy=false; m.p=0; m.made=(m.made||0)+1; continue; }
        if(m.p>=T){ let o=(W.mach[m.t]||{}).out; if(!o){ m.busy=false; m.p=0; continue; }
          // Zuschnitte in Sohle schneiden auch Lederbänder für die Uhren, so viel wie der Regler sagt
          if(o==="schaft"&&S.uhr&&S.bandAnteil>0){ S.bandAcc=(S.bandAcc||0)+S.bandAnteil; if(S.bandAcc>=1){ S.bandAcc-=1; o="band"; } }
          m.out={k: o==="modell" ? m.model : o==="siegel" ? m.cur+"_s" : o};
          m.busy=false; m.p=0; stat('mk_'+(m.t==="bench"||m.t==="asm"?"schuh":m.t)); if(m.t==="endm") stat('uhr_gebaut');
          m.cool=W.mach[m.t].cool||0; m.made=(m.made||0)+1; } }
    }
    // Erst jetzt verlässt die Ware die Etage, so sieht auch die Maschine auf dem letzten Platz alles
    // Am Etagenende hat das Arbeitsband Vorrang am Aufzug. Wartet das Durchgangsband aber schon
    // PASS_WARTET Takte, ist es dran, sonst steht es bei voller Etage für immer.
    const it=F.lane[e], p0=F.pass&&F.pass[e];
    F.passWait = p0 ? (F.passWait||0)+1 : 0;
    const passZuerst = p0 && F.passWait>=PASS_WARTET;
    // Fertige Ware braucht nicht nach oben: Schuhe, Uhren und Ausrüstung gehen am Etagenende
    // direkt ins Lager. Nur Teile und Rohstoffe fahren mit dem Aufzug weiter.
    // Nur was niemand mehr braucht, rutscht ins Lager. Steht oben ein Siegel, Labor oder Zertifikat,
    // fahren fertige Stücke weiter mit dem Aufzug dorthin.
    const obenBraucht = W.floors.some((F2,i2)=>i2>f && F2.slots.some(m2=>m2&&(bedarfVon(W,m2)||{}).fertig));
    const fertigeWare=x=> x.k==="ausr" || x.k.endsWith("_s") || (!!W.models[x.k] && !obenBraucht);
    if(it && !(passZuerst && f<top)){
      if(f===top||fertigeWare(it)){ einlagern(W,it); if(fertigeWare(it)){ F.ausgang=S.t; F.ausgangK=it.k; } F.lane[e]=null; }
      else if(W.lifts[f].q.length<2){ W.lifts[f].q.push(it); F.lane[e]=null; }
    }
    // Durchgangsband: keine Maschine greift zu, hier staut sich nichts
    if(F.pass){ const p=F.pass[e];
      if(p){ if(f===top||fertigeWare(p)){ einlagern(W,p); if(fertigeWare(p)){ F.ausgang=S.t; F.ausgangK=p.k; } F.pass[e]=null; F.passWait=0; } else if(W.lifts[f].q.length<2){ W.lifts[f].q.push(p); F.pass[e]=null; F.passWait=0; } }
      if(d===1){ for(let i=L-2;i>=0;i--) if(F.pass[i]&&!F.pass[i+1]){ F.pass[i+1]=F.pass[i]; F.pass[i]=null; } }
      else     { for(let i=1;i<L;i++)   if(F.pass[i]&&!F.pass[i-1]){ F.pass[i-1]=F.pass[i]; F.pass[i]=null; } } }
    // Ein Feld, dessen Maschine etwas fertig hat, bleibt frei, bis sie abgelegt hat. Das Band staut sich dahinter.
    const held=j=>F.slots[j]&&F.slots[j].out;
    if(d===1){ for(let i=L-2;i>=0;i--) if(F.lane[i]&&!F.lane[i+1]&&!held(i+1)){ F.lane[i+1]=F.lane[i]; F.lane[i]=null; } }
    else     { for(let i=1;i<L;i++)   if(F.lane[i]&&!F.lane[i-1]&&!held(i-1)){ F.lane[i-1]=F.lane[i]; F.lane[i]=null; } }
  }
  W.lifts.forEach((Lf,f)=>{ Lf.jam = Lf.q.length>=2 ? (Lf.jam||0)+1 : 0;
    if(Lf.jam>12 && Lf.lvl===0) hint("liftHint",[{id:11, tw:()=>liftRect(f), info:true, t:TX.the_lift_can_t}]);
    // Weiche oben am Aufzug: Was eine Maschine auf der Etage verarbeiten kann, aufs Arbeitsband, sonst aufs Durchgangsband.
    // Ist oben kein Platz, fährt auch brauchbare Ware unten vorbei, sonst staut sich der Aufzug.
    Lf.c++; if(Lf.q.length&&Lf.c>=LIFT_SPEED[Lf.lvl]){ const up=W.floors[f+1], en=entryOf(f+1), x=Lf.q[0];
      if(!up.pass) up.pass=new Array(L).fill(null);
      const nutzer=verarbeiter(W,x,f+1);
      if(nutzer&&!up.lane[en]){ up.lane[en]=Lf.q.shift(); Lf.c=0; up.weiche={k:x.k,band:"oben",m:nutzer.t,t:S.t}; }
      else if(!up.pass[en]){ up.pass[en]=Lf.q.shift(); Lf.c=0; up.weiche={k:x.k,band:"unten",m:nutzer?nutzer.t:null,t:S.t};
        hint("passHint",[{id:13, tw:()=>bandRect(f+1), info:true, t:TX.the_dark_belt_below}]); } } });
  // Anlieferung aus dem Lager aufs Band: was die Maschinen im Haus brauchen, reihum
  // Jede Warenannahme beliefert ihre Etage und alle darüber, bis die nächste Annahme kommt
  const intakes=W.intakes.slice().sort((a,b)=>a-b);
  const home=ff=>intakes.filter(x=>x<=ff).pop();
  const buckets={}; intakes.forEach(x=>buckets[x]=[]);
  W.floors.forEach((F,ff)=>F.slots.forEach((m,ii)=>{ if(!m) return; const to={f:ff,i:ii}, list=[], nd=bedarfVon(W,m)||{};
    // Was diese Maschine braucht: Rohstoffe aus dem Lager, übrige Zwischenteile aus dem Teilelager
    for(const k in nd){ if(k==="fertig") continue;
      if(meisterVorrang(W,k)) continue;   // was die Werkstatt sammelt, wird nicht mehr ausgeliefert
      if(W.lager[k]!==undefined){ if(!(m.t==="equip"&&m.full)) list.push(k); }
      else if(W.parts[k]>0 && (m.buf[k]||0)<nd[k]) list.push(k); }   // Bänder braucht in Sohle niemand, sie warten auf den Lieferwagen
    const b=buckets[home(ff)]; if(!b) return;
    for(let r=0;r<(m.prio?2:1);r++) list.forEach(k=>b.push({k,to})); }));
  // Annahmen: unten auf Stufe 1 übers Band, sonst direkt in die bestellende Maschine
  W.intakeAcc=W.intakeAcc||{}; W.feedIdx=W.feedIdx||{};
  for(const fi of intakes){ const F=W.floors[fi], W2=buckets[fi]; if(!F||!W2.length) continue;
    const lvl=(W.intakeLvl||{})[fi]||0, direct = fi>0 || lvl>=1, rate = lvl===0?0.5:lvl===1?1:2;
    W.intakeAcc[fi]=Math.min(2,(W.intakeAcc[fi]||0)+rate);
    let tries=0;
    while(W.intakeAcc[fi]>=1 && tries<W2.length){
      const idx=((W.feedIdx[fi]||0)+tries)%W2.length, w=W2[idx]; tries++;
      const pool=W.lager[w.k]!==undefined?W.lager:(W.parts||{}); if(!(pool[w.k]>0)) continue;
      if(direct){ const TF=W.floors[w.to.f], m=TF&&TF.slots[w.to.i]; if(!m) continue;
        // Direkt in den Eingangspuffer (zwei Runden wie vom Band). Aufs Band gelegt, hat das Material die Felder
        // vor den Maschinen zugestopft, und Ware von weiter vorn kam kaum noch durch.
        const nd=(bedarfVon(W,m)||{})[w.k]||1; if((m.buf[w.k]||0)>=nd*2) continue;
        pool[w.k]--; stat('use_'+w.k); if(w.k==="band") stat('band_weg'); m.buf[w.k]=(m.buf[w.k]||0)+1; }
      else { const en=entryOf(0), nx=en+dirOf(0); if(F.lane[en]||F.lane[nx]) break;
        pool[w.k]--; stat('use_'+w.k); F.lane[en]={k:w.k,to:w.to}; }
      W.intakeAcc[fi]-=1; W.feedIdx[fi]=(idx+1)%W2.length; tries=0;
    }
  }
}
