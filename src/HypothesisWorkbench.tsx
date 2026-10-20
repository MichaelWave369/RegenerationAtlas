import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import bank from './data/hypotheses.json';
import gaps from './data/evidence-gaps.json';
import './hypothesis-workbench.css';

type Hypothesis = (typeof bank.hypotheses)[number];
type Progress = 'unreviewed' | 'reading' | 'drafting' | 'needs-review' | 'parked';
type Note = { progress: Progress; observations: string; counterEvidence: string; nextReview: string };
type Notes = Record<string, Note>;
const storageKey='regeneration-atlas-r5-personal-drafts-v1';
const progressOptions: {value:Progress;label:string}[]=[
 {value:'unreviewed',label:'Not reviewed'},
 {value:'reading',label:'Reviewing sources'},
 {value:'drafting',label:'Drafting an analysis'},
 {value:'needs-review',label:'Needs critical review'},
 {value:'parked',label:'Parked for later'}
];
const ids=new Set(bank.hypotheses.map(h=>h.id));
const fresh=():Note=>({progress:'unreviewed',observations:'',counterEvidence:'',nextReview:''});
const allowed=new Set<Progress>(progressOptions.map(o=>o.value));
const asText=(v:unknown)=>typeof v==='string'?v.slice(0,4000):'';
function parseNotes(value:unknown):Notes|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const root=value as Record<string,unknown>;
 if(root.format!=='regeneration-atlas-r5-personal-notes'||root.version!==1)return null;
 if(!root.notes||typeof root.notes!=='object'||Array.isArray(root.notes))return null;
 const incoming=root.notes as Record<string,unknown>;
 const result:Notes={};
 for(const id of ids){
  const entry=incoming[id];if(!entry||typeof entry!=='object'||Array.isArray(entry))continue;
  const n=entry as Record<string,unknown>;
  result[id]={
   progress:allowed.has(n.progress as Progress)?n.progress as Progress:'unreviewed',
   observations:asText(n.observations),counterEvidence:asText(n.counterEvidence),nextReview:asText(n.nextReview)
  };
 }
 return result;
}
function readLocal():Notes{
 try{
  const text=window.localStorage.getItem(storageKey);
  if(!text)return {};
  return parseNotes(JSON.parse(text))??{};
 }catch{return {};}
}
function jsonDownload(filename:string,value:unknown){
 const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
 const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.click();
 window.setTimeout(()=>URL.revokeObjectURL(url),700);
}
function getNotebook(notes:Notes){return{format:'regeneration-atlas-r5-personal-notes',version:1,warning:'UNVERIFIED PERSONAL NOTES ONLY. Not evidence, not medical advice, and not uploaded.',exportedAt:new Date().toISOString(),notes};}
const heading=(id:string)=>gaps.gaps.find(g=>g.id===id);
export default function HypothesisWorkbench({onOpenGap}:{onOpenGap:(id:string)=>void}){
 const [selected,setSelected]=useState('HYP-001');
 const [term,setTerm]=useState('');
 const [tissue,setTissue]=useState('All');
 const [progressFilter,setProgressFilter]=useState('All');
 const [notes,setNotes]=useState<Notes>(readLocal);
 const [feedback,setFeedback]=useState('');
 const [confirmClear,setConfirmClear]=useState(false);
 useEffect(()=>{
  try{window.localStorage.setItem(storageKey,JSON.stringify(getNotebook(notes)));}
  catch{ /* Browsers with storage disabled can still export notes */ }
 },[notes]);
 const allTissues=useMemo(()=>['All',...new Set(bank.hypotheses.map(h=>h.tissue))],[]);
 const filtered=useMemo(()=>bank.hypotheses.filter(h=>{
  const q=term.trim().toLowerCase();
  return (tissue==='All'||h.tissue===tissue)&&
   (progressFilter==='All'||(notes[h.id]?.progress??'unreviewed')===progressFilter)&&
   (!q||[h.title,h.statement,h.tissue,h.gapId,...h.genes].join(' ').toLowerCase().includes(q));
 }),[term,tissue,progressFilter,notes]);
 const current:Hypothesis=filtered.find(h=>h.id===selected)??filtered[0]??bank.hypotheses[0];
 const work=notes[current.id]??fresh();
 const edited=Object.values(notes).filter(n=>n.progress!=='unreviewed'||n.observations||n.counterEvidence||n.nextReview).length;
 const change=(field:keyof Note,value:string)=>{
  setNotes(prev=>({...prev,[current.id]:{...(prev[current.id]??fresh()),[field]:value}}));
  setFeedback('');
 };
 const importFile=async(event:ChangeEvent<HTMLInputElement>)=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(file.size>250000){setFeedback('Import rejected: notebook must be 250 KB or smaller.');return;}
  try{
   const parsed=parseNotes(JSON.parse(await file.text()));
   if(!parsed){setFeedback('Import rejected: this is not an R5 personal-notes JSON file.');return;}
   setNotes(parsed);setFeedback('Personal notes imported locally. Published evidence was not modified.');
  }catch{setFeedback('Import rejected: invalid JSON. No changes made.');}
 };
 const clear=()=>{
  setNotes({});setConfirmClear(false);setFeedback('Personal drafts cleared from this browser. Published hypothesis templates remain unchanged.');
 };
 const compiled=()=>{
  const item={...current,originGap:heading(current.gapId),personalAnnotation:work,
   important:'UNTESTED TEMPLATE + PERSONAL UNVERIFIED NOTES. No experimental confirmation or clinical advice.'};
  jsonDownload('hypothesis-'+current.id.toLowerCase()+'-review.json',item);
 };
 return <div className="hw">
  <section className="hw-hero">
   <div><span className="hw-eyebrow">R5 · RESEARCH HYPOTHESIS WORKBENCH</span><h3>Make the idea testable. Keep the ledger honest.</h3>
   <p>Move from an evidence gap to a falsifiable question. Examine supporting predictions, disconfirming outcomes and alternative explanations before anyone uses the word “discovery.”</p></div>
   <button onClick={()=>jsonDownload('regeneration-atlas-r5-curated-hypotheses.json',bank)}>Export hypothesis bank ↓</button>
  </section>
  <div className="hw-stats"><div><strong>{bank.hypotheses.length}</strong><span>Untested hypotheses</span></div><div><strong>{new Set(bank.hypotheses.map(h=>h.tissue)).size}</strong><span>Tissue contexts</span></div><div><strong>{edited}</strong><span>Locally annotated</span></div><div><strong>0</strong><span>Validated cures claimed</span></div></div>
  <div className="hw-alert"><strong>Evidence gate:</strong> All hypothesis templates are marked <code>UNTESTED_HYPOTHESIS</code>. A personal reading status is not a research result. Your notes stay in this browser's local storage unless you deliberately export them.</div>
  <div className="hw-toolbar">
   <label><span>SEARCH THE HYPOTHESIS BANK</span><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="PROX1, optic nerve, PRRX1…"/></label>
   <label><span>TISSUE</span><select value={tissue} onChange={e=>setTissue(e.target.value)}>{allTissues.map(t=><option key={t}>{t}</option>)}</select></label>
   <label><span>NOTEBOOK STAGE</span><select value={progressFilter} onChange={e=>setProgressFilter(e.target.value)}><option>All</option>{progressOptions.map(p=><option value={p.value} key={p.value}>{p.label}</option>)}</select></label>
  </div>
  <div className="hw-main">
   <aside className="hw-rail">
    <div className="hw-rail-head"><strong>Hypothesis library</strong><small>{filtered.length} / {bank.hypotheses.length}</small></div>
    {filtered.map(h=><button type="button" className={'hw-entry'+(current.id===h.id?' selected':'')} aria-pressed={current.id===h.id} key={h.id} onClick={()=>{setSelected(h.id);setFeedback('');setConfirmClear(false);}}>
      <span>{h.id} · {h.tissue}</span><strong>{h.title}</strong><small>{progressOptions.find(p=>p.value===(notes[h.id]?.progress??'unreviewed'))?.label}</small>
     </button>)}
     {filtered.length===0&&<p className="hw-empty">No hypotheses match these filters.</p>}
   </aside>
   <div className="hw-detail">
    <div className="hw-header"><div><span className="hw-eyebrow">{current.id} · {current.gapId}</span><h3>{current.title}</h3></div><span className="hw-untested">UNTESTED · HYPOTHESIS</span></div>
    <div className="hw-tags">{current.genes.map(g=><span key={g}>{g}</span>)}</div>
    <section className="hw-statement"><strong>IF / THEN · FALSIFIABLE STATEMENT</strong><p>{current.statement}</p></section>
    <div className="hw-evidence-grid">
     <section className="hw-support"><strong>What would support it?</strong><p>{current.prediction}</p></section>
     <section className="hw-counter"><strong>What could disconfirm it?</strong><p>{current.disconfirmation}</p></section>
     <section className="hw-alternative"><strong>Alternative explanations</strong><p>{current.alternatives}</p></section>
     <section className="hw-needed"><strong>Evidence needed</strong><p>{current.evidenceNeeded}</p></section>
    </div>
    <div className="hw-limits"><strong>Scientific / safety boundary</strong><p>{current.caution}</p></div>
    <div className="hw-source"><div><span>PROVENANCE · R4 / PUBLISHED-EVIDENCE GAPS</span><strong>{heading(current.gapId)?.title??current.gapId}</strong><p>Follow the original studies and four evidence checkpoints before treating this idea as supported.</p></div><button onClick={()=>onOpenGap(current.gapId)}>Inspect linked evidence ↗</button></div>
    <section className="hw-notebook">
     <div className="hw-notebook-head"><div><span className="hw-eyebrow">PRIVATE LOCAL DRAFT</span><h4>Investigator's notebook</h4><p>These are your own working notes, never part of the curated atlas or its published evidence.</p></div><label>READING STAGE<select value={work.progress} onChange={e=>change('progress',e.target.value)}>{progressOptions.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}</select></label></div>
     <label>Observations or literature to examine<textarea maxLength={4000} rows={3} placeholder="Record source questions and potential supporting observations..." value={work.observations} onChange={e=>change('observations',e.target.value)}/></label>
     <label>Counterevidence or reasons for skepticism<textarea maxLength={4000} rows={3} placeholder="Write down the strongest alternative or disconfirming evidence..." value={work.counterEvidence} onChange={e=>change('counterEvidence',e.target.value)}/></label>
     <label>Next literature review step<textarea maxLength={4000} rows={2} placeholder="What should be reviewed or checked next? No experimental protocols needed." value={work.nextReview} onChange={e=>change('nextReview',e.target.value)}/></label>
     <div className="hw-actions"><button onClick={compiled}>Export this hypothesis + notes ↓</button><button onClick={()=>jsonDownload('regeneration-atlas-r5-personal-notes.json',getNotebook(notes))}>Back up personal notebook ↓</button><label className="hw-import">Import notebook JSON<input type="file" accept="application/json,.json" onChange={importFile}/></label></div>
     <div className="hw-clear"><button className="hw-danger" onClick={()=>setConfirmClear(prev=>!prev)}>{confirmClear?'Cancel clear':'Clear local notebook…'}</button>{confirmClear&&<button className="hw-confirm" onClick={clear}>Confirm: erase only local notes</button>}</div>
     {feedback&&<p className="hw-feedback" role="status">{feedback}</p>}
    </section>
   </div>
  </div>
  <p className="hw-footer">Research prompts are not direct laboratory instructions, statistical power calculations, validated causal theories, clinical claims or medical advice. Local notebook states describe your reading workflow only.</p>
 </div>;
}
