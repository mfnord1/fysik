// ---- state (gemmes lokalt i browseren) ----
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};
let progress = store.get("progress", { solved: 0, correct: 0, lastDay: null, streak: 0 });

// ---- navigation ----
const views = document.querySelectorAll(".view");
const navBtns = document.querySelectorAll("[data-view]");
function show(view) {
  views.forEach(v => v.classList.toggle("active", v.id === "view-" + view));
  document.querySelectorAll(".nav-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.view === view));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
navBtns.forEach(b => b.addEventListener("click", () => show(b.dataset.view)));

// ---- progress / streak ----
function renderStats() {
  document.getElementById("statSolved").textContent = progress.solved;
  document.getElementById("statAcc").textContent =
    progress.solved ? Math.round((progress.correct / progress.solved) * 100) + "%" : "–";
  document.getElementById("statStreak").textContent = progress.streak;
}
function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (progress.lastDay === today) return;
  const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  progress.streak = progress.lastDay === yest ? progress.streak + 1 : 1;
  progress.lastDay = today;
  store.set("progress", progress);
}
renderStats();

// ---- load topics into selects/chips ----
let TOPICS = [];
let selectedTopics = new Set();
async function loadTopics() {
  TOPICS = await (await fetch("/api/topics")).json();
  const chips = document.getElementById("topicChips");
  chips.innerHTML = "";
  TOPICS.forEach(t => {
    const c = document.createElement("div");
    c.className = "chip"; c.textContent = t.name; c.dataset.id = t.id;
    c.addEventListener("click", () => {
      c.classList.toggle("on");
      c.classList.contains("on") ? selectedTopics.add(t.id) : selectedTopics.delete(t.id);
    });
    chips.appendChild(c);
  });
  ["quizTopic", "flashTopic"].forEach(id => {
    const sel = document.getElementById(id);
    TOPICS.forEach(t => {
      const o = document.createElement("option");
      o.value = t.id; o.textContent = t.name; sel.appendChild(o);
    });
  });
}
loadTopics();

// ---- LÆSEPLAN ----
document.getElementById("makePlan").addEventListener("click", () => {
  const dateVal = document.getElementById("examDate").value;
  const out = document.getElementById("planOut");
  if (!dateVal) { out.innerHTML = `<div class="card">Vælg en eksamensdato først.</div>`; return; }
  const exam = new Date(dateVal + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const days = Math.round((exam - now) / 864e5);
  if (days <= 0) { out.innerHTML = `<div class="card">Vælg en dato i fremtiden.</div>`; return; }

  const topics = selectedTopics.size ? [...selectedTopics] : TOPICS.map(t => t.id);
  const tName = id => (TOPICS.find(t => t.id === id) || {}).name || id;
  const planDays = Math.min(days, 14);
  let html = `<p class="plan-head">Du har <b>${days} dage</b> til eksamen. Her er en plan for de næste <b>${planDays} dage</b> med ${topics.length} emne(r):</p>`;
  for (let d = 0; d < planDays; d++) {
    const t = topics[d % topics.length];
    const date = new Date(now.getTime() + d * 864e5);
    const ds = date.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "short" });
    let task;
    if (d === planDays - 1 && days <= 14)
      task = "Stor blandet quiz på tværs af alle emner + repetér svage flashcards.";
    else if (d % 3 === 2)
      task = `Quiz i ${tName(t)} (svær) — test om det sidder fast.`;
    else
      task = `Læs ${tName(t)}: gennemgå flashcards + 10 øvelsesspørgsmål.`;
    html += `<div class="day"><span class="d-num">Dag ${d + 1}</span>
      <div class="d-body"><strong>${ds}</strong><span>${task}</span></div></div>`;
  }
  out.innerHTML = html;
  store.set("plan", { dateVal, topics });
});
(() => { // genindlæs gemt plan-dato
  const p = store.get("plan", null);
  if (p) document.getElementById("examDate").value = p.dateVal;
})();

// ---- QUIZ ----
let quiz = { items: [], idx: 0, correct: 0 };
document.getElementById("startQuiz").addEventListener("click", async () => {
  const topic = document.getElementById("quizTopic").value;
  const level = document.getElementById("quizLevel").value;
  const count = document.getElementById("quizCount").value;
  const area = document.getElementById("quizArea");
  area.innerHTML = `<div class="card">Henter spørgsmål…</div>`;
  try {
    const items = await (await fetch(`/api/questions?topic=${topic}&level=${level}&count=${count}`)).json();
    quiz = { items, idx: 0, correct: 0 };
    renderQuestion();
  } catch {
    area.innerHTML = `<div class="card">Noget gik galt. Prøv igen.</div>`;
  }
});

function renderQuestion() {
  const area = document.getElementById("quizArea");
  const q = quiz.items[quiz.idx];
  const tName = (TOPICS.find(t => t.id === q.topic) || {}).name || q.topic;
  area.innerHTML = `
    <div class="q-progress">Spørgsmål ${quiz.idx + 1} af ${quiz.items.length} · ${quiz.correct} rigtige</div>
    <div class="q-card">
      <div class="q-topic">${tName} · ${q.level}</div>
      <div class="q-text">${q.question}</div>
      <div class="opts">${q.options.map(o => `<button class="opt">${o}</button>`).join("")}</div>
      <div id="afterQ"></div>
    </div>`;
  area.querySelectorAll(".opt").forEach(btn =>
    btn.addEventListener("click", () => answer(btn, q)));
}

function answer(btn, q) {
  const opts = document.querySelectorAll(".opt");
  const chosen = btn.textContent;
  const ok = chosen === q.answer;
  opts.forEach(o => {
    o.disabled = true;
    if (o.textContent === q.answer) o.classList.add("correct");
    else if (o === btn) o.classList.add("wrong");
  });
  // opdater fremgang
  progress.solved++; if (ok) { progress.correct++; quiz.correct++; }
  touchStreak(); store.set("progress", progress); renderStats();

  const last = quiz.idx === quiz.items.length - 1;
  document.getElementById("afterQ").innerHTML = `
    <div class="explain"><b>${ok ? "Rigtigt! ✅" : "Ikke helt. ❌"}</b> ${q.explain}</div>
    <div class="q-next"><button class="btn primary" id="nextQ">${last ? "Se resultat" : "Næste"}</button></div>`;
  document.getElementById("nextQ").addEventListener("click", () => {
    if (last) return showResult();
    quiz.idx++; renderQuestion();
  });
}

function showResult() {
  const pct = Math.round((quiz.correct / quiz.items.length) * 100);
  let msg = pct >= 80 ? "Stærkt! Du er godt med." :
            pct >= 50 ? "Fin start — kør en runde til på de svære emner." :
            "Tag det roligt og gennemgå forklaringerne og flashcards.";
  document.getElementById("quizArea").innerHTML = `
    <div class="card quiz-result">
      <div class="score">${quiz.correct}/${quiz.items.length}</div>
      <p>${pct}% rigtige. ${msg}</p>
      <button class="btn primary" id="againQ">Ny quiz (nye spørgsmål)</button>
    </div>`;
  document.getElementById("againQ").addEventListener("click", () =>
    document.getElementById("startQuiz").click());
}

// ---- FLASHCARDS ----
document.getElementById("loadFlash").addEventListener("click", async () => {
  const topic = document.getElementById("flashTopic").value;
  const area = document.getElementById("flashArea");
  area.innerHTML = "Henter…";
  const cards = await (await fetch(`/api/flashcards?topic=${topic}`)).json();
  area.innerHTML = "";
  cards.forEach(c => {
    const tName = (TOPICS.find(t => t.id === c.topic) || {}).name || c.topic;
    const el = document.createElement("div");
    el.className = "fcard";
    el.innerHTML = `
      <div class="fcard-inner">
        <div class="fcard-face fcard-front">
          <div class="ft">${tName}</div><h4>${c.front}</h4>
          <div class="fcard-hint">Tryk for at vende →</div>
        </div>
        <div class="fcard-face fcard-back">${c.back}</div>
      </div>`;
    el.addEventListener("click", () => el.classList.toggle("flip"));
    area.appendChild(el);
  });
});

// ---- TUTOR ----
const chat = document.getElementById("chat");
function bubble(text, who) {
  const b = document.createElement("div");
  b.className = "bubble " + who; b.textContent = text;
  chat.appendChild(b); chat.scrollTop = chat.scrollHeight;
}
bubble("Hej! Jeg er din fysik-tutor. Spørg mig om en formel eller et begreb, så forklarer jeg det kort.", "bot");

async function sendChat() {
  const input = document.getElementById("chatMsg");
  const msg = input.value.trim();
  if (!msg) return;
  bubble(msg, "user"); input.value = "";
  try {
    const r = await (await fetch("/api/tutor", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    })).json();
    bubble(r.reply, "bot");
  } catch {
    bubble("Beklager, der opstod en fejl. Prøv igen.", "bot");
  }
}
document.getElementById("sendChat").addEventListener("click", sendChat);
document.getElementById("chatMsg").addEventListener("keydown", e => {
  if (e.key === "Enter") sendChat();
});

// ---- PDF-NOTER ----
let pdfFile = null;
const pdfDrop   = document.getElementById("pdfDrop");
const pdfInput  = document.getElementById("pdfInput");
const pdfLabel  = document.getElementById("pdfLabel");
const analyzeBtn = document.getElementById("analyzePdf");
const apiKeyInp = document.getElementById("apiKey");
const pdfStatus = document.getElementById("pdfStatus");
const pdfOut    = document.getElementById("pdfOut");

// Gendan gemt API-nøgle
apiKeyInp.value = store.get("apiKey", "");
apiKeyInp.addEventListener("input", () => store.set("apiKey", apiKeyInp.value.trim()));

function updateAnalyzeBtn() {
  analyzeBtn.disabled = !(pdfFile && apiKeyInp.value.trim());
}
apiKeyInp.addEventListener("input", updateAnalyzeBtn);

function setPdf(file) {
  if (!file || file.type !== "application/pdf") {
    pdfStatus.textContent = "Kun PDF-filer understøttes."; return;
  }
  pdfFile = file;
  pdfLabel.textContent = `✅ ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
  pdfDrop.classList.add("has-file");
  pdfStatus.textContent = "";
  updateAnalyzeBtn();
}
pdfDrop.addEventListener("click", () => pdfInput.click());
pdfInput.addEventListener("change", () => setPdf(pdfInput.files[0]));
pdfDrop.addEventListener("dragover", e => { e.preventDefault(); pdfDrop.classList.add("over"); });
pdfDrop.addEventListener("dragleave", () => pdfDrop.classList.remove("over"));
pdfDrop.addEventListener("drop", e => {
  e.preventDefault(); pdfDrop.classList.remove("over");
  setPdf(e.dataTransfer.files[0]);
});

analyzeBtn.addEventListener("click", async () => {
  if (!pdfFile || !apiKeyInp.value.trim()) return;
  const mode  = document.getElementById("pdfMode").value;
  const count = document.getElementById("pdfCount").value;

  analyzeBtn.disabled = true;
  pdfStatus.innerHTML = `<div class="pbar"><div class="pbar-fill"></div></div>Analyserer PDF med AI…`;
  pdfOut.innerHTML = "";

  const form = new FormData();
  form.append("pdf", pdfFile);
  form.append("mode", mode);
  form.append("count", count);
  form.append("apiKey", apiKeyInp.value.trim());

  try {
    const res  = await fetch("/api/pdf", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Ukendt fejl");

    pdfStatus.textContent = `✅ ${data.items.length} ${mode === "flash" ? "flashcards" : "spørgsmål"} genereret fra ${pdfFile.name}`;

    if (mode === "flash") renderPdfFlash(data.items);
    else                  renderPdfQuiz(data.items);
  } catch (err) {
    pdfStatus.textContent = "⚠️ Fejl: " + err.message;
  } finally {
    analyzeBtn.disabled = false;
  }
});

function renderPdfFlash(items) {
  const grid = document.createElement("div");
  grid.className = "pdf-flash-grid";
  items.forEach(c => {
    const el = document.createElement("div");
    el.className = "fcard";
    el.innerHTML = `
      <div class="fcard-inner">
        <div class="fcard-face fcard-front">
          <div class="ft">Fra dine noter</div>
          <h4>${c.front}</h4>
          <div class="fcard-hint">Tryk for at vende →</div>
        </div>
        <div class="fcard-face fcard-back">${c.back}</div>
      </div>`;
    el.addEventListener("click", () => el.classList.toggle("flip"));
    grid.appendChild(el);
  });
  pdfOut.appendChild(grid);
}

function renderPdfQuiz(items) {
  // Brug den eksisterende quiz-motor, men vis i pdfOut
  let idx = 0, correct = 0;

  function showQ() {
    const q = items[idx];
    pdfOut.innerHTML = `
      <div class="q-progress">Spørgsmål ${idx + 1} af ${items.length} · ${correct} rigtige</div>
      <div class="q-card">
        <div class="q-topic">Fra dine noter · ${q.level || "–"}</div>
        <div class="q-text">${q.question}</div>
        <div class="opts">${q.options.map(o => `<button class="opt">${o}</button>`).join("")}</div>
        <div id="pdfAfterQ"></div>
      </div>`;
    pdfOut.querySelectorAll(".opt").forEach(btn =>
      btn.addEventListener("click", () => answerPdf(btn, q)));
  }

  function answerPdf(btn, q) {
    const opts = pdfOut.querySelectorAll(".opt");
    const ok   = btn.textContent === q.answer;
    opts.forEach(o => {
      o.disabled = true;
      if (o.textContent === q.answer) o.classList.add("correct");
      else if (o === btn && !ok)      o.classList.add("wrong");
    });
    if (ok) correct++;
    progress.solved++; if (ok) progress.correct++;
    touchStreak(); store.set("progress", progress); renderStats();

    const last = idx === items.length - 1;
    document.getElementById("pdfAfterQ").innerHTML = `
      <div class="explain"><b>${ok ? "Rigtigt! ✅" : "Ikke helt. ❌"}</b> ${q.explain || ""}</div>
      <div class="q-next"><button class="btn primary" id="pdfNext">${last ? "Se resultat" : "Næste"}</button></div>`;
    document.getElementById("pdfNext").addEventListener("click", () => {
      if (last) {
        const pct = Math.round((correct / items.length) * 100);
        pdfOut.innerHTML = `
          <div class="card quiz-result">
            <div class="score">${correct}/${items.length}</div>
            <p>${pct}% rigtige på dine egne noter.</p>
            <button class="btn primary" id="pdfAgain">Kør quizzen igen</button>
          </div>`;
        document.getElementById("pdfAgain").addEventListener("click", () => {
          idx = 0; correct = 0; showQ();
        });
      } else { idx++; showQ(); }
    });
  }
  showQ();
}
