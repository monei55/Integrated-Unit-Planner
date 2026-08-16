import {
  unitPlan,
  updateUnitPlan
} from "./state.js";

import {
  getSelectedCurriculumRows
} from "./curriculum.js";


// ============================================================
// STEP 6 — FIVE-MINUTE DAILY REVIEW
// ============================================================
// Primary source: teaching already planned in Step 5.
// Curriculum and KNOW / UNDERSTAND / DO are used to strengthen
// alignment, but the weekly review plan does not deliberately
// retrieve content before it appears in the lesson sequence.
// ============================================================

export function initDailyReviewPage() {

  loadSavedDailyReview();

  bindDailyReviewFields();

  bindClick(
    "reviewSuggest",
    buildDailyReviewBank
  );

  renderWeeklyDailyReview();

}


// ============================================================
// SAVED FIELDS
// ============================================================

const DAILY_FIELDS = {

  reviewVocab:
    "daily.vocabulary",

  reviewKnowledge:
    "daily.knowledge",

  reviewFluency:
    "daily.fluency",

  reviewApplication:
    "daily.application",

  reviewMisconceptions:
    "daily.misconceptions",

  reviewQuestions:
    "daily.questions"

};


// ============================================================
// LOAD SAVED DAILY REVIEW
// ============================================================

function loadSavedDailyReview() {

  Object.entries(
    DAILY_FIELDS
  )
    .forEach(
      ([elementId, statePath]) => {

        setValue(
          elementId,
          getNestedValue(
            unitPlan,
            statePath
          ) || ""
        );

      }
    );

}


// ============================================================
// SAVE FIELDS
// ============================================================

function bindDailyReviewFields() {

  Object.entries(
    DAILY_FIELDS
  )
    .forEach(
      ([elementId, statePath]) => {

        const element =
          document.getElementById(
            elementId
          );


        if (!element) {
          return;
        }


        element.addEventListener(
          "input",
          (event) => {

            updateUnitPlan(
              statePath,
              event.target.value
            );

          }
        );

      }
    );

}


// ============================================================
// BUILD DAILY REVIEW BANK
// ============================================================

function buildDailyReviewBank() {

  const curriculumRows =
    getSelectedCurriculumRows();


  const lessonSequence =
    getLessonSequence();


  const output =
    document.getElementById(
      "reviewSuggestions"
    );


  if (!lessonSequence.length) {

    if (output) {

      output.innerHTML = `
        <div class="empty">
          Build the teaching and learning sequence
          in Step 5 before generating Daily Review.
          The review plan is designed to retrieve
          learning after it has been taught.
        </div>
      `;

    }

    return;

  }


  const reviewBank =
    buildWholeUnitReviewBank(
      lessonSequence,
      curriculumRows
    );


  setGeneratedField(
    "reviewVocab",
    "daily.vocabulary",
    reviewBank.vocabulary
  );


  setGeneratedField(
    "reviewKnowledge",
    "daily.knowledge",
    reviewBank.knowledge
  );


  setGeneratedField(
    "reviewFluency",
    "daily.fluency",
    reviewBank.fluency
  );


  setGeneratedField(
    "reviewApplication",
    "daily.application",
    reviewBank.application
  );


  setGeneratedField(
    "reviewMisconceptions",
    "daily.misconceptions",
    reviewBank.misconceptions
  );


  setGeneratedField(
    "reviewQuestions",
    "daily.questions",
    reviewBank.questions
  );


  buildWeeklyDailyReviewPlan(
    lessonSequence,
    curriculumRows
  );


  if (output) {

    output.innerHTML = `
      <strong>Daily Review generated from Step 5</strong>

      <p>
        The weekly plan begins with prerequisite review in Week 1.
        From Week 2 onward, it retrieves learning from earlier weeks
        in the lesson sequence and deliberately spaces important
        knowledge and skills across the unit.
      </p>

      <p>
        Achievement Standard aspects and KNOW / UNDERSTAND / DO
        planning strengthen alignment, but future content is not
        deliberately introduced before it has been taught.
      </p>
    `;

  }


  renderWeeklyDailyReview();

}


// ============================================================
// STEP 5 — LESSON SEQUENCE AS PRIMARY SOURCE
// ============================================================

function getLessonSequence() {

  const weeks =
    Array.isArray(
      unitPlan.sequence
        ?.weeks
    )
      ? unitPlan.sequence.weeks
      : [];


  const lessons = [];


  weeks.forEach(
    (week) => {

      const weekLessons =
        Array.isArray(
          week.lessons
        )
          ? week.lessons
          : [];


      weekLessons.forEach(
        (lesson, lessonIndex) => {

          const subject =
            lesson.subject ||
            "Integrated";


          const purpose =
            cleanSentence(
              lesson.purpose
            );


          const activity =
            cleanSentence(
              lesson.activity
            );


          const evidence =
            cleanSentence(
              lesson.evidence
            );


          const integration =
            cleanSentence(
              lesson.integration
            );


          const combinedText =
            [
              subject,
              purpose,
              activity,
              evidence,
              integration
            ]
              .filter(Boolean)
              .join(" ");


          if (!combinedText.trim()) {
            return;
          }


          lessons.push({

            week:
              Number(
                week.number
              ) || 1,

            lessonNumber:
              lessonIndex + 1,

            subject,

            phase:
              lesson.phase ||
              week.phase ||
              "",

            purpose,

            activity,

            evidence,

            integration,

            text:
              combinedText

          });

        }
      );

    }
  );


  return lessons.sort(
    (a, b) =>
      a.week - b.week ||
      a.lessonNumber - b.lessonNumber
  );

}


// ============================================================
// WHOLE-UNIT REVIEW BANK
// ============================================================

function buildWholeUnitReviewBank(
  lessonSequence,
  curriculumRows
) {

  const knowledgeItems =
    unique(
      lessonSequence
        .map(
          (lesson) =>
            buildLessonKnowledgeItem(
              lesson
            )
        )
        .filter(Boolean)
    );


  const vocabularyItems =
    unique(
      lessonSequence
        .flatMap(
          (lesson) =>
            buildLessonVocabularyItems(
              lesson
            )
        )
    );


  const fluencyItems =
    unique(
      lessonSequence
        .flatMap(
          (lesson) =>
            buildLessonFluencyItems(
              lesson
            )
        )
    );


  const applicationItems =
    unique(
      lessonSequence
        .map(
          (lesson) =>
            buildLessonApplicationItem(
              lesson,
              curriculumRows
            )
        )
        .filter(Boolean)
    );


  const misconceptionItems =
    unique(
      lessonSequence
        .map(
          (lesson) =>
            buildLessonMisconceptionItem(
              lesson
            )
        )
        .filter(Boolean)
    );


  const questionItems =
    unique(
      lessonSequence
        .map(
          (lesson) =>
            buildLessonRetrievalQuestion(
              lesson,
              curriculumRows
            )
        )
        .filter(Boolean)
    );


  return {

    vocabulary:
      bulletText(
        vocabularyItems.slice(
          0,
          24
        )
      ),

    knowledge:
      bulletText(
        knowledgeItems.slice(
          0,
          18
        )
      ),

    fluency:
      bulletText(
        fluencyItems.slice(
          0,
          16
        )
      ),

    application:
      bulletText(
        applicationItems.slice(
          0,
          16
        )
      ),

    misconceptions:
      bulletText(
        misconceptionItems.slice(
          0,
          14
        )
      ),

    questions:
      bulletText(
        questionItems.slice(
          0,
          20
        )
      )

  };

}


// ============================================================
// KNOWLEDGE FROM A PLANNED LESSON
// ============================================================

function buildLessonKnowledgeItem(
  lesson
) {

  const purpose =
    cleanLearningPurpose(
      lesson.purpose
    );


  if (!purpose) {
    return "";
  }


  return `Week ${lesson.week} — ${lesson.subject}: ${purpose}`;

}


function cleanLearningPurpose(
  purpose
) {

  return cleanSentence(
    String(
      purpose || ""
    )
      .replace(
        /^[^:]{1,40}:\s*/,
        ""
      )
      .replace(
        /^students\s+/i,
        ""
      )
      .replace(
        /^explicitly teach and practise\s+/i,
        ""
      )
  );

}


// ============================================================
// VOCABULARY FROM A PLANNED LESSON
// ============================================================

function buildLessonVocabularyItems(
  lesson
) {

  const terms =
    extractLikelyTerms(
      `${lesson.purpose} ${lesson.activity}`
    );


  return terms
    .slice(
      0,
      3
    )
    .map(
      (term) =>
        `Week ${lesson.week} — ${lesson.subject}: ${term}`
    );

}


// ============================================================
// FLUENCY / AUTOMATICITY FROM A PLANNED LESSON
// ============================================================

function buildLessonFluencyItems(
  lesson
) {

  const text =
    String(
      lesson.text || ""
    )
      .toLowerCase();


  const items = [];


  if (
    /read|view|comprehend|fluency|phrasing/
      .test(
        text
      )
  ) {

    items.push(
      `Week ${lesson.week} — ${lesson.subject}: rapidly retrieve meaning from a short, familiar text or source already used in teaching.`
    );

  }


  if (
    /vocab|terminolog|language feature|subject-specific/
      .test(
        text
      )
  ) {

    items.push(
      `Week ${lesson.week} — ${lesson.subject}: accurately recognise, define and use previously taught terminology.`
    );

  }


  if (
    /identify|recognise|locate|select/
      .test(
        text
      )
  ) {

    items.push(
      `Week ${lesson.week} — ${lesson.subject}: quickly identify the relevant feature, information or relationship in a familiar example.`
    );

  }


  if (
    /organise|sequence|link|cohes/
      .test(
        text
      )
  ) {

    items.push(
      `Week ${lesson.week} — ${lesson.subject}: quickly organise, sequence or link familiar information.`
    );

  }


  if (
    /number|calculation|addition|subtraction|multiplication|division|fraction|decimal/
      .test(
        text
      )
  ) {

    items.push(
      `Week ${lesson.week} — ${lesson.subject}: rehearse previously taught facts, representations or calculation strategies to automaticity.`
    );

  }


  if (!items.length) {

    items.push(
      `Week ${lesson.week} — ${lesson.subject}: rehearse one familiar fact, term, representation or process from this lesson until retrieval is quick and accurate.`
    );

  }


  return items;

}


// ============================================================
// APPLICATION FROM A PLANNED LESSON
// ============================================================

function buildLessonApplicationItem(
  lesson
) {

  const verbs =
    findCognitiveVerbs(
      lesson.text
    );


  const verb =
    verbs[0];


  const focus =
    shortLessonFocus(
      lesson
    );


  if (!verb) {

    return `Week ${lesson.week} — ${lesson.subject}: apply ${focus} to one new but familiar example.`;

  }


  return applicationPromptForVerb(
    verb,
    lesson.subject,
    focus
  );

}


function applicationPromptForVerb(
  verb,
  subject,
  focus
) {

  const prompts = {

    identify:
      `${subject}: identify the relevant feature, idea or information in a new familiar example connected to ${focus}.`,

    recognise:
      `${subject}: recognise the correct example of ${focus} and explain the clue used.`,

    describe:
      `${subject}: describe one familiar example of ${focus} using accurate vocabulary.`,

    explain:
      `${subject}: explain how or why a familiar example demonstrates ${focus}.`,

    compare:
      `${subject}: compare two familiar examples connected to ${focus} and state one meaningful similarity and difference.`,

    interpret:
      `${subject}: interpret a familiar text, image, source or representation connected to ${focus}.`,

    analyse:
      `${subject}: analyse a short familiar example connected to ${focus} and identify the evidence that matters.`,

    infer:
      `${subject}: make an inference from familiar evidence connected to ${focus} and explain what supports it.`,

    organise:
      `${subject}: organise familiar information connected to ${focus} into the correct structure or grouping.`,

    sequence:
      `${subject}: place familiar information connected to ${focus} in a logical sequence.`,

    link:
      `${subject}: link two ideas connected to ${focus} and explain the relationship.`,

    use:
      `${subject}: use the previously taught feature, convention or process connected to ${focus} in one short example.`,

    apply:
      `${subject}: apply the previously taught knowledge or process connected to ${focus} to a new familiar example.`,

    create:
      `${subject}: create one brief response that demonstrates the previously taught success criteria connected to ${focus}.`,

    write:
      `${subject}: write one short response that demonstrates the previously taught feature connected to ${focus}.`,

    justify:
      `${subject}: make a quick judgement connected to ${focus} and justify it using known evidence.`,

    evaluate:
      `${subject}: evaluate a familiar example connected to ${focus} using an already taught criterion.`,

    classify:
      `${subject}: classify familiar examples connected to ${focus} and explain the rule used.`,

    develop:
      `${subject}: develop one appropriate question or idea connected to ${focus} using the previously taught process.`,

    collect:
      `${subject}: decide what information would need to be collected for a familiar inquiry connected to ${focus}.`,

    present:
      `${subject}: present one brief explanation or response connected to ${focus} using the expected conventions.`,

    communicate:
      `${subject}: communicate one familiar idea connected to ${focus} using the expected vocabulary and conventions.`

  };


  return prompts[
    verb
  ] ||
  `${subject}: briefly practise ${verb} using previously taught learning connected to ${focus}.`;

}


// ============================================================
// MISCONCEPTIONS / ERROR CORRECTION
// ============================================================

function buildLessonMisconceptionItem(
  lesson
) {

  const text =
    String(
      lesson.text || ""
    )
      .toLowerCase();


  const subject =
    lesson.subject;


  if (
    /compare|similarit|difference/
      .test(
        text
      )
  ) {

    return `${subject}: students may list separate features without making a comparison. Show a weak response and ask them to repair it.`;

  }


  if (
    /explain/
      .test(
        text
      )
  ) {

    return `${subject}: students may describe what happened without explaining how or why. Ask them to identify what is missing.`;

  }


  if (
    /evidence|source|interpret|analyse|infer/
      .test(
        text
      )
  ) {

    return `${subject}: students may give an answer without connecting it to evidence. Present an unsupported conclusion and ask them to correct it.`;

  }


  if (
    /organise|sequence|link|cohes/
      .test(
        text
      )
  ) {

    return `${subject}: students may include relevant ideas but organise them poorly. Reorder or repair a short familiar example.`;

  }


  if (
    /vocab|terminolog|subject-specific|language feature/
      .test(
        text
      )
  ) {

    return `${subject}: students may use an everyday word where a precise disciplinary term is needed. Compare the options and justify the stronger choice.`;

  }


  if (
    /purpose|audience/
      .test(
        text
      )
  ) {

    return `${subject}: students may identify a feature without connecting it to purpose or audience. Ask them to explain the connection.`;

  }


  return `${subject}: include one previously observed error from this learning and ask students to identify, correct and explain it.`;

}


// ============================================================
// RETRIEVAL QUESTIONS FROM A PLANNED LESSON
// ============================================================

function buildLessonRetrievalQuestion(
  lesson
) {

  const verbs =
    findCognitiveVerbs(
      lesson.text
    );


  const verb =
    verbs[0];


  const focus =
    shortLessonFocus(
      lesson
    );


  const subject =
    lesson.subject;


  const prompts = {

    identify:
      `${subject}: What can you identify about ${focus}?`,

    recognise:
      `${subject}: Which example correctly shows ${focus}? How do you know?`,

    describe:
      `${subject}: Describe what you remember about ${focus}.`,

    explain:
      `${subject}: Explain how or why ${focus}.`,

    compare:
      `${subject}: What is one similarity and one difference connected to ${focus}?`,

    interpret:
      `${subject}: What does this familiar information show about ${focus}?`,

    analyse:
      `${subject}: What evidence would you look for when analysing ${focus}?`,

    infer:
      `${subject}: What could you infer about ${focus}, and what evidence supports it?`,

    organise:
      `${subject}: How should information connected to ${focus} be organised?`,

    sequence:
      `${subject}: What is the correct sequence for ${focus}?`,

    create:
      `${subject}: What features must be included when creating a response connected to ${focus}?`,

    use:
      `${subject}: Which feature, convention or process should you use for ${focus}?`,

    apply:
      `${subject}: How could you apply what you know about ${focus} to this new example?`,

    justify:
      `${subject}: What evidence could you use to justify a response about ${focus}?`,

    evaluate:
      `${subject}: What criterion would help you evaluate ${focus}?`

  };


  return prompts[
    verb
  ] ||
  `${subject}: What do you remember about ${focus}?`;

}


// ============================================================
// WEEKLY DAILY REVIEW PLAN
// ============================================================

function buildWeeklyDailyReviewPlan(
  lessonSequence,
  curriculumRows
) {

  const weekCount =
    getWeekCountFromSequence();


  const existing =
    Array.isArray(
      unitPlan.daily
        ?.weeklyPlan
    )
      ? unitPlan.daily.weeklyPlan
      : [];


  const weeklyPlan =
    Array.from(
      {
        length:
          weekCount
      },
      (_, index) => {

        const weekNumber =
          index + 1;


        const previous =
          existing.find(
            (week) =>
              Number(
                week.week
              ) ===
              weekNumber
          );


        return buildDailyReviewWeek(
          weekNumber,
          lessonSequence,
          curriculumRows,
          previous
        );

      }
    );


  updateUnitPlan(
    "daily.weeklyPlan",
    weeklyPlan
  );

}


// ============================================================
// BUILD ONE WEEK
// ============================================================

function buildDailyReviewWeek(
  weekNumber,
  lessonSequence,
  curriculumRows,
  previous
) {

  const priorLessons =
    lessonSequence.filter(
      (lesson) =>
        lesson.week <
        weekNumber
    );


  const recentLessons =
    priorLessons.filter(
      (lesson) =>
        lesson.week ===
        weekNumber - 1
    );


  const olderLessons =
    priorLessons.filter(
      (lesson) =>
        lesson.week <
        weekNumber - 1
    );


  const reviewPool =
    buildReviewPool(
      recentLessons,
      olderLessons,
      curriculumRows
    );


  const yearSpecific =
    buildYearSpecificReviewItems(
      weekNumber,
      priorLessons,
      curriculumRows
    );


  return {

    id:
      previous?.id ||
      crypto.randomUUID(),

    week:
      weekNumber,

    monday:
      previous?.monday ||
      buildMondayReview(
        weekNumber,
        reviewPool
      ),

    tuesday:
      previous?.tuesday ||
      buildTuesdayReview(
        weekNumber,
        reviewPool
      ),

    wednesday:
      previous?.wednesday ||
      buildWednesdayReview(
        weekNumber,
        reviewPool
      ),

    thursday:
      previous?.thursday ||
      buildThursdayReview(
        weekNumber,
        reviewPool
      ),

    friday:
      previous?.friday ||
      buildFridayReview(
        weekNumber,
        reviewPool
      ),

    yearSpecific:
      previous?.yearSpecific ||
      yearSpecific,

    teacherNote:
      previous?.teacherNote ||
      ""

  };

}


// ============================================================
// RECENT + SPACED REVIEW POOL
// ============================================================

function buildReviewPool(
  recentLessons,
  olderLessons,
  curriculumRows
) {

  const recentKnowledge =
    recentLessons
      .map(
        buildLessonKnowledgeItem
      )
      .filter(Boolean);


  const spacedKnowledge =
    pickSpacedItems(
      olderLessons
        .map(
          buildLessonKnowledgeItem
        )
        .filter(Boolean),
      6
    );


  const vocabulary =
    unique(
      [
        ...recentLessons,
        ...olderLessons
      ]
        .flatMap(
          buildLessonVocabularyItems
        )
    );


  const applications =
    unique(
      [
        ...recentLessons,
        ...olderLessons
      ]
        .map(
          (lesson) =>
            buildLessonApplicationItem(
              lesson,
              curriculumRows
            )
        )
        .filter(Boolean)
    );


  const questions =
    unique(
      [
        ...recentLessons,
        ...olderLessons
      ]
        .map(
          (lesson) =>
            buildLessonRetrievalQuestion(
              lesson,
              curriculumRows
            )
        )
        .filter(Boolean)
    );


  const misconceptions =
    unique(
      [
        ...recentLessons,
        ...olderLessons
      ]
        .map(
          buildLessonMisconceptionItem
        )
        .filter(Boolean)
    );


  return {

    recentKnowledge:
      unique(
        recentKnowledge
      ),

    spacedKnowledge:
      unique(
        spacedKnowledge
      ),

    vocabulary,

    applications,

    questions,

    misconceptions

  };

}


function pickSpacedItems(
  values,
  limit
) {

  if (
    values.length <=
    limit
  ) {

    return values;

  }


  const result = [];


  const step =
    Math.max(
      Math.floor(
        values.length /
        limit
      ),
      1
    );


  for (
    let index = 0;
    index < values.length &&
      result.length < limit;
    index += step
  ) {

    result.push(
      values[
        index
      ]
    );

  }


  return result;

}


// ============================================================
// MONDAY
// ============================================================

function buildMondayReview(
  weekNumber,
  pool
) {

  if (
    weekNumber === 1
  ) {

    return bulletText([
      "Prerequisite retrieval: revisit essential prior knowledge needed for the first week of teaching.",
      "Vocabulary: activate familiar words and concepts connected to the unit context.",
      "Recognise: use one example/non-example to check existing understanding.",
      "Do not review new Week 1 content until it has been explicitly taught."
    ]);

  }


  return bulletText(
    compact([

      pool.recentKnowledge[
        0
      ]
        ? `Recent retrieval: ${pool.recentKnowledge[0]}`
        : "Retrieve one important idea taught last week.",

      pool.vocabulary[
        0
      ]
        ? `Vocabulary: ${pool.vocabulary[0]}`
        : "Vocabulary: define or match 2–3 terms from last week's teaching.",

      pool.questions[
        0
      ] ||
        "Recognise: choose the correct example from an example/non-example pair.",

      pool.spacedKnowledge[
        0
      ]
        ? `Spaced retrieval: ${pool.spacedKnowledge[0]}`
        : ""

    ])
  );

}


// ============================================================
// TUESDAY
// ============================================================

function buildTuesdayReview(
  weekNumber,
  pool
) {

  if (
    weekNumber === 1
  ) {

    return bulletText([
      "Prerequisite retrieval: ask 2–3 quick questions about knowledge students are expected to bring into the unit.",
      "Quick application: apply one familiar skill in the new unit context.",
      "Correct: fix one common prerequisite misconception."
    ]);

  }


  return bulletText(
    compact([

      (
        pool.recentKnowledge[
          1
        ] ||
        pool.recentKnowledge[
          0
        ]
      )
        ? `Recent retrieval: ${
            pool.recentKnowledge[
              1
            ] ||
            pool.recentKnowledge[
              0
            ]
          }`
        : "Retrieve another important idea taught last week.",

      pool.questions[
        1
      ] ||
        pool.questions[
          0
        ] ||
        "Explain one previously taught idea from memory.",

      pool.applications[
        0
      ]
        ? `Quick application: ${pool.applications[0]}`
        : "Apply previously taught learning to one new but familiar example.",

      pool.vocabulary[
        1
      ]
        ? `Terminology: ${pool.vocabulary[1]}`
        : ""

    ])
  );

}


// ============================================================
// WEDNESDAY
// ============================================================

function buildWednesdayReview(
  weekNumber,
  pool
) {

  if (
    weekNumber === 1
  ) {

    return bulletText([
      "Retrieve prerequisite knowledge from memory without notes.",
      "Recognise: sort familiar examples and non-examples.",
      "Apply: complete one short familiar task using the prerequisite skill.",
      "Correct / explain: identify why one incorrect example is wrong."
    ]);

  }


  return bulletText(
    compact([

      pool.spacedKnowledge[
        0
      ]
        ? `Spaced retrieval: ${pool.spacedKnowledge[0]}`
        : pool.recentKnowledge[
            0
          ]
          ? `Retrieve: ${pool.recentKnowledge[0]}`
          : "Retrieve an important idea from earlier teaching.",

      (
        pool.applications[
          1
        ] ||
        pool.applications[
          0
        ]
      )
        ? `Apply: ${
            pool.applications[
              1
            ] ||
            pool.applications[
              0
            ]
          }`
        : "Apply one previously taught idea to a new familiar example.",

      pool.misconceptions[
        0
      ]
        ? `Correct / explain: ${pool.misconceptions[0]}`
        : "Correct one familiar misconception and explain the improvement.",

      pool.vocabulary[
        2
      ]
        ? `Vocabulary: ${pool.vocabulary[2]}`
        : ""

    ])
  );

}


// ============================================================
// THURSDAY
// ============================================================

function buildThursdayReview(
  weekNumber,
  pool
) {

  if (
    weekNumber === 1
  ) {

    return bulletText([
      "Retrieve one prerequisite fact or concept and one familiar process.",
      "Connect: explain how the two are related to the unit context.",
      "Apply: complete one quick example independently."
    ]);

  }


  return bulletText(
    compact([

      (
        pool.recentKnowledge[
          2
        ] ||
        pool.recentKnowledge[
          0
        ]
      )
        ? `Retrieve: ${
            pool.recentKnowledge[
              2
            ] ||
            pool.recentKnowledge[
              0
            ]
          }`
        : "Retrieve another important idea taught last week.",

      pool.spacedKnowledge[
        1
      ]
        ? `Earlier learning: ${pool.spacedKnowledge[1]}`
        : "",

      pool.questions[
        2
      ] ||
        pool.questions[
          0
        ] ||
        "Explain how two previously taught ideas connect.",

      (
        pool.applications[
          2
        ] ||
        pool.applications[
          0
        ]
      )
        ? `Apply: ${
            pool.applications[
              2
            ] ||
            pool.applications[
              0
            ]
          }`
        : ""

    ])
  );

}


// ============================================================
// FRIDAY
// ============================================================

function buildFridayReview(
  weekNumber,
  pool
) {

  if (
    weekNumber === 1
  ) {

    return bulletText([
      "Cumulative prerequisite check: retrieve the most important prior knowledge used this week.",
      "Independent quick application: use one familiar prerequisite skill without prompting.",
      "Self-correct: compare with a worked example and explain one improvement."
    ]);

  }


  return bulletText(
    compact([

      "Cumulative retrieval: revisit one item from last week and one item from earlier in the unit.",

      (
        pool.spacedKnowledge[
          2
        ] ||
        pool.spacedKnowledge[
          0
        ]
      )
        ? `Earlier learning: ${
            pool.spacedKnowledge[
              2
            ] ||
            pool.spacedKnowledge[
              0
            ]
          }`
        : "",

      pool.questions[
        3
      ] ||
        pool.questions[
          0
        ] ||
        "Explain one important idea from memory.",

      (
        pool.applications[
          3
        ] ||
        pool.applications[
          0
        ]
      )
        ? `Independent quick application: ${
            pool.applications[
              3
            ] ||
            pool.applications[
              0
            ]
          }`
        : "Independent quick application: apply previously taught learning without prompts.",

      (
        pool.misconceptions[
          1
        ] ||
        pool.misconceptions[
          0
        ]
      )
        ? `Self-correct: ${
            pool.misconceptions[
              1
            ] ||
            pool.misconceptions[
              0
            ]
          }`
        : "Self-correct one familiar error and explain the improvement."

    ])
  );

}


// ============================================================
// MULTI-AGE YEAR-SPECIFIC PROMPTS
// ============================================================

function buildYearSpecificReviewItems(
  weekNumber,
  priorLessons,
  curriculumRows
) {

  if (
    weekNumber === 1 ||
    !priorLessons.length
  ) {

    return {};

  }


  const years =
    Array.isArray(
      unitPlan.setup
        ?.yearLevels
    )
      ? unitPlan.setup.yearLevels
      : [];


  const taughtSubjects =
    unique(
      priorLessons.map(
        (lesson) =>
          lesson.subject
      )
    );


  const result = {};


  years.forEach(
    (yearLevel) => {

      const acceptedGrades =
        gradesForYear(
          yearLevel
        );


      const relevantRows =
        curriculumRows
          .filter(
            (row) =>
              acceptedGrades.includes(
                row.grade
              ) &&
              taughtSubjects.some(
                (subject) =>
                  subjectMatches(
                    subject,
                    row.subject
                  )
              )
          )
          .slice(
            0,
            4
          );


      if (!relevantRows.length) {
        return;
      }


      const prompts =
        relevantRows.map(
          (row) =>
            retrievalQuestionFromAspect(
              row
            )
        );


      result[
        yearLevel
      ] =
        bulletText(
          prompts
        );

    }
  );


  return result;

}


function subjectMatches(
  lessonSubject,
  curriculumSubject
) {

  const lesson =
    String(
      lessonSubject || ""
    )
      .toLowerCase();


  const curriculum =
    String(
      curriculumSubject || ""
    )
      .toLowerCase();


  return lesson === curriculum ||
    lesson.includes(
      curriculum
    ) ||
    curriculum.includes(
      lesson
    );

}


function retrievalQuestionFromAspect(
  row
) {

  const verbs =
    findCognitiveVerbs(
      row.text
    );


  const verb =
    verbs[0];


  const focus =
    shortenAspect(
      row.text
    );


  const subject =
    row.subject;


  const prompts = {

    identify:
      `${subject}: What can you identify about ${focus}?`,

    describe:
      `${subject}: Describe what you remember about ${focus}.`,

    explain:
      `${subject}: Explain how or why ${focus}.`,

    compare:
      `${subject}: What is one similarity and one difference connected to ${focus}?`,

    interpret:
      `${subject}: What does familiar information show about ${focus}?`,

    analyse:
      `${subject}: What evidence would you use when analysing ${focus}?`,

    infer:
      `${subject}: What could you infer about ${focus}, and what evidence supports it?`,

    organise:
      `${subject}: How should information connected to ${focus} be organised?`,

    create:
      `${subject}: What features are required when creating a response connected to ${focus}?`,

    use:
      `${subject}: Which feature, convention or process should be used for ${focus}?`,

    apply:
      `${subject}: How could you apply what you know about ${focus} to a new example?`,

    justify:
      `${subject}: What evidence could justify a response about ${focus}?`,

    evaluate:
      `${subject}: What criterion would help you evaluate ${focus}?`

  };


  return prompts[
    verb
  ] ||
  `${subject}: What do you remember about ${focus}?`;

}


// ============================================================
// RENDER WEEKLY DAILY REVIEW
// ============================================================

function renderWeeklyDailyReview() {

  const container =
    document.getElementById(
      "weeklyDailyReview"
    );


  if (!container) {
    return;
  }


  const weeks =
    Array.isArray(
      unitPlan.daily
        ?.weeklyPlan
    )
      ? unitPlan.daily.weeklyPlan
      : [];


  if (!weeks.length) {

    container.innerHTML = `
      <div class="empty">
        Select <strong>Suggest review bank</strong>
        to build the Monday–Friday Daily Review plan
        from the Step 5 lesson sequence.
      </div>
    `;

    return;

  }


  container.innerHTML =
    weeks
      .map(
        (week) =>
          dailyWeekHtml(
            week
          )
      )
      .join("");


  bindWeeklyReviewEvents();

}


// ============================================================
// WEEK HTML
// ============================================================

function dailyWeekHtml(
  week
) {

  return `
    <section
      class="daily-week-card"
      data-daily-week="${escapeAttribute(
        week.id
      )}"
    >

      <div class="daily-week-head">

        <div>

          <span class="daily-week-number">
            ${escapeHtml(
              week.week
            )}
          </span>

          <div>

            <strong>
              Week ${escapeHtml(
                week.week
              )} Daily Review
            </strong>

            <p>
              5 minutes • retrieve → recognise →
              apply → correct / explain
            </p>

          </div>

        </div>

      </div>


      <div class="daily-days-grid">

        ${dailyDayHtml(
          "Monday",
          "monday",
          week.monday
        )}

        ${dailyDayHtml(
          "Tuesday",
          "tuesday",
          week.tuesday
        )}

        ${dailyDayHtml(
          "Wednesday",
          "wednesday",
          week.wednesday
        )}

        ${dailyDayHtml(
          "Thursday",
          "thursday",
          week.thursday
        )}

        ${dailyDayHtml(
          "Friday",
          "friday",
          week.friday
        )}

      </div>


      ${yearSpecificHtml(
        week.yearSpecific
      )}


      <label class="daily-teacher-note">

        Teacher note / misconceptions noticed

        <textarea
          class="daily-week-note"
          rows="2"
          placeholder="Record errors, concepts to revisit, or changes for next week's review..."
        >${escapeHtml(
          week.teacherNote ||
          ""
        )}</textarea>

      </label>

    </section>
  `;

}


function dailyDayHtml(
  heading,
  field,
  value
) {

  return `
    <label class="daily-day-card">

      <strong>
        ${escapeHtml(
          heading
        )}
      </strong>

      <textarea
        data-daily-field="${escapeAttribute(
          field
        )}"
        rows="8"
      >${escapeHtml(
        value ||
        ""
      )}</textarea>

    </label>
  `;

}


// ============================================================
// YEAR-SPECIFIC HTML
// ============================================================

function yearSpecificHtml(
  yearSpecific
) {

  if (
    !yearSpecific ||
    !Object.keys(
      yearSpecific
    ).length
  ) {

    return "";

  }


  return `
    <div class="daily-year-specific">

      <div class="daily-subhead">

        <strong>
          Year-level specific prompts
        </strong>

        <span>
          Use when the Achievement Standard demand
          differs across the multi-age class.
        </span>

      </div>


      <div class="daily-year-grid">

        ${Object.entries(
          yearSpecific
        )
          .map(
            ([yearLevel, prompts]) => `

              <label class="daily-year-card">

                <strong>
                  ${escapeHtml(
                    yearLevel
                  )}
                </strong>

                <textarea
                  rows="5"
                  data-daily-year="${escapeAttribute(
                    yearLevel
                  )}"
                >${escapeHtml(
                  prompts ||
                  ""
                )}</textarea>

              </label>

            `
          )
          .join("")}

      </div>

    </div>
  `;

}


// ============================================================
// SAVE WEEKLY EDITS
// ============================================================

function bindWeeklyReviewEvents() {

  document
    .querySelectorAll(
      ".daily-week-card"
    )
    .forEach(
      (card) => {

        const weekId =
          card.dataset
            .dailyWeek;


        card
          .querySelectorAll(
            "[data-daily-field]"
          )
          .forEach(
            (field) => {

              field.addEventListener(
                "input",
                (event) => {

                  updateDailyWeekField(
                    weekId,
                    event.target
                      .dataset
                      .dailyField,
                    event.target.value
                  );

                }
              );

            }
          );


        card
          .querySelector(
            ".daily-week-note"
          )
          ?.addEventListener(
            "input",
            (event) => {

              updateDailyWeekField(
                weekId,
                "teacherNote",
                event.target.value
              );

            }
          );


        card
          .querySelectorAll(
            "[data-daily-year]"
          )
          .forEach(
            (field) => {

              field.addEventListener(
                "input",
                (event) => {

                  updateDailyYearPrompt(
                    weekId,
                    event.target
                      .dataset
                      .dailyYear,
                    event.target.value
                  );

                }
              );

            }
          );

      }
    );

}


function updateDailyWeekField(
  weekId,
  field,
  value
) {

  const weeks =
    cloneDailyWeeks();


  const week =
    weeks.find(
      (item) =>
        item.id ===
        weekId
    );


  if (!week) {
    return;
  }


  week[
    field
  ] =
    value;


  saveDailyWeeks(
    weeks
  );

}


function updateDailyYearPrompt(
  weekId,
  yearLevel,
  value
) {

  const weeks =
    cloneDailyWeeks();


  const week =
    weeks.find(
      (item) =>
        item.id ===
        weekId
    );


  if (!week) {
    return;
  }


  if (!week.yearSpecific) {
    week.yearSpecific = {};
  }


  week.yearSpecific[
    yearLevel
  ] =
    value;


  saveDailyWeeks(
    weeks
  );

}


// ============================================================
// COGNITIVE VERBS
// ============================================================

const REVIEW_VERBS = [

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
  "demonstrate",
  "apply",
  "use",

  "develop",
  "propose",
  "select",

  "organise",
  "organize",

  "group",
  "sequence",
  "link",
  "locate",
  "collect",
  "represent",

  "investigate",
  "plan",
  "perform",
  "communicate",
  "infer",

  "summarise",
  "summarize",

  "read",
  "view",
  "comprehend",
  "write",
  "present"

];


function findCognitiveVerbs(
  text = ""
) {

  const lower =
    String(
      text
    )
      .toLowerCase();


  const found = [];


  REVIEW_VERBS
    .forEach(
      (verb) => {

        const expression =
          new RegExp(
            `\\b${verb}\\w*\\b`,
            "i"
          );


        if (
          expression.test(
            lower
          )
        ) {

          const normalised =
            normaliseVerb(
              verb
            );


          if (
            !found.includes(
              normalised
            )
          ) {

            found.push(
              normalised
            );

          }

        }

      }
    );


  return found;

}


function normaliseVerb(
  verb
) {

  return {

    analyze:
      "analyse",

    organize:
      "organise",

    summarize:
      "summarise"

  }[
    verb
  ] ||
  verb;

}


// ============================================================
// TERMINOLOGY
// ============================================================

function extractLikelyTerms(
  text
) {

  return unique(
    meaningfulWords(
      text
    )
  )
    .filter(
      (word) =>
        word.length >= 6
    )
    .slice(
      0,
      5
    );

}


function meaningfulWords(
  text = ""
) {

  const stopWords =
    new Set([

      "students",
      "student",
      "their",
      "they",
      "these",
      "those",
      "using",
      "including",
      "include",
      "different",
      "relevant",
      "selected",
      "information",
      "knowledge",
      "learning",
      "achievement",
      "standard",
      "aspects",
      "aspect",
      "required",
      "through",
      "about",
      "where",
      "which",
      "while",
      "within",
      "across",
      "appropriate",
      "particular",
      "teacher",
      "practice",
      "explicitly",
      "guided",
      "modelled",
      "independent",
      "application",
      "response",
      "and",
      "with",
      "from",
      "into",
      "that",
      "this",
      "them",
      "have",
      "been",
      "when",
      "what",
      "will",
      "would",
      "could",
      "should",
      "also",
      "than",
      "then",
      "some",
      "more",
      "most",
      "other"

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
    .map(
      (word) =>
        word.trim()
    )
    .filter(
      (word) =>
        word.length > 3 &&
        !stopWords.has(
          word
        )
    );

}


// ============================================================
// YEAR / BAND MAPPING
// ============================================================

function gradesForYear(
  year
) {

  const values =
    [year];


  const match =
    String(
      year ||
      ""
    )
      .match(
        /\d+/
      );


  if (!match) {
    return values;
  }


  const number =
    Number(
      match[
        0
      ]
    );


  if (
    number === 1 ||
    number === 2
  ) {

    values.push(
      "Years 1–2"
    );

  }


  if (
    number === 3 ||
    number === 4
  ) {

    values.push(
      "Years 3–4"
    );

  }


  if (
    number === 5 ||
    number === 6
  ) {

    values.push(
      "Years 5–6"
    );

  }


  return values;

}


// ============================================================
// WEEK COUNT
// ============================================================

function getWeekCountFromSequence() {

  const weeks =
    Array.isArray(
      unitPlan.sequence
        ?.weeks
    )
      ? unitPlan.sequence.weeks
      : [];


  if (weeks.length) {
    return weeks.length;
  }


  const setup =
    unitPlan.setup ||
    {};


  const candidates = [

    setup.numberOfWeeks,
    setup.weekCount,
    setup.unitWeeks,
    setup.durationWeeks,
    setup.termWeeks,
    setup.weeks

  ];


  for (
    const candidate of
    candidates
  ) {

    const number =
      Number(
        candidate
      );


    if (
      Number.isFinite(
        number
      ) &&
      number > 0
    ) {

      return Math.min(
        Math.max(
          Math.round(
            number
          ),
          1
        ),
        20
      );

    }

  }


  return 10;

}


// ============================================================
// TEXT HELPERS
// ============================================================

function shortLessonFocus(
  lesson
) {

  const purpose =
    cleanLearningPurpose(
      lesson.purpose
    );


  if (purpose) {

    return purpose.length <= 115
      ? purpose
      : `${purpose
          .slice(
            0,
            112
          )
          .trim()}...`;

  }


  return "the previously taught learning";

}


function shortenAspect(
  text
) {

  const cleaned =
    cleanSentence(
      String(
        text ||
        ""
      )
        .replace(
          /^students\s+/i,
          ""
        )
        .replace(
          /^they\s+/i,
          ""
        )
    );


  return cleaned.length <= 120
    ? cleaned
    : `${cleaned
        .slice(
          0,
          117
        )
        .trim()}...`;

}


function cleanSentence(
  text
) {

  return String(
    text ||
    ""
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .replace(
      /\.$/,
      ""
    );

}


function compact(
  values
) {

  return values.filter(
    Boolean
  );

}


// ============================================================
// GENERAL HELPERS
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


function bulletText(
  values
) {

  return values
    .filter(
      Boolean
    )
    .map(
      (value) =>
        `• ${value}`
    )
    .join("\n");

}


function getNestedValue(
  object,
  path
) {

  return String(
    path
  )
    .split(".")
    .reduce(
      (value, key) =>
        value?.[
          key
        ],
      object
    );

}


function setGeneratedField(
  elementId,
  statePath,
  value
) {

  const element =
    document.getElementById(
      elementId
    );


  if (element) {
    element.value = value;
  }


  updateUnitPlan(
    statePath,
    value
  );

}


function cloneDailyWeeks() {

  return structuredClone(
    Array.isArray(
      unitPlan.daily
        ?.weeklyPlan
    )
      ? unitPlan.daily.weeklyPlan
      : []
  );

}


function saveDailyWeeks(
  weeks
) {

  updateUnitPlan(
    "daily.weeklyPlan",
    weeks
  );

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