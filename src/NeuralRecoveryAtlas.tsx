import { useMemo, useState } from 'react';
import atlas from './data/neural-recovery.json';
import './neural-recovery.css';

type View = 'states' | 'studies' | 'questions';
type Study = (typeof atlas.studies)[number];
type Question = (typeof atlas.questions)[number];

const saveJson = () => {
  const blob = new Blob([JSON.stringify(atlas, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'neural-recovery-atlas-r6.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
};

function SourceLinks({ study }: { study: Study }) {
  return <div className="nr-source-links">
    <a href={study.url} target="_blank" rel="noopener noreferrer">Primary publication ↗</a>
    <a href={'https://doi.org/' + study.doi} target="_blank" rel="noopener noreferrer">DOI ↗</a>
    {study.correction && <a className="nr-correction-link" href={study.correction.url} target="_blank" rel="noopener noreferrer">Published correction ↗</a>}
  </div>;
}

function StudyDetail({ study }: { study: Study }) {
  return <article className="nr-detail" aria-live="polite">
    <div className="nr-detail-head"><div><div className="nr-kicker">{study.id} / {study.journal} / {study.year}</div><h4>{study.title}</h4><p>{study.authors} · {study.model}</p></div><span className="nr-tier">{study.tier}</span></div>
    <div className="nr-observation">
      <section><strong>What was observed</strong><p>{study.observed}</p></section>
      <section className="nr-notshown"><strong>What is NOT established</strong><p>{study.notShown}</p></section>
    </div>
    <div className="nr-context"><strong>Translation boundary</strong><p>{study.context}</p></div>
    {study.correction && <div className="nr-correction"><strong>Published corrigendum · {study.correction.date}</strong><p>{study.correction.summary}</p><span>DOI: {study.correction.doi}</span></div>}
    <div className="nr-tags">{study.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
    <details className="nr-disclosure"><summary>Provenance and disclosures</summary><p>{study.provenance}</p><p>{study.disclosure}</p></details>
    <SourceLinks study={study}/>
  </article>;
}

export default function NeuralRecoveryAtlas() {
  const [view, setView] = useState<View>('states');
  const [selectedStateId, setSelectedStateId] = useState('impaired');
  const [selectedStudyId, setSelectedStudyId] = useState('NR-002');
  const [selectedQuestionId, setSelectedQuestionId] = useState('NR-Q01');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All models');
  const state = atlas.states.find(s => s.id === selectedStateId) ?? atlas.states[0];
  const study = atlas.studies.find(s => s.id === selectedStudyId) ?? atlas.studies[0];
  const question = atlas.questions.find(q => q.id === selectedQuestionId) ?? atlas.questions[0];
  const visibleStudies = useMemo(() => atlas.studies.filter(s => {
    const words = [s.title, s.model, s.observed, s.notShown, ...s.tags].join(' ').toLowerCase();
    return (category === 'All models' || category === s.category) && words.includes(search.trim().toLowerCase());
  }), [search, category]);
  const sourceById = (id: string) => atlas.studies.find(s => s.id === id);
  const showStudy = (id: string) => { setSelectedStudyId(id); setView('studies'); };

  return <div className="nr">
    <section className="nr-hero">
      <div>
        <span className="nr-kicker"><span className="nr-spark"/> R6 / NEURAL RECOVERY ATLAS</span>
        <h3>What survives an injury?<br/><em>What might recover?</em></h3>
        <p>An evidence-led map of dopamine-neuron dysfunction, senescence-associated programs, inflammation and structural loss. We separate experiments in cells and animals from observations in living people.</p>
        <div className="nr-actions"><button onClick={() => setView('states')}>Explore cell states ↗</button><button className="nr-outline" onClick={saveJson}>Export research JSON ↓</button></div>
      </div>
      <div className="nr-orbit" aria-hidden="true"><div className="nr-ring r1"/><div className="nr-ring r2"/><div className="nr-ring r3"/><div className="nr-nucleus">◉</div><span className="nr-orbit-label one">SIGNAL</span><span className="nr-orbit-label two">FUNCTION</span><span className="nr-orbit-label three">STATE</span></div>
    </section>
    <div className="nr-metrics"><div><strong>{atlas.studies.length.toString().padStart(2, '0')}</strong><span>Primary studies</span></div><div><strong>{atlas.states.length.toString().padStart(2, '0')}</strong><span>Conceptual states</span></div><div><strong>{atlas.questions.length.toString().padStart(2, '0')}</strong><span>Testable questions</span></div><div><strong>00</strong><span>Human cures established</span></div></div>
    <div className="nr-warning" role="note"><strong>Read the boundary:</strong> These states are descriptive categories, not a predicted sequence, disease stages or proof that recovery is possible. Lower VMAT2 PET binding is <b>not</b> a count of neurons killed by a virus. Research only, not medical advice.</div>
    <nav className="nr-navigation" aria-label="Neural Recovery Atlas views">
      <button onClick={() => setView('states')} aria-pressed={view === 'states'} className={view === 'states' ? 'current' : ''}>01 / Cell states</button>
      <button onClick={() => setView('studies')} aria-pressed={view === 'studies'} className={view === 'studies' ? 'current' : ''}>02 / Evidence desk</button>
      <button onClick={() => setView('questions')} aria-pressed={view === 'questions'} className={view === 'questions' ? 'current' : ''}>03 / Open questions</button>
    </nav>
    {view === 'states' && <div className="nr-section">
      <div className="nr-section-heading"><div><div className="nr-kicker">STATE SPACE · CONCEPTUAL, NOT A TIME COURSE</div><h4>Separate function from survival.</h4><p>Tap a state to inspect possible readouts and what those readouts cannot prove.</p></div></div>
      <div className="nr-state-grid">{atlas.states.map((s, i) => <button key={s.id} className={'nr-state '+ (selectedStateId === s.id ? 'selected' : '')} onClick={() => setSelectedStateId(s.id)} aria-pressed={selectedStateId === s.id}><span className="nr-state-index">0{i+1} / {s.status}</span><span className="nr-state-symbol" aria-hidden="true">{i===0?'✳':i===1?'◉':i===2?'◎':'○'}</span><strong>{s.label}</strong><small>{s.description}</small></button>)}</div>
      <div className="nr-state-inspector"><div><div className="nr-kicker">SELECTED STATE</div><h4>{state.label}</h4><p>{state.description}</p><div className="nr-boundary"><strong>Interpretation boundary</strong><p>{state.boundary}</p></div></div><div><strong>Candidate readouts to review</strong><ul>{state.readouts.map(readout => <li key={readout}>{readout}</li>)}</ul></div></div>
      <div className="nr-section-heading nr-secondary-heading"><div><div className="nr-kicker">MARKER FIELD GUIDE</div><h4>Markers are evidence, not destiny.</h4></div></div>
      <div className="nr-marker-grid">{atlas.markers.map(m => <article key={m.id}><span className="nr-kicker">{m.id}</span><h5>{m.name}</h5><p>{m.role}</p><div className="nr-marker-boundary">{m.meaning}</div><div className="nr-pointer">{m.sourceIds.map(id => <button key={id} onClick={() => showStudy(id)}>{id} ↗</button>)}</div></article>)}</div>
    </div>}
    {view === 'studies' && <div className="nr-section">
      <div className="nr-section-heading"><div><div className="nr-kicker">EVIDENCE DESK</div><h4>Three studies. Different questions.</h4><p>Bench susceptibility, preclinical intervention and human observational PET are not interchangeable evidence.</p></div></div>
      <div className="nr-controls"><label>Find a mechanism or marker<input value={search} onChange={e => setSearch(e.target.value)} placeholder="VMAT2, dopamine, inflammation…" /></label><label>Research setting<select value={category} onChange={e => setCategory(e.target.value)}><option>All models</option><option>Cell / tissue</option><option>Human imaging</option></select></label></div>
      <div className="nr-study-layout"><div className="nr-study-list" aria-label="Source studies">{visibleStudies.map(s => <button key={s.id} onClick={() => setSelectedStudyId(s.id)} aria-pressed={selectedStudyId === s.id} className={selectedStudyId === s.id ? 'selected' : ''}><span>{s.id} · {s.year} · {s.tier}</span><strong>{s.title}</strong><small>{s.authors} / {s.journal}</small>{s.correction && <small className="nr-correction-pill">Corrigendum linked</small>}</button>)}{!visibleStudies.length && <p className="nr-empty">No studies match the filters.</p>}</div><div>{visibleStudies.length ? <StudyDetail study={visibleStudies.find(s => s.id === study.id) ?? visibleStudies[0]}/> : <div className="nr-detail"><p>Reset the filters to inspect a study.</p></div>}</div></div>
    </div>}
    {view === 'questions' && <div className="nr-section">
      <div className="nr-section-heading"><div><div className="nr-kicker">RESEARCH QUESTIONS / NOT EXPERIMENTAL PROTOCOLS</div><h4>Every idea needs a way to be wrong.</h4><p>Unproven hypotheses, possible counterevidence and alternative explanations remain visible.</p></div></div>
      <div className="nr-question-layout"><div className="nr-question-list">{atlas.questions.map(q => <button key={q.id} aria-pressed={selectedQuestionId === q.id} onClick={() => setSelectedQuestionId(q.id)} className={selectedQuestionId === q.id ? 'selected' : ''}><span>{q.id} · UNTESTED</span><strong>{q.title}</strong></button>)}</div><article className="nr-question-detail" aria-live="polite"><span className="nr-untested">{question.status.replaceAll('_', ' ')}</span><h4>{question.title}</h4><div className="nr-question-box"><strong>What would support it?</strong><p>{question.prediction}</p></div><div className="nr-question-box nr-counter"><strong>What could disconfirm it?</strong><p>{question.falsifier}</p></div><div className="nr-question-box"><strong>Alternative explanation</strong><p>{question.alternative}</p></div><div className="nr-question-box"><strong>Evidence still needed</strong><p>{question.evidenceNeeded}</p></div><div className="nr-boundary"><strong>Claim boundary</strong><p>{question.boundary}</p></div><div className="nr-linked"><strong>Linked primary studies</strong><div>{question.sourceIds.map(id => { const s=sourceById(id);return s ? <button key={id} onClick={() => showStudy(id)}>{id} · {s.authors} ↗</button> : null; })}</div></div></article></div>
    </div>}
    <div className="nr-endnote"><strong>Provenance matters.</strong> This curated R6 collection is not a systematic review. R6 hypotheses do not change the scientific status of the R0–R5 workbench. A published <a href="https://pubmed.ncbi.nlm.nih.gov/42700719/" target="_blank" rel="noopener noreferrer">September 2026 correction ↗</a> accompanies the long-COVID VMAT2 paper; inspect both sources before citing its exploratory analyses. No drug here is presented as a treatment for COVID or neurological symptoms.</div>
  </div>;
}
