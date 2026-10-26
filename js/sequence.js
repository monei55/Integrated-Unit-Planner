import {
  unitPlan,
  getAssessment,
  updateUnitPlan
} from "./state.js";

import {
  getSelectedCurriculumRows
} from "./curriculum.js";


// ============================================================
// STEP 5 — TEACHING & LEARNING SEQUENCE
// ============================================================

export function initSequencePage() {

  loadSavedBackwardPlanning();

  bindBackwardPlanningFields();

  bindClick(
    "suggestBackwardPlanning",
    suggestBackwardPlanning
  );

  bindClick(
    "buildReadinessCheck",
    buildAssessmentReadiness
  );

  bindClick(
    "suggestTeachingPriorities",
    buildTeachingPriorities
  );

  bindClick(
    "buildWeeks",
    buildWeeklySequence
  );

  bindClick(
    "suggestSequence",
    suggestWeeklySequence
  );

  renderSavedReadiness();

  renderSavedTeachingPriorities();

  renderSavedWeeklySequence();

}


// ============================================================
// BACKWARD PLANNING — KNOW / UNDERSTAND / DO
// ============================================================

function loadSavedBackwardPlanning() {

  setValue(
    "sequenceKnow",
    normaliseText(
      unitPlan.sequence?.know
    )
  );

  setValue(
    "sequenceUnderstand",
    normaliseText(
      unitPlan.sequence?.understand
    )
  );

  setValue(
    "sequenceDo",
    normaliseText(
      unitPlan.sequence?.do
    )
  );

}


function bindBackwardPlanningFields() {

  bindField(
    "sequenceKnow",
    "sequence.know"
  );

  bindField(
    "sequenceUnderstand",
    "sequence.understand"
  );

  bindField(
    "sequenceDo",
    "sequence.do"
  );

}


// ============================================================
// BACKWARD PLANNING SUGGESTIONS
// ============================================================

function suggestBackwardPlanning() {

  const rows =
    getSelectedCurriculumRows();


  const output =
    document.getElementById(
      "backwardPlanningSuggestions"
    );


  if (!rows.length) {

    if (output) {

      output.innerHTML = `

        <div class="empty">

          Select Achievement Standard aspects
          in Step 2 before generating backward
          planning suggestions.

        </div>

      `;

    }

    return;

  }


  const assessmentComponents =
    getAssessmentComponentsAcrossYears();


  const knowText =
    bulletText(
      buildKnowSuggestions(
        rows
      )
    );


  const understandText =
    bulletText(
      buildUnderstandSuggestions(
        rows
      )
    );


  const doText =
    bulletText(
      buildDoSuggestions(
        rows,
        assessmentComponents
      )
    );


  setValue(
    "sequenceKnow",
    knowText
  );

  setValue(
    "sequenceUnderstand",
    understandText
  );

  setValue(
    "sequenceDo",
    doText
  );


  updateUnitPlan(
    "sequence.know",
    knowText
  );

  updateUnitPlan(
    "sequence.understand",
    understandText
  );

  updateUnitPlan(
    "sequence.do",
    doText
  );


  if (output) {

    output.innerHTML = `

      <strong>
        Suggested backward-planning lens
      </strong>

      <p>
        These suggestions have been drawn from
        the selected Achievement Standard aspects
        and the assessment evidence mapped in Step 4.
      </p>

      <p>
        Edit them to reflect the exact content,
        vocabulary, texts, examples and teaching
        sequence for this unit.
      </p>

      <p>

        <strong>
          Important:
        </strong>

        the planner is identifying likely teaching
        requirements, not replacing teacher
        curriculum judgement.

      </p>

    `;

  }

}


// ============================================================
// KNOW
// ============================================================

function buildKnowSuggestions(
  rows
) {

  const suggestions = [];


  Object.entries(
    rowsGroupedBySubject(
      rows
    )
  )
    .forEach(
      ([subject, subjectRows]) => {

        const text =
          combinedRowText(
            subjectRows
          );


        const requirements = [];


        if (
          /vocab|terminolog|language feature|topic-specific|technical language/
            .test(
              text
            )
        ) {

          requirements.push(
            "the topic-specific, disciplinary and academic vocabulary required to understand and communicate the learning"
          );

        }


        if (
          /source|text|information|data|evidence|graph|table|map|image/
            .test(
              text
            )
        ) {

          requirements.push(
            "the background knowledge needed to make sense of the texts, sources, information, representations or data used in the unit"
          );

        }


        requirements.push(
          "the essential facts, examples, content knowledge and subject-specific concepts students will need to retrieve independently"
        );


        suggestions.push(
          `${subject}: students need to know ${joinNaturalList(
            unique(
              requirements
            )
          )}.`
        );

      }
    );


  return suggestions.length
    ? unique(
        suggestions
      )
    : [
        "Students need to know the essential facts, terminology, examples and background knowledge required to understand the unit and complete the assessment successfully."
      ];

}


// ============================================================
// UNDERSTAND
// ============================================================

function buildUnderstandSuggestions(
  rows
) {

  const suggestions = [];


  Object.entries(
    rowsGroupedBySubject(
      rows
    )
  )
    .forEach(
      ([subject, subjectRows]) => {

        const text =
          combinedRowText(
            subjectRows
          );


        const concepts = [];


        if (
          /similarit|difference|compare|connection|relationship|interconnect/
            .test(
              text
            )
        ) {

          concepts.push(
            "how ideas, people, places, information or features are connected, similar or different"
          );

        }


        if (
          /cause|effect|why|how|explain/
            .test(
              text
            )
        ) {

          concepts.push(
            "how and why important events, ideas, processes or relationships occur"
          );

        }


        if (
          /perspective|viewpoint/
            .test(
              text
            )
        ) {

          concepts.push(
            "that information, events and issues can be represented or understood from different perspectives"
          );

        }


        if (
          /pattern|trend/
            .test(
              text
            )
        ) {

          concepts.push(
            "how patterns or trends can be identified and what they may reveal"
          );

        }


        if (
          /significance|meaning|purpose|audience/
            .test(
              text
            )
        ) {

          concepts.push(
            "how significance, purpose, audience and meaning influence the way information or ideas are understood and communicated"
          );

        }


        if (
          !concepts.length
        ) {

          concepts.push(
            "the important concepts and relationships that sit behind the factual content rather than simply recalling isolated information"
          );

        }


        suggestions.push(
          `${subject}: students need to understand ${joinNaturalList(
            unique(
              concepts
            )
          )}.`
        );

      }
    );


  return suggestions.length
    ? unique(
        suggestions
      )
    : [
        "Students need to understand the major concepts, relationships and principles that allow them to make meaning from the content."
      ];

}


// ============================================================
// DO — COGNITIVE DEMANDS
// ============================================================

const COGNITIVE_VERBS = [

  "identify",
  "recognise",
  "describe",
  "explain",
  "compare",
  "classify",

  "analyse",
  "analyze",

  "interpret",
  "evaluate",
  "justify",

  "create",
  "construct",
  "demonstrate",
  "apply",
  "use",

  "develop",
  "propose",
  "select",

  "organise",
  "organize",

  "group",
  "sequence",
  "link",
  "locate",
  "collect",
  "represent",

  "investigate",
  "plan",
  "perform",
  "communicate",
  "infer",

  "summarise",
  "summarize",

  "read",
  "view",
  "comprehend",
  "write",
  "present"

];


function buildDoSuggestions(
  rows,
  assessmentComponents
) {

  const suggestions = [];


  Object.entries(
    rowsGroupedBySubject(
      rows
    )
  )
    .forEach(
      ([subject, subjectRows]) => {

        const verbs =
          unique(
            subjectRows.flatMap(
              (row) =>
                findCognitiveVerbs(
                  row.text
                )
            )
          );


        const actions =
          buildSubjectPriorityActions(
            verbs
          );


        if (
          actions.length
        ) {

          suggestions.push(
            `${subject}: explicitly teach students to ${joinNaturalList(
              actions
            )}.`
          );

        }

      }
    );


  const formats =
    unique(
      assessmentComponents
        .map(
          (component) =>
            component.evidenceFormat
        )
        .filter(
          (format) =>
            format &&
            format !== "__own"
        )
    );


  if (
    formats.length
  ) {

    suggestions.push(
      `Assessment preparation: provide guided practice and opportunities for independent application using the response formats students will encounter in the assessment, including ${joinNaturalList(
        formats
      )}.`
    );

  }


  const assessmentActions =
    buildAssessmentPracticeActions(
      unique(
        assessmentComponents
          .flatMap(
            (component) =>
              component.verbs ||
              []
          )
      )
    );


  if (
    assessmentActions.length
  ) {

    suggestions.push(
      `Assessment preparation: before summative assessment, ensure students have independently practised ${joinNaturalList(
        assessmentActions
      )}.`
    );

  }


  return suggestions.length
    ? unique(
        suggestions
      )
    : [
        "Explicitly teach, model and provide guided practice in the key processes and cognitive demands students must later demonstrate independently."
      ];

}


// ============================================================
// COGNITIVE / PRACTICE LANGUAGE
// ============================================================

function buildSubjectPriorityActions(
  verbs
) {

  const actions = [];


  if (
    includesAny(
      verbs,
      [
        "read",
        "view",
        "comprehend"
      ]
    )
  ) {

    actions.push(
      "read, view and comprehend relevant texts, sources or representations"
    );

  }


  if (
    includesAny(
      verbs,
      [
        "identify",
        "recognise",
        "select",
        "locate"
      ]
    )
  ) {

    actions.push(
      "identify and select relevant information, features or relationships"
    );

  }


  if (
    includesAny(
      verbs,
      [
        "interpret",
        "analyse",
        "infer"
      ]
    )
  ) {

    actions.push(
      "interpret and analyse information or evidence to make meaning and draw appropriate inferences"
    );

  }


  if (
    includesAny(
      verbs,
      [
        "describe",
        "explain",
        "compare"
      ]
    )
  ) {

    actions.push(
      "describe and explain key ideas, features, similarities, differences or relationships"
    );

  }


  if (
    includesAny(
      verbs,
      [
        "organise",
        "sequence",
        "group",
        "link"
      ]
    )
  ) {

    actions.push(
      "organise, sequence and link ideas logically"
    );

  }


  if (
    includesAny(
      verbs,
      [
        "create",
        "construct",
        "represent",
        "communicate",
        "write",
        "present"
      ]
    )
  ) {

    actions.push(
      "create and communicate an appropriate written, oral, visual, practical or multimodal response for the required purpose"
    );

  }


  if (
    includesAny(
      verbs,
      [
        "use",
        "apply"
      ]
    )
  ) {

    actions.push(
      "apply the required language features, conventions, knowledge, strategies or processes appropriately"
    );

  }


  if (
    includesAny(
      verbs,
      [
        "develop",
        "plan",
        "investigate",
        "collect"
      ]
    )
  ) {

    actions.push(
      "develop questions or plans, investigate appropriately and gather relevant information or evidence"
    );

  }


  if (
    includesAny(
      verbs,
      [
        "evaluate",
        "justify",
        "propose"
      ]
    )
  ) {

    actions.push(
      "make, justify and communicate considered judgements, conclusions, proposals or responses"
    );

  }


  if (
    includesAny(
      verbs,
      [
        "demonstrate",
        "perform"
      ]
    )
  ) {

    actions.push(
      "demonstrate or perform the required skills and processes safely, accurately and independently"
    );

  }


  if (
    verbs.includes(
      "classify"
    )
  ) {

    actions.push(
      "classify information, objects or ideas using appropriate characteristics or criteria"
    );

  }


  if (
    verbs.includes(
      "summarise"
    )
  ) {

    actions.push(
      "summarise the most important information or ideas concisely"
    );

  }


  return unique(
    actions
  );

}


function buildAssessmentPracticeActions(
  verbs
) {

  return buildSubjectPriorityActions(
    verbs
  )
    .map(
      (action) =>
        action
          .replace(
            /^read, view and comprehend/,
            "reading, viewing and comprehending"
          )
          .replace(
            /^identify and select/,
            "identifying and selecting"
          )
          .replace(
            /^interpret and analyse/,
            "interpreting and analysing"
          )
          .replace(
            /^describe and explain/,
            "describing and explaining"
          )
          .replace(
            /^organise, sequence and link/,
            "organising, sequencing and linking"
          )
          .replace(
            /^create and communicate/,
            "creating and communicating"
          )
          .replace(
            /^apply/,
            "applying"
          )
          .replace(
            /^develop/,
            "developing"
          )
          .replace(
            /^make, justify and communicate/,
            "making, justifying and communicating"
          )
          .replace(
            /^demonstrate or perform/,
            "demonstrating or performing"
          )
          .replace(
            /^classify/,
            "classifying"
          )
          .replace(
            /^summarise/,
            "summarising"
          )
    );

}


// ============================================================
// ASSESSMENT READINESS
// ============================================================

// One readiness checklist per selected year level. Individual assessment
// components remain in Step 4 and are not changed by this summary.
const READINESS_CRITERIA = [
  ["knowledge", "The background knowledge and content needed across the assessment have been explicitly taught."],
  ["vocabulary", "Essential vocabulary and task language have been explicitly taught and revisited."],
  ["modelling", "The assessed skills and cognitive demands have been explicitly modelled."],
  ["guided", "Students have completed guided practice with feedback across the assessed skills."],
  ["format", "Students have practised the required response formats before summative assessment."],
  ["independent", "Students have independently applied the assessed knowledge and skills before summative assessment."],
  ["adjustments", "Required adjustments support access without providing the knowledge or thinking being assessed."]
];

function readinessComponentsForYear(yearLevel) {
  const assessment = getAssessment(yearLevel);
  return (assessment?.components || []).filter(
    component => component?.selectedStandardCodes?.length
  );
}

function readinessCriteriaForYear(yearLevel) {
  const components = readinessComponentsForYear(yearLevel);
  const rows = selectedRowsForYear(yearLevel);
  const selectedCodes = new Set(
    components.flatMap(component => component.selectedStandardCodes || [])
  );
  const matchedRows = rows.filter(row => selectedCodes.has(row.code));
  const verbs = unique(matchedRows.flatMap(row => findCognitiveVerbs(row.text || "")));
  const formats = unique(components.map(component => component.evidenceFormat)
    .filter(format => format && format !== "__own"));
  const subjects = unique(matchedRows.map(row => row.subject).filter(Boolean));
  return {components, verbs, formats, subjects};
}

function buildAssessmentReadiness() {
  const existing = unitPlan.sequence?.readinessChecks || {};
  const readiness = {};

  getUnitYears().forEach(yearLevel => {
    const info = readinessCriteriaForYear(yearLevel);
    if (!info.components.length) return;

    // Preserve already-saved year-level decisions. Old per-question decisions
    // cannot safely be treated as whole-year approval, so start unchecked.
    const previous = existing[yearLevel];
    const saved = !Array.isArray(previous) && previous?.scope === "year"
      ? previous : null;
    readiness[yearLevel] = {
      scope: "year",
      componentIds: info.components.map(component => component.id),
      checks: READINESS_CRITERIA.map(([id, label]) => ({
        id,
        label,
        checked: Boolean(saved?.checks?.find(check => check.id === id)?.checked)
      }))
    };
  });

  updateUnitPlan("sequence.readinessChecks", readiness);
  renderSavedReadiness();
}

function renderSavedReadiness() {
  const container = document.getElementById("assessmentReadiness");
  if (!container) return;
  const saved = unitPlan.sequence?.readinessChecks || {};
  const years = getUnitYears().filter(year => readinessComponentsForYear(year).length);

  if (!years.length) {
    container.innerHTML = '<div class="empty">Build the year-level assessment in Step 4, then select <strong>Build readiness check</strong>.</div>';
    return;
  }

  container.innerHTML = years.map(yearLevel => {
    const info = readinessCriteriaForYear(yearLevel);
    const yearData = saved[yearLevel];
    const checks = yearData && !Array.isArray(yearData) && yearData.scope === "year"
      ? yearData.checks || []
      : READINESS_CRITERIA.map(([id, label]) => ({id, label, checked: false}));
    const count = checks.filter(check => check.checked).length;
    const verbs = info.verbs.map(verb => verb.toUpperCase()).join(", ");
    return `
      <section class="readiness-year" data-readiness-year="${escapeAttribute(yearLevel)}">
        <div class="readiness-year-head">
          <h4>${escapeHtml(yearLevel)}</h4>
          <span>${count} of ${checks.length} confirmed · ${info.components.length} assessment components considered</span>
        </div>
        <article class="readiness-card">
          <div class="readiness-card-head"><div>
            <strong>Whole-year-level assessment readiness</strong>
            <p>Confirm each requirement once across all assessment components for ${escapeHtml(yearLevel)}.</p>
          </div></div>
          ${info.subjects.length ? `<div class="readiness-subjects">${info.subjects.map(subject => `<span>${escapeHtml(subject)}</span>`).join("")}</div>` : ""}
          ${verbs ? `<p><strong>Assessed cognitive demands:</strong> ${escapeHtml(verbs)}</p>` : ""}
          ${info.formats.length ? `<p><strong>Response formats:</strong> ${escapeHtml(info.formats.join("; "))}</p>` : ""}
          <div class="readiness-checks">${checks.map(check => `
            <label class="readiness-check">
              <input type="checkbox" data-year-check="${escapeAttribute(check.id)}" ${check.checked ? "checked" : ""}>
              <span>${escapeHtml(check.label)}</span>
            </label>`).join("")}</div>
        </article>
      </section>`;
  }).join("");

  container.querySelectorAll("[data-readiness-year]").forEach(section => {
    const yearLevel = section.dataset.readinessYear;
    section.querySelectorAll("input[data-year-check]").forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const readiness = structuredClone(unitPlan.sequence?.readinessChecks || {});
        const existingYear = readiness[yearLevel];
        const current = existingYear && !Array.isArray(existingYear) && existingYear.scope === "year"
          ? existingYear
          : {scope: "year", componentIds: readinessComponentsForYear(yearLevel).map(c => c.id),
             checks: READINESS_CRITERIA.map(([id, label]) => ({id, label, checked: false}))};
        const item = current.checks.find(check => check.id === checkbox.dataset.yearCheck);
        if (!item) return;
        item.checked = checkbox.checked;
        readiness[yearLevel] = current;
        updateUnitPlan("sequence.readinessChecks", readiness);
        const progress = section.querySelector(".readiness-year-head span");
        if (progress) progress.textContent = `${current.checks.filter(check => check.checked).length} of ${current.checks.length} confirmed · ${readinessComponentsForYear(yearLevel).length} assessment components considered`;
      });
    });
  });
}

// ============================================================
// TEACHING PRIORITIES
// ============================================================

function buildTeachingPriorities() {
  const rows = getSelectedCurriculumRows();
  const container = document.getElementById("teachingPriorities");
  if (!rows.length) {
    if (container) container.innerHTML = '<div class="empty">Select Achievement Standard aspects in Step 2 first.</div>';
    return;
  }
  const previous = Array.isArray(unitPlan.sequence?.teachingPriorities)
    ? unitPlan.sequence.teachingPriorities : [];
  if (previous.length && !window.confirm(
    "Refresh teaching priorities? Existing priorities and teacher notes will be kept; only new suggestions will be added."
  )) return;
  const result = [...previous];
  const existingKeys = new Set(previous.map(item =>
    `${item.subject}|${String(item.focus || "").replace(/^•\s*/, "").trim().toLowerCase()}`));
  Object.entries(rowsGroupedBySubject(rows)).forEach(([subject, subjectRows]) => {
    conciseTeachingTargets(subjectRows).slice(0, 5).forEach(focus => {
      const key = `${subject}|${focus.trim().toLowerCase()}`;
      if (!existingKeys.has(key)) {
        result.push(makePriority("Explicit teaching", subject, "• " + focus,
          "", "Curriculum + assessment"));
        existingKeys.add(key);
      }
    });
  });
  updateUnitPlan("sequence.teachingPriorities", result);
  renderSavedTeachingPriorities();
}

function conciseTeachingTargets(rows) {
  const targets = [];
  const combined = rows.map(r => String(r.text || "").toLowerCase()).join(" ");
  const add = (pattern, label) => { if (pattern.test(combined)) targets.push(label); };
  add(/phonic|spelling|decod|morphem/, "Model decoding, spelling and word-building using unit vocabulary.");
  add(/vocab|language|terminolog/, "Explicitly teach and revisit key vocabulary in context.");
  add(/read|view|comprehen|text|source/, "Read or view sources; model locating and discussing evidence.");
  add(/natural|managed|constructed|feature|place/, "Identify and classify features of places using photographs and maps.");
  add(/question|collect|sort|record|data|observ/, "Model questioning, observing, sorting and recording information.");
  add(/conclusion|propos|care for/, "Draw conclusions from observations and propose practical actions.");
  add(/sequence|recount|narrativ|past|event/, "Sequence key events and model an oral or written recount.");
  add(/create|write|present|communicat|share/, "Model, jointly construct and independently create the required response.");
  add(/explain|compare|describ|identify/, "Model the required descriptions and explanations with worked examples.");
  if (!targets.length) {
    rows.slice(0, 3).forEach(row => {
      const verbs = findCognitiveVerbs(row.text || "");
      targets.push("Model and practise how to " + (verbs[0] || "demonstrate") + " the selected learning.");
    });
  }
  return unique(targets);
}


function makePriority(
  type,
  subject,
  focus,
  reason,
  source
) {

  return {

    id:
      crypto.randomUUID(),

    type,

    subject,

    focus,

    reason,

    source,

    teacherNote:
      "",

    completed:
      false

  };

}


function mergePriorities(
  generated,
  existing
) {

  const map =
    new Map(
      existing.map(
        (item) => [
          priorityKey(
            item
          ),
          item
        ]
      )
    );


  return generated.map(
    (item) => {

      const previous =
        map.get(
          priorityKey(
            item
          )
        );


      return previous
        ? {

            ...item,

            id:
              previous.id ||
              item.id,

            teacherNote:
              previous.teacherNote ||
              "",

            completed:
              Boolean(
                previous.completed
              )

          }
        : item;

    }
  );

}


function priorityKey(
  item
) {

  return [

    item.type || "",
    item.subject || "",
    item.focus || ""

  ]
    .join("|")
    .toLowerCase();

}


function renderSavedTeachingPriorities() {
  const container = document.getElementById("teachingPriorities");
  if (!container) return;
  const priorities = Array.isArray(unitPlan.sequence?.teachingPriorities)
    ? unitPlan.sequence.teachingPriorities : [];
  if (!priorities.length) {
    container.innerHTML = '<div class="empty">Select <strong>Suggest priorities</strong> to create teaching focuses.</div>';
    return;
  }
  const subjects = groupBy(priorities, item => item.subject || "Integrated");
  container.innerHTML = Object.entries(subjects).map(([subject, items]) => `
    <section class="priority-group" style="margin-bottom:14px;">
      <h4>${escapeHtml(subject)}</h4>
      <textarea class="grouped-priority-text" data-subject="${escapeAttribute(subject)}"
        rows="${Math.max(4, items.length + 1)}" style="width:100%;line-height:1.7;"
        aria-label="${escapeAttribute(subject)} teaching priorities">${escapeHtml(items.map(item =>
          "• " + String(item.focus || "").replace(/^\s*[•-]\s*/, "").trim()).join("\n"))}</textarea>
      <p style="font-size:.8em;opacity:.75;">One dot point per priority. Edit directly; changes save automatically.</p>
    </section>`).join("");
  container.querySelectorAll(".grouped-priority-text").forEach(area => {
    area.addEventListener("change", () => {
      const subject = area.dataset.subject;
      const lines = area.value.split(/\n/).map(v => v.replace(/^\s*[•-]\s*/, "").trim()).filter(Boolean);
      const saved = Array.isArray(unitPlan.sequence?.teachingPriorities)
        ? [...unitPlan.sequence.teachingPriorities] : [];
      const old = saved.filter(item => item.subject === subject);
      const others = saved.filter(item => item.subject !== subject);
      const updated = lines.map((focus, i) => ({
        ...(old[i] || makePriority("Explicit teaching", subject, "", "", "Curriculum + assessment")),
        focus: "• " + focus
      }));
      updateUnitPlan("sequence.teachingPriorities", [...others, ...updated]);
    });
  });
}

function teachingPriorityHtml(priority) {
  return `<article class="teaching-priority-card" data-priority="${escapeAttribute(priority.id)}"
    style="display:flex;gap:10px;align-items:flex-start;margin:8px 0;padding:10px;">
    <input type="checkbox" class="priority-complete" ${priority.completed ? "checked" : ""}
      aria-label="Mark teaching priority as addressed">
    <div style="flex:1;min-width:0;">
      <strong>${escapeHtml(priority.subject || "")}</strong>
      <textarea class="priority-focus" rows="2" style="width:100%;margin-top:5px;">${escapeHtml(priority.focus || "")}</textarea>
      <details><summary style="cursor:pointer;font-size:.85em;">Teacher note</summary>
        <textarea class="priority-note" rows="2" style="width:100%;" placeholder="Optional teaching notes">${escapeHtml(priority.teacherNote || "")}</textarea>
      </details>
    </div>
  </article>`;
}

function bindTeachingPriorityEvents() {

  document
    .querySelectorAll(
      ".teaching-priority-card"
    )
    .forEach(
      (card) => {

        const id =
          card.dataset.priority;


        bindLocalInput(
          card,
          ".priority-complete",
          "change",
          (event) => {

            updatePriority(
              id,
              {
                completed:
                  event.target.checked
              }
            );

          }
        );


        bindLocalInput(
          card,
          ".priority-focus",
          "input",
          (event) => {

            updatePriority(
              id,
              {
                focus:
                  event.target.value
              }
            );

          }
        );


        bindLocalInput(
          card,
          ".priority-note",
          "input",
          (event) => {

            updatePriority(
              id,
              {
                teacherNote:
                  event.target.value
              }
            );

          }
        );

      }
    );

}


function updatePriority(
  priorityId,
  changes
) {

  const priorities =
    Array.isArray(
      unitPlan.sequence
        ?.teachingPriorities
    )
      ? [
          ...unitPlan.sequence
            .teachingPriorities
        ]
      : [];


  updateUnitPlan(
    "sequence.teachingPriorities",
    priorities.map(
      (priority) =>
        priority.id ===
        priorityId
          ? {
              ...priority,
              ...changes
            }
          : priority
    )
  );

}


// ============================================================
// WEEKLY LEARNING SEQUENCE — BUILD
// ============================================================

function buildWeeklySequence() {

  const weekCount =
    getConfiguredWeekCount();


  const allocations =
    getConfiguredLessonAllocations();


  const existing =
    getWeeks();


  const weeks =
    Array.from(
      {
        length:
          weekCount
      },
      (_, index) => {

        const number =
          index + 1;


        const previous =
          existing.find(
            (week) =>
              Number(
                week.number
              ) ===
              number
          );


        return buildWeekRecord(
          number,
          allocations,
          previous,
          weekCount
        );

      }
    );


  saveWeeks(
    weeks
  );


  renderSavedWeeklySequence();

}


function getConfiguredWeekCount() {

  const setup =
    unitPlan.setup ||
    {};


  const candidates = [

    setup.numberOfWeeks,
    setup.weekCount,
    setup.unitWeeks,
    setup.durationWeeks,
    setup.termWeeks,
    setup.weeks

  ];


  for (
    const candidate of
    candidates
  ) {

    if (
      Array.isArray(
        candidate
      ) &&
      candidate.length
    ) {

      return candidate.length;

    }


    const number =
      Number(
        candidate
      );


    if (
      Number.isFinite(
        number
      ) &&
      number > 0
    ) {

      return clamp(
        Math.round(
          number
        ),
        1,
        20
      );

    }

  }


  return 10;

}


function getConfiguredLessonAllocations() {

  const setup =
    unitPlan.setup ||
    {};


  const sources = [

    setup.lessonAllocations,
    setup.weeklyLessons,
    setup.learningAreaLessons,
    setup.allocations,
    setup.lessonsPerWeek

  ];


  for (
    const source of
    sources
  ) {

    const parsed =
      parseLessonAllocationSource(
        source
      );


    if (
      parsed.length
    ) {

      return parsed;

    }

  }


  // ----------------------------------------------------------
  // FALLBACK
  // ----------------------------------------------------------
  // Only used if the exact Unit Setup allocation structure
  // cannot be found.
  //
  // English remains 5 x 1-hour lessons each week.
  // ----------------------------------------------------------

  const subjects =
    unique(
      getSelectedCurriculumRows()
        .map(
          (row) =>
            row.subject
        )
    );


  const fallbackCounts = {

    English:
      5,

    Mathematics:
      5,

    HASS:
      1,

    Science:
      1,

    "Health and Physical Education":
      1,

    HPE:
      1,

    Technologies:
      1,

    "Design and Technologies":
      1,

    "Digital Technologies":
      1,

    "The Arts":
      1,

    Dance:
      1,

    Drama:
      1,

    Music:
      1,

    "Media Arts":
      1,

    "Visual Arts":
      1

  };


  if (
    subjects.length
  ) {

    return subjects.map(
      (subject) => ({

        subject,

        count:
          fallbackCounts[
            subject
          ] ||
          1

      })
    );

  }


  const setupAreas =
    Array.isArray(
      setup.learningAreas
    )
      ? setup.learningAreas
      : [];


  return setupAreas
    .map(
      (subject) => ({

        subject:
          String(
            subject
          ),

        count:
          fallbackCounts[
            subject
          ] ||
          1

      })
    )
    .filter(
      (item) =>
        item.subject
    );

}


function parseLessonAllocationSource(
  source
) {

  if (
    !source
  ) {

    return [];

  }


  if (
    Array.isArray(
      source
    )
  ) {

    return source
      .map(
        (item) => {

          if (
            typeof item ===
            "string"
          ) {

            return {
              subject:
                item,
              count:
                1
            };

          }


          if (
            !item ||
            typeof item !==
            "object"
          ) {

            return null;

          }


          return {

            subject:
              item.subject ||
              item.learningArea ||
              item.name ||
              "",

            count:
              normaliseLessonCount(
                item.count ??
                item.lessons ??
                item.perWeek ??
                1
              )

          };

        }
      )
      .filter(
        (item) =>
          item?.subject &&
          item.count > 0
      );

  }


  if (
    typeof source ===
    "object"
  ) {

    return Object.entries(
      source
    )
      .map(
        ([subject, value]) => ({

          subject,

          count:
            normaliseLessonCount(
              value
            )

        })
      )
      .filter(
        (item) =>
          item.subject &&
          item.count > 0
      );

  }


  return [];

}


function normaliseLessonCount(
  value
) {

  if (
    value &&
    typeof value ===
    "object"
  ) {

    value =
      value.count ??
      value.lessons ??
      value.perWeek ??
      value.number ??
      0;

  }


  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? clamp(
        Math.round(
          number
        ),
        0,
        20
      )
    : 0;

}


function buildWeekRecord(
  number,
  allocations,
  previous,
  totalWeeks
) {

  const plannedLessons =
    buildAllocatedLessons(
      allocations
    );


  const existingLessons =
    Array.isArray(
      previous?.lessons
    )
      ? previous.lessons
      : [];


  const lessons =
    plannedLessons.map(
      (planned, index) => {

        const previousLesson =

          existingLessons.find(
            (lesson) =>
              lesson.slotKey ===
              planned.slotKey
          ) ||

          existingLessons[
            index
          ];


        return previousLesson
          ? {

              ...planned,

              ...previousLesson,

              id:
                previousLesson.id ||
                planned.id,

              slotKey:
                planned.slotKey

            }
          : planned;

      }
    );


  return {

    id:
      previous?.id ||
      crypto.randomUUID(),

    number,

    focus:
      previous?.focus ||
      "",

    phase:
      previous?.phase ||
      suggestedWeekPhase(
        number,
        totalWeeks
      ),

    lessons,

    formativeCheck:
      previous?.formativeCheck ||
      "",

    vocabulary:
      previous?.vocabulary ||
      "",

    adjustments:
      previous?.adjustments ||
      "",

    resources:
      previous?.resources ||
      "",

    notes:
      previous?.notes ||
      ""

  };

}


function buildAllocatedLessons(
  allocations
) {

  const lessons = [];


  allocations
    .forEach(
      (allocation) => {

        for (
          let index = 1;
          index <=
            allocation.count;
          index++
        ) {

          lessons.push({

            id:
              crypto.randomUUID(),

            slotKey:
              `${allocation.subject}::${index}`,

            subject:
              allocation.subject,

            phase:
              "",

            purpose:
              "",

            activity:
              "",

            evidence:
              "",

            integration:
              ""

          });

        }

      }
    );


  return lessons.length
    ? lessons
    : [

        {

          id:
            crypto.randomUUID(),

          slotKey:
            "Integrated::1",

          subject:
            "Integrated",

          phase:
            "",

          purpose:
            "",

          activity:
            "",

          evidence:
            "",

          integration:
            ""

        }

      ];

}


function suggestedWeekPhase(
  weekNumber,
  totalWeeks
) {

  const ratio =
    weekNumber /
    Math.max(
      totalWeeks,
      1
    );


  if (
    ratio <= 0.25
  ) {

    return "Explicit teaching";

  }


  if (
    ratio <= 0.5
  ) {

    return "Modelled instruction";

  }


  if (
    ratio <= 0.75
  ) {

    return "Guided practice";

  }


  return "Independent application";

}


// ============================================================
// WEEKLY LEARNING SEQUENCE — RENDER
// ============================================================

function renderSavedWeeklySequence() {

  const container =
    document.getElementById(
      "weeksContainer"
    );


  if (
    !container
  ) {

    return;

  }


  const weeks =
    getWeeks();


  if (
    !weeks.length
  ) {

    container.innerHTML = `

      <div class="empty">

        Select

        <strong>
          Build / refresh weeks
        </strong>

        to create the weekly learning sequence
        from the current Unit Setup.

      </div>

    `;

    return;

  }


  // Compact, lesson-per-dot-point weekly overview; full editor remains available.
  container.innerHTML = weeks.map(week => {
    const groups = {};
    (week.lessons || []).forEach(lesson => {
      const subject = lesson.subject || "Integrated";
      (groups[subject] ||= []).push(lesson);
    });
    const overview = Object.entries(groups).map(([subject, lessons]) => `
      <section style="margin:12px 0;">
        <strong>${escapeHtml(subject)} — ${lessons.length} lesson${lessons.length === 1 ? "" : "s"}</strong>
        <ul style="margin:6px 0;padding-left:24px;">${lessons.map((lesson, index) => `
          <li style="margin:5px 0;">${escapeHtml(lesson.activity?.replace(/^•\s*/, "").trim() || lesson.purpose || `Lesson ${index + 1}: add teaching focus`)}</li>
        `).join("")}</ul>
      </section>`).join("");
    return `<section class="weekly-overview" style="margin-bottom:16px;">
      <h3>Week ${escapeHtml(week.number)}</h3>${overview}
      <details><summary style="cursor:pointer;margin:8px 0;">Edit weekly lessons and planning details</summary>
        ${weeklySequenceHtml(week)}
      </details>
    </section>`;
  }).join("");
  bindWeeklySequenceEvents();
  return;

  container.innerHTML =
    weeks
      .map(
        (week) =>
          weeklySequenceHtml(
            week
          )
      )
      .join("");


  bindWeeklySequenceEvents();

}


function weeklySequenceHtml(week) {
  const grouped = groupBy(week.lessons || [], lesson => lesson.subject || "Integrated");
  const subjectHtml = Object.entries(grouped).map(([subject, lessons]) => {
    const first = lessons[0];
    const points = lessons.map((lesson, i) => {
      const raw = String(lesson.activity || lesson.purpose || "").trim();
      const line = raw.split(/\n/).find(x => x.trim()) || "";
      return `${i + 1}. ${line.replace(/^\s*[•-]\s*/, "").replace(/^\s*\d+[.)]\s*/, "")}`;
    }).join("\n");
    return `<section class="weekly-subject" data-subject="${escapeAttribute(subject)}"
      style="padding:14px 0;border-bottom:1px solid #d7e0eb;">
      <h4>${escapeHtml(subject)} — ${lessons.length} lesson${lessons.length === 1 ? "" : "s"}</h4>
      <label>Learning intention
        <textarea class="subject-purpose" rows="2" style="width:100%;">${escapeHtml(first.purpose || "")}</textarea>
      </label>
      <label>Teaching and learning — one dot point per lesson
        <textarea class="subject-points" rows="${Math.max(3, lessons.length + 1)}" style="width:100%;line-height:1.7;">${escapeHtml(points)}</textarea>
      </label>
      <label>Formative assessment opportunity
        <textarea class="subject-evidence" rows="2" style="width:100%;">${escapeHtml(first.evidence || "")}</textarea>
      </label>
    </section>`;
  }).join("");
  const integration = (week.lessons || []).map(l => l.integration).find(Boolean) || "";
  return `<section class="week-shell" data-week="${escapeAttribute(week.id)}">
    <div class="week-shell-head"><div><h3>Week ${escapeHtml(week.number)}</h3>
      <input class="week-focus" value="${escapeAttribute(week.focus || "")}" placeholder="Weekly learning focus..."></div>
      <label>Teaching phase<select class="week-phase">${teachingPhaseOptions(week.phase)}</select></label>
    </div>
    <div style="padding:12px 16px;">${subjectHtml}
      <label>Integration connection
        <textarea class="week-integration-summary" rows="2" style="width:100%;">${escapeHtml(integration)}</textarea>
      </label>
      <details style="margin-top:14px;"><summary style="cursor:pointer;font-weight:600;">Edit individual lessons and additional planning details</summary>
        <div class="lesson-stack">${(week.lessons || []).map((lesson, i) => lessonCardHtml(lesson, i)).join("")}</div>
        <div class="week-add-lesson"><button type="button" class="mini add-week-lesson">+ Add lesson / learning experience</button></div>
        <div class="weekly-support">
          ${weekSupportTextarea("Formative check / evidence", "week-formative", week.formativeCheck, "Weekly formative check...")}
          ${weekSupportTextarea("Vocabulary / terminology", "week-vocabulary", week.vocabulary, "Key vocabulary...")}
          ${weekSupportTextarea("Adjustments / scaffolds", "week-adjustments", week.adjustments, "Adjustments...")}
          ${weekSupportTextarea("Resources / texts", "week-resources", week.resources, "Resources...")}
          ${weekSupportTextarea("Teacher notes", "week-notes", week.notes, "Notes...")}
        </div>
      </details>
    </div>
  </section>`;
}

function weekSupportTextarea(
  heading,
  className,
  value,
  placeholder
) {

  return `

    <label class="support-card">

      <h4>
        ${escapeHtml(
          heading
        )}
      </h4>

      <textarea
        class="${escapeAttribute(
          className
        )}"
        rows="3"
        placeholder="${escapeAttribute(
          placeholder
        )}"
      >${escapeHtml(
        value ||
        ""
      )}</textarea>

    </label>

  `;

}


function lessonCardHtml(
  lesson,
  index
) {

  return `

    <article
      class="lesson-card"
      data-lesson="${escapeAttribute(
        lesson.id
      )}"
    >

      <div class="lesson-head">

        <strong>
          Lesson
          ${index + 1}
        </strong>

        <span class="lesson-phase">

          ${escapeHtml(
            lesson.subject ||
            "Integrated"
          )}

        </span>

        <button
          type="button"
          class="mini remove-week-lesson"
        >
          Remove
        </button>

      </div>


      <div class="lesson-fields">

        ${lessonInput(
          "Learning area / integration",
          "lesson-subject",
          lesson.subject,
          "e.g. English + HASS"
        )}

        ${lessonTextarea(
          "Learning intention / purpose",
          "lesson-purpose",
          lesson.purpose,
          "What should students learn or be able to do?"
        )}

        <label>

          Teaching phase

          <select class="lesson-teaching-phase">

            ${teachingPhaseOptions(
              lesson.phase
            )}

          </select>

        </label>

      </div>


      <div class="lesson-fields">

        ${lessonTextarea(
          "Teaching & learning experience",
          "lesson-activity",
          lesson.activity,
          "Explicit teaching, modelling, guided practice, reading, investigation, discussion, writing, performance..."
        )}

        ${lessonTextarea(
          "Formative evidence / check for understanding",
          "lesson-evidence",
          lesson.evidence,
          "What evidence will show whether students are ready to progress?"
        )}

        ${lessonTextarea(
          "Integration connection",
          "lesson-integration",
          lesson.integration,
          "How does this lesson deliberately connect learning areas without duplicating assessment?"
        )}

      </div>

    </article>

  `;

}


function lessonInput(
  label,
  className,
  value,
  placeholder
) {

  return `

    <label>

      ${escapeHtml(
        label
      )}

      <input
        class="${escapeAttribute(
          className
        )}"
        value="${escapeAttribute(
          value ||
          ""
        )}"
        placeholder="${escapeAttribute(
          placeholder
        )}"
      >

    </label>

  `;

}


function lessonTextarea(
  label,
  className,
  value,
  placeholder
) {

  return `

    <label>

      ${escapeHtml(
        label
      )}

      <textarea
        class="${escapeAttribute(
          className
        )}"
        rows="4"
        placeholder="${escapeAttribute(
          placeholder
        )}"
      >${escapeHtml(
        value ||
        ""
      )}</textarea>

    </label>

  `;

}


function teachingPhaseOptions(
  selected
) {

  return [

    "",
    "Explicit teaching",
    "Modelled instruction",
    "Guided practice",
    "Independent application",
    "Review / consolidation",
    "Assessment"

  ]
    .map(
      (phase) => `

        <option
          value="${escapeAttribute(
            phase
          )}"
          ${
            phase ===
            selected
              ? "selected"
              : ""
          }
        >

          ${
            phase ||
            "Choose phase..."
          }

        </option>

      `
    )
    .join("");

}


// ============================================================
// WEEKLY LEARNING SEQUENCE — EVENTS / SAVE
// ============================================================

function bindWeeklySequenceEvents() {

  document
    .querySelectorAll(
      ".week-shell"
    )
    .forEach(
      (weekElement) => {

        const weekId =
          weekElement
            .dataset
            .week;


        [

          [
            ".week-focus",
            "focus"
          ],

          [
            ".week-phase",
            "phase"
          ],

          [
            ".week-formative",
            "formativeCheck"
          ],

          [
            ".week-vocabulary",
            "vocabulary"
          ],

          [
            ".week-adjustments",
            "adjustments"
          ],

          [
            ".week-resources",
            "resources"
          ],

          [
            ".week-notes",
            "notes"
          ]

        ]
          .forEach(
            ([selector, field]) => {

              bindWeekField(
                weekElement,
                selector,
                weekId,
                field
              );

            }
          );


        bindLocalInput(
          weekElement,
          ".add-week-lesson",
          "click",
          () => {

            addWeekLesson(
              weekId
            );

          }
        );


        weekElement
          .querySelectorAll(
            ".lesson-card"
          )
          .forEach(
            (lessonElement) => {

              const lessonId =
                lessonElement
                  .dataset
                  .lesson;


              [

                [
                  ".lesson-subject",
                  "subject"
                ],

                [
                  ".lesson-purpose",
                  "purpose"
                ],

                [
                  ".lesson-teaching-phase",
                  "phase"
                ],

                [
                  ".lesson-activity",
                  "activity"
                ],

                [
                  ".lesson-evidence",
                  "evidence"
                ],

                [
                  ".lesson-integration",
                  "integration"
                ]

              ]
                .forEach(
                  ([selector, field]) => {

                    bindLessonField(
                      lessonElement,
                      selector,
                      weekId,
                      lessonId,
                      field
                    );

                  }
                );


              bindLocalInput(
                lessonElement,
                ".remove-week-lesson",
                "click",
                () => {

                  removeWeekLesson(
                    weekId,
                    lessonId
                  );

                }
              );

            }
          );

      }
    );

  document.querySelectorAll(".week-shell").forEach(section => {
    const weekId = section.dataset.week;
    const saveSubject = (subject, field, value) => {
      const weeks = cloneWeeks();
      const week = weeks.find(w => w.id === weekId);
      if (!week) return;
      const lesson = week.lessons.find(l => (l.subject || "Integrated") === subject);
      if (!lesson) return;
      lesson[field] = value;
      saveWeeks(weeks);
    };
    section.querySelectorAll(".weekly-subject").forEach(group => {
      const subject = group.dataset.subject;
      [[".subject-purpose", "purpose"], [".subject-evidence", "evidence"]].forEach(([selector, field]) => {
        group.querySelector(selector)?.addEventListener("change", e => saveSubject(subject, field, e.target.value));
      });
      group.querySelector(".subject-points")?.addEventListener("change", e => {
        const weeks = cloneWeeks();
        const week = weeks.find(w => w.id === weekId);
        if (!week) return;
        const lessons = week.lessons.filter(l => (l.subject || "Integrated") === subject);
        const lines = e.target.value.split(/\n/).map(v => v.replace(/^\s*(?:\d+[.)]|[•-])\s*/, "").trim());
        lessons.forEach((lesson, i) => { if (i < lines.length) lesson.activity = "• " + lines[i]; });
        saveWeeks(weeks);
      });
    });
    section.querySelector(".week-integration-summary")?.addEventListener("change", e => {
      const weeks = cloneWeeks();
      const week = weeks.find(w => w.id === weekId);
      if (!week || !week.lessons.length) return;
      week.lessons[0].integration = e.target.value;
      saveWeeks(weeks);
    });
  });

}


function bindWeekField(
  weekElement,
  selector,
  weekId,
  field
) {

  const element =
    weekElement
      .querySelector(
        selector
      );


  if (
    !element
  ) {

    return;

  }


  element.addEventListener(
    eventForElement(
      element
    ),
    (event) => {

      updateWeekRecord(
        weekId,
        {
          [field]:
            event.target.value
        }
      );

    }
  );

}


function bindLessonField(
  lessonElement,
  selector,
  weekId,
  lessonId,
  field
) {

  const element =
    lessonElement
      .querySelector(
        selector
      );


  if (
    !element
  ) {

    return;

  }


  element.addEventListener(
    eventForElement(
      element
    ),
    (event) => {

      updateLessonRecord(
        weekId,
        lessonId,
        {
          [field]:
            event.target.value
        }
      );

    }
  );

}


function updateWeekRecord(
  weekId,
  changes
) {

  const weeks =
    cloneWeeks();


  const week =
    weeks.find(
      (item) =>
        item.id ===
        weekId
    );


  if (
    !week
  ) {

    return;

  }


  Object.assign(
    week,
    changes
  );


  saveWeeks(
    weeks
  );

}


function updateLessonRecord(
  weekId,
  lessonId,
  changes
) {

  const weeks =
    cloneWeeks();


  const lesson =
    weeks
      .find(
        (week) =>
          week.id ===
          weekId
      )
      ?.lessons
      ?.find(
        (item) =>
          item.id ===
          lessonId
      );


  if (
    !lesson
  ) {

    return;

  }


  Object.assign(
    lesson,
    changes
  );


  saveWeeks(
    weeks
  );

}


function addWeekLesson(
  weekId
) {

  const weeks =
    cloneWeeks();


  const week =
    weeks.find(
      (item) =>
        item.id ===
        weekId
    );


  if (
    !week
  ) {

    return;

  }


  week.lessons.push({

    id:
      crypto.randomUUID(),

    slotKey:
      `Custom::${Date.now()}`,

    subject:
      "Integrated",

    phase:
      week.phase ||
      "",

    purpose:
      "",

    activity:
      "",

    evidence:
      "",

    integration:
      ""

  });


  saveWeeks(
    weeks
  );


  renderSavedWeeklySequence();

}


function removeWeekLesson(
  weekId,
  lessonId
) {

  const weeks =
    cloneWeeks();


  const week =
    weeks.find(
      (item) =>
        item.id ===
        weekId
    );


  if (
    !week
  ) {

    return;

  }


  week.lessons =
    week.lessons
      .filter(
        (lesson) =>
          lesson.id !==
          lessonId
      );


  saveWeeks(
    weeks
  );


  renderSavedWeeklySequence();

}


// ============================================================
// WEEKLY LEARNING SEQUENCE — SUGGESTIONS
// ============================================================

function suggestWeeklySequence() {

  if (
    !getWeeks().length
  ) {

    buildWeeklySequence();

  }


  let weeks =
    cloneWeeks();


  if (
    !weeks.length
  ) {

    return;

  }


  const priorities =
    Array.isArray(
      unitPlan.sequence
        ?.teachingPriorities
    )
      ? unitPlan.sequence
          .teachingPriorities
      : [];


  const curriculumRows =
    getSelectedCurriculumRows();


  const subjectRows =
    rowsGroupedBySubject(
      curriculumRows
    );


  const vocabularyPrompt =
    buildWeeklyVocabularyPrompt(
      curriculumRows
    );


  // Always offer a genuine rebuild when lessons already contain content.
  // Older generated text may have been saved without matching _generated metadata.
  const existingFilled = weeks.some(week => (week.lessons || []).some(lesson =>
    ["purpose", "activity", "evidence", "integration"].some(field =>
      String(lesson[field] || "").trim())));
  if (existingFilled && !window.confirm(
    "Regenerate the teaching sequence with new content-focused suggestions? This replaces existing lesson intentions, activities and formative checks, including teacher edits. Cancel leaves your plan unchanged. Back up your unit first."
  )) return;
  const refreshFilled = true;
  weeks =
    weeks.map(
      (week) => {

        const weekPhase =
          week.phase ||
          suggestedWeekPhase(
            week.number,
            weeks.length
          );


        const phasePriorities =
          priorities.filter(
            (priority) =>
              priority.type ===
              weekPhase
          );


        const subjectCounters = {};


        const subjectTotals =
          week.lessons.reduce(
            (result, lesson) => {

              const subject =
                lesson.subject ||
                "Integrated";


              result[
                subject
              ] =
                (
                  result[
                    subject
                  ] ||
                  0
                ) +
                1;


              return result;

            },
            {}
          );


        const lessons =
          week.lessons.map(
            (lesson) => {

              const subject =
                lesson.subject ||
                "Integrated";


              const lessonIndex =
                subjectCounters[
                  subject
                ] ||
                0;


              subjectCounters[
                subject
              ] =
                lessonIndex +
                1;


              const base = refreshFilled
                ? {...lesson, purpose: "", activity: "", evidence: "", integration: ""}
                : {...lesson};
              const suggested = suggestLessonContent(
                base,
                weekPhase,
                phasePriorities,
                subjectRows,
                lessonIndex,
                subjectTotals[
                  subject
                ] ||
                1,
                week.number,
                weeks.length
              );
              return {...suggested, _generated: {
                purpose: suggested.purpose,
                activity: suggested.activity,
                evidence: suggested.evidence,
                integration: suggested.integration
              }};

            }
          );


        return {

          ...week,

          phase:
            weekPhase,

          focus:
            week.focus ||
            buildWeekFocusSuggestion(
              weekPhase,
              phasePriorities,
              curriculumRows
            ),

          lessons,

          vocabulary:
            week.vocabulary ||
            (
              week.number <=
                Math.ceil(
                  weeks.length /
                  2
                )
                ? vocabularyPrompt
                : ""
            ),

          formativeCheck:
            week.formativeCheck ||
            suggestedFormativeCheck(
              weekPhase
            )

        };

      }
    );


  saveWeeks(
    weeks
  );


  const output =
    document.getElementById(
      "sequenceSuggestions"
    );


  if (output) output.innerHTML = `<strong>Weekly suggestions refreshed.</strong>
    <p>One concise teaching point per allocated lesson. Use “Edit weekly lessons” to customise.</p>`;


  renderSavedWeeklySequence();

}


// Content-first lesson suggestions: the lesson index selects a distinct
// curriculum focus; instructional phase is metadata, not the activity text.
function contentFocusBank(subject, rows) {
  const text = rows.map(row => String(row.text || "")).join(" ").toLowerCase();
  const english = /english/i.test(subject);
  const hass = /hass|humanities|geograph|history/i.test(subject);
  const bank = [];
  const add = (condition, ...items) => { if (condition) bank.push(...items); };
  if (english) {
    add(/read|view|comprehen|text|image|print/, 
      ["Identify information conveyed by illustrations and print.", "Locate details in a familiar text to answer literal questions."],
      ["Explain how words and illustrations work together to convey meaning.", "Match a written detail to supporting visual evidence."]);
    add(/vocab|language|word|describ/, 
      ["Explore precise words used to describe the unit topic.", "Sort and explain topic vocabulary using examples."],
      ["Choose vocabulary to describe a specific example from the text.", "Explain why a chosen word fits its context."]);
    add(/sequence|event|recount|narrativ|story/,
      ["Identify key events and their order in a familiar text.", "Sequence events using evidence from the text."],
      ["Retell key events using temporal connectives.", "Check that the retell follows the text's sequence."]);
    add(/sentenc|writ|creat|construct|communicat|present/,
      ["Compose a clear sentence using details from the unit text.", "Check the sentence communicates one complete idea."],
      ["Combine sentences to develop a short, coherent response.", "Revise word choice and sentence clarity."],
      ["Create a response for the assessed purpose and audience.", "Check content and conventions against the success criteria."]);
  } else if (hass) {
    add(/place|natural|managed|constructed|feature|environment/,
      ["Identify features of familiar places using photographs.", "Name and describe visible place features."],
      ["Distinguish natural, managed and constructed features.", "Classify examples and explain the classification."],
      ["Compare features of two places using photographs or maps.", "Record a meaningful similarity and difference."],
      ["Explain why a familiar place matters to people.", "Support an explanation with a specific example."]);
    add(/question|observ|collect|record|data|source|map/,
      ["Develop a question about a familiar place or source.", "Identify what information would answer it."],
      ["Gather observations from photographs, maps or other sources.", "Record findings using labels, drawings or a simple table."],
      ["Organise collected information into meaningful categories.", "Check that the categories match the evidence."]);
    add(/care|protect|propos|conclusion|action/,
      ["Identify ways people care for places.", "Match an action to the feature it protects."],
      ["Suggest a practical action to care for a familiar place.", "Explain why that action is appropriate."]);
    add(/past|present|change|continuity|history/,
      ["Identify features of a place in the past and present.", "Use sources to notice changes."],
      ["Describe one change and one feature that stayed the same.", "Use evidence from the sources."]);
  }
  if (!bank.length) {
    const safe = rows.map(row => String(row.text || "").trim())
      .filter(x => x && x.length < 145 && !/achievement standard aspect|students identify the knowledge/i.test(x));
    safe.slice(0, 5).forEach(x => bank.push([x.replace(/[.]+$/, "") + ".", "Use a relevant example to demonstrate this learning."]));
  }
  return bank;
}

function suggestLessonContent(lesson, weekPhase, phasePriorities, subjectRows,
  lessonIndex = 0, subjectLessonCount = 1, weekNumber = 1, totalWeeks = 10) {
  const subject = lesson.subject || "Integrated";
  const rows = subjectRows[subject] || [];
  const bank = contentFocusBank(subject, rows);
  const slot = (weekNumber - 1) * subjectLessonCount + lessonIndex;
  // Move through the content bank over the unit; avoid repeating one target
  // across five lessons merely to cycle through gradual-release phases.
  const item = bank.length ? bank[slot % bank.length] : null;
  const focus = item ? item[0] : "Specify a content focus from the selected curriculum and assessment.";
  const task = item ? item[1] : "Add the precise knowledge, text or skill students will learn.";
  const phase = lesson.phase || weekPhase || "Explicit teaching";
  const evidence = /identify|locate|distinguish|classify|sequence/i.test(focus)
    ? "• Check accuracy using a short identification, sorting or sequencing task."
    : /explain|compare|why/i.test(focus)
      ? "• Listen for an accurate explanation supported by an example."
      : "• Check one brief response against the intended content focus.";
  return {...lesson,
    phase,
    purpose: lesson.purpose || focus,
    activity: lesson.activity || "• " + focus + "\n• " + task,
    evidence: lesson.evidence || evidence,
    integration: lesson.integration || ""
  };
}

function conciseLearningFocus(value) {
  return String(value || "")
    .replace(/^[^:]{1,45}:\s*explicitly teach and practise the learning required by this Achievement Standard aspect\s*[—–-]\s*/i, "")
    .replace(/^explicitly teach and practise the learning required by this Achievement Standard aspect\s*[—–-]\s*/i, "")
    .replace(/\s+/g, " ").trim();
}
function progressiveLearningPoints(value, phase, week, total) {
  const focus = conciseLearningFocus(value).replace(/[.]+$/, "");
  if (!focus) return "";
  const stages = [
    `• Introduce and unpack: ${focus}.\n• Identify key vocabulary and examples.`,
    `• Model the thinking and features of: ${focus}.\n• Compare examples and non-examples.`,
    `• Jointly practise: ${focus}.\n• Discuss choices and improve responses using feedback.`,
    `• Apply with reduced scaffolding: ${focus}.\n• Explain or justify choices.`,
    `• Independently demonstrate: ${focus}.\n• Check and refine against the success criteria.`
  ];
  const progress = total <= 1 ? 2 : (week - 1) / (total - 1);
  const index = Math.min(4, Math.floor(progress * 4 + 0.0001));
  return stages[index];
}
function conciseEvidencePoint(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const short = text.replace(/^Use (a |an |one )?/i, "Check: ").replace(/^Students /i, "Check: students ");
  return "• " + short.replace(/\s+/g, " ");
}
function conciseIntegrationPoint(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/HASS, Science or other integrated-unit texts/i.test(text)) return "• Use integrated-unit texts to develop subject knowledge, vocabulary and reading skills.";
  if (/Develop HASS knowledge through/i.test(text)) return "• Use purposeful reading, images and discussion to develop HASS knowledge through English.";
  return "• " + text.replace(/\s+/g, " ");
}

// ============================================================
// CURRICULUM-DRIVEN LESSON SUGGESTIONS
// ============================================================

function buildCurriculumLessonSuggestion(
  subject,
  rows,
  lessonIndex,
  lessonCount,
  weekPhase,
  weekNumber,
  totalWeeks
) {

  if (
    !rows.length
  ) {

    return emptyLessonSuggestion(
      weekPhase
    );

  }


  if (
    subject ===
      "English" &&
    lessonCount > 1
  ) {

    return buildEnglishCurriculumLesson(
      rows,
      lessonIndex,
      lessonCount,
      weekPhase,
      weekNumber,
      totalWeeks
    );

  }


  const row =
    rows[
      Math.min(rows.length - 1, Math.floor(((weekNumber - 1) + (lessonIndex + 0.5) / Math.max(1, lessonCount)) / Math.max(1, totalWeeks) * rows.length))
    ];


  const verbs =
    findCognitiveVerbs(
      row.text
    );


  return {

    phase:
      weekPhase,

    purpose:
      buildPurposeFromAspect(
        row,
        verbs
      ),

    activity:
      buildActivityFromAspect(
        row,
        verbs,
        weekPhase
      ),

    evidence:
      buildEvidenceFromAspect(
        verbs,
        weekPhase
      ),

    integration:
      ""

  };

}


function emptyLessonSuggestion(
  phase = ""
) {

  return {

    phase,

    purpose:
      "",

    activity:
      "",

    evidence:
      "",

    integration:
      ""

  };

}


// ============================================================
// ENGLISH — 5-LESSON WEEKLY CYCLE
// ============================================================

function buildEnglishCurriculumLesson(
  rows,
  lessonIndex,
  lessonCount,
  weekPhase,
  weekNumber,
  totalWeeks
) {

  const orderedRows =
    orderEnglishRowsForWeeklyCycle(
      rows
    );


  const row =
    orderedRows[
      Math.min(orderedRows.length - 1, Math.floor(((weekNumber - 1) + (lessonIndex + 0.5) / Math.max(1, lessonCount)) / Math.max(1, totalWeeks) * orderedRows.length))
    ] ||
    rows[0];


  const verbs =
    findCognitiveVerbs(
      row.text
    );


  const phase =
    englishLessonPhase(
      lessonIndex,
      weekPhase
    );


  return {

    phase,

    purpose:
      buildPurposeFromAspect(
        row,
        verbs
      ),

    activity:
      buildActivityFromAspect(
        row,
        verbs,
        phase
      ),

    evidence:
      buildEvidenceFromAspect(
        verbs,
        phase
      ),

    integration:
      buildEnglishIntegrationSuggestion(
        row
      )

  };

}


// ============================================================
// ORDER ENGLISH ASPECTS ACROSS THE WEEK
// ============================================================

function orderEnglishRowsForWeeklyCycle(
  rows
) {

  const remaining =
    [
      ...rows
    ];


  const ordered = [];


  const categories = [

    // Lesson 1 — vocabulary / language foundations
    /vocab|language feature|punctuation|grammar|phonic|morphem|spelling/,

    // Lesson 2 — reading / viewing / comprehension
    /read|view|comprehend|literal|infer|purpose|audience/,

    // Lesson 3 — text / language features
    /describe|language feature|literary|visual feature|structure/,

    // Lesson 4 — organisation / cohesion
    /organise|sequence|link|paragraph|structure|cohes/,

    // Lesson 5 — creation / communication
    /create|write|multimodal|present|communicate/

  ];


  categories
    .forEach(
      (pattern) => {

        const index =
          remaining.findIndex(
            (row) =>
              pattern.test(
                String(
                  row.text ||
                  ""
                )
                  .toLowerCase()
              )
          );


        if (
          index >= 0
        ) {

          ordered.push(
            remaining.splice(
              index,
              1
            )[0]
          );

        }

      }
    );


  ordered.push(
    ...remaining
  );


  return ordered.length
    ? ordered
    : rows;

}


function englishLessonPhase(
  lessonIndex,
  weekPhase
) {

  const cycle = [

    "Explicit teaching",
    "Modelled instruction",
    "Modelled instruction",
    "Guided practice",
    "Independent application"

  ];


  return cycle[
    lessonIndex %
    cycle.length
  ] ||
  weekPhase;

}


// ============================================================
// TURN ACHIEVEMENT STANDARD ASPECT INTO LESSON PURPOSE
// ============================================================

function buildPurposeFromAspect(
  row,
  verbs
) {

  const subject =
    row.subject ||
    "Learning";


  const aspect =
    String(
      row.text ||
      ""
    )
      .trim();


  if (
    includesAny(
      verbs,
      [
        "read",
        "view",
        "comprehend"
      ]
    )
  ) {

    return `${subject}: students read, view and comprehend texts in order to demonstrate — ${aspect}`;

  }


  if (
    verbs.includes(
      "identify"
    )
  ) {

    return `${subject}: students identify the knowledge, features or relationships required by this Achievement Standard aspect — ${aspect}`;

  }


  if (
    includesAny(
      verbs,
      [
        "interpret",
        "analyse",
        "infer"
      ]
    )
  ) {

    return `${subject}: students interpret and make meaning from relevant information, texts or evidence in order to demonstrate — ${aspect}`;

  }


  if (
    includesAny(
      verbs,
      [
        "describe",
        "explain",
        "compare"
      ]
    )
  ) {

    return `${subject}: students describe and explain the relevant features, ideas or relationships required by this Achievement Standard aspect — ${aspect}`;

  }


  if (
    includesAny(
      verbs,
      [
        "organise",
        "sequence",
        "link",
        "group"
      ]
    )
  ) {

    return `${subject}: students organise and link ideas appropriately to demonstrate — ${aspect}`;

  }


  if (
    includesAny(
      verbs,
      [
        "create",
        "write",
        "present",
        "communicate"
      ]
    )
  ) {

    return `${subject}: students create and communicate an appropriate response that demonstrates — ${aspect}`;

  }


  if (
    includesAny(
      verbs,
      [
        "use",
        "apply"
      ]
    )
  ) {

    return `${subject}: students apply the required knowledge, language features or conventions described in — ${aspect}`;

  }


  if (
    includesAny(
      verbs,
      [
        "develop",
        "plan",
        "investigate",
        "collect"
      ]
    )
  ) {

    return `${subject}: students develop and apply the inquiry or planning processes required by — ${aspect}`;

  }


  return `${subject}: explicitly teach and practise the learning required by this Achievement Standard aspect — ${aspect}`;

}


// ============================================================
// BUILD TEACHING EXPERIENCE FROM ASPECT
// ============================================================

function buildActivityFromAspect(
  row,
  verbs,
  phase
) {

  const aspect =
    String(
      row.text ||
      ""
    )
      .trim();


  const demand =
    verbs[0] ||
    "successful performance";


  if (
    phase ===
    "Explicit teaching"
  ) {

    return `Explicitly unpack the selected Achievement Standard aspect. Teach the required content and vocabulary, then use examples and non-examples so students understand what ${demand} looks like in this context.`;

  }


  if (
    phase ===
    "Modelled instruction"
  ) {

    return `Use a worked example or think-aloud to model how a student would successfully respond to the demand in: "${aspect}". Make the thinking process and success criteria visible.`;

  }


  if (
    phase ===
    "Guided practice"
  ) {

    return `Students practise the selected Achievement Standard demand with teacher prompts, worked examples, discussion and feedback. Gradually reduce support as confidence increases.`;

  }


  if (
    phase ===
    "Independent application"
  ) {

    return `Students independently apply the knowledge and skill described in: "${aspect}". Use a task similar in cognitive demand to the assessment without duplicating the summative question.`;

  }


  if (
    phase ===
    "Assessment"
  ) {

    return `Students complete the planned assessment evidence aligned to: "${aspect}".`;

  }


  return `Teach and practise the knowledge and skill described in: "${aspect}".`;

}


// ============================================================
// FORMATIVE EVIDENCE FROM COGNITIVE DEMAND
// ============================================================

function buildEvidenceFromAspect(
  verbs,
  phase
) {

  if (
    includesAny(
      verbs,
      [
        "read",
        "view",
        "comprehend"
      ]
    )
  ) {

    return "Use a short comprehension response, annotation, oral explanation or text-based question to check literal and inferred understanding.";

  }


  if (
    verbs.includes(
      "identify"
    )
  ) {

    return "Use a quick selection, matching, labelling, highlighting or linking task to check whether students can identify the required information accurately.";

  }


  if (
    includesAny(
      verbs,
      [
        "interpret",
        "analyse",
        "infer"
      ]
    )
  ) {

    return "Use an annotated source, short interpretation or evidence-based response to check how students are making meaning from information.";

  }


  if (
    includesAny(
      verbs,
      [
        "describe",
        "explain",
        "compare"
      ]
    )
  ) {

    return "Collect a short oral or written response and check for the required details, relationships and vocabulary.";

  }


  if (
    includesAny(
      verbs,
      [
        "organise",
        "sequence",
        "link",
        "group"
      ]
    )
  ) {

    return "Use a paragraph plan, sequencing task, cohesion check or short constructed response to see how students organise and connect ideas.";

  }


  if (
    includesAny(
      verbs,
      [
        "create",
        "write",
        "present",
        "communicate"
      ]
    )
  ) {

    return phase ===
      "Independent application"
        ? "Collect an independent written, oral or multimodal response and compare it against the relevant success criteria."
        : "Use a jointly constructed or guided response to identify what students can already apply and what still needs modelling.";

  }


  return suggestedLessonEvidence(
    phase
  );

}


// ============================================================
// ENGLISH INTEGRATION CONNECTIONS
// ============================================================

function buildEnglishIntegrationSuggestion(
  row
) {

  const text =
    String(
      row.text ||
      ""
    )
      .toLowerCase();


  if (
    /read|view|comprehend|infer|text/
      .test(
        text
      )
  ) {

    return "Use HASS, Science or other integrated-unit texts as the reading stimulus so students build disciplinary knowledge while practising the selected English reading demand.";

  }


  if (
    /vocab|language|spelling|morphem|phonic/
      .test(
        text
      )
  ) {

    return "Use vocabulary and terminology drawn from the integrated learning areas so English instruction strengthens access to disciplinary content.";

  }


  if (
    /create|write|organise|sequence|link/
      .test(
        text
      )
  ) {

    return "Use content already taught in the integrated unit as the context for writing or multimodal work, so English assesses communication skills without unnecessarily reassessing the same disciplinary knowledge.";

  }


  return "Where appropriate, use the integrated unit content as the authentic context for English reading, discussion and communication.";

}


// ============================================================
// GENERAL WEEK SUGGESTIONS
// ============================================================

function buildWeekFocusSuggestion(
  phase,
  priorities,
  curriculumRows
) {

  const prioritySubjects =
    unique(
      priorities
        .map(
          (priority) =>
            priority.subject
        )
        .filter(
          (subject) =>
            subject !==
            "Assessment preparation"
        )
    );


  const subjects =
    prioritySubjects.length
      ? prioritySubjects
      : unique(
          curriculumRows.map(
            (row) =>
              row.subject
          )
        );


  return `${phase}: ${joinNaturalList(
    subjects
  )}`;

}


function defaultLessonPurpose(
  subject,
  rows,
  phase
) {

  const actions =
    buildSubjectPriorityActions(
      unique(
        rows.flatMap(
          (row) =>
            findCognitiveVerbs(
              row.text
            )
        )
      )
    );


  return actions.length
    ? `${phase}: students learn to ${joinNaturalList(
        actions
      )}.`
    : `${phase}: develop the knowledge, vocabulary and skills required for ${subject}.`;

}


function suggestedLearningExperience(
  phase,
  subject
) {

  const suggestions = {

    "Explicit teaching":
      `Explicitly teach the required ${subject} content and vocabulary. Use worked examples, clear explanations, retrieval and checks for understanding.`,

    "Modelled instruction":
      "Model the required thinking and process using a think-aloud. Make the success criteria visible and demonstrate how an effective response is constructed.",

    "Guided practice":
      "Guide students through a similar example with prompts and feedback. Gradually reduce scaffolding as students demonstrate readiness.",

    "Independent application":
      "Provide an independent application task that requires students to transfer the learning without step-by-step teacher prompting.",

    "Review / consolidation":
      "Revisit essential knowledge and skills through retrieval, spaced practice and targeted reteaching based on formative evidence.",

    Assessment:
      "Students complete the planned assessment evidence under the agreed conditions."

  };


  return suggestions[
    phase
  ] ||
  `Teach and practise the planned ${subject} learning.`;

}


function suggestedFormativeCheck(
  phase
) {

  const checks = {

    "Explicit teaching":
      "Use quick retrieval, questioning, matching, labelling or an exit check to confirm foundational knowledge.",

    "Modelled instruction":
      "Ask students to identify the steps, decisions or features used in the model and explain what makes the example effective.",

    "Guided practice":
      "Collect a short guided response and use feedback to decide who is ready for reduced scaffolding or who requires reteaching.",

    "Independent application":
      "Use an independent response or performance to check whether students can transfer the learning without teacher prompting.",

    "Review / consolidation":
      "Use retrieval and error analysis to identify what requires further consolidation.",

    Assessment:
      "Collect the planned summative evidence."

  };


  return checks[
    phase
  ] ||
  "Use a brief formative check aligned to the intended learning.";

}


function suggestedLessonEvidence(
  phase
) {

  if (
    phase ===
    "Independent application"
  ) {

    return "Independent student response or performance demonstrating whether the learning can be applied without prompts.";

  }


  if (
    phase ===
    "Guided practice"
  ) {

    return "Observed guided response, annotated work sample, conference notes or short check for understanding.";

  }


  if (
    phase ===
    "Assessment"
  ) {

    return "Planned summative assessment evidence.";

  }


  return "Questioning, observation, retrieval check, annotation, short response or work sample.";

}


function suggestedIntegrationConnection(
  subject,
  subjectRows
) {

  const subjects =
    Object.keys(
      subjectRows
    )
      .filter(
        (candidate) =>
          candidate !==
          subject
      );


  if (
    !subjects.length
  ) {

    return "";

  }


  if (
    subject ===
    "English"
  ) {

    return `Use texts, vocabulary, discussion or writing connected to ${joinNaturalList(
      subjects
    )} content where this authentically supports both learning areas.`;

  }


  if (
    subjects.includes(
      "English"
    )
  ) {

    return `Develop ${subject} knowledge through purposeful reading, viewing, vocabulary, discussion or communication opportunities in English without duplicating the disciplinary assessment.`;

  }


  return `Look for a genuine connection with ${joinNaturalList(
    subjects
  )} where one learning experience can support more than one selected curriculum demand.`;

}


function buildWeeklyVocabularyPrompt(
  rows
) {

  const subjects =
    unique(
      rows.map(
        (row) =>
          row.subject
      )
    );


  return subjects.length
    ? `Identify and explicitly teach the key Tier 2, Tier 3 and subject-specific vocabulary for ${joinNaturalList(
        subjects
      )}.`
    : "";

}


// ============================================================
// ASSESSMENT / CURRICULUM HELPERS
// ============================================================

function getAssessmentComponentsAcrossYears() {

  const result = [];


  getUnitYears()
    .forEach(
      (yearLevel) => {

        const assessment =
          getAssessment(
            yearLevel
          );


        assessment?.components
          ?.forEach(
            (component) => {

              result.push({

                yearLevel,

                questionText:
                  component.questionText ||
                  "",

                evidenceFormat:
                  component.evidenceFormat ||
                  "",

                verbs:
                  getComponentVerbs(
                    component,
                    yearLevel
                  )

              });

            }
          );

      }
    );


  return result;

}


function getComponentVerbs(
  component,
  yearLevel
) {

  return unique(
    selectedRowsForYear(
      yearLevel
    )
      .filter(
        (row) =>
          component
            .selectedStandardCodes
            ?.includes(
              row.code
            )
      )
      .flatMap(
        (row) =>
          findCognitiveVerbs(
            row.text
          )
      )
  );

}


function selectedRowsForYear(
  yearLevel
) {

  const accepted =
    gradesForYear(
      yearLevel
    );


  return getSelectedCurriculumRows()
    .filter(
      (row) =>
        accepted.includes(
          row.grade
        )
    );

}


function getUnitYears() {

  return Array.isArray(
    unitPlan.setup
      ?.yearLevels
  )
    ? unitPlan.setup.yearLevels
    : [];

}


function gradesForYear(
  year
) {

  const values =
    [year];


  const match =
    String(
      year ||
      ""
    )
      .match(
        /\d+/
      );


  if (
    !match
  ) {

    return values;

  }


  const number =
    Number(
      match[0]
    );


  if (
    number === 1 ||
    number === 2
  ) {

    values.push(
      "Years 1–2"
    );

  }


  if (
    number === 3 ||
    number === 4
  ) {

    values.push(
      "Years 3–4"
    );

  }


  if (
    number === 5 ||
    number === 6
  ) {

    values.push(
      "Years 5–6"
    );

  }


  return values;

}


// ============================================================
// COGNITIVE VERB DETECTION
// ============================================================

function findCognitiveVerbs(
  text = ""
) {

  const lower =
    String(
      text
    )
      .toLowerCase();


  const found = [];


  COGNITIVE_VERBS
    .forEach(
      (verb) => {

        const expression =
          new RegExp(
            `\\b${verb}\\w*\\b`,
            "i"
          );


        if (
          expression.test(
            lower
          )
        ) {

          const normalised =
            normaliseVerb(
              verb
            );


          if (
            !found.includes(
              normalised
            )
          ) {

            found.push(
              normalised
            );

          }

        }

      }
    );


  return found;

}


function normaliseVerb(
  verb
) {

  return {

    analyze:
      "analyse",

    organize:
      "organise",

    summarize:
      "summarise"

  }[
    verb
  ] ||
  verb;

}


// ============================================================
// GENERAL HELPERS
// ============================================================

function rowsGroupedBySubject(
  rows
) {

  return groupBy(
    rows,
    (row) =>
      row.subject
  );

}


function combinedRowText(
  rows
) {

  return rows
    .map(
      (row) =>
        row.text ||
        ""
    )
    .join(" ")
    .toLowerCase();

}


function groupBy(
  values,
  keyFunction
) {

  return values.reduce(
    (result, value) => {

      const key =
        keyFunction(
          value
        );


      if (
        !result[
          key
        ]
      ) {

        result[
          key
        ] = [];

      }


      result[
        key
      ]
        .push(
          value
        );


      return result;

    },
    {}
  );

}


function unique(
  values
) {

  return [
    ...new Set(
      values.filter(
        Boolean
      )
    )
  ];

}


function includesAny(
  values,
  possibilities
) {

  return possibilities.some(
    (item) =>
      values.includes(
        item
      )
  );

}


function bulletText(
  values
) {

  return values
    .map(
      (value) =>
        `• ${value}`
    )
    .join("\n");

}


function normaliseText(
  value
) {

  return Array.isArray(
    value
  )
    ? bulletText(
        value
      )
    : value ||
      "";

}


function joinNaturalList(
  values
) {

  const cleaned =
    values.filter(
      Boolean
    );


  if (
    !cleaned.length
  ) {

    return "";

  }


  if (
    cleaned.length === 1
  ) {

    return cleaned[0];

  }


  if (
    cleaned.length === 2
  ) {

    return `${cleaned[0]} and ${cleaned[1]}`;

  }


  return `${cleaned
    .slice(
      0,
      -1
    )
    .join(", ")}, and ${cleaned[
      cleaned.length -
      1
    ]}`;

}


function clamp(
  value,
  minimum,
  maximum
) {

  return Math.min(
    Math.max(
      value,
      minimum
    ),
    maximum
  );

}


// ============================================================
// STATE HELPERS
// ============================================================

function getWeeks() {

  return Array.isArray(
    unitPlan.sequence
      ?.weeks
  )
    ? unitPlan.sequence.weeks
    : [];

}


function cloneWeeks() {

  return structuredClone(
    getWeeks()
  );

}


function saveWeeks(
  weeks
) {

  updateUnitPlan(
    "sequence.weeks",
    weeks
  );

}


// ============================================================
// DOM HELPERS
// ============================================================

function bindClick(
  id,
  handler
) {

  document
    .getElementById(
      id
    )
    ?.addEventListener(
      "click",
      handler
    );

}


function bindField(
  elementId,
  statePath
) {

  const element =
    document.getElementById(
      elementId
    );


  if (
    !element
  ) {

    return;

  }


  element.addEventListener(
    "input",
    (event) => {

      updateUnitPlan(
        statePath,
        event.target.value
      );

    }
  );

}


function bindLocalInput(
  container,
  selector,
  eventName,
  handler
) {

  container
    .querySelector(
      selector
    )
    ?.addEventListener(
      eventName,
      handler
    );

}


function eventForElement(
  element
) {

  return element.tagName ===
    "SELECT"
      ? "change"
      : "input";

}


function setValue(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (
    element
  ) {

    element.value =
      value ||
      "";

  }

}


// ============================================================
// HTML SAFETY HELPERS
// ============================================================

function escapeHtml(
  value
) {

  return String(
    value ??
    ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  );

}
