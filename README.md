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

## Running on Vercel

Outside claude.ai the page sends its Claude requests to `api/claude.js`, a Vercel serverless function that calls the Claude API. Saved scenarios are kept in the visitor's browser (localStorage).

1. In the Vercel project, open **Settings → Environment Variables** and add `ANTHROPIC_API_KEY` (from console.anthropic.com).
2. Optionally add `ANTHROPIC_MODEL` to choose a different model (default `claude-sonnet-5-5`).
3. Redeploy.

Note: the endpoint is open to anyone who has the site URL, and every request is billed to your API key. Set a spend limit in the Anthropic Console, and add Vercel password protection if the site is only for your cohort.

Live version: claude.ai artifact "BCF Scenario Studio".
