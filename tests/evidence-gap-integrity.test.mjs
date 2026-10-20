import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=(file)=>JSON.parse(readFileSync(new URL('../src/data/'+file,import.meta.url),'utf8'));
const gaps=load('evidence-gaps.json');
const ledger=load('evidence.json');
const network=load('interactions.json');
const species=load('comparative-regeneration.json');
const orthology=load('gene-conservation.json');
const ids={
 R0:new Set(ledger.map(x=>x.id)),
 R1:new Set(network.edges.map(x=>x.id)),
 R2:new Set(species.cases.map(x=>x.id)),
 R3:new Set(orthology.families.map(x=>x.id))
};
const stages=['gene','mechanism','functional','human'];
const labels=['documented','partial','not-profiled'];
const get=(id)=>gaps.gaps.find(x=>x.id===id);
test('gap registry has unique IDs, precise open-in-atlas scope, and no global novelty claims',()=>{
 assert.equal(gaps.gaps.length,10);
 assert.equal(new Set(gaps.gaps.map(x=>x.id)).size,gaps.gaps.length);
 assert.deepEqual(gaps.stages.map(x=>x.key),stages);
 assert.match(gaps.scope,/not an exhaustive literature review/i);
 assert.ok(gaps.gaps.every(x=>x.status==='OPEN_IN_ATLAS'));
});
test('every checkpoint maps to existing R0–R3 evidence',()=>{
 const seen=new Set();
 for(const gap of gaps.gaps){
  assert.deepEqual(gap.checkpoints.map(c=>c.key),stages,gap.id);
  assert.ok(gap.question.length>50&&gap.whyOpen.length>60&&gap.caveat.length>65&&gap.studyDesign.length>65,gap.id);
  assert.ok(gap.genes.length>0);
  for(const c of gap.checkpoints){
   assert.ok(labels.includes(c.status),gap.id+' invalid checkpoint status');
   assert.ok(c.explanation.length>65,gap.id+' missing evidence explanation');
   assert.ok(c.refs.length>0,gap.id+' unlinked checkpoint');
   for(const ref of c.refs){
    seen.add(ref.kind);
    assert.ok(ids[ref.kind],gap.id+' invalid layer '+ref.kind);
    assert.ok(ids[ref.kind].has(ref.id),gap.id+' orphan evidence '+ref.id);
    if(ref.kind==='R3'){
     const family=orthology.families.find(f=>f.id===ref.id);
     assert.ok(ref.species,gap.id+' gene record missing species');
     assert.ok(family.cells.some(cell=>cell.species===ref.species),gap.id+' uncurated species reference');
    }
   }
  }
 }
 assert.deepEqual([...seen].sort(),['R0','R1','R2','R3']);
});
test('negative human clinical primary endpoint is retained as evidence, never successful cure',()=>{
 const trial=get('GAP-008');
 const clinical=trial.checkpoints.find(x=>x.key==='human');
 assert.equal(clinical.status,'documented');
 assert.match(clinical.explanation,/not met/i);
 assert.ok(clinical.refs.some(r=>r.id==='RA-005'));
 assert.equal(ledger.find(x=>x.id==='RA-005').outcome,'Primary endpoint not met');
});
test('human retinal ex-vivo preprint is provisional rather than clinical efficacy',()=>{
 const preprint=get('GAP-004');
 assert.equal(preprint.checkpoints.find(x=>x.key==='mechanism').status,'partial');
 assert.equal(preprint.checkpoints.find(x=>x.key==='human').status,'not-profiled');
 assert.ok(preprint.checkpoints.some(c=>c.refs.some(r=>r.id==='RA-008')));
 assert.equal(ledger.find(x=>x.id==='RA-008').stage,'Preprint');
});
test('mouse PROX1 and mouse ASCL1 are not claimed as human therapy',()=>{
 for(const id of ['GAP-001','GAP-002']){
  assert.equal(get(id).checkpoints.find(x=>x.key==='human').status,'not-profiled');
 }
 assert.match(get('GAP-001').caveat,/do not treat human PROX1 localization as proof/i);
 assert.match(get('GAP-002').caveat,/ascl1b/i);
});
test('cross-tissue and age-dependent questions preserve experimental boundaries',()=>{
 assert.match(get('GAP-005').caveat,/different tissues/i);
 assert.match(get('GAP-006').caveat,/neonatal/i);
 assert.match(get('GAP-009').caveat,/small historical human case series/i);
 assert.ok(get('GAP-005').checkpoints.some(c=>c.refs.some(r=>r.kind==='R3'&&r.id==='PRRX1'&&r.species==='Axolotl')));
});
test('human genetics is not reinterpreted as muscle-regeneration therapy',()=>{
 const muscle=get('GAP-010');
 assert.equal(muscle.checkpoints.find(x=>x.key==='human').status,'not-profiled');
 assert.match(muscle.caveat,/not be misrepresented as an intervention/i);
 assert.ok(muscle.checkpoints.some(c=>c.refs.some(r=>r.id==='RA-007')));
});
test('all linked source records expose at least one trusted primary or curated source URL',()=>{
 for(const gap of gaps.gaps)for(const point of gap.checkpoints)for(const ref of point.refs){
  let urls=[];
  if(ref.kind==='R0')urls=[ledger.find(x=>x.id===ref.id).url];
  if(ref.kind==='R1')urls=network.edges.find(x=>x.id===ref.id).sourceRecordIds.map(id=>ledger.find(x=>x.id===id).url);
  if(ref.kind==='R2')urls=species.cases.find(x=>x.id===ref.id).sources.map(x=>x.url);
  if(ref.kind==='R3'){
   const cell=orthology.families.find(f=>f.id===ref.id).cells.find(c=>c.species===ref.species);
   urls=[...cell.orthologySources,...cell.functionSources].map(x=>x.url);
  }
  assert.ok(urls.length>0,gap.id+' evidence has no public source '+ref.kind+':'+ref.id);
  for(const url of urls)assert.match(url,/^https:\/\//);
 }
});
