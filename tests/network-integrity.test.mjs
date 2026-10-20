import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const graph=JSON.parse(readFileSync(new URL('../src/data/interactions.json',import.meta.url),'utf8'));
const ledger=JSON.parse(readFileSync(new URL('../src/data/evidence.json',import.meta.url),'utf8'));
const recordById=new Map(ledger.map(record=>[record.id,record]));
const nodeById=new Map(graph.nodes.map(node=>[node.id,node]));
const allowable=new Set(['SOURCE_REPORTED','PREPRINT_REPORTED','HYPOTHESIS']);
test('graph edges are unique, directed and never orphaned',()=>{
 assert.ok(graph.edges.length>=10);
 assert.equal(new Set(graph.edges.map(e=>e.id)).size,graph.edges.length);
 assert.equal(nodeById.size,graph.nodes.length);
 for(const e of graph.edges){
  assert.ok(nodeById.has(e.from),e.id+' invalid from');
  assert.ok(nodeById.has(e.to),e.id+' invalid to');
  assert.notEqual(e.from,e.to,e.id+' self loop');
  assert.equal(nodeById.get(e.from).tissue,e.tissue);
  assert.equal(nodeById.get(e.to).tissue,e.tissue);
  assert.ok(allowable.has(e.classification));
  assert.ok(e.sourceRecordIds.length>0);
  for(const id of e.sourceRecordIds) assert.ok(recordById.has(id),e.id+' invalid evidence record '+id);
  for(const field of ['relation','model','finding','limit']) assert.ok((e[field]||'').length>15,e.id+' incomplete '+field);
 }
});
test('every speculative edge is explicit and never disguised as peer reviewed',()=>{
 const hypotheses=graph.edges.filter(e=>e.classification==='HYPOTHESIS');
 assert.ok(hypotheses.length>=2);
 for(const e of hypotheses){assert.match(e.relation+' '+e.finding+' '+e.limit,/untested|not|no|hypothes/i);}
 const maybe=graph.nodes.find(n=>n.id==='DUAL_RETINA');
 assert.equal(maybe.kind,'hypothesis');
});
test('preprint findings are not promoted to validated clinical studies',()=>{
 const preprints=graph.edges.filter(e=>e.classification==='PREPRINT_REPORTED');
 assert.ok(preprints.length>=1);
 for(const edge of preprints){
  assert.match(edge.model,/preprint/i);
  for(const id of edge.sourceRecordIds)assert.equal(recordById.get(id).stage,'Preprint');
  assert.doesNotMatch(edge.finding,/restor(ed|es) (human )?vision/i);
 }
});
test('different gene pathways are not mislabeled as direct physical binding',()=>{
 for(const edge of graph.edges){
  assert.ok(!/direct binding|direct protein.protein interaction/i.test(edge.relation),edge.id);
 }
 const joint=graph.edges.filter(e=>['PTEN','SOCS3'].includes(e.from));
 assert.equal(joint.length,2);
 assert.ok(joint.every(e=>e.sourceRecordIds.includes('RA-004')));
});
