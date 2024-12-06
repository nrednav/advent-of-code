import fs from "node:fs";

class WordSearchPuzzle {
  constructor({ input }) {
    this.input = input;
    this.rows = input.trim().split("\n");
    this.matrix = this.rows.map((row) => row.split(""));

    console.log(this.matrix);
  }

  search() {
    let occurrences = 0;

    let indices = [];

    for (let row = 0; row < this.matrix.length - 2; row++) {
      console.log("row", row, this.matrix[row].join(""));

      for (let col = 0; col < this.matrix[row].length - 2; col++) {
        console.log("col", col + 1, this.matrix[row][col]);

        const character = this.matrix[row][col];
        const thirdCharacter = this.matrix[row][col + 2];
        const fifthCharacter = this.matrix[row + 1][col + 1];
        const seventhCharacter = this.matrix[row + 2][col];
        const ninthCharacter = this.matrix[row + 2][col + 2];

        if (character === "M" && thirdCharacter === "S") {
          if (
            fifthCharacter === "A" &&
            seventhCharacter === "M" &&
            ninthCharacter === "S"
          ) {
            indices.push({ row: row + 1, col: col + 1 });
            occurrences++;
          }
        }

        if (character === "S" && thirdCharacter === "M") {
          if (
            fifthCharacter === "A" &&
            seventhCharacter === "S" &&
            ninthCharacter === "M"
          ) {
            indices.push({ row: row + 1, col: col + 1 });
            occurrences++;
          }
        }

        if (character === "S" && thirdCharacter === "S") {
          if (
            fifthCharacter === "A" &&
            seventhCharacter === "M" &&
            ninthCharacter === "M"
          ) {
            indices.push({ row: row + 1, col: col + 1 });
            occurrences++;
          }
        }

        if (character === "M" && thirdCharacter === "M") {
          if (
            fifthCharacter === "A" &&
            seventhCharacter === "S" &&
            ninthCharacter === "S"
          ) {
            indices.push({ row: row + 1, col: col + 1 });
            occurrences++;
          }
        }
      }
    }

    console.log(occurrences);
    console.log(indices);
  }
}

const main = async () => {
  const input = fs.readFileSync("input.txt", "utf-8");
  // const input = `MMMSXXMASM\nMSAMXMSMSA\nAMXSXMAAMM\nMSAMASMSMX\nXMASAMXAMM\nXXAMMXXAMA\nSMSMSASXSS\nSAXAMASAAA\nMAMMMXMMMM\nMXMXAXMASX`;

  const wordSearchPuzzle = new WordSearchPuzzle({ input });

  wordSearchPuzzle.search();
};

main();
