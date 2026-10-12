// Spielstand S und neues Spiel
/* ================= Zustand ================= */
let S, view="turm", paused=false;
// Zeichenuhr: Spielzeit plus der angefangene Rechenschritt, läuft also mit jedem Bild weiter.
// S.t springt in Schritten von 0,1 Sekunden, der Turm sogar nur alle 0,4 Sekunden, und genau
// das sah man als Ruckeln. Alles, was sich nur bewegt, hängt jetzt an animT.
let animT=0;
const TURM_TAKT=0.4;
function newGame(){
  S={t:0, statStart:0, money:60, ammo:0, sold:0, earned:0, factory:false,
     lager:{leder:10,gummi:10,metall:0}, lagerCap:40, fin:{runner:0,court:0,hightop:0},
     hand:0, feed:0,
     floors:[{lane:new Array(L).fill(null), slots:new Array(L).fill(null)}], lifts:[],
     open:{runner:true,court:false,hightop:false},
     sources:[
       {x:1.5,y:9.5, k:"leder", left:900, max:900, trucks:0},
       {x:7.5,y:10,  k:"gummi", left:900, max:900, trucks:0},
       {x:1,  y:5.2, k:"gummi", left:1500,max:1500,trucks:0},
       {x:7.6,y:5.4, k:"leder", left:1500,max:1500,trucks:0},
       {x:4.5,y:3.6, k:"metall",left:900, max:900, trucks:0}],
     fleet:3, trucks:[], vans:[], ammoCap:60, intakes:[0], feedIdx:{},
     districts:[
       {n:"Zuhause",   x:4.5,y:12.3, shop:true,  s:{runner:0,court:0,hightop:0}, cd:0},
       {n:"Weststadt", x:1.4,y:11.8, shop:false, s:{runner:0,court:0,hightop:0}, cd:0},
       {n:"Oststadt",  x:7.6,y:12.2, shop:false, s:{runner:0,court:0,hightop:0}, cd:0},
       {n:"Altstadt",  x:1.4,y:2.4,  shop:false, s:{runner:0,court:0,hightop:0}, cd:0, nest:0},
       {n:"Hafen",     x:7.6,y:2.4,  shop:false, s:{runner:0,court:0,hightop:0}, cd:0, nest:1},
       {n:"Nordstadt", x:3.0,y:1.2,  shop:false, s:{runner:0,court:0,hightop:0}, cd:0},
       {n:"Westend",   x:2.6,y:6.6,  shop:false, s:{runner:0,court:0,hightop:0}, cd:0},
       {n:"Ostend",    x:6.4,y:7.0,  shop:false, s:{runner:0,court:0,hightop:0}, cd:0}],
     nests:[{x:1.3,y:1.3, hp:40,max:40, cd:0, alive:true, district:3},
            {x:7.7,y:1.4, hp:40,max:40, cd:0, alive:true, district:4}],
     awake:false, raiders:[], posts:[], shots:[], squads:[], pops:[], cleared:0, razzias:0,
     seen:{}, lastExpand:0, fakes:[], sues:0, caught:[], cars:[], research:{}, rp:{runner:0,court:0,hightop:0}, curRes:null, resProg:{}, parts:{schaft:0,sohle:0}};
  S.districts.forEach(d=>d.heat={runner:0,court:0,hightop:0});
  S.decoys=[];
}
const HQ={x:4.5,y:12.5};
