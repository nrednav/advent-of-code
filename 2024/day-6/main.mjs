import fs from "node:fs";

class Guard {
  constructor({ input }) {
    this.map = input
      .trim()
      .split("\n")
      .map((row) => row.split(""));
    this.direction = "^";
    this.currentPosition = this.findStartingPosition();
    this.positionsVisited = new Set();
    this.positionsVisited.add(Object.values(this.currentPosition).join(","));
    this.allPositionsVisited = [
      this.serializePosition({
        position: this.currentPosition,
        direction: this.direction,
      }),
    ];

    // console.log({
    //   map: this.map.map((row) => row.join("")).join("\n"),
    //   startingPosition: this.currentPosition,
    //   direction: this.direction,
    // });
  }

  move() {
    const nextPosition = this.getNextPosition({
      currentPosition: this.currentPosition,
      direction: this.direction,
    });

    if (this.map[nextPosition.row][nextPosition.col] === "#") {
      this.direction = this.getNextDirection({
        currentDirection: this.direction,
      });
    } else {
      this.currentPosition = nextPosition;
      this.positionsVisited.add(Object.values(this.currentPosition).join(","));
      this.allPositionsVisited.push(
        this.serializePosition({
          position: this.currentPosition,
          direction: this.direction,
        }),
      );
      this.map[this.currentPosition.row][this.currentPosition.col] = "x";
    }
  }

  findObstructionCandidates() {
    const obstructionCandidates = new Set();

    for (const positionVisited of this.allPositionsVisited) {
      const [serializedCurrentPosition, currentDirection] =
        positionVisited.split("|");

      const currentPosition = this.deserializePosition(
        serializedCurrentPosition,
      );

      const nextPosition = this.getNextPosition({
        currentPosition: currentPosition,
        direction: currentDirection,
      });

      const nextDirection = this.getNextDirection({
        currentDirection: currentDirection,
      });

      const nextAdjacentPosition = this.getNextPosition({
        currentPosition: nextPosition,
        direction: nextDirection,
      });

      const nextPositionSeenBefore = this.positionsVisited.has(
        Object.values(nextPosition).join(","),
      );

      const nextAdjacentPositionSeenBefore = this.positionsVisited.has(
        Object.values(nextAdjacentPosition).join(","),
      );

      console.log({
        currentPosition,
        currentDirection,
        nextPosition,
        nextDirection,
        nextAdjacentPosition,
        nextPositionSeenBefore,
        nextAdjacentPositionSeenBefore,
      });
    }

    return obstructionCandidates;
  }

  serializePosition({ position, direction }) {
    return Object.values(position).join(",").concat(`|${direction}`);
  }

  deserializePosition(serializedPosition) {
    const [row, col] = serializedPosition.split(",").map((x) => Number(x));

    return { row, col };
  }

  traceRoute() {
    let nextPosition = this.getNextPosition({
      currentPosition: this.currentPosition,
      direction: this.direction,
    });

    do {
      this.move();

      nextPosition = this.getNextPosition({
        currentPosition: this.currentPosition,
        direction: this.direction,
      });
    } while (
      nextPosition.row < this.map.length &&
      nextPosition.col < this.map.length
    );

    return {
      positionsVisited: this.positionsVisited,
      map: this.map.map((row) => row.join("")).join("\n"),
      allPositionsVisited: this.allPositionsVisited,
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

  getNextPosition({ currentPosition, direction }) {
    if (direction === "^") {
      return {
        row: currentPosition.row - 1,
        col: currentPosition.col,
      };
    }

    if (direction === "v") {
      return {
        row: currentPosition.row + 1,
        col: currentPosition.col,
      };
    }

    if (direction === ">") {
      return {
        row: currentPosition.row,
        col: currentPosition.col + 1,
      };
    }

    if (direction === "<") {
      return {
        row: currentPosition.row,
        col: currentPosition.col - 1,
      };
    }

    return undefined;
  }

  getNextDirection({ currentDirection }) {
    const nextDirectionMap = {
      "^": ">",
      ">": "v",
      v: "<",
      "<": "^",
    };

    return nextDirectionMap[currentDirection];
  }
}

const main = () => {
  const inputFilePath = process.argv[2];
  const input = fs.readFileSync(inputFilePath, "utf-8");

  const guard = new Guard({ input });

  // Part 1
  // const route = guard.traceRoute({ collectObstructionCandidates: false });
  //
  // console.log(route.map);
  // console.log(Array.from(route.positionsVisited).length);

  // Part 2
  const route = guard.traceRoute();

  const obstructionCandidates = guard.findObstructionCandidates();

  console.log(route);
  console.log(obstructionCandidates);
};

main();
