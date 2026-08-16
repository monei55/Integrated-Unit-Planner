import {
  unitPlan,
  updateUnitPlan
} from "./state.js";


// ============================================================
// STEP 7 — DIFFERENTIATION & ADJUSTMENTS
// ============================================================

export function initDifferentiationPage() {

  buildCharacteristicDropdown();

  bindCharacteristicChange();

  bindAddAdjustments();

  renderSelectedAdjustmentGroups();

}


// ============================================================
// CHARACTERISTICS + ADJUSTMENTS
// ============================================================

const DIFFERENTIATION_OPTIONS = {

  reading: {

    label:
      "Reading demands",

    adjustments: [

      "Modified fluency passages",

      "Reduced text complexity while retaining the curriculum concept",

      "Explicit pre-teaching of vocabulary",

      "Text-to-speech",

      "Teacher or peer reading support",

      "Audio version of the text",

      "Chunk text into smaller sections",

      "Repeated reading before independent use",

      "Provide visual supports / images",

      "Highlight key information"

    ]

  },


  vocabulary: {

    label:
      "Vocabulary / language",

    adjustments: [

      "Explicit pre-teaching of vocabulary",

      "Visual vocabulary support",

      "Word bank",

      "Vocabulary displayed on the learning wall",

      "Repeated retrieval of key terminology",

      "Student-friendly definitions",

      "Use vocabulary in multiple contexts",

      "Provide examples and non-examples",

      "Sentence frames using key vocabulary"

    ]

  },


  writtenExpression: {

    label:
      "Written expression",

    adjustments: [

      "Planning scaffold",

      "Graphic organiser",

      "Sentence starters",

      "Word bank",

      "Modelled example",

      "Joint construction before independent writing",

      "Speech-to-text",

      "Reduced transcription load",

      "Alternative response mode where appropriate",

      "Additional processing time"

    ]

  },


  oralLanguage: {

    label:
      "Oral language / communication",

    adjustments: [

      "Additional thinking time",

      "Pre-teach discussion vocabulary",

      "Oral sentence stems",

      "Rehearse response with a partner",

      "Visual prompts",

      "Recorded oral response where appropriate",

      "Provide questions in advance",

      "Small-group discussion before whole-class response"

    ]

  },


  workingMemory: {

    label:
      "Working memory / cognitive load",

    adjustments: [

      "Chunk instructions",

      "Provide one step at a time",

      "Visual sequence / checklist",

      "Worked example",

      "Reduce unnecessary information on the page",

      "Repeat or rephrase instructions",

      "Provide key information in written form",

      "Use visual reminders",

      "Frequent check-ins"

    ]

  },


  attention: {

    label:
      "Attention / self-regulation",

    adjustments: [

      "Break task into shorter sections",

      "Provide visual schedule",

      "Use clear task completion checkpoints",

      "Reduce visual distractions",

      "Movement breaks",

      "Timer or visual time support",

      "Preferential workspace or seating",

      "Frequent feedback / check-ins",

      "Provide clear start and finish points"

    ]

  },


  processing: {

    label:
      "Processing time",

    adjustments: [

      "Additional thinking time",

      "Provide questions before requiring a response",

      "Reduce time pressure",

      "Break information into smaller sections",

      "Repeat or rephrase instructions",

      "Provide written and verbal instructions",

      "Allow additional completion time",

      "Provide processing pause before partner discussion"

    ]

  },


  priorKnowledge: {

    label:
      "Prior knowledge / experience",

    adjustments: [

      "Pre-teach essential background knowledge",

      "Use visual background knowledge supports",

      "Connect new learning to familiar examples",

      "Provide additional worked examples",

      "Use short prerequisite review",

      "Provide targeted small-group instruction",

      "Revisit prerequisite concepts before new learning"

    ]

  },


  eald: {

    label:
      "English as an additional language or dialect",

    adjustments: [

      "Explicitly pre-teach vocabulary",

      "Use visuals and real objects",

      "Provide sentence frames",

      "Model expected language structures",

      "Partner rehearsal before independent response",

      "Provide bilingual resources where appropriate",

      "Reduce unnecessary language complexity",

      "Provide additional processing time"

    ]

  },


  fineMotor: {

    label:
      "Fine motor / physical access",

    adjustments: [

      "Alternative writing tool",

      "Keyboard or digital response",

      "Speech-to-text",

      "Reduced copying demands",

      "Provide printed rather than copied materials",

      "Alternative response method",

      "Adapted equipment",

      "Additional completion time"

    ]

  },


  sensory: {

    label:
      "Sensory needs",

    adjustments: [

      "Reduce visual clutter",

      "Reduce unnecessary noise",

      "Provide quieter workspace",

      "Provide visual rather than auditory instruction",

      "Provide written instructions",

      "Allow appropriate sensory supports",

      "Adjust lighting or screen presentation where possible",

      "Provide predictable lesson routines"

    ]

  },


  attendance: {

    label:
      "Attendance / interrupted learning",

    adjustments: [

      "Identify essential learning only",

      "Provide catch-up learning summary",

      "Use targeted prerequisite review",

      "Provide recorded or digital lesson resources",

      "Prioritise key vocabulary",

      "Provide targeted small-group reteaching",

      "Provide worked examples from missed lessons",

      "Use Daily Review to revisit missed essential learning"

    ]

  },


  extension: {

    label:
      "Extension / advanced learning",

    adjustments: [

      "Increase complexity rather than quantity",

      "Use more complex texts or sources",

      "Require deeper justification",

      "Provide open-ended investigation",

      "Reduce repetition of already-mastered content",

      "Increase independence",

      "Use multiple perspectives or sources",

      "Require transfer to an unfamiliar context",

      "Provide opportunity for synthesis or evaluation"

    ]

  }

};


// ============================================================
// BUILD CHARACTERISTIC DROPDOWN
// ============================================================

function buildCharacteristicDropdown() {

  const select =
    document.getElementById(
      "learnerCharacteristic"
    );


  if (!select) {
    return;
  }


  select.innerHTML = `

    <option value="">
      Select a learner characteristic...
    </option>

    ${
      Object.entries(
        DIFFERENTIATION_OPTIONS
      )
        .map(
          ([key, item]) => `

            <option
              value="${escapeAttribute(
                key
              )}"
            >
              ${escapeHtml(
                item.label
              )}
            </option>

          `
        )
        .join("")
    }

  `;

}


// ============================================================
// CHARACTERISTIC CHANGE
// ============================================================

function bindCharacteristicChange() {

  const select =
    document.getElementById(
      "learnerCharacteristic"
    );


  if (!select) {
    return;
  }


  select.addEventListener(
    "change",
    () => {

      buildAdjustmentMultiSelect(
        select.value
      );

    }
  );

}


// ============================================================
// MULTI-SELECT ADJUSTMENTS
// ============================================================

function buildAdjustmentMultiSelect(
  characteristic
) {

  const select =
    document.getElementById(
      "adjustmentChoices"
    );


  if (!select) {
    return;
  }


  if (
    !characteristic ||
    !DIFFERENTIATION_OPTIONS[
      characteristic
    ]
  ) {

    select.disabled =
      true;


    select.innerHTML =
      "";


    return;

  }


  const adjustments =
    DIFFERENTIATION_OPTIONS[
      characteristic
    ].adjustments;


  const alreadySelected =
    getSelectedAdjustmentsForCharacteristic(
      characteristic
    );


  select.disabled =
    false;


  select.innerHTML =
    adjustments
      .map(
        (adjustment) => `

          <option
            value="${escapeAttribute(
              adjustment
            )}"
            ${
              alreadySelected.includes(
                adjustment
              )
                ? "selected"
                : ""
            }
          >
            ${escapeHtml(
              adjustment
            )}
          </option>

        `
      )
      .join("");

}


// ============================================================
// ADD MULTIPLE ADJUSTMENTS
// ============================================================

function bindAddAdjustments() {

  document
    .getElementById(
      "addAdjustments"
    )
    ?.addEventListener(
      "click",
      saveSelectedAdjustments
    );

}


function saveSelectedAdjustments() {

  const characteristicKey =
    document.getElementById(
      "learnerCharacteristic"
    )?.value;


  const select =
    document.getElementById(
      "adjustmentChoices"
    );


  const message =
    document.getElementById(
      "adjustmentMessage"
    );


  if (!characteristicKey) {

    showMessage(
      message,
      "Select a learner characteristic first."
    );

    return;

  }


  if (!select) {
    return;
  }


  const selectedAdjustments =
    [
      ...select.selectedOptions
    ]
      .map(
        (option) =>
          option.value
      );


  if (!selectedAdjustments.length) {

    showMessage(
      message,
      "Select at least one adjustment."
    );

    return;

  }


  const groups =
    cloneGroups();


  const existing =
    groups.find(
      (group) =>
        group.characteristicKey ===
        characteristicKey
    );


  if (existing) {

    existing.adjustments =
      unique(
        [
          ...existing.adjustments,
          ...selectedAdjustments
        ]
      );

  } else {

    groups.push({

      id:
        crypto.randomUUID(),

      characteristicKey,

      characteristic:
        DIFFERENTIATION_OPTIONS[
          characteristicKey
        ].label,

      adjustments:
        unique(
          selectedAdjustments
        )

    });

  }


  saveGroups(
    groups
  );


  showMessage(
    message,
    `${selectedAdjustments.length} adjustment${
      selectedAdjustments.length === 1
        ? ""
        : "s"
    } added.`
  );


  renderSelectedAdjustmentGroups();

}


// ============================================================
// SELECTED ADJUSTMENTS
// ============================================================

function renderSelectedAdjustmentGroups() {

  const container =
    document.getElementById(
      "selectedAdjustmentGroups"
    );


  if (!container) {
    return;
  }


  const groups =
    getGroups();


  if (!groups.length) {

    container.innerHTML = `

      <div class="empty">

        No differentiation adjustments
        have been selected yet.

      </div>

    `;

    return;

  }


  container.innerHTML =
    groups
      .map(
        groupHtml
      )
      .join("");


  bindGroupEvents();

}


// ============================================================
// GROUP HTML
// ============================================================

function groupHtml(
  group
) {

  return `

    <article
      class="adjustment-group-card"
      data-group="${escapeAttribute(
        group.id
      )}"
    >

      <div class="adjustment-group-head">

        <strong>
          ${escapeHtml(
            group.characteristic
          )}
        </strong>


        <button
          type="button"
          class="mini remove-characteristic"
        >
          Remove group
        </button>

      </div>


      <div class="selected-adjustment-list">

        ${
          group.adjustments
            .map(
              (adjustment) => `

                <div
                  class="selected-adjustment"
                  data-adjustment="${escapeAttribute(
                    adjustment
                  )}"
                >

                  <span>
                    ${escapeHtml(
                      adjustment
                    )}
                  </span>


                  <button
                    type="button"
                    class="remove-single-adjustment"
                    aria-label="Remove adjustment"
                  >
                    ×
                  </button>

                </div>

              `
            )
            .join("")
        }

      </div>

    </article>

  `;

}


// ============================================================
// REMOVE EVENTS
// ============================================================

function bindGroupEvents() {

  document
    .querySelectorAll(
      ".adjustment-group-card"
    )
    .forEach(
      (card) => {

        const groupId =
          card.dataset.group;


        card
          .querySelector(
            ".remove-characteristic"
          )
          ?.addEventListener(
            "click",
            () => {

              removeGroup(
                groupId
              );

            }
          );


        card
          .querySelectorAll(
            ".selected-adjustment"
          )
          .forEach(
            (adjustmentElement) => {

              adjustmentElement
                .querySelector(
                  ".remove-single-adjustment"
                )
                ?.addEventListener(
                  "click",
                  () => {

                    removeSingleAdjustment(
                      groupId,
                      adjustmentElement
                        .dataset
                        .adjustment
                    );

                  }
                );

            }
          );

      }
    );

}


// ============================================================
// REMOVE ONE ADJUSTMENT
// ============================================================

function removeSingleAdjustment(
  groupId,
  adjustment
) {

  const groups =
    cloneGroups();


  const group =
    groups.find(
      (item) =>
        item.id ===
        groupId
    );


  if (!group) {
    return;
  }


  group.adjustments =
    group.adjustments
      .filter(
        (item) =>
          item !==
          adjustment
      );


  const cleanedGroups =
    groups.filter(
      (item) =>
        item.adjustments.length
    );


  saveGroups(
    cleanedGroups
  );


  renderSelectedAdjustmentGroups();


  const currentCharacteristic =
    document.getElementById(
      "learnerCharacteristic"
    )?.value;


  if (currentCharacteristic) {

    buildAdjustmentMultiSelect(
      currentCharacteristic
    );

  }

}


// ============================================================
// REMOVE CHARACTERISTIC GROUP
// ============================================================

function removeGroup(
  groupId
) {

  const groups =
    getGroups()
      .filter(
        (group) =>
          group.id !==
          groupId
      );


  saveGroups(
    groups
  );


  renderSelectedAdjustmentGroups();


  const currentCharacteristic =
    document.getElementById(
      "learnerCharacteristic"
    )?.value;


  if (currentCharacteristic) {

    buildAdjustmentMultiSelect(
      currentCharacteristic
    );

  }

}


// ============================================================
// GET SELECTED FOR ONE CHARACTERISTIC
// ============================================================

function getSelectedAdjustmentsForCharacteristic(
  characteristicKey
) {

  const group =
    getGroups()
      .find(
        (item) =>
          item.characteristicKey ===
          characteristicKey
      );


  return group
    ?.adjustments ||
    [];

}


// ============================================================
// STATE
// ============================================================

function getGroups() {

  return Array.isArray(
    unitPlan.differentiation
      ?.adjustmentGroups
  )
    ? unitPlan.differentiation
        .adjustmentGroups
    : [];

}


function cloneGroups() {

  return structuredClone(
    getGroups()
  );

}


function saveGroups(
  groups
) {

  updateUnitPlan(
    "differentiation.adjustmentGroups",
    groups
  );


  updateUnitPlan(
    "differentiation.summary",
    buildUnitPlanSummary(
      groups
    )
  );

}


// ============================================================
// UNIT PLAN SUMMARY
// ============================================================

function buildUnitPlanSummary(
  groups
) {

  return groups
    .map(
      (group) => {

        const adjustments =
          group.adjustments
            .map(
              (adjustment) =>
                `• ${adjustment}`
            )
            .join("\n");


        return `${group.characteristic}\n${adjustments}`;

      }
    )
    .join("\n\n");

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
  container,
  message
) {

  if (!container) {
    return;
  }


  container.innerHTML = `

    <strong>
      ${escapeHtml(
        message
      )}
    </strong>

  `;

}


// ============================================================
// HELPERS
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


function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  );

}