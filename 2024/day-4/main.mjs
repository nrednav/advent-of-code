import fs from "node:fs";

class WordSearchPuzzle {
  constructor({ input }) {
    this.input = input;
    this.rows = input.trim().split("\n");
    this.stride = this.rows[0].length;

    console.log({
      rowCount: this.rows.length,
      stride: this.stride,
    });
  }

  countOccurrences(word) {
    const reversedWord = word.split("").reverse().join("");

    const horizontalOccurrences = this.countHorizontalOccurrences(
      word,
      reversedWord,
    );
    const verticalOccurrences = this.countVerticalOccurrences(
      word,
      reversedWord,
    );
    const diagonalOccurrences = this.countDiagonalOccurrences(
      word,
      reversedWord,
    );

    console.log({
      horizontal: horizontalOccurrences,
      vertical: verticalOccurrences,
      diagonal: diagonalOccurrences,
    });

    return horizontalOccurrences + verticalOccurrences + diagonalOccurrences;
  }

  countHorizontalOccurrences(word, reversedWord) {
    let occurrences = 0;

    for (const row of this.rows) {
      if (row.includes(word)) {
        occurrences += row.match(new RegExp(word, "g")).length;
      }

      if (row.includes(reversedWord)) {
        occurrences += row.match(new RegExp(reversedWord, "g")).length;
      }
    }

    return occurrences;
  }

  countVerticalOccurrences(word, reversedWord) {
    const characters = this.rows.join("");

    const columns = [];

    for (let col = 0; col < this.stride; col++) {
      let column = "";

      for (let row = 0; row < this.rows.length; row++) {
        column += characters[row * this.stride + col];
      }

      columns.push(column);
    }

    let occurrences = 0;

    for (const column of columns) {
      if (column.includes(word)) {
        occurrences += column.match(new RegExp(word, "g")).length;
      }

      if (column.includes(reversedWord)) {
        occurrences += column.match(new RegExp(reversedWord, "g")).length;
      }
    }

    return occurrences;
  }

  countDiagonalOccurrences(word, reversedWord) {
    const characters = this.rows.join("");

    let occurrences = 0;

    const diagonalsSeen = {
      right: [],
      left: [],
    };

    for (let i = 0; i < this.stride * this.rows.length; i++) {
      const character = characters[i];
      const col = i % this.stride;

      let searchLeftDiagonal = true;
      let searchRightDiagonal = true;

      if (col < word.length - 1) {
        searchLeftDiagonal = false;
      }

      if (col > this.stride - word.length) {
        searchRightDiagonal = false;
      }

      const row = Math.floor(i / this.stride);

      if (row > this.rows.length - word.length) {
        continue;
      }

      if (searchLeftDiagonal) {
        let diagonalCharacter;
        let currentCharacterIndex = i;
        let diagonalCharacters = [
          { character: character, index: currentCharacterIndex },
        ];

        do {
          diagonalCharacter = this.getDiagonalCharacter(
            "left",
            currentCharacterIndex,
            characters,
          );

          if (diagonalCharacter.character) {
            diagonalCharacters.push(diagonalCharacter);
            currentCharacterIndex = diagonalCharacter.index;
          }
        } while (
          this.getDiagonalCharacter("left", currentCharacterIndex, characters)
            .character &&
          this.getDiagonalCharacterIndex("left", currentCharacterIndex) %
            this.stride <
            currentCharacterIndex % this.stride
        );

        const leftDiagonalCharacters = diagonalCharacters
          .map((x) => x.character)
          .join("");
        const leftDiagonalIndices = diagonalCharacters
          .map((x) => x.index)
          .join(",");

        const isUniqueDiagonal = !diagonalsSeen.left.some(
          (diagonal) =>
            diagonal.indices === leftDiagonalIndices ||
            (diagonal.indices.length > leftDiagonalIndices.length &&
              diagonal.indices.endsWith(leftDiagonalIndices)),
        );

        if (isUniqueDiagonal) {
          diagonalsSeen.left.push({
            characters: leftDiagonalCharacters,
            indices: leftDiagonalIndices,
          });
        }
      }

      if (searchRightDiagonal) {
        let diagonalCharacter;
        let currentCharacterIndex = i;
        let diagonalCharacters = [
          { character: character, index: currentCharacterIndex },
        ];

        do {
          diagonalCharacter = this.getDiagonalCharacter(
            "right",
            currentCharacterIndex,
            characters,
          );

          if (diagonalCharacter.character) {
            diagonalCharacters.push(diagonalCharacter);
            currentCharacterIndex = diagonalCharacter.index;
          }
        } while (
          this.getDiagonalCharacter("right", currentCharacterIndex, characters)
            .character &&
          this.getDiagonalCharacterIndex("right", currentCharacterIndex) %
            this.stride >
            currentCharacterIndex % this.stride
        );

        const rightDiagonalCharacters = diagonalCharacters
          .map((x) => x.character)
          .join("");
        const rightDiagonalIndices = diagonalCharacters
          .map((x) => x.index)
          .join(",");

        const isUniqueDiagonal = !diagonalsSeen.right.some(
          (diagonal) =>
            diagonal.indices === rightDiagonalIndices ||
            (diagonal.indices.length > rightDiagonalIndices.length &&
              diagonal.indices.endsWith(rightDiagonalIndices)),
        );

        if (isUniqueDiagonal) {
          diagonalsSeen.right.push({
            characters: rightDiagonalCharacters,
            indices: rightDiagonalIndices,
          });
        }
      }
    }

    for (const diagonal of diagonalsSeen.left.concat(diagonalsSeen.right)) {
      if (diagonal.characters.includes(word)) {
        occurrences += diagonal.characters.match(new RegExp(word, "g")).length;
      }

      if (diagonal.characters.includes(reversedWord)) {
        occurrences += diagonal.characters.match(
          new RegExp(reversedWord, "g"),
        ).length;
      }
    }

    this.plotDiagonals("left", diagonalsSeen);
    console.log("----");
    this.plotDiagonals("right", diagonalsSeen);

    return occurrences;
  }

  plotDiagonals(direction, diagonalsSeen) {
    const grid = Array.from(
      {
        length: this.rows.length,
      },
      () => new Array(this.rows.length).fill("."),
    );

    for (const diagonal of diagonalsSeen[direction]) {
      const indices = diagonal.indices.split(",");

      for (const index of indices) {
        const col = index % this.stride;
        const row = Math.floor(index / this.stride);

        grid[row][col] = "o";
      }
    }

    for (const row of grid) {
      console.log(row.join(""));
    }
  }

  getDiagonalCharacterIndex(direction, currentIndex) {
    if (direction === "left") {
      return currentIndex + this.stride - 1;
    }

    if (direction === "right") {
      return currentIndex + this.stride + 1;
    }
  }

  getDiagonalCharacter(direction, index, characters) {
    if (direction === "left") {
      const diagonalIndex = index + this.stride - 1;

      return {
        character: characters[diagonalIndex],
        index: diagonalIndex,
      };
    }

    if (direction === "right") {
      const diagonalIndex = index + this.stride + 1;

      return {
        character: characters[diagonalIndex],
        index: diagonalIndex,
      };
    }
  }
}

const main = async () => {
  const input = fs.readFileSync("input.txt", "utf-8");
  // const input = `MMMSXXMASM\nMSAMXMSMSA\nAMXSXMAAMM\nMSAMASMSMX\nXMASAMXAMM\nXXAMMXXAMA\nSMSMSASXSS\nSAXAMASAAA\nMAMMMXMMMM\nMXMXAXMASX`;

  const wordSearchPuzzle = new WordSearchPuzzle({ input });

  const occurrences = wordSearchPuzzle.countOccurrences("XMAS");

  console.log(occurrences);
};

main();
