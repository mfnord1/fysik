import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { getQuestions, FLASHCARDS, TOPICS } from "./data/questions.js";
import { TUTOR } from "./data/tutor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Multer: hold PDF i hukommelse (ingen disk-skrivning på Railway)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB maks
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype === "application/pdf");
  },
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ---- Anthropic-hjælpefunktion ----
async function callClaude(systemPrompt, userContent, apiKey) {
  if (!apiKey) throw new Error("Ingen API-nøgle. Indtast din Anthropic API-nøgle i feltet.");

  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API fejl ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content.map(b => (b.type === "text" ? b.text : "")).join("");
}

// ---- PDF-upload → AI spørgsmål + flashcards ----
app.post("/api/pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Ingen gyldig PDF modtaget." });

  const mode = req.body.mode || "quiz"; // "quiz" | "flash"
  const count = Math.min(parseInt(req.body.count || "10", 10), 20);
  const apiKey = req.body.apiKey || process.env.ANTHROPIC_API_KEY || "";
  const pdfBase64 = req.file.buffer.toString("base64");

  const systemQuiz = `Du er en eksamenscoach i fysik (og andre naturvidenskabelige fag).
Ud fra det uploadede PDF-materiale genererer du ${count} multiple choice-spørgsmål.
Regler:
- Spørgsmål skal dække det faktiske indhold i PDF'en.
- Hvert spørgsmål har præcis 4 svarmuligheder; kun én er korrekt.
- Inkludér en kort forklaring (max 2 sætninger) til det rigtige svar.
- Variér sværhedsgraden: ca. 1/3 let, 1/3 mellem, 1/3 svær.
- Svar KUN med et JSON-array i dette format (ingen markdown, ingen præambel):
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explain": "...",
    "level": "let"
  }
]`;

  const systemFlash = `Du er en eksamenscoach i fysik (og andre naturvidenskabelige fag).
Ud fra det uploadede PDF-materiale genererer du ${count} flashcards med vigtige begreber, formler og definitioner.
Svar KUN med et JSON-array i dette format (ingen markdown, ingen præambel):
[
  {
    "front": "Begrebets navn eller formelens navn",
    "back": "Kort, præcis forklaring eller formel — max 2 sætninger."
  }
]`;

  try {
    const system = mode === "flash" ? systemFlash : systemQuiz;
    const raw = await callClaude(system, [
      {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
      },
      { type: "text", text: mode === "flash"
          ? `Lav ${count} flashcards fra dette materiale.`
          : `Lav ${count} multiple choice-spørgsmål fra dette materiale.` },
    ], apiKey);

    // Rens eventuelle markdown-fences
    const clean = raw.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(clean);
    res.json({ ok: true, items: parsed });
  } catch (err) {
    console.error("PDF/AI fejl:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Eksisterende endpoints ----
app.get("/api/topics", (_req, res) => res.json(TOPICS));

app.get("/api/questions", (req, res) => {
  const topic = req.query.topic || "alle";
  const level = req.query.level || "alle";
  const count = Math.min(parseInt(req.query.count || "10", 10), 30);
  res.json(getQuestions({ topic, level, count }));
});

app.get("/api/flashcards", (req, res) => {
  const topic = req.query.topic || "alle";
  let cards = FLASHCARDS;
  if (topic !== "alle") cards = cards.filter(c => c.topic === topic);
  res.json(cards);
});

app.post("/api/tutor", (req, res) => {
  const msg = (req.body.message || "").toLowerCase();
  let best = null, bestScore = 0;
  for (const entry of TUTOR) {
    const score = entry.keys.reduce((s, k) => (msg.includes(k) ? s + 1 : s), 0);
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  if (best && bestScore > 0) return res.json({ reply: best.answer });
  res.json({ reply: "Det er jeg ikke helt sikker på endnu. Prøv at spørge om et fysikemne, fx \"forklar Ohms lov\", \"hvad er kinetisk energi\" eller \"hvad er en halveringstid\"." });
});

app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Fysik-eksamen kører på port ${PORT}`));
