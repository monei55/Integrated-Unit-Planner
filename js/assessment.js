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
  ensureContextSuggestionControl();
  installAssessmentButtonObserver();

  document
    .getElementById("addEvidenceComponent")
    ?.addEventListener("click", () => {

      const yearLevel =
        unitPlan.assessments.activeYear;

      if (!yearLevel) return;

      addNewEvidenceComponent(
        yearLevel
      );

    });


  document
    .getElementById("analyseEvidenceMap")
    ?.addEventListener(
      "click",
      analyseEvidenceMap
    );


  document.getElementById("suggestContextAssessment")
    ?.addEventListener("click", suggestContextAssessment);

  document
    .getElementById("buildDraftAssessment")
    ?.addEventListener(
      "click",
      buildDraftAssessment
    );


  document
    .getElementById("generateAssessmentOverview")
    ?.addEventListener(
      "click",
      generateAssessmentOverview
    );


  document
    .getElementById("buildGtmj")
    ?.addEventListener(
      "click",
      buildGtmj
    );

}


// Ensure the control exists in the actual dynamically rendered Step 4 page.
// No separate pages/assessment.html file is required.
function ensureContextSuggestionControl() {
  if (document.getElementById("suggestContextAssessment")) return;
  const map = document.getElementById("evidenceMap");
  const build = document.getElementById("buildDraftAssessment");
  const anchor = map || build;
  if (!anchor) return;
  const wrapper = document.createElement("div");
  wrapper.className = "assessment-context-generator";
  wrapper.style.margin = "16px 0";
  wrapper.innerHTML = `
    <button type="button" class="primary" id="suggestContextAssessment">
      Suggest context-specific assessment questions
    </button>
    <p class="helper">Uses the selected curriculum and unit context. Review all suggestions before using them.</p>
    <p id="assessmentGenerationStatus" role="status" aria-live="polite"></p>
  `;
  if (map) map.parentNode.insertBefore(wrapper, map);
  else build.parentNode.insertBefore(wrapper, build);
}

let assessmentObserverInstalled = false;
function installAssessmentButtonObserver() {
  if (assessmentObserverInstalled) return;
  assessmentObserverInstalled = true;
  const root = document.getElementById("pageContent");
  if (!root) return;
  const observer = new MutationObserver(() => {
    if (document.getElementById("evidenceMap") &&
        !document.getElementById("suggestContextAssessment")) {
      ensureContextSuggestionControl();
      const button = document.getElementById("suggestContextAssessment");
      if (button) button.addEventListener("click", suggestContextAssessment);
    }
  });
  observer.observe(root, {childList:true,subtree:true});
}

// ============================================================
// ASSESSMENT OVERVIEW GENERATOR
// ============================================================

const ASSESSMENT_TECHNIQUE_TEMPLATES = {

  Project: {
    purpose:
      "Gather evidence of students’ ability to apply the selected knowledge, understanding and skills in a purposeful task.",
    context:
      "Students apply their learning in an authentic or meaningful context connected to the unit.",
    evidence:
      "Students create a product, performance or response that demonstrates the selected Achievement Standard aspects.",
    conditions:
      "Completed over the nominated assessment period. Students may access relevant learning resources. Individual evidence of achievement must be identifiable."
  },

  Investigation: {
    purpose:
      "Gather evidence of students’ ability to investigate, use relevant information or data, and communicate findings using the selected knowledge and skills.",
    context:
      "Students investigate a question, issue, problem, place, event or phenomenon connected to the unit.",
    evidence:
      "Students investigate the focus, gather and use relevant information or data, and communicate what they find.",
    conditions:
      "Completed over the nominated assessment period. Students may access appropriate sources and resources. Individual evidence of achievement must be identifiable."
  },

  "Collection of work": {
    purpose:
      "Gather evidence of students’ learning across a sequence of related classroom tasks.",
    context:
      "Students demonstrate their learning through a collection of work completed during the unit.",
    evidence:
      "Students complete a selected collection of responses or products that together demonstrate the required Achievement Standard aspects.",
    conditions:
      "Evidence is collected across the unit. Tasks may be completed under different classroom conditions. The final collection must contain sufficient individual evidence for judgement."
  },

  "Collection of Work": {
    purpose:
      "Gather evidence of students’ learning across a sequence of related classroom tasks.",
    context:
      "Students demonstrate their learning through a collection of work completed during the unit.",
    evidence:
      "Students complete a selected collection of responses or products that together demonstrate the required Achievement Standard aspects.",
    conditions:
      "Evidence is collected across the unit. Tasks may be completed under different classroom conditions. The final collection must contain sufficient individual evidence for judgement."
  },

  Examination: {
    purpose:
      "Gather evidence of students’ independent knowledge, understanding and application of the selected curriculum requirements.",
    context:
      "Students respond independently to a set of questions or problems based on the learning developed during the unit.",
    evidence:
      "Students complete selected-response, short-response and/or problem-solving questions that demonstrate the selected Achievement Standard aspects.",
    conditions:
      "Completed individually within a specified time. Access to resources is determined by the teacher. Responses must represent the student’s own work."
  },

  Test: {
    purpose:
      "Gather evidence of students’ independent knowledge, understanding and application of the selected curriculum requirements.",
    context:
      "Students respond independently to questions based on the learning developed during the unit.",
    evidence:
      "Students complete questions or tasks that demonstrate the selected Achievement Standard aspects.",
    conditions:
      "Completed individually within a specified time. Access to resources is determined by the teacher. Responses must represent the student’s own work."
  },

  "Extended response": {
    purpose:
      "Gather evidence of students’ ability to develop and communicate a sustained response using the selected knowledge, understanding and skills.",
    context:
      "Students respond to a question, stimulus or purpose connected to the unit learning.",
    evidence:
      "Students create an extended response that demonstrates the selected Achievement Standard aspects using appropriate evidence, ideas, structure and conventions.",
    conditions:
      "Completed individually over the nominated assessment period. Access to planning notes, sources and learning resources is determined by the teacher."
  },

  "Short response": {
    purpose:
      "Gather focused evidence of students’ knowledge, understanding and application of the selected curriculum requirements.",
    context:
      "Students respond to a set of focused questions, prompts, sources or scenarios connected to the unit learning.",
    evidence:
      "Students complete short written, oral, selected-response and/or source-based responses that demonstrate the selected Achievement Standard aspects.",
    conditions:
      "Completed individually. Time and access to resources are determined by the teacher. Responses must provide identifiable evidence of each student’s learning."
  },

  Practical: {
    purpose:
      "Gather evidence of students’ ability to demonstrate and apply the selected skills, processes and knowledge.",
    context:
      "Students demonstrate the required learning through an authentic practical task.",
    evidence:
      "Students complete the required practical task. The completed product, process and/or teacher observation provides evidence of achievement.",
    conditions:
      "Completed using the required equipment and resources. Teacher observation may be used to record demonstrated skills and processes. Individual evidence of achievement must be identifiable."
  },

  "Observed demonstration": {
    purpose:
      "Gather evidence of students’ ability to demonstrate the selected skills, processes, behaviours and knowledge in action.",
    context:
      "Students demonstrate the required learning during an authentic classroom, practical or performance task.",
    evidence:
      "Students demonstrate the required skills or processes while the teacher records observable evidence of achievement.",
    conditions:
      "Observed under appropriate classroom or practical conditions. The teacher may use a checklist, anecdotal record, rubric, photo or video evidence. Individual achievement must be identifiable."
  },

  Performance: {
    purpose:
      "Gather evidence of students’ ability to demonstrate and apply the selected skills, processes and knowledge through performance.",
    context:
      "Students demonstrate the required learning through a prepared or authentic performance.",
    evidence:
      "Students perform the prepared work using the required skills and processes. Teacher observation and the performance provide evidence of achievement.",
    conditions:
      "Performed individually and/or collaboratively as appropriate to the learning area. Teacher observation may be used to record achievement. Individual evidence must be identifiable."
  },

  Presentation: {
    purpose:
      "Gather evidence of students’ ability to select, organise and communicate the required knowledge and ideas for an audience and purpose.",
    context:
      "Students communicate their learning to an identified audience using an appropriate presentation format.",
    evidence:
      "Students prepare and deliver a presentation that demonstrates the selected Achievement Standard aspects.",
    conditions:
      "Students may prepare using relevant classroom resources. Presentation time and audience are determined by the teacher. Individual contribution must be identifiable."
  },

  Multimodal: {
    purpose:
      "Gather evidence of students’ ability to communicate the selected knowledge, understanding and skills using appropriate modes and features.",
    context:
      "Students create a multimodal response for an identified audience and purpose connected to the unit.",
    evidence:
      "Students create a multimodal response combining appropriate modes such as written language, images, audio, video, movement or spoken language.",
    conditions:
      "Completed over the nominated assessment period using appropriate resources and digital or non-digital tools. Individual evidence of achievement must be identifiable."
  },

  Other: {
    purpose:
      "Gather valid evidence of students’ achievement against the selected curriculum requirements.",
    context:
      "Students complete an assessment task in a context that supports them to demonstrate the selected learning.",
    evidence:
      "Students provide sufficient evidence to demonstrate the selected Achievement Standard aspects.",
    conditions:
      "Conditions are determined by the teacher to suit the task while ensuring individual evidence of achievement is identifiable."
  }

};


function generateAssessmentOverview() {

  const yearLevel =
    unitPlan.assessments.activeYear;

  if (!yearLevel) {
    window.alert(
      "Select an assessment year level first."
    );
    return;
  }

  const assessment =
    getAssessment(
      yearLevel
    );

  const technique =
    document
      .getElementById(
        "assessmentTechnique"
      )
      ?.value ||
    assessment.technique ||
    "Project";

  const template =
    ASSESSMENT_TECHNIQUE_TEMPLATES[
      technique
    ] ||
    ASSESSMENT_TECHNIQUE_TEMPLATES.Other;

  const curriculumRows =
    rowsForAssessmentYear(
      yearLevel
    );

  const selectedRows =
    getSelectedAssessmentRows(
      assessment,
      curriculumRows
    );

  const generatedPurpose =
    buildCurriculumAwarePurpose(
      selectedRows,
      template.purpose
    );

  const generatedEvidence =
    buildCurriculumAwareEvidence(
      selectedRows,
      template.evidence
    );

  const generatedContext =
    buildAssessmentContext(
      template.context
    );

  const existingContent =
    [
      assessment.purpose,
      assessment.context,
      assessment.taskEvidence,
      assessment.conditions
    ]
      .some(
        (value) =>
          String(value || "")
            .trim()
      );

  if (existingContent) {

    const replace =
      window.confirm(
        "Replace the current assessment overview?\n\n" +
        "This will update Purpose, Context, Student task / evidence and Conditions using the selected technique and curriculum."
      );

    if (!replace) {
      return;
    }

  }

  assessment.technique =
    technique;

  assessment.purpose =
    generatedPurpose;

  assessment.context =
    generatedContext;

  assessment.taskEvidence =
    generatedEvidence;

  assessment.conditions =
    template.conditions;

  saveAssessment(
    yearLevel,
    assessment
  );

  setValue(
    "assessmentTechnique",
    assessment.technique
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

  renderQualityCheck(
    yearLevel
  );

  showAssessmentOverviewGeneratedMessage();

}


function getSelectedAssessmentRows(
  assessment,
  curriculumRows
) {

  const selectedCodes =
    new Set();

  assessment.components
    ?.forEach(
      (component) => {

        component
          .selectedStandardCodes
          ?.forEach(
            (code) => {
              selectedCodes.add(
                code
              );
            }
          );

      }
    );

  if (selectedCodes.size) {

    return curriculumRows
      .filter(
        (row) =>
          selectedCodes.has(
            row.code
          )
      );

  }

  return curriculumRows;

}


function buildCurriculumAwarePurpose(
  rows,
  fallback
) {

  const phrases =
    getAssessmentDemandPhrases(
      rows,
      assessmentDemandPhrase
    );

  if (!phrases.length) {
    return fallback;
  }

  return (
    "Gather evidence of students’ ability to " +
    joinReadableList(
      phrases
    ) +
    " using the selected curriculum knowledge, understanding and skills."
  );

}


function buildCurriculumAwareEvidence(
  rows,
  fallback
) {

  const phrases =
    getAssessmentDemandPhrases(
      rows,
      studentEvidencePhrase
    );

  if (!phrases.length) {
    return fallback;
  }

  return (
    "Students complete the assessment task and provide evidence that they can " +
    joinReadableList(
      phrases
    ) +
    "."
  );

}


function getAssessmentDemandPhrases(
  rows,
  phraseBuilder
) {

  if (!rows?.length) {
    return [];
  }

  const verbs =
    [
      ...new Set(
        rows
          .flatMap((row) => verbsForAspect(row.text))
          .filter(Boolean)
      )
    ];

  return verbs
    .map(
      (verb) =>
        phraseBuilder(
          verb
        )
    )
    .filter(Boolean);

}


function buildAssessmentContext(
  fallback
) {

  const authenticContext =
    String(
      unitPlan.integration
        ?.authenticContext ||
      ""
    )
      .trim();

  if (authenticContext) {
    return authenticContext;
  }

  const unitContext =
    String(
      unitPlan.setup
        ?.context ||
      ""
    )
      .trim();

  if (unitContext) {
    return unitContext;
  }

  return fallback;

}


function assessmentDemandPhrase(
  verb
) {

  const phrases = {
    identify:
      "identify relevant information",
    recognise:
      "recognise relevant features or information",
    describe:
      "describe relevant features, ideas or characteristics",
    explain:
      "explain how or why using relevant details",
    compare:
      "compare relevant information, features or ideas",
    classify:
      "classify information or items using appropriate characteristics",
    analyse:
      "analyse relevant information, sources or data",
    interpret:
      "interpret relevant information, sources or data",
    evaluate:
      "evaluate information using relevant evidence or criteria",
    justify:
      "justify responses using relevant reasons or evidence",
    comprehend:
      "read, view and comprehend relevant texts",
    read:
      "read and demonstrate understanding of relevant texts",
    view:
      "view and demonstrate understanding of relevant texts or representations",
    write:
      "create written responses using appropriate ideas, structures and language features",
    present:
      "present ideas appropriately for audience and purpose",
    create:
      "create an appropriate response",
    construct:
      "construct the required product, representation or solution",
    demonstrate:
      "demonstrate the required skills or processes",
    apply:
      "apply learning appropriately",
    use:
      "use the required knowledge, features or processes",
    develop:
      "develop the required questions, ideas or plans",
    propose:
      "propose a considered action or response",
    select:
      "select relevant information or options",
    organise:
      "organise ideas or information purposefully",
    group:
      "group related information or ideas appropriately",
    sequence:
      "sequence information, events or steps appropriately",
    link:
      "link relevant ideas or information",
    locate:
      "locate relevant information",
    collect:
      "collect relevant information or data",
    represent:
      "represent information or relationships appropriately",
    investigate:
      "investigate questions and use relevant evidence",
    plan:
      "plan the required process or response",
    perform:
      "perform using the required skills and processes",
    communicate:
      "communicate ideas or findings appropriately",
    infer:
      "make inferences supported by relevant evidence",
    summarise:
      "summarise the main ideas using relevant information"
  };

  return phrases[verb] || "";

}


function studentEvidencePhrase(
  verb
) {

  const phrases = {
    identify:
      "identify relevant information",
    recognise:
      "recognise relevant features",
    describe:
      "describe important features or ideas using relevant detail",
    explain:
      "explain how or why using relevant details",
    compare:
      "compare relevant similarities and differences",
    classify:
      "classify information using appropriate characteristics or criteria",
    analyse:
      "analyse information, sources or data",
    interpret:
      "interpret information, sources or data",
    evaluate:
      "make a judgement using relevant evidence or criteria",
    justify:
      "justify a response using reasons or evidence",
    comprehend:
      "read or view texts and demonstrate comprehension",
    read:
      "read and demonstrate understanding of relevant texts",
    view:
      "view and demonstrate understanding of relevant texts or representations",
    write:
      "create an appropriate written response",
    present:
      "present ideas appropriately for audience and purpose",
    create:
      "create an appropriate response",
    construct:
      "construct the required product or representation",
    demonstrate:
      "demonstrate the required skill or process",
    apply:
      "apply their learning appropriately",
    use:
      "use the required knowledge, features or processes accurately",
    develop:
      "develop the required ideas, questions or plan",
    propose:
      "propose a considered action or response",
    select:
      "select relevant information",
    organise:
      "organise ideas or information clearly",
    group:
      "group related information appropriately",
    sequence:
      "sequence information, events or steps appropriately",
    link:
      "link relevant ideas or information clearly",
    locate:
      "locate relevant information",
    collect:
      "collect relevant information or data",
    represent:
      "represent information appropriately",
    investigate:
      "investigate a question and use relevant evidence",
    plan:
      "plan the required process or response",
    perform:
      "perform using the required skills",
    communicate:
      "communicate ideas or findings appropriately",
    infer:
      "make an inference and support it with evidence",
    summarise:
      "summarise the main ideas using relevant information"
  };

  return phrases[verb] || "";

}


function joinReadableList(
  items
) {

  const cleanItems =
    [
      ...new Set(
        items.filter(Boolean)
      )
    ];

  if (!cleanItems.length) {
    return "";
  }

  if (cleanItems.length === 1) {
    return cleanItems[0];
  }

  if (cleanItems.length === 2) {
    return (
      `${cleanItems[0]} and ${cleanItems[1]}`
    );
  }

  return (
    cleanItems
      .slice(0, -1)
      .join(", ") +
    ", and " +
    cleanItems[
      cleanItems.length - 1
    ]
  );

}


function showAssessmentOverviewGeneratedMessage() {

  const button =
    document.getElementById(
      "generateAssessmentOverview"
    );

  if (!button) {
    return;
  }

  const originalText =
    button.textContent;

  button.textContent =
    "Overview generated ✓";

  setTimeout(
    () => {
      button.textContent =
        originalText;
    },
    1600
  );

}


// ============================================================
// YEAR LEVEL / BAND HELPERS
// ============================================================

function eligibleAssessmentYears() {

  return [
    ...unitPlan.setup.yearLevels
  ];

}


function gradesForYear(year) {

  const values = [year];

  const match =
    String(year || "")
      .match(/\d+/);

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


function rowsForAssessmentYear(
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


  if (
    !container ||
    !workspace
  ) {
    return;
  }


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


  let activeYear =
    unitPlan.assessments
      .activeYear;


  if (
    activeYear &&
    !years.includes(activeYear)
  ) {

    updateUnitPlan(
      "assessments.activeYear",
      ""
    );

    activeYear = "";

  }


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
                <strong>
                  ${escapeHtml(activeYear)}
                </strong>.
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

            Select the year level you want
            to focus on first.

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

            setActiveAssessmentYear(
              button.dataset.year
            );

            renderAssessmentYearBuilder();

          }
        );

      }
    );


  document
    .getElementById(
      "changeAssessmentYear"
    )
    ?.addEventListener(
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


  if (!activeYear) {

    workspace.hidden = true;

    return;

  }


  workspace.hidden = false;


  loadAssessmentMetadata(
    activeYear
  );


  renderAssessmentAlignment(
    activeYear
  );


  renderCognitiveDemandCards(
    activeYear
  );


  renderEvidenceMap(
    activeYear
  );


  renderDraftAssessment(
    activeYear
  );


  renderStoredGtmj(
    activeYear
  );


  renderQualityCheck(
    activeYear
  );

}


// ============================================================
// ASSESSMENT METADATA
// ============================================================

function loadAssessmentMetadata(
  yearLevel
) {

  const assessment =
    getAssessment(
      yearLevel
    );


  setValue(
    "assessmentTitle",
    assessment.title
  );


  setValue(
    "assessmentTechnique",
    assessment.technique ||
      "Project"
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


  if (!element) {
    return;
  }


  const fresh =
    element.cloneNode(true);


  element.replaceWith(
    fresh
  );


  fresh.addEventListener(
    "input",
    (event) => {

      const assessment =
        getAssessment(
          yearLevel
        );


      assessment[fieldName] =
        event.target.value;


      saveAssessment(
        yearLevel,
        assessment
      );


      renderQualityCheck(
        yearLevel
      );

    }
  );


  if (
    fresh.tagName ===
    "SELECT"
  ) {

    fresh.addEventListener(
      "change",
      (event) => {

        const assessment =
          getAssessment(
            yearLevel
          );


        assessment[fieldName] =
          event.target.value;


        saveAssessment(
          yearLevel,
          assessment
        );


        renderQualityCheck(
          yearLevel
        );

      }
    );

  }

}


// ============================================================
// CURRICULUM ALIGNMENT
// ============================================================

function renderAssessmentAlignment(
  yearLevel
) {

  const container =
    document.getElementById(
      "assessmentAlignment"
    );


  if (!container) {
    return;
  }


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

        if (
          !result[row.subject]
        ) {

          result[row.subject] = [];

        }


        result[row.subject]
          .push(row);


        return result;

      },
      {}
    );


  container.innerHTML =
    Object.entries(
      bySubject
    )
      .map(
        ([subject, subjectRows]) => `

          <div class="assessment-alignment-subject">

            <div class="assessment-alignment-head">

              <strong>
                ${escapeHtml(subject)}
              </strong>

              <span>
                ${subjectRows.length}
                aspect${
                  subjectRows.length === 1
                    ? ""
                    : "s"
                }
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


function verbForAspect(
  text = ""
) {

  const lower =
    String(text)
      .toLowerCase();


  for (
    const verb of
    Object.keys(VERB_SUPPORT)
  ) {

    const expression =
      new RegExp(
        `\\b${verb}\\w*\\b`,
        "i"
      );


    if (
      expression.test(lower)
    ) {

      return verb;

    }

  }


  return "";

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


  if (!container) {
    return;
  }


  const rows =
    rowsForAssessmentYear(
      yearLevel
    );


  if (!rows.length) {

    container.innerHTML = `
      <div class="empty">
        Select curriculum aspects for
        ${escapeHtml(yearLevel)}
        first.
      </div>
    `;

    return;

  }


  container.innerHTML =
    rows
      .map(
        (row) => {

          const verbs = verbsForAspect(row.text);
          const verb = verbs.find(v => VERB_SUPPORT[v]) || verbs[0] || "";

          const support =
            VERB_SUPPORT[
              verb
            ];


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
                          verbs.join(" + ").toUpperCase()
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

                      ${escapeHtml(contextualAssessmentQuestions(row, assessmentContextProfile()).map(item => item.question).join(" "))}

                    </p>

                  `
              }

            </article>

          `;

        }
      )
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


  if (!container) {
    return;
  }


  const assessment =
    getAssessment(
      yearLevel
    );


  container.innerHTML = "";


  if (
    !assessment.components
      .length
  ) {

    container.innerHTML = `

      <div class="empty">

        No assessment components yet.

        Add the first question or
        task component below.

      </div>

    `;

    return;

  }


  assessment.components
    .forEach(
      (component, index) => {

        const card =
          createEvidenceComponentCard(
            component,
            index,
            yearLevel
          );


        container.appendChild(
          card
        );

      }
    );

}


function createEvidenceComponentCard(
  component,
  index,
  yearLevel
) {

  const card =
    document.createElement(
      "article"
    );


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
            component.questionText ||
            ""
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


    <div class="component-demand">
    </div>


    <label class="topgap">

      Suggested question /
      evidence format

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
                      .includes(
                        row.code
                      );


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
                        ${
                          checked
                            ? "checked"
                            : ""
                        }
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

              ✓ All remaining
              ${escapeHtml(yearLevel)}
              aspects are already mapped.

              Add another component only
              if additional evidence is
              genuinely needed.

            </div>

          `
      }

    </div>


    <div class="integration-opps">
    </div>


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
        Only uncovered aspects are shown by default.
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
    getAssessment(
      yearLevel
    );


  const usedCodes =
    new Set();


  assessment.components
    .forEach(
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
            (code) => {

              usedCodes.add(
                code
              );

            }
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


      if (
        component.showUsed
      ) {

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
            .includes(
              row.code
            )
      );


  const verbs = [...new Set(rows.flatMap(row => verbsForAspect(row.text)))];

  const choices = [];
  // Actual context-specific question formats, not only generic verb lists.
  const context = assessmentContextProfile();
  rows.forEach(row => contextualAssessmentQuestions(row, context).forEach(item => {
    if (!item.note.startsWith("REQUIRES")) choices.push({verb: item.verbs.join(" + ") || "TASK", text: item.format});
  }));

  verbs.forEach(
    (verb) => {

      const support =
        VERB_SUPPORT[
          verb
        ];


      if (!support) {
        return;
      }


      support.evidence
        .forEach(
          (text) => {

            choices.push({
              verb,
              text
            });

          }
        );

    }
  );


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

        ${
          info.verbs
            .map(
              (verb) =>
                escapeHtml(
                  verb.toUpperCase()
                )
            )
            .join(" + ")
        }

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
    ]
      .some(
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
    ?.addEventListener(
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
    ?.addEventListener(
      "change",
      (event) => {

        const selectedFormat =
          event.target.value;


        updateAssessmentComponent(
          yearLevel,
          component.id,
          {
            evidenceFormat:
              selectedFormat
          }
        );


        const latest =
          getAssessment(
            yearLevel
          )
            .components
            .find(
              (item) =>
                item.id ===
                component.id
            );


        if (
          selectedFormat &&
          selectedFormat !==
            "__own" &&
          latest &&
          !latest.questionText
            .trim()
        ) {

          const selectedRows =
            rowsForAssessmentYear(
              yearLevel
            )
              .filter(
                (row) =>
                  latest
                    .selectedStandardCodes
                    .includes(
                      row.code
                    )
              );


          updateAssessmentComponent(
            yearLevel,
            component.id,
            {
              questionText:
                buildSuggestedQuestion(
                  selectedRows,
                  selectedFormat
                )
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
    ?.addEventListener(
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


        renderQualityCheck(
          yearLevel
        );

      }
    );


  card
    .querySelector(
      ".add-next-component"
    )
    ?.addEventListener(
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
    ?.addEventListener(
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


  assessment.components
    .push({

      id:
        crypto.randomUUID(),

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
          ...document
            .querySelectorAll(
              ".evidence-component"
            )
        ];


      const last =
        cards.at(-1);


      last
        ?.scrollIntoView({
          behavior:
            "smooth",
          block:
            "center"
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
    codes.indexOf(
      code
    );


  if (
    checked &&
    index < 0
  ) {

    codes.push(
      code
    );

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


  component
    .selectedStandardCodes =
      codes;


  saveAssessment(
    yearLevel,
    assessment
  );


  renderEvidenceMap(
    yearLevel
  );


  renderQualityCheck(
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
    first.text
      .toLowerCase();


  const secondText =
    second.text
      .toLowerCase();


  let score = 0;


  const pairs = [

    [
      "interpret",
      "read"
    ],

    [
      "interpret",
      "comprehend"
    ],

    [
      "interpret",
      "analyse"
    ],

    [
      "source",
      "text"
    ],

    [
      "information",
      "text"
    ],

    [
      "perspective",
      "infer"
    ],

    [
      "data",
      "data"
    ],

    [
      "present",
      "create"
    ],

    [
      "communicate",
      "create"
    ],

    [
      "represent",
      "create"
    ],

    [
      "vocabulary",
      "vocabulary"
    ],

    [
      "question",
      "question"
    ]

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


  if (
    score >= 4
  ) {

    return {

      level:
        "strong",

      label:
        "Strong evidence connection",

      reason:
        "The same response may provide valid evidence for both aspects if the question explicitly elicits both."

    };

  }


  if (
    score >= 2
  ) {

    return {

      level:
        "possible",

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


  if (!container) {
    return;
  }


  const allRows =
    rowsForAssessmentYear(
      yearLevel
    );


  const selectedRows =
    allRows.filter(
      (row) =>
        component
          .selectedStandardCodes
          .includes(
            row.code
          )
    );


  if (
    !selectedRows.length
  ) {

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
              .includes(
                candidate.code
              )
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

              row:
                candidate,

              ...connection

            });

          }

        }
      );

    }
  );


  if (
    !found.length
  ) {

    container.innerHTML = "";

    return;

  }


  container.innerHTML = `

    <div class="integration-title">

      🔗
      ${escapeHtml(yearLevel)}
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


// ============================================================
// EVIDENCE COVERAGE
// ============================================================

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


  if (!output) {
    return;
  }


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
            aspect${
              uncovered.length === 1
                ? ""
                : "s"
            }
            not yet linked
          </strong>

          to a task component.

          <br>

        `
        : `

          ✓ All selected aspects for
          this year level currently
          have evidence mapped.

          <br>

        `
    }


    ${
      emptyComponents
        ? `

          ⚠
          ${emptyComponents}

          component${
            emptyComponents === 1
              ? ""
              : "s"
          }

          ${
            emptyComponents === 1
              ? "has"
              : "have"
          }

          no curriculum evidence link.

          Consider whether
          ${
            emptyComponents === 1
              ? "it is"
              : "they are"
          }
          required.

          <br>

        `
        : ""
    }


    ${
      repeated.length
        ? `

          ○
          ${repeated.length}

          aspect${
            repeated.length === 1
              ? ""
              : "s"
          }

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


  renderQualityCheck(
    yearLevel
  );

}


// ============================================================
// BUILD DRAFT ASSESSMENT
// ============================================================

function buildDraftAssessment() {
  const yearLevel = unitPlan.assessments.activeYear;
  if (!yearLevel) return;

  const assessment = getAssessment(yearLevel);
  const curriculumRows = rowsForAssessmentYear(yearLevel);
  const usableComponents = assessment.components.filter(
    (component) => component.selectedStandardCodes.length
  );

  if (!usableComponents.length) {
    window.alert("Link at least one assessment question to an Achievement Standard aspect, or select Suggest context-specific assessment questions first.");
    const container = document.getElementById("draftAssessment");
    if (container) {
      container.innerHTML = `
        <div class="empty">
          Link at least one question or task component to an Achievement
          Standard aspect before building the draft assessment.
        </div>
      `;
    }
    return;
  }

  assessment.draftTask = usableComponents.map((component, index) => {
    const rows = curriculumRows.filter((row) =>
      component.selectedStandardCodes.includes(row.code)
    );

    const verbs = [
      ...new Set(rows.map((row) => verbForAspect(row.text)).filter(Boolean))
    ];

    const question =
      component.questionText?.trim() ||
      buildSuggestedQuestion(rows, component.evidenceFormat);

    return {
      id: component.id,
      number: index + 1,
      question,
      evidenceFormat: component.evidenceFormat,
      standardCodes: [...component.selectedStandardCodes],
      verbs
    };
  });

  assessment.taskEvidence = assessment.draftTask
    .map((item) => `Question ${item.number}: ${item.question}`)
    .join("\n\n");

  saveAssessment(yearLevel, assessment);

  const taskField = document.getElementById("assessmentTask");
  if (taskField) taskField.value = assessment.taskEvidence;

  renderDraftAssessment(yearLevel);
  renderQualityCheck(yearLevel);
  const status = document.getElementById("assessmentGenerationStatus");
  if (status) status.textContent = `Draft assessment built with ${assessment.draftTask.length} mapped question(s). Review the draft below.`;
  document.getElementById("draftAssessment")?.scrollIntoView({behavior:"smooth",block:"start"});
}


// ============================================================
// CONTEXT-AWARE DRAFT (OPTIONAL, NON-DESTRUCTIVE)
// ============================================================
// Creates editable evidence-map components using already-selected
// curriculum. Teacher mapping and assessment remain authoritative.
// Teacher-controlled draft generation. Never silently overwrite approved work.
function suggestContextAssessment() {
  const year = unitPlan.assessments.activeYear;
  if (!year) return window.alert("Select an assessment year level first.");
  const rows = rowsForAssessmentYear(year);
  if (!rows.length) return window.alert("Select Achievement Standard aspects first.");
  const assessment = getAssessment(year);
  const context = assessmentContextProfile();
  const existing = assessment.components || [];
  // One assessment opportunity per selected aspect, with combined prompts
  // where a single response can demonstrate several requirements.
  const suggested = rows.map(row => {
    const options = contextualAssessmentQuestions(row, context);
    if (!options.length) return null;
    const question = options.map(o => o.question.trim()).filter(Boolean).join(" ");
    return {
      id: crypto.randomUUID(), title: options[0].title,
      selectedStandardCodes: [row.code],
      cognitiveDemands: [...new Set(options.flatMap(o => o.verbs))],
      evidenceFormat: options.map(o => o.format).filter(Boolean).join("; "),
      questionText: question,
      integrationConnections: [],
      teacherNotes: "AUTO_CONTEXT_SUGGESTION: Review the question and evidence before approval.",
      showUsed: false
    };
  }).filter(Boolean);
  // Seven selected aspects should produce no more than seven suggestions.
  // Never silently remove teacher-written work. Previously generated
  // suggestions are recognisable by their provenance marker.
  const isGenerated = c => String(c.teacherNotes || "").startsWith("AUTO_CONTEXT_SUGGESTION:") ||
    String(c.teacherNotes || "").startsWith("Draft: teacher to supply the named images/text");
  const isGeneric = c => /^(demonstrate the selected learning|recognise and select the relevant features|identify the relevant information or relationships|create a response that demonstrates the selected learning|use the selected knowledge)/i.test(String(c.questionText || c.title || "").trim());
  const replaceable = existing.filter(c => isGenerated(c) || isGeneric(c));
  const retained = existing.filter(c => !isGenerated(c) && !isGeneric(c));
  const total = retained.length + suggested.length;
  if (!window.confirm(`Create ${suggested.length} combined assessment question(s), one per selected Achievement Standard aspect?\n\n${replaceable.length} earlier generated/generic question(s) will be replaced. ${retained.length} teacher-written question(s) will remain.\n\nThe resulting map will have ${total} question(s). You can remove or combine any that overlap. Continue?`)) return;
  assessment.components = [...retained, ...suggested];
  // Old draft no longer matches the evidence map. Rebuild explicitly.
  assessment.draftTask = [];
  saveAssessment(year, assessment);
  renderEvidenceMap(year);
  renderDraftAssessment(year);
  const status = document.getElementById("assessmentGenerationStatus");
  if (status) status.textContent = `${suggested.length} combined questions ready. Select Build draft assessment to assemble them.`;
  document.getElementById("evidenceMap")?.scrollIntoView({behavior:"smooth",block:"start"});
}

function assessmentContextProfile() {
  const source = [unitPlan.setup?.title, unitPlan.setup?.context,
    unitPlan.integration?.bigIdea, unitPlan.integration?.authenticContext,
    unitPlan.integration?.notes, unitPlan.integration?.terminology]
    .filter(Boolean).join(" ");
  const text = source.toLowerCase();
  return {
    journey: /are we there yet|journey|travel|trip|places visited/.test(text),
    place: /place|community|geograph|local area|environment|journey|travel/.test(text),
    story: /recount|retell|story|narrative|are we there yet/.test(text),
    source, title: unitPlan.setup?.title || "this unit"
  };
}

// Some curriculum aspects contain several verbs and assessable clauses.
// Do not stop at the first keyword: offer separate, mapped evidence for each.
function verbsForAspect(text = "") {
  const lower = String(text).toLowerCase();
  const patterns = [
    ["pose", /\bpos(?:e|es|ing)\b/], ["sort", /\bsort\w*\b/],
    ["record", /\brecord\w*\b/], ["share", /\bshar(?:e|es|ing)\b/],
    ["draw conclusions", /\bdraw conclusions?\b/],
    ["retell", /\bretell\w*\b/], ["report", /\breport\w*\b/],
    ["state", /\bstat(?:e|es|ing)\b/], ["read", /\bread\b/],
    ["view", /\bview\w*\b/], ["comprehend", /\bcomprehend\w*\b/],
    ["make connections", /\bmak(?:e|ing) connections?\b/],
    ...Object.keys(VERB_SUPPORT).map(v => [v, new RegExp(`\\b${v}\\w*\\b`, "i")])
  ];
  return [...new Set(patterns.filter(([,re]) => re.test(lower)).map(([v]) => v))];
}

function contextualAssessmentQuestions(row, context) {
  const t = String(row.text || "").toLowerCase();
  const subject = String(row.subject || "").toLowerCase();
  const results = [];
  const photos = context.journey ? "photographs of places explored during the journey" : "photographs of familiar places";
  const add = (title, question, format, verbs) => results.push({
    code: row.code, title, question, format, verbs,
    note: "Draft: teacher to supply the named images/text, verify coverage of the original Achievement Standard aspect, and check the response mode."
  });
  if (subject.includes("hass") && context.place) {
    if (/features? of familiar places|features? of places|natural|managed|constructed/.test(t))
      add("Features of places", `Look at the ${photos}. Circle the features you can see.`, "Circle / select / point", ["recognise"]);
    if (/special to people|places are special|significan/.test(t))
      add("Why places are special", "Look at the pictures of familiar places. Tick the reasons why a place might be special to someone.", "Tick / match", ["recognise"]);
    if (/care for|look after|protect/.test(t))
      add("Caring for places", "Circle the pictures that show ways people can care for these places.", "Circle / select", ["recognise"]);
    if (/pose questions?/.test(t))
      add("Pose a question", `Look at one of the ${photos}. What would you like to find out about it? Ask one question.`, "Oral / written question", ["pose"]);
    if (/sort/.test(t))
      add("Sort observations", `Look at the ${photos}. Sort the features into the groups provided.`, "Sort / classify", ["sort"]);
    if (/record/.test(t))
      add("Record information", "Record what you noticed in the photographs using a tally, drawing or labelled table.", "Tally / drawing / table", ["record"]);
    if (/share a perspective/.test(t))
      add("Share a perspective", "Which of the places shown would you choose to visit? Tell or show your choice.", "Oral / selected / visual response", ["share"]);
    if (/draw conclusions?/.test(t))
      add("Draw a conclusion", "Look at the information you sorted or recorded. What can you tell us about these places?", "Short oral / written conclusion", ["draw conclusions"]);
  }
  if (subject.includes("english")) {
    if (/read,? view and comprehend|making connections between characters/.test(t))
      add("Connect text and experience", "Look at a picture from the familiar story. Which event does it show? Choose or tell about a similar experience you have had.", "Select / oral response", ["comprehend", "make connections"]);
    if (/identify the language features|connections between print and images/.test(t))
      add("Find text features", "Look at a page from the familiar text. Circle a word or phrase that tells us about the picture. Point to the matching part of the image.", "Circle / point / match", ["identify"]);
    if (/create short written texts/.test(t))
      add("Create a short retelling", "Create a short written retelling of events from the familiar story. Include images where they help communicate your retelling.", "Short written text / images", ["create"]);
    if (/retell, report information and state/.test(t)) {
      add("Retell events", "Use pictures from the familiar story to retell what happened.", "Oral / written retell", ["retell"]);
      add("Report information", "Choose a place or event explored in the unit. Tell someone one piece of information you learned about it.", "Short oral / written report", ["report"]);
      add("State thoughts and feelings", "Choose a part of the story. Tell someone what you think or feel about it, and share one key idea.", "Oral / short written response", ["state"]);
    }
    if (/use words and phrases from learning and texts/.test(t))
      add("Use learned vocabulary", "Retell an event from the familiar text using words or phrases practised during this unit.", "Oral / written response", ["use"]);
  }
  if (!results.length) {
    const verb = verbForAspect(row.text);
    const formats = {
      identify: "Circle / tick / label", recognise: "Match / tick / point", compare: "Comparison table / sort",
      describe: "Brief oral / written description", explain: "Short reason / explanation",
      create: "Create the specified product", use: "Apply in a response"
    };
    add(`${row.subject || "Learning"}: ${verb || "evidence"}`,
      `Using the sources selected for “${context.title}”, ${verb || "show"} the learning in this aspect: ${row.text}`,
      formats[verb] || "Teacher-selected format", verbsForAspect(row.text));
    results[0].note = "REQUIRES TEACHER DESIGN: a verified, context-specific question template is not available for this aspect. Replace this prompt before giving it to students.";
  }
  return results;
}

// ============================================================
// SUGGESTED ASSESSMENT QUESTION
// ============================================================

function buildSuggestedQuestion(
  rows,
  evidenceFormat
) {

  if (!rows.length) {

    return "Demonstrate the selected learning.";

  }


  const demand =
    verbForAspect(
      rows[0].text
    );


  const stems = {

    identify:
      "Identify the relevant information or relationships.",

    recognise:
      "Recognise and select the relevant features.",

    describe:
      "Describe the relevant features or characteristics.",

    explain:
      "Explain how or why the relationship occurs.",

    compare:
      "Compare the information, identifying relevant similarities and differences.",

    classify:
      "Classify the items using appropriate characteristics or criteria.",

    analyse:
      "Analyse the source, information or data and identify what it shows.",

    interpret:
      "Interpret the source, information or data and communicate what it shows.",

    evaluate:
      "Evaluate the information using relevant evidence or criteria.",

    justify:
      "Justify your response using relevant reasons or evidence.",


    // ========================================================
    // RECEPTIVE ENGLISH DEMANDS
    // ========================================================

    comprehend:
      "Read and/or view the text and demonstrate comprehension of the relevant ideas, information and meaning.",

    read:
      "Read the text and demonstrate understanding of the relevant ideas and information.",

    view:
      "View the text or representation and demonstrate understanding of the relevant ideas and information.",


    // ========================================================
    // PRODUCTIVE ENGLISH DEMANDS
    // ========================================================

    write:
      "Write the required response using the appropriate ideas, structure and language features.",

    present:
      "Present the required response using appropriate content, organisation and delivery for the audience and purpose.",

    create:
      "Create a response that demonstrates the selected learning.",


    // ========================================================
    // OTHER DEMANDS
    // ========================================================

    construct:
      "Construct the required product, representation or solution.",

    demonstrate:
      "Demonstrate the required skill or process.",

    apply:
      "Apply your learning to the situation provided.",

    use:
      "Use the required knowledge, features or processes appropriately.",

    develop:
      "Develop the required questions, ideas or plan.",

    propose:
      "Propose a considered action or response.",

    select:
      "Select the most relevant information or option.",

    organise:
      "Organise the information in a purposeful way.",

    group:
      "Group the related information or ideas appropriately.",

    sequence:
      "Sequence the information, events or steps in the correct order.",

    link:
      "Show the connections between the relevant ideas or information.",

    locate:
      "Locate the relevant information in the source provided.",

    collect:
      "Collect the relevant information or data.",

    represent:
      "Represent the information or relationships in an appropriate form.",

    investigate:
      "Investigate the question and record relevant evidence.",

    plan:
      "Plan the required process or response.",

    perform:
      "Perform the prepared work using the required skills.",

    communicate:
      "Communicate your ideas or findings appropriately.",

    infer:
      "Use the information and clues provided to infer meaning.",

    summarise:
      "Summarise the main ideas using the most relevant information."

  };


  let question =
    stems[demand] ||
    "Demonstrate the selected learning.";


  if (
    evidenceFormat &&
    evidenceFormat !== "__own"
  ) {

    question +=
      ` Suggested format: ${evidenceFormat}.`;

  }


  if (
    rows.length > 1
  ) {

    question +=
      " Ensure your response also demonstrates the additional curriculum requirements linked to this component.";

  }


  return question;

}


function renderDraftAssessment(
  yearLevel
) {

  const container =
    document.getElementById(
      "draftAssessment"
    );


  if (!container) {
    return;
  }


  const assessment =
    getAssessment(
      yearLevel
    );


  const curriculumRows =
    rowsForAssessmentYear(
      yearLevel
    );


  if (
    !assessment.draftTask
      ?.length
  ) {

    container.innerHTML = `

      <div class="empty">

        Map the assessment evidence above,
        then select
        <strong>
          Build draft assessment
        </strong>.

      </div>

    `;

    return;

  }


  const years =
    eligibleAssessmentYears();


  const remainingYears =
    years.filter(
      (year) =>
        year !== yearLevel &&
        !getAssessment(year)
          .draftTask
          ?.length
    );


  container.innerHTML = `

    <div class="draft-summary">

      <strong>
        ${escapeHtml(yearLevel)}
        draft assessment
      </strong>

      <span>
        ${assessment.draftTask.length}
        planned component${
          assessment.draftTask.length === 1
            ? ""
            : "s"
        }
      </span>

    </div>


    ${
      assessment.draftTask
        .map(
          (component) => {

            const rows =
              curriculumRows
                .filter(
                  (row) =>
                    component
                      .standardCodes
                      .includes(
                        row.code
                      )
                );


            return `

              <article class="draft-question">

                <div class="draft-q-head">

                  <strong>
                    Question / Task Component
                    ${component.number}
                  </strong>

                  <span>
                    ${
                      component.verbs.length
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


                <textarea
                  rows="3"
                  data-draft-id="${escapeAttribute(
                    component.id
                  )}"
                >${escapeHtml(
                  component.question
                )}</textarea>


                <div class="draft-covers">

                  <strong>
                    Covers:
                  </strong>

                  ${
                    rows
                      .map(
                        (row) => `
                          <span>
                            ${escapeHtml(
                              row.subject
                            )}
                          </span>
                        `
                      )
                      .join("")
                  }

                </div>

              </article>

            `;

          }
        )
        .join("")
    }


    <div class="draft-note">

      <strong>
        Teacher check:
      </strong>

      Does each question or task component
      provide useful evidence for the selected
      Achievement Standard aspects?

      Remove components that add student workload
      without adding useful evidence.

    </div>


    ${
      remainingYears.length
        ? `

          <div class="next-year-assessment">

            <div>

              <span class="eyebrow">
                Multi-age assessment
              </span>

              <h4>

                ${escapeHtml(yearLevel)}
                assessment drafted.

                Would you like to create
                another assessment task
                for another year level?

              </h4>

              <p>

                Choose the next year level.

                The new assessment will
                continue to use only the
                Achievement Standard
                applicable to that year.

              </p>

            </div>


            <div class="next-year-actions">

              ${
                remainingYears
                  .map(
                    (year) => `

                      <button
                        type="button"
                        class="suggest next-year-button"
                        data-year="${escapeAttribute(
                          year
                        )}"
                      >
                        Build
                        ${escapeHtml(year)}
                        assessment
                      </button>

                    `
                  )
                  .join("")
              }

            </div>

          </div>

        `
        : `

          <div class="next-year-assessment complete">

            <strong>

              ✓ All selected year levels
              now have a draft assessment task.

            </strong>

          </div>

        `
    }

  `;


  container
    .querySelectorAll(
      "textarea[data-draft-id]"
    )
    .forEach(
      (textarea) => {

        textarea.addEventListener(
          "input",
          (event) => {

            updateDraftQuestion(
              yearLevel,
              event.target
                .dataset
                .draftId,
              event.target.value
            );

          }
        );

      }
    );


  container
    .querySelectorAll(
      ".next-year-button"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            setActiveAssessmentYear(
              button.dataset.year
            );


            renderAssessmentYearBuilder();


            document
              .getElementById(
                "assessmentYearBuilder"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",
                block:
                  "start"
              });

          }
        );

      }
    );

}


function updateDraftQuestion(
  yearLevel,
  componentId,
  value
) {

  const assessment =
    getAssessment(
      yearLevel
    );


  assessment.draftTask =
    assessment.draftTask
      .map(
        (component) =>
          component.id ===
          componentId
            ? {
                ...component,
                question:
                  value
              }
            : component
      );


  assessment.taskEvidence =
    assessment.draftTask
      .map(
        (item) =>
          `Question ${item.number}: ${item.question}`
      )
      .join("\n\n");


  saveAssessment(
    yearLevel,
    assessment
  );


  const taskField =
    document.getElementById(
      "assessmentTask"
    );


  if (taskField) {

    taskField.value =
      assessment.taskEvidence;

  }

}


// ============================================================
// GTMJ
// ============================================================

// Observable progression stays within the cognitive demand of the C aspect.
// For unsupported aspects, explicitly request teacher-written descriptors;
// never present generic adjectives as validated standards.
function suggestedDescriptors(row) {
  const t = String(row.text || "").toLowerCase();
  if (/recognise the features of familiar places/.test(t)) return {
    A: "Accurately recognises a range of familiar place features, relevant reasons places are special and appropriate ways to care for them across the provided examples.",
    B: "Correctly recognises familiar place features, reasons places are special and ways to care for them in the provided examples, with occasional omissions.",
    D: "Recognises some familiar place features or ways to care for places, but does not yet consistently recognise the other required elements.",
    E: "Recognises an isolated familiar place feature or caring action with substantial support; other elements are not yet evident."
  };
  if (/pose questions.*sort and record/.test(t)) return {
    A: "Poses relevant, focused questions; sorts observations consistently into suitable groups and records information accurately and clearly.",
    B: "Poses a relevant question, sorts most observations into suitable groups and records information clearly with minor omissions.",
    D: "Poses a simple question or sorts and records some information, with incomplete or inconsistent evidence across the requirements.",
    E: "With support, contributes an initial question or records an isolated observation; the remaining requirements are not yet demonstrated."
  };
  if (/share a perspective and draw conclusions/.test(t)) return {
    A: "Clearly shares a perspective and draws a conclusion that is consistently supported by relevant observations or information.",
    B: "Shares a clear perspective and draws a relevant conclusion using information from the task.",
    D: "Shares a perspective or offers a tentative conclusion, but does not yet demonstrate both clearly.",
    E: "Communicates an initial preference or observation with support; a conclusion is not yet evident."
  };
  if (/create short written texts.*retelling stories/.test(t)) return {
    A: "Creates a coherent short written retelling with a clear event sequence, relevant character or setting details, and purposeful vocabulary; images support meaning where appropriate.",
    B: "Creates a short written retelling with main events in order, relevant details and some sequencing vocabulary; uses images where appropriate.",
    D: "Creates a brief written response showing some story events, but the retelling is incomplete or the order is unclear; may rely on images.",
    E: "Produces isolated words, marks or images relating to the story, with limited connected written retelling."
  };
  if (/identify the language features.*print and images/.test(t)) return {
    A: "Accurately identifies the relevant language features and print–image connections across several examples, including less obvious examples.",
    B: "Correctly identifies the relevant language features and print–image connections in familiar examples, with minor omissions.",
    D: "Identifies some relevant features or print–image connections but not yet both consistently.",
    E: "Points to or selects an isolated feature with support; print–image connections are not yet evident."
  };
  if (/retell, report information and state/.test(t)) return {
    A: "Retells key events coherently, reports accurate relevant information and clearly states thoughts, feelings and key ideas with suitable detail.",
    B: "Retells main events in order, reports relevant information and states thoughts, feelings and key ideas clearly.",
    D: "Retells some events or reports an item of information, but thoughts, feelings or key ideas are incomplete or unclear.",
    E: "Shares an isolated event, fact or feeling with support; the other required responses are not yet evident."
  };
  if (/use words and phrases from learning and texts/.test(t)) return {
    A: "Uses a varied, accurate selection of words and phrases from learning and texts purposefully in the response.",
    B: "Uses several relevant words and phrases from learning and texts accurately in the response.",
    D: "Uses an occasional familiar word or phrase from learning and texts, sometimes inaccurately.",
    E: "Repeats or selects an isolated learned word with support; independent use is not yet evident."
  };
  if (/read, view and comprehend/.test(t)) return {
    A: "Accurately connects characters, settings and events across the text and makes clear, relevant connections to personal experience.",
    B: "Makes relevant connections between characters, settings and events and links these to a personal experience.",
    D: "Recognises some characters, settings or events but makes incomplete or unclear connections to the text or personal experience.",
    E: "Recognises an isolated character, setting or event with support; connections are not yet evident."
  };
  return {
    A: "TEACHER REVIEW REQUIRED — describe observable, consistently accurate evidence of this same curriculum demand; do not introduce a higher-order verb.",
    B: "TEACHER REVIEW REQUIRED — describe observable evidence that is stronger than C without changing the cognitive demand.",
    D: "TEACHER REVIEW REQUIRED — describe which parts of the stated demand are emerging or inconsistent.",
    E: "TEACHER REVIEW REQUIRED — describe the limited or supported evidence observable for this demand."
  };
}

function buildGtmj() {

  const yearLevel =
    unitPlan.assessments
      .activeYear;


  if (!yearLevel) {
    return;
  }


  const assessment =
    getAssessment(
      yearLevel
    );


  const rows =
    rowsForAssessmentYear(
      yearLevel
    );


  const box =
    document.getElementById(
      "gtmjBuilder"
    );


  if (!box) {
    return;
  }


  if (!rows.length) {

    box.innerHTML = `

      <div class="empty">

        Select Achievement Standard
        aspects for
        ${escapeHtml(yearLevel)}
        before building a GTMJ.

      </div>

    `;

    return;

  }


  const gtMj = {};


  rows.forEach(
    (row) => {

      const existing = assessment.gtMj?.[row.code] || {};
      const proposed = suggestedDescriptors(row);
      gtMj[row.code] = {
        A: existing.A || proposed.A,
        B: existing.B || proposed.B,
        C: row.text, // Always the exact Achievement Standard aspect.
        D: existing.D || proposed.D,
        E: existing.E || proposed.E
      };

    }
  );


  assessment.gtMj =
    gtMj;


  saveAssessment(
    yearLevel,
    assessment
  );


  renderStoredGtmj(
    yearLevel
  );


  renderQualityCheck(
    yearLevel
  );

}


function renderStoredGtmj(
  yearLevel
) {

  const box =
    document.getElementById(
      "gtmjBuilder"
    );


  if (!box) {
    return;
  }


  const assessment =
    getAssessment(
      yearLevel
    );


  const rows =
    rowsForAssessmentYear(
      yearLevel
    );


  if (!rows.length) {

    box.innerHTML = "";

    return;

  }


  if (
    !assessment.gtMj ||
    !Object.keys(
      assessment.gtMj
    ).length
  ) {

    box.innerHTML = `

      <div class="empty">

        Select
        <strong>
          Build GTMJ
        </strong>
        when the assessment evidence
        has been mapped.

      </div>

    `;

    return;

  }


  const bySubject =
    rows.reduce(
      (result, row) => {

        if (
          !result[row.subject]
        ) {

          result[row.subject] = [];

        }


        result[row.subject]
          .push(row);


        return result;

      },
      {}
    );


  box.innerHTML = `

    <div class="gtmj-year">

      <div class="gtmj-year-head">

        <h3>
          ${escapeHtml(yearLevel)}
        </h3>

        <span>
          One marking guide table per
          learning area — editable
        </span>

      </div>


      ${
        Object.entries(
          bySubject
        )
          .map(
            ([subject, subjectRows]) => `

              <section class="gtmj-subject">

                <div class="gtmj-subject-head">

                  <h4>
                    ${escapeHtml(subject)}
                  </h4>

                  <span>
                    ${subjectRows.length}
                    selected aspect${
                      subjectRows.length === 1
                        ? ""
                        : "s"
                    }
                  </span>

                </div>


                <div class="gtmj-table-wrap">

                  <table class="gtmj-table">

                    <thead>

                      <tr>

                        <th class="gtmj-aspect-col">
                          Achievement Standard aspect
                        </th>

                        <th>A</th>
                        <th>B</th>
                        <th class="c-head">C</th>
                        <th>D</th>
                        <th>E</th>

                      </tr>

                    </thead>


                    <tbody>

                      ${
                        subjectRows
                          .map(
                            (row) => {

                              const descriptors =
                                assessment.gtMj[
                                  row.code
                                ];


                              return `

                                <tr>

                                  <th
                                    scope="row"
                                    class="gtmj-aspect-cell"
                                  >

                                    <p>
                                      ${escapeHtml(
                                        row.text
                                      )}
                                    </p>

                                  </th>


                                  ${
                                    [
                                      "A",
                                      "B",
                                      "C",
                                      "D",
                                      "E"
                                    ]
                                      .map(
                                        (grade) => `

                                          <td
                                            class="
                                              gtmj-grade
                                              ${
                                                grade === "C"
                                                  ? "c-standard"
                                                  : ""
                                              }
                                            "
                                          >

                                            <textarea
                                              rows="4"
                                              data-gtmj-grade="${grade}"
                                              ${grade === "C" ? "readonly aria-label=\"Exact Achievement Standard aspect (not editable)\"" : ""}
                                              data-gtmj-code="${escapeAttribute(
                                                row.code
                                              )}"
                                            >${escapeHtml(
                                              (grade === "C" ? row.text : descriptors?.[grade]) || ""
                                            )}</textarea>

                                          </td>

                                        `
                                      )
                                      .join("")
                                  }

                                </tr>

                              `;

                            }
                          )
                          .join("")
                      }

                    </tbody>

                  </table>

                </div>

              </section>

            `
          )
          .join("")
      }

    </div>

  `;


  box
    .querySelectorAll(
      "textarea[data-gtmj-code]"
    )
    .forEach(
      (textarea) => {

        textarea.addEventListener(
          "input",
          (event) => {

            if (event.target.dataset.gtmjGrade === "C") return;
            const latest =
              getAssessment(
                yearLevel
              );


            const code =
              event.target
                .dataset
                .gtmjCode;


            const grade =
              event.target
                .dataset
                .gtmjGrade;


            if (
              !latest.gtMj
            ) {

              latest.gtMj = {};

            }


            if (
              !latest.gtMj[
                code
              ]
            ) {

              latest.gtMj[
                code
              ] = {};

            }


            latest.gtMj[
              code
            ][grade] =
              event.target.value;


            saveAssessment(
              yearLevel,
              latest
            );

          }
        );

      }
    );

}


function descriptorStem(
  text = ""
) {

  return String(text)
    .replace(
      /^[A-Z][a-z]+\s+/,
      ""
    )
    .replace(
      /[.]$/,
      ""
    );

}


// ============================================================
// QUALITY CHECK
// ============================================================

function renderQualityCheck(
  yearLevel
) {

  const box =
    document.getElementById(
      "assessmentQuality"
    );


  if (!box) {
    return;
  }


  const assessment =
    getAssessment(
      yearLevel
    );


  const rows =
    rowsForAssessmentYear(
      yearLevel
    );


  const linked =
    new Set(
      assessment.components
        .flatMap(
          (component) =>
            component
              .selectedStandardCodes
        )
    );


  const checks = [

    [
      "Curriculum aspects selected",
      rows.length > 0
    ],

    [
      "Purpose is clear",
      String(
        assessment.purpose ||
        ""
      )
        .trim()
        .length > 15
    ],

    [
      "Student evidence is described",
      String(
        assessment.taskEvidence ||
        ""
      )
        .trim()
        .length > 25
    ],

    [
      "Conditions are recorded",
      String(
        assessment.conditions ||
        ""
      )
        .trim()
        .length > 10
    ],

    [
      "Each selected aspect has an evidence location",
      rows.length > 0 &&
      rows.every(
        (row) =>
          linked.has(
            row.code
          )
      )
    ],

    [
      "GTMJ has been built",
      rows.length > 0 &&
      rows.every(
        (row) =>
          assessment.gtMj
            ?.[row.code]
            ?.C
      )
    ]

  ];


  box.innerHTML = `

    <strong>
      Assessment quality check
    </strong>

    ${
      checks
        .map(
          ([label, ok]) => `

            <span
              class="
                ${
                  ok
                    ? "check-ok"
                    : "check-warn"
                }
              "
            >

              ${
                ok
                  ? "✓"
                  : "○"
              }

              ${escapeHtml(label)}

            </span>

          `
        )
        .join("")
    }

  `;

}


// ============================================================
// SAVE / HELPERS
// ============================================================

function saveAssessment(
  yearLevel,
  assessment
) {

  updateUnitPlan(
    `assessments.byYear.${yearLevel}`,
    assessment
  );

}


function setValue(
  id,
  value = ""
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


function escapeHtml(
  value = ""
) {

  return String(value)
    .replace(
      /[&<>'"]/g,
      (character) => ({

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        "'":
          "&#39;",

        '"':
          "&quot;"

      })[character]
    );

}


function escapeAttribute(
  value = ""
) {

  return escapeHtml(
    value
  );

}
