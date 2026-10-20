import { useMemo, useState } from 'react';
import atlas from './data/gene-conservation.json';
import './gene-conservation.css';

type Family = (typeof atlas.families)[number];
type Cell = Family['cells'][number];
type RefItem = Cell['orthologySources'][number];

const species=atlas.species;
const map=new Map(atlas.families.map(f=>[f.id,f]));
const functionalLabels:Record<string,string>={
 DIRECT_INJURY_EXPERIMENT:'Direct injury experiment',
 FUNCTION_OTHER_CONTEXT:'Function outside matched injury',
 TISSUE_OBSERVATION:'Tissue / lineage observation',
 CULTURE_EXPERIMENT:'Human cell-culture experiment',
 IDENTITY_ONLY:'Gene identity only',
 NOT_CURATED:'Not curated'
};
const relationLabels:Record<string,string>={
 'one-to-one':'Orthologous gene',
 'one-to-many':'Duplicated fish orthologs',
 'one-to-one-curated-name':'Curated gene name / family',
 'curated-family-member':'Curated family member',
 'not-curated':'Not curated'
};
const cellFor=(family:Family,s:string)=>family.cells.find(c=>c.species===s);
function Urls({items}:{items:RefItem[]}){
 return <div className="conservation-sources">{items.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
 <strong>{source.title}</strong><span>{source.role} ↗</span></a>)}</div>;
}
function CellDetails({family,cell,label}:{family:Family,cell:Cell,label:string}){
 const missing=cell.functionalClass==='NOT_CURATED';
 return <article className={'conservation-inspect'+(missing?' uncurated':'')}>
   <div className="conservation-inspect-heading"><span>{label} · {cell.species}</span><span className={'conservation-function '+cell.functionalClass.toLowerCase()}>{functionalLabels[cell.functionalClass]}</span></div>
   <h4>{missing?'Not curated':cell.symbols.join(' / ')}</h4>
   <p className="conservation-topic">{family.displayName}</p>
   <section className="conservation-attribute"><strong>Gene relationship</strong><span>{relationLabels[cell.relationship]??cell.relationship}</span></section>
   <p className="conservation-orthologynote">{cell.orthologyNote}</p>
   {cell.orthologySources.length>0&&<><div className="conservation-smallheading">GENE / ORTHOLOGY RECORDS</div><Urls items={cell.orthologySources}/></>}
   <div className="conservation-tissue"><span>Experimental context</span><strong>{cell.context}</strong></div>
   <section className="conservation-finding"><strong>What is actually observed?</strong><p>{cell.finding}</p></section>
   <section className="conservation-boundary"><strong>What this does NOT prove</strong><p>{cell.boundary}</p></section>
   {cell.functionSources.length>0&&<><div className="conservation-smallheading">STUDY / FUNCTION RECORDS</div><Urls items={cell.functionSources}/></>}
 </article>;
}
function download(){
 const url=URL.createObjectURL(new Blob([JSON.stringify(atlas,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='regeneration-atlas-gene-conservation-r3.json';a.click();
 window.setTimeout(()=>URL.revokeObjectURL(url),750);
}
export default function GeneConservation({onOpenNetwork,onOpenSpecies}:{onOpenNetwork:()=>void,onOpenSpecies:()=>void}){
 const [gene,setGene]=useState('ASCL1');
 const [search,setSearch]=useState('');
 const [left,setLeft]=useState('Zebrafish');
 const [right,setRight]=useState('Human');
 const [onlyExperimental,setOnlyExperimental]=useState(false);
 const family=map.get(gene)??atlas.families[0];
 const filtered=useMemo(()=>{
  const term=search.toLowerCase().trim();
  return atlas.families.filter(f=>(!term||[f.humanSymbol,f.displayName,f.category,f.tissueFocus,...f.cells.flatMap(c=>[c.species,...c.symbols,c.finding,c.context])].join(' ').toLowerCase().includes(term))&&(!onlyExperimental||f.cells.some(c=>c.functionalClass==='DIRECT_INJURY_EXPERIMENT')));
 },[search,onlyExperimental]);
 const observed=atlas.families.flatMap(f=>f.cells);
 const duplicateCount=observed.filter(c=>c.relationship==='one-to-many').length;
 const humanClinicalTrials=0;
 const a=cellFor(family,left),b=cellFor(family,right);
 return <div className="conservation-lab">
  <div className="conservation-banner">
   <div><span className="conservation-overline">R3 / EVOLUTIONARY EVIDENCE EXPLORER</span><h3>Gene conservation is not functional equivalence.</h3>
    <p>Compare homologous gene names, fish duplicates, injury experiments and tissue observations. <strong>Orthology describes evolutionary relationships; it does not demonstrate regeneration, conserved function in every tissue or clinical efficacy.</strong></p></div>
   <button className="conservation-export" onClick={download}>Export source ledger ↓</button>
  </div>
  <div className="conservation-metrics">
   <div><strong>{atlas.families.length}</strong><span>Curated gene families</span></div>
   <div><strong>{observed.length}</strong><span>Species × gene records</span></div>
   <div><strong>{duplicateCount}</strong><span>Fish duplicate mappings</span></div>
   <div><strong>{humanClinicalTrials}</strong><span>Proven human therapies here</span></div>
  </div>
  <div className="conservation-note"><strong>How to read this atlas:</strong> a gene can be present without a documented regeneration role; a protein can affect an injury response without restoring tissue function. “Not curated” means a record is missing from our atlas, <em>not</em> from the animal's genome.</div>
  <div className="conservation-toolbar">
   <label><span>SEARCH GENE FAMILIES</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="PROX1, retina, ptena, blastema…"/></label>
   <label className="conservation-checkbox"><input type="checkbox" checked={onlyExperimental} onChange={e=>setOnlyExperimental(e.target.checked)}/> <span>Families with direct injury experiments</span></label>
  </div>
  <div className="conservation-matrix-scroll" tabIndex={0} aria-label="Scrollable curated gene conservation matrix">
   <table className="conservation-matrix"><caption>Five gene families across four species. Select a gene family row to compare evidence. Non-experimental functional records and missing curation are explicitly labeled.</caption>
    <thead><tr><th scope="col">Reference gene</th>{species.map(s=><th scope="col" key={s}>{s}</th>)}</tr></thead>
    <tbody>{filtered.map(f=><tr key={f.id} className={f.id===family.id?'selected':''}>
     <th scope="row"><button type="button" aria-pressed={f.id===family.id} onClick={()=>setGene(f.id)}><strong>{f.humanSymbol}</strong><small>{f.category}</small><span>Inspect family →</span></button></th>
     {species.map(s=>{
       const c=cellFor(f,s);
       return <td key={s}><button type="button" onClick={()=>{setGene(f.id);if(s!==left)setRight(s);}} className={'conservation-cell '+(c?.functionalClass??'NOT_CURATED').toLowerCase()} aria-label={f.humanSymbol+' / '+s+': '+(c?.symbols.join(', ')||'Not curated')+'; select'}>
         <strong>{c?.symbols.length?c.symbols.join(' / '):'Not curated'}</strong>
         <span>{c?.functionalClass?functionalLabels[c.functionalClass]:'Not curated'}</span>
         <small>{c?.relationship?relationLabels[c.relationship]:''}</small>
       </button></td>;
     })}</tr>)}</tbody>
   </table>
   {filtered.length===0&&<p className="conservation-empty">No matching families. Clear the search or experimental filter.</p>}
  </div>
  <div className="conservation-legend"><span><i className="dot experiment"/> Injury experiment</span><span><i className="dot culture"/> Cultured-cell result</span><span><i className="dot observation"/> Non-interventional evidence</span><span><i className="dot identity"/> Identity / other context</span><span><i className="dot unc"/> Not curated</span></div>
  <div className="conservation-family">
   <div><span className="conservation-overline">SELECTED FAMILY · {family.humanSymbol}</span><h3>{family.displayName}</h3><p>{family.question}</p></div>
   <section className="conservation-safety"><strong>Protective role / translational caution</strong><p>{family.safety}</p></section>
  </div>
  <div className="conservation-compare-controls">
   <div><strong>Side-by-side scientific evidence</strong><span>Select two species to see what each experimental record actually reports.</span></div>
   <label>SPECIES A<select value={left} onChange={e=>setLeft(e.target.value)}>{species.map(s=><option key={s}>{s}</option>)}</select></label>
   <label>SPECIES B<select value={right} onChange={e=>setRight(e.target.value)}>{species.map(s=><option key={s}>{s}</option>)}</select></label>
  </div>
  {left===right?<div className="conservation-warning">Both columns show the same species. Choose a different second species for an actual comparison.</div>:null}
  <div className="conservation-side-by-side">
   {a?<CellDetails family={family} cell={a} label="SPECIES A"/>:null}
   {b?<CellDetails family={family} cell={b} label="SPECIES B"/>:null}
  </div>
  <div className="conservation-bridge"><div><span className="conservation-overline">CROSS-LAB LINKS</span><h4>Connect the research without confusing the evidence</h4><p>R1 shows tissue-specific reported pathway relationships; R2 shows regeneration outcomes across species. R3 tracks gene relationships independently.</p></div><div><button onClick={onOpenNetwork}>Open R1 molecular map ↗</button><button onClick={onOpenSpecies}>Open R2 species lab ↗</button></div></div>
  <p className="conservation-footer">Curated static literature, not an automated orthology pipeline or a genome-wide alignment. Taxonomic relationships and functional experiments are curated separately. Source availability does not imply independent replication. Educational research only, never medical advice.</p>
 </div>;
}
