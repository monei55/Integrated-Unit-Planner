import {
  unitPlan,
  updateUnitPlan
} from "./state.js";


// ============================================================
// STATIC OPTIONS
// ============================================================

const YEAR_LEVELS = [
  "Foundation",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6"
];


const LEARNING_AREAS = [
  "English",
  "Mathematics",
  "Science",
  "HASS",
  "HPE",
  "Design and Technologies",
  "Digital Technologies",
  "Dance",
  "Drama",
  "Media Arts",
  "Music",
  "Visual Arts"
];


// ============================================================
// WHOLE-SCHOOL PLAN DEFAULTS
// ============================================================

const SCHOOL_PLAN = {

  "Term 1": {
    context: "HASS — History",
    contextSubject: "HASS",
    technology: "Digital Technologies",
    arts: "Drama",
    hpe: "HPE — Health"
  },

  "Term 2": {
    context: "Science — Biological sciences / Earth and space sciences",
    contextSubject: "Science",
    technology: "Digital Technologies",
    arts: "Visual Arts / Music",
    hpe: "HPE — Health and Physical"
  },

  "Term 3": {
    context: "Science — Chemical sciences / Physical sciences",
    contextSubject: "Science",
    technology: "Design and Technologies",
    arts: "Media Arts",
    hpe: "HPE — Health"
  },

  "Term 4": {
    context: "HASS — Geography",
    contextSubject: "HASS",
    technology: "",
    arts: "Dance",
    hpe: "HPE — Physical"
  }

};


const ENGLISH_WRITING_FOCUS = {

  "Term 1": {
    Foundation: "Imaginative text — retells",
    "Year 1": "Imaginative text — retells",
    "Year 2": "Imaginative text",
    "Year 3": "Imaginative text",
    "Year 4": "Imaginative text",
    "Year 5": "Imaginative text",
    "Year 6": "Imaginative text"
  },

  "Term 2": {
    Foundation: "Information report",
    "Year 1": "Information report",
    "Year 2": "Information report",
    "Year 3": "Information report",
    "Year 4": "Information report",
    "Year 5": "Information report",
    "Year 6": "Information report"
  },

  "Term 3": {
    Foundation: "Persuasive (summative) + Procedural (formative)",
    "Year 1": "Persuasive (summative) + Procedural (formative)",
    "Year 2": "Persuasive (summative) + Procedural (formative)",
    "Year 3": "Persuasive (summative) + Procedural (formative)",
    "Year 4": "Persuasive (summative) + Procedural (formative)",
    "Year 5": "Persuasive (summative) + Procedural (formative)",
    "Year 6": "Persuasive (summative) + Procedural (formative)"
  },

  "Term 4": {
    Foundation: "Recount (summative) + Narrative (formative)",
    "Year 1": "Recount (summative) + Narrative (formative)",
    "Year 2": "Narrative",
    "Year 3": "Narrative",
    "Year 4": "Narrative",
    "Year 5": "Narrative",
    "Year 6": "Narrative"
  }

};


// ============================================================
// PAGE INITIALISATION
// ============================================================

export function initSetupPage() {

  populateBasicFields();

  renderYearLevelChoices();
  renderLearningAreaChoices();

  renderSchoolPlan();
  renderTeachingAllocations();

  setupFieldListeners();
  setupSuggestedAreaButton();

}


// ============================================================
// BASIC FIELDS
// ============================================================

function populateBasicFields() {

  const setup = unitPlan.setup;

  document.getElementById("unitTitle").value =
    setup.title || "";

  document.getElementById("term").value =
    setup.term || "Term 1";

  document.getElementById("durationWeeks").value =
    setup.durationWeeks || 8;

  document.getElementById("unitContext").value =
    setup.context || "";

}


function setupFieldListeners() {

  document
    .getElementById("unitTitle")
    .addEventListener("input", (event) => {
      updateUnitPlan(
        "setup.title",
        event.target.value
      );
    });


  document
    .getElementById("term")
    .addEventListener("change", (event) => {

      updateUnitPlan(
        "setup.term",
        event.target.value
      );

      renderSchoolPlan();

    });


  document
    .getElementById("durationWeeks")
    .addEventListener("change", (event) => {

      updateUnitPlan(
        "setup.durationWeeks",
        Number(event.target.value)
      );

    });


  document
    .getElementById("unitContext")
    .addEventListener("input", (event) => {

      updateUnitPlan(
        "setup.context",
        event.target.value
      );

    });

}


// ============================================================
// YEAR LEVELS
// ============================================================

function renderYearLevelChoices() {

  const container =
    document.getElementById(
      "yearLevelChoices"
    );

  container.innerHTML = "";

  YEAR_LEVELS.forEach((yearLevel) => {

    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "chip";
    button.textContent = yearLevel;

    const selected =
      unitPlan.setup.yearLevels.includes(
        yearLevel
      );

    button.classList.toggle(
      "selected",
      selected
    );

    button.addEventListener(
      "click",
      () => {

        toggleYearLevel(yearLevel);

        renderYearLevelChoices();
        renderSchoolPlan();

      }
    );

    container.appendChild(button);

  });

}


function toggleYearLevel(yearLevel) {

  const current =
    [...unitPlan.setup.yearLevels];

  const index =
    current.indexOf(yearLevel);

  if (index >= 0) {
    current.splice(index, 1);
  } else {
    current.push(yearLevel);
  }

  updateUnitPlan(
    "setup.yearLevels",
    current
  );

}


// ============================================================
// LEARNING AREAS
// ============================================================

function renderLearningAreaChoices() {

  const container =
    document.getElementById(
      "learningAreaChoices"
    );

  container.innerHTML = "";

  LEARNING_AREAS.forEach(
    (learningArea) => {

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "chip";
      button.textContent =
        learningArea;

      const selected =
        unitPlan.setup.learningAreas.includes(
          learningArea
        );

      button.classList.toggle(
        "selected",
        selected
      );

      button.addEventListener(
        "click",
        () => {

          toggleLearningArea(
            learningArea
          );

          renderLearningAreaChoices();
          renderTeachingAllocations();

        }
      );

      container.appendChild(button);

    }
  );

}


function toggleLearningArea(
  learningArea
) {

  const current =
    [...unitPlan.setup.learningAreas];

  const index =
    current.indexOf(learningArea);

  if (index >= 0) {

    current.splice(index, 1);

  } else {

    current.push(learningArea);

  }

  updateUnitPlan(
    "setup.learningAreas",
    current
  );

}


// ============================================================
// WHOLE-SCHOOL PLAN
// ============================================================

function renderSchoolPlan() {

  const container =
    document.getElementById(
      "schoolPlanSuggestions"
    );

  const term =
    unitPlan.setup.term || "Term 1";

  const plan =
    SCHOOL_PLAN[term];

  const years =
    unitPlan.setup.yearLevels;


  const englishRows =
    years.length
      ? years
          .map((year) => {

            const focus =
              ENGLISH_WRITING_FOCUS[
                term
              ]?.[year] ||
              "Refer to year plan";

            return `
              <div>
                <strong>${year}</strong>
                <span>${focus}</span>
              </div>
            `;

          })
          .join("")
      : `
          <div>
            <strong>English</strong>
            <span>
              Select year level(s)
            </span>
          </div>
        `;


  container.innerHTML = `

    <div class="
      school-plan-item
      school-plan-english
    ">

      <strong>
        English writing focus
      </strong>

      <div class="year-genre-list">
        ${englishRows}
      </div>

    </div>


    <div class="school-plan-item">

      <strong>
        Knowledge / context
      </strong>

      <span>
        ${plan.context}
      </span>

      <small>
        Dedicated disciplinary teaching
        with additional content able to be
        integrated through English.
      </small>

    </div>


    <div class="school-plan-item">

      <strong>
        Technologies
      </strong>

      <span>
        ${
          plan.technology ||
          "No whole-school assessed Technologies focus specified"
        }
      </span>

    </div>


    <div class="school-plan-item">

      <strong>
        Possible Arts connection
      </strong>

      <span>
        ${plan.arts}
      </span>

      <small>
        Use only where the Arts curriculum
        is explicitly taught and evidenced.
      </small>

    </div>


    <div class="school-plan-item">

      <strong>HPE</strong>

      <span>
        ${plan.hpe}
      </span>

    </div>


    <div class="school-plan-item">

      <strong>
        Planning principle
      </strong>

      <span>
        English + ${plan.contextSubject}
        as the core integrated unit
      </span>

      <small>
        Technologies and Arts can be
        connected where authentic.
      </small>

    </div>

  `;

}


function setupSuggestedAreaButton() {

  document
    .getElementById(
      "applySuggestedAreas"
    )
    .addEventListener(
      "click",
      () => {

        const term =
          unitPlan.setup.term ||
          "Term 1";

        const plan =
          SCHOOL_PLAN[term];

        const suggested = [
          "English",
          plan.contextSubject
        ];

        if (plan.technology) {
          suggested.push(
            plan.technology
          );
        }

        const merged =
          [
            ...new Set([
              ...unitPlan.setup.learningAreas,
              ...suggested
            ])
          ];

        updateUnitPlan(
          "setup.learningAreas",
          merged
        );

        renderLearningAreaChoices();
        renderTeachingAllocations();

      }
    );

}


// ============================================================
// TEACHING ALLOCATIONS
// ============================================================

function renderTeachingAllocations() {

  const container =
    document.getElementById(
      "teachingAllocationGrid"
    );

  container.innerHTML = "";

  const areas =
    unitPlan.setup.learningAreas;

  if (!areas.length) {

    container.innerHTML = `
      <div class="empty">
        Select learning areas above to
        configure weekly teaching
        allocations.
      </div>
    `;

    return;

  }


  areas.forEach((learningArea) => {

    const allocation =
      getAllocation(learningArea);

    const card =
      document.createElement("div");

    card.className =
      "allocation-card";

    card.innerHTML = `

      <strong>
        ${learningArea}
      </strong>

      <div class="allocation-row">

        <label>
          Lessons / week

          <input
            type="number"
            min="0"
            max="20"
            value="${allocation.lessonsPerWeek}"
            data-field="lessons"
          >

        </label>

        <label>
          Minutes / lesson

          <input
            type="number"
            min="5"
            max="180"
            value="${allocation.minutesPerLesson}"
            data-field="minutes"
          >

        </label>

      </div>

      ${
        learningArea === "HASS" ||
        learningArea === "Science"
          ? `
            <label class="topgap">

              <span>
                <input
                  type="checkbox"
                  data-field="integrated"
                  ${
                    allocation.integrated
                      ? "checked"
                      : ""
                  }
                >

                Additional curriculum
                content integrated through
                English
              </span>

            </label>
          `
          : ""
      }

    `;


    card
      .querySelector(
        '[data-field="lessons"]'
      )
      .addEventListener(
        "change",
        (event) => {

          updateAllocation(
            learningArea,
            "lessonsPerWeek",
            Number(
              event.target.value
            )
          );

        }
      );


    card
      .querySelector(
        '[data-field="minutes"]'
      )
      .addEventListener(
        "change",
        (event) => {

          updateAllocation(
            learningArea,
            "minutesPerLesson",
            Number(
              event.target.value
            )
          );

        }
      );


    const integratedInput =
      card.querySelector(
        '[data-field="integrated"]'
      );

    if (integratedInput) {

      integratedInput.addEventListener(
        "change",
        (event) => {

          updateAllocation(
            learningArea,
            "integrated",
            event.target.checked
          );

        }
      );

    }


    container.appendChild(card);

  });

}


function getAllocation(
  learningArea
) {

  const saved =
    unitPlan.setup
      .teachingAllocations[
        learningArea
      ];

  if (saved) {
    return saved;
  }


  if (learningArea === "English") {

    return {
      lessonsPerWeek: 5,
      minutesPerLesson: 60,
      integrated: false
    };

  }


  if (
    learningArea === "HASS" ||
    learningArea === "Science"
  ) {

    return {
      lessonsPerWeek: 1,
      minutesPerLesson: 80,
      integrated: true
    };

  }


  return {
    lessonsPerWeek: 1,
    minutesPerLesson: 60,
    integrated: false
  };

}


function updateAllocation(
  learningArea,
  field,
  value
) {

  const allocations = {
    ...unitPlan.setup
      .teachingAllocations
  };

  const existing = {
    ...getAllocation(
      learningArea
    )
  };

  existing[field] = value;

  allocations[
    learningArea
  ] = existing;

  updateUnitPlan(
    "setup.teachingAllocations",
    allocations
  );

}