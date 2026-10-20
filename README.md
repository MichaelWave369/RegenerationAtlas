# Regeneration Atlas · R2.0

**Evidence before excitement.** An original, MIT-licensed, browser-based research atlas of proteins and pathways connected to tissue repair, cell-state reprogramming, and regeneration.

## R1: Molecular interaction map

- New tissue-lane network map with selected-node inspector, original source links, evidence flags, and JSON export.
- Peer-reviewed claims appear by default; opt in to preliminary preprints or cross-paper hypotheses.
- Candidate combined PROX1/ASCL1 retinal strategy is prominently labeled **untested**, not a demonstrated biochemical edge.
- Source relationships do not imply direct protein binding or safe clinical treatment.

## R2: Comparative regeneration laboratory

- An interactive cross-species matrix comparing 4 species across 4 tissue categories. **Twelve documented cases**, each with context, study model, mechanism, boundaries and primary literature / review links.
- Click a cell to inspect one study summary and compare with a second independently selected case.
- Species and tissue comparisons preserve **adult vs neonatal**, **induced vs spontaneous**, **clinical case vs animal model**, and **cell renewal vs complex regeneration** distinctions.
- Empty cells mean **not profiled**, never absence of biological capacity. Zebrafish fins are not treated as homologous human limbs.
- No regeneration ranking, species score, or unsupported cross-species transfer claim.
- New tests validate all unique species–tissue cases, cited sources, age/injury conditions, and honest clinical limitations.

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
