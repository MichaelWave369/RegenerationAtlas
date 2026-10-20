import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const atlas=JSON.parse(readFileSync(new URL('../src/data/gene-conservation.json',import.meta.url),'utf8'));
const all=atlas.families.flatMap(f=>f.cells.map(c=>({gene:f.id,...c})));
const functional=new Set(['DIRECT_INJURY_EXPERIMENT','FUNCTION_OTHER_CONTEXT','TISSUE_OBSERVATION','CULTURE_EXPERIMENT','IDENTITY_ONLY','NOT_CURATED']);
test('unique reference gene families and four species per family',()=>{
 assert.equal(atlas.families.length,5);
 assert.deepEqual(atlas.species,['Human','Mouse','Zebrafish','Axolotl']);
 assert.equal(new Set(atlas.families.map(f=>f.id)).size,5);
 for(const f of atlas.families){
  assert.equal(f.cells.length,4);
  assert.deepEqual(f.cells.map(c=>c.species),atlas.species);
  assert.ok(f.safety.length>40&&f.question.length>35);
 }
});
test('gene orthology is separately documented from functional experiments',()=>{
 for(const entry of all){
  assert.ok(functional.has(entry.functionalClass),entry.gene);
  assert.ok(entry.boundary.length>45,entry.gene+' '+entry.species);
  assert.ok(entry.finding.length>22,entry.gene+' '+entry.species);
  assert.ok(entry.orthologyNote.length>35,entry.gene+' '+entry.species);
  if(entry.functionalClass==='NOT_CURATED'){
   assert.deepEqual(entry.symbols,[]);
   assert.equal(entry.relationship,'not-curated');
   assert.deepEqual(entry.functionSources,[]);
   assert.deepEqual(entry.orthologySources,[]);
  }else{
   assert.ok(entry.symbols.length>=1);
   assert.ok(entry.orthologySources.length>=1);
  }
  if(entry.functionalClass==='DIRECT_INJURY_EXPERIMENT'||entry.functionalClass==='CULTURE_EXPERIMENT'||entry.functionalClass==='TISSUE_OBSERVATION'||entry.functionalClass==='FUNCTION_OTHER_CONTEXT')assert.ok(entry.functionSources.length>=1,entry.gene+' '+entry.species+' missing experimental citation');
  for(const src of [...entry.orthologySources,...entry.functionSources]){
   assert.match(src.url,/^https:\/\//);
   assert.ok(src.title.length>8);
  }
 }
});
test('teleost duplicates remain explicitly distinct',()=>{
 for(const g of ['ASCL1','PTEN','PRRX1']){
  const z=all.find(e=>e.gene===g&&e.species==='Zebrafish');
  assert.equal(z.relationship,'one-to-many',g);
  assert.equal(z.symbols.length,2,g);
 }
 const prox=all.find(e=>e.gene==='PROX1'&&e.species==='Zebrafish');
 assert.deepEqual(prox.symbols,['prox1a']);
 assert.equal(prox.functionalClass,'IDENTITY_ONLY');
});
test('the PROX1 mouse injury mechanism is not assigned to zebrafish',()=>{
 const z=all.find(e=>e.gene==='PROX1'&&e.species==='Zebrafish');
 const m=all.find(e=>e.gene==='PROX1'&&e.species==='Mouse');
 assert.equal(m.functionalClass,'DIRECT_INJURY_EXPERIMENT');
 assert.equal(z.functionalClass,'IDENTITY_ONLY');
 assert.match(z.boundary,/no cited zebrafish experiment|no cited.*experiment/i);
});
test('axolotl is conservatively curated and no absence is asserted',()=>{
 const ax=all.filter(x=>x.species==='Axolotl');
 assert.equal(ax.length,5);
 assert.equal(ax.filter(x=>x.functionalClass==='NOT_CURATED').length,4);
 const prrx=ax.find(x=>x.gene==='PRRX1');
 assert.deepEqual(prrx.symbols,['Prrx1']);
 assert.equal(prrx.functionalClass,'TISSUE_OBSERVATION');
 assert.match(prrx.boundary,/do not by themselves demonstrate/i);
});
test('function and clinical claims have distinct boundaries',()=>{
 const ascl1=all.find(e=>e.gene==='ASCL1'&&e.species==='Zebrafish');
 assert.match(ascl1.finding,/ascl1a/i);
 assert.match(ascl1.boundary,/ascl1b/i);
 const pten=all.find(e=>e.gene==='PTEN'&&e.species==='Human');
 assert.match(pten.boundary,/tumor/i);
 const human=all.filter(x=>x.species==='Human');
 assert.ok(human.every(x=>x.functionalClass!=='DIRECT_INJURY_EXPERIMENT'));
 const prrx=human.find(x=>x.gene==='PRRX1');
 assert.equal(prrx.functionalClass,'CULTURE_EXPERIMENT');
 assert.match(prrx.boundary,/not establish regeneration/i);
});
