// Stammdaten: Rohstoffe, Modelle, Maschinen, Kosten, Forschung, Fashion Week
const $=id=>document.getElementById(id);
const DT=0.1, L=7;

/* ================= Stammdaten ================= */
const RAW={leder:{n:TX.tannery,col:"#8A5A35"}, gummi:{n:TX.rubber_plant,col:"#3A3A3A"}, metall:{n:TX.metal_yard,col:"#6C7A89"}, sand:{n:TX.sand_pit,col:"#D8C08A"}};
const MODELS={
 runner: {n:"Runner",  p0:60,  col:"var(--runner)",  c2:"#E4572E", unlock:0,   need:{schaft:1,sohle:1}},
 court:  {n:"Court",   p0:84,  col:"var(--court)",   c2:"#2E6FE4", unlock:450, need:{schaft:1,sohle:1}},
 hightop:{n:"Hightop", p0:150, col:"var(--hightop)", c2:"#1F9E6E", unlock:1400,need:{schaft:2,sohle:1}}};
const MACH_LOCK={lab:TX.needs_a_3rd_floor};
const MACH={
 bench:{n:TX.workbench_with_an_employee, need:{leder:1,gummi:1}, out:"runner", cool:2, cost:100, d:TX.turns_leather_and_rubber, t:[10,7,5], up:[0,60,300], wage:2},
 cut:  {n:TX.cutter, need:{leder:1}, out:"schaft", cost:90,  d:TX.leather_in_uppers_out, t:[3], factory:true},
 press:{n:TX.press,    need:{gummi:1}, out:"sohle", cost:90,  d:TX.rubber_in_soles_out,  t:[3], factory:true},
 asm:  {n:TX.assembly,   need:"modell", out:"modell", cool:2, cost:150, d:TX.builds_a_sneaker_from, t:[4], factory:true},
 lab:  {n:TX.lab, need:{fertig:1}, cost:250, d:TX.takes_finished_sneakers_as, t:[8], factory:true},
 seal: {n:TX.sealing_machine, need:{fertig:1}, out:"siegel", puffer:1, kosten:4, cost:200, d:TX.seals_finished_sneakers_4, t:[4,3,2], up:[0,150,400], factory:true},
 equip:{n:TX.gear_shop, need:{metall:1,gummi:1}, out:"ausr", cost:220, d:TX.metal_and_rubber_in, t:[5], factory:true}};
const FACTORY_AT=15;                    // so viele Paare, dann ziehst du aus dem Kinderzimmer aus
const FLOOR_COST=[0,700,1800,4000,7000,12000];
const LIFT_SPEED=[4,2,1], LIFT_UP=[0,300,900];
const dirOf=f=> f%2===0?1:-1, entryOf=f=> dirOf(f)===1?0:L-1, endOf=f=> dirOf(f)===1?L-1:0;

const INTAKE_COST=[0,700,1600,3000,5000,8000];

const TECH=[
 {k:"netze",  n:TX.stronger_nets,     d:TX.every_net_your_guards,                     cost:{runner:25}},
 {k:"holo",   n:TX.hologram_seals,     d:TX.sealed_pairs_hurt_the,      cost:{runner:40}},
 {k:"vorrat", n:TX.bigger_stockpiles,      d:TX.every_guard_post_holds,                          cost:{runner:30}},
 {k:"panzer", n:TX.armoured_trucks,d:TX.every_second_raid_on,   cost:{runner:40,court:25}},
 {k:"tempo",  n:TX.faster_belts,    d:TX.all_machines_work_a,               cost:{runner:70,court:40}},
 {k:"fern",   n:TX.binoculars,           d:TX.guard_posts_catch_thieves, cost:{court:50,hightop:25}},
 {k:"laster", n:TX.bigger_trucks,  d:TX.every_truck_carries_10,       cost:{runner:35}}];

const FW_NEED={runner:30,court:20,hightop:10}, FW_TIME=300;
