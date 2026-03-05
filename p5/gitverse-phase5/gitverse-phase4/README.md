# ⚡ GitVerse — The World's Best Git & GitHub Learning Platform

> 18 deep chapters · Interactive simulators · Quizzes · Search · Keyboard shortcuts

---

## 🚀 Run on GitHub Codespaces (One Click)

1. Click **`< > Code`** → **Codespaces** tab → **"Create codespace on main"**
2. Wait ~60 seconds — app opens **automatically** at port 5173 ✅

Manual start (if needed):
```bash
npm install && npm run dev
```

---

## 💻 Run Locally

```bash
git clone https://github.com/YOUR-USERNAME/gitverse.git
cd gitverse
npm install
npm run dev
# → http://localhost:5173
```

---

## 🗂️ Project Structure

```
src/
├── App.jsx                        ← Root: router + layout + keyboard shortcuts
├── main.jsx                       ← React entry point
│
├── context/
│   └── AppContext.jsx             ← Global state: navigation, progress, UI
│
├── data/
│   ├── chapters.js                ← CHAPTERS[], PARTS[], COMMAND_REFERENCE[]
│   └── chapterContent.js         ← All 18 chapters' full content
│
├── hooks/
│   └── index.js                  ← useReadingProgress, useKeyboard, useSearch,
│                                    useLocalStorage, useIsMobile
│
├── styles/
│   └── global.css                ← Design tokens, animations, responsive rules
│
├── components/
│   ├── ui/
│   │   └── index.jsx             ← ProgressRing, AnimatedCounter, CopyButton,
│   │                                Badge, Notification, ReadingProgressBar, Kbd
│   │
│   ├── layout/
│   │   ├── Navbar.jsx            ← Sticky nav, breadcrumb, reading progress bar
│   │   ├── Sidebar.jsx           ← Chapter navigation drawer (slide-in)
│   │   └── SearchModal.jsx       ← Full-text search across all chapters
│   │
│   ├── chapter/
│   │   ├── ChapterView.jsx       ← Full chapter page (header, tabs, nav)
│   │   ├── ContentSection.jsx    ← Renders text/code/analogy/diagram sections
│   │   ├── PracticeTab.jsx       ← Routes chapters to correct simulator
│   │   └── QuizTab.jsx           ← 5-question quiz with scoring
│   │
│   └── simulators/
│       └── index.jsx             ← StagingSimulator, CommitGraphVisualizer,
│                                    TerminalSimulator
│
└── pages/
    ├── HomePage.jsx              ← Hero, parts overview, tools, command ref
    ├── AllChaptersPage.jsx       ← Chapter grid with filters + progress
    └── CheatsheetPage.jsx        ← Filterable full command reference + print
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Open search |
| `J` | Next chapter |
| `K` | Previous chapter |
| `H` | Go home |
| `C` | All chapters |
| `S` | Cheatsheet |
| `Esc` | Close modal/sidebar |

---

## 📚 Curriculum

| Part | Chapters | Topics |
|------|----------|--------|
| 1 — The Why | 1–3 | Version control problem, What is Git, GitHub intro |
| 2 — The How | 4–7 | Three Trees model, CLI basics, First repo, Git internals |
| 3 — The Power | 8–10 | Branches, Merging, Merge conflicts |
| 4 — GitHub | 11–13 | Remotes, GitHub Flow, Pull Requests |
| 5 — Pro Toolbox | 14–17 | Rebase, Undo, Debug tools, .gitignore |
| 6 — Real World | 18 | React app + GitHub Pages + GitHub Actions |

---

## 🎮 Interactive Features

- **Terminal Simulator** — run real Git commands in-browser (Chapters 5–6)
- **Commit Graph Visualizer** — build branch/commit graphs visually (Chapters 8–9)
- **Staging Area Simulator** — drag files through the three trees (Chapter 4)
- **Quiz Engine** — 5 questions per chapter, instant feedback, scoring

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool & dev server |
| Custom CSS | — | No framework, pure CSS variables |
| Google Fonts | — | JetBrains Mono + Fraunces + Inter |

---

## 📦 Build for Production

```bash
npm run build
# Output → /dist (deploy anywhere: Netlify, Vercel, GitHub Pages)
```

### Deploy to GitHub Pages
```bash
npm install gh-pages --save-dev

# Add to package.json:
# "homepage": "https://YOUR-USERNAME.github.io/gitverse",
# "predeploy": "npm run build",
# "deploy": "gh-pages -d dist"

npm run deploy
```

---

## 🧩 Adding Content

### Add a new chapter
1. Add entry to `src/data/chapters.js` → `CHAPTERS[]`
2. Add content to `src/data/chapterContent.js` → `getChapterContent()`
3. Add chapter ID to the correct part in `PARTS[]`

### Add a new command category
Edit `COMMAND_REFERENCE[]` in `src/data/chapters.js`

### Add a new simulator
1. Create component in `src/components/simulators/`
2. Export from `src/components/simulators/index.jsx`
3. Wire in `src/components/chapter/PracticeTab.jsx`

---

## 📄 License

MIT — free to use, fork, and build upon.
