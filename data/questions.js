// Fysik-spørgsmålsbank.
// To typer spørgsmål:
//   1) "static": fast spørgsmål med faste svarmuligheder.
//   2) "dynamic": en generatorfunktion der laver nye tal hver gang,
//      så det samme emne aldrig ser ens ud to gange.
//
// Hvert spørgsmål har: emne (topic), niveau (level), type.

const rnd = (min, max, step = 1) => {
  const n = Math.floor((Math.random() * (max - min)) / step) * step + min;
  return Math.round(n * 1000) / 1000;
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
// byg svarmuligheder ud fra korrekt talværdi + plausible distraktorer
const numOptions = (correct, unit = "", spread = 0.4) => {
  const c = Number(correct);
  const set = new Set([c]);
  while (set.size < 4) {
    const f = 1 + (Math.random() * 2 - 1) * spread;
    let v = Math.round(c * f * 100) / 100;
    if (v === c || v <= 0) v = Math.round(c * (1 + Math.random()) * 100) / 100;
    set.add(v);
  }
  const opts = shuffle([...set]).map((v) => `${v}${unit ? " " + unit : ""}`);
  return { options: opts, answer: `${c}${unit ? " " + unit : ""}` };
};

export const TOPICS = [
  { id: "mekanik", name: "Mekanik & bevægelse" },
  { id: "energi", name: "Energi, arbejde & effekt" },
  { id: "el", name: "Elektricitet" },
  { id: "termodynamik", name: "Termodynamik & varme" },
  { id: "boelger", name: "Bølger & optik" },
  { id: "moderne", name: "Moderne fysik & atomfysik" },
];

// ---- DYNAMISKE GENERATORER ----------------------------------------------
const dynamic = [
  // Mekanik
  {
    topic: "mekanik",
    level: "let",
    gen: () => {
      const v = rnd(2, 30), t = rnd(2, 12);
      const s = v * t;
      const { options, answer } = numOptions(s, "m");
      return {
        q: `Et legeme bevæger sig med konstant fart ${v} m/s i ${t} s. Hvor langt når det?`,
        options, answer,
        explain: `Strækning ved konstant fart: s = v·t = ${v}·${t} = ${s} m.`,
      };
    },
  },
  {
    topic: "mekanik",
    level: "mellem",
    gen: () => {
      const a = rnd(1, 6), t = rnd(2, 10);
      const v = a * t;
      const { options, answer } = numOptions(v, "m/s");
      return {
        q: `En bil starter fra hvile og accelererer med ${a} m/s². Hvad er farten efter ${t} s?`,
        options, answer,
        explain: `v = a·t = ${a}·${t} = ${v} m/s (start fra hvile, v₀ = 0).`,
      };
    },
  },
  {
    topic: "mekanik",
    level: "mellem",
    gen: () => {
      const m = rnd(2, 20), a = rnd(1, 8);
      const F = m * a;
      const { options, answer } = numOptions(F, "N");
      return {
        q: `Newtons 2. lov: En genstand på ${m} kg får accelerationen ${a} m/s². Hvor stor er kraften?`,
        options, answer,
        explain: `F = m·a = ${m}·${a} = ${F} N.`,
      };
    },
  },
  {
    topic: "mekanik",
    level: "svaer",
    gen: () => {
      const g = 9.82, t = rnd(1, 5);
      const h = Math.round(0.5 * g * t * t * 100) / 100;
      const { options, answer } = numOptions(h, "m");
      return {
        q: `En sten falder frit fra hvile i ${t} s (g = 9,82 m/s²). Hvor langt falder den?`,
        options, answer,
        explain: `h = ½·g·t² = 0,5·9,82·${t}² = ${h} m.`,
      };
    },
  },
  // Energi
  {
    topic: "energi",
    level: "let",
    gen: () => {
      const m = rnd(1, 30), h = rnd(2, 25), g = 9.82;
      const E = Math.round(m * g * h * 10) / 10;
      const { options, answer } = numOptions(E, "J");
      return {
        q: `Hvad er den potentielle energi for ${m} kg løftet ${h} m op? (g = 9,82 m/s²)`,
        options, answer,
        explain: `E_pot = m·g·h = ${m}·9,82·${h} = ${E} J.`,
      };
    },
  },
  {
    topic: "energi",
    level: "mellem",
    gen: () => {
      const m = rnd(1, 20), v = rnd(2, 20);
      const E = Math.round(0.5 * m * v * v * 10) / 10;
      const { options, answer } = numOptions(E, "J");
      return {
        q: `Beregn den kinetiske energi for et legeme på ${m} kg, der bevæger sig med ${v} m/s.`,
        options, answer,
        explain: `E_kin = ½·m·v² = 0,5·${m}·${v}² = ${E} J.`,
      };
    },
  },
  {
    topic: "energi",
    level: "mellem",
    gen: () => {
      const W = rnd(100, 2000, 50), t = rnd(2, 20);
      const P = Math.round((W / t) * 10) / 10;
      const { options, answer } = numOptions(P, "W");
      return {
        q: `Der udføres et arbejde på ${W} J i løbet af ${t} s. Hvad er den gennemsnitlige effekt?`,
        options, answer,
        explain: `P = W / t = ${W} / ${t} = ${P} W.`,
      };
    },
  },
  // Elektricitet
  {
    topic: "el",
    level: "let",
    gen: () => {
      const U = rnd(2, 24), R = rnd(2, 50);
      const I = Math.round((U / R) * 1000) / 1000;
      const { options, answer } = numOptions(I, "A");
      return {
        q: `Ohms lov: En spænding på ${U} V ligger over en modstand på ${R} Ω. Hvad er strømmen?`,
        options, answer,
        explain: `I = U / R = ${U} / ${R} = ${I} A.`,
      };
    },
  },
  {
    topic: "el",
    level: "mellem",
    gen: () => {
      const U = rnd(5, 230, 5), I = rnd(1, 15);
      const P = Math.round(U * I * 10) / 10;
      const { options, answer } = numOptions(P, "W");
      return {
        q: `Et apparat trækker ${I} A ved ${U} V. Hvad er den elektriske effekt?`,
        options, answer,
        explain: `P = U·I = ${U}·${I} = ${P} W.`,
      };
    },
  },
  {
    topic: "el",
    level: "svaer",
    gen: () => {
      const R1 = rnd(2, 40), R2 = rnd(2, 40);
      const Rs = R1 + R2;
      const { options, answer } = numOptions(Rs, "Ω");
      return {
        q: `To modstande på ${R1} Ω og ${R2} Ω er koblet i serie. Hvad er den samlede modstand?`,
        options, answer,
        explain: `Seriekobling: R = R₁ + R₂ = ${R1} + ${R2} = ${Rs} Ω.`,
      };
    },
  },
  // Termodynamik
  {
    topic: "termodynamik",
    level: "mellem",
    gen: () => {
      const m = rnd(0.2, 5, 0.1), dT = rnd(5, 60), c = 4186;
      const Q = Math.round(m * c * dT);
      const { options, answer } = numOptions(Q, "J");
      return {
        q: `Hvor meget energi skal der til at opvarme ${m} kg vand med ${dT} °C? (c = 4186 J/(kg·K))`,
        options, answer,
        explain: `Q = m·c·ΔT = ${m}·4186·${dT} = ${Q} J.`,
      };
    },
  },
  {
    topic: "termodynamik",
    level: "let",
    gen: () => {
      const c = rnd(0, 40);
      const k = c + 273.15;
      const { options, answer } = numOptions(Math.round(k * 100) / 100, "K", 0.05);
      return {
        q: `Omregn ${c} °C til kelvin.`,
        options, answer,
        explain: `T(K) = T(°C) + 273,15 = ${c} + 273,15 = ${Math.round(k * 100) / 100} K.`,
      };
    },
  },
  // Bølger
  {
    topic: "boelger",
    level: "mellem",
    gen: () => {
      const f = rnd(20, 500, 10), lambda = rnd(0.5, 8, 0.1);
      const v = Math.round(f * lambda * 10) / 10;
      const { options, answer } = numOptions(v, "m/s");
      return {
        q: `En bølge har frekvensen ${f} Hz og bølgelængden ${lambda} m. Hvad er udbredelsesfarten?`,
        options, answer,
        explain: `v = f·λ = ${f}·${lambda} = ${v} m/s.`,
      };
    },
  },
  {
    topic: "boelger",
    level: "let",
    gen: () => {
      const T = rnd(0.01, 2, 0.01);
      const f = Math.round((1 / T) * 100) / 100;
      const { options, answer } = numOptions(f, "Hz");
      return {
        q: `En svingning har perioden ${T} s. Hvad er frekvensen?`,
        options, answer,
        explain: `f = 1 / T = 1 / ${T} = ${f} Hz.`,
      };
    },
  },
  // Moderne fysik
  {
    topic: "moderne",
    level: "svaer",
    gen: () => {
      const f = rnd(1, 9) * Math.pow(10, rnd(14, 15));
      const h = 6.63e-34;
      const E = h * f;
      const Eexp = E.toExponential(2);
      const opts = shuffle([
        Eexp,
        (E * 1.5).toExponential(2),
        (E * 0.6).toExponential(2),
        (E * 2.2).toExponential(2),
      ]).map((x) => `${x} J`);
      return {
        q: `Hvad er energien af en foton med frekvensen ${f.toExponential(1)} Hz? (h = 6,63·10⁻³⁴ J·s)`,
        options: opts,
        answer: `${Eexp} J`,
        explain: `E = h·f = 6,63·10⁻³⁴ · ${f.toExponential(1)} = ${Eexp} J.`,
      };
    },
  },
];

// ---- STATISKE BEGREBSSPØRGSMÅL -------------------------------------------
const staticBank = [
  {
    topic: "mekanik", level: "let",
    q: "Hvad siger Newtons 1. lov (inertiens lov)?",
    options: shuffle([
      "Et legeme forbliver i hvile eller jævn bevægelse, medmindre en resulterende kraft påvirker det",
      "Kraft er lig med masse gange acceleration",
      "Til enhver kraft hører en lige stor modsatrettet kraft",
      "Energi kan hverken opstå eller forsvinde",
    ]),
    answer: "Et legeme forbliver i hvile eller jævn bevægelse, medmindre en resulterende kraft påvirker det",
    explain: "Newtons 1. lov handler om inerti: uden en resulterende kraft ændres bevægelsestilstanden ikke.",
  },
  {
    topic: "mekanik", level: "let",
    q: "Hvad er SI-enheden for kraft?",
    options: shuffle(["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"]),
    answer: "Newton (N)",
    explain: "1 N = 1 kg·m/s². Joule er energi, watt er effekt, pascal er tryk.",
  },
  {
    topic: "energi", level: "let",
    q: "Hvilken størrelse måles i watt?",
    options: shuffle(["Effekt", "Energi", "Kraft", "Impuls"]),
    answer: "Effekt",
    explain: "Watt er enheden for effekt: 1 W = 1 J/s.",
  },
  {
    topic: "energi", level: "mellem",
    q: "Energibevarelse betyder, at den samlede mekaniske energi i et lukket system uden gnidning…",
    options: shuffle([
      "er konstant",
      "altid stiger",
      "altid falder",
      "er nul",
    ]),
    answer: "er konstant",
    explain: "Uden energitab omdannes energi mellem former, men summen er bevaret.",
  },
  {
    topic: "el", level: "let",
    q: "Hvad er enheden for elektrisk modstand?",
    options: shuffle(["Ohm (Ω)", "Ampere (A)", "Volt (V)", "Coulomb (C)"]),
    answer: "Ohm (Ω)",
    explain: "Modstand måles i ohm. Ampere er strøm, volt er spænding, coulomb er ladning.",
  },
  {
    topic: "el", level: "mellem",
    q: "Hvad sker der med strømmen i en seriekobling, hvis man tilføjer flere modstande?",
    options: shuffle([
      "Strømmen falder, fordi den samlede modstand stiger",
      "Strømmen stiger",
      "Strømmen er uændret",
      "Strømmen bliver nul",
    ]),
    answer: "Strømmen falder, fordi den samlede modstand stiger",
    explain: "I serie lægges modstandene sammen; større R giver mindre I ved samme spænding (I = U/R).",
  },
  {
    topic: "termodynamik", level: "mellem",
    q: "Termodynamikkens 1. hovedsætning er et udtryk for…",
    options: shuffle([
      "energibevarelse",
      "at entropien altid stiger",
      "at temperaturen er konstant",
      "at tryk og volumen er omvendt proportionale",
    ]),
    answer: "energibevarelse",
    explain: "1. hovedsætning: ΔU = Q − W. Den tilførte varme ændrer indre energi og/eller udfører arbejde.",
  },
  {
    topic: "boelger", level: "let",
    q: "Hvad kaldes afstanden mellem to nabotoppe i en bølge?",
    options: shuffle(["Bølgelængde", "Amplitude", "Frekvens", "Periode"]),
    answer: "Bølgelængde",
    explain: "Bølgelængden λ er afstanden mellem to punkter i samme fase, fx top til top.",
  },
  {
    topic: "boelger", level: "mellem",
    q: "Lysets fart i vakuum er tættest på…",
    options: shuffle(["3,0·10⁸ m/s", "3,0·10⁶ m/s", "3,0·10¹⁰ m/s", "1,5·10⁸ m/s"]),
    answer: "3,0·10⁸ m/s",
    explain: "c ≈ 299 792 458 m/s ≈ 3,0·10⁸ m/s.",
  },
  {
    topic: "moderne", level: "mellem",
    q: "Hvad beskriver et atoms massetal (A)?",
    options: shuffle([
      "Antallet af protoner plus neutroner",
      "Kun antallet af protoner",
      "Kun antallet af elektroner",
      "Antallet af neutroner minus protoner",
    ]),
    answer: "Antallet af protoner plus neutroner",
    explain: "Massetallet A = Z (protoner) + N (neutroner). Atomnummeret Z er kun protoner.",
  },
  {
    topic: "moderne", level: "svaer",
    q: "Hvilken stråling består af heliumkerner?",
    options: shuffle(["Alfastråling", "Betastråling", "Gammastråling", "Røntgenstråling"]),
    answer: "Alfastråling",
    explain: "Alfapartikler er heliumkerner (2 protoner + 2 neutroner). Beta er elektroner/positroner, gamma er fotoner.",
  },
  {
    topic: "moderne", level: "mellem",
    q: "Halveringstiden for et radioaktivt stof er den tid, der går, før…",
    options: shuffle([
      "halvdelen af kernerne er henfaldet",
      "alle kerner er henfaldet",
      "stoffet bliver stabilt",
      "massen fordobles",
    ]),
    answer: "halvdelen af kernerne er henfaldet",
    explain: "Efter én halveringstid er aktiviteten og antallet af tilbageværende kerner halveret.",
  },
];

// Returnér ét spørgsmål (frisk genereret hvis dynamisk)
function buildOne(item) {
  if (item.gen) {
    const g = item.gen();
    return {
      topic: item.topic,
      level: item.level,
      question: g.q,
      options: g.options,
      answer: g.answer,
      explain: g.explain,
    };
  }
  return {
    topic: item.topic,
    level: item.level,
    question: item.q,
    options: shuffle(item.options),
    answer: item.answer,
    explain: item.explain,
  };
}

export function getQuestions({ topic = "alle", level = "alle", count = 10 } = {}) {
  let pool = [...dynamic, ...staticBank];
  if (topic !== "alle") pool = pool.filter((q) => q.topic === topic);
  if (level !== "alle") pool = pool.filter((q) => q.level === level);
  if (pool.length === 0) pool = [...dynamic, ...staticBank];

  // Træk tilfældigt, gentag generatorer for variation
  const out = [];
  const order = shuffle(pool);
  let i = 0;
  while (out.length < count) {
    out.push(buildOne(order[i % order.length]));
    i++;
    if (i > count * 3 && out.length < count) break; // sikkerhedsstop
  }
  return out.slice(0, count);
}

// Flashcards (begreber & formler)
export const FLASHCARDS = [
  { topic: "mekanik", front: "Newtons 2. lov", back: "F = m · a — kraften er lig masse gange acceleration." },
  { topic: "mekanik", front: "Strækning ved konstant fart", back: "s = v · t" },
  { topic: "mekanik", front: "Frit fald (fra hvile)", back: "h = ½ · g · t², med g ≈ 9,82 m/s²" },
  { topic: "energi", front: "Kinetisk energi", back: "E_kin = ½ · m · v²" },
  { topic: "energi", front: "Potentiel energi (tyngde)", back: "E_pot = m · g · h" },
  { topic: "energi", front: "Effekt", back: "P = W / t = arbejde pr. tid (måles i watt)" },
  { topic: "el", front: "Ohms lov", back: "U = R · I  (spænding = modstand · strøm)" },
  { topic: "el", front: "Elektrisk effekt", back: "P = U · I" },
  { topic: "el", front: "Seriekobling af modstande", back: "R_total = R₁ + R₂ + …" },
  { topic: "el", front: "Parallelkobling af modstande", back: "1/R_total = 1/R₁ + 1/R₂ + …" },
  { topic: "termodynamik", front: "Varmeenergi", back: "Q = m · c · ΔT" },
  { topic: "termodynamik", front: "Celsius → Kelvin", back: "T(K) = T(°C) + 273,15" },
  { topic: "termodynamik", front: "1. hovedsætning", back: "ΔU = Q − W (energibevarelse)" },
  { topic: "boelger", front: "Bølgeligningen", back: "v = f · λ (fart = frekvens · bølgelængde)" },
  { topic: "boelger", front: "Frekvens og periode", back: "f = 1 / T" },
  { topic: "boelger", front: "Lysets fart i vakuum", back: "c ≈ 3,0 · 10⁸ m/s" },
  { topic: "moderne", front: "Fotonenergi", back: "E = h · f, med h = 6,63 · 10⁻³⁴ J·s" },
  { topic: "moderne", front: "Massetal", back: "A = Z (protoner) + N (neutroner)" },
  { topic: "moderne", front: "Halveringstid", back: "Tiden før halvdelen af kernerne er henfaldet." },
  { topic: "moderne", front: "Einsteins energiformel", back: "E = m · c² (masse-energi-ækvivalens)" },
];
