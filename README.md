# ⚡ GitVerse — The World's Best Git & GitHub Learning Platform

> Master Git & GitHub from zero to pro — 18 deep chapters, interactive simulators, quizzes, and a real-world React case study.

---

## 🚀 Run Instantly on GitHub Codespaces

### Option A — One-Click (Recommended)
1. Click the green **`< > Code`** button on GitHub
2. Select the **Codespaces** tab
3. Click **"Create codespace on main"**
4. Wait ~60 seconds — the app opens **automatically** in your browser ✅

### Option B — Manual Start
If the app doesn't open automatically in Codespaces:
```bash
npm install
npm run dev
```
Then click the **Ports** tab in the terminal panel → open port **5173**.

---

## 💻 Run Locally

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/YOUR-USERNAME/gitverse.git
cd gitverse

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open in browser
# → http://localhost:5173
```

---

## 📦 Build for Production

```bash
npm run build
# Output goes to /dist — ready to deploy anywhere
```

### Deploy to GitHub Pages
```bash
# Install gh-pages
npm install gh-pages --save-dev

# Add to package.json scripts:
# "predeploy": "npm run build",
# "deploy": "gh-pages -d dist"

# Deploy!
npm run deploy
```

---

## 🗂️ Project Structure

```
gitverse/
├── .devcontainer/
│   └── devcontainer.json    ← GitHub Codespaces config
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx             ← React entry point
│   └── App.jsx              ← Everything (all 18 chapters)
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## 📚 What's Inside

| Part | Chapters | Topics |
|------|----------|--------|
| 1 — The Why | 1–3 | Version control basics, What is Git, GitHub intro |
| 2 — The How | 4–7 | Three Trees model, CLI, First repo, Git internals |
| 3 — The Power | 8–10 | Branches, Merging, Merge conflicts |
| 4 — GitHub | 11–13 | Remotes, GitHub Flow, Pull Requests |
| 5 — Pro Toolbox | 14–17 | Rebase, Undo, Debug tools, .gitignore |
| 6 — Real World | 18 | React app + GitHub Pages deployment |

### 🎮 Interactive Features
- **Terminal Simulator** — Run real Git commands in-browser
- **Commit Graph Visualizer** — Build visual branch/commit graphs
- **Staging Area Simulator** — Drag files between Working Dir → Staging → Commit
- **Quiz Engine** — 5 questions per chapter with scoring and explanations

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool & dev server
- **Pure CSS** — No CSS framework (all custom with CSS variables)
- **Google Fonts** — JetBrains Mono + Fraunces

---

## 📄 License

MIT — free to use, share, and build upon.