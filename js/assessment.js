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