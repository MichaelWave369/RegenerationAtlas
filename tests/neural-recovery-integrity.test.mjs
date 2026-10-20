import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const atlas = JSON.parse(readFileSync(new URL('../src/data/neural-recovery.json', import.meta.url), 'utf8'));
const sourceIds = new Set(atlas.studies.map(s => s.id));
const unique = values => new Set(values).size === values.length;

test('R6: stable curated source IDs, dated primary publications and traceable original links', () => {
  assert.equal(atlas.version, 'R6.0');
  assert.ok(atlas.studies.length >= 3);
  assert.ok(unique(atlas.studies.map(s => s.id)));
  for (const s of atlas.studies) {
    assert.match(s.id, /^NR-\d{3}$/);
    assert.match(s.url, /^https:\/\//);
    assert.match(s.doi, /^10\./);
    assert.ok(s.model.length > 25 && s.observed.length > 60 && s.notShown.length > 70);
    assert.ok(s.context.length > 40 && s.disclosure.length > 40);
    assert.ok(s.provenance.startsWith('PEER_REVIEWED'));
    assert.ok(Array.isArray(s.tags) && s.tags.length > 0);
  }
});

test('R6: human PET study distinguishes binding from cell loss and preserves corrigendum', () => {
  const pet = atlas.studies.find(s => s.id === 'NR-002');
  assert.equal(pet.tier, 'Human observational');
  assert.match(pet.model, /24 adults with long COVID and 24 matched controls/);
  assert.match(pet.notShown, /does not directly count living dopamine neurons/);
  assert.match(pet.notShown, /causation/);
  assert.equal(pet.correction.doi, '10.1016/j.ebiom.2026.106472');
  assert.match(pet.correction.url, /^https:\/\//);
  assert.match(pet.correction.summary, /corrected/);
  assert.match(pet.disclosure, /patent application/i);
});

test('R6: separate cell, postmortem and human observation from human recovery claims', () => {
  const cell = atlas.studies.find(s => s.id === 'NR-001');
  const senolytic = atlas.studies.find(s => s.id === 'NR-003');
  assert.match(cell.notShown, /Parkinson/);
  assert.match(cell.context, /no evidence of human treatment efficacy/);
  assert.match(senolytic.notShown, /do not prove safe senolytic treatments/);
  assert.ok(atlas.states.some(s => s.id === 'lost'));
  const impaired = atlas.states.find(s => s.id === 'impaired');
  assert.match(impaired.boundary, /not a cell count/);
  for (const state of atlas.states) {
    assert.ok(state.readouts.length >= 3);
    assert.ok(state.boundary.length > 50);
  }
});

test('R6: all marker and hypothesis source pointers resolve', () => {
  assert.ok(unique(atlas.states.map(s => s.id)));
  assert.ok(unique(atlas.markers.map(m => m.id)));
  assert.ok(unique(atlas.questions.map(q => q.id)));
  for (const m of atlas.markers) {
    assert.ok(m.meaning.length > 35);
    assert.ok(m.sourceIds.length > 0);
    for (const id of m.sourceIds) assert.ok(sourceIds.has(id), m.id+' orphan '+id);
  }
  for (const q of atlas.questions) {
    assert.equal(q.status, 'UNTESTED_HYPOTHESIS');
    assert.match(q.id, /^NR-Q\d{2}$/);
    assert.ok(q.sourceIds.length > 0);
    for (const id of q.sourceIds) assert.ok(sourceIds.has(id), q.id+' orphan '+id);
    for (const key of ['prediction','falsifier','alternative','evidenceNeeded','boundary']) assert.ok(q[key].length > 65, q.id+' missing '+key);
  }
});

test('R6: curated data does not invent a validated restoration therapy', () => {
  const combined = JSON.stringify(atlas);
  assert.doesNotMatch(combined, /proven human treatment|cures long covid|cures parkinson/i);
  assert.match(combined, /not medical advice/i);
});
