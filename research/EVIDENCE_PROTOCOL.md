# Evidence Protocol · Regeneration Atlas

## Mission
Map experimentally reported biological mechanisms associated with tissue repair, without converting observations into medical claims.

## Required fields
Each record must provide a stable identifier, genes/proteins, tissue, specific experimental model, review stage, observed result, limits of the conclusion (Not shown), clinical status, source title, resolvable DOI/URL, potential conflicts, and a provenance tag.

## Provenance tags
- `SOURCE_LINKED`: a source publication is linked, but neither independent replication nor reproducibility is implied.
- `PREPRINT_SOURCE_LINKED`: a publicly available manuscript that has not necessarily completed peer review.
- `HYPOTHESIS`: a proposed connection, never presented as experimentally confirmed.
- `UNKNOWN`: uncertain origin; exclude from claims of established evidence.

## Rules
1. Do not infer human clinical results from mouse experiments or cultures of human donor tissue.
2. Differentiate histological markers, cell division, neuron identity, anatomical connections, physiology, and restored patient function.
3. Keep negative or nonsignificant primary endpoints explicit. Exploratory subgroup analyses cannot replace primary results.
4. Include essential protective protein functions (such as PTEN tumor suppression) and tissue- and time-dependence.
5. A DOI confirms the publication identifier, not that the experiment was independently reproduced.
6. Give preprints a visible label and cite version and date where possible.
7. Document financial and intellectual-property disclosures; avoid unsupported allegations.
8. No dosage, experimental treatment advice, or self-experimentation guides.

## Proposed interaction-mapping standard
Edges require: `sourceRecordId`, `fromGene`, `toGene`, `tissue`, `speciesOrModel`, `relation`, `direction`, and `certainty`. A cross-paper or cross-tissue link must be marked `HYPOTHESIS` unless directly demonstrated.

## Contribution checklist
- [ ] Primary paper linked
- [ ] Claim faithfully paraphrased
- [ ] Study model distinguished
- [ ] Negative results captured
- [ ] Limits explicitly stated
- [ ] Safety/protective role described
- [ ] Conflict note included
- [ ] Data tests passing

**Not medical advice.** This is a research communication tool, not a medical device or therapy.


## Interaction map (R1)

`src/data/interactions.json` has node and directed-edge records. The map is an editorial navigation aid and **not** a comprehensive interactome or mechanistic simulation. Every edge requires:

- `from` and `to` node identifiers that exist; all must belong to the edge tissue lane.
- An `id`, relationship label, model, supporting ledger record IDs, observation and caveat.
- One provenance class: `SOURCE_REPORTED`, `PREPRINT_REPORTED`, or `HYPOTHESIS`.
- Explicit distinction between *regulatory pathway relationships* and *physical protein binding*.

An arrow does not imply direct molecular contact or clinical success. When a source establishes a human loss-of-function association rather than a controlled trial, say so explicitly.

**Combination rule:** Comparisons across independent experiments may motivate hypotheses but must never be presented as a tested combination, synergistic effect, or demonstrated pairwise protein interaction. For this reason, the PROX1 + ASCL1 combination is represented as a separate **untested strategy node**, with distinct hypothesis links.

Default view shows only peer-reviewed source-reported relations. Preprints and hypotheses require conscious opt-in. Negative clinical results continue to live in the evidence ledger even if they have no supported mechanistic edge.

Run `npm test` before submitting an interaction edit; IDs and research-record references are validated automatically.

## Comparative regeneration laboratory (R2)

`src/data/comparative-regeneration.json` contains 12 curated evidence-case summaries across four species and four tissue categories. This is a **sparse** comparison grid. An empty matrix cell means **not yet profiled**, never that the species cannot regenerate that tissue.

For every displayed case preserve:

- Exact `species` and `tissue` identifiers, distinct `id` and `category`.
- Injury condition and developmental stage. For example, neonatal mouse heart repair must not be generalized to adult mouse heart.
- Evidence type: primary animal, primary human tissue, clinical case series, or synthesis/review. No unreviewed claim silently promoted.
- One observed outcome (`repair`), an explicit `boundary`, functional-status language, origin (natural/induced/limited), and linked sources.
- Mechanism keywords are **search/navigation cues**, not cross-species proof of a shared intervention.

Categories (descriptive, not numeric or ranked): `endogenous`, `induced`, `restricted`, `renewal`, `limited`, and `not-established`. They summarize **different phenomena**, so they cannot be ordered into a regeneration score.

A comparison between zebrafish retinal neuron replacement and human adult retinal gliosis, for instance, illustrates research gaps, **not** that transferring one factor will restore vision.

Document missing context and clinical negative evidence. Do not offer treatment, dosage, or injury management advice.
