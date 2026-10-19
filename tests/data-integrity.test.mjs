import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../src/data/evidence.json',import.meta.url),'utf8'));
test('unique identifiers and source-linked claims',()=>{
 assert.ok(data.length>=8);
 assert.equal(data.length,new Set(data.map(x=>x.id)).size);
 for(const x of data){
  for(const key of ['title','model','observed','notShown','outcome','safety','doi','source','url','conflict','provenance']) assert.ok(x[key],x.id+': missing '+key);
  assert.ok(x.genes.length>0);
  assert.match(x.url,/^https:\/\//);
 }
});
test('retain negative primary clinical trial result',()=>{
 const trial=data.find(x=>x.id==='RA-005');
 assert.equal(trial.model,'Human clinical trial');
 assert.equal(trial.outcome,'Primary endpoint not met');
 assert.match(trial.observed,/did not produce a statistically significant/i);
});
test('preprints never look peer reviewed',()=>{
 for(const x of data.filter(x=>x.stage==='Preprint')){
  assert.match(x.evidence,/not peer-reviewed/i);
  assert.equal(x.provenance,'PREPRINT_SOURCE_LINKED');
  assert.notEqual(x.model,'Human clinical trial');
 }
});
test('never omit counterclaims or safeguards',()=>{
 for(const x of data){assert.ok(x.notShown.length>35);assert.ok(x.safety.length>25);}
});
