// ============================================================
// Integrated Unit Planner
// Shared application state
// ============================================================

const STORAGE_KEY = "integratedUnitPlanner";

export const DEFAULT_UNIT_PLAN = {
  // ----------------------------------------------------------
  // STEP 1 — UNIT SETUP
  // ----------------------------------------------------------
  setup: {
    title: "",
    term: "Term 1",
    durationWeeks: 8,
    context: "",
    yearLevels: [],
    learningAreas: [],

    teachingAllocations: {
      English: {
        lessonsPerWeek: 5,
        minutesPerLesson: 60,
        integrated: false
      },

      HASS: {
        lessonsPerWeek: 1,
        minutesPerLesson: 80,
        integrated: true
      },

      Science: {
        lessonsPerWeek: 1,
        minutesPerLesson: 80,
        integrated: true
      }
    }
  },

  // ----------------------------------------------------------
  // STEP 2 — CURRICULUM
  // ----------------------------------------------------------
  curriculum: {
    // Store the codes of selected Achievement Standard aspects.
    selectedStandards: [],

    // Optional teacher notes against particular aspects.
    aspectNotes: {}
  },

  // ----------------------------------------------------------
  // STEP 3 — INTEGRATION
  // ----------------------------------------------------------
  integration: {
    bigIdea: "",
    authenticContext: "",
    terminology: "",
    notes: "",

    // Connections explicitly accepted by the teacher.
    confirmedConnections: []
  },

  // ----------------------------------------------------------
  // STEP 4 — ASSESSMENT
  //
  // IMPORTANT:
  // Assessments are stored separately for each year level.
  //
  // Example:
  // assessments.byYear["Year 2"]
  // assessments.byYear["Year 3"]
  // ----------------------------------------------------------
  assessments: {
    activeYear: "",
    byYear: {}
  },

  // ----------------------------------------------------------
  // STEP 5 — LEARNING SEQUENCE
  // ----------------------------------------------------------
  sequence: {
    know: [],
    understand: [],
    do: [],

    weeks: [],

    readinessChecks: {}
  },

  // ----------------------------------------------------------
  // STEP 6 — DAILY REVIEW
  // ----------------------------------------------------------
  dailyReview: {
    vocabulary: "",
    knowledge: "",
    fluency: "",
    application: "",
    misconceptions: "",
    questions: ""
  },

  // ----------------------------------------------------------
  // STEP 7 — DIFFERENTIATION
  // ----------------------------------------------------------
  differentiation: {
    identifiedNeeds: [],
    access: "",
    scaffolding: "",
    response: "",
    extension: ""
  },

  // ----------------------------------------------------------
  // STEP 8 — LEARNING WALL / BUMP-IT-UP
  // ----------------------------------------------------------
  learningWall: {
    learningIntentions: "",
    successCriteria: "",
    terminology: "",
    anchorCharts: "",

    bumpItUp: {
      focus: "",
      exemplars: "",
      discernibleDifferences: "",
      feedbackPrompts: ""
    }
  },

  // ----------------------------------------------------------
  // STEP 9 — REVIEW / PRINT
  // ----------------------------------------------------------
  review: {
    teacherNotes: ""
  },

  // ----------------------------------------------------------
  // UI STATE
  // This is interface information rather than curriculum data.
  // ----------------------------------------------------------
  ui: {
    currentStep: "setup"
  }
};


// ============================================================
// ACTIVE STATE
// ============================================================

export let unitPlan = createFreshPlan();


// ============================================================
// HELPERS
// ============================================================

function createFreshPlan() {
  return structuredClone(DEFAULT_UNIT_PLAN);
}


// Merge saved information into the current structure.
// This means we can add new fields in later versions without
// breaking previously saved unit plans.
function deepMerge(target, source) {
  if (!source || typeof source !== "object") {
    return target;
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }

      deepMerge(target[key], sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
}


// ============================================================
// SAVE / LOAD
// ============================================================

export function saveUnitPlan() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unitPlan));
}


export function loadUnitPlan() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return unitPlan;
  }

  try {
    const parsed = JSON.parse(saved);

    const fresh = createFreshPlan();

    unitPlan = deepMerge(fresh, parsed);

    notifyStateChanged();

    return unitPlan;
  } catch (error) {
    console.error("Unable to load saved unit plan:", error);

    return unitPlan;
  }
}


export function resetUnitPlan() {
  unitPlan = createFreshPlan();

  localStorage.removeItem(STORAGE_KEY);

  notifyStateChanged();
}


// ============================================================
// GENERAL STATE UPDATE
// ============================================================

export function updateUnitPlan(path, value) {
  const parts = path.split(".");

  let current = unitPlan;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    if (!current[part]) {
      current[part] = {};
    }

    current = current[part];
  }

  current[parts[parts.length - 1]] = value;

  saveUnitPlan();
  notifyStateChanged();
}


// ============================================================
// YEAR-LEVEL ASSESSMENTS
// ============================================================

export function getAssessment(yearLevel) {
  if (!yearLevel) return null;

  if (!unitPlan.assessments.byYear[yearLevel]) {
    unitPlan.assessments.byYear[yearLevel] = createAssessmentTemplate(yearLevel);
  }

  return unitPlan.assessments.byYear[yearLevel];
}


export function createAssessmentTemplate(yearLevel) {
  return {
    yearLevel,

    title: "",
    technique: "Project",
    purpose: "",
    context: "",
    taskEvidence: "",
    conditions: "",

    components: [],

    draftTask: [],

    gtMj: {},

    notes: "",

    completed: false
  };
}


export function setActiveAssessmentYear(yearLevel) {
  unitPlan.assessments.activeYear = yearLevel;

  getAssessment(yearLevel);

  saveUnitPlan();
  notifyStateChanged();
}


export function completeAssessment(yearLevel) {
  const assessment = getAssessment(yearLevel);

  if (!assessment) return;

  assessment.completed = true;

  saveUnitPlan();
  notifyStateChanged();
}


// ============================================================
// ASSESSMENT COMPONENTS
// ============================================================

export function addAssessmentComponent(yearLevel) {
  const assessment = getAssessment(yearLevel);

  const component = {
    id: crypto.randomUUID(),

    title: "",

    selectedStandardCodes: [],

    cognitiveDemands: [],

    evidenceFormat: "",

    questionText: "",

    integrationConnections: [],

    teacherNotes: ""
  };

  assessment.components.push(component);

  saveUnitPlan();
  notifyStateChanged();

  return component;
}


export function removeAssessmentComponent(yearLevel, componentId) {
  const assessment = getAssessment(yearLevel);

  assessment.components = assessment.components.filter(
    (component) => component.id !== componentId
  );

  saveUnitPlan();
  notifyStateChanged();
}


// ============================================================
// STATE CHANGE LISTENERS
// ============================================================

const listeners = new Set();


export function subscribeToState(callback) {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}


function notifyStateChanged() {
  listeners.forEach((callback) => {
    callback(unitPlan);
  });
}


// ============================================================
// DEBUGGING
// ============================================================

export function showCurrentState() {
  console.log("Current Integrated Unit Planner state:");
  console.log(unitPlan);
}