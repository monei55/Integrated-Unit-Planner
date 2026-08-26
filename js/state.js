// ============================================================
// Integrated Unit Planner
// Shared application state
//
// MULTI-UNIT VERSION
// ============================================================


// ============================================================
// STORAGE KEYS
// ============================================================

// New multi-unit storage.
const UNITS_STORAGE_KEY =
  "integratedUnitPlanner.units";

const ACTIVE_UNIT_STORAGE_KEY =
  "integratedUnitPlanner.activeUnitId";


// Old single-unit storage.
// Kept temporarily so an existing unit can be migrated rather
// than lost when the planner upgrades.
const LEGACY_STORAGE_KEY =
  "integratedUnitPlanner";


// ============================================================
// DEFAULT UNIT PLAN
// ============================================================

export const DEFAULT_UNIT_PLAN = {

  // ----------------------------------------------------------
  // UNIT META
  // ----------------------------------------------------------

  meta: {
    id: "",
    createdAt: "",
    updatedAt: ""
  },


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

    selectedStandards: [],

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

    integrationNotes: "",

    vocabularyPlan: [],

    vocabularySignature: "",

    vocabularyEditedByTeacher: false,

    confirmedConnections: [],

    connections: []

  },


  // ----------------------------------------------------------
  // STEP 4 — ASSESSMENT & MARKING GUIDE
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
  // ----------------------------------------------------------

  ui: {

    currentStep: "setup"

  }

};


// ============================================================
// ACTIVE STATE
// ============================================================

export let unitPlan =
  createFreshPlan();


// ============================================================
// HELPERS
// ============================================================

function createId() {

  if (
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {

    return crypto.randomUUID();

  }


  return (
    "unit-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2)
  );

}


// ============================================================
// CREATE FRESH PLAN
// ============================================================

function createFreshPlan() {

  const plan =
    structuredClone(
      DEFAULT_UNIT_PLAN
    );


  const now =
    new Date().toISOString();


  plan.meta.id =
    createId();


  plan.meta.createdAt =
    now;


  plan.meta.updatedAt =
    now;


  return plan;

}


// ============================================================
// DEEP MERGE
// ============================================================

function deepMerge(
  target,
  source
) {

  if (
    !source ||
    typeof source !== "object"
  ) {

    return target;

  }


  Object.keys(
    source
  )
    .forEach(
      (key) => {

        const sourceValue =
          source[key];


        if (
          sourceValue &&
          typeof sourceValue === "object" &&
          !Array.isArray(
            sourceValue
          )
        ) {

          if (
            !target[key] ||
            typeof target[key] !== "object" ||
            Array.isArray(
              target[key]
            )
          ) {

            target[key] = {};

          }


          deepMerge(
            target[key],
            sourceValue
          );

        } else {

          target[key] =
            sourceValue;

        }

      }
    );


  return target;

}


// ============================================================
// NORMALISE SAVED PLAN
// ============================================================

function normalisePlan(
  savedPlan
) {

  const fresh =
    createFreshPlan();


  const merged =
    deepMerge(
      fresh,
      savedPlan || {}
    );


  if (
    !merged.meta ||
    typeof merged.meta !== "object"
  ) {

    merged.meta = {};

  }


  if (
    !merged.meta.id
  ) {

    merged.meta.id =
      createId();

  }


  if (
    !merged.meta.createdAt
  ) {

    merged.meta.createdAt =
      new Date().toISOString();

  }


  if (
    !merged.meta.updatedAt
  ) {

    merged.meta.updatedAt =
      merged.meta.createdAt;

  }


  return merged;

}


// ============================================================
// READ SAVED UNITS
// ============================================================

function readUnitsFromStorage() {

  const saved =
    localStorage.getItem(
      UNITS_STORAGE_KEY
    );


  if (!saved) {

    return {};

  }


  try {

    const parsed =
      JSON.parse(
        saved
      );


    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {

      return {};

    }


    return parsed;

  } catch (error) {

    console.error(
      "Unable to read saved units:",
      error
    );


    return {};

  }

}


// ============================================================
// WRITE SAVED UNITS
// ============================================================

function writeUnitsToStorage(
  units
) {

  localStorage.setItem(
    UNITS_STORAGE_KEY,
    JSON.stringify(
      units
    )
  );

}


// ============================================================
// ACTIVE UNIT ID
// ============================================================

export function getActiveUnitId() {

  return (
    localStorage.getItem(
      ACTIVE_UNIT_STORAGE_KEY
    ) ||
    unitPlan?.meta?.id ||
    ""
  );

}


// ============================================================
// SET ACTIVE UNIT ID
// ============================================================

function setActiveUnitId(
  unitId
) {

  if (!unitId) {

    localStorage.removeItem(
      ACTIVE_UNIT_STORAGE_KEY
    );


    return;

  }


  localStorage.setItem(
    ACTIVE_UNIT_STORAGE_KEY,
    unitId
  );

}


// ============================================================
// SAVE ACTIVE UNIT
// ============================================================

export function saveUnitPlan() {

  if (
    !unitPlan.meta
  ) {

    unitPlan.meta = {};

  }


  if (
    !unitPlan.meta.id
  ) {

    unitPlan.meta.id =
      createId();

  }


  if (
    !unitPlan.meta.createdAt
  ) {

    unitPlan.meta.createdAt =
      new Date().toISOString();

  }


  unitPlan.meta.updatedAt =
    new Date().toISOString();


  const units =
    readUnitsFromStorage();


  units[
    unitPlan.meta.id
  ] =
    structuredClone(
      unitPlan
    );


  writeUnitsToStorage(
    units
  );


  setActiveUnitId(
    unitPlan.meta.id
  );

}


// ============================================================
// LOAD ACTIVE UNIT
// ============================================================

export function loadUnitPlan() {

  migrateLegacyUnitIfNeeded();


  const units =
    readUnitsFromStorage();


  const activeId =
    localStorage.getItem(
      ACTIVE_UNIT_STORAGE_KEY
    );


  // ----------------------------------------------------------
  // Load requested active unit
  // ----------------------------------------------------------

  if (
    activeId &&
    units[activeId]
  ) {

    unitPlan =
      normalisePlan(
        units[activeId]
      );


    notifyStateChanged();


    return unitPlan;

  }


  // ----------------------------------------------------------
  // No active ID, but saved units exist.
  // Load most recently edited unit.
  // ----------------------------------------------------------

  const savedUnits =
    Object.values(
      units
    );


  if (
    savedUnits.length
  ) {

    savedUnits.sort(
      (
        a,
        b
      ) => {

        const aTime =
          new Date(
            a?.meta?.updatedAt ||
            a?.meta?.createdAt ||
            0
          )
            .getTime();


        const bTime =
          new Date(
            b?.meta?.updatedAt ||
            b?.meta?.createdAt ||
            0
          )
            .getTime();


        return (
          bTime -
          aTime
        );

      }
    );


    unitPlan =
      normalisePlan(
        savedUnits[0]
      );


    setActiveUnitId(
      unitPlan.meta.id
    );


    notifyStateChanged();


    return unitPlan;

  }


  // ----------------------------------------------------------
  // Nothing saved yet.
  //
  // Keep a fresh blank plan in memory.
  // We DO NOT save it until the teacher starts using it.
  // ----------------------------------------------------------

  unitPlan =
    createFreshPlan();


  setActiveUnitId(
    unitPlan.meta.id
  );


  notifyStateChanged();


  return unitPlan;

}


// ============================================================
// MIGRATE OLD SINGLE-UNIT STORAGE
// ============================================================

function migrateLegacyUnitIfNeeded() {

  const existingUnits =
    readUnitsFromStorage();


  if (
    Object.keys(
      existingUnits
    ).length
  ) {

    return;

  }


  const legacy =
    localStorage.getItem(
      LEGACY_STORAGE_KEY
    );


  if (!legacy) {

    return;

  }


  try {

    const parsed =
      JSON.parse(
        legacy
      );


    const migrated =
      normalisePlan(
        parsed
      );


    migrated.meta.updatedAt =
      new Date().toISOString();


    existingUnits[
      migrated.meta.id
    ] =
      migrated;


    writeUnitsToStorage(
      existingUnits
    );


    setActiveUnitId(
      migrated.meta.id
    );


    // Keep a backup of the old data for now.
    // We can remove this migration backup later after testing.

    localStorage.setItem(
      `${LEGACY_STORAGE_KEY}.migratedBackup`,
      legacy
    );


    localStorage.removeItem(
      LEGACY_STORAGE_KEY
    );


    console.log(
      "Existing unit successfully migrated to multi-unit storage."
    );

  } catch (error) {

    console.error(
      "Unable to migrate existing unit:",
      error
    );

  }

}


// ============================================================
// GET ALL SAVED UNITS
// ============================================================

export function getSavedUnits() {

  const units =
    readUnitsFromStorage();


  return Object.values(
    units
  )
    .map(
      (plan) =>
        normalisePlan(
          plan
        )
    )
    .sort(
      (
        a,
        b
      ) => {

        const aTime =
          new Date(
            a.meta.updatedAt ||
            a.meta.createdAt ||
            0
          )
            .getTime();


        const bTime =
          new Date(
            b.meta.updatedAt ||
            b.meta.createdAt ||
            0
          )
            .getTime();


        return (
          bTime -
          aTime
        );

      }
    );

}


// ============================================================
// CREATE NEW UNIT
// ============================================================

export function createNewUnit() {

  // Save the current unit first IF it contains teacher work.
  if (
    hasMeaningfulUnitContent(
      unitPlan
    )
  ) {

    saveUnitPlan();

  }


  unitPlan =
    createFreshPlan();


  setActiveUnitId(
    unitPlan.meta.id
  );


  // Save the new blank unit so it officially exists in My Units.
  saveUnitPlan();


  notifyStateChanged();


  return unitPlan;

}


// ============================================================
// OPEN SAVED UNIT
// ============================================================

export function openUnit(
  unitId
) {

  if (!unitId) {

    return null;

  }


  // Save current work before switching.
  if (
    unitPlan?.meta?.id &&
    hasMeaningfulUnitContent(
      unitPlan
    )
  ) {

    saveUnitPlan();

  }


  const units =
    readUnitsFromStorage();


  const selected =
    units[unitId];


  if (!selected) {

    console.warn(
      "Unable to open unit. Unit not found:",
      unitId
    );


    return null;

  }


  unitPlan =
    normalisePlan(
      selected
    );


  setActiveUnitId(
    unitPlan.meta.id
  );


  notifyStateChanged();


  return unitPlan;

}


// ============================================================
// DUPLICATE UNIT
// ============================================================

export function duplicateUnit(
  unitId
) {

  const units =
    readUnitsFromStorage();


  const source =
    units[unitId];


  if (!source) {

    return null;

  }


  const duplicate =
    normalisePlan(
      structuredClone(
        source
      )
    );


  const now =
    new Date().toISOString();


  duplicate.meta.id =
    createId();


  duplicate.meta.createdAt =
    now;


  duplicate.meta.updatedAt =
    now;


  const originalTitle =
    duplicate.setup?.title?.trim();


  if (
    originalTitle
  ) {

    duplicate.setup.title =
      `${originalTitle} — Copy`;

  } else {

    duplicate.setup.title =
      "Untitled Unit — Copy";

  }


  // Do not retain interface location from original.
  duplicate.ui.currentStep =
    "setup";


  units[
    duplicate.meta.id
  ] =
    duplicate;


  writeUnitsToStorage(
    units
  );


  unitPlan =
    duplicate;


  setActiveUnitId(
    duplicate.meta.id
  );


  notifyStateChanged();


  return unitPlan;

}


// ============================================================
// DELETE UNIT
// ============================================================

export function deleteUnit(
  unitId
) {

  if (!unitId) {

    return false;

  }


  const units =
    readUnitsFromStorage();


  if (
    !units[unitId]
  ) {

    return false;

  }


  delete units[
    unitId
  ];


  writeUnitsToStorage(
    units
  );


  const deletingActiveUnit =
    unitPlan?.meta?.id ===
    unitId;


  if (
    deletingActiveUnit
  ) {

    const remaining =
      Object.values(
        units
      );


    if (
      remaining.length
    ) {

      remaining.sort(
        (
          a,
          b
        ) => {

          const aTime =
            new Date(
              a?.meta?.updatedAt ||
              0
            )
              .getTime();


          const bTime =
            new Date(
              b?.meta?.updatedAt ||
              0
            )
              .getTime();


          return (
            bTime -
            aTime
          );

        }
      );


      unitPlan =
        normalisePlan(
          remaining[0]
        );


      setActiveUnitId(
        unitPlan.meta.id
      );

    } else {

      unitPlan =
        createFreshPlan();


      setActiveUnitId(
        unitPlan.meta.id
      );

    }


    notifyStateChanged();

  }


  return true;

}


// ============================================================
// RESET CURRENT UNIT
// ============================================================
//
// IMPORTANT:
// This now resets ONLY the currently active unit.
// It does NOT delete every saved unit.
//
// ============================================================

export function resetUnitPlan() {

  const currentId =
    unitPlan?.meta?.id;


  const units =
    readUnitsFromStorage();


  if (
    currentId &&
    units[currentId]
  ) {

    delete units[
      currentId
    ];


    writeUnitsToStorage(
      units
    );

  }


  unitPlan =
    createFreshPlan();


  setActiveUnitId(
    unitPlan.meta.id
  );


  saveUnitPlan();


  notifyStateChanged();


  return unitPlan;

}


// ============================================================
// DOES UNIT CONTAIN TEACHER WORK?
// ============================================================

function hasMeaningfulUnitContent(
  plan
) {

  if (!plan) {

    return false;

  }


  if (
    plan.setup?.title?.trim()
  ) {

    return true;

  }


  if (
    plan.setup?.context?.trim()
  ) {

    return true;

  }


  if (
    plan.setup?.yearLevels?.length
  ) {

    return true;

  }


  if (
    plan.setup?.learningAreas?.length
  ) {

    return true;

  }


  if (
    plan.curriculum
      ?.selectedStandards
      ?.length
  ) {

    return true;

  }


  if (
    Object.keys(
      plan.assessments
        ?.byYear ||
      {}
    ).length
  ) {

    return true;

  }


  if (
    plan.sequence?.weeks?.length
  ) {

    return true;

  }


  return false;

}


// ============================================================
// GENERAL STATE UPDATE
// ============================================================

export function updateUnitPlan(
  path,
  value
) {

  const parts =
    path.split(".");


  let current =
    unitPlan;


  for (
    let i = 0;
    i < parts.length - 1;
    i++
  ) {

    const part =
      parts[i];


    if (
      !current[part] ||
      typeof current[part] !== "object"
    ) {

      current[part] = {};

    }


    current =
      current[part];

  }


  current[
    parts[
      parts.length - 1
    ]
  ] =
    value;


  saveUnitPlan();

  notifyStateChanged();

}


// ============================================================
// YEAR-LEVEL ASSESSMENTS
// ============================================================

export function getAssessment(
  yearLevel
) {

  if (!yearLevel) {

    return null;

  }


  if (
    !unitPlan.assessments
  ) {

    unitPlan.assessments = {
      activeYear: "",
      byYear: {}
    };

  }


  if (
    !unitPlan.assessments.byYear
  ) {

    unitPlan.assessments.byYear = {};

  }


  if (
    !unitPlan.assessments
      .byYear[
        yearLevel
      ]
  ) {

    unitPlan.assessments
      .byYear[
        yearLevel
      ] =
      createAssessmentTemplate(
        yearLevel
      );

  }


  return unitPlan.assessments
    .byYear[
      yearLevel
    ];

}


// ============================================================
// CREATE ASSESSMENT TEMPLATE
// ============================================================

export function createAssessmentTemplate(
  yearLevel
) {

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


// ============================================================
// SET ACTIVE ASSESSMENT YEAR
// ============================================================

export function setActiveAssessmentYear(
  yearLevel
) {

  unitPlan.assessments.activeYear =
    yearLevel;


  getAssessment(
    yearLevel
  );


  saveUnitPlan();

  notifyStateChanged();

}


// ============================================================
// COMPLETE ASSESSMENT
// ============================================================

export function completeAssessment(
  yearLevel
) {

  const assessment =
    getAssessment(
      yearLevel
    );


  if (!assessment) {

    return;

  }


  assessment.completed =
    true;


  saveUnitPlan();

  notifyStateChanged();

}


// ============================================================
// ASSESSMENT COMPONENTS
// ============================================================

export function addAssessmentComponent(
  yearLevel
) {

  const assessment =
    getAssessment(
      yearLevel
    );


  const component = {

    id:
      createId(),

    title: "",

    selectedStandardCodes: [],

    cognitiveDemands: [],

    evidenceFormat: "",

    questionText: "",

    integrationConnections: [],

    teacherNotes: ""

  };


  assessment.components.push(
    component
  );


  saveUnitPlan();

  notifyStateChanged();


  return component;

}


// ============================================================
// REMOVE ASSESSMENT COMPONENT
// ============================================================

export function removeAssessmentComponent(
  yearLevel,
  componentId
) {

  const assessment =
    getAssessment(
      yearLevel
    );


  if (!assessment) {

    return;

  }


  assessment.components =
    assessment.components
      .filter(
        (component) =>
          component.id !==
          componentId
      );


  saveUnitPlan();

  notifyStateChanged();

}


// ============================================================
// STATE CHANGE LISTENERS
// ============================================================

const listeners =
  new Set();


// ============================================================
// SUBSCRIBE TO STATE
// ============================================================

export function subscribeToState(
  callback
) {

  listeners.add(
    callback
  );


  return () => {

    listeners.delete(
      callback
    );

  };

}


// ============================================================
// NOTIFY STATE CHANGED
// ============================================================

function notifyStateChanged() {

  listeners.forEach(
    (callback) => {

      try {

        callback(
          unitPlan
        );

      } catch (error) {

        console.error(
          "State listener failed:",
          error
        );

      }

    }
  );

}


// ============================================================
// DEBUGGING
// ============================================================

export function showCurrentState() {

  console.log(
    "Current Integrated Unit Planner state:"
  );

  console.log(
    unitPlan
  );


  console.log(
    "Active Unit ID:",
    getActiveUnitId()
  );


  console.log(
    "Saved Units:",
    getSavedUnits()
  );

}