# FysikEksamen

Eksamensforberedelse med fokus på fysik. Personlig læseplan, varierende quizzer,
flashcards og en AI-tutor. Spørgsmålene genereres med nye tal hver gang, så det
ikke bliver ren udenadslære.

## Kør lokalt
```bash
npm install
npm start
```
Åbn http://localhost:3000

## Deploy til Railway
1. Læg projektet i et GitHub-repo (eller brug `railway up`).
2. På railway.app: **New Project → Deploy from GitHub repo** (vælg dette repo).
3. Railway finder automatisk Node + `npm start`. Ingen miljøvariabler kræves —
   `PORT` sættes af Railway selv.
4. Tryk **Generate Domain** for at få en offentlig URL.

## Funktioner
- **Læseplan** – sæt eksamensdato + emner, få en dag-for-dag plan.
- **Quiz** – vælg emne/niveau/antal; svar med forklaring og løbende fremgang.
- **Flashcards** – vendbare kort med formler og begreber.
- **AI-tutor** – stil spørgsmål om begreber/formler.
- **Fremgang** – besvarede, % rigtige og streak gemmes lokalt i browseren.
