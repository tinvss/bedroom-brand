// Kapitel 3: Das Imperium. Nova Harbor, eine Großstadt, die schon vier anderen gehört.
/* ================= Kapitel 3: Stammdaten ================= */

// Die Welt der Skyline in eigenen Einheiten. Die Straße liegt bei K3_GY, alles darüber ist Stadt.
const K3_WW=2760, K3_HH=1000, K3_GY=860;

// Wem was gehört. "du" ist der Spieler, sein Logo ist der Sneaker aus dem Kinderzimmer.
const K3_RIVALEN={
 goldhorn:{farbe:"#C9A227", schrift:"#1B1A17", n:TX.k3_goldhorn_n, firma:TX.k3_goldhorn_firma, d:TX.k3_goldhorn_d},
 blink:   {farbe:"#1FB5CF", schrift:"#0E2A30", n:TX.k3_blink_n,    firma:TX.k3_blink_firma,    d:TX.k3_blink_d},
 bloom:   {farbe:"#E46FA0", schrift:"#3A1426", n:TX.k3_bloom_n,    firma:TX.k3_bloom_firma,    d:TX.k3_bloom_d},
 hammer:  {farbe:"#4E5D6C", schrift:"#FFFFFF", n:TX.k3_hammer_n,   firma:TX.k3_hammer_firma,   d:TX.k3_hammer_d}};
const K3_DU={farbe:"#E4572E", schrift:"#FFFFFF"};
const k3Farbe=o=>o==="du"?K3_DU.farbe:o&&K3_RIVALEN[o]?K3_RIVALEN[o].farbe:"#B9B2A4";

// Was eine Firma kann: Geldmaschine oder Waffe. rate ist der Anteil ihres Werts, den sie pro Minute bringt,
// bevor der Hype ihn vervielfacht. Waffen bringen wenig, dafür können sie etwas.
const K3_TYPEN={
 imbiss:  {rate:0.18, n:TX.k3_typ_imbiss,   d:TX.k3_typ_imbiss_d},
 parkhaus:{rate:0.126, n:TX.k3_typ_parkhaus, d:TX.k3_typ_parkhaus_d},
 hotel:   {rate:0.165, n:TX.k3_typ_hotel,    d:TX.k3_typ_hotel_d},
 sneaker: {rate:0.195, n:TX.k3_typ_sneaker,  d:TX.k3_typ_sneaker_d},
 kanzlei: {rate:0.045, n:TX.k3_typ_kanzlei,  d:TX.k3_typ_kanzlei_d, waffe:true},
 zeitung: {rate:0.045, n:TX.k3_typ_zeitung,  d:TX.k3_typ_zeitung_d, waffe:true},
 bank:    {rate:0.036, n:TX.k3_typ_bank,     d:TX.k3_typ_bank_d,    waffe:true},
 werbung: {rate:0.045, n:TX.k3_typ_werbung,  d:TX.k3_typ_werbung_d, waffe:true},
 tech:    {rate:0.24, n:TX.k3_typ_tech,     d:TX.k3_typ_tech_d},
 turm:    {rate:0.12, n:TX.k3_typ_turm,     d:TX.k3_typ_turm_d}};

// Viertel von links nach rechts. Zwischen Bankenviertel und Insel liegt der Fluss mit der Brücke.
const K3_VIERTEL=[
 {id:"hafen",   n:TX.k3_v_hafen,   x0:0,    x1:610},
 {id:"uptown",  n:TX.k3_v_uptown,  x0:610,  x1:1170},
 {id:"midtown", n:TX.k3_v_midtown, x0:1170, x1:1720},
 {id:"banken",  n:TX.k3_v_banken,  x0:1720, x1:2240},
 {id:"insel",   n:TX.k3_v_insel,   x0:2380, x1:K3_WW}];
const K3_FLUSS={x0:2240, x1:2380};

// Die Gebäude. f ist der Wert als Anteil des Startbudgets, er wird beim Einstieg einmal festgelegt.
// Der Goldhorn Tower kostet vierzigmal so viel wie alles, was du mitbringst.
const K3_GEB=[
 {id:"pier9",    n:TX.k3_g_pier9,    v:"hafen",   x:24,   w:170, h:110, stil:"lager",    typ:"parkhaus", f:0.45, o:null},
 {id:"moewe",    n:TX.k3_g_moewe,    v:"hafen",   x:212,  w:125, h:140, stil:"lager",    typ:"imbiss",   f:0.6,  o:null},
 {id:"kai",      n:TX.k3_g_kai,      v:"hafen",   x:356,  w:96,  h:250, stil:"backstein",typ:"werbung",  f:0.7,  o:null},
 {id:"container",n:TX.k3_g_container,v:"hafen",   x:470,  w:116, h:330, stil:"glas",     typ:"hotel",    f:2.2,  o:"hammer"},
 {id:"bagel",    n:TX.k3_g_bagel,    v:"uptown",  x:628,  w:92,  h:150, stil:"brown",    typ:"imbiss",   f:0.8,  o:"bloom"},
 {id:"pelikan",  n:TX.k3_g_pelikan,  v:"uptown",  x:734,  w:112, h:265, stil:"brown",    typ:"hotel",    f:1.7,  o:"bloom"},
 {id:"fuchs",    n:TX.k3_g_fuchs,    v:"uptown",  x:860,  w:86,  h:190, stil:"brown",    typ:"kanzlei",  f:0.95, o:null},
 {id:"schrei",   n:TX.k3_g_schrei,   v:"uptown",  x:960,  w:122, h:305, stil:"altbau",   typ:"zeitung",  f:1.9,  o:"bloom"},
 {id:"ewig",     n:TX.k3_g_ewig,     v:"uptown",  x:1096, w:66,  h:175, stil:"beton",    typ:"parkhaus", f:0.75, o:null},
 {id:"nudel",    n:TX.k3_g_nudel,    v:"midtown", x:1184, w:78,  h:170, stil:"neon",     typ:"imbiss",   f:0.9,  o:"blink"},
 {id:"palast",   n:TX.k3_g_palast,   v:"midtown", x:1274, w:104, h:245, stil:"neon",     typ:"sneaker",  f:1.6,  o:"blink"},
 {id:"laut",     n:TX.k3_g_laut,     v:"midtown", x:1390, w:96,  h:370, stil:"glas",     typ:"werbung",  f:2.6,  o:"blink"},
 {id:"blinkr",   n:TX.k3_g_blinkr,   v:"midtown", x:1498, w:118, h:520, stil:"tech",     typ:"tech",     f:5,    o:"blink"},
 {id:"bloomhaus",n:TX.k3_g_bloomhaus,v:"midtown", x:1628, w:86,  h:420, stil:"glas",     typ:"hotel",    f:3.4,  o:"bloom"},
 {id:"hammerhaus",n:TX.k3_g_hammerhaus,v:"banken",x:1730, w:112, h:470, stil:"beton",    typ:"bank",     f:4.4,  o:"hammer"},
 {id:"saeulen",  n:TX.k3_g_saeulen,  v:"banken",  x:1856, w:138, h:230, stil:"klassik",  typ:"bank",     f:3,    o:"goldhorn"},
 {id:"kurs",     n:TX.k3_g_kurs,     v:"banken",  x:2006, w:74,  h:330, stil:"altbau",   typ:"zeitung",  f:2.3,  o:"goldhorn"},
 {id:"paragraf", n:TX.k3_g_paragraf, v:"banken",  x:2092, w:132, h:610, stil:"artdeco",  typ:"kanzlei",  f:6,    o:"goldhorn"},
 {id:"yacht",    n:TX.k3_g_yacht,    v:"insel",   x:2396, w:96,  h:120, stil:"klassik",  typ:"hotel",    f:1.5,  o:"goldhorn"},
 {id:"goldhorn", n:TX.k3_g_goldhorn, v:"insel",   x:2508, w:178, h:800, stil:"goldhorn", typ:"turm",     f:40,   o:"goldhorn"}];
const k3Geb=id=>K3_GEB.find(b=>b.id===id);
