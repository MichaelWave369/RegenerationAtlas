import { useMemo, useState } from 'react';
import dataset from './data/evidence-gaps.json';
import evidence from './data/evidence.json';
import interactions from './data/interactions.json';
import comparative from './data/comparative-regeneration.json';
import conservation from './data/gene-conservation.json';
import './evidence-gap.css';

type Gap = (typeof dataset.gaps)[number];
type Checkpoint = Gap['checkpoints'][number];
type Ref = Checkpoint['refs'][number];
type LinkInfo = { title:string; url:string; kind:string };
type CitationResult = { heading:string; context:string; links:LinkInfo[]; label:string };
const statuses={ documented:'Documented evidence', partial:'Partial / limited', 'not-profiled':'Not established in atlas' } as const;
const severity=['documented','partial','not-profiled'] as const;
const stageTitle = new Map(dataset.stages.map(s=>[s.key,s.title]));
const unique=(all:string[])=>['All',...new Set(all)];
const allTissues=unique(dataset.gaps.map(g=>g.tissue));
const allThemes=unique(dataset.gaps.map(g=>g.theme));

function citation(ref:Ref):CitationResult|null {
 if(ref.kind==='R0'){
  const item=evidence.find(x=>x.id===ref.id);
  return item?{heading:item.title,context:item.model+' · '+item.outcome,links:[{title:item.source,url:item.url,kind:item.stage}],label:'R0 Evidence · '+ref.id}:null;
 }
 if(ref.kind==='R1'){
  const edge=interactions.edges.find(x=>x.id===ref.id);
  if(!edge)return null;
  return {heading:edge.relation,context:edge.model+' · '+edge.classification.replaceAll('_',' '),label:'R1 Interaction · '+ref.id,links:edge.sourceRecordIds.flatMap(id=>{
   const item=evidence.find(x=>x.id===id);
   return item?[{title:item.source,url:item.url,kind:item.stage}]:[];
  })};
 }
 if(ref.kind==='R2'){
  const caseStudy=comparative.cases.find(x=>x.id===ref.id);
  return caseStudy?{heading:caseStudy.headline,context:caseStudy.context,label:'R2 Comparison · '+ref.id,links:caseStudy.sources.map(s=>({title:s.title,url:s.url,kind:s.kind}))}:null;
 }
 if(ref.kind==='R3'){
  const family=conservation.families.find(x=>x.id===ref.id);
  const cell=family?.cells.find(x=>x.species===ref.species);
  if(!family||!cell)return null;
  return {heading:family.displayName+' · '+cell.species,context:cell.context+' · '+cell.functionalClass.replaceAll('_',' '),label:'R3 Conservation · '+ref.id+'/'+ref.species,links:[...cell.orthologySources,...cell.functionSources].map(s=>({title:s.title,url:s.url,kind:s.role}))};
 }
 return null;
}
function allLinks(gap:Gap):LinkInfo[]{
 const found=new Map<string,LinkInfo>();
 for(const c of gap.checkpoints)for(const r of c.refs){
  const citationResult=citation(r);
  for(const link of citationResult?.links??[])if(!found.has(link.url))found.set(link.url,link);
 }
 return [...found.values()];
}
function exportFull(){
 const url=URL.createObjectURL(new Blob([JSON.stringify(dataset,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='regeneration-atlas-evidence-gaps-r4.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),900);
}
function makeBrief(gap:Gap):string {
 const lines=[
  '# '+gap.id+': '+gap.title,
  '',
  '> Status: OPEN_IN_ATLAS. This is a gap in the curated Regeneration Atlas evidence set, NOT a claim that no researchers have investigated the topic.',
  '',
  '## Research question',gap.question,'',
  '## Why this is still open in the atlas',gap.whyOpen,'',
  '## Evidence checkpoints'
 ];
 for(const c of gap.checkpoints){
  lines.push('### '+(stageTitle.get(c.key)??c.key)+' — '+statuses[c.status as keyof typeof statuses],c.explanation,'',
   ...c.refs.map(ref=>'- '+ref.kind+' '+ref.id+(ref.species?' / '+ref.species:'')));
  lines.push('');
 }
 lines.push('## Evidence needed (research questions, not a laboratory protocol)',gap.studyDesign,'',
  '## Safety and interpretive boundary',gap.caveat,'','## Source documents');
 for(const source of allLinks(gap))lines.push('- ['+source.title+']('+source.url+') — '+source.kind);
 lines.push('','Research synthesis only. No clinical recommendations, instructions for gene modification, or established treatments are implied.');
 return lines.join('\n');
}
function exportBrief(gap:Gap) {
 const url=URL.createObjectURL(new Blob([makeBrief(gap)],{type:'text/markdown'}));
 const a=document.createElement('a');a.href=url;a.download='research-brief-'+gap.id.toLowerCase()+'.md';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),900);
}
function Status({status}:{status:string}) {
 return <span className={'gap-status '+status}><span className="gap-status-dot"/>{statuses[status as keyof typeof statuses]??status}</span>;
}
function Source({item}:{item:Ref}){
 const source=citation(item);
 if(!source)return <div className="gap-missing-source">Unresolved citation: {item.kind} / {item.id}</div>;
 return <div className="gap-source"><div><span>{source.label}</span><strong>{source.heading}</strong><small>{source.context}</small></div>
   <div className="gap-source-links">{source.links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.kind} · source ↗</a>)}</div></div>;
}
function Study({gap,onOpenLedger,onOpenNetwork,onOpenSpecies,onOpenConservation}:{
 gap:Gap;onOpenLedger:()=>void;onOpenNetwork:()=>void;onOpenSpecies:()=>void;onOpenConservation:()=>void;
}){
 const refs=gap.checkpoints.reduce((sum,c)=>sum+c.refs.length,0);
 return <article className="gap-detail">
   <div className="gap-detail-head"><div><span className="gap-eyebrow">{gap.id} · {gap.theme} · {gap.tissue}</span><h3>{gap.title}</h3></div><button onClick={()=>exportBrief(gap)}>Download research brief ↓</button></div>
   <div className="gap-question"><span>OPEN RESEARCH QUESTION</span><p>{gap.question}</p></div>
   <div className="gap-summary"><div><span>Why this is a gap in our atlas</span><p>{gap.whyOpen}</p></div><div><span>What evidence would help</span><p>{gap.studyDesign}</p></div></div>
   <div className="gap-risk"><strong>Evidence and safety boundary</strong><p>{gap.caveat}</p></div>
   <div className="gap-detail-subhead"><div><h4>Four checkpoints, each independently classified</h4><p>“Documented” means evidence exists, not that a treatment succeeded. Negative clinical results count as documented.</p></div><span>{refs} linked evidence references</span></div>
   <div className="gap-checkpoints">
   {gap.checkpoints.map((checkpoint,index)=><section className="gap-checkpoint" key={checkpoint.key}>
    <div className="gap-checkpoint-head"><div><span>{String(index+1).padStart(2,'0')} / {stageTitle.get(checkpoint.key)}</span><Status status={checkpoint.status}/></div><p>{checkpoint.explanation}</p></div>
    <div className="gap-sources">{checkpoint.refs.map((r,i)=><Source key={r.kind+'-'+r.id+'-'+r.species+'-'+i} item={r}/>)}</div>
   </section>)}
   </div>
   <div className="gap-navigation"><span>Explore the referenced research layers</span><div><button onClick={onOpenLedger}>R0 Evidence ledger ↗</button><button onClick={onOpenNetwork}>R1 Pathways ↗</button><button onClick={onOpenSpecies}>R2 Species ↗</button><button onClick={onOpenConservation}>R3 Genes ↗</button></div></div>
  </article>;
}
export default function EvidenceGap({onOpenLedger,onOpenNetwork,onOpenSpecies,onOpenConservation}:{
 onOpenLedger:()=>void;onOpenNetwork:()=>void;onOpenSpecies:()=>void;onOpenConservation:()=>void;
}){
 const [selected,setSelected]=useState('GAP-001');
 const [search,setSearch]=useState('');
 const [tissue,setTissue]=useState('All');
 const [theme,setTheme]=useState('All');
 const [humanOnly,setHumanOnly]=useState(false);
 const filtered=useMemo(()=>{
  const term=search.trim().toLowerCase();
  return dataset.gaps.filter(g=>{
   const searchable=[g.id,g.title,g.tissue,g.theme,g.question,g.whyOpen,...g.genes].join(' ').toLowerCase();
   return (!term||searchable.includes(term))&&(tissue==='All'||g.tissue===tissue)&&(theme==='All'||g.theme===theme)&&(!humanOnly||g.checkpoints.find(c=>c.key==='human')?.status==='not-profiled');
  });
 },[search,tissue,theme,humanOnly]);
 const current=dataset.gaps.find(g=>g.id===selected)??dataset.gaps[0];
 const counts=Object.fromEntries(severity.map(x=>[x,dataset.gaps.flatMap(g=>g.checkpoints).filter(c=>c.status===x).length]));
 return <div className="gap-lab">
   <div className="gap-hero"><div><span className="gap-eyebrow">R4 / EVIDENCE-GAP INTELLIGENCE</span><h3>From what we know to what we can test.</h3><p>Follow the evidence across genes, animal experiments, functional outcomes and clinical observations. Every gap has an explicit scope, a traceable claim chain and a boundary.</p></div><button onClick={exportFull}>Export gap ledger JSON ↓</button></div>
   <div className="gap-topstats"><div><strong>{dataset.gaps.length}</strong><span>Curated open questions</span></div><div><strong>{counts.documented}</strong><span>Documented checkpoints</span></div><div><strong>{counts.partial}</strong><span>Partial checkpoints</span></div><div><strong>{counts['not-profiled']}</strong><span>Not established here</span></div></div>
   <div className="gap-caution"><strong>“Open in atlas” ≠ “unknown to science.”</strong> This project contains a small, curated literature sample, not a systematic review or live exhaustive search. Empty checkpoints indicate limits of our current records, not evidence of biological impossibility. <strong>Recorded human trial results may be negative.</strong></div>
   <div className="gap-controls">
    <label className="gap-search"><span>SEARCH QUESTIONS</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="PROX1, integration, heart, trial…"/></label>
    <label><span>TISSUE</span><select value={tissue} onChange={e=>setTissue(e.target.value)}>{allTissues.map(x=><option key={x}>{x}</option>)}</select></label>
    <label><span>GAP TYPE</span><select value={theme} onChange={e=>setTheme(e.target.value)}>{allThemes.map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="gap-check"><input type="checkbox" checked={humanOnly} onChange={e=>setHumanOnly(e.target.checked)}/> Missing human outcome in atlas</label>
   </div>
   <div className="gap-workspace">
    <aside className="gap-directory"><div className="gap-directory-heading"><strong>Research questions</strong><span>{filtered.length} / {dataset.gaps.length}</span></div>
     {filtered.map(g=><button type="button" aria-pressed={current.id===g.id} className={'gap-entry'+(current.id===g.id?' active':'')} onClick={()=>setSelected(g.id)} key={g.id}>
      <span>{g.id} · {g.tissue}</span><strong>{g.title}</strong><div className="gap-entry-stages">{g.checkpoints.map(c=><span key={c.key} className={c.status} title={(stageTitle.get(c.key)??c.key)+': '+statuses[c.status as keyof typeof statuses]}/>)}</div>
     </button>)}
     {filtered.length===0&&<p className="gap-none">No matching questions. Try broader filters.</p>}
    </aside>
    <div className="gap-selected">{current?<Study gap={current} onOpenLedger={onOpenLedger} onOpenNetwork={onOpenNetwork} onOpenSpecies={onOpenSpecies} onOpenConservation={onOpenConservation}/>:null}</div>
   </div>
   <p className="gap-disclaimer">The four checkpoints are an editorial checklist, not a quantitative scientific score or pathway to a clinical product. None of the research briefs are treatment recommendations, laboratory recipes, or proof of novelty.</p>
  </div>;
}
