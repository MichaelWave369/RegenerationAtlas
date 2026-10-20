import { useMemo, useState } from 'react';
import graph from './data/interactions.json';
import evidence from './data/evidence.json';
import './interaction-map.css';

type NodeItem = (typeof graph.nodes)[number];
type EdgeItem = (typeof graph.edges)[number];
type EvidenceClass = 'SOURCE_REPORTED' | 'PREPRINT_REPORTED' | 'HYPOTHESIS';
const lanes = [
  {name:'Retina',height:340,summary:'Müller glia reprogramming · Experimental mouse findings + an explicitly separated human-tissue preprint'},
  {name:'Optic nerve',height:280,summary:'Separate PTEN and SOCS3 restraints · Sustained axon growth shown in mouse studies'},
  {name:'Skin',height:245,summary:'Mechanical signaling · Mouse fibroblast identity and scar-lineage findings'},
  {name:'Skeletal muscle',height:245,summary:'Myostatin restraint · Human genetic observation, not a regenerative therapy'}
];
const labels: Record<EvidenceClass,string> = {
 SOURCE_REPORTED:'Peer-reviewed source',
 PREPRINT_REPORTED:'Preprint finding',
 HYPOTHESIS:'Research hypothesis'
};
const cards = new Map(evidence.map(item=>[item.id,item]));
const evidenceClasses: EvidenceClass[]=['SOURCE_REPORTED','PREPRINT_REPORTED','HYPOTHESIS'];
function statusClass(c:string){return c==='HYPOTHESIS'?'hypothesis':c==='PREPRINT_REPORTED'?'preprint':'reported';}
function saveJson(){
 const file=new Blob([JSON.stringify(graph,null,2)],{type:'application/json'});
 const objectUrl=URL.createObjectURL(file);
 const anchor=document.createElement('a');anchor.href=objectUrl;anchor.download='regeneration-interaction-map-r1.json';anchor.click();
 window.setTimeout(()=>URL.revokeObjectURL(objectUrl),700);
}
function NodeButton({node,selected,select}:{node:NodeItem,selected:boolean,select:(id:string)=>void}) {
 return <button type="button" className={'network-node '+node.kind+(selected?' selected':'')}
 style={{left:node.x,top:node.y}} aria-pressed={selected} onClick={()=>select(node.id)} title={node.summary}>
  <span className="network-node-label">{node.label}</span>
  <small>{node.kind==='protein'?'PROTEIN':node.kind==='hypothesis'?'UNTESTED':node.kind.toUpperCase()}</small>
 </button>;
}
function TissueLane({tissue,height,description,nodes,edges,selected,select}:{tissue:string,height:number,description:string,nodes:NodeItem[],edges:EdgeItem[],selected:string,select:(id:string)=>void}){
 const arrowId='map-arrow-'+tissue.replace(/[^a-z]/gi,'').toLowerCase();
 const dashedId='map-dashed-'+tissue.replace(/[^a-z]/gi,'').toLowerCase();
 const colorId='map-amber-'+tissue.replace(/[^a-z]/gi,'').toLowerCase();
 return <section className="network-lane">
  <div className="network-lane-header"><h3>{tissue}</h3><span>{description}</span></div>
  <div className="network-overflow" tabIndex={0} aria-label={tissue+' horizontally scrollable pathway map'}>
   <div className="network-canvas" style={{height}}>
    <svg viewBox={'0 0 980 '+height} width="980" height={height} aria-hidden="true" focusable="false">
     <defs>
      <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#6acbb8"/></marker>
      <marker id={dashedId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#e1b174"/></marker>
      <marker id={colorId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#92a0e4"/></marker>
     </defs>
     {edges.map(edge=>{
       const a=nodes.find(n=>n.id===edge.from),b=nodes.find(n=>n.id===edge.to);
       if(!a || !b) return null;
       const pathClass=statusClass(edge.classification);
       const highlighted=edge.from===selected||edge.to===selected;
       const endArrow=pathClass==='hypothesis'?dashedId:pathClass==='preprint'?colorId:arrowId;
       const endShift=95;
       return <line key={edge.id} className={'network-link '+pathClass+(highlighted?' highlighted':'')} x1={a.x+endShift} y1={a.y} x2={b.x-endShift} y2={b.y} markerEnd={'url(#'+endArrow+')'}/>;
     })}
    </svg>
    {nodes.map(node=><NodeButton key={node.id} node={node} selected={selected===node.id} select={select}/>)}
   </div>
  </div>
 </section>;
}
export default function InteractionMap(){
 const [tissue,setTissue]=useState('All');
 const [statuses,setStatuses]=useState<EvidenceClass[]>(['SOURCE_REPORTED']);
 const [selectedId,setSelectedId]=useState('PROX1');
 const edges=useMemo(()=>graph.edges.filter(edge=>(tissue==='All'||tissue===edge.tissue)&&statuses.includes(edge.classification as EvidenceClass)),[tissue,statuses]);
 const activeIds=useMemo(()=>new Set(edges.flatMap(edge=>[edge.from,edge.to])),[edges]);
 const nodes=useMemo(()=>graph.nodes.filter(node=>activeIds.has(node.id)),[activeIds]);
 const activeNode=nodes.find(node=>node.id===selectedId) ?? nodes[0];
 const connected=activeNode?edges.filter(edge=>edge.from===activeNode.id||edge.to===activeNode.id):[];
 const toggle=(state:EvidenceClass)=>setStatuses(prev=>prev.includes(state)?prev.filter(x=>x!==state):[...prev,state]);
 const activeLanes=lanes.filter(lane=>(tissue==='All'||lane.name===tissue)&&nodes.some(n=>n.tissue===lane.name));
 return <div className="network-view">
  <div className="network-banner">
   <div><span className="network-overline">R1 / CAUSAL-PROVENANCE EXPLORER</span><h3>Molecular interaction map</h3><p>Follow experimentally reported regulation and distinguish it from untested research questions. <strong>Arrows indicate curated pathway relationships, not necessarily direct physical protein binding.</strong></p></div>
   <button className="network-export" onClick={saveJson}>Export graph JSON ↓</button>
  </div>
  <div className="network-filterbar">
   <div className="network-filtergroup"><span className="network-filterlabel">TISSUE</span><div className="network-pills">{['All',...lanes.map(l=>l.name)].map(name=><button type="button" key={name} aria-pressed={tissue===name} className={tissue===name?'on':''} onClick={()=>setTissue(name)}>{name}</button>)}</div></div>
   <fieldset className="network-filtergroup network-evidence"><legend>SHOW EVIDENCE</legend>
   {evidenceClasses.map(item=><label key={item} className={statusClass(item)}><input type="checkbox" checked={statuses.includes(item)} onChange={()=>toggle(item)}/><span>{labels[item]}</span></label>)}
   </fieldset>
  </div>
  <div className="network-legend"><span><i className="legend-line reported"/> Source-reported</span><span><i className="legend-line preprint"/> Unreviewed preprint</span><span><i className="legend-line hypothesis"/> Untested hypothesis</span><span className="network-legend-note">Select any node to inspect linked source records.</span></div>
  <div className="network-layout">
   <div className="network-lanes">{activeLanes.map(lane=><TissueLane key={lane.name} tissue={lane.name} height={lane.height} description={lane.summary} nodes={nodes.filter(n=>n.tissue===lane.name)} edges={edges.filter(e=>e.tissue===lane.name)} selected={activeNode?.id??''} select={setSelectedId}/>)}{activeLanes.length===0&&<div className="network-empty">No relationships match these filters. Re-enable a source category or select another tissue.</div>}</div>
   <aside className="network-inspector" aria-live="polite">
    {activeNode?<><div className="network-inspector-head"><span>SELECTED NODE · {activeNode.kind.toUpperCase()}</span><h3>{activeNode.label}</h3><div className="network-tissue">{activeNode.tissue}</div></div>
     <p>{activeNode.summary}</p><div className="network-warning"><strong>Boundary of evidence</strong><p>{activeNode.boundary}</p></div>
     <h4>Linked relationships <small>({connected.length})</small></h4>
     {connected.map(edge=><article className="network-edge-card" key={edge.id}>
      <div className="network-edge-top"><span>{edge.id}</span><span className={'network-status '+statusClass(edge.classification)}>{labels[edge.classification as EvidenceClass]}</span></div>
      <strong>{graph.nodes.find(n=>n.id===edge.from)?.label} → {graph.nodes.find(n=>n.id===edge.to)?.label}</strong>
      <div className="network-relation">{edge.relation}</div>
      <p>{edge.finding}</p><small>Model: {edge.model}</small>
      <div className="network-edge-limit"><strong>Not established:</strong> {edge.limit}</div>
      <div className="network-citations">{edge.sourceRecordIds.map(id=>{const source=cards.get(id);return source?<a key={id} href={source.url} target="_blank" rel="noopener noreferrer">{id} · source ↗</a>:null;})}</div>
     </article>)}
     </>:<div className="network-empty">Select a tissue and evidence category to inspect an interaction.</div>}
   </aside>
  </div>
  <div className="network-footnote">This is an evidence navigation tool, not a biochemical simulation, drug-target ranking, or clinical advice. Source-reported means described in the linked study, not independently replicated or proven in humans. Relationships are tissue- and model-specific.</div>
 </div>;
}
