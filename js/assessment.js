import {
  unitPlan,
  getAssessment,
  setActiveAssessmentYear,
  updateUnitPlan
} from "./state.js";

import {
  getSelectedCurriculumRows
} from "./curriculum.js";


// ============================================================
// PAGE INITIALISATION
// ============================================================

export function initAssessmentPage() {

  renderAssessmentYearBuilder();

  document
    .getElementById(
      "addEvidenceComponent"
    )
    ?.addEventListener(
      "click",
      () => {

        const yearLevel =
          unitPlan.assessments
            .activeYear;


        if (!yearLevel) {
          return;
        }


        addNewEvidenceComponent(
          yearLevel
        );

      }
    );


  document
    .getElementById(
      "analyseEvidenceMap"
    )
    ?.addEventListener(
      "click",
      analyseEvidenceMap
    );

}


// ============================================================
// AVAILABLE ASSESSMENT YEARS
// ============================================================

function eligibleAssessmentYears() {

  // Assessment year choice comes directly from Unit Setup.
  // A year must not disappear merely because curriculum
  // filtering has not yet resolved.

  return [
    ...unitPlan.setup.yearLevels
  ];

}


// ============================================================
// YEAR SELECTOR
// ============================================================

function renderAssessmentYearBuilder() {

  const container =
    document.getElementById(
      "assessmentYearBuilder"
    );


  const workspace =
    document.getElementById(
      "assessmentWorkspace"
    );


  const years =
    eligibleAssessmentYears();


  if (!years.length) {

    workspace.hidden = true;

    container.innerHTML = `
      <div class="empty">
        Select the year levels for this
        unit in Step 1 first.
      </div>
    `;

    return;

  }


  const current =
    unitPlan.assessments.activeYear;


  if (
    current &&
    !years.includes(current)
  ) {

    updateUnitPlan(
      "assessments.activeYear",
      ""
    );

  }


  const activeYear =
    years.includes(current)
      ? current
      : "";


  container.innerHTML = `

    <div class="year-builder-head">

      <div>

        <span class="eyebrow">
          Multi-age assessment
        </span>

        <h3>
          ${
            activeYear
              ? "Assessment year level"
              : "Which year level would you like to create first?"
          }
        </h3>

        <p>
          ${
            activeYear
              ? `
                Build this assessment only
                against the Achievement
                Standard applicable to
                <strong>${escapeHtml(activeYear)}</strong>.
                You can create another
                year-level assessment afterwards.
              `
              : `
                Choose a year level before
                creating assessment questions.
                Students may share the same
                integrated unit context, but
                each assessment remains aligned
                to its own year-level standard.
              `
          }
        </p>

      </div>


      <div class="year-builder-chips">

        ${
          years
            .map(
              (year) => `

                <button
                  type="button"
                  class="
                    chip
                    assessment-year-chip
                    ${
                      year === activeYear
                        ? "selected"
                        : ""
                    }
                  "
                  data-year="${escapeAttribute(year)}"
                >
                  ${escapeHtml(year)}
                </button>

              `
            )
            .join("")
        }

      </div>

    </div>


    ${
      activeYear
        ? `
          <div class="year-builder-actions">

            <span>
              Current assessment:
              <strong>
                ${escapeHtml(activeYear)}
              </strong>
            </span>

            <button
              type="button"
              class="mini"
              id="changeAssessmentYear"
            >
              Choose a different year level
            </button>

          </div>
        `
        : `
          <div class="year-choice-note">
            No assessment has been started yet.
            Select the year level you want to
            focus on first.
          </div>
        `
    }

  `;


  container
    .querySelectorAll(
      ".assessment-year-chip"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            selectAssessmentYear(
              button.dataset.year
            );

          }
        );

      }
    );


  const changeButton =
    document.getElementById(
      "changeAssessmentYear"
    );


  if (changeButton) {

    changeButton.addEventListener(
      "click",
      () => {

        updateUnitPlan(
          "assessments.activeYear",
          ""
        );

        workspace.hidden = true;

        renderAssessmentYearBuilder();

      }
    );

  }


  if (activeYear) {

    workspace.hidden = false;

    loadAssessmentMetadata(
      activeYear
    );

    renderAssessmentAlignment(
      activeYear
    );
    renderEvidenceMap(
        activeYear
    );

  } else {

    workspace.hidden = true;

  }

}

// ============================================================
// SELECT ASSESSMENT YEAR
// ============================================================

function selectAssessmentYear(
  yearLevel
) {

  setActiveAssessmentYear(
    yearLevel
  );


  renderAssessmentYearBuilder();

}


// ============================================================
// ASSESSMENT METADATA
// ============================================================

function loadAssessmentMetadata(
  yearLevel
) {

  const assessment =
    getAssessment(yearLevel);


  setValue(
    "assessmentTitle",
    assessment.title
  );

  setValue(
    "assessmentTechnique",
    assessment.technique || "Project"
  );

  setValue(
    "assessmentPurpose",
    assessment.purpose
  );

  setValue(
    "assessmentContext",
    assessment.context
  );

  setValue(
    "assessmentTask",
    assessment.taskEvidence
  );

  setValue(
    "assessmentConditions",
    assessment.conditions
  );

  setValue(
    "gtmjNotes",
    assessment.notes
  );


  bindAssessmentField(
    "assessmentTitle",
    "title",
    yearLevel
  );

  bindAssessmentField(
    "assessmentTechnique",
    "technique",
    yearLevel
  );

  bindAssessmentField(
    "assessmentPurpose",
    "purpose",
    yearLevel
  );

  bindAssessmentField(
    "assessmentContext",
    "context",
    yearLevel
  );

  bindAssessmentField(
    "assessmentTask",
    "taskEvidence",
    yearLevel
  );

  bindAssessmentField(
    "assessmentConditions",
    "conditions",
    yearLevel
  );

  bindAssessmentField(
    "gtmjNotes",
    "notes",
    yearLevel
  );

}


function bindAssessmentField(
  elementId,
  fieldName,
  yearLevel
) {

  const element =
    document.getElementById(
      elementId
    );


  // Replacing the node prevents duplicate
  // event listeners if the teacher changes
  // assessment year several times.

  const fresh =
    element.cloneNode(true);


  element.replaceWith(fresh);


  fresh.addEventListener(
    "input",
    (event) => {

      const assessment =
        getAssessment(yearLevel);


      assessment[fieldName] =
        event.target.value;


      updateUnitPlan(
        `assessments.byYear.${yearLevel}`,
        assessment
      );

    }
  );

}


// ============================================================
// YEAR-SPECIFIC CURRICULUM
// ============================================================

function rowsForAssessmentYear(
  yearLevel
) {

  const selectedRows =
    getSelectedCurriculumRows();


  const accepted =
    gradesForYear(yearLevel);


  return selectedRows.filter(
    (row) =>
      accepted.includes(
        row.grade
      )
  );

}


function gradesForYear(year) {

  const values = [year];

  const match =
    year.match(/\d+/);


  if (!match) {
    return values;
  }


  const number =
    Number(match[0]);


  if (
    number === 1 ||
    number === 2
  ) {
    values.push("Years 1–2");
  }


  if (
    number === 3 ||
    number === 4
  ) {
    values.push("Years 3–4");
  }


  if (
    number === 5 ||
    number === 6
  ) {
    values.push("Years 5–6");
  }


  return values;

}

// ============================================================
// COGNITIVE VERB SUPPORT
// ============================================================

const VERB_SUPPORT = {

  identify: {
    meaning:
      "Recognise, select or name the required information. An extended explanation is not automatically required.",
    evidence: [
      "Tick/select the correct option",
      "Match or sort items",
      "Label a diagram or image",
      "Draw linking lines or arrows",
      "Name or highlight the relevant feature"
    ]
  },

  recognise: {
    meaning:
      "Identify something as known, relevant or belonging to a category.",
    evidence: [
      "Select or highlight",
      "Match",
      "Sort or classify",
      "Label",
      "Brief oral response"
    ]
  },

  describe: {
    meaning:
      "Give relevant characteristics, features or details.",
    evidence: [
      "Short written or oral description",
      "Annotated diagram or image",
      "Labelled example with details",
      "Table of features",
      "Recorded explanation"
    ]
  },

  explain: {
    meaning:
      "Make how, why, cause, effect or relationships clear.",
    evidence: [
      "Short how/why response",
      "Cause-and-effect diagram plus explanation",
      "Annotated model plus oral explanation",
      "Recorded explanation",
      "Conference response"
    ]
  },

  compare: {
    meaning:
      "Identify relevant similarities and differences.",
    evidence: [
      "Venn diagram",
      "Comparison table",
      "Sorting with similarities and differences",
      "Oral comparison",
      "Short comparative response"
    ]
  },

  classify: {
    meaning:
      "Group according to relevant characteristics or criteria.",
    evidence: [
      "Sorting task",
      "Classification key or table",
      "Drag-and-drop grouping",
      "Labelled groups with criteria"
    ]
  },

  analyse: {
    meaning:
      "Examine information, evidence or data to identify relationships, patterns, components or meaning.",
    evidence: [
      "Source analysis",
      "Data interpretation",
      "Annotated evidence",
      "Relationship map",
      "Short analysis response"
    ]
  },

  interpret: {
    meaning:
      "Use information or evidence to determine and communicate meaning.",
    evidence: [
      "Interpret a source",
      "Interpret a graph or table",
      "Annotate information",
      "Short oral interpretation",
      "Source-based response"
    ]
  },

  evaluate: {
    meaning:
      "Make a judgement using evidence or criteria.",
    evidence: [
      "Evaluate against criteria",
      "Choose the strongest option and justify",
      "Recommendation",
      "Rating plus evidence",
      "Evidence-based judgement"
    ]
  },

  justify: {
    meaning:
      "Give reasons or evidence to support a choice, conclusion or position.",
    evidence: [
      "Short justification",
      "Evidence plus reason",
      "Oral justification",
      "Annotated choice",
      "Recommendation with reasons"
    ]
  },

  create: {
    meaning:
      "Produce a text, product, performance or response for a stated purpose and audience.",
    evidence: [
      "Written text",
      "Multimodal product",
      "Presentation",
      "Creative product",
      "Digital product"
    ]
  },

  construct: {
    meaning:
      "Build or produce the required product, representation or solution.",
    evidence: [
      "Constructed model",
      "Diagram",
      "Digital product",
      "Designed solution",
      "Representation"
    ]
  },

  demonstrate: {
    meaning:
      "Show the required skill, process or behaviour in action.",
    evidence: [
      "Observed demonstration",
      "Performance",
      "Practical task",
      "Teacher checklist",
      "Video evidence"
    ]
  },

  apply: {
    meaning:
      "Use knowledge, skills, rules or strategies in a situation.",
    evidence: [
      "Practical application",
      "Worked example",
      "Scenario response",
      "Performance",
      "Apply to a new example"
    ]
  },

  use: {
    meaning:
      "Apply the named knowledge, feature, convention, process or skill appropriately.",
    evidence: [
      "Authentic product or performance",
      "Annotated example",
      "Observed application",
      "Short task using the required feature"
    ]
  },

  develop: {
    meaning:
      "Formulate, build or refine the required idea, question, plan or response.",
    evidence: [
      "Question set",
      "Planning artefact",
      "Draft and refinement",
      "Design proposal",
      "Documented process"
    ]
  },

  propose: {
    meaning:
      "Put forward a considered action, response, solution or idea.",
    evidence: [
      "Recommendation",
      "Action proposal",
      "Design idea",
      "Select an option and give a rationale"
    ]
  },

  select: {
    meaning:
      "Choose relevant information, ideas, features or options for a purpose.",
    evidence: [
      "Selection or highlighting",
      "Curated evidence",
      "Choose from options",
      "Annotated selection"
    ]
  },

  organise: {
    meaning:
      "Arrange information or ideas into a purposeful structure.",
    evidence: [
      "Table",
      "Timeline",
      "Category sort",
      "Structured notes",
      "Organised presentation"
    ]
  },

  group: {
    meaning:
      "Bring related ideas or information together in a purposeful way.",
    evidence: [
      "Sort related ideas",
      "Group information into categories",
      "Organised paragraph or section"
    ]
  },

  sequence: {
    meaning:
      "Place ideas, events or steps in a logical or required order.",
    evidence: [
      "Order cards or events",
      "Timeline",
      "Sequenced steps",
      "Logically ordered text"
    ]
  },

  link: {
    meaning:
      "Make relationships or connections between ideas clear.",
    evidence: [
      "Draw linking lines or arrows",
      "Relationship map",
      "Use cohesive links in a text",
      "Brief linked explanation"
    ]
  },

  locate: {
    meaning:
      "Find relevant information in a source or set of sources.",
    evidence: [
      "Highlight relevant information",
      "Source scavenger task",
      "Record located information in a table"
    ]
  },

  collect: {
    meaning:
      "Gather relevant information or data for a purpose.",
    evidence: [
      "Source notes",
      "Data collection table",
      "Observation record"
    ]
  },

  represent: {
    meaning:
      "Show information, ideas or relationships in an appropriate form.",
    evidence: [
      "Diagram or model",
      "Graph or table",
      "Map or timeline",
      "Visual representation",
      "Digital representation"
    ]
  },

  investigate: {
    meaning:
      "Systematically inquire, gather evidence and use it to address a question.",
    evidence: [
      "Investigation record",
      "Observations and data",
      "Inquiry product",
      "Practical investigation"
    ]
  },

  plan: {
    meaning:
      "Decide and sequence actions, methods or processes before carrying them out.",
    evidence: [
      "Plan or method",
      "Flowchart",
      "Design plan",
      "Sequence of steps"
    ]
  },

  perform: {
    meaning:
      "Present or enact the required skills or work for an audience or setting.",
    evidence: [
      "Live performance",
      "Recorded performance",
      "Observed demonstration"
    ]
  },

  communicate: {
    meaning:
      "Convey ideas, findings or meaning using appropriate forms and conventions.",
    evidence: [
      "Oral presentation",
      "Written product",
      "Multimodal product",
      "Visual communication",
      "Recorded explanation"
    ]
  },

  infer: {
    meaning:
      "Use stated information and clues to work out meaning that is not directly stated.",
    evidence: [
      "Inference with supporting evidence",
      "Annotated text or image",
      "Oral inference",
      "Short response"
    ]
  },

  summarise: {
    meaning:
      "State the main ideas concisely without unnecessary detail.",
    evidence: [
      "Brief summary",
      "Main-idea notes",
      "Oral summary"
    ]
  }
};


function verbForAspect(text = "") {

  const lower =
    text.toLowerCase();

  const verbs =
    Object.keys(VERB_SUPPORT);


  for (const verb of verbs) {

    const expression =
      new RegExp(
        `\\b${verb}\\w*\\b`,
        "i"
      );

    if (expression.test(lower)) {
      return verb;
    }

  }


  return "";

}

// ============================================================
// ALIGNMENT PREVIEW
// ============================================================

function renderAssessmentAlignment(
  yearLevel
) {

  const container =
    document.getElementById(
      "assessmentAlignment"
    );


  const rows =
    rowsForAssessmentYear(
      yearLevel
    );


  if (!rows.length) {

    container.innerHTML = `
      <div class="empty">
        No selected Achievement Standard
        aspects are currently available for
        ${escapeHtml(yearLevel)}.

        Return to Step 2 — Curriculum and
        select the aspects that will be
        taught and/or assessed.
      </div>
    `;

    return;

  }


  const bySubject =
    rows.reduce(
      (result, row) => {

        if (!result[row.subject]) {
          result[row.subject] = [];
        }

        result[row.subject].push(row);

        return result;

      },
      {}
    );


  container.innerHTML =
    Object.entries(bySubject)
      .map(
        ([subject, subjectRows]) => `

          <div class="assessment-alignment-subject">

            <div class="assessment-alignment-head">

              <strong>
                ${escapeHtml(subject)}
              </strong>

              <span>
                ${subjectRows.length}
                aspect${subjectRows.length === 1 ? "" : "s"}
              </span>

            </div>


            <div class="assessment-alignment-list">

              ${
                subjectRows
                  .map(
                    (row) => `
                      <div>
                        ${escapeHtml(row.text)}
                      </div>
                    `
                  )
                  .join("")
              }

            </div>

          </div>

        `
      )
      .join("");

}


// ============================================================
// HELPERS
// ============================================================

function setValue(
  id,
  value = ""
) {

  const element =
    document.getElementById(id);

  if (element) {
    element.value =
      value || "";
  }

}


function escapeHtml(
  value = ""
) {

  return String(value).replace(
    /[&<>'"]/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]
  );

}


function escapeAttribute(
  value = ""
) {

  return escapeHtml(value);

}
// ============================================================
// COGNITIVE DEMAND CARDS
// ============================================================

function renderCognitiveDemandCards(
  yearLevel
) {

  const container =
    document.getElementById(
      "cognitiveDemandCards"
    );


  const rows =
    rowsForAssessmentYear(
      yearLevel
    );


  if (!rows.length) {

    container.innerHTML = `
      <div class="empty">
        Select curriculum aspects for
        ${escapeHtml(yearLevel)} first.
      </div>
    `;

    return;

  }


  container.innerHTML =
    rows
      .map((row) => {

        const verb =
          verbForAspect(row.text);

        const support =
          VERB_SUPPORT[verb];


        return `

          <article class="cognitive-card">

            <div class="cognitive-card-head">

              <span class="cognitive-subject">
                ${escapeHtml(row.subject)}
              </span>

              <span class="cognitive-verb">
                ${
                  verb
                    ? escapeHtml(
                        verb.toUpperCase()
                      )
                    : "EVIDENCE"
                }
              </span>

            </div>


            <p class="cognitive-aspect">
              ${escapeHtml(row.text)}
            </p>


            ${
              support
                ? `
                  <div class="cognitive-meaning">

                    <strong>
                      What this requires
                    </strong>

                    <p>
                      ${escapeHtml(
                        support.meaning
                      )}
                    </p>

                  </div>


                  <div class="cognitive-evidence">

                    <strong>
                      Efficient evidence possibilities
                    </strong>

                    <ul>
                      ${
                        support.evidence
                          .map(
                            (item) => `
                              <li>
                                ${escapeHtml(item)}
                              </li>
                            `
                          )
                          .join("")
                      }
                    </ul>

                  </div>
                `
                : `
                  <p class="helper">
                    Use teacher judgement to identify
                    the evidence required by this aspect.
                  </p>
                `
            }

          </article>

        `;

      })
      .join("");

}
// ============================================================
// EVIDENCE MAP
// ============================================================

function renderEvidenceMap(
  yearLevel
) {

  const container =
    document.getElementById(
      "evidenceMap"
    );


  const assessment =
    getAssessment(yearLevel);


  container.innerHTML = "";


  if (
    !assessment.components.length
  ) {

    container.innerHTML = `
      <div class="empty">
        No assessment components yet.
        Add the first question or task
        component below.
      </div>
    `;

    return;

  }


  assessment.components.forEach(
    (component, index) => {

      const card =
        createEvidenceComponentCard(
          component,
          index,
          yearLevel
        );


      container.appendChild(card);

    }
  );

}
function createEvidenceComponentCard(
  component,
  index,
  yearLevel
) {

  const card =
    document.createElement("article");


  card.className =
    "evidence-component";


  const availableRows =
    getAvailableRowsForComponent(
      component,
      yearLevel
    );


  card.innerHTML = `

    <div class="component-head">

      <label>

        ${escapeHtml(yearLevel)}
        task component / question

        <input
          class="component-text"
          value="${escapeAttribute(
            component.questionText || ""
          )}"
          placeholder="e.g. Drag and drop relationships; develop inquiry questions; oral explanation"
        >

      </label>


      <button
        type="button"
        class="mini remove-component"
      >
        Remove
      </button>

    </div>


    <div class="component-demand"></div>


    <label class="topgap">

      Suggested question / evidence format

      <select class="evidence-format">
        <option value="">
          Select an aspect below first…
        </option>
      </select>

    </label>


    <div class="component-links">

      ${
        availableRows.length
          ? availableRows
              .map(
                (row) => {

                  const checked =
                    component
                      .selectedStandardCodes
                      .includes(row.code);


                  const verb =
                    verbForAspect(
                      row.text
                    );


                  return `

                    <label class="evidence-aspect-option">

                      <input
                        type="checkbox"
                        data-aspect="${escapeAttribute(
                          row.code
                        )}"
                        ${checked ? "checked" : ""}
                      >

                      <span>

                        <b>
                          ${escapeHtml(
                            row.subject
                          )}
                        </b>

                        ·

                        ${
                          verb
                            ? escapeHtml(
                                verb.toUpperCase()
                              )
                            : "EVIDENCE"
                        }

                        —

                        ${escapeHtml(
                          row.text
                        )}

                      </span>

                    </label>

                  `;

                }
              )
              .join("")
          : `
            <div class="all-covered">
              ✓ All remaining ${escapeHtml(
                yearLevel
              )} aspects are already mapped.
            </div>
          `
      }

    </div>


    <div
      class="integration-opps"
    ></div>


    <div class="component-footer">

      <button
        type="button"
        class="suggest add-next-component"
      >
        + Add another question / task component
      </button>

      <button
        type="button"
        class="mini show-used"
      >
        ${
          component.showUsed
            ? "Hide already-used aspects"
            : "Show already-used aspects"
        }
      </button>

      <span>
        Only uncovered aspects are
        shown by default.
      </span>

    </div>

  `;


  bindEvidenceComponentEvents(
    card,
    component,
    yearLevel
  );


  updateComponentSupport(
    card,
    component,
    yearLevel
  );


  return card;

}
function getAvailableRowsForComponent(
  component,
  yearLevel
) {

  const rows =
    rowsForAssessmentYear(
      yearLevel
    );


  const assessment =
    getAssessment(yearLevel);


  const usedCodes =
    new Set();


  assessment.components.forEach(
    (otherComponent) => {

      if (
        otherComponent.id ===
        component.id
      ) {
        return;
      }


      otherComponent
        .selectedStandardCodes
        .forEach(
          (code) =>
            usedCodes.add(code)
        );

    }
  );


  return rows.filter(
    (row) => {

      if (
        component
          .selectedStandardCodes
          .includes(row.code)
      ) {
        return true;
      }


      if (component.showUsed) {
        return true;
      }


      return !usedCodes.has(
        row.code
      );

    }
  );

}
function evidenceChoicesForComponent(
  component,
  yearLevel
) {

  const rows =
    rowsForAssessmentYear(
      yearLevel
    )
    .filter(
      (row) =>
        component
          .selectedStandardCodes
          .includes(row.code)
    );


  const verbs =
    [
      ...new Set(
        rows
          .map(
            (row) =>
              verbForAspect(
                row.text
              )
          )
          .filter(Boolean)
      )
    ];


  const choices = [];


  verbs.forEach((verb) => {

    const support =
      VERB_SUPPORT[verb];


    if (!support) {
      return;
    }


    support.evidence.forEach(
      (text) => {

        choices.push({
          verb,
          text
        });

      }
    );

  });


  return {
    rows,
    verbs,
    choices
  };

}
function updateComponentSupport(
  card,
  component,
  yearLevel
) {

  const info =
    evidenceChoicesForComponent(
      component,
      yearLevel
    );


  const demand =
    card.querySelector(
      ".component-demand"
    );


  const select =
    card.querySelector(
      ".evidence-format"
    );


  demand.innerHTML =
    info.verbs.length
      ? `
        <strong>
          Cognitive demand:
        </strong>

        ${info.verbs
          .map(
            (verb) =>
              escapeHtml(
                verb.toUpperCase()
              )
          )
          .join(" + ")}

        ${
          info.verbs.length > 1
            ? `
              <span>
                Choose evidence that gives
                students a genuine opportunity
                to demonstrate all selected
                demands.
              </span>
            `
            : ""
        }
      `
      : `
        Select an Achievement Standard
        aspect below to see evidence
        suggestions.
      `;


  select.innerHTML = `

    <option value="">
      Choose a suggested format…
    </option>

    ${
      info.choices
        .map(
          (choice) => `

            <option
              value="${escapeAttribute(
                choice.text
              )}"
            >
              ${escapeHtml(
                choice.verb.toUpperCase()
              )}
              —
              ${escapeHtml(
                choice.text
              )}
            </option>

          `
        )
        .join("")
    }

    <option value="__own">
      Write my own / open input
    </option>

  `;


  if (
    component.evidenceFormat &&
    [
      ...select.options
    ].some(
      (option) =>
        option.value ===
        component.evidenceFormat
    )
  ) {

    select.value =
      component.evidenceFormat;

  }


  renderIntegrationOpportunities(
    card,
    component,
    yearLevel
  );

}
function bindEvidenceComponentEvents(
  card,
  component,
  yearLevel
) {

  card
    .querySelector(
      ".component-text"
    )
    .addEventListener(
      "input",
      (event) => {

        updateAssessmentComponent(
          yearLevel,
          component.id,
          {
            questionText:
              event.target.value
          }
        );

      }
    );


  card
    .querySelectorAll(
      "input[data-aspect]"
    )
    .forEach(
      (checkbox) => {

        checkbox.addEventListener(
          "change",
          (event) => {

            toggleComponentAspect(
              yearLevel,
              component.id,
              event.target.dataset.aspect,
              event.target.checked
            );

          }
        );

      }
    );


  card
    .querySelector(
      ".evidence-format"
    )
    .addEventListener(
      "change",
      (event) => {

        updateAssessmentComponent(
          yearLevel,
          component.id,
          {
            evidenceFormat:
              event.target.value
          }
        );


        if (
          event.target.value &&
          event.target.value !==
            "__own" &&
          !component.questionText
        ) {

          updateAssessmentComponent(
            yearLevel,
            component.id,
            {
              questionText:
                event.target.value
            }
          );

        }


        renderEvidenceMap(
          yearLevel
        );

      }
    );


  card
    .querySelector(
      ".remove-component"
    )
    .addEventListener(
      "click",
      () => {

        const assessment =
          getAssessment(
            yearLevel
          );


        assessment.components =
          assessment.components
            .filter(
              (item) =>
                item.id !==
                component.id
            );


        saveAssessment(
          yearLevel,
          assessment
        );


        renderEvidenceMap(
          yearLevel
        );

      }
    );


  card
    .querySelector(
      ".add-next-component"
    )
    .addEventListener(
      "click",
      () => {

        addNewEvidenceComponent(
          yearLevel
        );

      }
    );


  card
    .querySelector(
      ".show-used"
    )
    .addEventListener(
      "click",
      () => {

        updateAssessmentComponent(
          yearLevel,
          component.id,
          {
            showUsed:
              !component.showUsed
          }
        );


        renderEvidenceMap(
          yearLevel
        );

      }
    );

}
function addNewEvidenceComponent(
  yearLevel
) {

  const assessment =
    getAssessment(
      yearLevel
    );


  assessment.components.push({
    id: crypto.randomUUID(),
    title: "",
    selectedStandardCodes: [],
    cognitiveDemands: [],
    evidenceFormat: "",
    questionText: "",
    integrationConnections: [],
    teacherNotes: "",
    showUsed: false
  });


  saveAssessment(
    yearLevel,
    assessment
  );


  renderEvidenceMap(
    yearLevel
  );


  requestAnimationFrame(
    () => {

      const cards =
        [
          ...document.querySelectorAll(
            ".evidence-component"
          )
        ];


      const last =
        cards.at(-1);


      last?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });


      last
        ?.querySelector(
          ".component-text"
        )
        ?.focus();

    }
  );

}


function toggleComponentAspect(
  yearLevel,
  componentId,
  code,
  checked
) {

  const assessment =
    getAssessment(
      yearLevel
    );


  const component =
    assessment.components
      .find(
        (item) =>
          item.id ===
          componentId
      );


  if (!component) {
    return;
  }


  const codes =
    [
      ...component
        .selectedStandardCodes
    ];


  const index =
    codes.indexOf(code);


  if (
    checked &&
    index < 0
  ) {

    codes.push(code);

  }


  if (
    !checked &&
    index >= 0
  ) {

    codes.splice(
      index,
      1
    );

  }


  component.selectedStandardCodes =
    codes;


  saveAssessment(
    yearLevel,
    assessment
  );


  renderEvidenceMap(
    yearLevel
  );

}


function updateAssessmentComponent(
  yearLevel,
  componentId,
  changes
) {

  const assessment =
    getAssessment(
      yearLevel
    );


  assessment.components =
    assessment.components
      .map(
        (component) =>
          component.id ===
          componentId
            ? {
                ...component,
                ...changes
              }
            : component
      );


  saveAssessment(
    yearLevel,
    assessment
  );

}


function saveAssessment(
  yearLevel,
  assessment
) {

  updateUnitPlan(
    `assessments.byYear.${yearLevel}`,
    assessment
  );

}
// ============================================================
// CROSS-CURRICULAR EVIDENCE CONNECTIONS
// ============================================================

function connectionStrength(
  first,
  second
) {

  if (
    !first ||
    !second ||
    first.subject ===
      second.subject
  ) {
    return null;
  }


  const firstText =
    first.text.toLowerCase();

  const secondText =
    second.text.toLowerCase();


  let score = 0;


  const pairs = [
    ["interpret", "read"],
    ["interpret", "comprehend"],
    ["interpret", "analyse"],
    ["source", "text"],
    ["information", "text"],
    ["perspective", "infer"],
    ["data", "data"],
    ["present", "create"],
    ["communicate", "create"],
    ["represent", "create"],
    ["vocabulary", "vocabulary"],
    ["question", "question"]
  ];


  pairs.forEach(
    ([one, two]) => {

      if (
        (
          firstText.includes(one) &&
          secondText.includes(two)
        ) ||
        (
          firstText.includes(two) &&
          secondText.includes(one)
        )
      ) {

        score += 2;

      }

    }
  );


  const firstVerb =
    verbForAspect(
      first.text
    );

  const secondVerb =
    verbForAspect(
      second.text
    );


  if (
    firstVerb &&
    firstVerb ===
      secondVerb
  ) {

    score += 2;

  }


  if (score >= 4) {

    return {
      level: "strong",
      label:
        "Strong evidence connection",
      reason:
        "The same response may provide valid evidence for both aspects if the question explicitly elicits both."
    };

  }


  if (score >= 2) {

    return {
      level: "possible",
      label:
        "Possible evidence connection",
      reason:
        "These aspects may connect within one task, but check that each subject-specific demand is genuinely visible in the evidence."
    };

  }


  return null;

}
function renderIntegrationOpportunities(
  card,
  component,
  yearLevel
) {

  const container =
    card.querySelector(
      ".integration-opps"
    );


  const allRows =
    rowsForAssessmentYear(
      yearLevel
    );


  const selectedRows =
    allRows.filter(
      (row) =>
        component
          .selectedStandardCodes
          .includes(row.code)
    );


  if (!selectedRows.length) {

    container.innerHTML = "";
    return;

  }


  const found = [];


  selectedRows.forEach(
    (selectedRow) => {

      allRows.forEach(
        (candidate) => {

          if (
            component
              .selectedStandardCodes
              .includes(candidate.code)
          ) {
            return;
          }


          const connection =
            connectionStrength(
              selectedRow,
              candidate
            );


          if (
            connection &&
            !found.some(
              (item) =>
                item.row.code ===
                candidate.code
            )
          ) {

            found.push({
              row: candidate,
              ...connection
            });

          }

        }
      );

    }
  );


  if (!found.length) {

    container.innerHTML = "";
    return;

  }


  container.innerHTML = `

    <div class="integration-title">

      🔗 ${escapeHtml(yearLevel)}
      integration opportunities

      <small>
        Teacher confirmation required
      </small>

    </div>


    ${
      found
        .slice(0, 5)
        .map(
          (item) => `

            <label
              class="
                integration-suggestion
                ${item.level}
              "
            >

              <input
                type="checkbox"
                class="add-integration"
                data-code="${escapeAttribute(
                  item.row.code
                )}"
              >

              <span>

                <b>
                  ${escapeHtml(
                    item.label
                  )}:
                </b>

                ${escapeHtml(
                  item.row.subject
                )}

                —

                ${escapeHtml(
                  item.row.text
                )}

                <small>
                  ${escapeHtml(
                    item.reason
                  )}
                </small>

              </span>

            </label>

          `
        )
        .join("")
    }

  `;


  container
    .querySelectorAll(
      ".add-integration"
    )
    .forEach(
      (checkbox) => {

        checkbox.addEventListener(
          "change",
          () => {

            if (
              !checkbox.checked
            ) {
              return;
            }


            toggleComponentAspect(
              yearLevel,
              component.id,
              checkbox.dataset.code,
              true
            );

          }
        );

      }
    );

}
function analyseEvidenceMap() {

  const yearLevel =
    unitPlan.assessments
      .activeYear;


  if (!yearLevel) {
    return;
  }


  const rows =
    rowsForAssessmentYear(
      yearLevel
    );


  const assessment =
    getAssessment(
      yearLevel
    );


  const counts =
    new Map(
      rows.map(
        (row) => [
          row.code,
          0
        ]
      )
    );


  let emptyComponents = 0;


  assessment.components
    .forEach(
      (component) => {

        if (
          !component
            .selectedStandardCodes
            .length
        ) {

          emptyComponents++;

        }


        component
          .selectedStandardCodes
          .forEach(
            (code) => {

              counts.set(
                code,
                (
                  counts.get(code) ||
                  0
                ) + 1
              );

            }
          );

      }
    );


  const uncovered =
    [
      ...counts
    ]
    .filter(
      ([, count]) =>
        count === 0
    );


  const repeated =
    [
      ...counts
    ]
    .filter(
      ([, count]) =>
        count > 1
    );


  const output =
    document.getElementById(
      "assessmentSuggestions"
    );


  output.innerHTML = `

    <strong>
      ${escapeHtml(yearLevel)}
      evidence map analysis
    </strong>

    <br>

    ${
      uncovered.length
        ? `
          ⚠
          <strong>
            ${uncovered.length}
            aspect${uncovered.length === 1 ? "" : "s"}
            not yet linked
          </strong>
          to a task component.
        `
        : `
          ✓ All selected aspects for this
          year level currently have
          evidence mapped.
        `
    }

    <br>

    ${
      emptyComponents
        ? `
          ⚠ ${emptyComponents}
          component${emptyComponents === 1 ? "" : "s"}
          currently ${
            emptyComponents === 1
              ? "has"
              : "have"
          } no curriculum evidence link.
          Consider whether ${
            emptyComponents === 1
              ? "it is"
              : "they are"
          } required.
          <br>
        `
        : ""
    }

    ${
      repeated.length
        ? `
          ○ ${repeated.length}
          aspect${repeated.length === 1 ? "" : "s"}
          ${
            repeated.length === 1
              ? "appears"
              : "appear"
          }
          in more than one component.
          Check whether the additional
          evidence is necessary.
          <br>
        `
        : ""
    }

    <br>

    <em>
      Minimum sufficient evidence:
    </em>

    one carefully designed component
    can validly gather evidence for
    several aspects.

  `;

}