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
    this.obstaclePositions = this.findObstaclePositions();

    this.obstaclesSeen = [];
    this.obstacleCandidates = new Set();

    // console.log({
    //   map: this.map.map((row) => row.join("")).join("\n"),
    //   startingPosition: this.currentPosition,
    //   direction: this.direction,
    // });
  }

  findObstaclePositions() {
    const obstaclePositions = new Set();

    for (let row = 0; row < this.map.length; row++) {
      for (let col = 0; col < this.map[row].length; col++) {
        const cell = this.map[row][col];

        if (cell === "#") {
          const position = { row, col };

          obstaclePositions.add(Object.values(position).join(","));
        }
      }
    }

    return obstaclePositions;
  }

  isPositionInlineWithObstacle({ position, currentDirection }) {
    let currentPosition = position;
    let cell = this.map[currentPosition.row][currentPosition.col];

    do {
      const nextPosition = this.getNextPosition({
        currentPosition,
        direction: this.getNextDirection({ currentDirection }),
      });

      if (
        nextPosition.row >= this.map.length ||
        nextPosition.col >= this.map.length ||
        nextPosition.row < 0 ||
        nextPosition.col < 0
      ) {
        break;
      }

      cell = this.map[nextPosition.row][nextPosition.col];

      if (cell === "#") {
        return true;
      }

      currentPosition = nextPosition;
    } while (cell !== "#" || cell !== undefined);

    return false;
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

      this.obstaclePositions.add(Object.values(nextPosition).join(","));
      this.obstaclesSeen.push(nextPosition);
    } else {
      this.currentPosition = nextPosition;

      const positionIsInlineWithObstacle = this.isPositionInlineWithObstacle({
        position: this.currentPosition,
        currentDirection: this.direction,
        obstaclePositions: this.obstaclePositions,
      });

      console.log(this.currentPosition, positionIsInlineWithObstacle);

      if (this.obstaclesSeen.length >= 3) {
        const thirdLastObstacle =
          this.obstaclesSeen[this.obstaclesSeen.length - 3];
        const secondLastObstacle =
          this.obstaclesSeen[this.obstaclesSeen.length - 2];
        const lastObstacle = this.obstaclesSeen[this.obstaclesSeen.length - 1];

        const candidateObstaclePosition = this.getNextPosition({
          currentPosition: this.currentPosition,
          direction: this.direction,
        });

        const gradientA =
          Math.abs(thirdLastObstacle.row - secondLastObstacle.row) /
          Math.abs(thirdLastObstacle.col - secondLastObstacle.col);
        const gradientB =
          Math.abs(lastObstacle.row - candidateObstaclePosition.row) /
          Math.abs(lastObstacle.col - candidateObstaclePosition.col);

        console.log({ gradientA, gradientB });

        if (gradientA === gradientB && positionIsInlineWithObstacle) {
          this.obstacleCandidates.add(candidateObstaclePosition);
        }
      }

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
      obstacleCandidates: this.obstacleCandidates,
      obstaclesSeen: this.obstaclesSeen,
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

  console.log(route);
};

main();
