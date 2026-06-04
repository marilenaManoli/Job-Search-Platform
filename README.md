# Swiss Job Search Hub

A local, browser-based job search tracker and AI assistant tailored for the Swiss tech market. No server, no framework, no dependencies — just open `index.html`.

## Features

- **Dashboard** — live stats: tracked roles, active pipeline, interviews, weekly goal progress
- **Application Tracker** — log every role with status, deadline, notes, and city; filter and sort
- **Find Jobs (AI)** — live web search via Claude API, or a targeted search strategy via Ollama; smart pre-filled links for 8 Swiss job boards that update as you change filters
- **Cover Letter Generator** — AI-tailored letters based on your profile and the job description; copy or download as `.txt`
- **Recruiter Outreach** — AI-generated LinkedIn DMs and cold emails for agencies and hiring managers
- **Suggestions** — AI analysis of your profile and tracker state across 5 categories: Role Fit, Companies to Target, Strengths, Skill Gaps, Quick Wins
- **Weekly Goals** — add, complete, and reset goals with a progress bar
- **Settings** — switch between Anthropic (Claude) and Ollama (free, local); export/import/clear data

## Getting started

```bash
open index.html   # macOS
# or just double-click index.html in Finder
```

No build step, no install.

## AI setup

### Option A — Anthropic API (Claude, paid)

1. Get a key at [console.anthropic.com](https://console.anthropic.com)
2. Open the app → Settings → paste your `sk-ant-api...` key → Save

Enables: live web job search, cover letters, outreach, suggestions.

### Option B — Ollama (free, local)

1. Install [Ollama](https://ollama.com) and pull a model:
   ```bash
   ollama pull llama3
   ```
2. Start Ollama with CORS open (required for `file://` access):
   ```bash
   OLLAMA_ORIGINS=* ollama serve
   ```
3. Open the app → Settings → switch provider to **Ollama** → enter model name → Save

Enables: cover letters, outreach, suggestions, search strategy. Live web search requires Anthropic.

## Project structure

```
job-search/
├── index.html          # HTML shell — no inline JS or CSS
├── css/
│   └── styles.css      # All styles
└── js/
    ├── state.js         # App state, localStorage, constants
    ├── api.js           # Claude + Ollama API calls, provider switching, profile summary
    ├── ui.js            # Navigation, toast, status bar, shared utils
    ├── dashboard.js     # Dashboard render
    ├── tracker.js       # Application CRUD
    ├── profile.js       # Profile form load/save, skills grid
    ├── goals.js         # Weekly goals
    ├── finder.js        # Job scan, smart search links
    ├── letters.js       # Cover letter generation
    ├── outreach.js      # Recruiter outreach + agency cards
    ├── suggestions.js   # Profile analysis, section card render
    ├── settings.js      # Export / import / clear data
    └── main.js          # Init
```

JS files are loaded via `<script>` tags in dependency order — `state.js` first, `main.js` last — so all functions share the global scope and the app works on `file://` without a server.

## Data & privacy

All data lives in your browser's `localStorage` under the key `sjsh_state`. Your API key is stored separately under `sjsh_api`. Nothing is sent anywhere except directly to Anthropic or your local Ollama instance.

Export your data any time from Settings → Export all data (.json). Import it back on any machine.

## Swiss job boards covered

| Board | Type |
|---|---|
| [Jobs.ch](https://www.jobs.ch) | General Swiss board |
| [SwissDevJobs](https://swissdevjobs.ch) | Tech-focused |
| [DataCareer.ch](https://datacareer.ch) | AI / Data |
| [LinkedIn Jobs](https://www.linkedin.com/jobs) | Network + jobs |
| [Indeed CH](https://ch.indeed.com) | Aggregator |
| [Glassdoor](https://www.glassdoor.com) | Reviews + jobs |
| [English Forum Switzerland](https://www.englishforum.ch/jobs) | Expat-friendly |
| [Swisslinks](https://www.swisslinks.com) | Swiss networking |

## Recruiting agencies

Hays Switzerland · Michael Page CH · Robert Walters CH · Swisslinx · Darwin Recruitment
