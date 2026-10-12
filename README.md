# BCF Scenario Studio

A teaching workbench for the Mindful AI Practitioner (MAP) Certificate. Students describe something they want to do with AI in their contemplative teaching; the studio places it in one of the three zones of the Bounded Convergence Framework (inner periphery, boundary zone, outer periphery), names the conditions it triggers, and then reviews a drafted artifact against that zone.

Framework source: Haberlin, S. *Governing AI at the clinical threshold: a grounded theory framework for responsible AI deployment in mindfulness-based mental health.* AI & Society. https://doi.org/10.1007/s00146-026-03341-x

## Files

- `index.html` — the whole app: markup, styles and script in one file.

## Runtime dependency

The page was built as a Claude artifact and uses the artifact runtime (`window.claude`) for three things:

| Capability | Used for |
|---|---|
| `sample` | Placing a scenario in a zone (JSON) and writing the draft review |
| `db` | Saving scenarios to the user's portfolio |
| `user` | Scoping the portfolio to the signed-in viewer |

Opened outside claude.ai (for example via GitHub Pages or a local file), the page loads and shows the framework reference, but it displays a banner saying it can't reach Claude, and the reading and review steps won't run. Portfolio saves fall back to "this visit only." Running it standalone would mean replacing `state.sample` with calls to the Claude API (through a small backend that holds the API key) and swapping `db` for another store.

Live version: claude.ai artifact "BCF Scenario Studio".
