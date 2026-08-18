# Market Maiztro

Internal desk for **Solyco** — a private equity / venture firm with no apps team and no CRM. This is a front-end-only simulation of the daily workspace: integration hub, prospect CRM, member knowledge base, touchpoint planner, AI meeting companion, comms presence, and human-in-the-loop trade approval.

Nothing here talks to a real vendor. There is no backend, no OAuth, no market-data feed, and no live model. Generated briefs, scripts, notes, and the “live” transcript are local templates playing over seeded data.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Desk date is locked to **Saturday, 15 August 2026**.

## What is in the demo

| Surface | What you can do |
|---|---|
| Launch pad | Today’s meetings, comms pulse, market glance |
| Approvals | Edge Tech queue + one-click trade approve/hold |
| Comms | Email / phone / text *presence* only — no message bodies |
| Trades | 2am positions file; today’s LastTradeDate rows; approve once to the product sleeve |
| Daily prep / In meeting | Info sheet, scripted STT tape, rapport, landmines, dual recap |
| Members | 360 file, Rocko rolodex, accounts, missing info, memory |
| Prospects | CRM stages, intelligence brief, call script, interaction plan |
| Touchpoints | Planner across members and prospects |
| Knowledge | Search the same book as a library |
| Market brief | Saturday desk note written for conversations |
| Studio | Briefs / scripts / plans / reply drafts |
| Integrations | Simulated Orion, Nitrogen, Outlook, Edge Tech, morning positions file |

Reset the book from the sidebar if you want the original seed back. State lives in `localStorage`.

Click-through checklist: [VALIDATION.md](./VALIDATION.md). Live meeting can **Listen** with this browser’s own speech recognizer (Chrome/Safari); nothing is sent to a vendor.

## Out of scope (on purpose)

Real data imports, real APIs, a full database schema, the compliance/audit layer, and white-label / multi-tenant. See the Lab workspace at `Maiztro-Lab/domains/fullstack/market-maiztro/`.
