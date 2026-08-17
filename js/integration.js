import {
  unitPlan,
  updateUnitPlan
} from "./state.js";

import {
  getSelectedCurriculumRows
} from "./curriculum.js";

import {
  getVocabularyForArea,
  uniqueWords,
  vocabularyLevelFor
} from "./vocabulary-data.js";


// ============================================================
// STEP 3 — INTEGRATION
// ============================================================

export function initIntegrationPage() {

  ensureIntegrationState();

  loadSavedIntegration();

  bindIntegrationFields();

  bindVocabularyRefresh();

  bindSuggestPossibilities();

  bindAddConnection();

  bindSuggestionActions();

  renderConnections();

  buildCurriculumVocabulary();

}


// ============================================================
// ENSURE STATE EXISTS
// ============================================================

function ensureIntegrationState() {

  if (
    !unitPlan.integration ||
    typeof unitPlan.integration !== "object"
  ) {

    updateUnitPlan(
      "integration",
      {}
    );

  }


  if (
    !Array.isArray(
      unitPlan.integration?.connections
    )
  ) {

    updateUnitPlan(
      "integration.connections",
      []
    );

  }

}


// ============================================================
// LOAD SAVED INFORMATION
// ============================================================

function loadSavedIntegration() {

  const integration =
    unitPlan.integration || {};


  setValue(
    "bigIdea",
    integration.bigIdea ||
    integration.sharedConcept ||
    ""
  );


  setValue(
    "authentic",
    integration.authenticContext ||
    integration.authentic ||
    ""
  );


  setValue(
    "terminology",
    integration.terminology ||
    integration.keyTerminology ||
    ""
  );


  setValue(
    "integrationNotes",
    integration.integrationNotes ||
    integration.notes ||
    ""
  );

}


// ============================================================
// BIND MAIN FIELDS
// ============================================================

function bindIntegrationFields() {

  bindTextField(
    "bigIdea",
    "integration.bigIdea"
  );


  bindTextField(
    "authentic",
    "integration.authenticContext"
  );


  bindTextField(
    "integrationNotes",
    "integration.integrationNotes"
  );


  const terminology =
    document.getElementById(
      "terminology"
    );


  if (
    terminology
  ) {

    terminology.addEventListener(
      "input",
      () => {

        updateUnitPlan(
          "integration.terminology",
          terminology.value
        );


        updateUnitPlan(
          "integration.vocabularyEditedByTeacher",
          true
        );

      }
    );

  }

}


// ============================================================
// GENERIC TEXT FIELD
// ============================================================

function bindTextField(
  elementId,
  statePath
) {

  const element =
    document.getElementById(
      elementId
    );


  if (
    !element
  ) {

    return;

  }


  element.addEventListener(
    "input",
    () => {

      updateUnitPlan(
        statePath,
        element.value
      );

    }
  );

}


// ============================================================
// AUTOMATIC CURRICULUM VOCABULARY
// ============================================================

function buildCurriculumVocabulary(
  force = false
) {

  const field =
    document.getElementById(
      "terminology"
    );


  if (
    !field
  ) {

    return;

  }


  const rows =
    getSelectedCurriculumRows();


  if (
    !rows.length
  ) {

    if (
      !field.value.trim()
    ) {

      field.placeholder =
        "Select Achievement Standard aspects in Step 2 to automatically build the curriculum vocabulary demands.";

    }


    showVocabularyMessage(
      "Select Achievement Standard aspects in Step 2 and the matching vocabulary will appear here."
    );


    return;

  }


  const signature =
    curriculumSignature(
      rows
    );


  const previousSignature =
    unitPlan.integration
      ?.vocabularySignature ||
    "";


  const teacherEdited =
    Boolean(
      unitPlan.integration
        ?.vocabularyEditedByTeacher
    );


  const fieldEmpty =
    !field.value.trim();


  const curriculumChanged =
    signature !==
    previousSignature;


  // ----------------------------------------------------------
  // Automatically build:
  // - first visit
  // - empty field
  // - curriculum changed and teacher has not edited
  // - teacher deliberately presses Refresh
  // ----------------------------------------------------------

  const shouldBuild =
    force ||
    fieldEmpty ||
    (
      curriculumChanged &&
      !teacherEdited
    );


  if (
    !shouldBuild
  ) {

    showVocabularyMessage(
      "The Step 2 curriculum has changed, but your vocabulary contains teacher edits. Use Refresh curriculum vocabulary if you want to rebuild it."
    );


    return;

  }


  const plan =
    createVocabularyPlan(
      rows
    );


  const text =
    formatVocabularyPlan(
      plan
    );


  field.value =
    text;


  updateUnitPlan(
    "integration.terminology",
    text
  );


  updateUnitPlan(
    "integration.vocabularyPlan",
    plan
  );


  updateUnitPlan(
    "integration.vocabularySignature",
    signature
  );


  updateUnitPlan(
    "integration.vocabularyEditedByTeacher",
    false
  );


  showVocabularyMessage(
    "Tier 2 and Tier 3 vocabulary has been drawn automatically from the vocabulary scope and sequence using the Achievement Standard aspects selected in Step 2."
  );

}


// ============================================================
// CREATE VOCABULARY PLAN
// ============================================================

function createVocabularyPlan(
  rows
) {

  const grouped =
    groupCurriculumRows(
      rows
    );


  const result = [];


  grouped.forEach(
    (group) => {

      const vocabulary =
        getVocabularyForArea(
          group.subject,
          group.yearLevel,
          group.area
        );


      if (
        !vocabulary.tier2?.length &&
        !vocabulary.tier3?.length
      ) {

        return;

      }


      const achievementText =
        group.rows
          .map(
            (row) =>
              row.text || ""
          )
          .join(
            " "
          );


      result.push({

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
          displayVocabularyArea(
            group.subject,
            group.area
          ),

        tier2:
          prioritiseWords(
            vocabulary.tier2,
            achievementText,
            10
          ),

        tier3:
          prioritiseWords(
            vocabulary.tier3,
            achievementText,
            10
          )

      });

    }
  );


  return result;

}


// ============================================================
// GROUP SELECTED CURRICULUM
// ============================================================

function groupCurriculumRows(
  rows
) {

  const groups =
    new Map();


  rows.forEach(
    (row) => {

      const subject =
        row.subject ||
        row.learningArea ||
        "";


      const grade =
        row.grade ||
        row.yearLevel ||
        "";


      const area =
        row.area ||
        inferAreaFromText(
          row
        );


      if (
        !subject ||
        !grade
      ) {

        return;

      }


      const key =
        [
          subject,
          grade,
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
            yearLevel:
              grade,
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


  return [
    ...groups.values()
  ];

}


// ============================================================
// DISPLAY AREA
// ============================================================

function displayVocabularyArea(
  subject,
  area
) {

  const text =
    String(
      area ||
      ""
    );


  // Make the teacher-facing heading cleaner if curriculum
  // area contains sublabels such as:
  // "Knowledge & Understanding — Data"

  if (
    subject ===
      "Digital Technologies" ||
    subject ===
      "Design and Technologies"
  ) {

    if (
      /algorithm|privacy|security|data/i.test(
        text
      )
    ) {

      return text;

    }

  }


  return text;

}


// ============================================================
// FALLBACK AREA INFERENCE
//
// Most curriculum rows already contain row.area.
// This is only used if one does not.
// ============================================================

function inferAreaFromText(
  row
) {

  const subject =
    row.subject || "";


  const text =
    String(
      row.text || ""
    )
      .toLowerCase();


  if (
    subject ===
    "English"
  ) {

    if (
      /character|setting|plot|literary|literature|poem|narrative/.test(
        text
      )
    ) {

      return "Literature";

    }


    if (
      /read|view|comprehend|create|write|speak|listen|audience/.test(
        text
      )
    ) {

      return "Literacy";

    }


    return "Language";

  }


  if (
    subject ===
    "Mathematics"
  ) {

    if (
      /chance|probab|likelihood/.test(
        text
      )
    ) {

      return "Probability";

    }


    if (
      /data|statistic|graph|distribution/.test(
        text
      )
    ) {

      return "Statistics";

    }


    if (
      /shape|angle|position|location|transform|symmetry/.test(
        text
      )
    ) {

      return "Space";

    }


    if (
      /measure|length|mass|capacity|area|perimeter|time|volume/.test(
        text
      )
    ) {

      return "Measurement";

    }


    if (
      /pattern|rule|equation|unknown|variable|equival/.test(
        text
      )
    ) {

      return "Algebra";

    }


    return "Number";

  }


  if (
    subject ===
    "Science"
  ) {

    if (
      /living|organism|habitat|life cycle|survival|adapt/.test(
        text
      )
    ) {

      return "Biological Sciences";

    }


    if (
      /material|solid|liquid|gas|chemical|property/.test(
        text
      )
    ) {

      return "Chemical Sciences";

    }


    if (
      /earth|sun|moon|space|weather|planet/.test(
        text
      )
    ) {

      return "Earth & Space Sciences";

    }


    if (
      /force|energy|heat|light|electric/.test(
        text
      )
    ) {

      return "Physical Sciences";

    }


    return "Science Inquiry";

  }


  if (
    subject ===
    "HASS"
  ) {

    if (
      /past|history|historical|change|significance|chronolog/.test(
        text
      )
    ) {

      return "History";

    }


    if (
      /place|geograph|environment|map|location|climate/.test(
        text
      )
    ) {

      return "Geography";

    }


    if (
      /citizen|democracy|government|law|rule/.test(
        text
      )
    ) {

      return "Civics & Citizenship";

    }


    if (
      /economic|consumer|producer|scarcity|financial/.test(
        text
      )
    ) {

      return "Economics & Business";

    }


    return "HASS Skills";

  }


  if (
    subject ===
    "HPE"
  ) {

    if (
      /movement|physical|fitness|game|skill/.test(
        text
      )
    ) {

      return "Movement & Physical Activity";

    }


    if (
      /relationship|safe|safety|consent|protect/.test(
        text
      )
    ) {

      return "Relationships & Safety";

    }


    return "Personal, Social & Community Health";

  }


  return subject;

}


// ============================================================
// PRIORITISE VOCABULARY
// ============================================================

function prioritiseWords(
  words,
  achievementText,
  maximum = 10
) {

  const text =
    normaliseText(
      achievementText
    );


  const ranked =
    uniqueWords(
      words || []
    )
      .map(
        (
          word,
          index
        ) => {

          return {

            word,

            index,

            score:
              wordScore(
                word,
                text
              )

          };

        }
      );


  ranked.sort(
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


  return ranked
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
// WORD RELEVANCE SCORE
// ============================================================

function wordScore(
  word,
  achievementText
) {

  const target =
    normaliseText(
      word
    );


  if (
    !target
  ) {

    return 0;

  }


  let score = 0;


  if (
    achievementText.includes(
      target
    )
  ) {

    score +=
      target.includes(
        " "
      )
        ? 15
        : 12;

  }


  target
    .split(
      " "
    )
    .filter(
      (part) =>
        part.length >= 4
    )
    .forEach(
      (part) => {

        if (
          achievementText.includes(
            part
          )
        ) {

          score += 3;

        }

      }
    );


  return score;

}


// ============================================================
// FORMAT VOCABULARY
// ============================================================

function formatVocabularyPlan(
  plan
) {

  if (
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
// REFRESH VOCABULARY BUTTON
// ============================================================

function bindVocabularyRefresh() {

  document
    .getElementById(
      "refreshVocabulary"
    )
    ?.addEventListener(
      "click",
      () => {

        updateUnitPlan(
          "integration.vocabularyEditedByTeacher",
          false
        );


        buildCurriculumVocabulary(
          true
        );

      }
    );

}


// ============================================================
// SHOW VOCABULARY MESSAGE
// ============================================================

function showVocabularyMessage(
  message
) {

  const output =
    document.getElementById(
      "vocabularyStatus"
    );


  if (
    output
  ) {

    output.innerHTML = `

      <strong>
        Curriculum vocabulary
      </strong>

      <p>
        ${escapeHtml(
          message
        )}
      </p>

    `;

  }

}


// ============================================================
// SUGGEST POSSIBILITIES
// ============================================================

function bindSuggestPossibilities() {

  document
    .getElementById(
      "integrationSuggest"
    )
    ?.addEventListener(
      "click",
      showIntegrationSuggestions
    );

}


// ============================================================
// SHOW INTEGRATION SUGGESTIONS
// ============================================================

function showIntegrationSuggestions() {

  const rows =
    getSelectedCurriculumRows();


  const output =
    document.getElementById(
      "integrationSuggestions"
    );


  if (
    !output
  ) {

    return;

  }


  if (
    rows.length <
    2
  ) {

    output.innerHTML = `

      <div class="empty">

        Select at least two Achievement Standard aspects
        in Step 2 before generating integration
        suggestions.

      </div>

    `;


    return;

  }


  const suggestions =
    createIntegrationSuggestions(
      rows
    );


  output.innerHTML = `

    <div class="integration-suggestion-group">

      <h3>
        Possible conceptual connections
      </h3>

      <p class="helper">
        Choose a conceptual lens that genuinely connects
        the selected curriculum.
      </p>


      <div class="integration-suggestion-list">

        ${
          suggestions.concepts
            .map(
              (
                suggestion,
                index
              ) => `

                <article class="integration-suggestion-card">

                  <p>
                    ${escapeHtml(
                      suggestion.text
                    )}
                  </p>

                  <button
                    type="button"
                    class="integration-use-button"
                    data-use-concept="${index}"
                  >
                    Use this concept
                  </button>

                </article>

              `
            )
            .join("")
        }

      </div>

    </div>


    <div class="integration-suggestion-group">

      <h3>
        Possible authentic integration opportunities
      </h3>

      <ul class="integration-suggestion-bullets">

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


    <div class="integration-suggestion-group">

      <h3>
        Possible integration notes
      </h3>


      <div class="integration-suggestion-list">

        ${
          suggestions.notes
            .map(
              (
                note,
                index
              ) => `

                <article class="integration-suggestion-card">

                  <p>
                    ${escapeHtml(
                      note
                    )}
                  </p>

                  <button
                    type="button"
                    class="integration-use-button"
                    data-use-note="${index}"
                  >
                    Add to integration notes
                  </button>

                </article>

              `
            )
            .join("")
        }

      </div>

    </div>


    <p class="helper integration-caution">

      These are planning prompts, not prescribed
      connections. Keep each selected Achievement
      Standard aspect visible and retain explicit
      disciplinary teaching where required.

    </p>

  `;


  output._suggestionData =
    suggestions;


  bindSuggestionActions();

}


// ============================================================
// CREATE INTEGRATION SUGGESTIONS
// ============================================================

function createIntegrationSuggestions(
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
          row.area ||
          inferAreaFromText(
            row
          )
      )
    );


  const text =
    normaliseText(
      rows
        .map(
          (row) =>
            row.text || ""
        )
        .join(
          " "
        )
    );


  return {

    concepts:
      buildConcepts(
        text,
        subjects
      )
        .slice(
          0,
          5
        ),

    opportunities:
      buildOpportunities(
        text,
        subjects
      )
        .slice(
          0,
          5
        ),

    notes:
      buildNotes(
        subjects,
        areas
      )
        .slice(
          0,
          5
        )

  };

}


// ============================================================
// CONCEPTUAL CONNECTIONS
// ============================================================

function buildConcepts(
  text,
  subjects
) {

  const concepts = [];


  addConcept(
    concepts,
    text,
    /change|continuity|develop|adapt|transform|growth/,
    "Change",
    "How people, places, ideas, systems or living things change and what stays the same."
  );


  addConcept(
    concepts,
    text,
    /cause|effect|impact|influence|consequence|result/,
    "Cause and effect",
    "How actions, events, choices or processes lead to consequences."
  );


  addConcept(
    concepts,
    text,
    /connection|relationship|interconnection|interact/,
    "Connections",
    "How people, environments, systems, ideas or texts are connected."
  );


  addConcept(
    concepts,
    text,
    /perspective|viewpoint|point of view|representation/,
    "Perspective",
    "How ideas, events or experiences can be understood and represented differently."
  );


  addConcept(
    concepts,
    text,
    /audience|purpose|communicat|message|inform|persuad/,
    "Communication",
    "How ideas are shaped and communicated for different purposes and audiences."
  );


  addConcept(
    concepts,
    text,
    /identity|belong|culture|community|heritage/,
    "Identity and belonging",
    "How people understand themselves and their connections to groups, cultures and communities."
  );


  addConcept(
    concepts,
    text,
    /sustainab|resource|environment|care|manage|responsib/,
    "Sustainability and responsibility",
    "How decisions and actions affect people, places, environments and resources."
  );


  addConcept(
    concepts,
    text,
    /evidence|source|data|investigat|observe/,
    "Evidence",
    "How evidence, observations, sources and data support understanding and conclusions."
  );


  addConcept(
    concepts,
    text,
    /design|solution|problem|criteria|test|improve/,
    "Problem solving and design",
    "How ideas and solutions are developed, tested, evaluated and improved."
  );


  addConcept(
    concepts,
    text,
    /pattern|sequence|structure|organis|relationship/,
    "Patterns and structure",
    "How information, ideas, processes and systems are organised."
  );


  if (
    !concepts.length
  ) {

    concepts.push({

      title:
        "Connections",

      text:
        `Connections — explore a meaningful relationship between the selected learning in ${subjects.join(" and ")}.`

    });

  }


  return concepts;

}


// ============================================================
// ADD CONCEPT WHEN MATCHED
// ============================================================

function addConcept(
  list,
  text,
  pattern,
  title,
  description
) {

  if (
    pattern.test(
      text
    )
  ) {

    list.push({

      title,

      text:
        `${title} — ${description}`

    });

  }

}


// ============================================================
// AUTHENTIC INTEGRATION OPPORTUNITIES
// ============================================================

function buildOpportunities(
  text,
  subjects
) {

  const results = [];


  const has =
    (subject) =>
      subjects.includes(
        subject
      );


  const artsSubjects = [
    "Dance",
    "Drama",
    "Media Arts",
    "Music",
    "Visual Arts"
  ];


  const hasArts =
    artsSubjects.some(
      has
    );


  if (
    has("English") &&
    has("HASS")
  ) {

    results.push(
      "Use HASS knowledge, sources or inquiry as the content students read, discuss and communicate through English."
    );

  }


  if (
    has("English") &&
    has("Science")
  ) {

    results.push(
      "Use scientific knowledge, investigations and evidence as meaningful content for English reading, explanation, discussion or text creation."
    );

  }


  if (
    has("English") &&
    hasArts
  ) {

    results.push(
      "Use an Arts product, media work or performance as an authentic communication context, with English supporting audience, purpose and language choices where aligned."
    );

  }


  if (
    has("HASS") &&
    hasArts
  ) {

    results.push(
      "Represent historical, geographical, civic or cultural understanding through an Arts response while keeping the HASS evidence explicit."
    );

  }


  if (
    has("HPE") &&
    has("English")
  ) {

    results.push(
      "Use health, relationships, wellbeing or movement learning as the authentic content for explaining, persuading, reflecting or presenting."
    );

  }


  if (
    has(
      "Design and Technologies"
    ) ||
    has(
      "Digital Technologies"
    )
  ) {

    results.push(
      "Frame learning around an authentic problem or need in which students investigate, plan, create, test and communicate a solution."
    );

  }


  if (
    /source|evidence|investigat|data|observe|measure/.test(
      text
    )
  ) {

    results.push(
      "Use one investigation, source set or collection of evidence to generate knowledge that can be interpreted and communicated across learning areas."
    );

  }


  if (
    /create|produce|perform|present|construct|communicat/.test(
      text
    )
  ) {

    results.push(
      "Use one authentic product, presentation or performance to provide evidence across learning areas where the curriculum demands genuinely overlap."
    );

  }


  if (
    /perspective|viewpoint|representation|audience/.test(
      text
    )
  ) {

    results.push(
      "Compare how the same idea, issue or experience can be represented differently depending on perspective, purpose or audience."
    );

  }


  if (
    /environment|place|resource|sustainab|community/.test(
      text
    )
  ) {

    results.push(
      "Use a local place, community need or environmental issue as an authentic shared context for investigation, decision-making and communication."
    );

  }


  if (
    !results.length
  ) {

    results.push(
      `Look for one authentic investigation, product or performance where ${subjects.join(" + ")} can each contribute meaningful learning and evidence.`
    );

  }


  return uniqueWords(
    results
  );

}


// ============================================================
// INTEGRATION NOTES
// ============================================================

function buildNotes(
  subjects,
  areas
) {

  const notes = [

    "Identify which Achievement Standard aspects can genuinely be taught together and which still require explicit subject-specific teaching.",

    "Avoid repeating the same knowledge in separate lessons when it can be authentically revisited through another learning area.",

    "Keep the cognitive demand of each selected Achievement Standard aspect visible when planning integrated learning experiences.",

    "Use shared Tier 2 vocabulary across learning areas where appropriate, while retaining Tier 3 disciplinary terminology for precision.",

    "Make sure integrated assessment does not accidentally reduce or combine curriculum evidence that needs to remain distinct."

  ];


  if (
    subjects.length >
    1
  ) {

    notes.push(
      `Make the contribution of each selected learning area explicit: ${subjects.join(", ")}.`
    );

  }


  if (
    areas.length
  ) {

    notes.push(
      `The selected curriculum currently spans: ${areas.join(", ")}.`
    );

  }


  return uniqueWords(
    notes
  );

}


// ============================================================
// USE THIS SUGGESTION BUTTONS
// ============================================================

function bindSuggestionActions() {

  const output =
    document.getElementById(
      "integrationSuggestions"
    );


  if (
    !output ||
    !output._suggestionData
  ) {

    return;

  }


  const suggestions =
    output._suggestionData;


  output
    .querySelectorAll(
      "[data-use-concept]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset
                  .useConcept
              );


            const concept =
              suggestions.concepts[
                index
              ];


            if (
              !concept
            ) {

              return;

            }


            const field =
              document.getElementById(
                "bigIdea"
              );


            if (
              field
            ) {

              field.value =
                concept.text;


              updateUnitPlan(
                "integration.bigIdea",
                concept.text
              );

            }

          }
        );

      }
    );


  output
    .querySelectorAll(
      "[data-use-note]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset
                  .useNote
              );


            const note =
              suggestions.notes[
                index
              ];


            if (
              !note
            ) {

              return;

            }


            const field =
              document.getElementById(
                "integrationNotes"
              );


            if (
              !field
            ) {

              return;

            }


            const existing =
              field.value.trim();


            const updated =
              existing
                ? `${existing}\n• ${note}`
                : `• ${note}`;


            field.value =
              updated;


            updateUnitPlan(
              "integration.integrationNotes",
              updated
            );

          }
        );

      }
    );

}


// ============================================================
// ADD CONFIRMED CONNECTION
// ============================================================

function bindAddConnection() {

  document
    .getElementById(
      "addIntegrationConnection"
    )
    ?.addEventListener(
      "click",
      () => {

        const connections =
          [
            ...(
              unitPlan.integration
                ?.connections ||
              []
            )
          ];


        connections.push({

          learningAreas:
            "",

          connection:
            "",

          evidence:
            ""

        });


        updateUnitPlan(
          "integration.connections",
          connections
        );


        renderConnections();

      }
    );

}


// ============================================================
// RENDER CONNECTIONS
// ============================================================

function renderConnections() {

  const container =
    getConnectionContainer();


  if (
    !container
  ) {

    return;

  }


  const connections =
    unitPlan.integration
      ?.connections ||
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
        (
          connection,
          index
        ) => `

          <article
            class="integration-connection"
            data-connection-index="${index}"
          >

            <div class="connection-head">

              <strong>
                Connection ${index + 1}
              </strong>


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
                class="connection-learning-areas"
                value="${escapeAttribute(
                  connection.learningAreas ||
                  ""
                )}"
                placeholder="e.g. English + HASS"
              >

            </label>


            <label>

              How do these curriculum demands connect?

              <textarea
                class="connection-description"
                rows="3"
                placeholder="Describe the authentic connection."
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
                placeholder="What evidence can be shared? What still needs to remain discrete?"
              >${escapeHtml(
                connection.evidence ||
                ""
              )}</textarea>

            </label>

          </article>

        `
      )
      .join("");


  bindConnectionEvents(
    container
  );

}


// ============================================================
// FIND CONNECTION CONTAINER
// ============================================================

function getConnectionContainer() {

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


        card
          .querySelector(
            ".connection-learning-areas"
          )
          ?.addEventListener(
            "input",
            (event) => {

              updateConnection(
                index,
                "learningAreas",
                event.target.value
              );

            }
          );


        card
          .querySelector(
            ".connection-description"
          )
          ?.addEventListener(
            "input",
            (event) => {

              updateConnection(
                index,
                "connection",
                event.target.value
              );

            }
          );


        card
          .querySelector(
            ".connection-evidence"
          )
          ?.addEventListener(
            "input",
            (event) => {

              updateConnection(
                index,
                "evidence",
                event.target.value
              );

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


            const connections =
              [
                ...(
                  unitPlan.integration
                    ?.connections ||
                  []
                )
              ];


            connections.splice(
              index,
              1
            );


            updateUnitPlan(
              "integration.connections",
              connections
            );


            renderConnections();

          }
        );

      }
    );

}


// ============================================================
// UPDATE CONNECTION
// ============================================================

function updateConnection(
  index,
  field,
  value
) {

  const connections =
    (
      unitPlan.integration
        ?.connections ||
      []
    )
      .map(
        (connection) => ({
          ...connection
        })
      );


  if (
    !connections[
      index
    ]
  ) {

    return;

  }


  connections[
    index
  ][
    field
  ] =
    value;


  updateUnitPlan(
    "integration.connections",
    connections
  );

}


// ============================================================
// CURRICULUM SIGNATURE
// ============================================================

function curriculumSignature(
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
// NORMALISE TEXT
// ============================================================

function normaliseText(
  value
) {

  return String(
    value || ""
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
// SET VALUE
// ============================================================

function setValue(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (
    element
  ) {

    element.value =
      value || "";

  }

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