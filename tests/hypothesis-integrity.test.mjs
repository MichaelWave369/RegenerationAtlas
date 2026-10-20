import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=x=>JSON.parse(readFileSync(new URL('../src/data/'+x,import.meta.url),'utf8'));
const bank=load('hypotheses.json');
const gapRegistry=load('evidence-gaps.json');
const gaps=new Map(gapRegistry.gaps.map(g=>[g.id,g]));
const ids=new Set(bank.hypotheses.map(h=>h.id));
test('R5 hypothesis bank maps one-to-one to all ten R4 gaps',()=>{
 assert.equal(bank.schemaVersion,'5.0.0');
 assert.equal(bank.hypotheses.length,10);
 assert.equal(ids.size,bank.hypotheses.length);
 assert.equal(new Set(bank.hypotheses.map(h=>h.gapId)).size,gaps.size);
 for(const h of bank.hypotheses)assert.ok(gaps.has(h.gapId),h.id+' orphan R4 gap');
});
test('hypotheses are explicitly untested with no validation status',()=>{
 assert.match(bank.scope,/untested interpretations/i);
 assert.deepEqual(bank.allowedLocalProgress,['unreviewed','reading','drafting','needs-review','parked']);
 for(const h of bank.hypotheses){
  assert.equal(h.scientificStatus,'UNTESTED_HYPOTHESIS');
  assert.equal(h.sourceState,'DERIVED_FROM_ATLAS');
  assert.equal(h.isExperimentProtocol,false);
  assert.equal(h.progressDefault,'unreviewed');
 }
});
test('all hypotheses specify support, disconfirmation and alternatives independently',()=>{
 for(const h of bank.hypotheses){
  for(const key of ['statement','prediction','disconfirmation','alternatives','evidenceNeeded','caution'])assert.ok(h[key].length>=65,h.id+': inadequate '+key);
  assert.ok(h.statement.startsWith('If '),h.id+': if-clause missing');
  assert.notEqual(h.prediction,h.disconfirmation);
  assert.ok(h.genes.length>0);
  const gap=gaps.get(h.gapId);
  assert.equal(h.tissue,gap.tissue);
 }
});
test('preprint-derived human retinal hypothesis cannot imply clinical restoration',()=>{
 const retinal=bank.hypotheses.find(x=>x.id==='HYP-004');
 assert.equal(retinal.gapId,'GAP-004');
 assert.match(retinal.caution,/preprint/i);
 assert.match(retinal.disconfirmation,/functional|integrat|mature/i);
});
test('Nogo-A hypothesis cannot reclassify negative trial as positive',()=>{
 const trial=bank.hypotheses.find(x=>x.gapId==='GAP-008');
 assert.match(trial.caution,/overall primary endpoint was not met/i);
 assert.match(trial.evidenceNeeded,/prospective|confirmatory/i);
});
test('PROX1, PTEN and human genetics have preserved safety boundaries',()=>{
 assert.match(bank.hypotheses.find(x=>x.gapId==='GAP-001').caution,/not proof of clinical efficacy/i);
 assert.match(bank.hypotheses.find(x=>x.gapId==='GAP-003').caution,/tumor suppressor/i);
 assert.match(bank.hypotheses.find(x=>x.gapId==='GAP-010').caution,/genetic case is not/i);
});
test('R5 marks personal progress as workflow only, not as a research conclusion',()=>{
 assert.ok(!bank.allowedLocalProgress.some(x=>/validated|confirmed|clinical-success|experiment-passed|approved/i.test(x)));
 assert.ok(bank.hypotheses.every(h=>h.progressDefault==='unreviewed'));
});
test('no actionable wet-lab recipes or clinical dosages are included',()=>{
 for(const h of bank.hypotheses){
  assert.doesNotMatch([h.statement,h.prediction,h.disconfirmation,h.evidenceNeeded,h.caution].join(' '),/\b(?:mg\/kg|µg\/mL|intravenous dose|injection schedule|CRISPR guide RNA sequence)\b/i);
 }
});
