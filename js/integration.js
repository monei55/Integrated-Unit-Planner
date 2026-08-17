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


  if (!terminology) {
    return;
  }


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


  if (!element) {
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


  if (!field) {
    return;
  }


  const rows =
    getSelectedCurriculumRows();


  if (!rows.length) {

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


  const shouldBuild =
    force ||
    fieldEmpty ||
    (
      curriculumChanged &&
      !teacherEdited
    );


  if (!shouldBuild) {

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
          group.area,

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
        normaliseCurriculumArea(
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
// NORMALISE CURRICULUM AREA
// ============================================================

function normaliseCurriculumArea(
  row
) {

  const subject =
    row.subject || "";


  const area =
    String(
      row.area || ""
    );


  const lower =
    area.toLowerCase();


  if (
    subject === "English"
  ) {

    if (
      /literature|literary/.test(
        lower
      )
    ) {
      return "Literature";
    }


    if (
      /literacy|reading|viewing|writing|creating|speaking|listening/.test(
        lower
      )
    ) {
      return "Literacy";
    }


    return inferAreaFromText(
      row
    );

  }


  if (
    subject === "Science"
  ) {

    if (
      /biological|living/.test(
        lower
      )
    ) {
      return "Biological Sciences";
    }


    if (
      /chemical|material/.test(
        lower
      )
    ) {
      return "Chemical Sciences";
    }


    if (
      /earth|space/.test(
        lower
      )
    ) {
      return "Earth & Space Sciences";
    }


    if (
      /physical/.test(
        lower
      )
    ) {
      return "Physical Sciences";
    }


    if (
      /inquiry|skill/.test(
        lower
      )
    ) {
      return "Science Inquiry";
    }

  }


  if (
    subject === "HASS"
  ) {

    if (/history/.test(lower)) {
      return "History";
    }

    if (/geograph/.test(lower)) {
      return "Geography";
    }

    if (/civic/.test(lower)) {
      return "Civics & Citizenship";
    }

    if (
      /economic|business/.test(
        lower
      )
    ) {
      return "Economics & Business";
    }

    if (
      /skill|inquiry/.test(
        lower
      )
    ) {
      return "HASS Skills";
    }

  }


  if (
    subject === "Mathematics"
  ) {

    const areas = [
      "Number",
      "Algebra",
      "Measurement",
      "Space",
      "Statistics",
      "Probability"
    ];


    const found =
      areas.find(
        (candidate) =>
          lower.includes(
            candidate.toLowerCase()
          )
      );


    if (found) {
      return found;
    }

  }


  if (
    subject === "HPE"
  ) {

    if (
      /movement|physical/.test(
        lower
      )
    ) {
      return "Movement & Physical Activity";
    }


    if (
      /relationship|safety/.test(
        lower
      )
    ) {
      return "Relationships & Safety";
    }


    if (
      /skill|wellbeing/.test(
        lower
      )
    ) {
      return "Health & Wellbeing Skills";
    }


    return "Personal, Social & Community Health";

  }


  if (
    subject ===
    "Design and Technologies"
  ) {

    if (
      /process|production|skill/.test(
        lower
      )
    ) {

      return "Processes & Production Skills";

    }


    return "Design & Technologies";

  }


  if (
    subject ===
    "Digital Technologies"
  ) {

    if (
      /process|production|algorithm|data|privacy|security|skill/.test(
        lower
      )
    ) {

      return "Digital Skills & Safety";

    }


    return "Digital Technologies";

  }


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
    area ||
    inferAreaFromText(
      row
    )
  );

}


// ============================================================
// FALLBACK AREA INFERENCE
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
    subject === "English"
  ) {

    if (
      /character|setting|plot|literary|poem|narrative/.test(
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
    subject === "Science"
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
    subject === "HASS"
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


  return (
    row.area ||
    subject
  );

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
        ) => ({

          word,

          index,

          score:
            wordScore(
              word,
              text
            )

        })
      );


  ranked.sort(
    (
      a,
      b
    ) => {

      if (
        b.score !== a.score
      ) {
        return b.score - a.score;
      }


      return a.index - b.index;

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
// WORD RELEVANCE
// ============================================================

function wordScore(
  word,
  achievementText
) {

  const target =
    normaliseText(
      word
    );


  if (!target) {
    return 0;
  }


  let score = 0;


  if (
    achievementText.includes(
      target
    )
  ) {

    score +=
      target.includes(" ")
        ? 15
        : 12;

  }


  target
    .split(" ")
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

  if (!plan.length) {
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
// REFRESH VOCABULARY
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
// VOCABULARY MESSAGE
// ============================================================

function showVocabularyMessage(
  message
) {

  const output =
    document.getElementById(
      "vocabularyStatus"
    );


  if (!output) {
    return;
  }


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


// ============================================================
// SUGGEST POSSIBILITIES BUTTON
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
// GENERATE ALL STEP 3 SUGGESTIONS
// ============================================================

function showIntegrationSuggestions() {

  const rows =
    getSelectedCurriculumRows();


  const output =
    document.getElementById(
      "integrationSuggestions"
    );


  if (!output) {
    return;
  }


  if (
    rows.length <
    2
  ) {

    output.innerHTML = `

      <div class="empty">

        Select at least two Achievement Standard aspects
        in Step 2 before generating integration ideas.

      </div>

    `;


    return;

  }


  const suggestions =
    createIntegrationSuggestions(
      rows
    );


  output.innerHTML = `

    <!-- ===============================================
         SHARED CONCEPT / BIG IDEA
         =============================================== -->

    <div class="integration-suggestion-group">

      <h3>
        Ideas for shared concept / big idea
      </h3>

      <p class="helper">
        These concepts have been identified from the
        Achievement Standard aspects selected in Step 2.
      </p>


      <div class="integration-suggestion-list">

        ${
          suggestions.concepts
            .map(
              (
                concept,
                index
              ) => `

                <article class="integration-suggestion-card">

                  <strong>
                    ${escapeHtml(
                      concept.title
                    )}
                  </strong>

                  <p>
                    ${escapeHtml(
                      concept.description
                    )}
                  </p>

                  <button
                    type="button"
                    class="integration-use-button"
                    data-use-concept="${index}"
                  >
                    Use this idea
                  </button>

                </article>

              `
            )
            .join("")
        }

      </div>

    </div>


    <!-- ===============================================
         AUTHENTIC CONTEXT
         =============================================== -->

    <div class="integration-suggestion-group">

      <h3>
        Ideas for an authentic context or problem
      </h3>

      <p class="helper">
        Choose or adapt a context that gives students a
        meaningful reason to use the selected learning.
      </p>


      <div class="integration-suggestion-list">

        ${
          suggestions.contexts
            .map(
              (
                context,
                index
              ) => `

                <article class="integration-suggestion-card">

                  <p>
                    ${escapeHtml(
                      context
                    )}
                  </p>

                  <button
                    type="button"
                    class="integration-use-button"
                    data-use-context="${index}"
                  >
                    Use this idea
                  </button>

                </article>

              `
            )
            .join("")
        }

      </div>

    </div>


    <!-- ===============================================
         INTEGRATION OPPORTUNITIES
         =============================================== -->

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


    <!-- ===============================================
         INTEGRATION NOTES
         =============================================== -->

    <div class="integration-suggestion-group">

      <h3>
        Ideas for integration notes
      </h3>

      <p class="helper">
        Add any that are useful, then edit them to reflect
        the unit and the learners.
      </p>


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

      These are starting points rather than prescribed
      connections. Teachers should retain subject-specific
      teaching where it is needed to meet the selected
      Achievement Standard.

    </p>

  `;


  output._integrationSuggestions =
    suggestions;


  bindGeneratedSuggestionButtons();

}


// ============================================================
// CREATE SUGGESTION SET
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
          normaliseCurriculumArea(
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
      buildConceptIdeas(
        text,
        subjects
      )
        .slice(
          0,
          5
        ),

    contexts:
      buildAuthenticContextIdeas(
        text,
        subjects,
        areas
      )
        .slice(
          0,
          5
        ),

    opportunities:
      buildIntegrationOpportunities(
        text,
        subjects
      )
        .slice(
          0,
          5
        ),

    notes:
      buildIntegrationNotes(
        subjects,
        areas
      )
        .slice(
          0,
          6
        )

  };

}


// ============================================================
// CONCEPT IDEAS
// ============================================================

function buildConceptIdeas(
  text,
  subjects
) {

  const concepts = [];


  addConcept(
    concepts,
    text,
    /change|continuity|develop|adapt|transform|growth/,
    "Change",
    "Explore how people, places, ideas, systems or living things change and what remains the same."
  );


  addConcept(
    concepts,
    text,
    /cause|effect|impact|influence|consequence|result/,
    "Cause and effect",
    "Explore how actions, events, decisions or processes lead to outcomes and consequences."
  );


  addConcept(
    concepts,
    text,
    /connection|relationship|interconnection|interact/,
    "Connections",
    "Explore how people, environments, systems, ideas, texts or experiences are connected."
  );


  addConcept(
    concepts,
    text,
    /perspective|viewpoint|point of view|representation/,
    "Perspective",
    "Explore how people interpret and represent ideas, experiences or events differently."
  );


  addConcept(
    concepts,
    text,
    /audience|purpose|communicat|message|inform|persuad/,
    "Communication",
    "Explore how ideas are shaped and communicated for different purposes and audiences."
  );


  addConcept(
    concepts,
    text,
    /identity|belong|culture|community|heritage/,
    "Identity and belonging",
    "Explore how people understand themselves and their connections with groups, cultures, places and communities."
  );


  addConcept(
    concepts,
    text,
    /sustainab|resource|environment|care|manage|responsib/,
    "Sustainability and responsibility",
    "Explore how choices and actions affect people, places, environments and resources."
  );


  addConcept(
    concepts,
    text,
    /evidence|source|data|investigat|observe/,
    "Evidence",
    "Explore how observations, sources, data and evidence help us build and communicate understanding."
  );


  addConcept(
    concepts,
    text,
    /design|solution|problem|criteria|test|improve/,
    "Problem solving and design",
    "Explore how ideas and solutions can be developed, tested, evaluated and improved."
  );


  addConcept(
    concepts,
    text,
    /pattern|sequence|structure|organis/,
    "Patterns and structure",
    "Explore how information, ideas, processes and systems are organised and connected."
  );


  if (
    !concepts.length
  ) {

    concepts.push({

      title:
        "Connections",

      description:
        `Explore the meaningful connections between the selected learning in ${subjects.join(" and ")}.`

    });

  }


  return concepts;

}


// ============================================================
// ADD CONCEPT
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
      description
    });

  }

}


// ============================================================
// AUTHENTIC CONTEXT IDEAS
// ============================================================

function buildAuthenticContextIdeas(
  text,
  subjects,
  areas
) {

  const ideas = [];


  const has =
    (subject) =>
      subjects.includes(
        subject
      );


  const hasArts =
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
      );


  // ----------------------------------------------------------
  // COMMUNITY / LOCAL CONTEXT
  // ----------------------------------------------------------

  if (
    /community|place|environment|identity|belong|history|change/.test(
      text
    ) ||
    has("HASS")
  ) {

    ideas.push(
      "Investigate a local community, place, event or issue and create something that helps others understand why it is important."
    );

  }


  // ----------------------------------------------------------
  // SCIENCE
  // ----------------------------------------------------------

  if (
    has("Science")
  ) {

    ideas.push(
      "Investigate a real-world scientific question or phenomenon, gather evidence and communicate the findings to a relevant audience."
    );

  }


  // ----------------------------------------------------------
  // ENGLISH
  // ----------------------------------------------------------

  if (
    has("English")
  ) {

    ideas.push(
      "Create a text, presentation or multimodal product for a genuine audience using knowledge developed through the other selected learning areas."
    );

  }


  // ----------------------------------------------------------
  // TECHNOLOGIES
  // ----------------------------------------------------------

  if (
    has(
      "Design and Technologies"
    ) ||
    has(
      "Digital Technologies"
    )
  ) {

    ideas.push(
      "Respond to a real or simulated need by designing, creating and improving a product, digital solution or system."
    );

  }


  // ----------------------------------------------------------
  // ARTS
  // ----------------------------------------------------------

  if (
    hasArts
  ) {

    ideas.push(
      "Create an artwork, performance or media product that communicates key ideas, perspectives or learning from the unit to an audience."
    );

  }


  // ----------------------------------------------------------
  // HPE
  // ----------------------------------------------------------

  if (
    has("HPE")
  ) {

    ideas.push(
      "Develop a campaign, resource, routine or presentation that promotes health, wellbeing, safe choices or physical activity for a particular audience."
    );

  }


  // ----------------------------------------------------------
  // PERSPECTIVE
  // ----------------------------------------------------------

  if (
    /perspective|viewpoint|representation/.test(
      text
    )
  ) {

    ideas.push(
      "Explore a shared issue or event from different perspectives and create a product that represents or compares those viewpoints."
    );

  }


  // ----------------------------------------------------------
  // SUSTAINABILITY
  // ----------------------------------------------------------

  if (
    /environment|sustainab|resource|responsib/.test(
      text
    )
  ) {

    ideas.push(
      "Investigate a local environmental or sustainability challenge and propose an action, solution or communication product."
    );

  }


  // ----------------------------------------------------------
  // EVIDENCE
  // ----------------------------------------------------------

  if (
    /source|evidence|data|investigat|observe|measure/.test(
      text
    )
  ) {

    ideas.push(
      "Use a shared investigation, source collection or data set as the basis for analysing evidence and communicating conclusions."
    );

  }


  if (
    !ideas.length
  ) {

    ideas.push(
      `Create an authentic investigation, product or performance that gives students a meaningful reason to apply learning from ${subjects.join(" and ")}.`
    );

  }


  return uniqueWords(
    ideas
  );

}


// ============================================================
// INTEGRATION OPPORTUNITIES
// ============================================================

function buildIntegrationOpportunities(
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
      "Use HASS knowledge, sources and inquiry as meaningful content for English reading, discussion, writing or presentation."
    );

  }


  if (
    has("English") &&
    has("Science")
  ) {

    results.push(
      "Use scientific knowledge, investigations and evidence as the content for English explanation, discussion, comprehension or text creation."
    );

  }


  if (
    has("English") &&
    hasArts
  ) {

    results.push(
      "Use an Arts product or performance as an authentic communication context, with English supporting purpose, audience and language choices."
    );

  }


  if (
    has("HASS") &&
    hasArts
  ) {

    results.push(
      "Use Arts processes to represent historical, geographical, civic or cultural understanding while keeping HASS disciplinary evidence visible."
    );

  }


  if (
    has("HPE") &&
    has("English")
  ) {

    results.push(
      "Use health, relationships, wellbeing or movement learning as authentic subject matter for explaining, persuading, reflecting or presenting."
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
      "Use an authentic problem or need to connect investigation, design, production, evaluation and communication."
    );

  }


  if (
    /source|evidence|investigat|data|observe|measure/.test(
      text
    )
  ) {

    results.push(
      "Use one investigation, source set or body of evidence across learning areas rather than recreating similar activities separately."
    );

  }


  if (
    /create|produce|perform|present|construct|communicat/.test(
      text
    )
  ) {

    results.push(
      "Use one authentic product, presentation or performance where multiple curriculum demands can be demonstrated without reducing the required evidence."
    );

  }


  if (
    !results.length
  ) {

    results.push(
      `Look for a genuine shared learning experience where ${subjects.join(" + ")} contribute different but complementary curriculum demands.`
    );

  }


  return uniqueWords(
    results
  );

}


// ============================================================
// INTEGRATION NOTES IDEAS
// ============================================================

function buildIntegrationNotes(
  subjects,
  areas
) {

  const notes = [

    "Selected curriculum knowledge can be developed through a shared unit context, while explicit teaching remains subject-specific where required.",

    "English can provide opportunities to read, discuss, write and communicate using knowledge developed through the other learning areas.",

    "Shared Tier 2 vocabulary can be deliberately reinforced across learning areas, while Tier 3 vocabulary remains explicit to each discipline.",

    "Where curriculum demands overlap authentically, one learning experience may contribute evidence across learning areas without reducing the expected cognitive demand.",

    "Some curriculum aspects should remain discrete where students require explicit disciplinary knowledge, processes or techniques.",

    "Learning should be sequenced so students first build the required knowledge and vocabulary before applying it in an integrated product, investigation or performance.",

    "The cognitive verb in each selected Achievement Standard aspect should remain visible when planning teaching and assessment.",

    "Integration should reduce unnecessary repetition, not remove the explicit teaching required for each learning area."

  ];


  if (
    subjects.includes("English")
  ) {

    notes.unshift(
      "Use the integrated context to provide meaningful knowledge for English reading, viewing, speaking and writing rather than teaching English through an unrelated topic."
    );

  }


  if (
    subjects.includes("HASS") ||
    subjects.includes("Science")
  ) {

    notes.unshift(
      "Build disciplinary knowledge explicitly in HASS or Science, then revisit and apply that knowledge through other learning experiences."
    );

  }


  if (
    subjects.length >
    1
  ) {

    notes.push(
      `Make the contribution of each learning area explicit: ${subjects.join(", ")}.`
    );

  }


  return uniqueWords(
    notes
  );

}


// ============================================================
// GENERATED SUGGESTION BUTTONS
// ============================================================

function bindGeneratedSuggestionButtons() {

  const output =
    document.getElementById(
      "integrationSuggestions"
    );


  if (
    !output ||
    !output._integrationSuggestions
  ) {

    return;

  }


  const suggestions =
    output._integrationSuggestions;


  // ----------------------------------------------------------
  // USE CONCEPT
  // ----------------------------------------------------------

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


            if (!concept) {
              return;
            }


            const text =
              `${concept.title} — ${concept.description}`;


            populateField(
              "bigIdea",
              text,
              "integration.bigIdea"
            );

          }
        );

      }
    );


  // ----------------------------------------------------------
  // USE AUTHENTIC CONTEXT
  // ----------------------------------------------------------

  output
    .querySelectorAll(
      "[data-use-context]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset
                  .useContext
              );


            const context =
              suggestions.contexts[
                index
              ];


            if (!context) {
              return;
            }


            populateField(
              "authentic",
              context,
              "integration.authenticContext"
            );

          }
        );

      }
    );


  // ----------------------------------------------------------
  // ADD INTEGRATION NOTE
  // ----------------------------------------------------------

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


            if (!note) {
              return;
            }


            appendToField(
              "integrationNotes",
              note,
              "integration.integrationNotes"
            );

          }
        );

      }
    );

}


// ============================================================
// POPULATE FIELD
// ============================================================

function populateField(
  elementId,
  value,
  statePath
) {

  const field =
    document.getElementById(
      elementId
    );


  if (!field) {
    return;
  }


  field.value =
    value;


  updateUnitPlan(
    statePath,
    value
  );

}


// ============================================================
// APPEND TO FIELD
// ============================================================

function appendToField(
  elementId,
  value,
  statePath
) {

  const field =
    document.getElementById(
      elementId
    );


  if (!field) {
    return;
  }


  const existing =
    field.value.trim();


  // Don't duplicate a note already added.

  if (
    existing
      .toLowerCase()
      .includes(
        value
          .toLowerCase()
      )
  ) {

    return;

  }


  const updated =
    existing
      ? `${existing}\n• ${value}`
      : `• ${value}`;


  field.value =
    updated;


  updateUnitPlan(
    statePath,
    updated
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
    document.getElementById(
      "integrationConnections"
    );


  if (!container) {
    return;
  }


  const connections =
    unitPlan.integration
      ?.connections ||
    [];


  if (!connections.length) {

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
    !connections[index]
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


  if (element) {

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