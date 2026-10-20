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

## Gene conservation and orthology (R3)

The `src/data/gene-conservation.json` file is a curated **literature and model-organism-database snapshot**, not a complete genomics pipeline or protein sequence-alignment tool.

Separate independent kinds of evidence:

1. **Gene orthology / relationship:** source-link authoritative comparative gene annotation, distinguish fish gene duplicates (co-orthologs) from human singletons, and record ambiguity instead of inferring a one-to-one mapping.
2. **Reported function:** document organism, developmental stage, injury/culture conditions, and the specific intervention or observation.
3. **Tissue regeneration outcome:** explicitly differentiate loss of function, gain of function, expression/lineage marking, ex vivo cultures, and functional recovery.
4. **Clinical translation:** no mouse, fish, or fetal-human culture result establishes an approved human treatment.

A marker such as axolotl Prrx1 expression in a blastema is not proof that removing that gene blocks limb regrowth. Zebrafish prrx1b heart effects must not be generalized to prrx1a. Zebrafish prox1a gene orthology does not establish the mouse PROX1 intercellular-transfer mechanism.

**Missing axolotl mappings:** `NOT_CURATED` / `not-curated` / empty symbols means no record has been verified in this atlas. Do not interpret that as gene absence. Do not rank species or assign sequence identity values without a validated reference sequence, alignment method, and release versions.

Review upstream taxonomy/annotation releases before adding new mappings and capture the source, date, inference type, and uncertainties in every record. Functional labels in R3 indicate only that a particular study exists, not independent replication or therapeutic value.

## Evidence gap explorer (R4)

`src/data/evidence-gaps.json` uses four named evidence checkpoints: `gene`, `mechanism`, `functional`, and `human`. Every checkpoint has a `status` in `documented`, `partial`, or `not-profiled`, a claim-specific explanation, and at least one evidence pointer back to earlier R0–R3 records.

The registry is an **editorial map of gaps in this atlas**. It is NOT a systematic literature review, an assertion that no scientific group has examined a question, a ranked target list, or a treatment-development program.

A linked evidence pointer is `{ kind: "R0" | "R1" | "R2" | "R3", id: "..." }` with `species` also required on R3 family references. R0 resolves to a foundation paper, R1 to an interaction whose source IDs must resolve to R0, R2 to case-study publications, and R3 to separately cited orthology and functional work. No ungrounded or invented references may be added.

**Status semantics:**
- `documented`: the curated evidence reports a result, **including a null or negative clinical endpoint**. This does not imply reproducibility or clinical success.
- `partial`: limited, indirect, preliminary, or context-bound data are curated. Human donor tissues and preprints do not qualify as proven in-vivo human repair.
- `not-profiled`: the requested endpoint is not established in the curated material. Never translate this to 'scientifically impossible' or 'nobody has tested this anywhere'.

Each record requires a specific, falsifiable-ish research question, a clear reason for classification, a safety/context caveat, and suggested **kinds of evidence** rather than operative protocols. Reconcile all references after upstream data changes, review DOI/source validity, retain negative results, and run the tests.

Source links in downloaded Markdown briefs refer to upstream publications and databases. Generated briefs are **questions for literature review**, not novel clinical claims, safe DIY experiments, or regulator-approved interventions.
