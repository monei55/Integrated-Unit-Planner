import {
  unitPlan,
  saveUnitPlan,
  loadUnitPlan,
  updateUnitPlan,
  createNewUnit,
  getSavedUnits,
  openUnit,
  duplicateUnit,
  deleteUnit,
  getActiveUnitId
} from "./state.js";


// ============================================================
// PAGE CONFIGURATION
// ============================================================

const PAGE_PATHS = {
  setup: "pages/setup.html",
  curriculum: "pages/curriculum.html",
  integration: "pages/integration.html",
  assessment: "pages/assessment.html",
  sequence: "pages/sequence.html",
  "daily-review": "pages/daily-review.html",
  differentiation: "pages/differentiation.html",
  "learning-wall": "pages/learning-wall.html",
  "review-print": "pages/review-print.html"
};


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    loadUnitPlan();

    setupNavigation();

    setupHeaderActions();

    const startingPage =
      unitPlan.ui?.currentStep ||
      "setup";

    await loadPage(
      startingPage
    );

  }
);


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

  const buttons =
    document.querySelectorAll(
      ".step"
    );


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        async () => {

          const page =
            button.dataset.page;

          await loadPage(
            page
          );

        }
      );

    }
  );

}


// ============================================================
// LOAD PLANNER PAGE
// ============================================================

async function loadPage(
  pageName
) {

  const pageContent =
    document.getElementById(
      "pageContent"
    );


  const path =
    PAGE_PATHS[
      pageName
    ];


  if (!path) {

    console.error(
      `Unknown planner page: ${pageName}`
    );

    return;

  }


  try {

    const response =
      await fetch(
        path
      );


    if (!response.ok) {

      throw new Error(
        `Unable to load ${path}`
      );

    }


    const html =
      await response.text();


    pageContent.innerHTML =
      html;


    setActiveNavigation(
      pageName
    );


    updateUnitPlan(
      "ui.currentStep",
      pageName
    );


    await initialisePage(
      pageName
    );

  } catch (error) {

    console.error(
      error
    );


    pageContent.innerHTML = `
      <section class="panel">

        <div class="empty">

          <strong>
            This planner page could not be loaded.
          </strong>

          <p>
            ${escapeHtml(
              error.message
            )}
          </p>

        </div>

      </section>
    `;

  }

}


// ============================================================
// ACTIVE NAVIGATION
// ============================================================

function setActiveNavigation(
  pageName
) {

  document
    .querySelectorAll(
      ".step"
    )
    .forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.page ===
            pageName
        );

      }
    );

}


// ============================================================
// PAGE INITIALISATION
// ============================================================

async function initialisePage(
  pageName
) {

  switch (
    pageName
  ) {

    case "setup": {

      const module =
        await import(
          "./setup.js"
        );

      module.initSetupPage();

      break;

    }


    case "curriculum": {

      const module =
        await import(
          "./curriculum.js"
        );

      module.initCurriculumPage();

      break;

    }


    case "integration": {

      const module =
        await import(
          "./integration.js"
        );

      module.initIntegrationPage();

      break;

    }


    case "assessment": {

      const module =
        await import(
          "./assessment.js?v=20261026-v3"
        );

      module.initAssessmentPage();

      break;

    }


    case "sequence": {

      const module =
        await import(
          "./sequence.js?v=20261026-concise2"
        );

      module.initSequencePage();

      break;

    }


    case "daily-review": {

      const module =
        await import(
          "./daily-review.js"
        );

      module.initDailyReviewPage();

      break;

    }


    case "differentiation": {

      const module =
        await import(
          "./differentiation.js"
        );

      module.initDifferentiationPage();

      break;

    }


    case "learning-wall": {

      const module =
        await import(
          "./learning-wall.js"
        );

      module.initLearningWallPage();

      break;

    }


    case "review-print": {

      const module =
        await import(
          "./print.js"
        );

      module.initPrintPage();

      break;

    }

  }

}


// ============================================================
// HEADER ACTIONS
// ============================================================

function setupHeaderActions() {

  // ----------------------------------------------------------
  // MY UNITS
  // ----------------------------------------------------------

  const myUnitsBtn =
    document.getElementById(
      "myUnitsBtn"
    );


  if (myUnitsBtn) {

    myUnitsBtn.addEventListener(
      "click",
      () => {

        saveUnitPlan();

        showMyUnits();

      }
    );

  }


  // ----------------------------------------------------------
  // CREATE NEW UNIT
  // ----------------------------------------------------------

  const newUnitBtn =
    document.getElementById(
      "newUnitBtn"
    );


  if (newUnitBtn) {

    newUnitBtn.addEventListener(
      "click",
      async () => {

        await handleCreateNewUnit();

      }
    );

  }


  // ----------------------------------------------------------
  // SAVE
  // ----------------------------------------------------------

  const saveBtn =
    document.getElementById(
      "saveBtn"
    );


  if (saveBtn) {

    saveBtn.addEventListener(
      "click",
      () => {

        saveUnitPlan();

        showSaveMessage();

      }
    );

  }


  // ----------------------------------------------------------
  // PRINT
  // ----------------------------------------------------------

  const printBtn =
    document.getElementById(
      "printBtn"
    );


  if (printBtn) {

    printBtn.addEventListener(
      "click",
      async () => {

        await loadPage(
          "review-print"
        );

      }
    );

  }

}


// ============================================================
// CREATE NEW UNIT
// ============================================================

async function handleCreateNewUnit() {

  saveUnitPlan();


  const currentTitle =
    unitPlan.setup?.title?.trim() ||
    "your current unit";


  const confirmed =
    window.confirm(
      `Create a new unit?\n\n` +
      `"${currentTitle}" will remain saved in My Units.\n\n` +
      `A new blank unit will be created.`
    );


  if (!confirmed) {

    return;

  }


  createNewUnit();


  // Ensure the new unit starts at Step 1.
  updateUnitPlan(
    "ui.currentStep",
    "setup"
  );


  await loadPage(
    "setup"
  );


  showTemporaryHeaderMessage(
    "New unit created ✓"
  );

}


// ============================================================
// MY UNITS
// ============================================================

function showMyUnits() {

  saveUnitPlan();


  const pageContent =
    document.getElementById(
      "pageContent"
    );


  if (!pageContent) {

    return;

  }


  // My Units is outside the numbered planning sequence.
  document
    .querySelectorAll(
      ".step"
    )
    .forEach(
      (button) => {

        button.classList.remove(
          "active"
        );

      }
    );


  const units =
    getSavedUnits();


  const activeUnitId =
    getActiveUnitId();


  pageContent.innerHTML = `

    <section class="panel">

      <div class="page-heading">

        <div>

          <div class="eyebrow">
            Unit management
          </div>

          <h2>
            My Units
          </h2>

          <p>
            Open an existing unit, make a copy,
            or start a new unit plan.
          </p>

        </div>

        <div class="page-actions">

          <button
            class="primary"
            id="myUnitsCreateBtn"
            type="button"
          >
            + Create New Unit
          </button>

        </div>

      </div>


      <div
        id="savedUnitsList"
        class="saved-units-list"
      >

        ${
          buildSavedUnitsHtml(
            units,
            activeUnitId
          )
        }

      </div>

    </section>

  `;


  setupMyUnitsActions();

}


// ============================================================
// BUILD SAVED UNIT CARDS
// ============================================================

function buildSavedUnitsHtml(
  units,
  activeUnitId
) {

  if (
    !units.length
  ) {

    return `

      <div class="empty">

        <strong>
          No saved units yet.
        </strong>

        <p>
          Create your first unit to begin planning.
        </p>

      </div>

    `;

  }


  return units
    .map(
      (plan) => {

        const id =
          plan.meta?.id ||
          "";


        const title =
          plan.setup?.title?.trim() ||
          "Untitled Unit";


        const yearLevels =
          plan.setup
            ?.yearLevels
            ?.length
            ? plan.setup
                .yearLevels
                .join(", ")
            : "Year levels not selected";


        const learningAreas =
          plan.setup
            ?.learningAreas
            ?.length
            ? plan.setup
                .learningAreas
                .join(", ")
            : "Learning areas not selected";


        const term =
          plan.setup?.term ||
          "";


        const updated =
          formatUpdatedDate(
            plan.meta
              ?.updatedAt
          );


        const isActive =
          id ===
          activeUnitId;


        return `

          <article
            class="saved-unit-card ${
              isActive
                ? "active-unit-card"
                : ""
            }"
            data-unit-id="${escapeHtml(id)}"
          >

            <div class="saved-unit-main">

              <div class="saved-unit-title-row">

                <h3>
                  ${escapeHtml(title)}
                </h3>

                ${
                  isActive
                    ? `
                      <span class="unit-status">
                        Current unit
                      </span>
                    `
                    : ""
                }

              </div>


              <div class="saved-unit-meta">

                <span>
                  ${escapeHtml(yearLevels)}
                </span>

                <span>
                  ${escapeHtml(learningAreas)}
                </span>

                ${
                  term
                    ? `
                      <span>
                        ${escapeHtml(term)}
                      </span>
                    `
                    : ""
                }

              </div>


              <p class="saved-unit-updated">
                Last edited ${escapeHtml(updated)}
              </p>

            </div>


            <div class="saved-unit-actions">

              <button
                class="primary open-unit-btn"
                type="button"
                data-unit-id="${escapeHtml(id)}"
              >
                Open
              </button>

              <button
                class="ghost duplicate-unit-btn"
                type="button"
                data-unit-id="${escapeHtml(id)}"
              >
                Duplicate
              </button>

              <button
                class="ghost delete-unit-btn"
                type="button"
                data-unit-id="${escapeHtml(id)}"
              >
                Delete
              </button>

            </div>

          </article>

        `;

      }
    )
    .join("");

}


// ============================================================
// MY UNITS ACTIONS
// ============================================================

function setupMyUnitsActions() {

  // ----------------------------------------------------------
  // CREATE NEW
  // ----------------------------------------------------------

  const createButton =
    document.getElementById(
      "myUnitsCreateBtn"
    );


  if (createButton) {

    createButton.addEventListener(
      "click",
      async () => {

        await handleCreateNewUnit();

      }
    );

  }


  // ----------------------------------------------------------
  // OPEN
  // ----------------------------------------------------------

  document
    .querySelectorAll(
      ".open-unit-btn"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {

            const unitId =
              button.dataset.unitId;


            const selected =
              openUnit(
                unitId
              );


            if (!selected) {

              window.alert(
                "That unit could not be opened."
              );

              return;

            }


            updateUnitPlan(
              "ui.currentStep",
              "setup"
            );


            await loadPage(
              "setup"
            );

          }
        );

      }
    );


  // ----------------------------------------------------------
  // DUPLICATE
  // ----------------------------------------------------------

  document
    .querySelectorAll(
      ".duplicate-unit-btn"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {

            const unitId =
              button.dataset.unitId;


            const duplicate =
              duplicateUnit(
                unitId
              );


            if (!duplicate) {

              window.alert(
                "That unit could not be duplicated."
              );

              return;

            }


            updateUnitPlan(
              "ui.currentStep",
              "setup"
            );


            await loadPage(
              "setup"
            );


            showTemporaryHeaderMessage(
              "Unit duplicated ✓"
            );

          }
        );

      }
    );


  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------

  document
    .querySelectorAll(
      ".delete-unit-btn"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const unitId =
              button.dataset.unitId;


            const units =
              getSavedUnits();


            const selected =
              units.find(
                (plan) =>
                  plan.meta?.id ===
                  unitId
              );


            const title =
              selected
                ?.setup
                ?.title
                ?.trim() ||
              "this unit";


            const confirmed =
              window.confirm(
                `Delete "${title}"?\n\n` +
                `This will remove the saved unit from this device.`
              );


            if (!confirmed) {

              return;

            }


            deleteUnit(
              unitId
            );


            showMyUnits();

          }
        );

      }
    );

}


// ============================================================
// FORMAT UPDATED DATE
// ============================================================

function formatUpdatedDate(
  dateValue
) {

  if (!dateValue) {

    return "recently";

  }


  const date =
    new Date(
      dateValue
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "recently";

  }


  const now =
    new Date();


  const sameDay =
    date.toDateString() ===
    now.toDateString();


  if (sameDay) {

    return "today";

  }


  const yesterday =
    new Date(
      now
    );


  yesterday.setDate(
    now.getDate() - 1
  );


  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {

    return "yesterday";

  }


  return date.toLocaleDateString(
    "en-AU",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}


// ============================================================
// SAVE MESSAGE
// ============================================================

function showSaveMessage() {

  const button =
    document.getElementById(
      "saveBtn"
    );


  if (!button) {

    return;

  }


  const originalText =
    button.textContent;


  button.textContent =
    "Saved ✓";


  setTimeout(
    () => {

      button.textContent =
        originalText;

    },
    1400
  );

}


// ============================================================
// TEMPORARY HEADER MESSAGE
// ============================================================

function showTemporaryHeaderMessage(
  message
) {

  const saveButton =
    document.getElementById(
      "saveBtn"
    );


  if (!saveButton) {

    return;

  }


  const originalText =
    saveButton.textContent;


  saveButton.textContent =
    message;


  setTimeout(
    () => {

      saveButton.textContent =
        originalText;

    },
    1600
  );

}


// ============================================================
// HTML ESCAPING
// ============================================================

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}
