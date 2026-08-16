import {
  unitPlan,
  updateUnitPlan
} from "./state.js";

import {
  getSelectedCurriculumRows
} from "./curriculum.js";


// ============================================================
// PAGE INITIALISATION
// ============================================================

export function initIntegrationPage() {

  populateFields();

  renderSelectedCurriculum();

  renderConfirmedConnections();

  setupFieldListeners();

  setupSuggestionButton();

  setupAddConnectionButton();

}


// ============================================================
// BASIC FIELDS
// ============================================================

function populateFields() {

  document.getElementById(
    "integrationBigIdea"
  ).value =
    unitPlan.integration.bigIdea || "";


  document.getElementById(
    "integrationContext"
  ).value =
    unitPlan.integration.authenticContext || "";


  document.getElementById(
    "integrationTerminology"
  ).value =
    unitPlan.integration.terminology || "";


  document.getElementById(
    "integrationNotes"
  ).value =
    unitPlan.integration.notes || "";

}


function setupFieldListeners() {

  bindTextField(
    "integrationBigIdea",
    "integration.bigIdea"
  );

  bindTextField(
    "integrationContext",
    "integration.authenticContext"
  );

  bindTextField(
    "integrationTerminology",
    "integration.terminology"
  );

  bindTextField(
    "integrationNotes",
    "integration.notes"
  );

}


function bindTextField(
  elementId,
  statePath
) {

  document
    .getElementById(elementId)
    .addEventListener(
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
// SELECTED CURRICULUM SUMMARY
// ============================================================

function renderSelectedCurriculum() {

  const container =
    document.getElementById(
      "selectedCurriculumSummary"
    );


  const rows =
    getSelectedCurriculumRows();


  if (!rows.length) {

    container.innerHTML = `
      <div class="empty">
        No Achievement Standard aspects
        have been selected yet.
        Return to Step 2 — Curriculum.
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

          <div class="integration-subject-card">

            <strong>
              ${escapeHtml(subject)}
            </strong>

            <span class="count-pill">
              ${subjectRows.length}
              aspect${subjectRows.length === 1 ? "" : "s"}
            </span>

            <div class="integration-aspect-list">

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
// SUGGESTED CONNECTIONS
// ============================================================

function setupSuggestionButton() {

  document
    .getElementById(
      "integrationSuggest"
    )
    .addEventListener(
      "click",
      generateIntegrationSuggestions
    );

}


function generateIntegrationSuggestions() {

  const output =
    document.getElementById(
      "integrationSuggestions"
    );


  const rows =
    getSelectedCurriculumRows();


  if (rows.length < 2) {

    output.innerHTML = `
      Select at least two Achievement
      Standard aspects in Step 2 before
      generating integration suggestions.
    `;

    return;

  }


  const subjects =
    [
      ...new Set(
        rows.map(
          (row) => row.subject
        )
      )
    ];


  const keywords =
    [
      ...new Set(
        rows
          .flatMap(
            (row) =>
              String(
                row.keywords || ""
              ).split(",")
          )
          .map(
            (word) =>
              word.trim()
          )
          .filter(Boolean)
      )
    ]
    .slice(0, 15);


  const possiblePairs =
    buildSubjectPairs(subjects);


  output.innerHTML = `

    <div class="integration-suggestion">

      <strong>
        Possible shared planning lens
      </strong>

      <p>
        Consider one meaningful context,
        investigation or product in which
        ${subjects
          .map(escapeHtml)
          .join(" + ")}
        contribute authentic learning.
      </p>

    </div>


    ${
      keywords.length
        ? `
          <div class="integration-suggestion">

            <strong>
              Shared terminology to examine
            </strong>

            <p>
              ${keywords
                .map(escapeHtml)
                .join(", ")}
            </p>

          </div>
        `
        : ""
    }


    ${
      possiblePairs.length
        ? `
          <div class="integration-suggestion">

            <strong>
              Connections worth examining
            </strong>

            <div class="connection-chip-list">

              ${
                possiblePairs
                  .map(
                    (pair) => `
                      <span class="connection-chip">
                        ${escapeHtml(pair)}
                      </span>
                    `
                  )
                  .join("")
              }

            </div>

          </div>
        `
        : ""
    }


    <div class="integration-suggestion">

      <strong>
        Teacher check
      </strong>

      <p>
        A shared activity does not automatically
        provide assessable evidence for every
        subject. Confirm the connection only
        where the selected curriculum demands
        are genuinely demonstrated.
      </p>

    </div>

  `;

}


function buildSubjectPairs(subjects) {

  const pairs = [];

  for (
    let first = 0;
    first < subjects.length;
    first++
  ) {

    for (
      let second = first + 1;
      second < subjects.length;
      second++
    ) {

      pairs.push(
        `${subjects[first]} ↔ ${subjects[second]}`
      );

    }

  }

  return pairs;

}


// ============================================================
// CONFIRMED CONNECTIONS
// ============================================================

function setupAddConnectionButton() {

  document
    .getElementById(
      "addConnection"
    )
    .addEventListener(
      "click",
      () => {

        const connections =
          [
            ...unitPlan.integration
              .confirmedConnections
          ];


        connections.push({
          id: crypto.randomUUID(),
          subjects: [],
          description: "",
          evidenceNote: ""
        });


        updateUnitPlan(
          "integration.confirmedConnections",
          connections
        );


        renderConfirmedConnections();

      }
    );

}


function renderConfirmedConnections() {

  const container =
    document.getElementById(
      "confirmedConnections"
    );


  const connections =
    unitPlan.integration
      .confirmedConnections || [];


  if (!connections.length) {

    container.innerHTML = `
      <div class="empty">
        No integration connections have
        been confirmed yet.
      </div>
    `;

    return;

  }


  container.innerHTML = "";


  connections.forEach(
    (connection, index) => {

      const card =
        document.createElement("div");

      card.className =
        "confirmed-connection-card";


      card.innerHTML = `

        <div class="connection-card-head">

          <strong>
            Connection ${index + 1}
          </strong>

          <button
            type="button"
            class="remove"
            data-action="remove"
          >
            Remove
          </button>

        </div>


        <label>
          Learning areas

          <input
            type="text"
            data-field="subjects"
            value="${escapeAttribute(
              (
                connection.subjects || []
              ).join(", ")
            )}"
            placeholder="e.g. HASS, English"
          >
        </label>


        <label>
          How do these curriculum demands connect?

          <textarea
            rows="3"
            data-field="description"
            placeholder="Describe the genuine curriculum connection"
          >${escapeHtml(
            connection.description || ""
          )}</textarea>
        </label>


        <label>
          Evidence / planning note

          <textarea
            rows="3"
            data-field="evidenceNote"
            placeholder="Could one learning experience provide evidence for both? What still needs separate teaching or evidence?"
          >${escapeHtml(
            connection.evidenceNote || ""
          )}</textarea>
        </label>

      `;


      card
        .querySelector(
          '[data-field="subjects"]'
        )
        .addEventListener(
          "input",
          (event) => {

            updateConnection(
              connection.id,
              "subjects",
              event.target.value
                .split(",")
                .map(
                  (subject) =>
                    subject.trim()
                )
                .filter(Boolean)
            );

          }
        );


      card
        .querySelector(
          '[data-field="description"]'
        )
        .addEventListener(
          "input",
          (event) => {

            updateConnection(
              connection.id,
              "description",
              event.target.value
            );

          }
        );


      card
        .querySelector(
          '[data-field="evidenceNote"]'
        )
        .addEventListener(
          "input",
          (event) => {

            updateConnection(
              connection.id,
              "evidenceNote",
              event.target.value
            );

          }
        );


      card
        .querySelector(
          '[data-action="remove"]'
        )
        .addEventListener(
          "click",
          () => {

            removeConnection(
              connection.id
            );

          }
        );


      container.appendChild(card);

    }
  );

}


function updateConnection(
  connectionId,
  field,
  value
) {

  const connections =
    unitPlan.integration
      .confirmedConnections
      .map(
        (connection) => {

          if (
            connection.id !==
            connectionId
          ) {
            return connection;
          }


          return {
            ...connection,
            [field]: value
          };

        }
      );


  updateUnitPlan(
    "integration.confirmedConnections",
    connections
  );

}


function removeConnection(
  connectionId
) {

  const connections =
    unitPlan.integration
      .confirmedConnections
      .filter(
        (connection) =>
          connection.id !==
          connectionId
      );


  updateUnitPlan(
    "integration.confirmedConnections",
    connections
  );


  renderConfirmedConnections();

}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeHtml(value = "") {

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