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

function buildAssessmentReadiness() {

  const readiness = {};


  getUnitYears()
    .forEach(
      (yearLevel) => {

        const assessment =
          getAssessment(
            yearLevel
          );


        if (
          !assessment?.components
            ?.length
        ) {

          return;

        }


        const rows =
          selectedRowsForYear(
            yearLevel
          );


        const components =
          assessment.components
            .filter(
              (component) =>
                component
                  .selectedStandardCodes
                  ?.length
            );


        if (
          !components.length
        ) {

          return;

        }


        readiness[
          yearLevel
        ] =
          components.map(
            (component, index) => {

              const componentRows =
                rows.filter(
                  (row) =>
                    component
                      .selectedStandardCodes
                      .includes(
                        row.code
                      )
                );


              const verbs =
                unique(
                  componentRows.flatMap(
                    (row) =>
                      findCognitiveVerbs(
                        row.text
                      )
                  )
                );


              const existing =
                unitPlan.sequence
                  ?.readinessChecks
                  ?.[yearLevel]
                  ?.find(
                    (item) =>
                      item.componentId ===
                      component.id
                  );


              return {

                componentId:
                  component.id,

                number:
                  index + 1,

                question:
                  component.questionText ||
                  `Assessment component ${index + 1}`,

                evidenceFormat:
                  component.evidenceFormat ||
                  "",

                verbs,

                subjects:
                  unique(
                    componentRows.map(
                      (row) =>
                        row.subject
                    )
                  ),

                checks:
                  existing?.checks ||
                  buildReadinessItems(
                    componentRows,
                    verbs,
                    component.evidenceFormat
                  )

              };

            }
          );

      }
    );


  updateUnitPlan(
    "sequence.readinessChecks",
    readiness
  );


  renderSavedReadiness();

}


function buildReadinessItems(
  rows,
  verbs,
  evidenceFormat
) {

  const items = [

    readinessItem(
      "Required background knowledge and content have been explicitly taught."
    )

  ];


  items.push(
    readinessItem(
      rows.some(
        (row) =>
          /vocab|terminolog|language|technical|topic-specific/i
            .test(
              row.text ||
              ""
            )
      )
        ? "Relevant Tier 2, Tier 3 and subject-specific vocabulary has been introduced and revisited."
        : "Vocabulary students need to understand the task and content has been explicitly taught."
    )
  );


  if (
    verbs.length
  ) {

    items.push(
      readinessItem(
        `The cognitive demand has been explicitly modelled: ${joinNaturalList(
          verbs.map(
            (verb) =>
              verb.toUpperCase()
          )
        )}.`
      )
    );


    items.push(
      readinessItem(
        `Students have completed guided practice in ${joinNaturalList(
          buildAssessmentPracticeActions(
            verbs
          )
        )}.`
      )
    );

  }


  if (
    evidenceFormat &&
    evidenceFormat !== "__own"
  ) {

    items.push(
      readinessItem(
        `Students have practised the assessment response format before summative use: ${evidenceFormat}.`
      )
    );

  }


  items.push(
    readinessItem(
      "Students have had an independent practice opportunity before completing this component for summative evidence."
    )
  );


  items.push(
    readinessItem(
      "Any required scaffolds or adjustments support access without supplying the assessed knowledge or thinking."
    )
  );


  return items;

}


function readinessItem(
  label
) {

  return {

    id:
      crypto.randomUUID(),

    label,

    checked:
      false

  };

}


function renderSavedReadiness() {

  const container =
    document.getElementById(
      "assessmentReadiness"
    );


  if (
    !container
  ) {

    return;

  }


  const readiness =
    unitPlan.sequence
      ?.readinessChecks ||
    {};


  const years =
    Object.keys(
      readiness
    )
      .filter(
        (year) =>
          readiness[
            year
          ]
            ?.length
      );


  if (
    !years.length
  ) {

    container.innerHTML = `

      <div class="empty">

        Build the year-level assessment
        in Step 4, then use

        <strong>
          Build readiness check
        </strong>.

      </div>

    `;

    return;

  }


  container.innerHTML =
    years
      .map(
        (yearLevel) => `

          <section class="readiness-year">

            <div class="readiness-year-head">

              <h4>
                ${escapeHtml(
                  yearLevel
                )}
              </h4>

              <span>

                ${readiness[
                  yearLevel
                ].length}

                assessment component${
                  readiness[
                    yearLevel
                  ].length === 1
                    ? ""
                    : "s"
                }

              </span>

            </div>


            <div class="assessment-readiness">

              ${
                readiness[
                  yearLevel
                ]
                  .map(
                    (component) =>
                      readinessCardHtml(
                        yearLevel,
                        component
                      )
                  )
                  .join("")
              }

            </div>

          </section>

        `
      )
      .join("");


  bindReadinessEvents();

}


function readinessCardHtml(
  yearLevel,
  component
) {

  return `

    <article
      class="readiness-card"
      data-year="${escapeAttribute(
        yearLevel
      )}"
      data-component="${escapeAttribute(
        component.componentId
      )}"
    >

      <div class="readiness-card-head">

        <div>

          <strong>
            Assessment component
            ${component.number}
          </strong>

          <p>
            ${escapeHtml(
              component.question
            )}
          </p>

        </div>


        <span class="readiness-demand">

          ${
            component.verbs
              ?.length
              ? component.verbs
                  .map(
                    (verb) =>
                      escapeHtml(
                        verb.toUpperCase()
                      )
                  )
                  .join(" + ")
              : "EVIDENCE"
          }

        </span>

      </div>


      ${
        component.subjects
          ?.length
          ? `

            <div class="readiness-subjects">

              ${
                component.subjects
                  .map(
                    (subject) => `
                      <span>
                        ${escapeHtml(
                          subject
                        )}
                      </span>
                    `
                  )
                  .join("")
              }

            </div>

          `
          : ""
      }


      <div class="readiness-checks">

        ${
          component.checks
            .map(
              (check) => `

                <label class="readiness-check">

                  <input
                    type="checkbox"
                    data-check="${escapeAttribute(
                      check.id
                    )}"
                    ${
                      check.checked
                        ? "checked"
                        : ""
                    }
                  >

                  <span>
                    ${escapeHtml(
                      check.label
                    )}
                  </span>

                </label>

              `
            )
            .join("")
        }

      </div>

    </article>

  `;

}


function bindReadinessEvents() {

  document
    .querySelectorAll(
      ".readiness-card"
    )
    .forEach(
      (card) => {

        const yearLevel =
          card.dataset.year;


        const componentId =
          card.dataset.component;


        card
          .querySelectorAll(
            "input[data-check]"
          )
          .forEach(
            (checkbox) => {

              checkbox.addEventListener(
                "change",
                () => {

                  const readiness =
                    structuredClone(
                      unitPlan.sequence
                        ?.readinessChecks ||
                      {}
                    );


                  const component =
                    readiness[
                      yearLevel
                    ]
                      ?.find(
                        (item) =>
                          item.componentId ===
                          componentId
                      );


                  const check =
                    component?.checks
                      ?.find(
                        (item) =>
                          item.id ===
                          checkbox.dataset.check
                      );


                  if (
                    !check
                  ) {

                    return;

                  }


                  check.checked =
                    checkbox.checked;


                  updateUnitPlan(
                    "sequence.readinessChecks",
                    readiness
                  );

                }
              );

            }
          );

      }
    );

}


// ============================================================
// TEACHING PRIORITIES
// ============================================================

function buildTeachingPriorities() {

  const rows =
    getSelectedCurriculumRows();


  const container =
    document.getElementById(
      "teachingPriorities"
    );


  if (
    !rows.length
  ) {

    if (
      container
    ) {

      container.innerHTML = `

        <div class="empty">

          Select Achievement Standard aspects
          in Step 2 before generating teaching
          priorities.

        </div>

      `;

    }

    return;

  }


  const priorities = [];


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


        const verbs =
          unique(
            subjectRows.flatMap(
              (row) =>
                findCognitiveVerbs(
                  row.text
                )
            )
          );


        const explicitFocus = [];


        if (
          /vocab|terminolog|language feature|technical|topic-specific/
            .test(
              text
            )
        ) {

          explicitFocus.push(
            "subject-specific and academic vocabulary"
          );

        }


        if (
          /source|text|information|data|evidence|graph|table|map|image/
            .test(
              text
            )
        ) {

          explicitFocus.push(
            "the background knowledge needed to understand the texts, sources, information or data used in the unit"
          );

        }


        explicitFocus.push(
          "the essential content knowledge and concepts identified in the selected Achievement Standard aspects"
        );


        priorities.push(
          makePriority(
            "Explicit teaching",
            subject,
            `Teach ${joinNaturalList(
              unique(
                explicitFocus
              )
            )}.`,
            "Students need secure knowledge and vocabulary before they can successfully engage with higher-order thinking or assessment.",
            "Curriculum"
          )
        );


        const modelled =
          buildSubjectPriorityActions(
            verbs
          );


        if (
          modelled.length
        ) {

          priorities.push(
            makePriority(
              "Modelled instruction",
              subject,
              `Model how to ${joinNaturalList(
                modelled
              )}.`,
              `These processes are embedded in the selected ${subject} Achievement Standard aspects and should be made visible before students are expected to perform them independently.`,
              "Cognitive demand"
            )
          );

        }


        const guided =
          buildAssessmentPracticeActions(
            verbs
          );


        if (
          guided.length
        ) {

          priorities.push(
            makePriority(
              "Guided practice",
              subject,
              `Provide scaffolded practice in ${joinNaturalList(
                guided
              )}.`,
              "Students need supported opportunities to rehearse the required thinking and processes, receive feedback and refine their responses.",
              "Curriculum + assessment"
            )
          );

        }

      }
    );


  const assessmentComponents =
    getAssessmentComponentsAcrossYears();


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

    priorities.push(
      makePriority(
        "Guided practice",
        "Assessment preparation",
        `Give students prior practice using the response formats they will encounter in the assessment, including ${joinNaturalList(
          formats
        )}.`,
        "The assessment should measure the intended curriculum learning rather than a student's first attempt at an unfamiliar response format.",
        "Assessment evidence map"
      )
    );

  }


  const independentActions =
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
    independentActions.length
  ) {

    priorities.push(
      makePriority(
        "Independent application",
        "Assessment preparation",
        `Provide an independent practice opportunity where students apply ${joinNaturalList(
          independentActions
        )} before summative assessment.`,
        "Independent practice helps confirm that students can transfer the learning without teacher prompting or excessive scaffolding.",
        "Assessment readiness"
      )
    );

  }


  const existing =
    Array.isArray(
      unitPlan.sequence
        ?.teachingPriorities
    )
      ? unitPlan.sequence
          .teachingPriorities
      : [];


  updateUnitPlan(
    "sequence.teachingPriorities",
    mergePriorities(
      priorities,
      existing
    )
  );


  renderSavedTeachingPriorities();

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

  const container =
    document.getElementById(
      "teachingPriorities"
    );


  if (
    !container
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


  if (
    !priorities.length
  ) {

    container.innerHTML = `

      <div class="empty">

        Select

        <strong>
          Suggest priorities
        </strong>

        to identify the learning that may require
        explicit teaching, modelling, guided practice
        and independent application.

      </div>

    `;

    return;

  }


  const order = [

    "Explicit teaching",
    "Modelled instruction",
    "Guided practice",
    "Independent application"

  ];


  const grouped =
    groupBy(
      priorities,
      (item) =>
        item.type ||
        "Teaching priority"
    );


  container.innerHTML =
    order
      .filter(
        (type) =>
          grouped[
            type
          ]
            ?.length
      )
      .map(
        (type) => `

          <section class="priority-group">

            <div class="priority-group-head">

              <h4>
                ${escapeHtml(
                  type
                )}
              </h4>

              <span>

                ${grouped[
                  type
                ].length}

                priorit${
                  grouped[
                    type
                  ].length === 1
                    ? "y"
                    : "ies"
                }

              </span>

            </div>


            <div class="priority-group-list">

              ${
                grouped[
                  type
                ]
                  .map(
                    (priority) =>
                      teachingPriorityHtml(
                        priority
                      )
                  )
                  .join("")
              }

            </div>

          </section>

        `
      )
      .join("");


  bindTeachingPriorityEvents();

}


function teachingPriorityHtml(
  priority
) {

  return `

    <article
      class="teaching-priority-card"
      data-priority="${escapeAttribute(
        priority.id
      )}"
    >

      <div>

        <input
          type="checkbox"
          class="priority-complete"
          ${
            priority.completed
              ? "checked"
              : ""
          }
          aria-label="Mark teaching priority as addressed"
        >

      </div>


      <div class="priority-main">

        <div class="priority-meta">

          <span class="priority-type">
            ${escapeHtml(
              priority.type
            )}
          </span>

          <strong>
            ${escapeHtml(
              priority.subject
            )}
          </strong>

        </div>


        <textarea
          class="priority-focus"
          rows="3"
        >${escapeHtml(
          priority.focus
        )}</textarea>


        <div class="priority-reason">

          <strong>
            Why this matters:
          </strong>

          ${escapeHtml(
            priority.reason
          )}

        </div>


        <label class="priority-note-label">

          Teacher planning note

          <textarea
            class="priority-note"
            rows="2"
            placeholder="Add specific texts, examples, resources, scaffolds or teaching decisions..."
          >${escapeHtml(
            priority.teacherNote ||
            ""
          )}</textarea>

        </label>

      </div>


      <div class="priority-source">

        ${escapeHtml(
          priority.source
        )}

      </div>

    </article>

  `;

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


function weeklySequenceHtml(
  week
) {

  return `

    <section
      class="week-shell"
      data-week="${escapeAttribute(
        week.id
      )}"
    >

      <div class="week-shell-head">

        <div>

          <h3>
            Week
            ${escapeHtml(
              week.number
            )}
          </h3>

          <input
            class="week-focus"
            value="${escapeAttribute(
              week.focus ||
              ""
            )}"
            placeholder="Weekly learning focus..."
          >

        </div>


        <label>

          Teaching phase

          <select class="week-phase">

            ${teachingPhaseOptions(
              week.phase
            )}

          </select>

        </label>

      </div>


      <div class="lesson-stack">

        ${
          week.lessons
            .map(
              (lesson, index) =>
                lessonCardHtml(
                  lesson,
                  index
                )
            )
            .join("")
        }

      </div>


      <div class="week-add-lesson">

        <button
          type="button"
          class="mini add-week-lesson"
        >
          + Add lesson / learning experience
        </button>

      </div>


      <div class="weekly-support">

        ${weekSupportTextarea(
          "Formative check / evidence",
          "week-formative",
          week.formativeCheck,
          "How will you check what students know, understand or can do this week?"
        )}

        ${weekSupportTextarea(
          "Vocabulary / terminology",
          "week-vocabulary",
          week.vocabulary,
          "Key Tier 2, Tier 3 or subject-specific vocabulary..."
        )}

        ${weekSupportTextarea(
          "Adjustments / scaffolds",
          "week-adjustments",
          week.adjustments,
          "Planned supports, scaffolds or access adjustments..."
        )}

      </div>


      <div class="weekly-support">

        ${weekSupportTextarea(
          "Resources / texts",
          "week-resources",
          week.resources,
          "Texts, sources, visuals, manipulatives, digital resources..."
        )}

        ${weekSupportTextarea(
          "Teacher notes",
          "week-notes",
          week.notes,
          "Planning notes, changes or reminders..."
        )}

      </div>

    </section>

  `;

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
          Learning experience
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


              return suggestLessonContent(
                lesson,
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


  if (
    output
  ) {

    output.innerHTML = `

      <strong>
        Suggested teaching sequence created
      </strong>

      <p>
        The planner has distributed selected
        Achievement Standard demands across the
        weekly learning experiences rather than
        repeating one subject-level suggestion.
      </p>

      <p>
        Existing teacher entries have not been
        overwritten. Review and edit the sequence
        so it reflects the actual students, texts,
        examples, resources and teaching context.
      </p>

    `;

  }


  renderSavedWeeklySequence();

}


function suggestLessonContent(
  lesson,
  weekPhase,
  phasePriorities,
  subjectRows,
  lessonIndex = 0,
  subjectLessonCount = 1,
  weekNumber = 1,
  totalWeeks = 10
) {

  const subject =
    lesson.subject ||
    "Integrated";


  const rows =
    subjectRows[
      subject
    ] ||
    [];


  const subjectPriority =

    phasePriorities.find(
      (item) =>
        item.subject ===
        subject
    ) ||

    phasePriorities.find(
      (item) =>
        item.subject &&
        subject.includes(
          item.subject
        )
    );


  const curriculumSuggestion =
    buildCurriculumLessonSuggestion(
      subject,
      rows,
      lessonIndex,
      subjectLessonCount,
      weekPhase,
      weekNumber,
      totalWeeks
    );


  return {

    ...lesson,


    // --------------------------------------------------------
    // REGENERATE THE TEACHING PHASE
    // --------------------------------------------------------

    phase:
      curriculumSuggestion.phase ||
      weekPhase ||
      lesson.phase ||
      "",


    // --------------------------------------------------------
    // REGENERATE THE LEARNING PURPOSE
    // --------------------------------------------------------

    purpose:
      curriculumSuggestion.purpose ||
      subjectPriority?.focus ||
      defaultLessonPurpose(
        subject,
        rows,
        weekPhase
      ) ||
      lesson.purpose ||
      "",


    // --------------------------------------------------------
    // REGENERATE THE LEARNING EXPERIENCE
    // --------------------------------------------------------

    activity:
      curriculumSuggestion.activity ||
      suggestedLearningExperience(
        curriculumSuggestion.phase ||
        weekPhase,
        subject
      ) ||
      lesson.activity ||
      "",


    // --------------------------------------------------------
    // REGENERATE FORMATIVE EVIDENCE
    // --------------------------------------------------------

    evidence:
      curriculumSuggestion.evidence ||
      suggestedLessonEvidence(
        curriculumSuggestion.phase ||
        weekPhase
      ) ||
      lesson.evidence ||
      "",


    // --------------------------------------------------------
    // REGENERATE THE INTEGRATION CONNECTION
    // --------------------------------------------------------

    integration:
      curriculumSuggestion.integration ||
      suggestedIntegrationConnection(
        subject,
        subjectRows
      ) ||
      lesson.integration ||
      ""

  };

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
      lessonIndex %
      rows.length
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
      lessonIndex %
      orderedRows.length
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