import {
  unitPlan
} from "./state.js";


import {
  getVocabularyForArea,
  uniqueWords,
  vocabularyLevelFor,
  normaliseYearNumber
} from "./vocabulary-data.js";


// ============================================================
// STEP 3 — INTEGRATION
// ============================================================

export function initIntegrationPage() {

  initialiseIntegrationState();

  bindIntegrationFields();

  renderStoredIntegration();

  bindSuggestionButton();

  bindVocabularyRefreshButton();

  bindAddConnectionButton();

  renderIntegrationConnections();

  refreshCurriculumVocabulary();

}


// ============================================================
// INITIALISE INTEGRATION STATE
// ============================================================

function initialiseIntegrationState() {

  if (
    !unitPlan.integration ||
    typeof unitPlan.integration !==
      "object"
  ) {

    unitPlan.integration = {};

  }


  if (
    !Array.isArray(
      unitPlan.integration.connections
    )
  ) {

    unitPlan.integration.connections = [];

  }

}


// ============================================================
// BIND MAIN INTEGRATION FIELDS
// ============================================================

function bindIntegrationFields() {

  bindField(
    "bigIdea",
    "bigIdea"
  );


  bindField(
    "authentic",
    "authenticContext"
  );


  bindField(
    "terminology",
    "terminology",
    {
      trackVocabularyEdit:
        true
    }
  );


  bindField(
    "integrationNotes",
    "integrationNotes"
  );

}


// ============================================================
// GENERIC FIELD BINDING
// ============================================================

function bindField(
  id,
  stateKey,
  options = {}
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {
    return;
  }


  element.addEventListener(
    "input",
    () => {

      unitPlan.integration[
        stateKey
      ] =
        element.value;


      if (
        options.trackVocabularyEdit
      ) {

        unitPlan.integration
          .vocabularyEditedByTeacher =
            true;

      }

    }
  );

}


// ============================================================
// RESTORE EXISTING VALUES
// ============================================================

function renderStoredIntegration() {

  setFieldValue(
    "bigIdea",
    unitPlan.integration
      .bigIdea ||
    unitPlan.integration
      .sharedConcept ||
    ""
  );


  setFieldValue(
    "authentic",
    unitPlan.integration
      .authenticContext ||
    unitPlan.integration
      .authentic ||
    ""
  );


  setFieldValue(
    "terminology",
    unitPlan.integration
      .terminology ||
    unitPlan.integration
      .keyTerminology ||
    ""
  );


  setFieldValue(
    "integrationNotes",
    unitPlan.integration
      .integrationNotes ||
    unitPlan.integration
      .notes ||
    ""
  );

}


// ============================================================
// AUTOMATIC CURRICULUM VOCABULARY
// ============================================================

function refreshCurriculumVocabulary(
  force = false
) {

  const textarea =
    document.getElementById(
      "terminology"
    );


  if (!textarea) {
    return;
  }


  const rows =
    getSelectedCurriculumRows();


  if (!rows.length) {

    if (
      !textarea.value.trim()
    ) {

      textarea.placeholder =
        "Select Achievement Standard aspects in Step 2 to automatically build the curriculum vocabulary demands.";

    }


    return;

  }


  const signature =
    buildCurriculumSignature(
      rows
    );


  const lastSignature =
    unitPlan.integration
      .vocabularySignature ||
    "";


  const teacherEdited =
    Boolean(
      unitPlan.integration
        .vocabularyEditedByTeacher
    );


  const currentlyEmpty =
    !textarea.value.trim();


  const curriculumChanged =
    signature !==
    lastSignature;


  // ==========================================================
  // POPULATE WHEN:
  //
  // 1. the field is empty
  // 2. curriculum has changed and teacher has not edited it
  // 3. teacher deliberately presses Refresh vocabulary
  //
  // Never silently overwrite teacher-entered vocabulary.
  // ==========================================================

  const shouldGenerate =
    force ||
    currentlyEmpty ||
    (
      curriculumChanged &&
      !teacherEdited
    );


  if (
    !shouldGenerate
  ) {

    updateVocabularyStatus(
      rows,
      false
    );

    return;

  }


  const vocabularyPlan =
    buildVocabularyPlan(
      rows
    );


  const formatted =
    formatVocabularyPlan(
      vocabularyPlan
    );


  textarea.value =
    formatted;


  unitPlan.integration
    .terminology =
      formatted;


  unitPlan.integration
    .vocabularySignature =
      signature;


  unitPlan.integration
    .vocabularyEditedByTeacher =
      false;


  unitPlan.integration
    .vocabularyPlan =
      vocabularyPlan;


  updateVocabularyStatus(
    rows,
    true
  );

}


// ============================================================
// BUILD VOCABULARY PLAN
// ============================================================

function buildVocabularyPlan(
  rows
) {

  const groups =
    groupSelectedRows(
      rows
    );


  const results = [];


  groups.forEach(
    (group) => {

      const vocabulary =
        getVocabularyForArea(
          group.subject,
          group.yearLevel,
          group.area
        );


      const aspectText =
        group.rows
          .map(
            (row) =>
              row.text ||
              row.statement ||
              row.description ||
              ""
          )
          .join(
            " "
          );


      const tier2 =
        prioritiseVocabulary(
          vocabulary.tier2,
          aspectText,
          10
        );


      const tier3 =
        prioritiseVocabulary(
          vocabulary.tier3,
          aspectText,
          10
        );


      if (
        !tier2.length &&
        !tier3.length
      ) {

        return;

      }


      results.push({

        subject:
          group.subject,

        yearLevel:
          group.yearLevel,

        vocabularyLevel:
          vocabularyLevelFor(
            group.subject,
            group.yearLevel
          ),

        area:
          group.area,

        tier2,

        tier3,

        aspects:
          group.rows.map(
            (row) =>
              row.text ||
              row.statement ||
              ""
          )

      });

    }
  );


  return results;

}


// ============================================================
// GROUP SELECTED ASPECTS
// ============================================================

function groupSelectedRows(
  rows
) {

  const groups =
    new Map();


  const selectedYears =
    getSelectedYearLevels();


  rows.forEach(
    (row) => {

      const subject =
        row.subject ||
        row.learningArea ||
        "";


      if (!subject) {
        return;
      }


      const area =
        curriculumArea(
          row
        );


      const relevantYears =
        getRelevantYearsForRow(
          row,
          selectedYears
        );


      relevantYears.forEach(
        (yearLevel) => {

          const key =
            [
              subject,
              yearLevel,
              area
            ]
              .join(
                "|||"
              );


          if (
            !groups.has(
              key
            )
          ) {

            groups.set(
              key,
              {
                subject,
                yearLevel,
                area,
                rows: []
              }
            );

          }


          groups
            .get(
              key
            )
            .rows
            .push(
              row
            );

        }
      );

    }
  );


  return [
    ...groups.values()
  ];

}


// ============================================================
// RELEVANT YEAR LEVELS
// ============================================================

function getRelevantYearsForRow(
  row,
  selectedYears
) {

  if (
    !selectedYears.length
  ) {

    return [
      row.grade ||
      row.yearLevel ||
      "Prep"
    ];

  }


  const rowGrade =
    String(
      row.grade ||
      row.yearLevel ||
      ""
    );


  const rowNumbers =
    extractYearNumbers(
      rowGrade
    );


  // ----------------------------------------------------------
  // PREP / FOUNDATION
  // ----------------------------------------------------------

  if (
    /prep|foundation/i.test(
      rowGrade
    )
  ) {

    const prep =
      selectedYears.filter(
        (year) =>
          normaliseYearNumber(
            year
          ) ===
          0
      );


    return prep.length
      ? prep
      : ["Prep"];

  }


  // ----------------------------------------------------------
  // BAND — e.g. Years 3–4
  // ----------------------------------------------------------

  if (
    rowNumbers.length >=
    2
  ) {

    const min =
      Math.min(
        ...rowNumbers
      );


    const max =
      Math.max(
        ...rowNumbers
      );


    const matches =
      selectedYears.filter(
        (year) => {

          const number =
            normaliseYearNumber(
              year
            );


          return (
            number >= min &&
            number <= max
          );

        }
      );


    return matches.length
      ? matches
      : [
          `Year ${max}`
        ];

  }


  // ----------------------------------------------------------
  // SINGLE YEAR
  // ----------------------------------------------------------

  if (
    rowNumbers.length ===
    1
  ) {

    const number =
      rowNumbers[0];


    const matches =
      selectedYears.filter(
        (year) =>
          normaliseYearNumber(
            year
          ) ===
          number
      );


    return matches.length
      ? matches
      : [
          `Year ${number}`
        ];

  }


  return selectedYears;

}


// ============================================================
// EXTRACT YEAR NUMBERS
// ============================================================

function extractYearNumbers(
  value
) {

  const matches =
    String(
      value ||
      ""
    )
      .match(
        /\d+/g
      );


  return matches
    ? matches.map(
        Number
      )
    : [];

}


// ============================================================
// CURRICULUM AREA CLASSIFICATION
// ============================================================

function curriculumArea(
  row
) {

  if (
    row.area
  ) {

    return normaliseAreaName(
      row.subject,
      row.area
    );

  }


  const text =
    String(
      row.text ||
      row.statement ||
      ""
    )
      .toLowerCase();


  const subject =
    row.subject ||
    row.learningArea ||
    "";


  // ==========================================================
  // ENGLISH
  // ==========================================================

  if (
    subject ===
    "English"
  ) {

    if (
      /literary|literature|character|setting|plot|poem|poetry|narrative|author|illustrator/.test(
        text
      )
    ) {

      return "Literature";

    }


    if (
      /read|view|comprehend|write|create text|spoken|listen|speaking|interact|oral|audience|purpose/.test(
        text
      )
    ) {

      return "Literacy";

    }


    return "Language";

  }


  // ==========================================================
  // MATHEMATICS
  // ==========================================================

  if (
    subject ===
    "Mathematics"
  ) {

    if (
      /probab|chance|likelihood/.test(
        text
      )
    ) {

      return "Probability";

    }


    if (
      /statistic|data|survey|graph|chart|distribution/.test(
        text
      )
    ) {

      return "Statistics";

    }


    if (
      /shape|space|location|position|angle|symmetr|transform|grid|coordinate/.test(
        text
      )
    ) {

      return "Space";

    }


    if (
      /measure|length|mass|capacity|area|perimeter|time|duration|temperature|volume/.test(
        text
      )
    ) {

      return "Measurement";

    }


    if (
      /pattern|algebra|equival|variable|unknown|algorithm|equation/.test(
        text
      )
    ) {

      return "Algebra";

    }


    return "Number";

  }


  // ==========================================================
  // SCIENCE
  // ==========================================================

  if (
    subject ===
    "Science"
  ) {

    if (
      /living|life cycle|habitat|plant|animal|ecosystem|survival|biological|organism|adapt/.test(
        text
      )
    ) {

      return "Biological Sciences";

    }


    if (
      /material|solid|liquid|gas|state|mixture|property|chemical/.test(
        text
      )
    ) {

      return "Chemical Sciences";

    }


    if (
      /force|motion|energy|heat|light|sound|electric|physical/.test(
        text
      )
    ) {

      return "Physical Sciences";

    }


    if (
      /earth|space|sun|moon|planet|weather|season|landscape|geolog/.test(
        text
      )
    ) {

      return "Earth & Space Sciences";

    }


    if (
      /question|investigat|observe|measure|data|evidence|predict|conclusion|communicat|represent|fair test|variable/.test(
        text
      )
    ) {

      return "Science Inquiry";

    }


    return "Science Inquiry";

  }


  // ==========================================================
  // HASS
  // ==========================================================

  if (
    subject ===
    "HASS"
  ) {

    if (
      /history|histor|past|present|continuity|change|significance|commemor|first fleet|colon|migration/.test(
        text
      )
    ) {

      return "History";

    }


    if (
      /geograph|place|environment|location|map|spatial|climate|natural|sustainab|distribution/.test(
        text
      )
    ) {

      return "Geography";

    }


    if (
      /civic|citizen|government|democra|law|rule|decision-making|community participation/.test(
        text
      )
    ) {

      return "Civics & Citizenship";

    }


    if (
      /economic|business|consumer|producer|resource|scarcity|needs and wants|financial/.test(
        text
      )
    ) {

      return "Economics & Business";

    }


    return "HASS Skills";

  }


  // ==========================================================
  // HPE
  // ==========================================================

  if (
    subject ===
    "HPE"
  ) {

    if (
      /movement|physical|motor|game|sport|fitness|active|locomotor|skill/.test(
        text
      )
    ) {

      return "Movement & Physical Activity";

    }


    if (
      /relationship|consent|boundary|respect|safe|safety|protect|help-seeking/.test(
        text
      )
    ) {

      return "Relationships & Safety";

    }


    if (
      /analyse|evaluate|apply|decision|message|information|strategy|reflect/.test(
        text
      )
    ) {

      return "Health & Wellbeing Skills";

    }


    return "Personal, Social & Community Health";

  }


  // ==========================================================
  // DESIGN AND TECHNOLOGIES
  // ==========================================================

  if (
    subject ===
    "Design and Technologies"
  ) {

    if (
      /design|create|produce|evaluate|plan|process|communicate|criteria/.test(
        text
      )
    ) {

      return "Processes & Production Skills";

    }


    return "Design & Technologies";

  }


  // ==========================================================
  // DIGITAL TECHNOLOGIES
  // ==========================================================

  if (
    subject ===
    "Digital Technologies"
  ) {

    if (
      /algorithm|branch|iteration|data|privacy|security|personal information|debug|represent/.test(
        text
      )
    ) {

      return "Digital Skills & Safety";

    }


    return "Digital Technologies";

  }


  // ==========================================================
  // THE ARTS
  // ==========================================================

  if (
    [
      "Dance",
      "Drama",
      "Media Arts",
      "Music",
      "Visual Arts"
    ]
      .includes(
        subject
      )
  ) {

    return subject;

  }


  return (
    row.area ||
    "Achievement Standard"
  );

}


// ============================================================
// NORMALISE EXISTING AREA LABELS
// ============================================================

function normaliseAreaName(
  subject,
  area
) {

  const text =
    String(
      area ||
      ""
    )
      .toLowerCase();


  // ----------------------------------------------------------
  // English
  // ----------------------------------------------------------

  if (
    subject ===
    "English"
  ) {

    if (
      /literature/.test(
        text
      )
    ) {

      return "Literature";

    }


    if (
      /reading|viewing|writing|creating|speaking|listening|literacy/.test(
        text
      )
    ) {

      return "Literacy";

    }


    return "Language";

  }


  // ----------------------------------------------------------
  // Science
  // ----------------------------------------------------------

  if (
    subject ===
    "Science"
  ) {

    if (
      /life|living|biological/.test(
        text
      )
    ) {

      return "Biological Sciences";

    }


    if (
      /material|chemical/.test(
        text
      )
    ) {

      return "Chemical Sciences";

    }


    if (
      /physical/.test(
        text
      )
    ) {

      return "Physical Sciences";

    }


    if (
      /earth|space/.test(
        text
      )
    ) {

      return "Earth & Space Sciences";

    }


    if (
      /inquiry/.test(
        text
      )
    ) {

      return "Science Inquiry";

    }

  }


  // ----------------------------------------------------------
  // HASS
  // ----------------------------------------------------------

  if (
    subject ===
    "HASS"
  ) {

    if (
      /history/.test(
        text
      )
    ) {

      return "History";

    }


    if (
      /geograph/.test(
        text
      )
    ) {

      return "Geography";

    }


    if (
      /civic/.test(
        text
      )
    ) {

      return "Civics & Citizenship";

    }


    if (
      /economic|business/.test(
        text
      )
    ) {

      return "Economics & Business";

    }


    return "HASS Skills";

  }


  return area;

}


// ============================================================
// PRIORITISE VOCABULARY
// ============================================================

function prioritiseVocabulary(
  words,
  aspectText,
  maximum
) {

  const text =
    normaliseSearchText(
      aspectText
    );


  const scored =
    uniqueWords(
      words
    )
      .map(
        (
          word,
          index
        ) => {

          return {

            word,

            score:
              vocabularyRelevanceScore(
                word,
                text
              ),

            index

          };

        }
      );


  scored.sort(
    (
      a,
      b
    ) => {

      if (
        b.score !==
        a.score
      ) {

        return (
          b.score -
          a.score
        );

      }


      return (
        a.index -
        b.index
      );

    }
  );


  return scored
    .slice(
      0,
      maximum
    )
    .map(
      (item) =>
        item.word
    );

}


// ============================================================
// VOCABULARY RELEVANCE
// ============================================================

function vocabularyRelevanceScore(
  word,
  normalisedAspectText
) {

  const normalisedWord =
    normaliseSearchText(
      word
    );


  if (!normalisedWord) {

    return 0;

  }


  let score = 0;


  // ----------------------------------------------------------
  // Exact word / phrase in Achievement Standard
  // ----------------------------------------------------------

  if (
    normalisedAspectText.includes(
      normalisedWord
    )
  ) {

    score +=
      normalisedWord.includes(
        " "
      )
        ? 12
        : 10;

  }


  // ----------------------------------------------------------
  // Partial phrase matches
  // ----------------------------------------------------------

  const parts =
    normalisedWord
      .split(
        " "
      )
      .filter(
        (part) =>
          part.length >=
          4
      );


  parts.forEach(
    (part) => {

      if (
        normalisedAspectText.includes(
          part
        )
      ) {

        score += 3;

      }

    }
  );


  // ----------------------------------------------------------
  // High-value cognitive language
  // ----------------------------------------------------------

  const academicWords = [
    "identify",
    "describe",
    "explain",
    "compare",
    "interpret",
    "analyse",
    "evaluate",
    "justify",
    "represent",
    "create",
    "communicate",
    "investigate",
    "evidence",
    "perspective",
    "purpose",
    "audience",
    "effect"
  ];


  if (
    academicWords.includes(
      normalisedWord
    )
  ) {

    score += 1;

  }


  return score;

}


// ============================================================
// NORMALISE SEARCH TEXT
// ============================================================

function normaliseSearchText(
  value
) {

  return String(
    value ||
    ""
  )
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s'-]/gu,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


// ============================================================
// FORMAT VOCABULARY FOR TEXTAREA
// ============================================================

function formatVocabularyPlan(
  plan
) {

  if (
    !Array.isArray(
      plan
    ) ||
    !plan.length
  ) {

    return "";

  }


  return plan
    .map(
      (item) => {

        const heading =
          [
            item.subject,
            item.yearLevel,
            item.area
          ]
            .filter(Boolean)
            .join(
              " — "
            );


        const lines = [
          heading
        ];


        if (
          item.tier2.length
        ) {

          lines.push(
            `Tier 2: ${item.tier2.join(", ")}`
          );

        }


        if (
          item.tier3.length
        ) {

          lines.push(
            `Tier 3: ${item.tier3.join(", ")}`
          );

        }


        return lines.join(
          "\n"
        );

      }
    )
    .join(
      "\n\n"
    );

}


// ============================================================
// GET SELECTED CURRICULUM ROWS
// ============================================================

function getSelectedCurriculumRows() {

  const candidates = [

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
    candidates
  ) {

    if (
      Array.isArray(
        candidate
      ) &&
      candidate.length
    ) {

      return cleanCurriculumRows(
        candidate
      );

    }

  }


  const found = [];


  findCurriculumRowsRecursively(
    unitPlan.curriculum,
    found
  );


  return cleanCurriculumRows(
    found
  );

}


// ============================================================
// FIND CURRICULUM ROWS RECURSIVELY
// ============================================================

function findCurriculumRowsRecursively(
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
        findCurriculumRowsRecursively(
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


  const looksLikeAspect =
    Boolean(
      text &&
      (
        value.subject ||
        value.learningArea
      ) &&
      (
        value.type ===
          "achievement_standard" ||
        value.code ||
        value.selected ===
          true
      )
    );


  if (
    looksLikeAspect
  ) {

    output.push(
      value
    );

  }


  Object.values(
    value
  )
    .forEach(
      (child) =>
        findCurriculumRowsRecursively(
          child,
          output
        )
    );

}


// ============================================================
// CLEAN CURRICULUM ROWS
// ============================================================

function cleanCurriculumRows(
  rows
) {

  const map =
    new Map();


  (
    rows ||
    []
  )
    .forEach(
      (row) => {

        if (
          !row ||
          typeof row !==
            "object"
        ) {

          return;

        }


        const text =
          row.text ||
          row.statement ||
          row.description ||
          "";


        if (!text) {
          return;
        }


        const cleaned = {

          ...row,

          subject:
            row.subject ||
            row.learningArea ||
            "",

          grade:
            row.grade ||
            row.yearLevel ||
            "",

          text

        };


        const key =
          cleaned.code ||
          [
            cleaned.subject,
            cleaned.grade,
            cleaned.text
          ]
            .join(
              "|||"
            );


        if (
          !map.has(
            key
          )
        ) {

          map.set(
            key,
            cleaned
          );

        }

      }
    );


  return [
    ...map.values()
  ];

}


// ============================================================
// SELECTED YEAR LEVELS
// ============================================================

function getSelectedYearLevels() {

  const candidates = [

    unitPlan.setup
      ?.yearLevels,

    unitPlan.setup
      ?.years,

    unitPlan.years,

    unitPlan.yearLevels

  ];


  for (
    const candidate of
    candidates
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


  return [];

}


// ============================================================
// CURRICULUM SIGNATURE
// ============================================================

function buildCurriculumSignature(
  rows
) {

  return rows
    .map(
      (row) =>
        row.code ||
        [
          row.subject,
          row.grade,
          row.text
        ]
          .join(
            "|"
          )
    )
    .sort()
    .join(
      "||"
    );

}


// ============================================================
// VOCABULARY STATUS MESSAGE
// ============================================================

function updateVocabularyStatus(
  rows,
  regenerated
) {

  const box =
    document.getElementById(
      "integrationSuggestions"
    );


  if (!box) {
    return;
  }


  const subjects =
    uniqueWords(
      rows.map(
        (row) =>
          row.subject
      )
    );


  if (
    regenerated
  ) {

    box.innerHTML = `

      <strong>
        Curriculum vocabulary updated
      </strong>

      <br><br>

      Tier 2 and Tier 3 vocabulary has been drawn from the
      vocabulary scope and sequence for the selected
      Achievement Standard aspects in
      ${escapeHtml(
        subjects.join(
          ", "
        )
      )}.

      <br><br>

      <span class="helper">
        The vocabulary remains editable. Add local,
        contextual or unit-specific terminology where
        required.
      </span>

    `;

  } else {

    box.innerHTML = `

      <strong>
        Curriculum vocabulary available
      </strong>

      <br><br>

      Step 2 curriculum selections have changed, but the
      terminology field contains teacher edits.

      <br><br>

      <span class="helper">
        Use Refresh curriculum vocabulary if you want to
        rebuild it from the selected Achievement Standard
        aspects.
      </span>

    `;

  }

}


// ============================================================
// REFRESH VOCABULARY BUTTON
// ============================================================

function bindVocabularyRefreshButton() {

  const button =
    document.getElementById(
      "refreshVocabulary"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      unitPlan.integration
        .vocabularyEditedByTeacher =
          false;


      refreshCurriculumVocabulary(
        true
      );

    }
  );

}


// ============================================================
// SUGGEST INTEGRATION POSSIBILITIES
// ============================================================

function bindSuggestionButton() {

  const button =
    document.getElementById(
      "integrationSuggest"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      const rows =
        getSelectedCurriculumRows();


      const box =
        document.getElementById(
          "integrationSuggestions"
        );


      if (!box) {
        return;
      }


      if (
        rows.length <
        2
      ) {

        box.innerHTML = `

          <strong>
            Select at least two Achievement Standard aspects first.
          </strong>

          <br><br>

          Return to Step 2 and select the curriculum that
          will be explicitly taught and/or assessed.

        `;

        return;

      }


      const suggestions =
        buildIntegrationSuggestions(
          rows
        );


      box.innerHTML = `

        <div class="integration-suggestion-section">

          <strong>
            Possible conceptual connections
          </strong>

          <ul>

            ${
              suggestions.concepts
                .map(
                  (item) => `

                    <li>
                      ${escapeHtml(
                        item
                      )}
                    </li>

                  `
                )
                .join("")
            }

          </ul>

        </div>


        <div class="integration-suggestion-section">

          <strong>
            Possible authentic integration opportunities
          </strong>

          <ul>

            ${
              suggestions.opportunities
                .map(
                  (item) => `

                    <li>
                      ${escapeHtml(
                        item
                      )}
                    </li>

                  `
                )
                .join("")
            }

          </ul>

        </div>


        <div class="integration-suggestion-section">

          <strong>
            Possible integration notes
          </strong>

          <ul>

            ${
              suggestions.notes
                .map(
                  (item) => `

                    <li>
                      ${escapeHtml(
                        item
                      )}
                    </li>

                  `
                )
                .join("")
            }

          </ul>

        </div>


        <span class="helper">

          These are planning prompts only. Teachers retain
          responsibility for deciding whether connections
          are authentic and whether each selected
          Achievement Standard aspect remains visible.

        </span>

      `;

    }
  );

}


// ============================================================
// BUILD INTEGRATION SUGGESTIONS
// ============================================================

function buildIntegrationSuggestions(
  rows
) {

  const subjects =
    uniqueWords(
      rows.map(
        (row) =>
          row.subject
      )
    );


  const areas =
    uniqueWords(
      rows.map(
        (row) =>
          curriculumArea(
            row
          )
      )
    );


  const text =
    rows
      .map(
        (row) =>
          row.text ||
          row.statement ||
          ""
      )
      .join(
        " "
      )
      .toLowerCase();


  const concepts =
    buildConceptSuggestions(
      text,
      subjects,
      areas
    );


  const opportunities =
    buildOpportunitySuggestions(
      text,
      subjects,
      areas
    );


  const notes =
    buildIntegrationNotes(
      subjects,
      areas
    );


  return {

    concepts:
      uniqueWords(
        concepts
      )
        .slice(
          0,
          5
        ),

    opportunities:
      uniqueWords(
        opportunities
      )
        .slice(
          0,
          4
        ),

    notes:
      uniqueWords(
        notes
      )
        .slice(
          0,
          5
        )

  };

}


// ============================================================
// CONCEPTUAL CONNECTION SUGGESTIONS
// ============================================================

function buildConceptSuggestions(
  text,
  subjects,
  areas
) {

  const concepts = [];


  if (
    /change|continuity|develop|growth|adapt|transform/.test(
      text
    )
  ) {

    concepts.push(
      "Change — how people, places, ideas, systems or living things change over time."
    );

  }


  if (
    /cause|effect|impact|influence|result|consequence/.test(
      text
    )
  ) {

    concepts.push(
      "Cause and effect — how actions, events or processes lead to consequences."
    );

  }


  if (
    /relationship|connection|interconnection|interact|linked/.test(
      text
    )
  ) {

    concepts.push(
      "Connections — how people, environments, systems, ideas or texts are linked."
    );

  }


  if (
    /perspective|viewpoint|opinion|point of view|representation/.test(
      text
    )
  ) {

    concepts.push(
      "Perspective — how different people, groups or creators represent and interpret ideas differently."
    );

  }


  if (
    /purpose|audience|communicat|message|inform|persuad/.test(
      text
    )
  ) {

    concepts.push(
      "Communication — how ideas are shaped and communicated for different purposes and audiences."
    );

  }


  if (
    /resource|sustainab|environment|care|manage|conserve/.test(
      text
    )
  ) {

    concepts.push(
      "Sustainability and responsibility — how decisions affect people, places and resources."
    );

  }


  if (
    /identity|belong|culture|community|heritage/.test(
      text
    )
  ) {

    concepts.push(
      "Identity and belonging — how people understand themselves, groups, cultures and communities."
    );

  }


  if (
    /design|solution|problem|criteria|evaluate|improve/.test(
      text
    )
  ) {

    concepts.push(
      "Problem solving and design — how ideas are developed, tested and improved to meet a need or purpose."
    );

  }


  if (
    /pattern|sequence|structure|organise|relationship/.test(
      text
    )
  ) {

    concepts.push(
      "Patterns and structure — how information, ideas, processes or systems are organised."
    );

  }


  if (
    /evidence|source|investigat|observe|data/.test(
      text
    )
  ) {

    concepts.push(
      "Evidence — how observations, sources and data are used to build and communicate understanding."
    );

  }


  if (
    /choice|decision|responsibility|rule|law/.test(
      text
    )
  ) {

    concepts.push(
      "Decision-making and responsibility — how choices are made and the consequences they may have."
    );

  }


  if (
    !concepts.length
  ) {

    concepts.push(
      `A shared concept linking ${subjects.join(" and ")} through the selected curriculum demands.`
    );

  }


  return concepts;

}


// ============================================================
// AUTHENTIC INTEGRATION OPPORTUNITIES
// ============================================================

function buildOpportunitySuggestions(
  text,
  subjects,
  areas
) {

  const opportunities = [];


  const has =
    (subject) =>
      subjects.includes(
        subject
      );


  // ----------------------------------------------------------
  // English + HASS / Science
  // ----------------------------------------------------------

  if (
    has(
      "English"
    ) &&
    (
      has(
        "HASS"
      ) ||
      has(
        "Science"
      )
    )
  ) {

    opportunities.push(
      "Use HASS or Science disciplinary knowledge as the content for English reading, speaking, viewing or writing rather than creating a separate literacy topic."
    );

  }


  // ----------------------------------------------------------
  // English + Arts
  // ----------------------------------------------------------

  if (
    has(
      "English"
    ) &&
    [
      "Dance",
      "Drama",
      "Media Arts",
      "Music",
      "Visual Arts"
    ]
      .some(
        (subject) =>
          has(
            subject
          )
      )
  ) {

    opportunities.push(
      "Use an Arts product or performance as a communication mode, with English supporting planning, explanation, audience and language choices where these demands are selected."
    );

  }


  // ----------------------------------------------------------
  // Technologies
  // ----------------------------------------------------------

  if (
    has(
      "Design and Technologies"
    ) ||
    has(
      "Digital Technologies"
    )
  ) {

    opportunities.push(
      "Frame the learning around an authentic problem or need where students investigate, plan, create, test and explain a solution."
    );

  }


  // ----------------------------------------------------------
  // HASS + Arts
  // ----------------------------------------------------------

  if (
    has(
      "HASS"
    ) &&
    [
      "Dance",
      "Drama",
      "Media Arts",
      "Music",
      "Visual Arts"
    ]
      .some(
        (subject) =>
          has(
            subject
          )
      )
  ) {

    opportunities.push(
      "Represent historical, geographical, civic or cultural understanding through an Arts response while keeping the HASS disciplinary evidence visible."
    );

  }


  // ----------------------------------------------------------
  // HPE + English
  // ----------------------------------------------------------

  if (
    has(
      "HPE"
    ) &&
    has(
      "English"
    )
  ) {

    opportunities.push(
      "Use health, wellbeing, relationships or movement content as the context for explaining, persuading, reflecting or presenting to an authentic audience."
    );

  }


  // ----------------------------------------------------------
  // Investigation / evidence
  // ----------------------------------------------------------

  if (
    /investigat|data|evidence|source|observe|collect|measure/.test(
      text
    )
  ) {

    opportunities.push(
      "Use one investigation, source set or data collection task to generate information that can then be interpreted and communicated across more than one learning area."
    );

  }


  // ----------------------------------------------------------
  // Product / performance
  // ----------------------------------------------------------

  if (
    /create|produce|perform|present|communicat|construct/.test(
      text
    )
  ) {

    opportunities.push(
      "Use one authentic final product, presentation or performance to demonstrate multiple curriculum demands where the required evidence naturally overlaps."
    );

  }


  // ----------------------------------------------------------
  // Perspective / representation
  // ----------------------------------------------------------

  if (
    /perspective|viewpoint|representation|audience/.test(
      text
    )
  ) {

    opportunities.push(
      "Compare how the same idea, issue, event or experience can be represented differently for different audiences, purposes or perspectives."
    );

  }


  // ----------------------------------------------------------
  // Sustainability / place
  // ----------------------------------------------------------

  if (
    /sustainab|environment|place|resource|care/.test(
      text
    )
  ) {

    opportunities.push(
      "Use a local place, environmental issue or community need as an authentic context for investigation, communication and decision-making."
    );

  }


  if (
    !opportunities.length
  ) {

    opportunities.push(
      `Look for one meaningful product, investigation or performance where ${subjects.join(" + ")} can each contribute authentic learning and evidence.`
    );

  }


  return opportunities;

}


// ============================================================
// POSSIBLE INTEGRATION NOTES
// ============================================================

function buildIntegrationNotes(
  subjects,
  areas
) {

  const notes = [];


  notes.push(
    "Identify which selected Achievement Standard aspects can genuinely be taught together and which require explicit subject-specific teaching."
  );


  notes.push(
    "Avoid repeating the same knowledge in separate lessons when it can be authentically revisited through another learning area."
  );


  notes.push(
    "Keep the cognitive demand of each selected Achievement Standard aspect visible when designing integrated learning experiences."
  );


  notes.push(
    "Use shared vocabulary across learning areas, while retaining subject-specific Tier 3 terminology where disciplinary precision is required."
  );


  if (
    subjects.length >
    1
  ) {

    notes.push(
      `Make the contribution of each learning area explicit: ${subjects.join(", ")}.`
    );

  }


  if (
    areas.length
  ) {

    notes.push(
      `Current curriculum areas represented include ${areas.join(", ")}.`
    );

  }


  return notes;

}


// ============================================================
// ADD CONFIRMED INTEGRATION CONNECTION
// ============================================================

function bindAddConnectionButton() {

  const button =
    document.getElementById(
      "addIntegrationConnection"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      unitPlan.integration
        .connections
        .push({

          learningAreas:
            "",

          connection:
            "",

          evidence:
            ""

        });


      renderIntegrationConnections();

    }
  );

}


// ============================================================
// RENDER CONFIRMED CONNECTIONS
// ============================================================

function renderIntegrationConnections() {

  const container =
    findConnectionContainer();


  if (!container) {
    return;
  }


  const connections =
    unitPlan.integration
      .connections ||
    [];


  if (
    !connections.length
  ) {

    container.innerHTML = "";

    return;

  }


  container.innerHTML =
    connections
      .map(
        connectionCardHtml
      )
      .join("");


  bindConnectionEvents(
    container
  );

}


// ============================================================
// FIND CONNECTION CONTAINER
// ============================================================

function findConnectionContainer() {

  return (
    document.getElementById(
      "integrationConnections"
    ) ||

    document.getElementById(
      "confirmedIntegrationConnections"
    ) ||

    document.getElementById(
      "connectionsContainer"
    )
  );

}


// ============================================================
// CONNECTION CARD
// ============================================================

function connectionCardHtml(
  connection,
  index
) {

  return `

    <article
      class="integration-connection"
      data-connection-index="${index}"
    >

      <div class="connection-head">

        <h3>
          Connection ${index + 1}
        </h3>


        <button
          type="button"
          class="remove-integration-connection"
          data-remove-connection="${index}"
        >
          Remove
        </button>

      </div>


      <label>

        Learning areas

        <input
          type="text"
          class="connection-learning-areas"
          value="${escapeAttribute(
            connection.learningAreas ||
            ""
          )}"
          placeholder="e.g. HASS, English"
        >

      </label>


      <label>

        How do these curriculum demands connect?

        <textarea
          class="connection-description"
          rows="3"
          placeholder="Describe the authentic teaching or learning connection."
        >${escapeHtml(
          connection.connection ||
          ""
        )}</textarea>

      </label>


      <label>

        Evidence / planning note

        <textarea
          class="connection-evidence"
          rows="3"
          placeholder="Could one learning experience provide evidence for both? What still needs separate teaching or evidence?"
        >${escapeHtml(
          connection.evidence ||
          ""
        )}</textarea>

      </label>

    </article>

  `;

}


// ============================================================
// CONNECTION EVENTS
// ============================================================

function bindConnectionEvents(
  container
) {

  container
    .querySelectorAll(
      ".integration-connection"
    )
    .forEach(
      (card) => {

        const index =
          Number(
            card.dataset
              .connectionIndex
          );


        const connection =
          unitPlan.integration
            .connections[
              index
            ];


        if (!connection) {
          return;
        }


        card
          .querySelector(
            ".connection-learning-areas"
          )
          ?.addEventListener(
            "input",
            (event) => {

              connection
                .learningAreas =
                  event.target.value;

            }
          );


        card
          .querySelector(
            ".connection-description"
          )
          ?.addEventListener(
            "input",
            (event) => {

              connection
                .connection =
                  event.target.value;

            }
          );


        card
          .querySelector(
            ".connection-evidence"
          )
          ?.addEventListener(
            "input",
            (event) => {

              connection
                .evidence =
                  event.target.value;

            }
          );

      }
    );


  container
    .querySelectorAll(
      "[data-remove-connection]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset
                  .removeConnection
              );


            unitPlan.integration
              .connections
              .splice(
                index,
                1
              );


            renderIntegrationConnections();

          }
        );

      }
    );

}


// ============================================================
// SET FIELD VALUE
// ============================================================

function setFieldValue(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {
    return;
  }


  element.value =
    value ||
    "";

}


// ============================================================
// ESCAPE HTML
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


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  );

}