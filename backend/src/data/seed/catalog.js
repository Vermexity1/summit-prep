export const EXAM_BLUEPRINTS = {
  SAT: {
    examType: "SAT",
    label: "SAT",
    totalQuestions: 98,
    readingCount: 27,
    writingCount: 27,
    mathCount: 44,
    totalTimeMinutes: 134,
    scoreRange: {
      total: [400, 1600],
      verbal: [200, 800],
      math: [200, 800]
    }
  },
  PSAT: {
    examType: "PSAT",
    label: "PSAT / NMSQT",
    totalQuestions: 98,
    readingCount: 27,
    writingCount: 27,
    mathCount: 44,
    totalTimeMinutes: 134,
    scoreRange: {
      total: [320, 1520],
      verbal: [160, 760],
      math: [160, 760]
    }
  }
};

export const QUESTION_CATALOG = {
  math: [
    { type: "linear-equation", label: "Linear equations", domain: "Algebra" },
    { type: "system-of-equations", label: "Systems of equations", domain: "Algebra" },
    { type: "quadratic", label: "Quadratics", domain: "Advanced Math" },
    { type: "function-notation", label: "Function notation", domain: "Advanced Math" },
    { type: "exponential", label: "Exponential growth", domain: "Advanced Math" },
    { type: "ratio-percent", label: "Ratios and percent change", domain: "Problem Solving" },
    { type: "probability", label: "Probability", domain: "Problem Solving" },
    { type: "statistics", label: "Statistics", domain: "Problem Solving" },
    { type: "geometry-area", label: "Geometry and area", domain: "Geometry and Trigonometry" },
    { type: "circle", label: "Circle relationships", domain: "Geometry and Trigonometry" },
    { type: "triangle", label: "Right triangles", domain: "Geometry and Trigonometry" }
  ],
  reading: [
    { type: "central-idea", label: "Central idea", domain: "Information and Ideas" },
    { type: "inference", label: "Inference", domain: "Information and Ideas" },
    { type: "command-of-evidence", label: "Command of evidence", domain: "Information and Ideas" },
    { type: "words-in-context", label: "Words in context", domain: "Craft and Structure" },
    { type: "purpose-tone", label: "Purpose and tone", domain: "Craft and Structure" },
    { type: "paired-passages", label: "Paired passages", domain: "Craft and Structure" },
    { type: "data-interpretation", label: "Data interpretation", domain: "Information and Ideas" }
  ],
  writing: [
    { type: "subject-verb", label: "Subject-verb agreement", domain: "Standard English Conventions" },
    { type: "punctuation-comma", label: "Comma usage", domain: "Standard English Conventions" },
    { type: "punctuation-semicolon", label: "Semicolons and colons", domain: "Standard English Conventions" },
    { type: "transitions", label: "Transitions", domain: "Expression of Ideas" },
    { type: "sentence-placement", label: "Sentence placement", domain: "Expression of Ideas" },
    { type: "concision", label: "Concision", domain: "Expression of Ideas" },
    { type: "pronoun-clarity", label: "Pronoun clarity", domain: "Standard English Conventions" },
    { type: "verb-tense", label: "Verb tense", domain: "Standard English Conventions" },
    { type: "parallel-structure", label: "Parallel structure", domain: "Expression of Ideas" }
  ]
};

export const QUESTION_TYPE_LOOKUP = Object.values(QUESTION_CATALOG)
  .flat()
  .reduce((lookup, entry) => {
    lookup[entry.type] = entry;
    return lookup;
  }, {});

export const TEST_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

export const OFFICIAL_RESOURCES = {
  note:
    "Summit Prep keeps its built-in questions original and exam-aligned rather than reprinting copyrighted College Board questions. For genuine College Board-released material, use the official resources below.",
  items: [
    {
      id: "eqb",
      title: "Educator Question Bank",
      source: "College Board",
      examTypes: ["SAT", "PSAT"],
      sections: ["reading", "writing", "math"],
      url: "https://satsuite.collegeboard.org/k12-educators/tools-resources/question-bank/overview",
      description:
        "Search thousands of official SAT Suite questions and export sets with answer rationales."
    },
    {
      id: "sat-practice-tests",
      title: "Official SAT Practice Tests",
      source: "College Board",
      examTypes: ["SAT"],
      sections: ["reading", "writing", "math"],
      url: "https://satsuite.collegeboard.org/practice/practice-tests?excmpid=mtg754-pr-3-mn",
      description:
        "Full-length SAT practice tests, scoring guides, and answer explanations from College Board."
    },
    {
      id: "psat-practice-tests",
      title: "Official PSAT Practice Tests",
      source: "College Board",
      examTypes: ["PSAT"],
      sections: ["reading", "writing", "math"],
      url: "https://satsuite.collegeboard.org/practice/practice-tests/paper",
      description:
        "Released PSAT / NMSQT and PSAT 10 paper practice bundles with scoring guides and explanations."
    },
    {
      id: "paper-practice-overview",
      title: "Full-Length Paper Practice Test Hub",
      source: "College Board",
      examTypes: ["SAT", "PSAT"],
      sections: ["reading", "writing", "math"],
      url: "https://satsuite.collegeboard.org/practice/practice-tests/paper",
      description:
        "A single hub for downloadable official paper practice tests across the SAT Suite."
    }
  ]
};
