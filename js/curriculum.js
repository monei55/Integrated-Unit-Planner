import {
  unitPlan,
  updateUnitPlan
} from "./state.js";


// ============================================================
// CURRICULUM DATA
// ============================================================

const DATA =
  window.CURRICULUM_DATA || [];


// ============================================================
// CURRICULUM AREA ORDER
// ============================================================

const AREA_ORDER = {

  English: [
    "Reading & Viewing",
    "Writing & Creating",
    "Speaking & Listening",
    "Language"
  ],

  Mathematics: [
    "Number",
    "Algebra",
    "Measurement",
    "Space",
    "Statistics",
    "Probability"
  ],

  Science: [
    "Life & Living",
    "Material World",
    "Physical World",
    "Earth & Space",
    "Science Inquiry",
    "Science as a Human Endeavour"
  ],

  HASS: [
    "History",
    "Geography",
    "Civics & Citizenship",
    "Economics & Business",
    "HASS Inquiry & Skills"
  ],

  HPE: [
    "Health & Wellbeing",
    "Physical Activity & Movement"
  ],

  "Design and Technologies": [
    "Knowledge & Understanding",
    "Creating Designed Solutions"
  ],

  "Digital Technologies": [
    "Digital Systems",
    "Data",
    "Creating Digital Solutions"
  ],

  Dance: [
    "Knowledge & Understanding",
    "Skills"
  ],

  Drama: [
    "Knowledge & Understanding",
    "Skills"
  ],

  "Media Arts": [
    "Knowledge & Understanding",
    "Skills"
  ],

  Music: [
    "Knowledge & Understanding",
    "Skills"
  ],

  "Visual Arts": [
    "Knowledge & Understanding",
    "Skills"
  ]

};


// ============================================================
// PAGE INITIALISATION
// ============================================================

export function initCurriculumPage() {

  renderCurriculumSummary();

  renderCurriculum();

  setupSuggestionButton();

}


// ============================================================
// YEAR / BAND MAPPING
// ============================================================

function gradesForYear(year) {

  const values = [year];

  const match =
    year.match(/\d+/);

  if (!match) {
    return values;
  }

  const number =
    Number(match[0]);

  if (
    number === 1 ||
    number === 2
  ) {
    values.push("Years 1–2");
  }

  if (
    number === 3 ||
    number === 4
  ) {
    values.push("Years 3–4");
  }

  if (
    number === 5 ||
    number === 6
  ) {
    values.push("Years 5–6");
  }

  return values;

}


// ============================================================
// CURRICULUM AREA CLASSIFICATION
// ============================================================

function curriculumArea(row) {

  // Where the verified dataset already
  // contains an explicit area, use it.
  if (row.area) {
    return row.area;
  }


  const text =
    (row.text || "").toLowerCase();

  const subject =
    row.subject;


  // ----------------------------------------------------------
  // ENGLISH
  // ----------------------------------------------------------

  if (subject === "English") {

    if (
      /spoken|listen|speaking|voice|interact with others|oral/.test(text)
    ) {
      return "Speaking & Listening";
    }


    if (
      /create written|write |spell|handwrit|paragraph|sentence|punctuation/.test(text)
    ) {
      return "Writing & Creating";
    }


    if (
      /read|view|comprehend|text structures|visual features|ideas are (presented|developed)|characters|settings|events/.test(text)
    ) {
      return "Reading & Viewing";
    }


    return "Language";

  }


  // ----------------------------------------------------------
  // MATHEMATICS
  // ----------------------------------------------------------

  if (subject === "Mathematics") {

    if (
      /probab|chance|likelihood/.test(text)
    ) {
      return "Probability";
    }


    if (
      /statistic|data|survey|graph|chart/.test(text)
    ) {
      return "Statistics";
    }


    if (
      /shape|space|location|position|map|angle|symmetr|transform|grid/.test(text)
    ) {
      return "Space";
    }


    if (
      /measure|length|mass|capacity|area|perimeter|time|duration|temperature/.test(text)
    ) {
      return "Measurement";
    }


    if (
      /pattern|algebra|equival|function|unknown|algorithm/.test(text)
    ) {
      return "Algebra";
    }


    return "Number";

  }


  // ----------------------------------------------------------
  // SCIENCE
  // ----------------------------------------------------------

  if (subject === "Science") {

    if (
      /living|life cycle|habitat|plant|animal|ecosystem|survival|biological/.test(text)
    ) {
      return "Life & Living";
    }


    if (
      /material|solid|liquid|gas|change of state|mixture|property/.test(text)
    ) {
      return "Material World";
    }


    if (
      /force|motion|energy|heat|light|sound|electric/.test(text)
    ) {
      return "Physical World";
    }


    if (
      /earth|space|sun|moon|planet|weather|season|landscape|geolog/.test(text)
    ) {
      return "Earth & Space";
    }


    if (
      /question|investigat|observe|measure|data|evidence|predict|conclusion|communicat|represent|fair test/.test(text)
    ) {
      return "Science Inquiry";
    }


    return "Science as a Human Endeavour";

  }


  // ----------------------------------------------------------
  // HASS
  // ----------------------------------------------------------

  if (subject === "HASS") {

    if (
      /history|histor|past|present|continuity|change|significance|commemor|first fleet|colon|migration/.test(text)
    ) {
      return "History";
    }


    if (
      /geograph|place|environment|location|map|spatial|climate|natural|sustainab/.test(text)
    ) {
      return "Geography";
    }


    if (
      /civic|citizen|government|democra|law|rules|decision-making|community participation/.test(text)
    ) {
      return "Civics & Citizenship";
    }


    if (
      /economic|business|consumer|producer|resource|scarcity|needs and wants|financial/.test(text)
    ) {
      return "Economics & Business";
    }


    return "HASS Inquiry & Skills";

  }


  // ----------------------------------------------------------
  // HPE
  // ----------------------------------------------------------

  if (subject === "HPE") {

    if (
      /movement|physical|motor|game|sport|fitness|active|locomotor|skill/.test(text)
    ) {
      return "Physical Activity & Movement";
    }


    return "Health & Wellbeing";

  }


  // ----------------------------------------------------------
  // DESIGN TECHNOLOGIES
  // ----------------------------------------------------------

  if (
    subject ===
    "Design and Technologies"
  ) {

    if (
      /design|create|produce|evaluate|plan|process/.test(text)
    ) {
      return "Creating Designed Solutions";
    }


    return "Knowledge & Understanding";

  }


  // ----------------------------------------------------------
  // DIGITAL TECHNOLOGIES
  // ----------------------------------------------------------

  if (
    subject ===
    "Digital Technologies"
  ) {

    if (
      /create|design|algorithm|implement|evaluate|solution/.test(text)
    ) {
      return "Creating Digital Solutions";
    }


    if (/data/.test(text)) {
      return "Data";
    }


    return "Digital Systems";

  }


  // ----------------------------------------------------------
  // THE ARTS
  // ----------------------------------------------------------

  if (
    [
      "Dance",
      "Drama",
      "Media Arts",
      "Music",
      "Visual Arts"
    ].includes(subject)
  ) {

    if (
      /create|make|perform|present|produce|compose|choreograph|devise|construct/.test(text)
    ) {
      return "Skills";
    }


    return "Knowledge & Understanding";

  }


  return "Achievement Standard";

}


// ============================================================
// CURRICULUM SUMMARY
// ============================================================

function renderCurriculumSummary() {

  const container =
    document.getElementById(
      "curriculumSummary"
    );


  const years =
    unitPlan.setup.yearLevels;

  const subjects =
    unitPlan.setup.learningAreas;


  if (
    !years.length ||
    !subjects.length
  ) {

    container.innerHTML = `
      <div class="empty">
        Return to Unit Setup and select
        at least one year level and one
        learning area.
      </div>
    `;

    return;

  }


  container.innerHTML = `

    <div class="curriculum-summary-card">

      <div>
        <strong>
          Year level${years.length === 1 ? "" : "s"}
        </strong>

        <span>
          ${years.join(", ")}
        </span>
      </div>

      <div>
        <strong>
          Learning areas
        </strong>

        <span>
          ${subjects.join(", ")}
        </span>
      </div>

      <div>
        <strong>
          Selected aspects
        </strong>

        <span id="selectedAspectCount">
          ${unitPlan.curriculum.selectedStandards.length}
        </span>
      </div>

    </div>

  `;

}


// ============================================================
// MAIN CURRICULUM RENDER
// ============================================================

function renderCurriculum() {

  const container =
    document.getElementById(
      "curriculumCards"
    );


  container.innerHTML = "";


  const years =
    unitPlan.setup.yearLevels;

  const subjects =
    unitPlan.setup.learningAreas;


  if (
    !years.length ||
    !subjects.length
  ) {

    container.innerHTML = `
      <div class="empty">
        Select year levels and learning
        areas in Unit Setup first.
      </div>
    `;

    return;

  }


  subjects.forEach((subject) => {

    years.forEach((year) => {

      renderCurriculumCard(
        container,
        subject,
        year
      );

    });

  });

}


// ============================================================
// CURRICULUM CARD
// ============================================================

function renderCurriculumCard(
  container,
  subject,
  year
) {

  const acceptedGrades =
    gradesForYear(year);


  const rawRows =
    DATA.filter((row) =>
      row.subject === subject &&
      acceptedGrades.includes(
        row.grade
      ) &&
      row.type ===
        "achievement_standard" &&
      row.text
    );


  const rows =
    uniqueCurriculumRows(rawRows);


  const card =
    document.createElement("div");

  card.className =
    "curr-card";


  const officialGrades =
    [
      ...new Set(
        rows.map(
          (row) => row.grade
        )
      )
    ];


  card.innerHTML = `

    <div class="curr-head">

      <strong>
        ${escapeHtml(subject)}
        —
        ${escapeHtml(year)}
      </strong>

      <span>

        ${rows.length}
        Achievement Standard
        aspect${rows.length === 1 ? "" : "s"}

        ${
          officialGrades.length &&
          !officialGrades.includes(year)
            ? `
              • official band:
              ${officialGrades
                .map(escapeHtml)
                .join(", ")}
            `
            : ""
        }

      </span>

    </div>

  `;


  const list =
    document.createElement("div");

  list.className =
    "standard-list strand-list";


  if (!rows.length) {

    list.innerHTML = `
      <div class="empty">
        No Achievement Standard aspects
        are currently available for this
        learning area / year combination.
      </div>
    `;

    card.appendChild(list);
    container.appendChild(card);

    return;

  }


  const groups =
    groupRowsByArea(rows);


  const preferredOrder =
    AREA_ORDER[subject] ||
    Object.keys(groups);


  const remainingAreas =
    Object.keys(groups).filter(
      (area) =>
        !preferredOrder.includes(area)
    );


  const fullOrder = [
    ...preferredOrder,
    ...remainingAreas
  ];


  fullOrder
    .filter(
      (area) =>
        groups[area]?.length
    )
    .forEach(
      (area, index) => {

        const section =
          createAreaSection(
            subject,
            year,
            area,
            groups[area],
            index === 0
          );

        list.appendChild(section);

      }
    );


  card.appendChild(list);

  container.appendChild(card);

}


// ============================================================
// AREA GROUPS
// ============================================================

function groupRowsByArea(rows) {

  return rows.reduce(
    (result, row) => {

      const area =
        curriculumArea(row);

      if (!result[area]) {
        result[area] = [];
      }

      result[area].push(row);

      return result;

    },
    {}
  );

}


function createAreaSection(
  subject,
  year,
  area,
  rows,
  open
) {

  const details =
    document.createElement(
      "details"
    );

  details.className =
    "strand-group";

  details.open = open;


  details.innerHTML = `

    <summary>

      <span>
        ${escapeHtml(area)}
      </span>

      <small>
        ${rows.length}
        aspect${rows.length === 1 ? "" : "s"}
      </small>

    </summary>

  `;


  const options =
    document.createElement("div");

  options.className =
    "strand-options";


  rows.forEach((row) => {

    const item =
      createStandardItem(
        subject,
        year,
        area,
        row
      );

    options.appendChild(item);

  });


  details.appendChild(options);

  return details;

}


// ============================================================
// ACHIEVEMENT STANDARD ITEM
// ============================================================

function createStandardItem(
  subject,
  year,
  area,
  row
) {

  const item =
    document.createElement("div");

  item.className =
    "standard-item";


  const label =
    document.createElement("label");

  label.className =
    "standard-option";


  const selected =
    unitPlan.curriculum
      .selectedStandards
      .includes(row.code);


  label.innerHTML = `

    <input
      type="checkbox"
      ${selected ? "checked" : ""}
    >

    <span>
      ${escapeHtml(row.text)}
    </span>

  `;


  label
    .querySelector("input")
    .addEventListener(
      "change",
      (event) => {

        setStandardSelected(
          row.code,
          event.target.checked
        );

      }
    );


  item.appendChild(label);


  const references =
    relatedContentDescriptions(
      row,
      area
    );


  if (references.length) {

    const reference =
      document.createElement(
        "details"
      );

    reference.className =
      "content-ref";


    reference.innerHTML = `

      <summary>

        View related V9 content
        descriptions

        <span>
          ${references.length}
        </span>

      </summary>

      <div class="content-ref-list">

        ${
          references
            .map(
              (referenceRow) => `

                <div>

                  <code>
                    ${escapeHtml(
                      referenceRow.code
                    )}
                  </code>

                  <p>
                    ${escapeHtml(
                      referenceRow.text
                    )}
                  </p>

                </div>

              `
            )
            .join("")
        }

      </div>

    `;


    item.appendChild(reference);

  }


  return item;

}


// ============================================================
// STANDARD SELECTION
// ============================================================

function setStandardSelected(
  code,
  selected
) {

  const standards =
    [
      ...unitPlan.curriculum
        .selectedStandards
    ];


  const index =
    standards.indexOf(code);


  if (
    selected &&
    index < 0
  ) {

    standards.push(code);

  }


  if (
    !selected &&
    index >= 0
  ) {

    standards.splice(
      index,
      1
    );

  }


  updateUnitPlan(
    "curriculum.selectedStandards",
    standards
  );


  updateSelectedCount();

}


function updateSelectedCount() {

  const count =
    document.getElementById(
      "selectedAspectCount"
    );

  if (count) {

    count.textContent =
      unitPlan.curriculum
        .selectedStandards.length;

  }

}


// ============================================================
// RELATED CONTENT DESCRIPTIONS
// ============================================================

function relatedContentDescriptions(
  aspect,
  area
) {

  const acceptedGrades =
    gradesForYear(
      aspect.grade
    );


  if (
    !acceptedGrades.includes(
      aspect.grade
    )
  ) {

    acceptedGrades.push(
      aspect.grade
    );

  }


  return DATA
    .filter((row) =>
      row.subject ===
        aspect.subject &&
      row.type ===
        "content_description" &&
      acceptedGrades.includes(
        row.grade
      ) &&
      curriculumArea(row) ===
        area
    )
    .slice(0, 18);

}


// ============================================================
// DUPLICATE PROTECTION
// ============================================================

function uniqueCurriculumRows(rows) {

  const seen =
    new Set();


  return rows.filter((row) => {

    const key =
      `${row.subject}|${row.code || ""}|${row.text}`;


    if (seen.has(key)) {
      return false;
    }


    seen.add(key);

    return true;

  });

}


// ============================================================
// SELECTED CURRICULUM
// ============================================================

export function getSelectedCurriculumRows() {

  const selected =
    new Set(
      unitPlan.curriculum
        .selectedStandards
    );


  return DATA.filter(
    (row) =>
      row.type ===
        "achievement_standard" &&
      selected.has(row.code)
  );

}


// ============================================================
// CROSS-CURRICULAR PROMPT
// ============================================================

function setupSuggestionButton() {

  const button =
    document.getElementById(
      "suggestCurriculumLinks"
    );


  button.addEventListener(
    "click",
    () => {

      const rows =
        getSelectedCurriculumRows();


      const output =
        document.getElementById(
          "curriculumLinkSuggestions"
        );


      if (rows.length < 2) {

        output.innerHTML = `
          Select at least two Achievement
          Standard aspects first.
        `;

        return;

      }


      const subjects =
        [
          ...new Set(
            rows.map(
              (row) =>
                row.subject
            )
          )
        ];


      const terminology =
        [
          ...new Set(
            rows
              .flatMap(
                (row) =>
                  (row.keywords || "")
                    .split(",")
              )
              .map(
                (word) =>
                  word.trim()
              )
              .filter(Boolean)
          )
        ]
        .slice(0, 12);


      output.innerHTML = `

        <strong>
          Possible integration lens
        </strong>

        <p>
          Look for a meaningful concept,
          investigation or product where
          ${subjects
            .map(escapeHtml)
            .join(" + ")}
          can contribute authentic learning
          or evidence.
        </p>

        ${
          terminology.length
            ? `
              <p>
                <strong>
                  Possible shared terminology:
                </strong>

                ${terminology
                  .map(escapeHtml)
                  .join(", ")}
              </p>
            `
            : ""
        }

        <p>
          Keep each selected Achievement
          Standard aspect visible so that
          integration does not reduce the
          curriculum demand.
        </p>

      `;

    }
  );

}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeHtml(value = "") {

  return String(value).replace(
    /[&<>'"]/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]
  );

}