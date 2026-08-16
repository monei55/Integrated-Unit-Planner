import {
  unitPlan
} from "./state.js";


// ============================================================
// STEP 9 — REVIEW & PRINT
// Unit Planning Template version
// ============================================================

export function initPrintPage() {

  bindClick(
    "checkUnitReadiness",
    renderUnitReadiness
  );

  bindClick(
    "refreshPreview",
    refreshPreview
  );

  bindClick(
    "exportWord",
    exportToWord
  );

  bindClick(
    "printUnitPlan",
    printUnitPlan
  );


  renderUnitReadiness();

  refreshPreview();

}


// ============================================================
// READINESS
// ============================================================

function renderUnitReadiness() {

  const container =
    document.getElementById(
      "unitReadinessSummary"
    );


  if (!container) {
    return;
  }


  const checks =
    getReadinessChecks();


  container.innerHTML =
    checks
      .map(
        (check) => `

          <article
            class="readiness-item ${
              check.ready
                ? "ready"
                : "check"
            }"
          >

            <span class="readiness-icon">
              ${
                check.ready
                  ? "✓"
                  : "!"
              }
            </span>

            <div>

              <strong>
                ${escapeHtml(
                  check.title
                )}
              </strong>

              <p>
                ${escapeHtml(
                  check.detail
                )}
              </p>

            </div>

          </article>

        `
      )
      .join("");

}


// ============================================================
// READINESS CHECKS
// ============================================================

function getReadinessChecks() {

  const rows =
    getCurriculumRows();


  const assessments =
    getAllAssessments();


  const weeks =
    getWeeks();


  const adjustments =
    getAdjustmentGroups();


  return [

    {
      title:
        "Unit overview",

      ready:
        Boolean(
          getUnitTitle() &&
          getYearLevels().length
        ),

      detail:
        Boolean(
          getUnitTitle()
        )
          ? `${getUnitTitle()} • ${getYearLevels().join(", ")}`
          : "Complete the unit setup."
    },


    {
      title:
        "Achievement Standard",

      ready:
        rows.length > 0,

      detail:
        rows.length
          ? `${rows.length} targeted aspect${
              rows.length === 1
                ? ""
                : "s"
            } available.`
          : "No targeted Achievement Standard aspects found."
    },


    {
      title:
        "Assessment",

      ready:
        assessments.length > 0,

      detail:
        assessments.length
          ? `Assessment planning found for ${assessments.length} year level${
              assessments.length === 1
                ? ""
                : "s"
            }.`
          : "Assessment planning has not been found."
    },


    {
      title:
        "Teaching sequence",

      ready:
        weeks.length > 0,

      detail:
        weeks.length
          ? `${weeks.length} week${
              weeks.length === 1
                ? ""
                : "s"
            } planned.`
          : "No weekly teaching sequence found."
    },


    {
      title:
        "Differentiation",

      ready:
        adjustments.length > 0,

      detail:
        adjustments.length
          ? `${adjustments.length} learner characteristic${
              adjustments.length === 1
                ? ""
                : "s"
            } addressed.`
          : "No selected adjustments found."
    },


    {
      title:
        "Daily Review",

      ready:
        hasDailyReview(),

      detail:
        hasDailyReview()
          ? "Daily Review planning is available."
          : "Daily Review planning has not been found."
    },


    {
      title:
        "Learning Wall",

      ready:
        Boolean(
          unitPlan.learningWall
            ?.learningWallPrompt
        ),

      detail:
        unitPlan.learningWall
          ?.learningWallPrompt
          ? "Learning Wall visual prompt prepared."
          : "Learning Wall visual prompt not yet generated."
    },


    {
      title:
        "Bump-It-Up Wall",

      ready:
        Boolean(
          unitPlan.learningWall
            ?.biuPrompt
        ),

      detail:
        unitPlan.learningWall
          ?.biuPrompt
          ? "Bump-It-Up visual prompt prepared."
          : "Bump-It-Up visual prompt not yet generated."
    }

  ];

}


// ============================================================
// REFRESH
// ============================================================

function refreshPreview() {

  const container =
    document.getElementById(
      "printPreview"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    buildTemplateHtml();


  renderUnitReadiness();


  showMessage(
    "Unit Plan refreshed using the latest planning information."
  );

}


// ============================================================
// PRINT / SAVE PDF
// ============================================================

function printUnitPlan() {

  refreshPreview();


  setTimeout(
    () => {

      window.print();

    },
    120
  );

}


// ============================================================
// EXPORT TO MICROSOFT WORD
// A3 LANDSCAPE
// ============================================================

function exportToWord() {

  // Always export the latest version.
  refreshPreview();


  const preview =
    document.getElementById(
      "printPreview"
    );


  if (!preview) {

    showMessage(
      "Unable to build the Word document."
    );

    return;

  }


  const template =
    preview.querySelector(
      ".unit-template"
    );


  if (!template) {

    showMessage(
      "Refresh the Unit Plan before exporting to Word."
    );

    return;

  }


  const documentContent =
    template.outerHTML;


  // ==========================================================
  // WORD-SPECIFIC STYLES
  // A3 landscape:
  // 420 mm × 297 mm
  // ==========================================================

  const wordStyles = `

    <style>

      @page Section1 {

        size: 1190.55pt 841.89pt;

        mso-page-orientation: landscape;

        margin-top: 22.68pt;
        margin-right: 22.68pt;
        margin-bottom: 22.68pt;
        margin-left: 22.68pt;

      }


      div.Section1 {

        page: Section1;

      }


      body {

        font-family:
          Aptos,
          Calibri,
          Arial,
          sans-serif;

        font-size: 8pt;

        color: #172536;

        line-height: 1.2;

        margin: 0;

        padding: 0;

      }


      .unit-template {

        width: 100%;

        max-width: 100%;

        margin: 0;

        padding: 0;

      }


      /* ======================================================
         TEMPLATE HEADER
         ====================================================== */

      .unit-template-header {

        width: 100%;

        border-collapse: collapse;

        display: table;

        table-layout: fixed;

      }


      .unit-template-header > div {

        display: table-cell;

        vertical-align: top;

        border: 1px solid #7d8b99;

        padding: 6px 7px;

      }


      .unit-template-header > div:first-child {

        width: 58%;

      }


      .unit-template-header > div:nth-child(2) {

        width: 21%;

      }


      .unit-template-header > div:nth-child(3) {

        width: 21%;

      }


      .unit-template-header span {

        display: block;

        margin-bottom: 2px;

        color: #596a7c;

        font-size: 7pt;

        font-weight: bold;

        text-transform: uppercase;

      }


      .subject-title {

        font-size: 12pt;

        font-weight: bold;

        color: #173d68;

      }


      .unit-title-strip {

        padding: 6px 7px;

        border: 1px solid #7d8b99;

        background: #edf3f8;

        color: #173d68;

        font-size: 10pt;

      }


      .template-guidance {

        padding: 6px 7px;

        border: 1px solid #7d8b99;

        color: #47596a;

        font-size: 7.5pt;

      }


      /* ======================================================
         SECTION HEADINGS
         ====================================================== */

      .template-section-title {

        margin-top: 7px;

        padding: 4px 6px;

        border: 1px solid #234f79;

        background: #234f79;

        color: #ffffff;

        font-size: 9pt;

        font-weight: bold;

      }


      .template-subheading {

        color: #173d68;

        font-weight: bold;

      }


      /* ======================================================
         TABLES
         ====================================================== */

      table {

        width: 100%;

        max-width: 100%;

        border-collapse: collapse;

        table-layout: fixed;

        font-size: 7.5pt;

      }


      th,
      td {

        border: 1px solid #7d8b99;

        padding: 3px 4px;

        vertical-align: top;

        text-align: left;

        word-wrap: break-word;

      }


      th {

        background: #dce8f2;

        color: #173d68;

        font-weight: bold;

      }


      /* ======================================================
         WEEK OVERVIEW
         ====================================================== */

      .week-overview-scroll {

        width: 100%;

        overflow: visible;

      }


      .week-overview-table {

        width: 100%;

        table-layout: fixed;

      }


      .week-overview-table th,
      .week-overview-table td {

        font-size: 6.8pt;

        padding: 3px;

      }


      .week-overview-focus {

        color: #173d68;

        font-weight: bold;

      }


      /* ======================================================
         DETAILED TEACHING TABLES
         ====================================================== */

      .teaching-detail-block {

        margin-top: 6px;

      }


      .teaching-detail-table {

        width: 100%;

        table-layout: fixed;

      }


      .teaching-detail-table col.focus-col {

        width: 15%;

      }


      .teaching-detail-table col.curriculum-col {

        width: 24%;

      }


      .teaching-detail-table col.sequence-col {

        width: 45%;

      }


      .teaching-detail-table col.resources-col {

        width: 16%;

      }


      /* ======================================================
         LESSON ITEMS
         ====================================================== */

      .lesson-print-item {

        margin-bottom: 4px;

        padding-bottom: 3px;

        border-bottom: 1px solid #d8e0e7;

      }


      .lesson-print-item:last-child {

        border-bottom: none;

      }


      .lesson-print-item strong {

        color: #173d68;

      }


      .weekly-extra {

        margin-top: 4px;

        padding: 4px;

        border-left: 2px solid #9bb8d0;

        background: #f5f8fb;

      }


      /* ======================================================
         ASSESSMENT
         ====================================================== */

      .assessment-year-block {

        margin-bottom: 6px;

      }


      .assessment-year-title {

        padding: 4px 6px;

        border: 1px solid #7d8b99;

        background: #edf3f8;

        color: #173d68;

        font-weight: bold;

      }


      .assessment-component {

        margin-bottom: 3px;

      }


      .marking-guide-print {

        margin-top: 5px;

      }


      .marking-guide-print-item {

        padding: 3px 0;

        border-bottom: 1px solid #d7dfe7;

      }


      /* ======================================================
         DIFFERENTIATION
         ====================================================== */

      .adjustment-print-group {

        margin-bottom: 4px;

      }


      .adjustment-print-group strong {

        color: #173d68;

      }


      /* ======================================================
         TEXT
         ====================================================== */

      p {

        margin-top: 1px;

        margin-bottom: 2px;

      }


      ul,
      ol {

        margin-top: 2px;

        margin-bottom: 3px;

        padding-left: 14px;

      }


      li {

        margin-bottom: 1px;

      }


      h3,
      h4,
      h5 {

        margin-top: 3px;

        margin-bottom: 3px;

        color: #173d68;

      }


      h3 {

        font-size: 9pt;

      }


      h4 {

        font-size: 8pt;

      }


      h5 {

        font-size: 7.5pt;

      }


      .template-paragraph {

        margin-top: 1px;

        margin-bottom: 2px;

      }


      .template-muted {

        color: #68798b;

      }


      .template-empty {

        color: #8a5b14;

        font-style: italic;

      }

    </style>

  `;


  // ==========================================================
  // COMPLETE WORD DOCUMENT
  // ==========================================================

  const wordDocument = `

    <!DOCTYPE html>

    <html
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40"
    >

      <head>

        <meta charset="utf-8">

        <title>
          ${escapeHtml(
            getUnitTitle()
          )}
        </title>


        <!--[if gte mso 9]>

        <xml>

          <w:WordDocument>

            <w:View>
              Print
            </w:View>

            <w:Zoom>
              80
            </w:Zoom>

            <w:DoNotOptimizeForBrowser/>

          </w:WordDocument>

        </xml>

        <![endif]-->


        ${wordStyles}

      </head>


      <body>

        <div class="Section1">

          ${documentContent}

        </div>

      </body>

    </html>

  `;


  // ==========================================================
  // CREATE DOWNLOAD
  // ==========================================================

  const blob =
    new Blob(
      [
        "\ufeff",
        wordDocument
      ],
      {
        type:
          "application/msword"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    buildWordFilename();


  document.body.appendChild(
    link
  );


  link.click();


  document.body.removeChild(
    link
  );


  setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    1000
  );


  showMessage(
    "Microsoft Word version created in A3 landscape format."
  );

}


// ============================================================
// WORD FILE NAME
// ============================================================

function buildWordFilename() {

  const title =
    getUnitTitle() ||
    "Unit Plan";


  const years =
    getYearLevels();


  const yearText =
    years.length
      ? `${years.join("-")}_`
      : "";


  const safeTitle =
    title
      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );


  const safeYears =
    yearText
      .replace(
        /[^a-z0-9_-]+/gi,
        "-"
      );


  return `${safeYears}${safeTitle}_Unit-Plan.doc`;

}


// ============================================================
// BUILD COMPLETE TEMPLATE
// ============================================================

function buildTemplateHtml() {

  return `

    <article class="unit-template">


      ${buildTemplateHeader()}


      ${buildUnitOverview()}


      ${buildAssessmentAndDifferentiationOverview()}


      ${buildWeeklyOverview()}


      ${buildDetailedTeachingLearningAssessment()}


      ${buildAssessmentDetail()}


      ${buildCARASection()}


    </article>

  `;

}


// ============================================================
// TEMPLATE HEADER
// ============================================================

function buildTemplateHeader() {

  const subjects =
    getLearningAreas();


  const years =
    getYearLevels();


  return `

    <div class="unit-template-header">

      <div>

        <span>
          Learning area / subject
        </span>

        <div class="subject-title">
          ${escapeHtml(
            subjects.length
              ? `${subjects.join(" / ")} AC V9`
              : "Australian Curriculum V9"
          )}
        </div>

      </div>


      <div>

        <span>
          Year
        </span>

        <strong>
          ${escapeHtml(
            years.join(", ") ||
            "—"
          )}
        </strong>

      </div>


      <div>

        <span>
          Unit
        </span>

        <strong>
          ${escapeHtml(
            getUnitNumber()
          )}
        </strong>

      </div>

    </div>


    <div class="unit-title-strip">

      <strong>
        Unit planning
      </strong>

      ${escapeHtml(
        getUnitTitle()
      )}

    </div>


    <div class="template-guidance">

      This unit plan brings together the curriculum,
      assessment, teaching sequence, monitoring,
      differentiation and adjustment decisions developed
      through the Integrated Unit Planner.

    </div>

  `;

}


// ============================================================
// UNIT OVERVIEW
// ============================================================

function buildUnitOverview() {

  return `

    <div class="template-section-title">
      Unit overview
    </div>


    <table class="template-table">

      <colgroup>
        <col style="width:38%">
        <col style="width:62%">
      </colgroup>


      <thead>

        <tr>

          <th>
            Unit overview
          </th>

          <th>
            Achievement standard
          </th>

        </tr>

      </thead>


      <tbody>

        <tr>

          <td>

            <p class="template-paragraph">

              <strong>
                Duration:
              </strong>

              ${escapeHtml(
                getDuration()
              )}

            </p>


            <p class="template-paragraph">

              <strong>
                Term:
              </strong>

              ${escapeHtml(
                getTerm()
              )}

            </p>


            <p class="template-paragraph">

              <strong>
                Unit description:
              </strong>

            </p>

            ${textHtml(
              getUnitDescription()
            )}

          </td>


          <td>

            ${achievementStandardHtml()}

          </td>

        </tr>

      </tbody>

    </table>

  `;

}


// ============================================================
// ACHIEVEMENT STANDARD
// ============================================================

function achievementStandardHtml() {

  const rows =
    getCurriculumRows();


  if (!rows.length) {

    return emptyHtml(
      "No targeted Achievement Standard aspects were found."
    );

  }


  const grouped =
    groupBy(
      rows,
      (row) =>
        `${row.subject || "Learning Area"}|||${row.grade || row.yearLevel || ""}`
    );


  return Object.entries(
    grouped
  )
    .map(
      ([
        key,
        items
      ]) => {

        const [
          subject,
          year
        ] =
          key.split(
            "|||"
          );


        return `

          <div style="margin-bottom:10px">

            <strong class="template-subheading">

              ${escapeHtml(
                subject
              )}

              ${
                year
                  ? ` — ${escapeHtml(
                      year
                    )}`
                  : ""
              }

            </strong>


            <ul class="template-list">

              ${
                items
                  .map(
                    (row) => `

                      <li>
                        ${escapeHtml(
                          row.text ||
                          row.statement ||
                          row.description ||
                          ""
                        )}
                      </li>

                    `
                  )
                  .join("")
              }

            </ul>

          </div>

        `;

      }
    )
    .join("");

}


// ============================================================
// ASSESSMENT + DIFFERENTIATION OVERVIEW
// ============================================================

function buildAssessmentAndDifferentiationOverview() {

  return `

    <table class="template-table">

      <colgroup>
        <col style="width:50%">
        <col style="width:50%">
      </colgroup>


      <thead>

        <tr>

          <th>
            Summative assessment and monitoring strategies
          </th>

          <th>
            School context and considerations when differentiating
          </th>

        </tr>

      </thead>


      <tbody>

        <tr>

          <td>
            ${assessmentOverviewHtml()}
          </td>


          <td>
            ${differentiationOverviewHtml()}
          </td>

        </tr>

      </tbody>

    </table>

  `;

}


// ============================================================
// ASSESSMENT OVERVIEW
// ============================================================

function assessmentOverviewHtml() {

  const assessments =
    getAllAssessments();


  if (!assessments.length) {

    return emptyHtml(
      "No summative assessment has been recorded."
    );

  }


  return assessments
    .map(
      ({
        yearLevel,
        assessment
      }) => {

        const components =
          getAssessmentComponents(
            assessment
          );


        return `

          <div class="assessment-year-block">

            <strong class="template-subheading">
              ${escapeHtml(
                yearLevel
              )}
            </strong>


            ${
              assessment.title ||
              assessment.assessmentTitle
                ? `

                  <p class="template-paragraph">

                    <strong>
                      Assessment:
                    </strong>

                    ${escapeHtml(
                      assessment.title ||
                      assessment.assessmentTitle
                    )}

                  </p>

                `
                : ""
            }


            ${
              components.length
                ? `

                  <ul class="template-list">

                    ${
                      components
                        .map(
                          (
                            component,
                            index
                          ) => `

                            <li>

                              ${
                                escapeHtml(
                                  component.questionText ||
                                  component.question ||
                                  `Assessment component ${index + 1}`
                                )
                              }

                              ${
                                component.evidenceFormat
                                  ? ` — <em>${escapeHtml(
                                      component.evidenceFormat
                                    )}</em>`
                                  : ""
                              }

                            </li>

                          `
                        )
                        .join("")
                    }

                  </ul>

                `
                : ""
            }

          </div>

        `;

      }
    )
    .join("");

}


// ============================================================
// DIFFERENTIATION OVERVIEW
// ============================================================

function differentiationOverviewHtml() {

  const groups =
    getAdjustmentGroups();


  if (!groups.length) {

    return emptyHtml(
      "No specific differentiation adjustments have been selected."
    );

  }


  return groups
    .map(
      (group) => `

        <div class="adjustment-print-group">

          <strong>
            ${escapeHtml(
              group.characteristic ||
              "Learner characteristic"
            )}
          </strong>


          <ul class="template-list">

            ${
              (
                group.adjustments ||
                []
              )
                .map(
                  (adjustment) => `

                    <li>
                      ${escapeHtml(
                        adjustment
                      )}
                    </li>

                  `
                )
                .join("")
            }

          </ul>

        </div>

      `
    )
    .join("");

}


// ============================================================
// WEEKLY OVERVIEW
// ============================================================

function buildWeeklyOverview() {

  const weeks =
    getWeeks();


  if (!weeks.length) {

    return `

      <div class="template-section-title">
        Overview — Teaching, learning and assessment
      </div>

      ${emptyHtml(
        "No weekly teaching sequence has been developed."
      )}

    `;

  }


  return `

    <div class="template-section-title">
      Overview — Teaching, learning and assessment
    </div>


    <div class="week-overview-scroll">

      <table class="template-table week-overview-table">

        <thead>

          <tr>

            ${
              weeks
                .map(
                  (
                    week,
                    index
                  ) => `

                    <th>
                      Week ${escapeHtml(
                        week.number ||
                        index + 1
                      )}
                    </th>

                  `
                )
                .join("")
            }

          </tr>

        </thead>


        <tbody>

          <tr>

            ${
              weeks
                .map(
                  weekOverviewCell
                )
                .join("")
            }

          </tr>

        </tbody>

      </table>

    </div>

  `;

}


// ============================================================
// WEEK OVERVIEW CELL
// ============================================================

function weekOverviewCell(
  week,
  index
) {

  const lessons =
    Array.isArray(
      week.lessons
    )
      ? week.lessons
      : [];


  const lessonFocus =
    lessons
      .map(
        (lesson) =>
          lesson.purpose ||
          lesson.focus ||
          ""
      )
      .filter(Boolean)
      .slice(
        0,
        4
      );


  return `

    <td>

      ${
        week.focus
          ? `

            <div class="week-overview-focus">
              ${escapeHtml(
                week.focus
              )}
            </div>

          `
          : ""
      }


      ${
        lessonFocus.length
          ? `

            <ul class="template-list">

              ${
                lessonFocus
                  .map(
                    (focus) => `

                      <li>
                        ${escapeHtml(
                          shortenText(
                            focus,
                            150
                          )
                        )}
                      </li>

                    `
                  )
                  .join("")
              }

            </ul>

          `
          : `

            <span class="template-muted">
              Week ${index + 1}
            </span>

          `
      }

    </td>

  `;

}


// ============================================================
// DETAILED TEACHING, LEARNING AND ASSESSMENT
// ============================================================

function buildDetailedTeachingLearningAssessment() {

  const weeks =
    getWeeks();


  return `

    <div class="template-section-title">
      Teaching, learning and assessment
    </div>


    ${
      weeks.length
        ? weeks
            .map(
              detailedWeekHtml
            )
            .join("")
        : emptyHtml(
            "No detailed weekly teaching sequence has been developed."
          )
    }

  `;

}


// ============================================================
// DETAILED WEEK
// ============================================================

function detailedWeekHtml(
  week,
  index
) {

  const weekNumber =
    week.number ||
    index + 1;


  const lessons =
    Array.isArray(
      week.lessons
    )
      ? week.lessons
      : [];


  return `

    <div class="teaching-detail-block">

      <table class="template-table teaching-detail-table">

        <colgroup>

          <col class="focus-col">
          <col class="curriculum-col">
          <col class="sequence-col">
          <col class="resources-col">

        </colgroup>


        <thead>

          <tr>

            <th colspan="4">
              Week ${escapeHtml(
                weekNumber
              )}
            </th>

          </tr>


          <tr>

            <th>
              Focus for teaching and learning
            </th>

            <th>
              AC V9 elements to inform teaching
            </th>

            <th>
              Sequence of teaching and learning
            </th>

            <th>
              Resources
            </th>

          </tr>

        </thead>


        <tbody>

          <tr>

            <td>
              ${weekFocusHtml(
                week,
                lessons
              )}
            </td>


            <td>
              ${weekCurriculumHtml(
                lessons
              )}
            </td>


            <td>
              ${weekSequenceHtml(
                week,
                lessons
              )}
            </td>


            <td>
              ${weekResourcesHtml(
                week
              )}
            </td>

          </tr>

        </tbody>

      </table>

    </div>

  `;

}


// ============================================================
// WEEK FOCUS
// ============================================================

function weekFocusHtml(
  week,
  lessons
) {

  const values = [];


  if (
    week.focus
  ) {

    values.push(
      week.focus
    );

  }


  lessons.forEach(
    (lesson) => {

      if (
        lesson.purpose
      ) {

        values.push(
          `${lesson.subject || "Learning"}: ${lesson.purpose}`
        );

      }

    }
  );


  return values.length
    ? listHtml(
        unique(
          values
        )
      )
    : emptyHtml(
        "Focus not yet recorded."
      );

}


// ============================================================
// CURRICULUM ELEMENTS FOR WEEK
// ============================================================

function weekCurriculumHtml(
  lessons
) {

  const rows =
    getCurriculumRows();


  if (!rows.length) {

    return emptyHtml(
      "Targeted curriculum elements are shown in the Unit overview."
    );

  }


  const lessonSubjects =
    unique(
      lessons
        .map(
          (lesson) =>
            lesson.subject
        )
        .filter(Boolean)
    );


  let filtered =
    rows.filter(
      (row) =>
        !lessonSubjects.length ||
        lessonSubjects.includes(
          row.subject
        )
    );


  if (
    !filtered.length
  ) {

    filtered =
      rows;

  }


  return listHtml(
    filtered
      .slice(
        0,
        8
      )
      .map(
        (row) => {

          const prefix =
            row.subject
              ? `${row.subject}: `
              : "";


          return `${prefix}${row.text || row.statement || row.description || ""}`;

        }
      )
  );

}


// ============================================================
// WEEK TEACHING SEQUENCE
// ============================================================

function weekSequenceHtml(
  week,
  lessons
) {

  const content = [];


  lessons.forEach(
    (
      lesson,
      index
    ) => {

      if (
        !lessonHasContent(
          lesson
        )
      ) {

        return;

      }


      content.push(`

        <div class="lesson-print-item">

          <strong>
            ${
              escapeHtml(
                lesson.subject ||
                `Learning experience ${index + 1}`
              )
            }
          </strong>


          ${
            lesson.phase
              ? ` — ${escapeHtml(
                  lesson.phase
                )}`
              : ""
          }


          ${
            lesson.activity
              ? `

                <p>
                  ${escapeHtml(
                    lesson.activity
                  )}
                </p>

              `
              : ""
          }


          ${
            lesson.evidence
              ? `

                <p>

                  <strong>
                    Check for understanding:
                  </strong>

                  ${escapeHtml(
                    lesson.evidence
                  )}

                </p>

              `
              : ""
          }


          ${
            lesson.integration
              ? `

                <p>

                  <strong>
                    Integration:
                  </strong>

                  ${escapeHtml(
                    lesson.integration
                  )}

                </p>

              `
              : ""
          }

        </div>

      `);

    }
  );


  const daily =
    getDailyReviewForWeek(
      week.number
    );


  if (daily) {

    content.push(`

      <div class="weekly-extra">

        <strong>
          Daily Review
        </strong>

        ${textHtml(
          daily
        )}

      </div>

    `);

  }


  const wallStatus =
    learningWallWeeklyNote();


  if (
    wallStatus
  ) {

    content.push(`

      <div class="weekly-extra">

        <strong>
          Learning Wall / Bump-It-Up
        </strong>

        <p>
          ${escapeHtml(
            wallStatus
          )}
        </p>

      </div>

    `);

  }


  return content.length
    ? content.join("")
    : emptyHtml(
        "Teaching sequence not yet recorded."
      );

}


// ============================================================
// RESOURCES
// ============================================================

function weekResourcesHtml(
  week
) {

  const resources =
    week.resources ||
    week.resource ||
    "";


  if (!resources) {

    return `

      <span class="template-muted">
        Add unit texts, sources, equipment,
        digital resources or learning-wall
        materials as required.
      </span>

    `;

  }


  return textHtml(
    resources
  );

}


// ============================================================
// ASSESSMENT DETAIL
// ============================================================

function buildAssessmentDetail() {

  const assessments =
    getAllAssessments();


  return `

    <div class="template-section-title">
      Assessment / Monitoring strategy
    </div>


    ${
      assessments.length
        ? assessments
            .map(
              assessmentDetailHtml
            )
            .join("")
        : emptyHtml(
            "No assessment information has been recorded."
          )
    }

  `;

}


// ============================================================
// ASSESSMENT DETAIL — YEAR
// ============================================================

function assessmentDetailHtml(
  {
    yearLevel,
    assessment
  }
) {

  const components =
    getAssessmentComponents(
      assessment
    );


  return `

    <div class="assessment-year-block">

      <div class="assessment-year-title">
        ${escapeHtml(
          yearLevel
        )}
      </div>


      <table class="template-table">

        <colgroup>
          <col style="width:38%">
          <col style="width:46%">
          <col style="width:16%">
        </colgroup>


        <thead>

          <tr>

            <th>
              AC V9 elements to inform assessment
            </th>

            <th>
              Assessment / Monitoring strategy
            </th>

            <th>
              Resources
            </th>

          </tr>

        </thead>


        <tbody>

          <tr>

            <td>
              ${assessmentCurriculumHtml(
                assessment
              )}
            </td>


            <td>

              ${
                assessment.title ||
                assessment.assessmentTitle
                  ? `

                    <p class="template-paragraph">

                      <strong>
                        Title:
                      </strong>

                      ${escapeHtml(
                        assessment.title ||
                        assessment.assessmentTitle
                      )}

                    </p>

                  `
                  : ""
              }


              ${
                assessment.purpose ||
                assessment.assessmentPurpose
                  ? `

                    <p class="template-paragraph">

                      <strong>
                        Purpose:
                      </strong>

                      ${escapeHtml(
                        assessment.purpose ||
                        assessment.assessmentPurpose
                      )}

                    </p>

                  `
                  : ""
              }


              ${
                components.length
                  ? `

                    <ol>

                      ${
                        components
                          .map(
                            (
                              component,
                              index
                            ) => `

                              <li class="assessment-component">

                                ${
                                  escapeHtml(
                                    component.questionText ||
                                    component.question ||
                                    `Assessment component ${index + 1}`
                                  )
                                }

                                ${
                                  component.evidenceFormat
                                    ? `

                                      <br>

                                      <em>
                                        ${escapeHtml(
                                          component.evidenceFormat
                                        )}
                                      </em>

                                    `
                                    : ""
                                }

                              </li>

                            `
                          )
                          .join("")
                      }

                    </ol>

                  `
                  : ""
              }


              ${markingGuideHtml(
                assessment
              )}

            </td>


            <td>

              ${
                assessment.resources
                  ? textHtml(
                      assessment.resources
                    )
                  : `

                    <span class="template-muted">
                      Add assessment resources or stimulus materials as required.
                    </span>

                  `
              }

            </td>

          </tr>

        </tbody>

      </table>

    </div>

  `;

}


// ============================================================
// ASSESSMENT CURRICULUM
// ============================================================

function assessmentCurriculumHtml(
  assessment
) {

  const components =
    getAssessmentComponents(
      assessment
    );


  const selectedCodes =
    unique(
      components.flatMap(
        (component) =>
          Array.isArray(
            component.selectedStandardCodes
          )
            ? component.selectedStandardCodes
            : []
      )
    );


  const rows =
    getCurriculumRows();


  let selectedRows =
    rows;


  if (
    selectedCodes.length
  ) {

    const matched =
      rows.filter(
        (row) =>
          selectedCodes.includes(
            row.code
          )
      );


    if (
      matched.length
    ) {

      selectedRows =
        matched;

    }

  }


  return selectedRows.length
    ? listHtml(
        selectedRows
          .slice(
            0,
            10
          )
          .map(
            (row) =>
              `${row.subject || ""}${
                row.subject
                  ? ": "
                  : ""
              }${row.text || row.statement || row.description || ""}`
          )
      )
    : emptyHtml(
        "No Achievement Standard aspects linked."
      );

}


// ============================================================
// MARKING GUIDE
// ============================================================

function markingGuideHtml(
  assessment
) {

  const guide =
    assessment.markingGuide ||
    assessment.markingGuideData ||
    assessment.markingGuideBySubject ||
    assessment.gtmj ||
    assessment.gtmjData ||
    null;


  if (!guide) {

    return "";

  }


  return `

    <div class="marking-guide-print">

      <strong>
        Marking Guide
      </strong>

      ${genericValueHtml(
        guide
      )}

    </div>

  `;

}


// ============================================================
// CARA
// ============================================================

function buildCARASection() {

  return `

    <div class="template-section-title">
      Curriculum Activity Risk Assessment (CARA) guidelines
    </div>


    <table class="template-table">

      <tbody>

        <tr>

          <td>

            Complete relevant risk-management planning
            for curriculum activities where required.

          </td>

        </tr>

      </tbody>

    </table>

  `;

}


// ============================================================
// UNIT SETUP
// ============================================================

function getUnitTitle() {

  return (
    unitPlan.setup
      ?.unitTitle ||
    unitPlan.setup
      ?.title ||
    "Untitled Unit"
  );

}


function getUnitNumber() {

  return (
    unitPlan.setup
      ?.unitNumber ||
    unitPlan.setup
      ?.unit ||
    "—"
  );

}


function getYearLevels() {

  return Array.isArray(
    unitPlan.setup
      ?.yearLevels
  )
    ? unitPlan.setup.yearLevels
    : [];

}


function getTerm() {

  return (
    unitPlan.setup
      ?.term ||
    ""
  );

}


function getDuration() {

  const setup =
    unitPlan.setup ||
    {};


  const value =
    setup.weeks ||
    setup.durationWeeks ||
    setup.numberOfWeeks ||
    setup.weekCount ||
    setup.unitWeeks;


  if (
    value
  ) {

    const number =
      Number(
        value
      );


    if (
      Number.isFinite(
        number
      )
    ) {

      return `${number} week${
        number === 1
          ? ""
          : "s"
      }`;

    }


    return String(
      value
    );

  }


  const weeks =
    getWeeks();


  return weeks.length
    ? `${weeks.length} weeks`
    : "—";

}


// ============================================================
// UNIT DESCRIPTION
// ============================================================

function getUnitDescription() {

  const setup =
    unitPlan.setup ||
    {};


  const integration =
    unitPlan.integration ||
    {};


  return (
    setup.context ||
    setup.bigIdea ||
    setup.unitDescription ||
    integration.bigIdea ||
    integration.sharedConcept ||
    integration.context ||
    integration.authenticContext ||
    "Unit description has not yet been recorded."
  );

}


// ============================================================
// LEARNING AREAS
// ============================================================

function getLearningAreas() {

  const setupSubjects =
    Array.isArray(
      unitPlan.setup
        ?.subjects
    )
      ? unitPlan.setup.subjects
      : [];


  if (
    setupSubjects.length
  ) {

    return unique(
      setupSubjects
    );

  }


  return unique(
    getCurriculumRows()
      .map(
        (row) =>
          row.subject
      )
      .filter(Boolean)
  );

}


// ============================================================
// CURRICULUM DATA
// ============================================================

function getCurriculumRows() {

  const directCandidates = [

    unitPlan.curriculum
      ?.selectedRows,

    unitPlan.curriculum
      ?.rows,

    unitPlan.curriculum
      ?.selected,

    unitPlan.selectedCurriculumRows,

    unitPlan.curriculumRows

  ];


  for (
    const candidate of
    directCandidates
  ) {

    if (
      Array.isArray(
        candidate
      ) &&
      candidate.length
    ) {

      return candidate;

    }

  }


  const found = [];


  findCurriculumLikeRows(
    unitPlan.curriculum,
    found
  );


  return deduplicateObjects(
    found,
    (row) =>
      [
        row.subject ||
        "",
        row.grade ||
        row.yearLevel ||
        "",
        row.code ||
        "",
        row.text ||
        row.statement ||
        ""
      ]
        .join("|")
  );

}


// ============================================================
// FIND CURRICULUM ROWS RECURSIVELY
// ============================================================

function findCurriculumLikeRows(
  value,
  output
) {

  if (!value) {
    return;
  }


  if (
    Array.isArray(
      value
    )
  ) {

    value.forEach(
      (item) =>
        findCurriculumLikeRows(
          item,
          output
        )
    );

    return;

  }


  if (
    typeof value !==
    "object"
  ) {

    return;

  }


  const text =
    value.text ||
    value.statement ||
    value.description;


  if (
    text &&
    (
      value.subject ||
      value.learningArea ||
      value.code ||
      value.grade ||
      value.yearLevel
    )
  ) {

    output.push({

      ...value,

      subject:
        value.subject ||
        value.learningArea ||
        "",

      text

    });

  }


  Object.values(
    value
  )
    .forEach(
      (child) =>
        findCurriculumLikeRows(
          child,
          output
        )
    );

}


// ============================================================
// ASSESSMENTS
// ============================================================

function getAllAssessments() {

  const store =
    unitPlan.assessments ||
    unitPlan.assessment ||
    {};


  const results = [];


  if (
    Array.isArray(
      store
    )
  ) {

    store.forEach(
      (
        assessment,
        index
      ) => {

        if (
          assessment &&
          typeof assessment ===
          "object"
        ) {

          results.push({

            yearLevel:
              assessment.yearLevel ||
              assessment.year ||
              `Year ${index + 1}`,

            assessment

          });

        }

      }
    );


    return results;

  }


  if (
    store.byYear &&
    typeof store.byYear ===
    "object"
  ) {

    Object.entries(
      store.byYear
    )
      .forEach(
        ([
          yearLevel,
          assessment
        ]) => {

          if (
            assessment &&
            typeof assessment ===
            "object"
          ) {

            results.push({

              yearLevel,

              assessment

            });

          }

        }
      );

  }


  Object.entries(
    store
  )
    .forEach(
      ([
        key,
        assessment
      ]) => {

        if (
          key ===
          "byYear" ||
          key ===
          "activeYear"
        ) {

          return;

        }


        if (
          assessment &&
          typeof assessment ===
          "object" &&
          looksLikeAssessment(
            assessment
          )
        ) {

          if (
            !results.some(
              (result) =>
                result.assessment ===
                assessment
            )
          ) {

            results.push({

              yearLevel:
                assessment.yearLevel ||
                assessment.year ||
                key,

              assessment

            });

          }

        }

      }
    );


  return results;

}


// ============================================================
// LOOKS LIKE ASSESSMENT
// ============================================================

function looksLikeAssessment(
  value
) {

  return Boolean(

    Array.isArray(
      value.components
    ) ||

    Array.isArray(
      value.draftTask
    ) ||

    value.title ||

    value.assessmentTitle ||

    value.taskEvidence ||

    value.markingGuide ||

    value.markingGuideData ||

    value.gtmj

  );

}


// ============================================================
// ASSESSMENT COMPONENTS
// ============================================================

function getAssessmentComponents(
  assessment
) {

  if (
    Array.isArray(
      assessment.components
    )
  ) {

    return assessment.components;

  }


  if (
    Array.isArray(
      assessment.draftTask
    )
  ) {

    return assessment.draftTask;

  }


  return [];

}


// ============================================================
// WEEKS
// ============================================================

function getWeeks() {

  return Array.isArray(
    unitPlan.sequence
      ?.weeks
  )
    ? unitPlan.sequence.weeks
    : [];

}


// ============================================================
// DAILY REVIEW
// ============================================================

function hasDailyReview() {

  const daily =
    unitPlan.daily ||
    {};


  return objectHasContent(
    daily
  );

}


function getDailyReviewForWeek(
  weekNumber
) {

  const daily =
    unitPlan.daily ||
    {};


  const weekly =
    Array.isArray(
      daily.weeklyPlan
    )
      ? daily.weeklyPlan
      : [];


  const matching =
    weekly.find(
      (week) =>
        String(
          week.week
        ) ===
        String(
          weekNumber
        )
    );


  if (
    matching
  ) {

    const pieces = [];


    [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday"
    ]
      .forEach(
        (day) => {

          if (
            matching[
              day
            ]
          ) {

            pieces.push(
              `${capitalise(
                day
              )}: ${matching[day]}`
            );

          }

        }
      );


    if (
      pieces.length
    ) {

      return pieces.join(
        "\n"
      );

    }

  }


  const bank = [];


  [
    daily.vocabulary,
    daily.knowledge,
    daily.fluency,
    daily.application
  ]
    .filter(Boolean)
    .forEach(
      (value) =>
        bank.push(
          value
        )
    );


  return bank
    .slice(
      0,
      2
    )
    .join(
      "\n"
    );

}


// ============================================================
// DIFFERENTIATION
// ============================================================

function getAdjustmentGroups() {

  return Array.isArray(
    unitPlan.differentiation
      ?.adjustmentGroups
  )
    ? unitPlan.differentiation
        .adjustmentGroups
    : [];

}


// ============================================================
// LEARNING WALL WEEKLY NOTE
// ============================================================

function learningWallWeeklyNote() {

  const learning =
    Boolean(
      unitPlan.learningWall
        ?.learningWallPrompt
    );


  const biu =
    Boolean(
      unitPlan.learningWall
        ?.biuPrompt
    );


  if (
    learning &&
    biu
  ) {

    return "Update the Learning Wall and Bump-It-Up Wall as relevant learning is explicitly taught.";

  }


  if (learning) {

    return "Update the Learning Wall as new learning, vocabulary and examples are introduced.";

  }


  if (biu) {

    return "Use the Bump-It-Up Wall to make progression and next steps visible.";

  }


  return "";

}


// ============================================================
// LESSON CONTENT CHECK
// ============================================================

function lessonHasContent(
  lesson
) {

  return Boolean(
    lesson?.purpose ||
    lesson?.focus ||
    lesson?.activity ||
    lesson?.experience ||
    lesson?.evidence ||
    lesson?.integration
  );

}


// ============================================================
// GENERIC MARKING GUIDE RENDERING
// ============================================================

function genericValueHtml(
  value,
  depth = 0
) {

  if (
    value ===
    null ||
    value ===
    undefined ||
    value ===
    ""
  ) {

    return "";

  }


  if (
    typeof value ===
    "string" ||
    typeof value ===
    "number"
  ) {

    return textHtml(
      String(
        value
      )
    );

  }


  if (
    Array.isArray(
      value
    )
  ) {

    return value
      .map(
        (item) => `

          <div class="marking-guide-print-item">
            ${genericValueHtml(
              item,
              depth + 1
            )}
          </div>

        `
      )
      .join("");

  }


  if (
    typeof value ===
    "object"
  ) {

    return Object.entries(
      value
    )
      .filter(
        ([
          ,
          item
        ]) =>
          item !==
          null &&
          item !==
          undefined &&
          item !==
          ""
      )
      .map(
        ([
          key,
          item
        ]) => `

          <div class="marking-guide-print-item">

            ${
              depth <
              3
                ? `

                  <strong>
                    ${escapeHtml(
                      prettifyKey(
                        key
                      )
                    )}
                  </strong>

                `
                : ""
            }

            ${genericValueHtml(
              item,
              depth + 1
            )}

          </div>

        `
      )
      .join("");

  }


  return "";

}


// ============================================================
// HTML LIST
// ============================================================

function listHtml(
  values
) {

  const cleaned =
    values
      .filter(Boolean);


  if (!cleaned.length) {

    return "";

  }


  return `

    <ul class="template-list">

      ${
        cleaned
          .map(
            (value) => `

              <li>
                ${escapeHtml(
                  value
                )}
              </li>

            `
          )
          .join("")
      }

    </ul>

  `;

}


// ============================================================
// TEXT HTML
// ============================================================

function textHtml(
  value
) {

  const text =
    String(
      value ||
      ""
    )
      .trim();


  if (!text) {

    return "";

  }


  const lines =
    text
      .split(
        /\n+/
      )
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);


  const looksLikeList =
    lines.some(
      (line) =>
        /^[•\-*]/.test(
          line
        )
    );


  if (
    looksLikeList
  ) {

    return `

      <ul class="template-list">

        ${
          lines
            .map(
              (line) => `

                <li>
                  ${escapeHtml(
                    line.replace(
                      /^[•\-*]\s*/,
                      ""
                    )
                  )}
                </li>

              `
            )
            .join("")
        }

      </ul>

    `;

  }


  return lines
    .map(
      (line) => `

        <p class="template-paragraph">
          ${escapeHtml(
            line
          )}
        </p>

      `
    )
    .join("");

}


// ============================================================
// EMPTY
// ============================================================

function emptyHtml(
  value
) {

  return `

    <span class="template-empty">
      ${escapeHtml(
        value
      )}
    </span>

  `;

}


// ============================================================
// OBJECT CONTENT
// ============================================================

function objectHasContent(
  object
) {

  if (
    !object ||
    typeof object !==
    "object"
  ) {

    return false;

  }


  return Object.values(
    object
  )
    .some(
      (value) => {

        if (
          Array.isArray(
            value
          )
        ) {

          return value.length > 0;

        }


        if (
          value &&
          typeof value ===
          "object"
        ) {

          return objectHasContent(
            value
          );

        }


        return Boolean(
          String(
            value ||
            ""
          )
            .trim()
        );

      }
    );

}


// ============================================================
// GROUP BY
// ============================================================

function groupBy(
  values,
  getKey
) {

  return values.reduce(
    (
      result,
      value
    ) => {

      const key =
        getKey(
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


// ============================================================
// UNIQUE
// ============================================================

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


// ============================================================
// DEDUPLICATE OBJECTS
// ============================================================

function deduplicateObjects(
  values,
  getKey
) {

  const map =
    new Map();


  values.forEach(
    (value) => {

      const key =
        getKey(
          value
        );


      if (
        !map.has(
          key
        )
      ) {

        map.set(
          key,
          value
        );

      }

    }
  );


  return [
    ...map.values()
  ];

}


// ============================================================
// SHORTEN TEXT
// ============================================================

function shortenText(
  value,
  maxLength
) {

  const text =
    String(
      value ||
      ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  if (
    text.length <=
    maxLength
  ) {

    return text;

  }


  return `${text
    .slice(
      0,
      maxLength - 3
    )
    .trim()}...`;

}


// ============================================================
// PRETTIFY KEY
// ============================================================

function prettifyKey(
  key
) {

  return String(
    key ||
    ""
  )
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );

}


// ============================================================
// CAPITALISE
// ============================================================

function capitalise(
  value
) {

  const text =
    String(
      value ||
      ""
    );


  return (
    text.charAt(
      0
    ).toUpperCase() +
    text.slice(
      1
    )
  );

}


// ============================================================
// DOM
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


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
  text
) {

  const element =
    document.getElementById(
      "reviewMessage"
    );


  if (!element) {
    return;
  }


  element.innerHTML = `

    <strong>
      ${escapeHtml(
        text
      )}
    </strong>

  `;

}


// ============================================================
// HTML SAFETY
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