import { QUESTION_TYPE_LOOKUP, TEST_YEARS } from "./catalog.js";
import { choice, createId, randomInt, round, shuffle } from "../../utils/helpers.js";

const readingPassages = [
  {
    id: "trees",
    title: "Urban Trees",
    text:
      "When the city of Marrow installed rows of shade trees along its busiest streets, traffic engineers predicted only a modest effect on neighborhood life. Within two summers, however, residents reported spending more time walking to nearby shops, and store owners noted that customers lingered longer outdoors. Researchers later suggested that the trees did more than cool the pavement: they subtly transformed the streets from spaces designed only for movement into places people wanted to occupy.",
    centralIdea:
      "Street trees improved neighborhood activity by changing how people experienced public space.",
    inference:
      "The engineers underestimated how environmental design can influence human behavior.",
    evidence:
      "they subtly transformed the streets from spaces designed only for movement into places people wanted to occupy",
    vocabWord: "modest",
    vocabMeaning: "limited",
    purpose: "to explain why a practical city project had broader social effects than expected",
    tone: "measured and explanatory"
  },
  {
    id: "jazz",
    title: "Improvisation",
    text:
      "Jazz historian Lena Ortiz argues that improvisation is often misunderstood as pure spontaneity. In her view, memorable solos emerge not from ignoring structure but from knowing it deeply enough to bend it with purpose. Musicians who master recurring chord patterns can depart from them at just the right moment, giving listeners the surprise of invention without the confusion of chaos.",
    centralIdea:
      "Strong improvisation depends on deep knowledge of structure rather than freedom from structure.",
    inference:
      "Ortiz would likely say that preparation enables creative risk-taking.",
    evidence:
      "memorable solos emerge not from ignoring structure but from knowing it deeply enough to bend it with purpose",
    vocabWord: "depart",
    vocabMeaning: "move away",
    purpose: "to challenge a common misconception about a musical practice",
    tone: "corrective yet appreciative"
  },
  {
    id: "battery",
    title: "Battery Research",
    text:
      "A team developing next-generation batteries tested a ceramic coating intended to reduce heat buildup during rapid charging. The coating did improve safety, but an unexpected result drew even more interest: batteries with the coating also retained capacity longer over repeated use. The researchers now think the coating stabilizes the battery's internal structure, protecting it from the tiny stresses that accumulate during each charge cycle.",
    centralIdea:
      "A safety-focused battery coating also appears to improve long-term durability.",
    inference:
      "The researchers were surprised because the durability benefit was not their original goal.",
    evidence: "an unexpected result drew even more interest",
    vocabWord: "retained",
    vocabMeaning: "kept",
    purpose: "to describe a discovery that broadened the value of an experiment",
    tone: "curious and analytical"
  },
  {
    id: "archive",
    title: "Community Archive",
    text:
      "The Harbor Street archive began as a volunteer effort to scan family photographs before the prints faded beyond recognition. Over time, the project expanded to include oral histories, handwritten recipes, and neighborhood maps. By collecting ordinary records alongside major public documents, the archive has given historians a fuller sense of how residents understood their own community.",
    centralIdea:
      "Preserving everyday materials can deepen historians' understanding of a community.",
    inference:
      "The archive became more valuable as it broadened beyond photographs alone.",
    evidence:
      "the project expanded to include oral histories, handwritten recipes, and neighborhood maps",
    vocabWord: "ordinary",
    vocabMeaning: "everyday",
    purpose: "to show how a local preservation project grew in historical importance",
    tone: "respectful and informative"
  }
];

const pairedPassages = [
  {
    id: "homework",
    passageA:
      "School administrator Priya Raman argues that short daily homework assignments can help students retain new material, especially when the work asks them to explain a concept in their own words.",
    passageB:
      "Education researcher Malik Jensen agrees that review matters, but he contends that overly frequent homework can reduce motivation if it feels repetitive rather than purposeful.",
    sharedPoint: "Both authors believe that practice after class can be valuable when it is meaningful.",
    disagreement: "Raman emphasizes consistency, whereas Jensen warns against unreflective repetition."
  },
  {
    id: "bikes",
    passageA:
      "Transportation planner Sofia Kim supports adding protected bike lanes because they can reduce traffic congestion while giving more residents a practical commuting option.",
    passageB:
      "Business owner Carla Reyes supports bike lanes only when delivery access is preserved, arguing that design details determine whether a project strengthens or disrupts a neighborhood.",
    sharedPoint: "Both writers support bike infrastructure in principle.",
    disagreement: "Kim highlights broad transportation benefits, while Reyes focuses on implementation details."
  }
];

const dataInterpretationSets = [
  {
    id: "library",
    tableTitle: "Library Program Attendance",
    rows: [
      ["January", 42],
      ["February", 51],
      ["March", 63],
      ["April", 60]
    ],
    prompt: "Which statement is best supported by the data in the table?",
    correct:
      "Attendance generally increased from January to March before dipping slightly in April."
  },
  {
    id: "garden",
    tableTitle: "Community Garden Yield (kg)",
    rows: [
      ["Plot A", 18],
      ["Plot B", 24],
      ["Plot C", 24],
      ["Plot D", 31]
    ],
    prompt: "Which conclusion is best supported by the data in the table?",
    correct:
      "Plot D produced the highest yield, while Plots B and C produced the same amount."
  }
];

function createBaseQuestion(template, details) {
  return {
    id: createId("q"),
    section: template.section,
    type: template.type,
    typeLabel: template.label,
    domain: template.domain,
    examType: details.examType,
    difficulty: details.difficulty,
    year: details.year,
    sourceLabel: `Original Summit Prep practice set (${details.year})`,
    ...details
  };
}

function createMultipleChoiceQuestion(template, details) {
  const choiceLabels = ["A", "B", "C", "D"];
  const correctChoice = details.choices.find((choice) => choice.id === details.answerKey) || details.choices[0];
  const distractors = details.choices
    .filter((choice) => choice.id !== correctChoice.id)
    .map((choice) => ({ text: choice.text, correct: false }));
  const remappedChoices = shuffle([
    { text: correctChoice.text, correct: true },
    ...distractors
  ]).map((choice, index) => ({
    id: choiceLabels[index],
    text: choice.text,
    correct: choice.correct
  }));
  const answerKey = remappedChoices.find((choice) => choice.correct)?.id || "A";

  return createBaseQuestion(template, {
    ...details,
    choices: remappedChoices.map(({ id, text }) => ({ id, text })),
    answerKey,
    acceptedAnswers: [answerKey.toLowerCase()],
    answerFormat: "multiple-choice"
  });
}

function createNumericQuestion(template, details) {
  return createBaseQuestion(template, {
    ...details,
    answerFormat: "numeric"
  });
}

const templates = [
  {
    section: "math",
    type: "linear-equation",
    label: QUESTION_TYPE_LOOKUP["linear-equation"].label,
    domain: QUESTION_TYPE_LOOKUP["linear-equation"].domain,
    guide: {
      title: "Solve Linear Equations",
      summary: "Undo operations in the reverse order, and keep both sides balanced.",
      steps: [
        "Simplify each side before moving terms.",
        "Get all variable terms on one side.",
        "Isolate the variable by dividing or multiplying last."
      ],
      pitfall: "Students often distribute incorrectly or forget to divide the entire side."
    },
    build({ examType, difficulty, year }) {
      if (difficulty === "hard") {
        const x = randomInt(4, 11);
        const outer = randomInt(2, 5);
        const inner = randomInt(2, 7);
        const rightCoefficient = randomInt(1, outer - 1);
        const rightConstant = outer * (x + inner) - rightCoefficient * x;

        return createNumericQuestion(this, {
          examType,
          difficulty,
          year,
          prompt: `Solve for x: ${outer}(x + ${inner}) = ${rightCoefficient}x + ${rightConstant}`,
          acceptedAnswers: [String(x)],
          explanationSteps: [
            `Distribute on the left to get ${outer}x + ${outer * inner} = ${rightCoefficient}x + ${rightConstant}.`,
            `Subtract ${rightCoefficient}x from both sides, then subtract ${outer * inner} from both sides.`,
            `That isolates x and gives x = ${x}.`
          ],
          bestApproach: "Distribute first, then collect like terms"
        });
      }

      const x = randomInt(3, 11);
      const coefficient = randomInt(2, 6);
      const addend = randomInt(1, 8);
      const constant = coefficient * x + addend;
      const prompt = `Solve for x: ${coefficient}x + ${addend} = ${constant}`;

      return createNumericQuestion(this, {
        examType,
        difficulty,
        year,
        prompt,
        acceptedAnswers: [String(x)],
        explanationSteps: [
          `Subtract ${addend} from both sides to get ${coefficient}x = ${constant - addend}.`,
          `Divide both sides by ${coefficient}.`,
          `So x = ${x}.`
        ],
        bestApproach: "Inverse operations"
      });
    }
  },
  {
    section: "math",
    type: "system-of-equations",
    label: QUESTION_TYPE_LOOKUP["system-of-equations"].label,
    domain: QUESTION_TYPE_LOOKUP["system-of-equations"].domain,
    guide: {
      title: "Solve Systems Quickly",
      summary: "Use elimination when the coefficients line up neatly.",
      steps: [
        "Choose the variable that is easiest to eliminate.",
        "Add or subtract the equations.",
        "Substitute the result back into one original equation."
      ],
      pitfall: "A sign mistake during subtraction can flip the final answer."
    },
    build({ examType, difficulty, year }) {
      const x = randomInt(2, 9);
      const y = randomInt(3, 12);
      const sum = x + y;
      const diff = x - y;

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: "What is the value of x in the system below?",
        passage: `${"x + y = " + sum}\n${"x - y = " + diff}`,
        choices: shuffle([
          { id: "A", text: String(x) },
          { id: "B", text: String(y) },
          { id: "C", text: String(sum) },
          { id: "D", text: String(diff) }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "Add the equations to eliminate y.",
          `That gives 2x = ${sum + diff}.`,
          `Divide by 2 to get x = ${x}.`
        ],
        bestApproach: "Elimination"
      });
    }
  },
  {
    section: "math",
    type: "quadratic",
    label: QUESTION_TYPE_LOOKUP.quadratic.label,
    domain: QUESTION_TYPE_LOOKUP.quadratic.domain,
    guide: {
      title: "Factor Friendly Quadratics",
      summary: "Look for two numbers that multiply to the constant term and add to the middle coefficient.",
      steps: [
        "Move everything to one side if needed.",
        "Factor the trinomial.",
        "Set each factor equal to zero."
      ],
      pitfall: "Do not forget that a quadratic can have two solutions."
    },
    build({ examType, difficulty, year }) {
      const a = randomInt(1, 4);
      const b = randomInt(3, 7);
      const c = randomInt(2, 6);
      const root1 = -b;
      const root2 = c;
      const middle = a * (b - c);
      const constant = -a * b * c;

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `One solution to ${a}x^2 + ${middle}x ${constant >= 0 ? "+" : "-"} ${Math.abs(
          constant
        )} = 0 is`,
        choices: shuffle([
          { id: "A", text: String(root2) },
          { id: "B", text: String(root1) },
          { id: "C", text: String(a) },
          { id: "D", text: String(constant) }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          `Factor the quadratic as ${a}(x + ${b})(x - ${c}) = 0.`,
          "Set each factor equal to zero.",
          `The solutions are x = ${root1} and x = ${root2}, so one valid answer is ${root2}.`
        ],
        bestApproach: "Factoring"
      });
    }
  },
  {
    section: "math",
    type: "function-notation",
    label: QUESTION_TYPE_LOOKUP["function-notation"].label,
    domain: QUESTION_TYPE_LOOKUP["function-notation"].domain,
    guide: {
      title: "Read the Function Carefully",
      summary: "Treat the notation as instructions: replace x with the input value everywhere it appears.",
      steps: [
        "Identify the requested input.",
        "Substitute the input into the expression.",
        "Simplify step by step."
      ],
      pitfall: "Students sometimes square the coefficient instead of the substituted value."
    },
    build({ examType, difficulty, year }) {
      if (difficulty === "hard") {
        const input = randomInt(2, 5);
        const a = randomInt(2, 4);
        const b = randomInt(1, 5);
        const c = randomInt(1, 4);
        const d = randomInt(1, 6);
        const inner = a * input - b;
        const result = inner ** 2 + c * inner - d;

        return createNumericQuestion(this, {
          examType,
          difficulty,
          year,
          prompt: `If f(x) = ${a}x - ${b} and g(x) = x^2 + ${c}x - ${d}, what is g(f(${input}))?`,
          acceptedAnswers: [String(result)],
          explanationSteps: [
            `First evaluate f(${input}) = ${a}(${input}) - ${b} = ${inner}.`,
            `Then substitute ${inner} into g(x): ${inner}^2 + ${c}(${inner}) - ${d}.`,
            `That simplifies to ${result}.`
          ],
          bestApproach: "Work from the inside function outward"
        });
      }

      const a = randomInt(2, 5);
      const b = randomInt(1, 6);
      const input = randomInt(2, 7);
      const result = a * input - b;

      return createNumericQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `If f(x) = ${a}x - ${b}, what is f(${input})?`,
        acceptedAnswers: [String(result)],
        explanationSteps: [
          `Substitute ${input} for x.`,
          `Compute ${a}(${input}) - ${b} = ${a * input} - ${b}.`,
          `So f(${input}) = ${result}.`
        ],
        bestApproach: "Substitution"
      });
    }
  },
  {
    section: "math",
    type: "exponential",
    label: QUESTION_TYPE_LOOKUP.exponential.label,
    domain: QUESTION_TYPE_LOOKUP.exponential.domain,
    guide: {
      title: "Track the Growth Factor",
      summary: "Exponential problems change by the same multiplier each step, not the same amount.",
      steps: [
        "Identify the starting value.",
        "Find the multiplier for each time step.",
        "Raise the multiplier to the number of steps."
      ],
      pitfall: "Percent increase of 20% means multiply by 1.20, not by 0.20."
    },
    build({ examType, difficulty, year }) {
      if (difficulty === "hard") {
        const start = randomInt(80, 180);
        const rate1 = choice([1.1, 1.15, 1.2]);
        const rate2 = choice([0.85, 0.9, 0.95]);
        const years1 = randomInt(2, 3);
        const years2 = randomInt(1, 2);
        const result = Math.round(start * rate1 ** years1 * rate2 ** years2);
        const increasePercent = Math.round((rate1 - 1) * 100);
        const decreasePercent = Math.round((1 - rate2) * 100);

        return createMultipleChoiceQuestion(this, {
          examType,
          difficulty,
          year,
          prompt: `An investment starts at ${start}. It grows by ${increasePercent}% each year for ${years1} years and then decreases by ${decreasePercent}% each year for ${years2} years. Which value is closest to the final amount?`,
          choices: shuffle([
            { id: "A", text: String(result) },
            { id: "B", text: String(Math.round(start * rate1 ** years1)) },
            { id: "C", text: String(Math.round(start * rate2 ** years2)) },
            { id: "D", text: String(start) }
          ]),
          answerKey: "A",
          acceptedAnswers: ["a"],
          explanationSteps: [
            `Use consecutive multipliers: ${start}(${rate1})^${years1}(${rate2})^${years2}.`,
            "Apply the growth phase first, then the decline phase.",
            `The result is closest to ${result}.`
          ],
          bestApproach: "Chain the multipliers"
        });
      }

      const start = randomInt(40, 120);
      const rate = choice([1.1, 1.2, 1.25, 1.5]);
      const time = randomInt(2, 4);
      const result = Math.round(start * rate ** time);
      const ratePercent = Math.round((rate - 1) * 100);

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `A quantity starts at ${start} and increases by ${ratePercent}% each year. About how much is it after ${time} years?`,
        choices: shuffle([
          { id: "A", text: String(result) },
          { id: "B", text: String(Math.round(start * rate * time)) },
          { id: "C", text: String(start + ratePercent * time) },
          { id: "D", text: String(start) }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          `Convert the percent increase to a growth factor of ${rate}.`,
          `Use the model ${start}(${rate})^${time}.`,
          `That is about ${result}.`
        ],
        bestApproach: "Exponential model"
      });
    }
  },
  {
    section: "math",
    type: "ratio-percent",
    label: QUESTION_TYPE_LOOKUP["ratio-percent"].label,
    domain: QUESTION_TYPE_LOOKUP["ratio-percent"].domain,
    guide: {
      title: "Use Proportions for Percent and Ratio",
      summary: "Translate the words into a part-to-whole comparison before calculating.",
      steps: [
        "Decide what quantity is the whole.",
        "Set up the part over the whole.",
        "Convert to a percent or solve the proportion."
      ],
      pitfall: "A common mistake is reversing the numerator and denominator."
    },
    build({ examType, difficulty, year }) {
      if (difficulty === "hard") {
        const original = randomInt(90, 180);
        const increase = choice([10, 15, 20]);
        const decrease = choice([10, 20, 25]);
        const finalPrice = round(original * (1 + increase / 100) * (1 - decrease / 100), 2);

        return createNumericQuestion(this, {
          examType,
          difficulty,
          year,
          prompt: `A jacket priced at $${original} is marked up by ${increase}% and then discounted by ${decrease}%. What is the final price?`,
          acceptedAnswers: [String(finalPrice), finalPrice.toFixed(2)],
          explanationSteps: [
            `Convert the markup to a multiplier of ${1 + increase / 100}.`,
            `Convert the discount to a multiplier of ${1 - decrease / 100}.`,
            `Multiply ${original} by both multipliers to get $${finalPrice}.`
          ],
          bestApproach: "Use consecutive percent multipliers"
        });
      }

      const original = randomInt(50, 120);
      const decrease = choice([10, 15, 20, 25]);
      const result = original * (1 - decrease / 100);

      return createNumericQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `A backpack originally costs $${original}. After a ${decrease}% discount, what is the sale price?`,
        acceptedAnswers: [String(result), result.toFixed(2)],
        explanationSteps: [
          `Find ${decrease}% of ${original}: ${original} x ${decrease / 100} = ${
            (original * decrease) / 100
          }.`,
          "Subtract the discount from the original price.",
          `The sale price is $${result}.`
        ],
        bestApproach: "Percent decrease"
      });
    }
  },
  {
    section: "math",
    type: "probability",
    label: QUESTION_TYPE_LOOKUP.probability.label,
    domain: QUESTION_TYPE_LOOKUP.probability.domain,
    guide: {
      title: "Count Favorable Outcomes",
      summary: "Probability is favorable outcomes divided by total possible outcomes.",
      steps: [
        "Count all possible outcomes.",
        "Count the outcomes that match the condition.",
        "Reduce the fraction if possible."
      ],
      pitfall: "Do not include impossible or repeated outcomes unless the situation allows them."
    },
    build({ examType, difficulty, year }) {
      const red = randomInt(3, 8);
      const blue = randomInt(3, 8);
      const total = red + blue;

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `A bag contains ${red} red marbles and ${blue} blue marbles. If one marble is chosen at random, what is the probability that it is blue?`,
        choices: shuffle([
          { id: "A", text: `${blue}/${total}` },
          { id: "B", text: `${red}/${total}` },
          { id: "C", text: `${blue}/${red}` },
          { id: "D", text: `${total}/${blue}` }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          `There are ${total} marbles total.`,
          `${blue} outcomes are favorable because those are the blue marbles.`,
          `So the probability is ${blue}/${total}.`
        ],
        bestApproach: "Favorable over total"
      });
    }
  },
  {
    section: "math",
    type: "statistics",
    label: QUESTION_TYPE_LOOKUP.statistics.label,
    domain: QUESTION_TYPE_LOOKUP.statistics.domain,
    guide: {
      title: "Use Mean as Total Divided by Number of Values",
      summary: "When one value changes, the total changes too, so update the sum first.",
      steps: [
        "Find or infer the original total.",
        "Adjust the total for the changed value.",
        "Divide by the number of values."
      ],
      pitfall: "Students often average the change instead of updating the sum."
    },
    build({ examType, difficulty, year }) {
      if (difficulty === "hard") {
        const count = choice([5, 6, 8]);
        const mean = randomInt(12, 20);
        const originalTotal = count * mean;
        const removed = randomInt(6, 14);
        const newMean = round((originalTotal - removed) / (count - 1), 2);

        return createNumericQuestion(this, {
          examType,
          difficulty,
          year,
          prompt: `The mean of ${count} numbers is ${mean}. If one of the numbers, ${removed}, is removed from the set, what is the mean of the remaining numbers?`,
          acceptedAnswers: [String(newMean), newMean.toFixed(1), newMean.toFixed(2)],
          explanationSteps: [
            `The original total is ${count} x ${mean} = ${originalTotal}.`,
            `Removing ${removed} leaves a new total of ${originalTotal - removed}.`,
            `Divide by ${count - 1} to get the new mean, ${newMean}.`
          ],
          bestApproach: "Reconstruct the original total"
        });
      }

      const average = randomInt(8, 18);
      const count = choice([4, 5, 6]);
      const originalTotal = average * count;
      const increase = randomInt(3, 9);
      const newAverage = (originalTotal + increase) / count;

      return createNumericQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `The mean of ${count} numbers is ${average}. If one number is increased by ${increase}, what is the new mean?`,
        acceptedAnswers: [String(newAverage), newAverage.toFixed(1), newAverage.toFixed(2)],
        explanationSteps: [
          `The original total is ${average} x ${count} = ${originalTotal}.`,
          `Increasing one number by ${increase} makes the new total ${originalTotal + increase}.`,
          `Divide by ${count} to get ${newAverage}.`
        ],
        bestApproach: "Rebuild the total"
      });
    }
  },
  {
    section: "math",
    type: "geometry-area",
    label: QUESTION_TYPE_LOOKUP["geometry-area"].label,
    domain: QUESTION_TYPE_LOOKUP["geometry-area"].domain,
    guide: {
      title: "Use the Right Area Formula",
      summary: "Match the figure to its formula before plugging in numbers.",
      steps: [
        "Identify the shape.",
        "Write the relevant formula.",
        "Substitute the given measurements and simplify."
      ],
      pitfall: "Base-times-height is not the same as side-times-side unless the figure is a rectangle."
    },
    build({ examType, difficulty, year }) {
      const base = randomInt(6, 14);
      const height = randomInt(4, 11);
      const area = (base * height) / 2;

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `What is the area of a triangle with base ${base} and height ${height}?`,
        choices: shuffle([
          { id: "A", text: String(area) },
          { id: "B", text: String(base * height) },
          { id: "C", text: String(base + height) },
          { id: "D", text: String((base + height) / 2) }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "Use the triangle area formula A = 1/2bh.",
          `Substitute ${base} for b and ${height} for h.`,
          `A = 1/2(${base})(${height}) = ${area}.`
        ],
        bestApproach: "Triangle formula"
      });
    }
  },
  {
    section: "math",
    type: "circle",
    label: QUESTION_TYPE_LOOKUP.circle.label,
    domain: QUESTION_TYPE_LOOKUP.circle.domain,
    guide: {
      title: "Recognize the Radius Fast",
      summary: "Many circle questions become easy once you identify the radius or diameter.",
      steps: [
        "Match the quantity asked for to the correct formula.",
        "Use the radius if the formula needs it.",
        "Approximate only at the end if necessary."
      ],
      pitfall: "Do not confuse radius with diameter."
    },
    build({ examType, difficulty, year }) {
      const radius = randomInt(3, 9);
      const circumference = 2 * radius;

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `A circle has radius ${radius}. Which expression represents its circumference?`,
        choices: shuffle([
          { id: "A", text: `${circumference}pi` },
          { id: "B", text: `${radius}pi` },
          { id: "C", text: `${radius ** 2}pi` },
          { id: "D", text: `${2 * radius ** 2}pi` }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "Circumference is C = 2pr.",
          `Substitute r = ${radius}.`,
          `C = 2p(${radius}) = ${circumference}p.`
        ],
        bestApproach: "Circumference formula"
      });
    }
  },
  {
    section: "math",
    type: "triangle",
    label: QUESTION_TYPE_LOOKUP.triangle.label,
    domain: QUESTION_TYPE_LOOKUP.triangle.domain,
    guide: {
      title: "Use the Pythagorean Theorem",
      summary: "For right triangles, connect the legs and hypotenuse with a squared relationship.",
      steps: [
        "Identify the hypotenuse.",
        "Write a^2 + b^2 = c^2.",
        "Solve for the missing side."
      ],
      pitfall: "Only the side opposite the right angle is the hypotenuse."
    },
    build({ examType, difficulty, year }) {
      const triples = choice([
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17]
      ]);
      const [a, b, c] = triples;

      return createNumericQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `A right triangle has legs of length ${a} and ${b}. What is the length of the hypotenuse?`,
        acceptedAnswers: [String(c)],
        explanationSteps: [
          "Use the Pythagorean theorem a^2 + b^2 = c^2.",
          `So c^2 = ${a ** 2} + ${b ** 2} = ${c ** 2}.`,
          `Take the square root to get c = ${c}.`
        ],
        bestApproach: "Pythagorean theorem"
      });
    }
  },
  {
    section: "reading",
    type: "central-idea",
    label: QUESTION_TYPE_LOOKUP["central-idea"].label,
    domain: QUESTION_TYPE_LOOKUP["central-idea"].domain,
    guide: {
      title: "Find the Central Idea",
      summary: "Choose the answer that captures the passage as a whole, not just one detail.",
      steps: [
        "Ask what the author is mainly trying to say.",
        "Eliminate answers that are too narrow or too extreme.",
        "Choose the statement that covers the whole passage."
      ],
      pitfall: "A true detail is not always the main idea."
    },
    build({ examType, difficulty, year }) {
      const passage = choice(readingPassages);

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: "Which choice best states the central idea of the passage?",
        passage: passage.text,
        choices: shuffle([
          { id: "A", text: passage.centralIdea },
          {
            id: "B",
            text: "The passage argues that only large infrastructure projects can improve public life."
          },
          { id: "C", text: "The author mainly lists minor facts without taking a position." },
          { id: "D", text: "The passage suggests that researchers should stop revising their assumptions." }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "The correct answer must summarize the whole passage.",
          "Choice A matches the passage's overall claim without adding new ideas.",
          "The other choices are either too narrow, inaccurate, or too extreme."
        ],
        bestApproach: "Whole-passage summary"
      });
    }
  },
  {
    section: "reading",
    type: "inference",
    label: QUESTION_TYPE_LOOKUP.inference.label,
    domain: QUESTION_TYPE_LOOKUP.inference.domain,
    guide: {
      title: "Infer, Do Not Invent",
      summary: "A strong inference is strongly supported by the passage even if it is not stated word for word.",
      steps: [
        "Identify what the passage clearly implies.",
        "Reject answers that go beyond the evidence.",
        "Prefer the modest answer over the dramatic one."
      ],
      pitfall: "Do not pick an answer just because it sounds plausible in real life."
    },
    build({ examType, difficulty, year }) {
      const passage = choice(readingPassages);

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: "Which choice is best supported by the passage?",
        passage: passage.text,
        choices: shuffle([
          { id: "A", text: passage.inference },
          { id: "B", text: "The author believes the project should be canceled immediately." },
          { id: "C", text: "The passage proves that all researchers were wrong." },
          { id: "D", text: "The writer thinks tradition matters more than evidence." }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "An inference should be supported, not imagined.",
          "Choice A follows directly from the passage's details and tone.",
          "The other choices are unsupported or far too absolute."
        ],
        bestApproach: "Supported inference"
      });
    }
  },
  {
    section: "reading",
    type: "command-of-evidence",
    label: QUESTION_TYPE_LOOKUP["command-of-evidence"].label,
    domain: QUESTION_TYPE_LOOKUP["command-of-evidence"].domain,
    guide: {
      title: "Link the Claim to the Line",
      summary: "Pick the sentence that most directly proves the stated idea.",
      steps: [
        "Read the claim carefully.",
        "Look for the line that says or shows that exact idea most directly.",
        "Avoid evidence that is only loosely related."
      ],
      pitfall: "The longest quotation is not automatically the best evidence."
    },
    build({ examType, difficulty, year }) {
      const passage = choice(readingPassages);
      const sentences = passage.text.split(". ").map((sentence) => sentence.replace(/\.$/, ""));

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt:
          "Which quotation from the passage best supports the idea that the effect of the project extended beyond its original goal?",
        passage: passage.text,
        choices: shuffle([
          { id: "A", text: `"${passage.evidence}."` },
          { id: "B", text: `"${sentences[0]}."` },
          { id: "C", text: `"${sentences[1] || sentences[0]}."` },
          { id: "D", text: `"${sentences[sentences.length - 1]}."` }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "The question asks for evidence of a broader-than-expected effect.",
          "Choice A directly states that the result went beyond the original design or expectation.",
          "The other lines may be true, but they do not support the claim as precisely."
        ],
        bestApproach: "Match line to claim"
      });
    }
  },
  {
    section: "reading",
    type: "words-in-context",
    label: QUESTION_TYPE_LOOKUP["words-in-context"].label,
    domain: QUESTION_TYPE_LOOKUP["words-in-context"].domain,
    guide: {
      title: "Use Context, Not Your Favorite Definition",
      summary: "A word's meaning depends on how it is used in the sentence.",
      steps: [
        "Reread the sentence around the word.",
        "Replace the word with each option mentally.",
        "Choose the option that preserves the sentence meaning."
      ],
      pitfall: "The dictionary's first definition may not fit the passage."
    },
    build({ examType, difficulty, year }) {
      const passage = choice(readingPassages);

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: `As used in the passage, "${passage.vocabWord}" most nearly means`,
        passage: passage.text,
        choices: shuffle([
          { id: "A", text: passage.vocabMeaning },
          { id: "B", text: "decorated" },
          { id: "C", text: "hidden" },
          { id: "D", text: "delayed" }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "Use the surrounding sentence to infer meaning.",
          `In context, "${passage.vocabWord}" describes the idea in a practical way, which matches "${passage.vocabMeaning}."`,
          "The other choices do not fit the sentence."
        ],
        bestApproach: "Context substitution"
      });
    }
  },
  {
    section: "reading",
    type: "purpose-tone",
    label: QUESTION_TYPE_LOOKUP["purpose-tone"].label,
    domain: QUESTION_TYPE_LOOKUP["purpose-tone"].domain,
    guide: {
      title: "Track What the Author Is Doing",
      summary: "Purpose asks why the author wrote the passage; tone asks how the author sounds while doing it.",
      steps: [
        "Summarize the author's main move in one verb.",
        "Notice the language: neutral, skeptical, admiring, corrective, or urgent.",
        "Pick the answer that matches both purpose and tone."
      ],
      pitfall: "Do not confuse an informative tone with an enthusiastic one."
    },
    build({ examType, difficulty, year }) {
      const passage = choice(readingPassages);

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: "The author's main purpose is",
        passage: passage.text,
        choices: shuffle([
          { id: "A", text: passage.purpose },
          { id: "B", text: "to mock experts for changing their minds" },
          { id: "C", text: "to insist that no further research is needed" },
          { id: "D", text: "to argue that all local projects fail without technology" }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "The passage explains and interprets a result or idea.",
          `Choice A matches that purpose and the passage's ${passage.tone} tone.`,
          "The other options distort the author's attitude."
        ],
        bestApproach: "Author's move"
      });
    }
  },
  {
    section: "reading",
    type: "paired-passages",
    label: QUESTION_TYPE_LOOKUP["paired-passages"].label,
    domain: QUESTION_TYPE_LOOKUP["paired-passages"].domain,
    guide: {
      title: "Compare Agreement and Difference",
      summary: "Start by asking what both passages would agree on before focusing on how they differ.",
      steps: [
        "Summarize Passage A in a sentence.",
        "Summarize Passage B in a sentence.",
        "Choose the answer that accurately captures the overlap or contrast."
      ],
      pitfall: "A tempting wrong answer often reflects only one passage."
    },
    build({ examType, difficulty, year }) {
      const pair = choice(pairedPassages);

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: "Which statement best describes a relationship between Passage A and Passage B?",
        passage: `Passage A: ${pair.passageA}\n\nPassage B: ${pair.passageB}`,
        choices: shuffle([
          { id: "A", text: pair.sharedPoint },
          { id: "B", text: "Both passages reject the idea discussed in Passage A." },
          { id: "C", text: pair.disagreement.replace("Both", "Neither") },
          { id: "D", text: "Passage B directly disproves the factual claims in Passage A." }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "Look for the strongest point of agreement first.",
          "Choice A captures what both writers share without erasing their differences.",
          "The other answers either exaggerate the conflict or misstate the viewpoints."
        ],
        bestApproach: "Compare and contrast"
      });
    }
  },
  {
    section: "reading",
    type: "data-interpretation",
    label: QUESTION_TYPE_LOOKUP["data-interpretation"].label,
    domain: QUESTION_TYPE_LOOKUP["data-interpretation"].domain,
    guide: {
      title: "Read the Trend Before Reading the Choices",
      summary: "Turn the data into a one-sentence trend statement first.",
      steps: [
        "Identify the largest, smallest, and direction of change.",
        "Summarize the data in plain language.",
        "Choose the option that matches that summary."
      ],
      pitfall: "Avoid reading beyond the data."
    },
    build({ examType, difficulty, year }) {
      const set = choice(dataInterpretationSets);
      const table = set.rows.map(([label, value]) => `${label}: ${value}`).join("\n");

      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: set.prompt,
        passage: `${set.tableTitle}\n${table}`,
        choices: shuffle([
          { id: "A", text: set.correct },
          { id: "B", text: "Every category increased by the same amount." },
          { id: "C", text: "The first listed category had the highest value." },
          { id: "D", text: "The data prove a long-term national trend." }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "Read what the numbers literally show before interpreting them.",
          "Choice A describes the pattern accurately without overclaiming.",
          "The other choices add claims the table does not support."
        ],
        bestApproach: "Data summary"
      });
    }
  },
  {
    section: "writing",
    type: "subject-verb",
    label: QUESTION_TYPE_LOOKUP["subject-verb"].label,
    domain: QUESTION_TYPE_LOOKUP["subject-verb"].domain,
    guide: {
      title: "Match the Verb to the Subject",
      summary: "Ignore interrupting phrases and find the true subject first.",
      steps: [
        "Locate the core subject.",
        "Ignore prepositional phrases or parenthetical details.",
        "Choose the verb form that matches the subject number."
      ],
      pitfall: "Words near the verb can distract you from the actual subject."
    },
    build({ examType, difficulty, year }) {
      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt:
          "The collection of student essays _____ on a shelf in the writing center.",
        choices: shuffle([
          { id: "A", text: "sits" },
          { id: "B", text: "sit" },
          { id: "C", text: "were sitting" },
          { id: "D", text: "have sit" }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          'The subject is "collection," which is singular.',
          'A singular subject takes the singular verb "sits."',
          "So choice A is correct."
        ],
        bestApproach: "Core subject first"
      });
    }
  },
  {
    section: "writing",
    type: "punctuation-comma",
    label: QUESTION_TYPE_LOOKUP["punctuation-comma"].label,
    domain: QUESTION_TYPE_LOOKUP["punctuation-comma"].domain,
    guide: {
      title: "Use Commas with Introductory Elements and Nonessential Details",
      summary: "Ask whether the phrase sets up the sentence or merely adds extra information.",
      steps: [
        "Find the main clause.",
        "Check whether the opening phrase needs a comma after it.",
        "Keep commas away from essential subject-verb pairs."
      ],
      pitfall: "A comma should not split a sentence's subject from its verb."
    },
    build({ examType, difficulty, year }) {
      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt:
          "After reviewing the survey results, the committee decided to revise its outreach plan. Which choice uses punctuation most effectively?",
        choices: shuffle([
          {
            id: "A",
            text: "After reviewing the survey results, the committee decided to revise its outreach plan."
          },
          {
            id: "B",
            text: "After reviewing the survey results the committee, decided to revise its outreach plan."
          },
          {
            id: "C",
            text: "After reviewing the survey results the committee decided, to revise its outreach plan."
          },
          {
            id: "D",
            text: "After reviewing the survey results, the committee, decided to revise its outreach plan."
          }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "The introductory phrase should be followed by a comma.",
          "No comma should separate the subject from the verb.",
          "Choice A is correctly punctuated."
        ],
        bestApproach: "Intro phrase comma"
      });
    }
  },
  {
    section: "writing",
    type: "punctuation-semicolon",
    label: QUESTION_TYPE_LOOKUP["punctuation-semicolon"].label,
    domain: QUESTION_TYPE_LOOKUP["punctuation-semicolon"].domain,
    guide: {
      title: "Use Semicolons Between Independent Clauses",
      summary: "A semicolon can join two complete sentences that are closely related.",
      steps: [
        "Check whether both sides are complete sentences.",
        "Use a semicolon only if they are.",
        "Avoid pairing a semicolon with a coordinating conjunction."
      ],
      pitfall: "A semicolon cannot connect a sentence to a fragment."
    },
    build({ examType, difficulty, year }) {
      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt:
          "The robotics team finished the prototype early _____ they used the extra time to improve the sensor array.",
        choices: shuffle([
          { id: "A", text: "; and" },
          { id: "B", text: ";" },
          { id: "C", text: "," },
          { id: "D", text: ":" }
        ]),
        answerKey: "B",
        acceptedAnswers: ["b"],
        explanationSteps: [
          "Both halves are independent clauses.",
          "A semicolon can join them without a conjunction.",
          "Choice B is the cleanest and grammatically correct answer."
        ],
        bestApproach: "Independent clause check"
      });
    }
  },
  {
    section: "writing",
    type: "transitions",
    label: QUESTION_TYPE_LOOKUP.transitions.label,
    domain: QUESTION_TYPE_LOOKUP.transitions.domain,
    guide: {
      title: "Choose the Transition That Matches the Logic",
      summary: "Look at the relationship between the two sentences: addition, contrast, cause, or example.",
      steps: [
        "Name the logical relationship first.",
        "Compare only transitions with that meaning.",
        "Read the sentence again to confirm the flow."
      ],
      pitfall: "A familiar transition can still be wrong if it signals the wrong relationship."
    },
    build({ examType, difficulty, year }) {
      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt:
          "The first design saved money. _____ it was less durable than the revised model.",
        choices: shuffle([
          { id: "A", text: "However," },
          { id: "B", text: "For example," },
          { id: "C", text: "Similarly," },
          { id: "D", text: "As a result," }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          "The second sentence contrasts with the first one.",
          '"However" signals contrast.',
          "So choice A fits the logic best."
        ],
        bestApproach: "Name the relationship"
      });
    }
  },
  {
    section: "writing",
    type: "sentence-placement",
    label: QUESTION_TYPE_LOOKUP["sentence-placement"].label,
    domain: QUESTION_TYPE_LOOKUP["sentence-placement"].domain,
    guide: {
      title: "Place the Sentence Where the Logic Needs It",
      summary: "Use pronouns, repeated ideas, and chronology to find the best location.",
      steps: [
        "Read the paragraph for the sequence of ideas.",
        "Look for references that need an antecedent.",
        "Insert the sentence where it connects most naturally."
      ],
      pitfall: "Do not place a sentence before the idea it refers to."
    },
    build({ examType, difficulty, year }) {
      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt:
          "A student is revising the paragraph below. Where should the sentence 'This change made the exhibit easier for visitors to navigate.' be placed?",
        passage:
          "(1) The museum originally arranged its maps in a single crowded case near the entrance. (2) Curators later spread the maps across three stations organized by era. (3) Visitors could compare styles more easily and move through the gallery without forming a line. (4) Attendance during weekend tours rose after the redesign.",
        choices: shuffle([
          { id: "A", text: "After sentence 2" },
          { id: "B", text: "Before sentence 1" },
          { id: "C", text: "After sentence 4" },
          { id: "D", text: "Before sentence 2" }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          'The sentence begins with "This change," so it should come right after the change is described.',
          "Sentence 2 explains the redesign.",
          "Therefore the new sentence belongs after sentence 2."
        ],
        bestApproach: "Trace the reference"
      });
    }
  },
  {
    section: "writing",
    type: "concision",
    label: QUESTION_TYPE_LOOKUP.concision.label,
    domain: QUESTION_TYPE_LOOKUP.concision.domain,
    guide: {
      title: "Say It Once, Clearly",
      summary: "The best SAT writing answer is often the shortest one that preserves the meaning.",
      steps: [
        "Remove repeated ideas.",
        "Prefer direct wording over inflated phrasing.",
        "Keep only the information the sentence needs."
      ],
      pitfall: "Do not cut essential meaning just to make a sentence shorter."
    },
    build({ examType, difficulty, year }) {
      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt: "Which choice most effectively combines clarity and concision?",
        passage:
          "The team reached a unanimous agreement that the mural should be moved to a new location.",
        choices: shuffle([
          { id: "A", text: "The team unanimously agreed that the mural should be moved." },
          {
            id: "B",
            text: "The team reached an agreement in a unanimous manner that the mural should be moved to a new location."
          },
          {
            id: "C",
            text: "The team had an agreement, and it was unanimous, that the mural should move to another different location."
          },
          {
            id: "D",
            text: "The mural, according to the unanimous agreement reached by the team, should possibly be moved."
          }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          'Choice A keeps the meaning while removing redundancy from "reached a unanimous agreement."',
          "The other options are wordier or less precise.",
          "So A is the clearest and most concise revision."
        ],
        bestApproach: "Cut redundancy"
      });
    }
  },
  {
    section: "writing",
    type: "pronoun-clarity",
    label: QUESTION_TYPE_LOOKUP["pronoun-clarity"].label,
    domain: QUESTION_TYPE_LOOKUP["pronoun-clarity"].domain,
    guide: {
      title: "Make the Pronoun's Antecedent Obvious",
      summary: "If a pronoun could refer to more than one noun, replace it with a noun.",
      steps: [
        "Find the pronoun.",
        "Ask what noun it clearly refers to.",
        "Revise if the reference is ambiguous."
      ],
      pitfall: "When two nouns of the same type appear nearby, a pronoun often becomes unclear."
    },
    build({ examType, difficulty, year }) {
      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt:
          "Museum staff met with the artists before they opened the gallery. Which revision most clearly avoids ambiguity?",
        choices: shuffle([
          {
            id: "A",
            text: "Museum staff met with the artists before the staff opened the gallery."
          },
          { id: "B", text: "Museum staff met with the artists before opening it." },
          { id: "C", text: "Museum staff met with the artists before they did so." },
          { id: "D", text: "Museum staff met with the artists before they opened it." }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          'In the original sentence, "they" could refer to either staff or artists.',
          "Choice A replaces the ambiguous pronoun with a clear noun.",
          "That makes A the best revision."
        ],
        bestApproach: "Replace the unclear pronoun"
      });
    }
  },
  {
    section: "writing",
    type: "verb-tense",
    label: QUESTION_TYPE_LOOKUP["verb-tense"].label,
    domain: QUESTION_TYPE_LOOKUP["verb-tense"].domain,
    guide: {
      title: "Match Tense to the Timeline",
      summary: "The verb tense should fit the time relationship in the sentence or paragraph.",
      steps: [
        "Find the sentence's time frame.",
        "Notice whether one action happened before another.",
        "Choose the tense that matches that order."
      ],
      pitfall: "Do not switch tense without a reason."
    },
    build({ examType, difficulty, year }) {
      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt:
          "By the time the lecture began, the guest speaker _____ copies of her new article to the students.",
        choices: shuffle([
          { id: "A", text: "had distributed" },
          { id: "B", text: "distributes" },
          { id: "C", text: "will distribute" },
          { id: "D", text: "is distributing" }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          '"By the time" signals that one action happened before another past action.',
          'Past perfect, "had distributed," shows that earlier past action correctly.',
          "So A is correct."
        ],
        bestApproach: "Timeline first"
      });
    }
  },
  {
    section: "writing",
    type: "parallel-structure",
    label: QUESTION_TYPE_LOOKUP["parallel-structure"].label,
    domain: QUESTION_TYPE_LOOKUP["parallel-structure"].domain,
    guide: {
      title: "Keep Series Grammatically Parallel",
      summary: "Items in a list or comparison should have the same grammatical form.",
      steps: [
        "Identify the list or paired structure.",
        "Check the grammatical form of each item.",
        "Revise so the forms match."
      ],
      pitfall: "Mixing verbs, nouns, and clauses in one series creates awkwardness."
    },
    build({ examType, difficulty, year }) {
      return createMultipleChoiceQuestion(this, {
        examType,
        difficulty,
        year,
        prompt:
          "The internship taught Maya how to analyze data, present her findings, and _____ with community partners.",
        choices: shuffle([
          { id: "A", text: "collaborate" },
          { id: "B", text: "collaboration" },
          { id: "C", text: "she collaborated" },
          { id: "D", text: "for collaboration" }
        ]),
        answerKey: "A",
        acceptedAnswers: ["a"],
        explanationSteps: [
          'The sentence lists three skills after "how to": analyze, present, and collaborate.',
          "Choice A matches the verb form of the earlier items.",
          "That makes the series parallel."
        ],
        bestApproach: "Match the form"
      });
    }
  }
];

const templateLookup = templates.reduce((lookup, template) => {
  lookup[template.type] = template;
  return lookup;
}, {});

function cloneQuestion(question) {
  return {
    ...JSON.parse(JSON.stringify(question)),
    id: createId("q")
  };
}

function buildQuestionBank() {
  const examTypes = ["SAT", "PSAT"];
  const difficulties = ["easy", "medium", "hard"];
  const variantsPerDifficulty = 12;
  const bank = [];

  examTypes.forEach((examType) => {
    templates.forEach((template) => {
      difficulties.forEach((difficulty) => {
        for (let index = 0; index < variantsPerDifficulty; index += 1) {
          bank.push(
            template.build({
              examType,
              difficulty,
              year: choice(TEST_YEARS)
            })
          );
        }
      });
    });
  });

  return bank;
}

const QUESTION_BANK = buildQuestionBank();

export function getQuestionTemplates(filters = {}) {
  return templates.filter((template) => {
    if (filters.section && template.section !== filters.section) {
      return false;
    }

    if (filters.type && template.type !== filters.type) {
      return false;
    }

    return true;
  });
}

export function getQuestionBank(filters = {}) {
  return QUESTION_BANK.filter((question) => {
    if (filters.examType && question.examType !== filters.examType) {
      return false;
    }

    if (filters.section && question.section !== filters.section) {
      return false;
    }

    if (filters.type && question.type !== filters.type) {
      return false;
    }

    if (filters.difficulty && question.difficulty !== filters.difficulty) {
      return false;
    }

    return true;
  });
}

export function getQuestionBankStats() {
  return {
    total: QUESTION_BANK.length,
    bySection: {
      math: QUESTION_BANK.filter((question) => question.section === "math").length,
      reading: QUESTION_BANK.filter((question) => question.section === "reading").length,
      writing: QUESTION_BANK.filter((question) => question.section === "writing").length
    }
  };
}

export function generateLocalQuestion({
  examType = "SAT",
  section,
  type,
  difficulty = "medium",
  year = choice(TEST_YEARS)
} = {}) {
  const exactBankMatches = getQuestionBank({ examType, section, type, difficulty });
  const sectionBankMatches = getQuestionBank({ examType, section, difficulty });
  const examBankMatches = getQuestionBank({ examType, difficulty });
  const fallbackPool = exactBankMatches.length
    ? exactBankMatches
    : sectionBankMatches.length
      ? sectionBankMatches
      : examBankMatches.length
        ? examBankMatches
        : QUESTION_BANK;

  return {
    ...cloneQuestion(choice(fallbackPool)),
    year,
    sourceLabel: `Original Summit Prep practice set (${year})`
  };
}

export function buildLearnGuides() {
  return templates.map((template) => {
    const example = template.build({
      examType: "SAT",
      difficulty: "medium",
      year: 2025
    });

    return {
      section: template.section,
      type: template.type,
      label: template.label,
      domain: template.domain,
      ...template.guide,
      example: {
        prompt: example.prompt,
        passage: example.passage || "",
        answerFormat: example.answerFormat,
        choices: example.choices || [],
        explanationSteps: example.explanationSteps
      }
    };
  });
}

export function getTemplateByType(type) {
  return templateLookup[type];
}
