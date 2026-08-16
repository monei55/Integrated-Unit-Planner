import {
  unitPlan,
  getAssessment,
  updateUnitPlan
} from "./state.js";

import {
  getSelectedCurriculumRows
} from "./curriculum.js";


// ============================================================
// STEP 8 — LEARNING WALL & BUMP-IT-UP PROMPT GENERATOR
// ============================================================

export function initLearningWallPage() {

  loadSavedPrompts();

  bindPromptFields();

  bindClick(
    "generateLearningWallPrompt",
    generateLearningWallPrompt
  );

  bindClick(
    "copyLearningWallPrompt",
    copyLearningWallPrompt
  );

  bindClick(
    "generateBiuPrompt",
    generateBiuPrompt
  );

  bindClick(
    "copyBiuPrompt",
    copyBiuPrompt
  );

}


// ============================================================
// LOAD SAVED PROMPTS
// ============================================================

function loadSavedPrompts() {

  setValue(
    "learningWallPrompt",
    unitPlan.learningWall
      ?.learningWallPrompt ||
    ""
  );


  setValue(
    "biuPrompt",
    unitPlan.learningWall
      ?.biuPrompt ||
    ""
  );


  updateCopyButtonState();

}


// ============================================================
// SAVE MANUAL EDITS
// ============================================================

function bindPromptFields() {

  const learningPrompt =
    document.getElementById(
      "learningWallPrompt"
    );


  learningPrompt
    ?.addEventListener(
      "input",
      (event) => {

        updateUnitPlan(
          "learningWall.learningWallPrompt",
          event.target.value
        );


        updateCopyButtonState();

      }
    );


  const biuPrompt =
    document.getElementById(
      "biuPrompt"
    );


  biuPrompt
    ?.addEventListener(
      "input",
      (event) => {

        updateUnitPlan(
          "learningWall.biuPrompt",
          event.target.value
        );


        updateCopyButtonState();

      }
    );

}


// ============================================================
// GENERATE LEARNING WALL PROMPT
// ============================================================

function generateLearningWallPrompt() {

  const rows =
    getSelectedCurriculumRows();


  if (!rows.length) {

    showMessage(
      "learningWallPromptMessage",
      "Select Achievement Standard aspects before generating the Learning Wall prompt."
    );

    return;

  }


  const type =
    document.getElementById(
      "learningWallType"
    )?.value ||
    "complete";


  const style =
    document.getElementById(
      "learningWallStyle"
    )?.value ||
    "classroom";


  const prompt =
    buildLearningWallPrompt(
      type,
      style,
      rows
    );


  setValue(
    "learningWallPrompt",
    prompt
  );


  updateUnitPlan(
    "learningWall.learningWallPrompt",
    prompt
  );


  showMessage(
    "learningWallPromptMessage",
    "Prompt generated. Review or edit it, then copy it into ChatGPT."
  );


  updateCopyButtonState();

}


// ============================================================
// BUILD LEARNING WALL PROMPT
// ============================================================

function buildLearningWallPrompt(
  type,
  style,
  rows
) {

  const title =
    getUnitTitle();


  const yearLevels =
    getYearLevels();


  const subjects =
    unique(
      rows.map(
        (row) =>
          row.subject
      )
    );


  const intentions =
    buildLearningIntentions(
      rows
    );


  const know =
    cleanBulletLines(
      unitPlan.sequence
        ?.know
    );


  const understand =
    cleanBulletLines(
      unitPlan.sequence
        ?.understand
    );


  const doItems =
    cleanBulletLines(
      unitPlan.sequence
        ?.do
    );


  const vocabulary =
    buildTemporaryVocabulary(
      rows
    );


  const successCriteria =
    buildSuccessCriteria(
      rows
    );


  const modelSuggestions =
    buildModelExampleSuggestions();


  const visualTypeInstruction =
    learningWallTypeInstruction(
      type
    );


  const styleInstruction =
    visualStyleInstruction(
      style
    );


  return `Create a professional classroom Learning Wall visual for an Australian primary school unit.

UNIT INFORMATION
Title: ${title}
Year level/s: ${yearLevels.join(", ") || "Primary"}
Learning area/s: ${subjects.join(", ")}

PURPOSE
${visualTypeInstruction}

LEARNING INTENTIONS
${formatPromptList(intentions)}

WHAT STUDENTS NEED TO KNOW
${formatPromptList(know)}

BIG IDEAS / UNDERSTANDINGS
${formatPromptList(understand)}

WHAT STUDENTS NEED TO DO
${formatPromptList(doItems)}

KEY TERMINOLOGY
${formatPromptList(vocabulary)}

SUCCESS CRITERIA
${formatPromptList(successCriteria)}

WORKED EXAMPLES / MODELS
${formatPromptList(modelSuggestions)}

DESIGN REQUIREMENTS
${styleInstruction}

Use clear visual hierarchy and concise student-friendly wording.
Make the visual practical for a real classroom wall rather than a decorative infographic.
Use headings, cards, arrows, diagrams or visual grouping where they help students understand the learning.
Leave appropriate space for teachers to add student work samples, annotated examples or photographs if relevant.
Avoid clutter and unnecessary decorative elements.
Ensure all wording is easy to read from a classroom display.

Create the visual as a polished, classroom-ready example that a teacher could use as inspiration and then ask to modify further.`;

}


// ============================================================
// LEARNING WALL TYPE
// ============================================================

function learningWallTypeInstruction(
  type
) {

  const map = {

    complete:
      "Create a complete Learning Wall showing the major learning intentions, vocabulary, key knowledge, big ideas, success criteria and worked-example areas.",

    intentions:
      "Focus the visual on Learning Intentions and Success Criteria. Make the connection between what students are learning and what successful learning looks like very clear.",

    vocabulary:
      "Create a vocabulary-focused Learning Wall. Organise the key terminology clearly and include space for definitions, examples, visuals and student use of the words.",

    concept:
      "Create a concept-focused Learning Wall showing the important knowledge, big ideas, relationships and questions students need to understand.",

    worked:
      "Create a Worked Example / Annotated Model display. Emphasise what a successful example looks like and provide clear areas for annotations linked to the success criteria."

  };


  return map[
    type
  ] ||
  map.complete;

}


// ============================================================
// VISUAL STYLE
// ============================================================

function visualStyleInstruction(
  style
) {

  const map = {

    classroom:
      "Use a polished classroom-display style with clearly separated headings and display sections. It should look achievable on a physical classroom wall.",

    journey:
      "Use a Learning Journey layout with a clear visual pathway showing how knowledge and skills develop towards successful independent performance.",

    clean:
      "Use a clean professional educational design with strong hierarchy, restrained decoration, clear spacing and highly readable text.",

    primary:
      "Use an engaging primary-school classroom style with age-appropriate illustrations and visual cues. Keep it professional and avoid excessive decoration.",

    minimal:
      "Use a simple minimal layout with clear headings, large readable text and only essential visual elements."

  };


  return map[
    style
  ] ||
  map.classroom;

}


// ============================================================
// GENERATE BUMP-IT-UP PROMPT
// ============================================================

function generateBiuPrompt() {

  const rows =
    getSelectedCurriculumRows();


  if (!rows.length) {

    showMessage(
      "biuPromptMessage",
      "Select Achievement Standard aspects and develop the assessment before generating the Bump-It-Up prompt."
    );

    return;

  }


  const style =
    document.getElementById(
      "biuWallStyle"
    )?.value ||
    "stairs";


  const visualStyle =
    document.getElementById(
      "biuVisualStyle"
    )?.value ||
    "classroom";


  const prompt =
    buildBiuPrompt(
      rows,
      style,
      visualStyle
    );


  setValue(
    "biuPrompt",
    prompt
  );


  updateUnitPlan(
    "learningWall.biuPrompt",
    prompt
  );


  showMessage(
    "biuPromptMessage",
    "Bump-It-Up prompt generated. Review or edit it before copying."
  );


  updateCopyButtonState();

}


// ============================================================
// BUILD BUMP-IT-UP PROMPT
// ============================================================

function buildBiuPrompt(
  rows,
  style,
  visualStyle
) {

  const title =
    getUnitTitle();


  const subjects =
    unique(
      rows.map(
        (row) =>
          row.subject
      )
    );


  const criteria =
    buildSuccessCriteria(
      rows
    );


  const assessmentSummary =
    getAssessmentSummary();


  const progression =
    buildBiuProgression(
      rows
    );


  return `Create a classroom Bump-It-Up Wall visual for an Australian primary school unit.

UNIT
${title}

LEARNING AREA/S
${subjects.join(", ")}

ASSESSMENT CONTEXT
${assessmentSummary || "Use the supplied success criteria and curriculum demands to show improvement in student performance."}

PURPOSE
Create a student-friendly visual progression that shows HOW work improves from one stage to the next.

Do not simply reproduce an A–E Marking Guide.
Translate the discernible differences into concise, student-friendly success indicators.

SUCCESS CRITERIA
${formatPromptList(criteria)}

PROGRESSION
${formatProgressionForPrompt(
  progression
)}

VISUAL PROGRESSION STYLE
${biuStyleInstruction(
  style
)}

VISUAL DESIGN
${visualStyleInstruction(
  visualStyle
)}

IMPORTANT DESIGN REQUIREMENTS
- Make the improvement between stages visually obvious.
- Use positive student-friendly language.
- Show increasing independence, precision, detail, control and quality where appropriate.
- Do not add curriculum demands that are not represented in the supplied information.
- Include space beside or beneath each stage for a student work sample or annotated example.
- Where appropriate, include short annotation prompts such as "What improved?" or "What is my next step?"
- Keep wording concise enough for students to use during lessons.
- Make it look like a genuine classroom Bump-It-Up Wall rather than a report or rubric table.

Create a polished visual example that the teacher can then refine by asking for changes to wording, colours, layout, illustrations or progression labels.`;

}


// ============================================================
// BUMP-IT-UP STYLE
// ============================================================

function biuStyleInstruction(
  style
) {

  const map = {

    stairs:
      "Use a Stairs to Success design. Each stage should visibly move upward towards stronger performance.",

    pathway:
      "Use a Learning Pathway design with connected stages and a clear direction of improvement.",

    columns:
      "Use clear progression columns placed side-by-side so students can compare what changes between each level.",

    levels:
      "Use a 'What Improvement Looks Like' design showing a clear progression from developing performance to a strong independent response."

  };


  return map[
    style
  ] ||
  map.stairs;

}


// ============================================================
// BUILD BIU PROGRESSION
// ============================================================

function buildBiuProgression(
  rows
) {

  const verbs =
    unique(
      rows.flatMap(
        (row) =>
          findCognitiveVerbs(
            row.text
          )
      )
    );


  const criteria =
    unique(
      verbs.map(
        studentFriendlyCriterion
      )
    )
      .filter(Boolean)
      .slice(
        0,
        6
      );


  if (!criteria.length) {

    return [];

  }


  return [

    {
      level:
        "Developing",

      description:
        "I am beginning to demonstrate the learning and may still need support.",

      criteria:
        criteria.map(
          (criterion) =>
            `With support, I can ${criterion}.`
        )

    },

    {
      level:
        "Meeting",

      description:
        "I can demonstrate the expected learning independently.",

      criteria:
        criteria.map(
          (criterion) =>
            `I can ${criterion} independently.`
        )

    },

    {
      level:
        "Strong",

      description:
        "I demonstrate the learning clearly, accurately and with greater precision or detail.",

      criteria:
        criteria.map(
          (criterion) =>
            `I can ${criterion} clearly, accurately and with well-chosen detail.`
        )

    }

  ];

}


// ============================================================
// FORMAT PROGRESSION
// ============================================================

function formatProgressionForPrompt(
  progression
) {

  if (!progression.length) {

    return "Create a clear three-stage progression using the supplied success criteria.";

  }


  return progression
    .map(
      (stage) => {

        return `${stage.level}
${stage.description}
${formatPromptList(
  stage.criteria
)}`;

      }
    )
    .join("\n\n");

}


// ============================================================
// ASSESSMENT SUMMARY
// ============================================================

function getAssessmentSummary() {

  const years =
    getYearLevels();


  const parts = [];


  years.forEach(
    (yearLevel) => {

      const assessment =
        getAssessment(
          yearLevel
        );


      if (!assessment) {
        return;
      }


      const questions =
        (
          assessment.components ||
          []
        )
          .map(
            (component) =>
              component.questionText
          )
          .filter(Boolean);


      if (questions.length) {

        parts.push(
          `${yearLevel}: ${questions.join(" | ")}`
        );

      }

    }
  );


  return parts.join("\n");

}


// ============================================================
// LEARNING INTENTIONS
// ============================================================

function buildLearningIntentions(
  rows
) {

  const grouped =
    groupBy(
      rows,
      (row) =>
        row.subject
    );


  const intentions = [];


  Object.entries(
    grouped
  )
    .forEach(
      ([subject, subjectRows]) => {

        const verbs =
          unique(
            subjectRows.flatMap(
              (row) =>
                findCognitiveVerbs(
                  row.text
                )
            )
          );


        const actions =
          buildStudentFriendlyActions(
            verbs
          );


        if (actions.length) {

          intentions.push(
            `${subject}: We are learning to ${joinNaturalList(
              actions
            )}.`
          );

        }

      }
    );


  return intentions;

}


// ============================================================
// SUCCESS CRITERIA
// ============================================================

function buildSuccessCriteria(
  rows
) {

  const result = [];


  rows.forEach(
    (row) => {

      findCognitiveVerbs(
        row.text
      )
        .forEach(
          (verb) => {

            const criterion =
              studentFriendlyCriterion(
                verb
              );


            if (criterion) {

              result.push(
                `I can ${criterion}.`
              );

            }

          }
        );

    }
  );


  return unique(
    result
  )
    .slice(
      0,
      10
    );

}


// ============================================================
// STUDENT-FRIENDLY CRITERIA
// ============================================================

function studentFriendlyCriterion(
  verb
) {

  const map = {

    identify:
      "identify important information",

    recognise:
      "recognise the important features",

    describe:
      "describe important ideas or features using relevant detail",

    explain:
      "explain how or why using relevant details",

    compare:
      "compare similarities and differences",

    interpret:
      "interpret information, texts or evidence",

    analyse:
      "analyse information and use evidence",

    infer:
      "make an inference and support it with evidence",

    organise:
      "organise ideas clearly and logically",

    sequence:
      "sequence ideas or information logically",

    link:
      "link ideas clearly",

    create:
      "create an appropriate response",

    write:
      "write an effective response",

    present:
      "present ideas appropriately",

    communicate:
      "communicate ideas clearly",

    use:
      "use the required vocabulary, features and conventions accurately",

    apply:
      "apply learning to a new example",

    justify:
      "justify ideas using evidence",

    evaluate:
      "make a judgement and explain the criteria used"

  };


  return map[
    verb
  ] ||
  "";

}


// ============================================================
// STUDENT-FRIENDLY ACTIONS
// ============================================================

function buildStudentFriendlyActions(
  verbs
) {

  return unique(
    verbs
      .map(
        studentFriendlyCriterion
      )
      .filter(Boolean)
  );

}


// ============================================================
// TEMPORARY VOCABULARY
// ============================================================
// Later this can be replaced by the Prep–Year 6 vocabulary
// scope and sequence.
// ============================================================

function buildTemporaryVocabulary(
  rows
) {

  return unique(
    rows.flatMap(
      (row) =>
        extractLikelyTerms(
          row.text
        )
    )
  )
    .slice(
      0,
      15
    );

}


// ============================================================
// MODEL / EXAMPLE SUGGESTIONS
// ============================================================

function buildModelExampleSuggestions() {

  const weeks =
    Array.isArray(
      unitPlan.sequence
        ?.weeks
    )
      ? unitPlan.sequence.weeks
      : [];


  const suggestions = [];


  weeks.forEach(
    (week) => {

      (
        week.lessons ||
        []
      )
        .forEach(
          (lesson) => {

            const text =
              [
                lesson.purpose,
                lesson.activity
              ]
                .filter(Boolean)
                .join(" ");


            if (
              /model|worked example|joint construction|think-aloud/i
                .test(
                  text
                )
            ) {

              suggestions.push(
                `${lesson.subject || "Learning"}: include an annotated or worked example linked to Week ${week.number}.`
              );

            }

          }
        );

    }
  );


  return unique(
    suggestions
  )
    .slice(
      0,
      5
    );

}


// ============================================================
// UNIT DETAILS
// ============================================================

function getUnitTitle() {

  return (
    unitPlan.setup
      ?.unitTitle ||
    unitPlan.setup
      ?.title ||
    "Our Unit"
  );

}


function getYearLevels() {

  return Array.isArray(
    unitPlan.setup
      ?.yearLevels
  )
    ? unitPlan.setup.yearLevels
    : [];

}


// ============================================================
// COGNITIVE VERBS
// ============================================================

const COGNITIVE_VERBS = [

  "identify",
  "recognise",
  "describe",
  "explain",
  "compare",
  "classify",
  "analyse",
  "analyze",
  "interpret",
  "evaluate",
  "justify",
  "create",
  "construct",
  "apply",
  "use",
  "develop",
  "select",
  "organise",
  "organize",
  "sequence",
  "link",
  "collect",
  "represent",
  "infer",
  "read",
  "view",
  "comprehend",
  "write",
  "present",
  "communicate"

];


function findCognitiveVerbs(
  text = ""
) {

  const lower =
    String(
      text
    )
      .toLowerCase();


  return unique(
    COGNITIVE_VERBS
      .filter(
        (verb) =>
          new RegExp(
            `\\b${verb}\\w*\\b`,
            "i"
          )
            .test(
              lower
            )
      )
      .map(
        normaliseVerb
      )
  );

}


function normaliseVerb(
  verb
) {

  return {

    analyze:
      "analyse",

    organize:
      "organise"

  }[
    verb
  ] ||
  verb;

}


// ============================================================
// VOCABULARY EXTRACTION
// ============================================================

function extractLikelyTerms(
  text
) {

  const stopWords =
    new Set([

      "students",
      "student",
      "their",
      "these",
      "those",
      "using",
      "information",
      "learning",
      "achievement",
      "standard",
      "selected",
      "relevant",
      "appropriate",
      "different",
      "through",
      "which",
      "where",
      "with",
      "from",
      "that",
      "this",
      "they",
      "have",
      "will",
      "should",
      "demonstrate",
      "describe",
      "explain",
      "identify"

    ]);


  return String(
    text ||
    ""
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      " "
    )
    .split(
      /\s+/
    )
    .filter(
      (word) =>
        word.length >= 6 &&
        !stopWords.has(
          word
        )
    )
    .slice(
      0,
      5
    );

}


// ============================================================
// COPY PROMPTS
// ============================================================

async function copyLearningWallPrompt() {

  await copyPrompt(
    "learningWallPrompt",
    "learningWallPromptMessage"
  );

}


async function copyBiuPrompt() {

  await copyPrompt(
    "biuPrompt",
    "biuPromptMessage"
  );

}


async function copyPrompt(
  fieldId,
  messageId
) {

  const field =
    document.getElementById(
      fieldId
    );


  if (
    !field ||
    !field.value.trim()
  ) {

    return;

  }


  try {

    await navigator.clipboard.writeText(
      field.value
    );


    showMessage(
      messageId,
      "Prompt copied. Paste it into ChatGPT to create the visual."
    );

  } catch {

    field.select();


    document.execCommand(
      "copy"
    );


    showMessage(
      messageId,
      "Prompt copied. Paste it into ChatGPT to create the visual."
    );

  }

}


// ============================================================
// COPY BUTTON STATE
// ============================================================

function updateCopyButtonState() {

  const learningPrompt =
    document.getElementById(
      "learningWallPrompt"
    );


  const learningButton =
    document.getElementById(
      "copyLearningWallPrompt"
    );


  if (
    learningButton
  ) {

    learningButton.disabled =
      !learningPrompt
        ?.value
        ?.trim();

  }


  const biuPrompt =
    document.getElementById(
      "biuPrompt"
    );


  const biuButton =
    document.getElementById(
      "copyBiuPrompt"
    );


  if (
    biuButton
  ) {

    biuButton.disabled =
      !biuPrompt
        ?.value
        ?.trim();

  }

}


// ============================================================
// TEXT HELPERS
// ============================================================

function cleanBulletLines(
  value
) {

  if (!value) {
    return [];
  }


  return String(
    value
  )
    .split(
      /\n+/
    )
    .map(
      (line) =>
        line
          .replace(
            /^[•\-*]\s*/,
            ""
          )
          .trim()
    )
    .filter(Boolean);

}


function formatPromptList(
  values
) {

  if (
    !Array.isArray(
      values
    ) ||
    !values.length
  ) {

    return "- Add appropriate content based on the unit information supplied.";

  }


  return values
    .map(
      (value) =>
        `- ${value}`
    )
    .join("\n");

}


function groupBy(
  values,
  keyFunction
) {

  return values.reduce(
    (result, value) => {

      const key =
        keyFunction(
          value
        );


      if (!result[key]) {

        result[key] = [];

      }


      result[key].push(
        value
      );


      return result;

    },
    {}
  );

}


function unique(
  values
) {

  return [
    ...new Set(
      values.filter(Boolean)
    )
  ];

}


function joinNaturalList(
  values
) {

  const cleaned =
    values.filter(Boolean);


  if (!cleaned.length) {
    return "";
  }


  if (
    cleaned.length === 1
  ) {

    return cleaned[0];

  }


  if (
    cleaned.length === 2
  ) {

    return `${cleaned[0]} and ${cleaned[1]}`;

  }


  return `${cleaned
    .slice(
      0,
      -1
    )
    .join(", ")}, and ${cleaned[
      cleaned.length - 1
    ]}`;

}


// ============================================================
// DOM HELPERS
// ============================================================

function bindClick(
  id,
  handler
) {

  document
    .getElementById(
      id
    )
    ?.addEventListener(
      "click",
      handler
    );

}


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
      value ||
      "";

  }

}


function showMessage(
  id,
  text
) {

  const container =
    document.getElementById(
      id
    );


  if (!container) {
    return;
  }


  container.innerHTML = `
    <strong>
      ${escapeHtml(
        text
      )}
    </strong>
  `;

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