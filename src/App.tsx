import { useMemo, useState } from 'react';
import evidence from './data/evidence.json';
import InteractionMap from './InteractionMap';
import ComparativeLab from './ComparativeLab';
import GeneConservation from './GeneConservation';
import EvidenceGap from './EvidenceGap';
import HypothesisWorkbench from './HypothesisWorkbench';

type RecordItem = (typeof evidence)[number];
type Tab = 'explore' | 'network' | 'comparative' | 'conservation' | 'gaps' | 'hypotheses' | 'mechanism' | 'principles';

const distinct = (values: string[]) => ['All', ...Array.from(new Set(values))];
const panels = [
  {step:'01', title:'Detect injury',detail:'Recognize tissue damage and recruit appropriate repair responses.'},
  {step:'02', title:'Unlock plasticity',detail:'Permit specific cells to change their state when safe and useful.'},
  {step:'03', title:'Drive growth',detail:'Generate enough replacement cells or regrowing axons.'},
  {step:'04', title:'Specify identity',detail:'Produce the correct cell type, in the correct location.'},
  {step:'05', title:'Integrate function',detail:'Connect to existing tissue and measure actual function.'},
  {step:'06', title:'Restore safeguards',detail:'Stop unnecessary growth and preserve cancer-prevention systems.'}
];

function ResearchCard({item}:{item:RecordItem}) {
  const isNegative = item.outcome === 'Primary endpoint not met';
  const isPreprint = item.stage === 'Preprint';
  return <article className="research-card">
    <div className="card-head"><span className="code">{item.id}</span><span className={'pill ' + (isNegative ? 'negative' : isPreprint ? 'preprint' : '')}>{item.outcome}</span></div>
    <h3>{item.title}</h3>
    <div className="tags">{item.genes.map(g => <span key={g} className="gene">{g}</span>)}<span>{item.tissue}</span><span>{item.model}</span></div>
    <div className="evidence-grid">
      <section><strong className="good">Observed</strong><p>{item.observed}</p></section>
      <section><strong className="careful">Not shown</strong><p>{item.notShown}</p></section>
    </div>
    <div className="risk"><strong>Limitations / safeguards</strong><p>{item.safety}</p></div>
    <div className="card-footer"><div><span>{item.evidence}</span><small>{item.source}</small></div><a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={'Open source for '+item.id}>View source ↗</a></div>
    <details><summary>Source &amp; disclosure details</summary><p>DOI: {item.doi}</p><p>Disclosure note: {item.conflict}</p><p>Provenance: {item.provenance}</p></details>
  </article>;
}

export default function App() {
  const [tab,setTab] = useState<Tab>('explore');
  const [jumpGap,setJumpGap] = useState('GAP-001');
  const [query,setQuery] = useState('');
  const [tissue,setTissue] = useState('All');
  const [model,setModel] = useState('All');
  const [outcome,setOutcome] = useState('All');
  const tissues = distinct(evidence.map(e=>e.tissue));
  const models = distinct(evidence.map(e=>e.model));
  const outcomes = distinct(evidence.map(e=>e.outcome));
  const results = useMemo(()=>evidence.filter(item=>{
    const term=query.toLowerCase().trim();
    const searchable=[item.title,item.tissue,item.model,item.source,item.observed,item.notShown,...item.genes].join(' ').toLowerCase();
    return (!term || searchable.includes(term)) && (tissue==='All'||item.tissue===tissue) && (model==='All'||item.model===model) && (outcome==='All'||item.outcome===outcome);
  }),[query,tissue,model,outcome]);
  const download=()=>{
    const blob=new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='regeneration-atlas-evidence-r0.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),500);
  };
  return <div className="site">
    <header className="topbar"><a href="#" className="brand"><span className="mark">✳</span><span>REGENERATION<span className="brand-accent">ATLAS</span></span></a><div className="edition">OPEN RESEARCH <span>R5.0</span></div></header>
    <main>
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> OPEN-SOURCE BIOLOGY RESEARCH</div><h1>The science of <em>repair.</em><br/>Without the hype.</h1><p>Explore how proteins influence cellular identity, regrowth, and the body's repair safeguards. Every claim is anchored to a source and paired with what the experiment <strong>does not</strong> establish.</p><div className="hero-actions"><button onClick={()=>{setTab('explore');document.getElementById('research')?.scrollIntoView({behavior:'smooth'});}}>Explore evidence <span>↗</span></button><button className="secondary" onClick={download}>Download evidence ↓</button></div></div><div className="hero-graphic" aria-label="Decorative cellular network illustration"><div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/><div className="orb-center">✳</div><span className="graphic-note note1">CELL STATE</span><span className="graphic-note note2">SIGNALING</span><span className="graphic-note note3">REPAIR</span></div></section>
      <section className="metrics"><div><strong>{evidence.length.toString().padStart(2,'0')}</strong><span>Source-linked records</span></div><div><strong>{new Set(evidence.flatMap(e=>e.genes)).size.toString().padStart(2,'0')}</strong><span>Molecular targets</span></div><div><strong>{new Set(evidence.map(e=>e.tissue)).size.toString().padStart(2,'0')}</strong><span>Tissue categories</span></div><div><strong>00</strong><span>Proven cures claimed</span></div></section>
      <section className="workspace" id="research"><div className="workspace-head"><div><div className="eyebrow">THE RESEARCH DESK</div><h2>Explore the evidence</h2><p>Mechanisms are not medicines. Animal results are not human outcomes.</p></div><span className="ledger-label">LEDGER ABOVE EGO</span></div>
      <nav className="tabs" aria-label="Research views"><button className={tab==='explore'?'active':''} onClick={()=>setTab('explore')}>Evidence ledger</button><button className={tab==='network'?'active':''} onClick={()=>setTab('network')}>Interaction map</button><button className={tab==='comparative'?'active':''} onClick={()=>setTab('comparative')}>Species laboratory</button><button className={tab==='conservation'?'active':''} onClick={()=>setTab('conservation')}>Gene conservation</button><button className={tab==='gaps'?'active':''} onClick={()=>setTab('gaps')}>Evidence gaps</button><button className={tab==='hypotheses'?'active':''} onClick={()=>setTab('hypotheses')}>Hypothesis workbench</button><button className={tab==='mechanism'?'active':''} onClick={()=>setTab('mechanism')}>Repair framework</button><button className={tab==='principles'?'active':''} onClick={()=>setTab('principles')}>Research protocol</button></nav>
      {tab==='network' && <InteractionMap/>}
      {tab==='comparative' && <ComparativeLab onOpenNetwork={()=>setTab('network')}/>}
      {tab==='conservation' && <GeneConservation onOpenNetwork={()=>setTab('network')} onOpenSpecies={()=>setTab('comparative')}/>}
      {tab==='gaps' && <EvidenceGap key={jumpGap} initialGapId={jumpGap} onOpenLedger={()=>setTab('explore')} onOpenNetwork={()=>setTab('network')} onOpenSpecies={()=>setTab('comparative')} onOpenConservation={()=>setTab('conservation')}/>}
      {tab==='hypotheses' && <HypothesisWorkbench onOpenGap={id=>{setJumpGap(id);setTab('gaps');}}/>}
      {tab==='explore' && <><div className="controls"><label className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search genes, studies, tissue…" aria-label="Search evidence"/></label><label><span>Tissue</span><select value={tissue} onChange={e=>setTissue(e.target.value)}>{tissues.map(x=><option key={x}>{x}</option>)}</select></label><label><span>Model</span><select value={model} onChange={e=>setModel(e.target.value)}>{models.map(x=><option key={x}>{x}</option>)}</select></label><label><span>Outcome</span><select value={outcome} onChange={e=>setOutcome(e.target.value)}>{outcomes.map(x=><option key={x}>{x}</option>)}</select></label></div><div className="result-line"><span>{results.length} of {evidence.length} records</span><button className="clear" onClick={()=>{setQuery('');setTissue('All');setModel('All');setOutcome('All');}}>Reset filters ↺</button></div><div className="card-grid">{results.map(item=><ResearchCard key={item.id} item={item}/>)}</div>{results.length===0&&<div className="empty">No matches. Try a broader search or reset filters.</div>}</>}
      {tab==='mechanism' && <div className="framework"><div className="notice"><strong>Conceptual framework, not a clinical pathway.</strong> These stages help organize questions across tissues; they are not evidence that any combination of interventions will work.</div><div className="framework-grid">{panels.map(p=><article key={p.step}><span>{p.step}</span><h3>{p.title}</h3><p>{p.detail}</p></article>)}</div><div className="notice"><strong>Context matters:</strong> YAP activity can be beneficial in some heart repair models and contribute to scarring in certain skin fibroblasts. PTEN restricts axon regrowth but also suppresses tumors. Local and temporary control are essential research questions.</div></div>}
      {tab==='principles' && <div className="principles"><h3>Evidence before excitement</h3><p>Each entry must explain what was measured, in which species or human setting, and what cannot be concluded.</p><ul><li>Keep animal, ex vivo human tissue, genetics, and clinical studies distinct.</li><li>Record negative and inconclusive outcomes just as prominently as positive ones.</li><li>Label preprints clearly and do not confuse peer review with replication.</li><li>Describe protective functions and safety tradeoffs of targeted proteins.</li><li>Link the primary study; disclose possible financial and intellectual-property interests.</li><li>Never present experimental work as a treatment recommendation or medical advice.</li></ul><a href="https://github.com/MichaelWave369/RegenerationAtlas/blob/main/research/EVIDENCE_PROTOCOL.md" target="_blank" rel="noopener noreferrer">Full contributor protocol ↗</a></div>}
      </section>
    </main><footer><strong>REGENERATION ATLAS</strong><p>Understanding the biology of repair. Keeping the evidence intact.</p><span>MIT open source · Research only · Not medical advice</span></footer>
  </div>;
}
