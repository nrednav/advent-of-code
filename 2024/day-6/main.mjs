import fs from "node:fs";

class Guard {
  constructor({ input }) {
    this.map = input
      .trim()
      .split("\n")
      .map((row) => row.split(""));
    this.currentPosition = this.findStartingPosition();
    this.positionsVisited = new Set();
    this.positionsVisited.add(Object.values(this.currentPosition).join(","));
    this.direction = "^";

    console.log({
      map: this.map.map((row) => row.join("")).join("\n"),
      startingPosition: this.currentPosition,
      direction: this.direction,
    });
  }

  move() {
    const nextPosition = this.getNextPosition();

    if (this.map[nextPosition.row][nextPosition.col] === "#") {
      this.direction = this.getNextDirection();
    } else {
      this.currentPosition = nextPosition;
      this.positionsVisited.add(Object.values(this.currentPosition).join(","));
      this.map[this.currentPosition.row][this.currentPosition.col] = "x";
    }
  }

  traceRoute() {
    let nextPosition = this.getNextPosition();

    do {
      this.move();

      nextPosition = this.getNextPosition();
    } while (
      nextPosition.row < this.map.length &&
      nextPosition.col < this.map.length
    );

    return {
      distinctPositionsVisited: Array.from(this.positionsVisited).length,
      map: this.map.map((row) => row.join("")).join("\n"),
    };
  }

  findStartingPosition() {
    for (let row = 0; row < this.map.length; row++) {
      for (let col = 0; col < this.map[row].length; col++) {
        const position = this.map[row][col];

        if (position === "^") {
          return { row, col };
        }
      }
    }
  }

  getNextPosition() {
    if (this.direction === "^") {
      return {
        row: this.currentPosition.row - 1,
        col: this.currentPosition.col,
      };
    }

    if (this.direction === "v") {
      return {
        row: this.currentPosition.row + 1,
        col: this.currentPosition.col,
      };
    }

    if (this.direction === ">") {
      return {
        row: this.currentPosition.row,
        col: this.currentPosition.col + 1,
      };
    }

    if (this.direction === "<") {
      return {
        row: this.currentPosition.row,
        col: this.currentPosition.col - 1,
      };
    }

    return undefined;
  }

  getNextDirection() {
    const nextDirectionMap = {
      "^": ">",
      ">": "v",
      v: "<",
      "<": "^",
    };

    return nextDirectionMap[this.direction];
  }
}

const main = () => {
  const inputFilePath = process.argv[2];
  const input = fs.readFileSync(inputFilePath, "utf-8");

  const guard = new Guard({ input });

  const route = guard.traceRoute();

  console.log(route.map);
  console.log(route.distinctPositionsVisited);
};

main();
