import {
  unitPlan,
  saveUnitPlan,
  loadUnitPlan,
  updateUnitPlan
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

document.addEventListener("DOMContentLoaded", async () => {

  loadUnitPlan();

  setupNavigation();
  setupHeaderActions();

  const startingPage =
    unitPlan.ui.currentStep || "setup";

  await loadPage(startingPage);

});


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

  const buttons =
    document.querySelectorAll(".step");

  buttons.forEach((button) => {

    button.addEventListener("click", async () => {

      const page =
        button.dataset.page;

      await loadPage(page);

    });

  });

}


async function loadPage(pageName) {

  const pageContent =
    document.getElementById("pageContent");

  const path =
    PAGE_PATHS[pageName];

  if (!path) {
    console.error(
      `Unknown planner page: ${pageName}`
    );
    return;
  }

  try {

    const response =
      await fetch(path);

    if (!response.ok) {
      throw new Error(
        `Unable to load ${path}`
      );
    }

    const html =
      await response.text();

    pageContent.innerHTML = html;

    setActiveNavigation(pageName);

    updateUnitPlan(
      "ui.currentStep",
      pageName
    );

    await initialisePage(pageName);

  } catch (error) {

    console.error(error);

    pageContent.innerHTML = `
      <section class="panel">
        <div class="empty">
          <strong>
            This planner page could not be loaded.
          </strong>

          <p>
            ${error.message}
          </p>
        </div>
      </section>
    `;

  }

}


function setActiveNavigation(pageName) {

  document
    .querySelectorAll(".step")
    .forEach((button) => {

      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );

    });

}


// ============================================================
// PAGE INITIALISATION
// ============================================================

async function initialisePage(pageName) {

  switch (pageName) {

    case "setup": {
      const module =
        await import("./setup.js");

      module.initSetupPage();
      break;
    }

    case "curriculum": {
      const module =
        await import("./curriculum.js");

      module.initCurriculumPage();
      break;
    }

    case "integration": {
      const module =
        await import("./integration.js");

      module.initIntegrationPage();
      break;
    }

    case "assessment": {
      const module =
        await import("./assessment.js");

      module.initAssessmentPage();
      break;
    }

    case "sequence": {
      const module =
        await import("./sequence.js");

      module.initSequencePage();
      break;
    }

    case "daily-review": {
      const module =
        await import("./daily-review.js");

      module.initDailyReviewPage();
      break;
    }

    case "differentiation": {
      const module =
        await import("./differentiation.js");

      module.initDifferentiationPage();
      break;
    }

    case "learning-wall": {
      const module =
        await import("./learning-wall.js");

      module.initLearningWallPage();
      break;
    }

    case "review-print": {
      const module =
        await import("./print.js");

      module.initPrintPage();
      break;
    }

  }

}


// ============================================================
// HEADER ACTIONS
// ============================================================

function setupHeaderActions() {

  document
    .getElementById("saveBtn")
    .addEventListener("click", () => {

      saveUnitPlan();

      showSaveMessage();

    });


  document
    .getElementById("printBtn")
    .addEventListener("click", async () => {

      await loadPage("review-print");

    });

}


function showSaveMessage() {

  const button =
    document.getElementById("saveBtn");

  const originalText =
    button.textContent;

  button.textContent =
    "Saved ✓";

  setTimeout(() => {

    button.textContent =
      originalText;

  }, 1400);

}