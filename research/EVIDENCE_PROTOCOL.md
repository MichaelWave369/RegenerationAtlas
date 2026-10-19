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
