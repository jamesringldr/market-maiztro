# Market Maiztro — repo context

Lab workspace: `Maiztro-Lab/domains/fullstack/market-maiztro/`
Clone: `/Users/jameso/DevWork/Solyco/Market-Maiztro`
Prod branch: `main`

## What this is
Front-end-only demo of Solyco’s internal desk. Vite + React + TypeScript. Seed + `localStorage`. No vendor APIs.

## Invariants
- Simulated integrations only. Comms = presence, never message bodies.
- Morning positions file is ingested locally. New = LastTradeDate is today. Posted only after per-row HITL approval, fanned to the portfolio sleeve.
- Generated language is template-based. Do not wire a model.
- This product **is** the CRM (see Lab `decisions/0001-initial-direction.md`).
- Solyco-only. No multi-tenant / white-label work without revisiting that decision.

## Commands
`npm run dev` — desktop demo on :5173
`npm run build` — typecheck + production bundle
GitHub Pages: `https://jamesringldr.github.io/market-maiztro/` (workflow on `main`, `GITHUB_PAGES=1`)
