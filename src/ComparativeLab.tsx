import { useMemo, useState } from 'react';
import library from './data/comparative-regeneration.json';
import './comparative-lab.css';

type CaseStudy = (typeof library.cases)[number];
type Category = CaseStudy['category'];
const cases=library.cases;
const species=library.species;
const tissues=library.tissues;
const descriptions: Record<string,string>={
 endogenous:'Documented substantial endogenous regrowth',
 induced:'Regrowth prompted by an experimental intervention',
 restricted:'Regrowth limited by age, anatomy or injury type',
 renewal:'Measured low-level cellular renewal',
 limited:'Strong limits on spontaneous structural regrowth',
 'not-established':'Functional replacement not established in humans'
};
const tinyLabels:Record<string,string>={
 endogenous:'Endogenous',induced:'Induced',restricted:'Restricted',renewal:'Cell renewal',limited:'Limited','not-established':'Unestablished'
};
const byPair=new Map(cases.map(c=>[c.species+'|'+c.tissue,c]));
const note='Select an evidence cell to inspect the full study context. A blank cell means not profiled, not proof that regeneration is absent.';
const sourceText=(s:CaseStudy['sources'][number])=>s.title;
function CasePanel({record,label}:{record:CaseStudy,label:string}) {
 return <article className="compare-case">
  <div className="compare-case-top"><span className="compare-slot">{label}</span><span className={'compare-category '+record.category}>{tinyLabels[record.category]}</span></div>
  <span className="compare-code">{record.id} · {record.species} / {record.tissue}</span>
  <h4>{record.headline}</h4>
  <p className="compare-context">{record.context}</p>
  <div className="compare-attribute"><span>Developmental stage</span><strong>{record.developmentalStage}</strong></div>
  <div className="compare-attribute"><span>Type of response</span><strong>{record.origin}</strong></div>
  <section className="compare-observed"><h5>Observed / reported</h5><p>{record.repair}</p></section>
  <section className="compare-boundary"><h5>Not established</h5><p>{record.boundary}</p></section>
  <div className="compare-attribute"><span>Functional endpoint</span><strong>{record.functional}</strong></div>
  <div className="compare-attribute"><span>Evidence model</span><strong>{record.studyType}</strong></div>
  <div className="compare-attribute"><span>Clinical scope</span><strong>{record.clinical}</strong></div>
  <div className="compare-mechanisms"><span className="compare-minihead">RESEARCH THEMES</span><div>{record.mechanisms.map(m=><span key={m}>{m}</span>)}</div></div>
  <div className="compare-sources"><span className="compare-minihead">CITED SOURCES</span>{record.sources.map(s=><a href={s.url} key={s.url} rel="noopener noreferrer" target="_blank"><strong>{sourceText(s)}</strong><small>{s.kind}{s.doi?' · DOI '+s.doi:''}</small><span aria-hidden="true">↗</span></a>)}</div>
 </article>;
}
function exportData() {
 const url=URL.createObjectURL(new Blob([JSON.stringify(library,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='regeneration-atlas-comparative-r2.json';a.click();
 window.setTimeout(()=>URL.revokeObjectURL(url),900);
}
export default function ComparativeLab({onOpenNetwork}:{onOpenNetwork:()=>void}) {
 const [focus,setFocus]=useState('CR-001');
 const [compare,setCompare]=useState('CR-003');
 const [search,setSearch]=useState('');
 const [tissueFocus,setTissueFocus]=useState('All');
 const primary=cases.find(c=>c.id===focus)??cases[0];
 const secondary=cases.find(c=>c.id===compare)??cases[2];
 const matches=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return new Set(cases.filter(c=>(tissueFocus==='All'||c.tissue===tissueFocus)&&(!q||[
   c.species,c.tissue,c.headline,c.context,c.studyType,c.repair,c.boundary,...c.mechanisms
  ].join(' ').toLowerCase().includes(q))).map(c=>c.id));
 },[search,tissueFocus]);
 const categories=Array.from(new Set(cases.map(c=>c.category))) as Category[];
 return <div className="comparative-lab">
  <div className="compare-hero"><div><span className="compare-overline">R2 / CROSS-SPECIES RESEARCH DESK</span><h3>Comparative Regeneration Laboratory</h3><p>Four vertebrates. Four tissue categories. Evidence for different forms of regrowth, renewal and restricted repair, without inventing a universal regeneration score.</p></div><div className="compare-hero-actions"><button onClick={exportData}>Export research JSON ↓</button><button onClick={onOpenNetwork} className="compare-ghost">Open protein network ↗</button></div></div>
  <div className="compare-metrics"><div><strong>{cases.length}</strong><span>Cited study summaries</span></div><div><strong>{species.length}</strong><span>Species</span></div><div><strong>{tissues.length}</strong><span>Tissue categories</span></div><div><strong>{species.length*tissues.length-cases.length}</strong><span>Unprofiled combinations</span></div></div>
  <div className="compare-intro"><strong>No biological superpower scoreboard.</strong> A natural retinal response, neonatal cardiac repair, low-level heart-cell renewal, and a child's fingertip regrowth are different outcomes. Cell division is not the same as a restored organ or clinical function.</div>
  <div className="compare-filter-line"><label className="compare-search-label">Find evidence or mechanisms<input placeholder="Search cells, mechanisms, outcomes…" value={search} onChange={e=>setSearch(e.target.value)}/></label><label className="compare-tissue-label">Focus tissue<select value={tissueFocus} onChange={e=>setTissueFocus(e.target.value)}><option value="All">All tissues</option>{tissues.map(t=><option key={t}>{t}</option>)}</select></label><div className="compare-matches">{matches.size} matching profiles</div></div>
  <div className="compare-table-scroll" tabIndex={0} aria-label="Scrollable comparative regeneration evidence table">
  <table className="compare-matrix"><caption>Evidence map: click a populated cell to select Study A. Empty cells are research gaps in this atlas, not biological negatives.</caption><thead><tr><th scope="col">Tissue ↘ / Species →</th>{species.map(s=><th key={s} scope="col">{s}</th>)}</tr></thead><tbody>{tissues.map(t=><tr key={t}><th scope="row">{t}</th>{species.map(s=>{
    const record=byPair.get(s+'|'+t);
    if(!record)return <td key={s} className="compare-unprofiled"><span>Not profiled</span><small>no claim made</small></td>;
    const filtered=!matches.has(record.id);
    return <td key={s}><button type="button" onClick={()=>setFocus(record.id)} aria-pressed={primary.id===record.id} aria-label={s+' '+t+': '+record.headline+'; '+descriptions[record.category]} className={'compare-cell '+record.category+(primary.id===record.id?' picked':'')+(filtered?' muted':'')}><strong>{record.headline}</strong><span>{tinyLabels[record.category]}</span><small>{record.id}</small></button></td>;
   })}</tr>)}</tbody></table>
  </div>
  <div className="compare-key"><span>READING THE CELLS</span>{categories.map(c=><div key={c}><i className={'compare-key-swatch '+c}/>{tinyLabels[c]}</div>)}<p>{note}</p></div>
  <div className="compare-pair-title"><div><span className="compare-overline">SIDE-BY-SIDE EVIDENCE</span><h3>Compare study context, not species scores</h3><p>Study A follows your matrix selection. Choose any cited study for B to review its actual context and limitations.</p></div><label>Comparison study B<select value={compare} onChange={e=>setCompare(e.target.value)}>{cases.map(c=><option key={c.id} value={c.id}>{c.id} · {c.species} · {c.tissue}</option>)}</select></label></div>
  {primary.tissue!==secondary.tissue?<div className="compare-warning">Different tissue categories selected. This is a cross-tissue juxtaposition, not evidence of a shared mechanism or directly comparable regenerative potential.</div>:null}
  {primary.id===secondary.id?<div className="compare-warning">Both panels show the same study. Choose a different B study for a cross-case comparison.</div>:null}
  <div className="compare-pair"><CasePanel record={primary} label="STUDY A"/><CasePanel record={secondary} label="STUDY B"/></div>
  <div className="compare-research-next"><span className="compare-overline">RESEARCH QUESTIONS · NOT TESTED COMBINATIONS</span><h4>What could comparative biology help us investigate?</h4><div className="compare-question-grid"><section><strong>Cell identity</strong><p>Which injury-triggered reprogramming mechanisms are shared, and which remain tissue-specific?</p></section><section><strong>Age and anatomy</strong><p>Why do neonatal or distal-tip contexts permit regeneration that adult or proximal tissues typically cannot?</p></section><section><strong>Functional integration</strong><p>When do new cells restore tissue function, rather than only increasing cell numbers or markers?</p></section></div></div>
  <p className="compare-disclaimer">Every case is anchored to published sources. No numerical regeneration ranking, no clinical treatment recommendations, and no claim that mechanisms can be transferred between species without direct testing.</p>
 </div>;
}
