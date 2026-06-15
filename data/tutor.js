// Regelbaseret tutor-vidensbase. Matcher på nøgleord i brugerens spørgsmål.
export const TUTOR = [
  {
    keys: ["ohms", "ohm", "u = r", "u=r"],
    answer:
      "Ohms lov: U = R · I. Spændingen (U, i volt) er lig modstanden (R, i ohm) gange strømmen (I, i ampere). Vil du finde strømmen, omskriver du til I = U / R, og modstanden til R = U / I. Eksempel: 12 V over 4 Ω giver I = 12/4 = 3 A.",
  },
  {
    keys: ["kinetisk", "bevægelsesenergi", "e_kin", "ekin"],
    answer:
      "Kinetisk energi (bevægelsesenergi): E_kin = ½ · m · v². Massen m er i kg og farten v i m/s; resultatet er i joule. Bemærk at farten er kvadreret — fordobler du farten, firedobles energien.",
  },
  {
    keys: ["potentiel", "epot", "e_pot", "højde"],
    answer:
      "Potentiel energi i tyngdefeltet: E_pot = m · g · h. Her er g ≈ 9,82 m/s² og h er højden i meter. Den beskriver den oplagrede energi ved at have løftet noget op.",
  },
  {
    keys: ["effekt", "watt", "p = ", "p="],
    answer:
      "Effekt er energi pr. tid: P = W / t (måles i watt). I elektriske kredsløb kan du også bruge P = U · I. Eksempel: 600 J udført på 3 s giver P = 200 W.",
  },
  {
    keys: ["newton", "2. lov", "anden lov", "f = m", "f=m", "kraft"],
    answer:
      "Newtons 2. lov: F = m · a. Den resulterende kraft (N) er massen (kg) gange accelerationen (m/s²). Vil du finde accelerationen: a = F / m.",
  },
  {
    keys: ["frit fald", "fald", "tyngdeacceleration", "g ="],
    answer:
      "Ved frit fald fra hvile: v = g · t og strækningen h = ½ · g · t², med g ≈ 9,82 m/s². Det forudsætter, at luftmodstand kan ses bort fra.",
  },
  {
    keys: ["bølge", "bølgelængde", "v = f", "frekvens", "lambda", "λ"],
    answer:
      "Bølgeligningen: v = f · λ. Udbredelsesfarten (m/s) er frekvensen (Hz) gange bølgelængden (m). Frekvens og periode hænger sammen ved f = 1 / T.",
  },
  {
    keys: ["varme", "q = m", "specifik", "opvarme", "c ="],
    answer:
      "Varmeenergi: Q = m · c · ΔT. Her er m massen (kg), c den specifikke varmekapacitet (for vand 4186 J/(kg·K)) og ΔT temperaturændringen. Det fortæller, hvor meget energi der skal til for at ændre temperaturen.",
  },
  {
    keys: ["foton", "e = h", "planck", "h ="],
    answer:
      "Fotonenergi: E = h · f, hvor h = 6,63·10⁻³⁴ J·s (Plancks konstant) og f er frekvensen. Højere frekvens betyder mere energi pr. foton.",
  },
  {
    keys: ["halveringstid", "radioaktiv", "henfald"],
    answer:
      "Halveringstiden er den tid, der går, før halvdelen af de radioaktive kerner er henfaldet. Efter n halveringstider er der (½)ⁿ tilbage af den oprindelige mængde.",
  },
  {
    keys: ["serie", "seriekobling"],
    answer:
      "Seriekobling af modstande: R_total = R₁ + R₂ + … Strømmen er den samme overalt, mens spændingen fordeles. Den samlede modstand bliver større end den største enkeltmodstand.",
  },
  {
    keys: ["parallel", "parallelkobling"],
    answer:
      "Parallelkobling af modstande: 1/R_total = 1/R₁ + 1/R₂ + … Spændingen er den samme over hver gren, og den samlede modstand bliver mindre end den mindste enkeltmodstand.",
  },
  {
    keys: ["kelvin", "celsius", "temperatur"],
    answer:
      "Omregning: T(K) = T(°C) + 273,15. Kelvin er absolut temperatur, hvor 0 K (det absolutte nulpunkt) svarer til −273,15 °C.",
  },
  {
    keys: ["energibevarelse", "bevarelse", "lukket system"],
    answer:
      "Energibevarelse: energi kan hverken opstå eller forsvinde, kun omdannes. I et lukket system uden gnidning er den samlede mekaniske energi (kinetisk + potentiel) konstant.",
  },
  {
    keys: ["enhed", "si", "enheder"],
    answer:
      "Vigtige SI-enheder i fysik: kraft → newton (N), energi/arbejde → joule (J), effekt → watt (W), spænding → volt (V), strøm → ampere (A), modstand → ohm (Ω), frekvens → hertz (Hz).",
  },
];
