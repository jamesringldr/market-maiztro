# Validation

Desk date is locked to **Saturday, 15 August 2026**. Run `npm run dev` and do these as a user.

## Click-through

1. **Launch pad** `/` — four meetings, unseen comms, pending trades, gone-quiet list all link.
2. **Comms** `/comms` — click **Seen** on Eleanor; stay on the page. Then click the row; land on her member file.
3. **Touchpoints** `/touchpoints` — click **Done** on a due item; stay on the planner.
4. **Trades** `/trades` — approve `BIL` / Voss; open `/members/m-voss` and see the fill. Load extra demo CSV. Assign an unmatched row, then approve.
5. **Live meeting** `/meetings/mt-smith/live` — Start tape; “bank line” should surface a cash-management upsell. Generate both recaps — internal quotes the tape, member version is a letter. **Listen** (Chromium/Safari) appends a Room line. Pause still works.
6. **Knowledge** `/knowledge` — landmines / missing / family are first-class. Search `divorce` hits Voss.
7. **Integrations** `/integrations` — every tile has a simulate action that changes desk state.
8. **Studio / Smith** `/prospects/p-smith` — 30-day plan names his file (brother, cash, Whitaker), not a generic cadence.
9. Sidebar **Reset demo data** restores the seed.
10. `npm run build` passes.

## What this pass is fixing (post-demo review)

- Nested action buttons were fighting parent-row navigation.
- “Live STT” was only a teleprompter — add browser Web Speech next to the tape.
- Recaps and plans were boilerplate — they should quote the tape / the file.
- Knowledge was a search box; hub tiles only pulsed email/phone; unmatched trades could not be assigned; member 360 hid the fill you just approved.
