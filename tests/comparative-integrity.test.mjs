import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const lab=JSON.parse(readFileSync(new URL('../src/data/comparative-regeneration.json',import.meta.url),'utf8'));
const cases=lab.cases;
const classes=new Set(['endogenous','induced','restricted','renewal','limited','not-established']);
const pairs=cases.map(c=>c.species+'|'+c.tissue);
test('taxonomy is bounded and evidence cells are unique',()=>{
 assert.deepEqual(lab.species,['Zebrafish','Axolotl','Mouse','Human']);
 assert.deepEqual(lab.tissues,['Retina','Heart','Spinal cord','Limb / digit']);
 assert.equal(cases.length,12);
 assert.equal(new Set(pairs).size,cases.length);
 assert.equal(new Set(cases.map(c=>c.id)).size,cases.length);
 for(const c of cases){assert.ok(lab.species.includes(c.species));assert.ok(lab.tissues.includes(c.tissue));assert.ok(classes.has(c.category));}
});
test('each study has source, setting, boundary, and study type',()=>{
 for(const c of cases){
  for(const key of ['context','studyType','developmentalStage','origin','functional','clinical']) assert.ok(c[key]?.length>7,c.id+' missing '+key);
  assert.ok(c.repair.length>75,c.id+' missing observation');
  assert.ok(c.boundary.length>75,c.id+' missing counterclaim');
  assert.ok(c.mechanisms.length>=2,c.id+' missing research themes');
  assert.ok(c.sources.length>0,c.id+' missing source');
  for(const source of c.sources){
   assert.match(source.url,/^https:\/\//,c.id+' invalid URL');
   assert.ok(source.title.length>15,c.id+' source title missing');
   assert.ok(source.kind.length>3,c.id+' source type missing');
  }
 }
});
test('human retina and cardiac renewal are not overclaimed as treatment',()=>{
 const retina=cases.find(c=>c.species==='Human'&&c.tissue==='Retina');
 const heart=cases.find(c=>c.species==='Human'&&c.tissue==='Heart');
 assert.equal(retina.category,'not-established');
 assert.match(retina.boundary,/not treatments/i);
 assert.equal(heart.category,'renewal');
 assert.match(heart.boundary,/not be described as replacement/i);
});
test('neonatal mouse heart is not misidentified as adult',()=>{
 const heart=cases.find(c=>c.species==='Mouse'&&c.tissue==='Heart');
 assert.equal(heart.category,'restricted');
 assert.match(heart.developmentalStage,/Neonatal/);
 assert.match(heart.boundary,/adult mice/i);
});
test('comparable tissues preserve limb vs digit boundaries',()=>{
 assert.ok(!pairs.includes('Zebrafish|Limb / digit'),'fish fins are not mammalian digits');
 const ax=cases.find(c=>c.species==='Axolotl'&&c.tissue==='Limb / digit');
 const human=cases.find(c=>c.species==='Human'&&c.tissue==='Limb / digit');
 assert.equal(ax.category,'endogenous');
 assert.equal(human.category,'restricted');
 assert.match(human.boundary,/does not establish human limb regeneration/);
});
test('clinical anti-Nogo-A null primary result is not hidden',()=>{
 const spinal=cases.find(c=>c.species==='Human'&&c.tissue==='Spinal cord');
 assert.match(spinal.boundary,/did not meet its overall primary endpoint/);
 assert.ok(spinal.sources.some(s=>s.doi==='10.1016/S1474-4422(24)00447-2'));
});
