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

  document
    .getElementById(
      "suggestBackwardPlanning"
    )
    ?.addEventListener(
      "click",
      suggestBackwardPlanning
    );

document
  .getElementById(
    "buildReadinessCheck"
  )
  ?.addEventListener(
    "click",
    buildAssessmentReadiness
  );

renderSavedReadiness();
}

// ============================================================
// LOAD / SAVE
// ============================================================

function loadSavedBackwardPlanning() {

  setValue(
    "sequenceKnow",
    normaliseText(
      unitPlan.sequence.know
    )
  );

  setValue(
    "sequenceUnderstand",
    normaliseText(
      unitPlan.sequence.understand
    )
  );

  setValue(
    "sequenceDo",
    normaliseText(
      unitPlan.sequence.do
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


function bindField(
  elementId,
  statePath
) {

  const element =
    document.getElementById(
      elementId
    );


  if (!element) {
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

    output.innerHTML = `

      <div class="empty">

        Select Achievement Standard aspects
        in Step 2 before generating backward
        planning suggestions.

      </div>

    `;

    return;

  }


  const assessmentComponents =
    getAssessmentComponentsAcrossYears();


  const knowSuggestions =
    buildKnowSuggestions(
      rows
    );


  const understandSuggestions =
    buildUnderstandSuggestions(
      rows
    );


  const doSuggestions =
    buildDoSuggestions(
      rows,
      assessmentComponents
    );


  const knowText =
    bulletText(
      knowSuggestions
    );


  const understandText =
    bulletText(
      understandSuggestions
    );


  const doText =
    bulletText(
      doSuggestions
    );


  const knowField =
    document.getElementById(
      "sequenceKnow"
    );


  const understandField =
    document.getElementById(
      "sequenceUnderstand"
    );


  const doField =
    document.getElementById(
      "sequenceDo"
    );


  // During development the Suggest button deliberately
  // refreshes all three generated areas.
  // We can later add a separate Regenerate button if desired.

  if (knowField) {

    knowField.value =
      knowText;

    updateUnitPlan(
      "sequence.know",
      knowText
    );

  }


  if (understandField) {

    understandField.value =
      understandText;

    updateUnitPlan(
      "sequence.understand",
      understandText
    );

  }


  if (doField) {

    doField.value =
      doText;

    updateUnitPlan(
      "sequence.do",
      doText
    );

  }


  output.innerHTML = `

    <strong>
      Suggested backward-planning lens
    </strong>

    <p>
      These suggestions have been drawn from
      the Achievement Standard aspects already
      selected and the assessment evidence
      mapped in Step 4.
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


// ============================================================
// GROUP CURRICULUM BY SUBJECT
// ============================================================

function rowsGroupedBySubject(
  rows
) {

  return rows.reduce(
    (result, row) => {

      if (!result[row.subject]) {

        result[row.subject] = [];

      }


      result[row.subject]
        .push(row);


      return result;

    },
    {}
  );

}


// ============================================================
// KNOW
// ============================================================

function buildKnowSuggestions(
  rows
) {

  const suggestions = [];


  const grouped =
    rowsGroupedBySubject(
      rows
    );


  Object.entries(grouped)
    .forEach(
      ([subject, subjectRows]) => {

        const combinedText =
          subjectRows
            .map(
              (row) =>
                row.text || ""
            )
            .join(" ")
            .toLowerCase();


        const requirements = [];


        // ----------------------------------------------------
        // VOCABULARY
        // ----------------------------------------------------

        if (
          /vocab|terminolog|language feature|topic-specific|technical language/
            .test(combinedText)
        ) {

          requirements.push(
            "the topic-specific, disciplinary and academic vocabulary required to understand and communicate the learning"
          );

        }


        // ----------------------------------------------------
        // SOURCES / TEXTS / INFORMATION
        // ----------------------------------------------------

        if (
          /source|text|information|data|evidence|graph|table|map|image/
            .test(combinedText)
        ) {

          requirements.push(
            "the background knowledge needed to make sense of the texts, sources, information, representations or data used in the unit"
          );

        }


        // ----------------------------------------------------
        // CONTENT KNOWLEDGE
        // ----------------------------------------------------

        requirements.push(
          "the essential facts, examples, content knowledge and subject-specific concepts students will need to retrieve independently"
        );


        suggestions.push(

          `${subject}: students need to know ${joinNaturalList(
            unique(requirements)
          )}.`

        );

      }
    );


  if (!suggestions.length) {

    suggestions.push(
      "Students need to know the essential facts, terminology, examples and background knowledge required to understand the unit and complete the assessment successfully."
    );

  }


  return unique(
    suggestions
  );

}


// ============================================================
// UNDERSTAND
// ============================================================

function buildUnderstandSuggestions(
  rows
) {

  const suggestions = [];


  const grouped =
    rowsGroupedBySubject(
      rows
    );


  Object.entries(grouped)
    .forEach(
      ([subject, subjectRows]) => {

        const combinedText =
          subjectRows
            .map(
              (row) =>
                row.text || ""
            )
            .join(" ")
            .toLowerCase();


        const concepts = [];


        // ----------------------------------------------------
        // CONNECTIONS
        // ----------------------------------------------------

        if (
          /similarit|difference|compare|connection|relationship|interconnect/
            .test(combinedText)
        ) {

          concepts.push(
            "how ideas, people, places, information or features are connected, similar or different"
          );

        }


        // ----------------------------------------------------
        // CAUSE / EFFECT / HOW / WHY
        // ----------------------------------------------------

        if (
          /cause|effect|why|how|explain/
            .test(combinedText)
        ) {

          concepts.push(
            "how and why important events, ideas, processes or relationships occur"
          );

        }


        // ----------------------------------------------------
        // PERSPECTIVE
        // ----------------------------------------------------

        if (
          /perspective|viewpoint/
            .test(combinedText)
        ) {

          concepts.push(
            "that information, events and issues can be represented or understood from different perspectives"
          );

        }


        // ----------------------------------------------------
        // PATTERNS / TRENDS
        // ----------------------------------------------------

        if (
          /pattern|trend/
            .test(combinedText)
        ) {

          concepts.push(
            "how patterns or trends can be identified and what they may reveal"
          );

        }


        // ----------------------------------------------------
        // PURPOSE / AUDIENCE / MEANING
        // ----------------------------------------------------

        if (
          /significance|meaning|purpose|audience/
            .test(combinedText)
        ) {

          concepts.push(
            "how significance, purpose, audience and meaning influence the way information or ideas are understood and communicated"
          );

        }


        if (!concepts.length) {

          concepts.push(
            "the important concepts and relationships that sit behind the factual content rather than simply recalling isolated information"
          );

        }


        suggestions.push(

          `${subject}: students need to understand ${joinNaturalList(
            unique(concepts)
          )}.`

        );

      }
    );


  if (!suggestions.length) {

    suggestions.push(
      "Students need to understand the major concepts, relationships and principles that allow them to make meaning from the content."
    );

  }


  return unique(
    suggestions
  );

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


// ============================================================
// BUILD DO SUGGESTIONS
// ============================================================

function buildDoSuggestions(
  rows,
  assessmentComponents
) {

  const suggestions = [];


  const grouped =
    rowsGroupedBySubject(
      rows
    );


  // ----------------------------------------------------------
  // SUBJECT-SPECIFIC TEACHING ACTIONS
  // ----------------------------------------------------------

  Object.entries(grouped)
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


        const statement =
          buildSubjectDoStatement(
            subject,
            verbs
          );


        if (statement) {

          suggestions.push(
            statement
          );

        }

      }
    );


  // ----------------------------------------------------------
  // ASSESSMENT RESPONSE FORMATS
  // ----------------------------------------------------------

  const assessmentFormats =
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
    assessmentFormats.length
  ) {

    suggestions.push(

      `Assessment preparation: provide guided practice and opportunities for independent application using the response formats students will encounter in the assessment, including ${joinNaturalList(
        assessmentFormats
      )}.`

    );

  }


  // ----------------------------------------------------------
  // ASSESSMENT COGNITIVE DEMANDS
  // ----------------------------------------------------------

  const assessmentVerbs =
    unique(
      assessmentComponents
        .flatMap(
          (component) =>
            component.verbs || []
        )
    );


  const assessmentActions =
    buildAssessmentPracticeActions(
      assessmentVerbs
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


  if (!suggestions.length) {

    suggestions.push(
      "Explicitly teach, model and provide guided practice in the key processes and cognitive demands students must later demonstrate independently."
    );

  }


  return unique(
    suggestions
  );

}


// ============================================================
// GROUP SUBJECT DO ACTIONS
// ============================================================

function buildSubjectDoStatement(
  subject,
  verbs
) {

  if (!verbs.length) {

    return "";

  }


  const actions = [];


  // ----------------------------------------------------------
  // READING / VIEWING / COMPREHENSION
  // ----------------------------------------------------------

  if (
    verbs.includes("read") ||
    verbs.includes("view") ||
    verbs.includes("comprehend")
  ) {

    actions.push(
      "read, view and comprehend relevant texts, sources or representations"
    );

  }


  // ----------------------------------------------------------
  // FIND / IDENTIFY / SELECT
  // ----------------------------------------------------------

  if (
    verbs.includes("identify") ||
    verbs.includes("recognise") ||
    verbs.includes("select") ||
    verbs.includes("locate")
  ) {

    actions.push(
      "identify and select relevant information, features or relationships"
    );

  }


  // ----------------------------------------------------------
  // INTERPRET / ANALYSE / INFER
  // ----------------------------------------------------------

  if (
    verbs.includes("interpret") ||
    verbs.includes("analyse") ||
    verbs.includes("infer")
  ) {

    actions.push(
      "interpret and analyse information or evidence to make meaning and draw appropriate inferences"
    );

  }


  // ----------------------------------------------------------
  // DESCRIBE / EXPLAIN / COMPARE
  // ----------------------------------------------------------

  if (
    verbs.includes("describe") ||
    verbs.includes("explain") ||
    verbs.includes("compare")
  ) {

    actions.push(
      "describe and explain key ideas, features, similarities, differences or relationships"
    );

  }


  // ----------------------------------------------------------
  // ORGANISE / GROUP / SEQUENCE / LINK
  // ----------------------------------------------------------

  if (
    verbs.includes("organise") ||
    verbs.includes("sequence") ||
    verbs.includes("group") ||
    verbs.includes("link")
  ) {

    actions.push(
      "organise, sequence and link ideas logically"
    );

  }


  // ----------------------------------------------------------
  // CREATE / CONSTRUCT / REPRESENT / COMMUNICATE
  // ----------------------------------------------------------

  if (
    verbs.includes("create") ||
    verbs.includes("construct") ||
    verbs.includes("represent") ||
    verbs.includes("communicate") ||
    verbs.includes("present") ||
    verbs.includes("write")
  ) {

    actions.push(
      "create and communicate an appropriate written, oral, visual, practical or multimodal response for the required purpose"
    );

  }


  // ----------------------------------------------------------
  // USE / APPLY
  // ----------------------------------------------------------

  if (
    verbs.includes("use") ||
    verbs.includes("apply")
  ) {

    actions.push(
      "apply the required language features, conventions, knowledge, strategies or processes appropriately"
    );

  }


  // ----------------------------------------------------------
  // DEVELOP / PLAN / INVESTIGATE / COLLECT
  // ----------------------------------------------------------

  if (
    verbs.includes("develop") ||
    verbs.includes("plan") ||
    verbs.includes("investigate") ||
    verbs.includes("collect")
  ) {

    actions.push(
      "develop questions or plans, investigate appropriately and gather relevant information or evidence"
    );

  }


  // ----------------------------------------------------------
  // EVALUATE / JUSTIFY / PROPOSE
  // ----------------------------------------------------------

  if (
    verbs.includes("evaluate") ||
    verbs.includes("justify") ||
    verbs.includes("propose")
  ) {

    actions.push(
      "make, justify and communicate considered judgements, conclusions, proposals or responses"
    );

  }


  // ----------------------------------------------------------
  // DEMONSTRATE / PERFORM
  // ----------------------------------------------------------

  if (
    verbs.includes("demonstrate") ||
    verbs.includes("perform")
  ) {

    actions.push(
      "demonstrate or perform the required skills and processes safely, accurately and independently"
    );

  }


  // ----------------------------------------------------------
  // CLASSIFY
  // ----------------------------------------------------------

  if (
    verbs.includes("classify")
  ) {

    actions.push(
      "classify information, objects or ideas using appropriate characteristics or criteria"
    );

  }


  // ----------------------------------------------------------
  // SUMMARISE
  // ----------------------------------------------------------

  if (
    verbs.includes("summarise")
  ) {

    actions.push(
      "summarise the most important information or ideas concisely"
    );

  }


  const uniqueActions =
    unique(
      actions
    );


  if (
    !uniqueActions.length
  ) {

    return `${subject}: explicitly teach, model and provide guided practice in the key processes required by the selected Achievement Standard aspects.`;

  }


  return `${subject}: explicitly teach students to ${joinNaturalList(
    uniqueActions
  )}.`;

}


// ============================================================
// ASSESSMENT PRACTICE LANGUAGE
// ============================================================

function buildAssessmentPracticeActions(
  verbs
) {

  const groups = [];


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

    groups.push(
      "identifying and selecting relevant information or relationships"
    );

  }


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

    groups.push(
      "reading, viewing and comprehending relevant texts or sources"
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

    groups.push(
      "interpreting and analysing information or evidence"
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

    groups.push(
      "describing and explaining ideas, features and relationships"
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

    groups.push(
      "organising, sequencing and linking ideas logically"
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

    groups.push(
      "creating and communicating an appropriate response"
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

    groups.push(
      "applying required knowledge, language features, conventions or processes appropriately"
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

    groups.push(
      "developing questions or plans and gathering relevant information or evidence"
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

    groups.push(
      "making and justifying considered judgements, conclusions or responses"
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

    groups.push(
      "demonstrating the required skills or processes independently"
    );

  }


  if (
    verbs.includes(
      "classify"
    )
  ) {

    groups.push(
      "classifying using appropriate characteristics or criteria"
    );

  }


  if (
    verbs.includes(
      "summarise"
    )
  ) {

    groups.push(
      "summarising important information or ideas"
    );

  }


  return unique(
    groups
  );

}
// ============================================================
// ASSESSMENT READINESS
// ============================================================

function buildAssessmentReadiness() {

  const years =
    unitPlan.setup.yearLevels || [];


  const readiness = {};


  years.forEach(
    (yearLevel) => {

      const assessment =
        getAssessment(
          yearLevel
        );


      if (
        !assessment ||
        !assessment.components?.length
      ) {
        return;
      }


      const yearRows =
        getSelectedCurriculumRows()
          .filter(
            (row) =>
              gradesForYear(
                yearLevel
              ).includes(
                row.grade
              )
          );


      const components =
        assessment.components
          .filter(
            (component) =>
              component
                .selectedStandardCodes
                ?.length
          );


      if (!components.length) {
        return;
      }


      readiness[yearLevel] =
        components.map(
          (component, index) => {

            const rows =
              yearRows.filter(
                (row) =>
                  component
                    .selectedStandardCodes
                    .includes(
                      row.code
                    )
              );


            const verbs =
              unique(
                rows.flatMap(
                  (row) =>
                    findCognitiveVerbs(
                      row.text
                    )
                )
              );


            const existing =
              unitPlan.sequence
                .readinessChecks
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
                component.evidenceFormat || "",

              verbs,

              subjects:
                unique(
                  rows.map(
                    (row) =>
                      row.subject
                  )
                ),

              checks:
                existing?.checks ||
                buildReadinessItems(
                  rows,
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


// ============================================================
// BUILD READINESS ITEMS
// ============================================================

function buildReadinessItems(
  rows,
  verbs,
  evidenceFormat
) {

  const items = [];


  items.push({
    id:
      crypto.randomUUID(),
    label:
      "Required background knowledge and content have been explicitly taught.",
    checked:
      false
  });


  if (
    rows.some(
      (row) =>
        /vocab|terminolog|language|technical|topic-specific/i
          .test(
            row.text || ""
          )
    )
  ) {

    items.push({
      id:
        crypto.randomUUID(),
      label:
        "Relevant Tier 2, Tier 3 and subject-specific vocabulary has been introduced and revisited.",
      checked:
        false
    });

  } else {

    items.push({
      id:
        crypto.randomUUID(),
      label:
        "Vocabulary students need to understand the task and content has been explicitly taught.",
      checked:
        false
    });

  }


  if (verbs.length) {

    items.push({
      id:
        crypto.randomUUID(),
      label:
        `The cognitive demand has been explicitly modelled: ${joinNaturalList(
          verbs.map(
            (verb) =>
              verb.toUpperCase()
          )
        )}.`,
      checked:
        false
    });


    items.push({
      id:
        crypto.randomUUID(),
      label:
        `Students have completed guided practice in ${joinNaturalList(
          buildAssessmentPracticeActions(
            verbs
          )
        )}.`,
      checked:
        false
    });

  }


  if (
    evidenceFormat &&
    evidenceFormat !== "__own"
  ) {

    items.push({
      id:
        crypto.randomUUID(),
      label:
        `Students have practised the assessment response format before summative use: ${evidenceFormat}.`,
      checked:
        false
    });

  }


  items.push({
    id:
      crypto.randomUUID(),
    label:
      "Students have had an independent practice opportunity before completing this component for summative evidence.",
    checked:
      false
  });


  items.push({
    id:
      crypto.randomUUID(),
    label:
      "Any required scaffolds or adjustments support access without supplying the assessed knowledge or thinking.",
    checked:
      false
  });


  return items;

}


// ============================================================
// RENDER READINESS
// ============================================================

function renderSavedReadiness() {

  const container =
    document.getElementById(
      "assessmentReadiness"
    );


  if (!container) {
    return;
  }


  const readiness =
    unitPlan.sequence
      .readinessChecks || {};


  const years =
    Object.keys(
      readiness
    )
      .filter(
        (year) =>
          readiness[year]
            ?.length
      );


  if (!years.length) {

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


// ============================================================
// READINESS CARD
// ============================================================

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


// ============================================================
// READINESS EVENTS
// ============================================================

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

                  updateReadinessCheck(
                    yearLevel,
                    componentId,
                    checkbox
                      .dataset
                      .check,
                    checkbox.checked
                  );

                }
              );

            }
          );

      }
    );

}


function updateReadinessCheck(
  yearLevel,
  componentId,
  checkId,
  checked
) {

  const readiness =
    structuredClone(
      unitPlan.sequence
        .readinessChecks ||
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


  if (!component) {
    return;
  }


  const check =
    component.checks
      .find(
        (item) =>
          item.id ===
          checkId
      );


  if (!check) {
    return;
  }


  check.checked =
    checked;


  updateUnitPlan(
    "sequence.readinessChecks",
    readiness
  );

}

// ============================================================
// ASSESSMENT INFORMATION
// ============================================================

function getAssessmentComponentsAcrossYears() {

  const years =
    unitPlan.setup.yearLevels ||
    [];


  const result = [];


  years.forEach(
    (yearLevel) => {

      const assessment =
        getAssessment(
          yearLevel
        );


      if (!assessment) {
        return;
      }


      assessment.components
        ?.forEach(
          (component) => {

            const verbs =
              getComponentVerbs(
                component,
                yearLevel
              );


            result.push({

              yearLevel,

              questionText:
                component.questionText ||
                "",

              evidenceFormat:
                component.evidenceFormat ||
                "",

              verbs

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

  const selectedRows =
    getSelectedCurriculumRows();


  const acceptedGrades =
    gradesForYear(
      yearLevel
    );


  const rows =
    selectedRows
      .filter(
        (row) =>
          acceptedGrades.includes(
            row.grade
          ) &&
          component
            .selectedStandardCodes
            ?.includes(
              row.code
            )
      );


  return unique(
    rows.flatMap(
      (row) =>
        findCognitiveVerbs(
          row.text
        )
    )
  );

}


// ============================================================
// VERB DETECTION
// ============================================================

function findCognitiveVerbs(
  text = ""
) {

  const lower =
    String(text)
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

  const replacements = {

    analyze:
      "analyse",

    organize:
      "organise",

    summarize:
      "summarise"

  };


  return replacements[verb] ||
    verb;

}


// ============================================================
// YEAR / BAND MAPPING
// ============================================================

function gradesForYear(
  year
) {

  const values =
    [year];


  const match =
    String(year || "")
      .match(/\d+/);


  if (!match) {
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
// HELPERS
// ============================================================

function unique(
  values
) {

  return [
    ...new Set(
      values.filter(Boolean)
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

  if (
    Array.isArray(value)
  ) {

    return bulletText(
      value
    );

  }


  return value || "";

}


function setValue(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.value =
      value || "";

  }

}


function joinNaturalList(
  values
) {

  const cleaned =
    values.filter(Boolean);


  if (!cleaned.length) {
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
    .slice(0, -1)
    .join(", ")}, and ${cleaned.at(-1)}`;

}
// ============================================================
// HTML SAFETY HELPERS
// ============================================================

function escapeHtml(
  value
) {

  return String(
    value ?? ""
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