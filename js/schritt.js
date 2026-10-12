// Ein Rechenschritt des ganzen Spiels (alle 0,1 Sekunden)
/* ================= Hauptschritt ================= */
let towerTick=0;
// Wie weit der laufende Turmtakt schon ist, 0 bis 1. Damit zeichnen wir zwischen zwei Takten.
const taktPhase=()=>Math.max(0,Math.min(1,towerTick/TURM_TAKT));
function step(){
  if(paused||!S) return;
  S.t+=DT;
  towerTick+=DT; if(towerTick>=TURM_TAKT){ towerTick=0; towerStep(); if(S.uhr) werkStep(uhrWerk());   // Kapitel 2 läuft daneben
    // Lohn
    S.floors.forEach(F=>F.slots.forEach(m=>{ if(m&&m.t==="bench") S.money-=MACH.bench.wage*0.4/2; }));
  }
  // Umsatz pro Minute, langsam nachgezogen. Daran hängt, wie stark die Banden werden.
  // Ein einzelner guter Verkauf soll die Stadt nicht sofort aufschrecken, ein gutes Werk schon.
  S.uSchnitt=(S.uSchnitt||0)+(perMin('umsatz')-(S.uSchnitt||0))*DT/60;
  cityStep(); fwStep(); lieferStep(); boutiqueStep(); meisterStep();
  // Meilensteine
  if(!S.factory && S.sold>=FACTORY_AT){ S.factory=true;
    once("fac",TX.your_first_workshop,`<p style="font-size:15px;color:var(--ink)"><b>${FACTORY_AT}${TX.pairs_sold_your_bedroom}`); }
  if(S.factory && S.floors.length>=3 && !$("overlay").innerHTML) hint("resHint",[{id:21, el:()=>$("tForsch"), info:true, t:TX.three_floors_research_is}]);
  if(lagerSum()===0 && S.sold>3) once("empty",TX.your_storage_is_empty,`${TX.leather_and_rubber_are}`);
}
