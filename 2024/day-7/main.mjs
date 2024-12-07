import fs from "node:fs";

const main = () => {
  const input = fs.readFileSync(process.argv[2], "utf-8");
  const equations = input.trim().split("\n");
  const parsedEquations = parseEquations(equations);
  const validEquations = getValidEquations(parsedEquations);
  const totalCalibrationResult = validEquations.reduce(
    (sum, equation) => sum + equation.target,
    0,
  );

  console.log(totalCalibrationResult);
};

const parseEquations = (equations) => {
  return equations.map((equation) => {
    const [target, operandsString] = equation
      .split(":")
      .map((part) => part.trim());

    const operands = operandsString
      .split(" ")
      .map((operand) => Number(operand));

    return { target: Number(target), operands: operands };
  });
};

const getOperationPermutations = ({ base, length }) => {
  const operationPermutations = [];

  for (let i = 0; i < base ** length; i++) {
    const binary = i.toString(base).padStart(length, "0");

    // Part 1
    // const permutation = binary
    //   .split("")
    //   .map((character) => (character === "0" ? "+" : "*"));

    // Part 2
    const permutation = binary.split("").map((character) => {
      if (character === "0") {
        return "+";
      } else if (character === "1") {
        return "*";
      } else if (character === "2") {
        return "||";
      }
    });

    operationPermutations.push(permutation);
  }

  return operationPermutations;
};

const getValidEquations = (parsedEquations) => {
  const validEquations = parsedEquations.filter((parsedEquation) => {
    // Part 1
    // const operationPermutations = getOperationPermutations({
    //   base: 2,
    //   length: parsedEquation.operands.length - 1,
    // });

    // Part 2
    const operationPermutations = getOperationPermutations({
      base: 3,
      length: parsedEquation.operands.length - 1,
    });

    const results = [];

    for (const operationPermutation of operationPermutations) {
      const result = evaluateEquation({
        operands: parsedEquation.operands,
        operations: operationPermutation,
      });

      results.push(result);
    }

    return results.some((result) => result === parsedEquation.target);
  });

  return validEquations;
};

const evaluateEquation = ({ operands, operations }) => {
  const operandsStack = [...operands];
  const operationsStack = [...operations];

  let result = null;

  do {
    if (result === null) {
      const operation = operationsStack.shift();

      if (operation === "*") {
        result = operandsStack.shift() * operandsStack.shift();
      } else if (operation === "+") {
        result = operandsStack.shift() + operandsStack.shift();
      } else if (operation === "||") {
        result = Number(
          String(operandsStack.shift()) + String(operandsStack.shift()),
        );
      }
    } else {
      const operation = operationsStack.shift();

      if (operation === "*") {
        result = result * operandsStack.shift();
      } else if (operation === "+") {
        result = result + operandsStack.shift();
      } else if (operation === "||") {
        result = Number(String(result) + String(operandsStack.shift()));
      }
    }
  } while (operationsStack.length > 0);

  return result;
};

main();
