const DATA=window.CURRICULUM_DATA||[];
const YEARS=['Foundation','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'];
const SUBJECT_ORDER=['English','Mathematics','Science','HASS','HPE','Design and Technologies','Digital Technologies','Dance','Drama','Media Arts','Music','Visual Arts'];
// Show every learning area available for integrated planning, even while its curriculum dataset is being verified.
const SUBJECTS=[...SUBJECT_ORDER];
const state={years:[],subjects:[],standards:new Set(),needs:[]};
const SCHOOL_PLAN={
  'Term 1':{english:{'Foundation':'Imaginative text — retells','Year 1':'Imaginative text — retells','Year 2':'Imaginative text','Year 3':'Imaginative text','Year 4':'Imaginative text','Year 5':'Imaginative text','Year 6':'Imaginative text'},context:'HASS — History',contextSubject:'HASS',technology:'Digital Technologies',technologyNote:'Build towards Digital Technologies assessment in Term 2',arts:'Drama',hpe:'HPE — Health (summative)'},
  'Term 2':{english:{'Foundation':'Information report','Year 1':'Information report','Year 2':'Information report','Year 3':'Information report','Year 4':'Information report','Year 5':'Information report','Year 6':'Information report'},context:'Science — Biological sciences / Earth and space sciences',contextSubject:'Science',technology:'Digital Technologies',technologyNote:'Assessed this term',arts:'Visual Arts / Music',hpe:'HPE — Health and Physical (summative)'},
  'Term 3':{english:{'Foundation':'Persuasive (summative) + Procedural (formative)','Year 1':'Persuasive (summative) + Procedural (formative)','Year 2':'Persuasive (summative) + Procedural (formative)','Year 3':'Persuasive (summative) + Procedural (formative)','Year 4':'Persuasive (summative) + Procedural (formative)','Year 5':'Persuasive (summative) + Procedural (formative)','Year 6':'Persuasive (summative) + Procedural (formative)'},context:'Science — Chemical sciences / Physical sciences',contextSubject:'Science',technology:'Design and Technologies',technologyNote:'Assessed this term',arts:'Media Arts — possible English integration',hpe:'HPE — Health (summative)'},
  'Term 4':{english:{'Foundation':'Imaginative text — recounts (summative) + Narrative (formative)','Year 1':'Imaginative text — recounts (summative) + Narrative (formative)','Year 2':'Imaginative text — narrative','Year 3':'Imaginative text — narrative','Year 4':'Imaginative text — narrative','Year 5':'Imaginative text — narrative','Year 6':'Imaginative text — narrative'},context:'HASS — Geography',contextSubject:'HASS',technology:'',technologyNote:'',arts:'Dance',hpe:'HPE — Physical (summative)'}
};
function schoolPlanForSelection(){return SCHOOL_PLAN[$('term').value]||SCHOOL_PLAN['Term 1'];}
function renderSchoolPlan(){
  const box=$('schoolPlanSuggestions'); if(!box)return; const plan=schoolPlanForSelection();
  const genres=state.years.length?[...new Set(state.years.map(y=>plan.english[y]).filter(Boolean))]:['Select year level(s) to show the English genre'];
  const multi=state.years.length?state.years.map(y=>`<div><strong>${escapeHtml(y)}</strong><span>${escapeHtml(plan.english[y]||'Refer to year plan')}</span></div>`).join(''):`<div><strong>English</strong><span>Select year level(s)</span></div>`;
  box.innerHTML=`<div class="school-plan-item school-plan-english"><strong>English writing focus</strong><div class="year-genre-list">${multi}</div></div><div class="school-plan-item"><strong>Knowledge / context</strong><span>${escapeHtml(plan.context)}</span><small>1 × 80-minute dedicated session weekly, with additional content integrated through English.</small></div><div class="school-plan-item"><strong>Technologies</strong><span>${escapeHtml(plan.technology||'No whole-school assessed Technologies focus specified')}</span>${plan.technologyNote?`<small>${escapeHtml(plan.technologyNote)}</small>`:''}</div><div class="school-plan-item"><strong>Possible Arts connection</strong><span>${escapeHtml(plan.arts)}</span><small>Use only where the Arts Achievement Standard is explicitly taught/evidenced.</small></div><div class="school-plan-item"><strong>HPE</strong><span>${escapeHtml(plan.hpe)}</span></div><div class="school-plan-item"><strong>Planning principle</strong><span>English + ${escapeHtml(plan.contextSubject)} as the core integrated unit</span><small>Technologies and Arts can be connected where authentic; suggestions do not automatically equal curriculum coverage.</small></div>`;
}
function setSubjectSelected(subject,on=true){const i=SUBJECTS.indexOf(subject);if(i<0)return;const has=state.subjects.includes(subject);if(on&&!has)state.subjects.push(subject);if(!on&&has)state.subjects.splice(state.subjects.indexOf(subject),1);const b=document.querySelectorAll('#subjectChoices .chip')[i];if(b)b.classList.toggle('selected',on);}
function applySchoolPlan(){const p=schoolPlanForSelection();['English',p.contextSubject].forEach(x=>setSubjectSelected(x,true));if(p.technology)setSubjectSelected(p.technology,true);renderCurriculum();renderAllocations();$('schoolPlanSuggestions').insertAdjacentHTML('beforeend','<div class="school-plan-applied">Suggested learning areas applied. You can add or remove any subject below.</div>');}

const $=id=>document.getElementById(id);

function chips(container,items,stateKey,labelFn=x=>x){container.innerHTML='';items.forEach(item=>{const b=document.createElement('button');b.className='chip';b.type='button';b.textContent=labelFn(item);b.onclick=()=>{const arr=state[stateKey];const i=arr.indexOf(item);i>=0?arr.splice(i,1):arr.push(item);b.classList.toggle('selected'); if(stateKey==='years'||stateKey==='subjects'){renderCurriculum(); if(stateKey==='subjects') renderAllocations(); if(stateKey==='years'){renderSchoolPlan();renderAssessmentYearBuilder();}}};container.appendChild(b);});}
chips($('yearChoices'),YEARS,'years');
chips($('subjectChoices'),SUBJECTS,'subjects');
$('term').addEventListener('change',renderSchoolPlan);
$('applySchoolPlan').onclick=applySchoolPlan;
renderSchoolPlan();
const needs=['Reading access','Writing support','Numeracy','Working memory','Vocabulary / language','EAL/D','Attention / executive function','Extension'];
chips($('needChoices'),needs,'needs');
$('dataStatus').textContent=`${DATA.filter(x=>x.type==='achievement_standard'&&x.text).length} V9.0 Achievement Standard aspects loaded`;

function gradesForYear(year){
  const n=Number((year.match(/\d+/)||[])[0]);
  const vals=[year];
  if(n===1||n===2) vals.push('Years 1–2');
  if(n===3||n===4) vals.push('Years 3–4');
  if(n===5||n===6) vals.push('Years 5–6');
  return vals;
}
function curriculumArea(row){
  if(row.area) return row.area;
  const t=(row.text||'').toLowerCase();
  const s=row.subject;
  if(s==='English'){
    if(/spoken|listen|speaking|voice|interact with others|oral/.test(t)) return 'Speaking & Listening';
    if(/create written|write |spell|handwrit|paragraph|sentence|punctuation/.test(t)) return 'Writing & Creating';
    if(/read|view|comprehend|text structures|visual features|ideas are (presented|developed)|characters|settings|events/.test(t)) return 'Reading & Viewing';
    return 'Language';
  }
  if(s==='Mathematics'){
    if(/probab|chance|likelihood/.test(t)) return 'Probability';
    if(/statistic|data|survey|graph|chart/.test(t)) return 'Statistics';
    if(/shape|space|location|position|map|angle|symmetr|transform|grid/.test(t)) return 'Space';
    if(/measure|length|mass|capacity|area|perimeter|time|duration|temperature/.test(t)) return 'Measurement';
    if(/pattern|algebra|equival|function|unknown|algorithm/.test(t)) return 'Algebra';
    return 'Number';
  }
  if(s==='Science'){
    if(/living|life cycle|habitat|plant|animal|ecosystem|survival|biological/.test(t)) return 'Life & Living';
    if(/material|solid|liquid|gas|change of state|mixture|property/.test(t)) return 'Material World';
    if(/force|motion|energy|heat|light|sound|electric/.test(t)) return 'Physical World';
    if(/earth|space|sun|moon|planet|weather|season|landscape|geolog/.test(t)) return 'Earth & Space';
    if(/question|investigat|observe|measure|data|evidence|predict|conclusion|communicat|represent|fair test/.test(t)) return 'Science Inquiry';
    return 'Science as a Human Endeavour';
  }
  if(s==='HASS'){
    if(/history|histor|past|present|continuity|change|significance|commemor|first fleet|colon|migration/.test(t)) return 'History';
    if(/geograph|place|environment|location|map|spatial|climate|natural|sustainab/.test(t)) return 'Geography';
    if(/civic|citizen|government|democra|law|rules|decision-making|community participation/.test(t)) return 'Civics & Citizenship';
    if(/economic|business|consumer|producer|resource|scarcity|needs and wants|financial/.test(t)) return 'Economics & Business';
    return 'HASS Inquiry & Skills';
  }
  if(s==='HPE'){
    if(/movement|physical|motor|game|sport|fitness|active|locomotor|skill/.test(t)) return 'Physical Activity & Movement';
    return 'Health & Wellbeing';
  }
  if(s==='Design and Technologies') return /design|create|produce|evaluate|plan|process/.test(t)?'Creating Designed Solutions':'Knowledge & Understanding';
  if(s==='Digital Technologies') return /create|design|algorithm|implement|evaluate|solution/.test(t)?'Creating Digital Solutions':(/data/.test(t)?'Data':'Digital Systems');
  if(['Dance','Drama','Media Arts','Music','Visual Arts'].includes(s)) return /create|make|perform|present|produce/.test(t)?'Skills':'Knowledge & Understanding';
  return 'Achievement Standard';
}
const AREA_ORDER={
  'English':['Reading & Viewing','Writing & Creating','Speaking & Listening','Language'],
  'Mathematics':['Number','Algebra','Measurement','Space','Statistics','Probability'],
  'Science':['Life & Living','Material World','Physical World','Earth & Space','Science Inquiry','Science as a Human Endeavour'],
  'HASS':['History','Geography','Civics & Citizenship','Economics & Business','HASS Inquiry & Skills'],
  'HPE':['Health & Wellbeing','Physical Activity & Movement'],
  'Dance':['Knowledge & Understanding','Skills'],
  'Drama':['Knowledge & Understanding','Skills'],
  'Media Arts':['Knowledge & Understanding','Skills'],
  'Music':['Knowledge & Understanding','Skills'],
  'Visual Arts':['Knowledge & Understanding','Skills']
};
function relatedContent(aspect,area){
  const accepted=gradesForYear(aspect.grade);
  if(!accepted.includes(aspect.grade)) accepted.push(aspect.grade);
  return DATA.filter(d=>d.subject===aspect.subject&&d.type==='content_description'&&accepted.includes(d.grade)&&curriculumArea(d)===area).slice(0,18);
}
function curriculumReferenceHtml(subject){
  const aspects=selectedRows().filter(r=>r.subject===subject);
  if(!aspects.length) return `<div class="empty">No ${escapeHtml(subject)} Achievement Standard aspects have been selected yet.</div>`;
  const byArea=aspects.reduce((a,r)=>{const area=curriculumArea(r);(a[area]??=[]).push(r);return a;},{});
  return Object.entries(byArea).map(([area,rows])=>{const grades=[...new Set(rows.map(r=>r.grade))];const refs=DATA.filter(d=>d.subject===subject&&d.type==='content_description'&&grades.some(g=>gradesForYear(g).includes(d.grade)||d.grade===g)&&curriculumArea(d)===area).slice(0,24);return `<section class="modal-ref-section"><h3>${escapeHtml(area)}</h3><div class="selected-aspects"><strong>Selected Achievement Standard aspect${rows.length===1?'':'s'}</strong>${rows.map(r=>`<p>• ${escapeHtml(r.text)}</p>`).join('')}</div>${refs.length?`<details open><summary>V9 content descriptions to refer to when planning lessons</summary><div class="content-ref-list">${refs.map(x=>`<div><code>${escapeHtml(x.code)}</code><p>${escapeHtml(x.text)}</p></div>`).join('')}</div></details>`:'<p class="helper">No reference content descriptions are loaded for this area in the current dataset.</p>'}</section>`;}).join('');
}
function openCurriculumReference(subject){$('referenceTitle').textContent=`${subject} curriculum reference`;$('referenceBody').innerHTML=curriculumReferenceHtml(subject);$('referenceModal').classList.add('open');$('referenceModal').setAttribute('aria-hidden','false');}
function closeCurriculumReference(){$('referenceModal').classList.remove('open');$('referenceModal').setAttribute('aria-hidden','true');}
function renderCurriculum(){
  const wrap=$('curriculumCards');wrap.innerHTML='';
  if(!state.years.length||!state.subjects.length){wrap.innerHTML='<div class="empty">Select at least one year level and one learning area in Unit Setup.</div>';return;}
  state.subjects.forEach(subject=>state.years.forEach(year=>{
    const accepted=gradesForYear(year);
    const rows=DATA.filter(d=>d.subject===subject&&accepted.includes(d.grade)&&d.type==='achievement_standard'&&d.text);
    const uniqueBand=[...new Set(rows.map(r=>r.grade))].join(', ');
    const card=document.createElement('div');card.className='curr-card';
    card.innerHTML=`<div class="curr-head"><strong>${subject} — ${year}</strong><span>${rows.length} Achievement Standard aspects${uniqueBand&&uniqueBand!==year?` • official band: ${uniqueBand}`:''}</span></div>`;
    const list=document.createElement('div');list.className='standard-list strand-list';
    if(!rows.length){list.innerHTML='<div class="empty">Achievement Standard aspects for this learning area are not yet loaded in this build.</div>';}
    const groups=rows.reduce((a,r)=>{const area=curriculumArea(r);(a[area]??=[]).push(r);return a;},{});
    const order=AREA_ORDER[subject]||Object.keys(groups);
    [...order,...Object.keys(groups).filter(x=>!order.includes(x))].filter(area=>groups[area]?.length).forEach((area,idx)=>{
      const details=document.createElement('details');details.className='strand-group';details.open=idx===0;
      details.innerHTML=`<summary><span>${area}</span><small>${groups[area].length} aspect${groups[area].length===1?'':'s'}</small></summary>`;
      const opts=document.createElement('div');opts.className='strand-options';
      groups[area].forEach(r=>{const item=document.createElement('div');item.className='standard-item';const lab=document.createElement('label');lab.className='standard-option';lab.innerHTML=`<input type="checkbox" ${state.standards.has(r.code)?'checked':''}><span>${escapeHtml(r.text)}</span>`;lab.querySelector('input').onchange=e=>{e.target.checked?state.standards.add(r.code):state.standards.delete(r.code);refreshCognitive();};item.appendChild(lab);const refs=relatedContent(r,area);if(refs.length){const ref=document.createElement('details');ref.className='content-ref';ref.innerHTML=`<summary>View related V9 content descriptions <span>${refs.length}</span></summary><div class="content-ref-list">${refs.map(x=>`<div><code>${escapeHtml(x.code)}</code><p>${escapeHtml(x.text)}</p></div>`).join('')}</div>`;item.appendChild(ref);}opts.appendChild(item);});
      details.appendChild(opts);list.appendChild(details);
    });
    card.appendChild(list);wrap.appendChild(card);
  }));refreshCognitive();
}
renderCurriculum();

function selectedRows(){return DATA.filter(d=>d.type==='achievement_standard'&&state.standards.has(d.code));}
function escapeHtml(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
const verbs=['identify','describe','explain','compare','classify','construct','create','analyse','analyze','interpret','justify','evaluate','investigate','represent','apply','use','recognise','recognize','sequence','organise','organize','share','relate','predict','pose','plan','demonstrate'];
function cognitive(){const found=[];selectedRows().forEach(r=>{const first=r.text.toLowerCase().split(/\s+/).slice(0,4).join(' ');verbs.forEach(v=>{if(first.includes(v)&&!found.includes(v))found.push(v);});});return found;}
function refreshCognitive(){$('cognitiveDemand').innerHTML=cognitive().map(v=>`<span class="tag">${v}</span>`).join('');}

$('suggestLinks').onclick=()=>{const rows=selectedRows();if(rows.length<2){$('integrationSuggestions').innerHTML='Select at least two curriculum aspects first.';return;}const bySub=Object.groupBy?Object.groupBy(rows,r=>r.subject):rows.reduce((a,r)=>((a[r.subject]??=[]).push(r),a),{});const names=Object.keys(bySub);$('integrationSuggestions').innerHTML=`<strong>Possible planning lens:</strong> Look for a shared concept or product that allows ${names.join(', ')} to contribute authentic evidence. Keep each selected aspect visible so integration does not reduce the curriculum demand.`;document.querySelector('[data-target="integration"]').click();};
$('integrationSuggest').onclick=()=>{const rows=selectedRows();const kws=[...new Set(rows.flatMap(r=>(r.keywords||'').split(',').map(x=>x.trim()).filter(Boolean)))].slice(0,12);const subs=[...new Set(rows.map(r=>r.subject))];$('integrationSuggestions').innerHTML=`<strong>Suggestions to consider</strong><br>• Possible shared terminology: ${kws.join(', ')||'identify terminology from the selected aspects'}.<br>• Consider one authentic product or investigation where ${subs.join(' + ')} each provide assessable evidence.<br>• Note explicitly which learning must still be taught discretely.`;};
function assessmentRowsByYear(){const rows=selectedRows();const out={};state.years.forEach(y=>{const grades=gradesForYear(y);out[y]=rows.filter(r=>grades.includes(r.grade));});return out;}
let activeAssessmentYear='';
const assessmentYearDrafts={};
const builtAssessmentDrafts={};
const assessmentYearMeta={};
const completedAssessmentYears=new Set();
const ASSESSMENT_META_IDS=['assessmentTitle','assessmentTechnique','assessmentPurpose','assessmentContext','assessmentTask','assessmentConditions','gtmjNotes'];
function eligibleAssessmentYears(){
  // Prefer the actual Unit Setup selections. This is intentionally recovered from more
  // than one source because older saved planner versions did not always restore state.years
  // before Step 4 rendered.
  const uiYears=[...document.querySelectorAll('#yearChoices .chip.selected')].map(b=>b.textContent.trim()).filter(y=>YEARS.includes(y));
  if(uiYears.length){
    // Keep application state in sync with the visible Unit Setup selection.
    state.years.splice(0,state.years.length,...uiYears);
    return YEARS.filter(y=>uiYears.includes(y));
  }
  if(state.years.length)return YEARS.filter(y=>state.years.includes(y));

  // Recovery path for older browser saves: exact year-level Achievement Standard rows
  // tell us which cohorts are already represented in the selected curriculum.
  const exactYears=new Set(selectedRows().map(r=>r.grade).filter(g=>YEARS.includes(g)));
  return YEARS.filter(y=>exactYears.has(y));
}
function ensureActiveAssessmentYear(preferred=''){
  const years=eligibleAssessmentYears();
  if(preferred&&years.includes(preferred))activeAssessmentYear=preferred;
  else if(activeAssessmentYear&&!years.includes(activeAssessmentYear))activeAssessmentYear='';
  return activeAssessmentYear;
}
function rowsForAssessmentYear(year=activeAssessmentYear){const grouped=assessmentRowsByYear();return grouped[year]||[];}
function saveAssessmentYearMeta(){
  if(!activeAssessmentYear)return;
  assessmentYearMeta[activeAssessmentYear]=Object.fromEntries(ASSESSMENT_META_IDS.map(id=>[id,$(id)?.value||'']));
}
function loadAssessmentYearMeta(year,copyFrom=''){
  let meta=assessmentYearMeta[year];
  if(!meta&&copyFrom&&assessmentYearMeta[copyFrom]){
    const src=assessmentYearMeta[copyFrom];
    meta={...src,assessmentTitle:src.assessmentTitle?`${src.assessmentTitle} — ${year}`:'',assessmentTask:'',gtmjNotes:''};
  }
  ASSESSMENT_META_IDS.forEach(id=>{const el=$(id);if(el)el.value=meta?.[id]||'';});
}
function saveAssessmentYearDraft(){
  if(!activeAssessmentYear)return;
  assessmentYearDrafts[activeAssessmentYear]=[...document.querySelectorAll('.evidence-component')].map(c=>({text:c.querySelector('.component-text')?.value||'',format:c.querySelector('.evidence-format')?.value||'',codes:[...c.querySelectorAll('input[data-aspect]:checked')].map(x=>x.dataset.aspect)}));
  saveAssessmentYearMeta();
}
function loadAssessmentYearDraft(year,copyFrom=''){
  const map=$('evidenceMap');if(!map)return;
  year=ensureActiveAssessmentYear(year);map.innerHTML='';evidenceComponentCount=0;
  if(!year){map.innerHTML='<div class="empty">Choose the year level you want to assess first. Only that year level\'s Achievement Standard aspects will be shown.</div>';return;}
  let draft=assessmentYearDrafts[year];
  if(!draft&&copyFrom&&assessmentYearDrafts[copyFrom])draft=assessmentYearDrafts[copyFrom].map(x=>({text:x.text,format:x.format,codes:[]}));
  if(draft?.length){draft.forEach(x=>addEvidenceComponent(x.text,x));}else addEvidenceComponent();
  refreshComponentAspectLists();
}
function beginAssessmentYear(year,{copyFrom=''}={}){
  if(activeAssessmentYear)saveAssessmentYearDraft();
  activeAssessmentYear=year;
  if(copyFrom&&!assessmentYearDrafts[year]&&assessmentYearDrafts[copyFrom])assessmentYearDrafts[year]=assessmentYearDrafts[copyFrom].map(x=>({text:x.text,format:x.format,codes:[]}));
  renderAssessmentYearBuilder();
  renderAssessmentAlignment();
  loadAssessmentYearMeta(year,copyFrom);
  loadAssessmentYearDraft(year);
  if($('draftAssessment'))$('draftAssessment').innerHTML='<div class="empty">Map this year level\'s evidence above, then select <strong>Build draft assessment</strong>.</div>';
  assessmentQuality();
}
function renderAssessmentYearBuilder(){
  const box=$('assessmentYearBuilder'), sel=$('assessmentYearSelect'), status=$('assessmentYearStatus');
  if(!box||!sel||!status)return;
  const years=eligibleAssessmentYears();
  const previous=sel.value;
  sel.innerHTML='<option value="">Choose year level…</option>'+years.map(y=>`<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join('');
  if(activeAssessmentYear&&years.includes(activeAssessmentYear))sel.value=activeAssessmentYear;
  else if(previous&&years.includes(previous))sel.value=previous;
  else sel.value='';
  if(!years.length){activeAssessmentYear='';status.innerHTML='Select the year levels for this unit in Step 1 first.';sel.disabled=true;return;}
  sel.disabled=false;
  status.innerHTML=activeAssessmentYear ? `Current assessment: <strong>${escapeHtml(activeAssessmentYear)}</strong>. Build this assessment, then choose another year level to create its separate assessment.` : 'No assessment has been started yet. Choose the year level you want to focus on first.';
}
function handleAssessmentYearSelection(year,copyFrom=''){
  if(activeAssessmentYear)saveAssessmentYearDraft();
  if(!year){activeAssessmentYear='';renderAssessmentYearBuilder();renderAssessmentAlignment();renderTaskDirections();loadAssessmentYearDraft('');assessmentQuality();return;}
  beginAssessmentYear(year,{copyFrom});renderTaskDirections();
}

const VERB_SUPPORT={
 identify:{meaning:'recognise, select or name the required information; an extended explanation is not automatically required',evidence:['tick/select the correct option','match or sort items','label a diagram/image','draw linking lines or arrows','name or highlight the relevant feature']},
 recognise:{meaning:'identify something as known, relevant or belonging to a category',evidence:['select/highlight','match','sort/classify','label','brief oral response']},
 describe:{meaning:'give characteristics, features or relevant details',evidence:['short written or oral description','annotated diagram/image','labelled example with details','table of features','recorded explanation']},
 explain:{meaning:'make how, why, cause, effect or relationships clear',evidence:['short how/why response','cause-and-effect diagram plus explanation','annotated model plus oral explanation','recorded explanation','conference response']},
 compare:{meaning:'identify relevant similarities and differences',evidence:['Venn diagram','comparison table','sorting with similarities/differences','oral comparison','short comparative response']},
 classify:{meaning:'group according to relevant characteristics or criteria',evidence:['sorting task','classification key/table','drag-and-drop grouping','labelled groups with criteria']},
 analyse:{meaning:'examine information to identify relationships, patterns, components or meaning',evidence:['interpret a source/data set','annotate evidence and relationships','identify patterns and explain what they show','source analysis table']},
 interpret:{meaning:'make meaning from information, data, text, representation or evidence',evidence:['respond to a source/data display','annotate what information shows','translate between representations','brief inference with evidence']},
 evaluate:{meaning:'make a judgement using evidence and/or criteria',evidence:['rate against criteria and justify','select the strongest option and justify','recommend with evidence','evaluation table plus conclusion']},
 justify:{meaning:'give reasons or evidence that support a decision, opinion or conclusion',evidence:['claim + evidence/reason','oral justification','select and defend an option','annotated evidence supporting a decision']},
 create:{meaning:'produce a text, product, performance or representation for the required purpose/audience',evidence:['written/spoken/multimodal text','designed product','performance','digital product','portfolio artefact']},
 construct:{meaning:'make or assemble a representation, solution, text or product using required conventions/processes',evidence:['model/product','diagram/representation','media work','constructed response']},
 demonstrate:{meaning:'show the skill, process or behaviour in action',evidence:['observed demonstration','performance','practical task','teacher observation/checklist','video evidence']},
 apply:{meaning:'use knowledge, skills, rules or strategies in a situation',evidence:['practical application','worked example','scenario response','performance','apply to a new example']},
 use:{meaning:'apply the named knowledge, feature, convention, process or skill appropriately',evidence:['authentic product/performance','annotated example','observed application','short task using the required feature']},
 develop:{meaning:'formulate, build or refine the required idea, question, plan or response',evidence:['planning artefact','draft/refinement','question set','design proposal','documented process']},
 propose:{meaning:'put forward a considered action, response, solution or idea',evidence:['recommendation','action proposal','design idea','select an option and give rationale']},
 select:{meaning:'choose relevant information, ideas, features or options for a stated purpose',evidence:['selection/highlighting','curated evidence','choose from options','annotated selection showing relevance']},
 organise:{meaning:'arrange information or ideas in a purposeful structure',evidence:['table/timeline/category sort','structured notes','sequenced information','organised presentation']},
 represent:{meaning:'show information, ideas or relationships in an appropriate form',evidence:['diagram/model','graph/table','map/timeline','visual or digital representation']},
 investigate:{meaning:'systematically inquire, gather evidence and use it to address a question',evidence:['investigation record','observations/data','inquiry product','practical investigation']},
 plan:{meaning:'decide and sequence actions, methods or processes before carrying them out',evidence:['plan/method','flowchart','design plan','sequence of steps']},
 perform:{meaning:'present or enact the required skills/work for an audience or setting',evidence:['live performance','recorded performance','observed demonstration']},
 communicate:{meaning:'convey ideas, findings or meaning using appropriate forms and conventions',evidence:['oral presentation','written/multimodal product','visual communication','recorded explanation']},
 group:{meaning:'bring related ideas or information together in a purposeful way',evidence:['group related ideas','sort information into categories','organised paragraph or section']},
 sequence:{meaning:'place ideas, events or steps in a logical or required order',evidence:['order cards/events','timeline','sequenced steps','logically ordered text']},
 link:{meaning:'make relationships or connections between ideas clear',evidence:['draw linking lines/arrows','use cohesive links in a text','relationship map','brief linked explanation']},
 locate:{meaning:'find relevant information in a source or set of sources',evidence:['highlight or select relevant information','source scavenger task','record located information in a table']},
 collect:{meaning:'gather relevant information or data for a purpose',evidence:['source notes','data collection table','observation record']},
 infer:{meaning:'use stated information and clues to work out meaning that is not directly stated',evidence:['brief inference with supporting clue/evidence','annotated text/image','oral inference']},
 summarise:{meaning:'state the main ideas concisely without unnecessary detail',evidence:['brief summary','main-idea notes','oral summary']}
};
const COGNITIVE_ORDER=['evaluate','analyse','analyze','justify','explain','compare','classify','interpret','investigate','construct','create','develop','propose','represent','demonstrate','perform','apply','use','select','organise','organize','identify','recognise','recognize','describe','communicate','plan','group','sequence','link','locate','collect','infer','summarise'];
function verbForAspect(text=''){const low=text.toLowerCase();for(const v of COGNITIVE_ORDER){if(new RegExp(`\\b${v}\\w*\\b`,'i').test(low))return v==='analyze'?'analyse':v==='recognize'?'recognise':v==='organize'?'organise':v;}return ''}
function verbSupport(text){const v=verbForAspect(text);return {verb:v,...(VERB_SUPPORT[v]||{meaning:'demonstrate the selected curriculum demand',evidence:['teacher-selected authentic evidence']})};}
function highlightVerb(text){const v=verbForAspect(text);if(!v)return escapeHtml(text);const re=new RegExp(`\\b(${v}(?:s|d|ed|ing)?|${v==='analyse'?'analy[sz](?:e|es|ed|ing)':v==='recognise'?'recogni[sz](?:e|es|ed|ing)':v==='organise'?'organi[sz](?:e|es|ed|ing)':''})\\b`,'i');return escapeHtml(text).replace(re,'<mark class="cognitive-verb">$1</mark>');}
function renderAssessmentAlignment(){const box=$('assessmentAlignment');if(!box)return;const rows=rowsForAssessmentYear();if(!activeAssessmentYear||!rows.length){box.innerHTML='<div class="empty">Choose an assessment year level above. If no aspects then appear, return to Step 2 and select Achievement Standard aspects for that year level.</div>';return;}box.innerHTML=`<div class="assessment-year"><h3>${escapeHtml(activeAssessmentYear)} — cognitive demand & evidence</h3>${rows.map(r=>{const sup=verbSupport(r.text);return `<div class="evidence-row cognitive-row"><div><strong>${escapeHtml(r.subject)}</strong><span>${escapeHtml(curriculumArea(r))}</span>${sup.verb?`<b class="verb-pill">${escapeHtml(sup.verb)}</b>`:''}</div><div><p>${highlightVerb(r.text)}</p><div class="verb-explain"><strong>${escapeHtml((sup.verb||'Evidence').toUpperCase())}</strong> — ${escapeHtml(sup.meaning)}.</div><div class="evidence-options"><strong>Efficient evidence options:</strong> ${sup.evidence.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></div><label>Evidence in this task<input class="evidence-input" data-code="${escapeHtml(r.code)}" placeholder="Where/how will students demonstrate this?"></label></div>`}).join('')}</div>`;}
function taskDirectionIdeas(){const rows=selectedRows(), subs=[...new Set(rows.map(r=>r.subject))], term=field('term'), genre=[...new Set(state.years.map(y=>schoolPlanForSelection().english[y]).filter(Boolean))].join(' / ');if(!rows.length)return [];
 const has=s=>subs.includes(s), context=field('context')||field('bigIdea')||schoolPlanForSelection().context||'the unit context';
 const ideas=[];
 ideas.push({title:'Investigate → create → communicate',text:`Students investigate ${context}, then create one purposeful product or response that communicates their learning.`,fit:`Strong when the unit combines ${subs.slice(0,4).join(', ')}. Use the product plus a short oral/written conference to gather evidence that cannot be seen in the product itself.`});
 if(has('Science')||has('HASS')) ideas.push({title:'Evidence-based explanation / presentation',text:`Students use sources, observations or data from ${has('Science')?'Science':'HASS'} to produce ${genre?`a ${genre.toLowerCase()}`:'an appropriate English text'} for an authentic audience.`,fit:`Keep factual/disciplinary evidence in the same task as the English communication where the selected aspects allow it; avoid repeating the same knowledge in a separate test.`});
 if(has('Design and Technologies')||has('Digital Technologies')) ideas.push({title:'Design a solution and explain decisions',text:'Students respond to an authentic need/problem, plan and create a solution, then explain or evaluate the decisions that matter to the selected standards.',fit:'The design artefact can show process/production skills; a concise annotation, conference or reflection can gather explanation/evaluation evidence.'});
 if(['Dance','Drama','Media Arts','Music','Visual Arts'].some(has)) ideas.push({title:'Create / perform for an authentic purpose',text:'Students communicate an idea from the integrated unit through the selected Arts subject, with a brief artist/creator explanation only where the Achievement Standard requires it.',fit:'Do not add a written reflection automatically. Use performance/product evidence for skills and add explanation only for aspects that require describe/explain.'});
 return ideas.slice(0,3);
}
function renderTaskDirections(){const box=$('taskDirections');if(!box)return;const ideas=taskDirectionIdeas();box.innerHTML=ideas.length?ideas.map((x,i)=>`<article class="task-direction"><div><span>Option ${i+1}</span><h4>${escapeHtml(x.title)}</h4></div><p>${escapeHtml(x.text)}</p><small>${escapeHtml(x.fit)}</small><button class="mini use-task-idea" data-i="${i}">Use as starting point</button></article>`).join(''):'<div class="empty">Select Achievement Standard aspects to generate integrated assessment directions.</div>';box.querySelectorAll('.use-task-idea').forEach(b=>b.onclick=()=>{const x=ideas[+b.dataset.i];if(!field('assessmentPurpose'))$('assessmentPurpose').value=x.text;if(!field('assessmentTask'))$('assessmentTask').value=x.text+' '+x.fit;assessmentQuality();});}
let evidenceComponentCount=0;
function selectedComponentRows(div){const rows=rowsForAssessmentYear();return [...div.querySelectorAll('input[data-aspect]:checked')].map(x=>rows.find(r=>r.code===x.dataset.aspect)).filter(Boolean);}
function usedAspectCodes(exceptDiv=null){return new Set([...document.querySelectorAll('.evidence-component')].filter(c=>c!==exceptDiv).flatMap(c=>[...c.querySelectorAll('input[data-aspect]:checked')].map(x=>x.dataset.aspect)));}
function evidenceChoicesForRows(rows){const verbs=[...new Set(rows.map(r=>verbForAspect(r.text)).filter(Boolean))];const choices=[];verbs.forEach(v=>(VERB_SUPPORT[v]?.evidence||[]).forEach(e=>choices.push({verb:v,text:e})));return {verbs,choices:[...new Map(choices.map(x=>[x.text,x])).values()]};}
function componentLinksHtml(div){const rows=rowsForAssessmentYear();if(!activeAssessmentYear)return '<div class="empty">Choose an assessment year level first.</div>';if(!rows.length)return `<div class="empty">No selected Achievement Standard aspects are available for ${escapeHtml(activeAssessmentYear)}. Return to Curriculum Selection and select the aspects to assess.</div>`;const used=usedAspectCodes(div),current=new Set([...div.querySelectorAll?.('input[data-aspect]:checked')||[]].map(x=>x.dataset.aspect)),showUsed=div.dataset.showUsed==='1';const available=rows.filter(r=>current.has(r.code)||!used.has(r.code)||showUsed);return available.length?available.map(r=>`<label class="${used.has(r.code)&&!current.has(r.code)?'already-used':''}"><input type="checkbox" data-aspect="${escapeHtml(r.code)}" ${current.has(r.code)?'checked':''}><span><b>${escapeHtml(r.subject)}</b> · ${escapeHtml(verbForAspect(r.text)||'evidence')} — ${escapeHtml(r.text)}</span></label>`).join(''):`<div class="all-covered">✓ All remaining ${escapeHtml(activeAssessmentYear)} aspects are already mapped. Add another component only if additional evidence is genuinely needed.</div>`;}
function refreshComponentAspectLists(){document.querySelectorAll('.evidence-component').forEach(div=>{const links=div.querySelector('.component-links');if(!links)return;const selectedCodes=new Set([...links.querySelectorAll('input[data-aspect]:checked')].map(x=>x.dataset.aspect));links.innerHTML=componentLinksHtml(div);links.querySelectorAll('input[data-aspect]').forEach(ch=>{if(selectedCodes.has(ch.dataset.aspect))ch.checked=true;ch.onchange=()=>{updateComponentSupport(div);refreshComponentAspectLists();div.querySelector('.question-suggestions')?.replaceChildren();};});});}
function updateComponentSupport(div){const selected=selectedComponentRows(div),info=evidenceChoicesForRows(selected),sel=div.querySelector('.evidence-format'),hint=div.querySelector('.component-demand');const prior=sel.value;sel.innerHTML='<option value="">Choose a suggested format…</option>'+info.choices.map(x=>`<option value="${escapeHtml(x.text)}">${escapeHtml(x.verb.toUpperCase())} — ${escapeHtml(x.text)}</option>`).join('')+'<option value="__own">Write my own / open input</option>';if([...sel.options].some(o=>o.value===prior))sel.value=prior;hint.innerHTML=info.verbs.length?`<strong>Cognitive demand:</strong> ${info.verbs.map(v=>escapeHtml(v.toUpperCase())).join(' + ')}${info.verbs.length>1?' — choose a format that gives students a genuine opportunity to demonstrate all selected demands.':''}`:'Select an Achievement Standard aspect below to see evidence-format suggestions.';renderIntegrationOpportunities(div,selected);}
function connectionStrength(a,b){if(!a||!b||a.subject===b.subject)return null;const va=verbForAspect(a.text),vb=verbForAspect(b.text),ta=a.text.toLowerCase(),tb=b.text.toLowerCase();let score=0,reason='';const pairs=[['interpret','read'],['interpret','comprehend'],['interpret','analyse'],['describe','create'],['explain','create'],['communicat','create'],['represent','create'],['data','data'],['source','text'],['information','text'],['perspective','infer'],['vocabulary','vocabulary'],['present','create'],['question','question']];pairs.forEach(([x,y])=>{if((ta.includes(x)&&tb.includes(y))||(ta.includes(y)&&tb.includes(x)))score+=2;});if(va&&vb&&va===vb)score+=2;if(['interpret','analyse','explain','describe','communicate','create','represent','use'].includes(va)&&['interpret','analyse','explain','describe','communicate','create','represent','use'].includes(vb))score+=1;if(score>=4){reason='The same response may provide valid evidence for both aspects if the question explicitly elicits both.';return {level:'strong',label:'Strong evidence connection',reason};}if(score>=2){reason='These aspects may connect in one task, but check that each subject-specific demand is actually visible in the evidence.';return {level:'possible',label:'Possible evidence connection',reason};}return null;}
function renderIntegrationOpportunities(div,selected){const box=div.querySelector('.integration-opps');if(!selected.length){box.innerHTML='';return;}const all=rowsForAssessmentYear(),found=[];selected.forEach(a=>all.forEach(b=>{if(selected.some(x=>x.code===b.code))return;const c=connectionStrength(a,b);if(c&&!found.some(x=>x.b.code===b.code))found.push({a,b,...c});}));box.innerHTML=found.length?`<div class="integration-title">🔗 ${escapeHtml(activeAssessmentYear)} integration opportunities <small>Teacher confirmation required</small></div>${found.slice(0,5).map(x=>`<label class="integration-suggestion ${x.level}"><input type="checkbox" class="add-integration" data-code="${escapeHtml(x.b.code)}"><span><b>${escapeHtml(x.label)}:</b> ${escapeHtml(x.b.subject)} — ${escapeHtml(x.b.text)}<small>${escapeHtml(x.reason)}</small></span></label>`).join('')}`:'';box.querySelectorAll('.add-integration').forEach(ch=>ch.onchange=()=>{if(ch.checked){div.dataset.showUsed='1';refreshComponentAspectLists();const target=div.querySelector(`input[data-aspect="${CSS.escape(ch.dataset.code)}"]`);if(target){target.checked=true;updateComponentSupport(div);refreshComponentAspectLists();}}});}

function aspectImperative(row){
  if(!row)return 'Demonstrate the selected learning.';
  const verb=verbForAspect(row.text);
  if(!verb)return row.text.replace(/^(Students|They)\s+/i,'').replace(/^[a-z]/,m=>m.toUpperCase());
  const low=row.text.toLowerCase();
  const i=low.search(new RegExp(`\\b${verb}\\w*\\b`,'i'));
  if(i<0)return row.text.replace(/^(Students|They)\s+/i,'').replace(/^[a-z]/,m=>m.toUpperCase());
  let tail=row.text.slice(i).trim().replace(/[.]$/,'');
  tail=tail.replace(/^\w+/,verb.charAt(0).toUpperCase()+verb.slice(1));
  return tail+'.';
}
function questionSuggestionsForComponent(div){
  const rows=selectedComponentRows(div);
  if(!rows.length)return [];
  const format=div.querySelector('.evidence-format')?.value||'';
  const fmt=format==='__own'?'':format;
  const context=field('assessmentContext')||field('context')||field('bigIdea')||schoolPlanForSelection().context||'the unit context';
  const verbs=[...new Set(rows.map(r=>verbForAspect(r.text)).filter(Boolean))];
  const primary=rows[0], imperative=aspectImperative(primary).replace(/[.]$/,'');
  const lowerFmt=fmt.toLowerCase();
  let q1='';
  if(/tick|select/.test(lowerFmt)) q1=`Select the option or information that best demonstrates this requirement: ${imperative}`;
  else if(/match|sort/.test(lowerFmt)) q1=`Match or sort the information to demonstrate this requirement: ${imperative}`;
  else if(/label/.test(lowerFmt)) q1=`Label the diagram, image or source to demonstrate this requirement: ${imperative}`;
  else if(/linking lines|arrows|relationship map/.test(lowerFmt)) q1=`Use linking lines or arrows to show the relevant relationships in ${context}. ${imperative}`;
  else if(/question set/.test(lowerFmt)) q1=`Develop a focused set of inquiry questions that would help you investigate ${context}. ${imperative}`;
  else if(/source|data|annotat|graph|table/.test(lowerFmt)) q1=`Use the provided source, information or data about ${context} to ${imperative.charAt(0).toLowerCase()+imperative.slice(1)}`;
  else if(/oral|presentation|explanation|conference/.test(lowerFmt)) q1=`Give a concise oral response about ${context}. ${imperative}`;
  else if(/performance|demonstration/.test(lowerFmt)) q1=`Demonstrate the selected learning through the planned performance or practical task. ${imperative}`;
  else if(/design|plan|artefact|product|model/.test(lowerFmt)) q1=`Create or develop the selected product for ${context}, ensuring your work demonstrates this requirement: ${imperative}`;
  else q1=`Using ${context}, ${imperative.charAt(0).toLowerCase()+imperative.slice(1)}`;

  let q2='';
  if(verbs.includes('identify')) q2=`What can you identify about ${context}? Show your answer using ${fmt||'the most efficient response format for the task'}.`;
  else if(verbs.includes('interpret')) q2=`What does the source, information or data show about ${context}? Use the evidence provided to show your interpretation.`;
  else if(verbs.includes('analyse')) q2=`Analyse the information about ${context}. What patterns, relationships or perspectives can you identify from the evidence?`;
  else if(verbs.includes('explain')) q2=`Explain how or why the relevant ideas in ${context} are connected. Make the relationship clear in your response.`;
  else if(verbs.includes('develop')) q2=`Develop the questions, ideas or plan you would need to investigate ${context}.`;
  else if(verbs.includes('propose')) q2=`Based on what you have learned about ${context}, propose an appropriate action or response.`;
  else if(verbs.includes('describe')) q2=`Describe the relevant features of ${context}, including the details needed to demonstrate the selected standard.`;
  else if(verbs.includes('create')) q2=`Create a response about ${context} for the intended purpose and audience, using the features required by the selected standard.`;
  else q2=`Complete a response about ${context} that demonstrates: ${imperative}`;

  if(rows.length>1){
    const extras=rows.slice(1,3).map(r=>aspectImperative(r).replace(/[.]$/,'')).join('; ');
    q1+=` Your response should also provide evidence that you can: ${extras}.`;
  }
  return [...new Set([q1,q2].map(x=>x.trim()).filter(Boolean))];
}
function renderComponentQuestionSuggestions(div){
  const box=div.querySelector('.question-suggestions');
  if(!box)return;
  const suggestions=questionSuggestionsForComponent(div);
  box.innerHTML=suggestions.length?`<div class="question-suggestion-title"><strong>Potential question wording</strong><span>Editable starting points based on your selections</span></div>${suggestions.map((q,i)=>`<button type="button" class="question-suggestion" data-i="${i}">${escapeHtml(q)}</button>`).join('')}`:'<span class="helper">Select at least one Achievement Standard aspect first.</span>';
  box.querySelectorAll('.question-suggestion').forEach(b=>b.onclick=()=>{const input=div.querySelector('.component-text');input.value=suggestions[+b.dataset.i];input.focus();saveAssessmentYearDraft();assessmentQuality();});
}
function suggestQuestionForComponent(div){renderComponentQuestionSuggestions(div);div.querySelector('.question-suggestions')?.scrollIntoView({behavior:'smooth',block:'nearest'});}

function addEvidenceComponent(value='',preset=null){const map=$('evidenceMap');if(!map)return;if(!activeAssessmentYear){map.innerHTML='<div class="empty">Choose a year level above and select Achievement Standard aspects before adding assessment components.</div>';return;}const id=++evidenceComponentCount,div=document.createElement('div');div.className='evidence-component';div.dataset.component=id;div.innerHTML=`<div class="component-head"><label>${escapeHtml(activeAssessmentYear||'Year level')} task component / question<input class="component-text" placeholder="e.g. Drag and drop relationships; develop inquiry questions; oral explanation" value="${escapeHtml(value)}"></label><button class="mini remove-component" title="Remove">Remove</button></div><div class="component-builder"><label>Suggested question / evidence format<select class="evidence-format"><option value="">Select an aspect below first…</option></select></label><div class="component-demand">Select an Achievement Standard aspect below to see evidence-format suggestions.</div></div><div class="component-links"></div><div class="integration-opps"></div><div class="question-builder-actions"><button type="button" class="suggest suggest-question">Suggest question wording</button><span class="helper">Uses the selected aspect(s), cognitive demand, evidence format and assessment context.</span></div><div class="question-suggestions"></div><div class="component-footer"><button type="button" class="suggest add-next-component">+ Add another question / task component</button><button type="button" class="mini show-used">Show already-used aspects</button><span>Only uncovered aspects are shown by default.</span></div>`;map.appendChild(div);div.querySelector('.component-links').innerHTML=componentLinksHtml(div);div.querySelector('.remove-component').onclick=()=>{div.remove();refreshComponentAspectLists();assessmentQuality();};div.querySelectorAll('input[data-aspect]').forEach(ch=>ch.onchange=()=>{updateComponentSupport(div);refreshComponentAspectLists();div.querySelector('.question-suggestions').innerHTML='';});div.querySelector('.evidence-format').onchange=e=>{div.querySelector('.question-suggestions').innerHTML='';if(!e.target.value||e.target.value==='__own')return;};div.querySelector('.suggest-question').onclick=()=>suggestQuestionForComponent(div);div.querySelector('.add-next-component').onclick=()=>{saveAssessmentYearDraft();addEvidenceComponent();refreshComponentAspectLists();const cards=[...document.querySelectorAll('.evidence-component')];cards.at(-1)?.scrollIntoView({behavior:'smooth',block:'center'});cards.at(-1)?.querySelector('.component-text')?.focus();};div.querySelector('.show-used').onclick=e=>{div.dataset.showUsed=div.dataset.showUsed==='1'?'0':'1';e.currentTarget.textContent=div.dataset.showUsed==='1'?'Hide already-used aspects':'Show already-used aspects';refreshComponentAspectLists();};if(preset){div.dataset.showUsed='1';refreshComponentAspectLists();preset.codes?.forEach(code=>{const ch=div.querySelector(`input[data-aspect="${CSS.escape(code)}"]`);if(ch)ch.checked=true;});updateComponentSupport(div);if(preset.format){const sel=div.querySelector('.evidence-format');if([...sel.options].some(o=>o.value===preset.format))sel.value=preset.format;}div.dataset.showUsed='0';refreshComponentAspectLists();}else updateComponentSupport(div);}
function analyseEvidenceMap(){const comps=[...document.querySelectorAll('.evidence-component')],rows=rowsForAssessmentYear();const linked=new Map(rows.map(r=>[r.code,0]));let empty=0;comps.forEach(c=>{const checks=[...c.querySelectorAll('input[data-aspect]:checked')];if(!checks.length)empty++;checks.forEach(x=>linked.set(x.dataset.aspect,(linked.get(x.dataset.aspect)||0)+1));});const uncovered=[...linked].filter(([,n])=>!n).map(([code])=>rows.find(r=>r.code===code));const repeated=[...linked].filter(([,n])=>n>1);let msg=`<strong>${escapeHtml(activeAssessmentYear)} evidence map analysis</strong><br>`;msg+=uncovered.length?`⚠ <strong>${uncovered.length} aspect${uncovered.length===1?' is':'s are'} not yet linked</strong> to a task component.<br>`:'✓ All selected aspects for this year level currently have evidence mapped.<br>';if(empty)msg+=`⚠ ${empty} component${empty===1?' has':'s have'} no curriculum evidence link — consider whether ${empty===1?'it is':'they are'} needed.<br>`;if(repeated.length)msg+=`○ ${repeated.length} aspect${repeated.length===1?' appears':'s appear'} in more than one component. Check whether the additional evidence is necessary.<br>`;msg+=`<em>Minimum sufficient evidence:</em> one well-designed component can validly gather evidence for several aspects. ${escapeHtml(activeAssessmentYear)} students are assessed only against the standards applicable to ${escapeHtml(activeAssessmentYear)}.`;$('assessmentSuggestions').innerHTML=msg;assessmentQuality();}

function draftStem(verb,format){const stems={identify:'Identify the required information',recognise:'Recognise the relevant example or feature',describe:'Describe the relevant features or characteristics',explain:'Explain how or why the relationship occurs',compare:'Compare the relevant features, including similarities and differences',classify:'Classify the items using relevant characteristics',analyse:'Analyse the source, information or data',interpret:'Interpret the source, information or data',evaluate:'Evaluate the evidence using relevant criteria',justify:'Justify your response using reasons or evidence',create:'Create a response for the required purpose and audience',construct:'Construct the required product or representation',demonstrate:'Demonstrate the required skill or process',apply:'Apply your learning in this situation',use:'Use the required features, knowledge or process',develop:'Develop the required questions, ideas or plan',propose:'Propose a considered action or response',select:'Select the most relevant information or option',organise:'Organise the information in a purposeful way',represent:'Represent the information or relationship appropriately',investigate:'Investigate the question and record relevant evidence',plan:'Plan the required process or response',perform:'Perform the prepared work',communicate:'Communicate your ideas or findings appropriately'};let base=stems[verb]||'Demonstrate the selected learning';if(format)base+=` using ${format}`;return base+'.';}
function buildDraftAssessment(){
  const box=$('draftAssessment');
  if(!activeAssessmentYear){box.innerHTML='<div class="empty">Choose which year level you want to assess first.</div>';return;}
  saveAssessmentYearDraft();
  const comps=[...document.querySelectorAll('.evidence-component')];
  const usable=comps.map((c,i)=>{const rows=selectedComponentRows(c);if(!rows.length)return null;const format=c.querySelector('.evidence-format').value;const custom=c.querySelector('.component-text').value.trim();const verbs=[...new Set(rows.map(r=>verbForAspect(r.text)).filter(Boolean))];return {n:i+1,rows,format:format==='__own'?'':format,custom,verbs};}).filter(Boolean);
  if(!usable.length){box.innerHTML='<div class="empty">Link at least one task component to an Achievement Standard aspect first.</div>';return;}
  const currentYear=activeAssessmentYear;
  const years=eligibleAssessmentYears();
  const remaining=years.filter(y=>y!==currentYear&&!builtAssessmentDrafts[y]);
  const draftHtml=`<div class="draft-summary"><strong>${rowsForAssessmentYear().length} selected ${escapeHtml(currentYear)} Achievement Standard aspects → ${usable.length} planned assessment component${usable.length===1?'':'s'}</strong><span>One component can gather evidence for several aspects where the evidence genuinely demonstrates each demand.</span></div>${usable.map((x,i)=>{const lead=x.custom||draftStem(x.verbs[0],x.format);return `<article class="draft-question" draggable="true"><div class="draft-q-head"><strong>${x.format&&/performance|product|demonstration|investigation/i.test(x.format)?'Task component':'Question'} ${i+1}</strong><span>${x.verbs.map(v=>escapeHtml(v.toUpperCase())).join(' + ')||'EVIDENCE'}</span></div><textarea rows="3">${escapeHtml(lead)}</textarea><div class="draft-covers"><strong>Covers:</strong>${x.rows.map(r=>`<span>${escapeHtml(r.subject)} · ${escapeHtml(curriculumArea(r))}</span>`).join('')}</div></article>`}).join('')}<div class="draft-note"><strong>Teacher check:</strong> Does each component give students a clear opportunity to demonstrate the selected cognitive demand? Remove components that add workload without adding useful evidence.</div>`;
  builtAssessmentDrafts[currentYear]=draftHtml;
  box.innerHTML=draftHtml+(remaining.length?`<div class="next-year-assessment"><div><span class="eyebrow">Multi-age assessment</span><h4>${escapeHtml(currentYear)} assessment drafted. Would you like to create another assessment task for another year level?</h4><p>Choose the next year level, then either start with a blank evidence map or reuse this assessment structure while remapping it to the new year level's standards.</p></div><label>Next year level<select id="nextAssessmentYear">${remaining.map(y=>`<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join('')}</select></label><div class="next-year-actions"><button type="button" class="primary" id="startNextFresh">Start next assessment fresh</button><button type="button" class="suggest" id="startNextCopy">Use ${escapeHtml(currentYear)} task structure as a starting point</button></div></div>`:`<div class="next-year-assessment complete"><strong>✓ All selected year levels now have a draft assessment task.</strong><span>You can switch year levels above to review or refine each assessment.</span></div>`);
  const text=usable.map((x,i)=>`Question ${i+1}: ${x.custom||draftStem(x.verbs[0],x.format)}`).join('\n\n');
  if(!field('assessmentTask'))$('assessmentTask').value=text;
  const goNext=(copy)=>{const next=$('nextAssessmentYear')?.value;if(!next)return;handleAssessmentYearSelection(next,copy?currentYear:'');$('assessmentYearBuilder')?.scrollIntoView({behavior:'smooth',block:'start'});};
  $('startNextFresh')?.addEventListener('click',()=>goNext(false));
  $('startNextCopy')?.addEventListener('click',()=>goNext(true));
  assessmentQuality();
}
$('buildDraftAssessment').onclick=buildDraftAssessment;
document.addEventListener('change',e=>{if(e.target?.id==='assessmentYearSelect')handleAssessmentYearSelection(e.target.value);});
function descriptorStem(text){return text.replace(/^[A-Z][a-z]+\s+/,'').replace(/[.]$/,'');}
function buildGTMJ(){const box=$('gtmjBuilder');if(!box)return;const grouped=assessmentRowsByYear();const years=Object.keys(grouped).filter(y=>grouped[y].length);if(!years.length){box.innerHTML='<div class="empty">Select Achievement Standard aspects before building a GTMJ.</div>';return;}const gradeCell=(grade,r)=>{const stem=descriptorStem(r.text);const defaults={A:`Insightful and thorough evidence that ${stem}`,B:`Detailed and effective evidence that ${stem}`,C:r.text,D:'Partial evidence of the knowledge, understanding and/or skill described in this aspect',E:'Fragmented evidence of the knowledge, understanding and/or skill described in this aspect'};return `<td class="gtmj-grade ${grade==='C'?'c-standard':''}"><textarea aria-label="${grade} descriptor for ${escapeHtml(r.subject)}" data-gtmj="${grade}" data-code="${escapeHtml(r.code)}" rows="4">${escapeHtml(defaults[grade])}</textarea></td>`;};box.innerHTML=years.map(y=>{const bySubject=grouped[y].reduce((a,r)=>((a[r.subject]??=[]).push(r),a),{});return `<div class="gtmj-year"><div class="gtmj-year-head"><h3>${escapeHtml(y)}</h3><span>One marking guide table per learning area — editable</span></div>${Object.entries(bySubject).map(([subject,rows])=>`<section class="gtmj-subject" data-subject="${escapeHtml(subject)}"><div class="gtmj-subject-head"><h4>${escapeHtml(subject)}</h4><span>${rows.length} selected aspect${rows.length===1?'':'s'}</span></div><div class="gtmj-table-wrap"><table class="gtmj-table"><thead><tr><th class="gtmj-aspect-col">Achievement Standard aspect</th><th>A</th><th>B</th><th class="c-head">C</th><th>D</th><th>E</th></tr></thead><tbody>${rows.map(r=>`<tr><th scope="row" class="gtmj-aspect-cell"><span>${escapeHtml(curriculumArea(r))}</span><p>${escapeHtml(r.text)}</p></th>${['A','B','C','D','E'].map(g=>gradeCell(g,r)).join('')}</tr>`).join('')}</tbody></table></div></section>`).join('')}</div>`}).join('');assessmentQuality();}
function assessmentQuality(){const box=$('assessmentQuality');if(!box)return;const rows=rowsForAssessmentYear(), task=field('assessmentTask'), purpose=field('assessmentPurpose'), cond=field('assessmentConditions');const evidence=[...document.querySelectorAll('.evidence-input')].filter(x=>x.value.trim()).length;const mapLinks=new Set([...document.querySelectorAll('.evidence-component input[data-aspect]:checked')].map(x=>x.dataset.aspect));const checks=[['Curriculum aspects selected',rows.length>0],['Purpose is clear',purpose.length>15],['Student evidence is described',task.length>25],['Conditions are recorded',cond.length>10],['Each selected aspect has an evidence location',rows.length>0&&(evidence>=rows.length||mapLinks.size>=rows.length)],['GTMJ has been built',document.querySelectorAll('[data-gtmj="C"]').length>=rows.length&&rows.length>0]];box.innerHTML='<strong>Assessment quality check</strong>'+checks.map(([t,ok])=>`<span class="${ok?'check-ok':'check-warn'}">${ok?'✓':'○'} ${t}</span>`).join('');}
$('assessmentSuggest').onclick=()=>{renderAssessmentAlignment();renderTaskDirections();const vs=cognitive(),rows=selectedRows(),subjects=[...new Set(rows.map(r=>r.subject))];$('assessmentSuggestions').innerHTML=`<strong>Suggested assessment structure</strong><br>Start with one coherent, authentic task. Students need opportunities to ${escapeHtml(vs.length?vs.join(', '):'demonstrate the selected curriculum demands')}. Use the cognitive-demand cards above to choose the <em>lightest valid evidence</em> for each aspect, then combine evidence where one component can validly cover several aspects.<br><br><strong>Multi-age check:</strong> keep a shared context/task where appropriate, but change the cognitive demand and expected evidence by year level rather than simply adding more questions.`;assessmentQuality();};
$('taskIdeas').onclick=renderTaskDirections;
$('addEvidenceComponent').onclick=()=>addEvidenceComponent();
$('analyseEvidenceMap').onclick=analyseEvidenceMap;
$('buildGtmj').onclick=()=>{renderAssessmentAlignment();buildGTMJ();};
$('accessibilityCheck').onclick=()=>{const task=field('assessmentTask');$('assessmentSuggestions').innerHTML=`<strong>Accessibility check</strong><br>• Remove questions or products that do not generate evidence for a selected Achievement Standard aspect.<br>• Check whether reading, handwriting, memory or technology demands are unintentionally measuring something other than the target learning.<br>• Match the response mode to the cognitive verb: <strong>identify</strong> may be shown by selecting, matching or linking; <strong>describe</strong> may be oral, annotated or written; <strong>explain/evaluate</strong> need the relationship/reasoning to be visible.<br>• Keep access scaffolds separate from scaffolds that supply the assessed knowledge or thinking.<br>• For multi-age classes, change the expected evidence rather than simply giving younger students more or fewer questions.${task?'':'<br><em>Add the student task above for a more useful teacher review.</em>'}`;};
$('evidenceCheck').onclick=()=>{renderAssessmentAlignment();analyseEvidenceMap();};
['assessmentTitle','assessmentTechnique','assessmentPurpose','assessmentContext','assessmentTask','assessmentConditions','gtmjNotes'].forEach(id=>$(id)?.addEventListener('input',()=>{saveAssessmentYearMeta();assessmentQuality();}));
$('assessmentAlignment')?.addEventListener('input',assessmentQuality);
renderAssessmentYearBuilder();
renderAssessmentAlignment();
renderTaskDirections();
loadAssessmentYearDraft(activeAssessmentYear);

const DEFAULT_ALLOC={
  'English':[5,60], 'HASS':[1,80], 'Science':[1,80], 'Mathematics':[5,60], 'HPE':[1,60],
  'Design and Technologies':[1,60], 'Digital Technologies':[1,60], 'Dance':[1,60], 'Drama':[1,60], 'Media Arts':[1,60], 'Music':[1,60], 'Visual Arts':[1,60]
};
function renderAllocations(){
  const g=$('allocationGrid'); if(!g)return; g.innerHTML='';
  state.subjects.forEach(sub=>{const d=DEFAULT_ALLOC[sub]||[1,60];const c=document.createElement('div');c.className='allocation-card';c.innerHTML=`<strong>${sub}</strong><div class="allocation-row"><label>Lessons / week<input class="alloc-count" data-sub="${sub}" type="number" min="0" max="10" value="${d[0]}"></label><label>Minutes / lesson<input class="alloc-mins" data-sub="${sub}" type="number" min="10" max="180" step="5" value="${d[1]}"></label></div>${['HASS','Science'].includes(sub)?'<div class="integration-badge">Additional content integrated through English</div>':''}`;g.appendChild(c);});
}
renderAllocations();
function allocations(){const out={};document.querySelectorAll('.alloc-count').forEach(x=>{const sub=x.dataset.sub;out[sub]=[Number(x.value)||0,Number(document.querySelector(`.alloc-mins[data-sub="${CSS.escape(sub)}"]`)?.value)||60]});return out;}
function lessonCard(sub,idx,mins,d={}){const div=document.createElement('div');div.className='lesson-card';div.draggable=true;div.dataset.subject=sub;div.innerHTML=`<div class="lesson-head"><span class="drag-handle">☰</span><strong>${sub} — Lesson ${idx} (${mins} min)</strong>${['HASS','Science'].includes(sub)?'<span class="integration-badge">dedicated disciplinary lesson</span>':''}<button type="button" class="curr-ref-btn">Curriculum reference</button></div><div class="lesson-fields"><label>Focus<textarea class="lf" rows="2">${escapeHtml(d.focus||'')}</textarea></label><label>Learning experience<textarea class="le" rows="2">${escapeHtml(d.experience||'')}</textarea></label><label>Evidence / check<textarea class="lc" rows="2">${escapeHtml(d.check||'')}</textarea></label></div>`;div.querySelector('.curr-ref-btn').onclick=e=>{e.preventDefault();e.stopPropagation();openCurriculumReference(sub);};return div;}
function supportCard(type,d={}){if(type==='fluency')return `<div class="support-card fluency-card"><h4>📖 Weekly reading fluency</h4><label>Content / topic focus<input class="fl-topic" value="${escapeHtml(d.topic||'')}"></label><label>Tier 2 vocabulary<input class="fl-t2" value="${escapeHtml(d.t2||'')}"></label><label>Tier 3 vocabulary<input class="fl-t3" value="${escapeHtml(d.t3||'')}"></label><label>Target length<select class="fl-length"><option ${d.length==='150–200 words'?'selected':''}>150–200 words</option><option ${d.length==='100–150 words'?'selected':''}>100–150 words</option><option ${d.length==='200–250 words'?'selected':''}>200–250 words</option></select></label><div class="fluency-options"><label><input class="fl-below" type="checkbox" ${d.below!==false?'checked':''}> Below</label><label><input class="fl-at" type="checkbox" ${d.at!==false?'checked':''}> At level</label><label><input class="fl-above" type="checkbox" ${d.above!==false?'checked':''}> Above</label></div></div>`;
return `<div class="support-card"><h4>${type==='daily'?'↻ 5-minute Daily Review':'▦ Learning Wall / Bump-It-Up'}</h4><label>${type==='daily'?'Retrieval + quick application':'Add / update this week'}<textarea class="${type==='daily'?'wk-daily':'wk-wall'}" rows="6">${escapeHtml(d.text||'')}</textarea></label></div>`;}
function readWeek(w){return {lessons:[...w.querySelectorAll('.lesson-card')].map(x=>({subject:x.dataset.subject,focus:x.querySelector('.lf').value,experience:x.querySelector('.le').value,check:x.querySelector('.lc').value})),fluency:{topic:w.querySelector('.fl-topic')?.value||'',t2:w.querySelector('.fl-t2')?.value||'',t3:w.querySelector('.fl-t3')?.value||'',length:w.querySelector('.fl-length')?.value||'150–200 words',below:w.querySelector('.fl-below')?.checked??true,at:w.querySelector('.fl-at')?.checked??true,above:w.querySelector('.fl-above')?.checked??true},daily:{text:w.querySelector('.wk-daily')?.value||''},wall:{text:w.querySelector('.wk-wall')?.value||''}};}
function weekShell(i,d={}){const w=document.createElement('div');w.className='week-shell';w.innerHTML=`<div class="week-shell-head"><h3>Week ${i}</h3><span>Lesson-level integrated plan</span></div><div class="lesson-stack"></div><div class="weekly-support">${supportCard('fluency',d.fluency||{})}${supportCard('daily',d.daily||{})}${supportCard('wall',d.wall||{})}</div>`;const st=w.querySelector('.lesson-stack');const a=allocations();state.subjects.forEach(sub=>{const [count,mins]=a[sub]||[0,60];for(let j=1;j<=count;j++){const old=(d.lessons||[]).find((x,k)=>x.subject===sub && (d.lessons||[]).slice(0,k+1).filter(y=>y.subject===sub).length===j);st.appendChild(lessonCard(sub,j,mins,old||{}));}});st.addEventListener('dragover',e=>{e.preventDefault();const drag=st.querySelector('.dragging');if(!drag)return;const after=[...st.querySelectorAll('.lesson-card:not(.dragging)')].find(el=>{const b=el.getBoundingClientRect();return e.clientY<b.top+b.height/2});after?st.insertBefore(drag,after):st.appendChild(drag)});st.addEventListener('dragstart',e=>{const c=e.target.closest('.lesson-card');if(c)c.classList.add('dragging')});st.addEventListener('dragend',e=>{const c=e.target.closest('.lesson-card');if(c)c.classList.remove('dragging')});return w;}
function buildWeeks(){const n=Math.max(1,Math.min(20,Number($('weeks').value)||8));const c=$('weeksContainer');const old=[...c.querySelectorAll('.week-shell')].map(readWeek);c.innerHTML='';for(let i=1;i<=n;i++)c.appendChild(weekShell(i,old[i-1]||{}));}
function sequenceSuggestions(){if(!$('weeksContainer').querySelector('.week-shell'))buildWeeks();const rows=selectedRows();const terms=[...new Set(rows.flatMap(r=>(r.keywords||'').split(',').map(x=>x.trim()).filter(Boolean)))];const weeks=[...$('weeksContainer').querySelectorAll('.week-shell')];weeks.forEach((w,wi)=>{const lessons=[...w.querySelectorAll('.lesson-card')];lessons.forEach((l,li)=>{if(l.querySelector('.lf').value)return;const sub=l.dataset.subject;if(sub==='English'){const cycle=['Activate prior knowledge and build unit knowledge','Explicit reading / viewing and comprehension','Vocabulary, language and text features','Modelled / shared composition','Guided or independent application'];l.querySelector('.lf').value=cycle[li%cycle.length];l.querySelector('.le').value=`Use the integrated unit context to explicitly teach ${cycle[li%cycle.length].toLowerCase()}. Connect to selected ${state.subjects.filter(x=>x!=='English').join(' / ')||'curriculum'} knowledge where authentic.`;l.querySelector('.lc').value='Brief check for understanding linked to the selected Achievement Standard aspect(s).';}else if(['HASS','Science'].includes(sub)){l.querySelector('.lf').value=wi===0?'Introduce disciplinary concepts and inquiry':wi<weeks.length-2?'Develop disciplinary knowledge and inquiry':'Consolidate and gather disciplinary evidence';l.querySelector('.le').value=`Explicit ${sub} teaching/inquiry. Identify knowledge that can be revisited authentically in English lessons this week.`;l.querySelector('.lc').value='Observation, discussion, source/inquiry evidence or short application.';}else{l.querySelector('.lf').value='Explicit subject learning linked to the unit context';l.querySelector('.le').value='Teach the selected Achievement Standard aspect through an authentic connection to the integrated unit.';l.querySelector('.lc').value='Short check for understanding / evidence.';}});if(!w.querySelector('.fl-topic').value)w.querySelector('.fl-topic').value=`Week ${wi+1} unit knowledge linked to ${state.subjects.filter(x=>x!=='English').join(' / ')||'the integrated context'}`;if(!w.querySelector('.fl-t2').value)w.querySelector('.fl-t2').value=(terms.slice(0,4).join(', ')||'select academic vocabulary');if(!w.querySelector('.fl-t3').value)w.querySelector('.fl-t3').value=(terms.slice(4,9).join(', ')||'select unit-specific vocabulary');if(!w.querySelector('.wk-daily').value)w.querySelector('.wk-daily').value=wi===0?'Retrieve prerequisite knowledge from previous learning; apply it in one quick example.':'Retrieve key knowledge/vocabulary explicitly taught in previous lessons; include one quick application and one misconception/error correction.';if(!w.querySelector('.wk-wall').value)w.querySelector('.wk-wall').value=wi===0?'Add unit learning intentions, initial success criteria and key terminology.':'Add/update current worked examples, vocabulary, success criteria and Bump-It-Up evidence as it is explicitly taught.';});$('sequenceSuggestions').innerHTML='<strong>Lesson-level suggestions added to empty fields only.</strong> English is planned as individual lessons, HASS/Science retain their dedicated 80-minute session, and weekly fluency, Daily Review and Learning Wall/Bump-It-Up planning sit beside the lessons. Drag lesson cards to reorder and edit any content.';}
$('buildWeeks').onclick=buildWeeks;
$('suggestSequence').onclick=sequenceSuggestions;
buildWeeks();

$('reviewSuggest').onclick=()=>{const rows=selectedRows();const key=[...new Set(rows.flatMap(r=>(r.keywords||'').split(',').map(x=>x.trim()).filter(Boolean)))].slice(0,10);const vs=cognitive();$('reviewSuggestions').innerHTML=`<strong>Suggested review bank</strong><br>Vocabulary: ${key.join(', ')||'select terminology from completed teaching'}.<br>Retrieval: “What do you remember about…?”, “Define…”, “Which example shows…?”<br>Application: “Use yesterday’s idea in this new example.” ${vs.length?`Prompt students to ${vs.slice(0,4).join(', ')} rather than only recall.`:''}<br>Correction: include one common error or misconception and ask students to fix or explain it.`;};

const diffMap={
'Reading access':['reduce unnecessary reading load without reducing curriculum demand','provide text-to-speech or teacher read-aloud where appropriate','pre-teach critical vocabulary'],
'Writing support':['sentence stems or paragraph frames','oral rehearsal before writing','worked examples and gradually removed scaffolds'],
'Numeracy':['concrete and visual representations','worked examples with faded guidance','explicitly teach mathematical vocabulary'],
'Working memory':['chunk instructions','visual task sequence','keep key information visible while students work'],
'Vocabulary / language':['student-friendly definitions with examples/non-examples','repeated oral use of terminology','morphology or word-part instruction where useful'],
'EAL/D':['visuals and gestures alongside spoken explanation','model complete response structures','allow rehearsal with a partner before independent response'],
'Attention / executive function':['short task chunks with clear completion points','visible timer or checklist','reduce competing information on the page'],
'Extension':['increase complexity rather than workload','transfer learning to an unfamiliar context','require justification, evaluation or independent decision-making']};
$('diffSuggest').onclick=()=>{const all=state.needs.flatMap(n=>diffMap[n]||[]);$('diffSuggestions').innerHTML=all.length?'<strong>Strategies to consider</strong><br>• '+all.join('<br>• '):'Select one or more adjustment areas first.';};


$('curriculumContainer')?.addEventListener('change',()=>{setTimeout(()=>{activeAssessmentYear='';Object.keys(assessmentYearDrafts).forEach(k=>delete assessmentYearDrafts[k]);Object.keys(assessmentYearMeta).forEach(k=>delete assessmentYearMeta[k]);completedAssessmentYears.clear();renderAssessmentYearBuilder();renderAssessmentAlignment();renderTaskDirections();loadAssessmentYearDraft('');$('gtmjBuilder').innerHTML='';if($('draftAssessment'))$('draftAssessment').innerHTML='<div class="empty">Map your evidence above, then select <strong>Build draft assessment</strong>.</div>';assessmentQuality();},0);});
$('wallSuggest').onclick=()=>{const vs=cognitive();const rows=selectedRows();const key=[...new Set(rows.flatMap(r=>(r.keywords||'').split(',').map(x=>x.trim()).filter(Boolean)))].slice(0,12);$('wallSuggestions').innerHTML=`<strong>Suggested visible content</strong><br>Learning wall: learning intentions, success criteria, key terminology${key.length?` (${key.join(', ')})`:''}, worked examples, anchor charts/processes and current learning.<br>Bump-It-Up: the assessment focus, student-friendly interpretation of ${vs.join(', ')||'the cognitive demand'}, annotated exemplars showing discernible differences, and clear “next step” feedback prompts.<br>For multi-age classes, separate shared content from year-level-specific success criteria.`;};

function field(id){return ($(id)?.value||'').trim();}
function selectedStandardsTable(){const rows=selectedRows();if(!rows.length)return '<p>No Achievement Standard aspects selected.</p>';return `<table class="curr-table"><thead><tr><th>Learning area</th><th>Year / band</th><th>Selected Achievement Standard aspect</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${escapeHtml(r.subject)}</td><td>${escapeHtml(r.grade)}</td><td>${escapeHtml(r.text)}</td></tr>`).join('')}</tbody></table>`;}
function block(title,content){return content?`<div class="print-block"><h4>${title}</h4><div>${escapeHtml(content).replace(/\n/g,'<br>')}</div></div>`:'';}
function gtmjPrint(){const years=[...document.querySelectorAll('.gtmj-year')];if(!years.length)return '';return `<div class="print-block"><h4>Task-specific GTMJ</h4>${years.map(y=>{const year=y.querySelector('.gtmj-year-head h3')?.textContent||'';const subjects=[...y.querySelectorAll('.gtmj-subject')];return `<h4 class="print-gtmj-year">${escapeHtml(year)}</h4>${subjects.map(s=>{const subject=s.querySelector('.gtmj-subject-head h4')?.textContent||'';const rows=[...s.querySelectorAll('tbody tr')].map(tr=>{const aspect=tr.querySelector('.gtmj-aspect-cell p')?.textContent||'';const area=tr.querySelector('.gtmj-aspect-cell span')?.textContent||'';const vals={};tr.querySelectorAll('textarea[data-gtmj]').forEach(t=>vals[t.dataset.gtmj]=t.value);return `<tr><td><small>${escapeHtml(area)}</small><br>${escapeHtml(aspect)}</td>${['A','B','C','D','E'].map(g=>`<td>${escapeHtml(vals[g]||'')}</td>`).join('')}</tr>`;}).join('');return `<p><strong>${escapeHtml(subject)}</strong></p><table class="curr-table gtmj-print-table"><thead><tr><th>Achievement Standard aspect</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr></thead><tbody>${rows}</tbody></table>`}).join('')}`}).join('')}</div>`;}
function refreshPreview(){const title=field('unitTitle')||'Untitled Integrated Unit';const weeks=[...document.querySelectorAll('.week-shell')].map((x,i)=>({i:i+1,...readWeek(x)}));$('printPreview').innerHTML=`<div class="print-title"><div class="eyebrow">Integrated Unit Overview</div><h2>${escapeHtml(title)}</h2></div><div class="print-meta"><div><strong>Year levels</strong><br>${escapeHtml(state.years.join(', ')||'—')}</div><div><strong>Term</strong><br>${escapeHtml(field('term'))}</div><div><strong>Duration</strong><br>${escapeHtml(field('weeks'))} weeks</div><div><strong>Learning areas</strong><br>${escapeHtml(state.subjects.join(', ')||'—')}</div></div>${block('Context / Big Idea',field('context'))}<div class="print-block"><h4>Whole-school plan alignment</h4><div>${escapeHtml(schoolPlanForSelection().context)} • English: ${escapeHtml([...new Set(state.years.map(y=>schoolPlanForSelection().english[y]).filter(Boolean))].join(' / ')||'—')} • ${escapeHtml(schoolPlanForSelection().technology||'Technologies as appropriate')} • Arts: ${escapeHtml(schoolPlanForSelection().arts)}</div></div><div class="print-block"><h4>Curriculum alignment</h4>${selectedStandardsTable()}</div>${block('Integration — shared concept',field('bigIdea'))}${block('Authentic context / problem',field('authentic'))}${block('Key terminology',field('terminology'))}${block('Integration notes',field('integrationNotes'))}${block('Assessment title',field('assessmentTitle'))}${block('Assessment technique',field('assessmentTechnique'))}${block('Assessment purpose',field('assessmentPurpose'))}${block('Assessment context / stimulus',field('assessmentContext'))}${block('Assessment task / evidence',field('assessmentTask'))}${block('Assessment conditions',field('assessmentConditions'))}${gtmjPrint()}${block('GTMJ / discernible difference notes',field('gtmjNotes'))}<div class="print-block"><h4>Learning sequence</h4>${weeks.map(w=>`<div class="print-block"><h4>Week ${w.i}</h4>${w.lessons.map(l=>`<p><strong>${escapeHtml(l.subject)}</strong> — ${escapeHtml(l.focus)}<br>${escapeHtml(l.experience)}${l.check?'<br><em>Check:</em> '+escapeHtml(l.check):''}</p>`).join('')}<p><strong>Reading fluency:</strong> ${escapeHtml(w.fluency.topic)} (${escapeHtml(w.fluency.length)})<br><em>Tier 2:</em> ${escapeHtml(w.fluency.t2)}<br><em>Tier 3:</em> ${escapeHtml(w.fluency.t3)}</p><p><strong>Daily Review:</strong> ${escapeHtml(w.daily.text)}</p><p><strong>Learning Wall / Bump-It-Up:</strong> ${escapeHtml(w.wall.text)}</p></div>`).join('')}</div>${block('Daily review — vocabulary',field('reviewVocab'))}${block('Daily review — previously taught knowledge',field('reviewKnowledge'))}${block('Daily review — fluency / automaticity',field('reviewFluency'))}${block('Daily review — application',field('reviewApplication'))}${block('Daily review — misconceptions',field('reviewMisconceptions'))}${block('Daily review — retrieval questions',field('reviewQuestions'))}${block('Differentiation — access',field('diffAccess'))}${block('Differentiation — scaffolding',field('diffScaffold'))}${block('Differentiation — response',field('diffResponse'))}${block('Differentiation — extension',field('diffExtension'))}${block('Learning wall — learning intentions',field('wallLI'))}${block('Learning wall — success criteria',field('wallSC'))}${block('Learning wall — key terminology',field('wallTerms'))}${block('Learning wall — anchor charts / processes',field('wallAnchors'))}${block('Bump-It-Up — focus / cognitive verbs',field('biuFocus'))}${block('Bump-It-Up — exemplars',field('biuExemplars'))}${block('Bump-It-Up — discernible differences',field('biuDifferences'))}${block('Bump-It-Up — feedback prompts',field('biuPrompts'))}`;}
$('refreshPreview').onclick=refreshPreview;$('printBtn').onclick=()=>{refreshPreview();document.querySelector('[data-target="review"]').click();setTimeout(()=>window.print(),150)};

function serialize(){const obj={state:{years:state.years,subjects:state.subjects,standards:[...state.standards],needs:state.needs},fields:{}};document.querySelectorAll('input[id],select[id],textarea[id]').forEach(el=>obj.fields[el.id]=el.value);obj.weeks=[...document.querySelectorAll('.week-shell')].map(readWeek);obj.allocations=allocations();return obj;}

$('referenceClose').onclick=closeCurriculumReference;
$('referenceModal').addEventListener('click',e=>{if(e.target===$('referenceModal'))closeCurriculumReference();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCurriculumReference();});

$('saveBtn').onclick=()=>{localStorage.setItem('integratedUnitPlanner',JSON.stringify(serialize()));$('saveBtn').textContent='Saved ✓';setTimeout(()=>$('saveBtn').textContent='Save in browser',1400);};
function restore(){try{const o=JSON.parse(localStorage.getItem('integratedUnitPlanner'));if(!o)return;state.years.splice(0,state.years.length,...(o.state.years||[]));state.subjects.splice(0,state.subjects.length,...(o.state.subjects||[]));state.standards=new Set(o.state.standards||[]);state.needs.splice(0,state.needs.length,...(o.state.needs||[]));Object.entries(o.fields||{}).forEach(([k,v])=>{if($(k))$(k).value=v});document.querySelectorAll('#yearChoices .chip').forEach(b=>b.classList.toggle('selected',state.years.includes(b.textContent)));document.querySelectorAll('#subjectChoices .chip').forEach((b,i)=>b.classList.toggle('selected',state.subjects.includes(SUBJECTS[i])));document.querySelectorAll('#needChoices .chip').forEach(b=>b.classList.toggle('selected',state.needs.includes(b.textContent)));renderCurriculum();renderAllocations();if(o.allocations){Object.entries(o.allocations).forEach(([sub,a])=>{const c=document.querySelector(`.alloc-count[data-sub="${CSS.escape(sub)}"]`),m=document.querySelector(`.alloc-mins[data-sub="${CSS.escape(sub)}"]`);if(c)c.value=a[0];if(m)m.value=a[1];});}buildWeeks();(o.weeks||[]).forEach((d,i)=>{const old=document.querySelectorAll('.week-shell')[i];if(old){const nw=weekShell(i+1,d);old.replaceWith(nw);}});}catch(e){console.warn(e)}}
restore();
// Rebuild assessment-year controls after any saved unit state has been restored.
// The initial render happens before localStorage is read, so without this refresh
// a valid multi-age unit can incorrectly show "Select year levels... first".
activeAssessmentYear='';
renderAssessmentYearBuilder();
renderAssessmentAlignment();
renderTaskDirections();
loadAssessmentYearDraft('');

document.querySelectorAll('.step').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.step').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  // Always refresh the year-level assessment selector when teachers enter Step 4.
  // This keeps it in sync with any year levels or Achievement Standards changed in Steps 1–2.
  if(b.dataset.target==='assessment'){
    renderAssessmentYearBuilder();
    renderAssessmentAlignment();
    renderTaskDirections();
    if(activeAssessmentYear&&!document.querySelector('.evidence-component'))loadAssessmentYearDraft(activeAssessmentYear);else if(!activeAssessmentYear)loadAssessmentYearDraft('');
  }
  document.getElementById(b.dataset.target).scrollIntoView({behavior:'smooth',block:'start'});
});
refreshPreview();
