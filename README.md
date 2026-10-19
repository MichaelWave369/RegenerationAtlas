# Regeneration Atlas · R0.1

**Evidence before excitement.** An original, MIT-licensed, browser-based research atlas of proteins and pathways connected to tissue repair, cell-state reprogramming, and regeneration.

## Features

- Eight primary-source-linked research records spanning retina, optic nerve, spinal cord, skin, and muscle.
- Search by gene, result or study; filter by tissue, model and outcome.
- Explicit **Observed / Not shown** labels to prevent a mouse or cell-culture result from being presented as a human treatment.
- Preserved negative human clinical trial result (anti-Nogo-A).
- Machine-readable JSON, automated evidence tests, and mobile-friendly React interface.
- No backend, accounts, advertisements, trackers, or clinical recommendations.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm test
npm run build
npm run dev
```

## Deploy to GitHub Pages

Merge the pull request. Under **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. The included workflow tests, builds, and deploys on pushes to main. The Vite base path is set dynamically for project Pages URLs.

The first workflow run is the source of truth for build and deploy success. Initial authored data integrity tests passed locally, but the full npm build was not available in the authoring environment.

## Contributing

Read [research/EVIDENCE_PROTOCOL.md](research/EVIDENCE_PROTOCOL.md). Only record what the cited source shows. Record species/model, negative results, safety boundaries, and potential conflicts. Do not imply an unproven cure.

## License

Original source code and claim summaries: [MIT](LICENSE). Linked research articles retain their respective copyright and terms.

**Not medical advice.** Research mapping is not a recommendation to alter gene activity or pursue experimental interventions.
