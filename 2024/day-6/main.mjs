import fs from "node:fs";

class Obstacle {
  constructor({ position, nextObstacle = null }) {
    this.position = position;
    this.nextObstacle = nextObstacle;
  }

  getNextObstacle() {
    return this.nextObstacle;
  }

  setNextObstacle(obstacle) {
    this.nextObstacle = obstacle;
  }

  getPosition() {
    return this.position;
  }

  positionEquals(position) {
    if (!this.position || !position) {
      return false;
    }

    return (
      this.position.row === position.row && this.position.col === position.col
    );
  }
}

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
    this.candidateObstacles = new Set();

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

  getPerpendicularObstacle({ currentPosition, currentDirection }) {
    console.log("getPerpendicularObstacle -- start");

    const currentCell = this.map[currentPosition.row][currentPosition.col];

    if (currentCell === "#") {
      return null;
    }

    const perpendicularDirection = this.getNextDirection({ currentDirection });

    console.log({ perpendicularDirection });

    let perpendicularObstacle = null;

    for (let i = 0; i < this.map.length; i++) {
      const nextPosition = this.getNextPosition({
        currentPosition,
        direction: perpendicularDirection,
      });

      if (
        nextPosition.row >= this.map.length ||
        nextPosition.col >= this.map.length ||
        nextPosition.row < 0 ||
        nextPosition.col < 0
      ) {
        break;
      }

      const nextCell = this.map[nextPosition.row][nextPosition.col];

      if (nextCell === "#") {
        perpendicularObstacle =
          this.obstaclesSeen.find((obstacle) =>
            obstacle.positionEquals(nextPosition),
          ) ?? new Obstacle({ position: nextPosition });
        break;
      }

      currentPosition = nextPosition;
    }

    console.log("getPerpendicularObstacle -- finish");

    return perpendicularObstacle;
  }

  // isPositionInlineWithObstacle({ position, currentDirection }) {
  //   let currentPosition = position;
  //   let cell = this.map[currentPosition.row][currentPosition.col];
  //
  //   do {
  //     const nextPosition = this.getNextPosition({
  //       currentPosition,
  //       direction: this.getNextDirection({ currentDirection }),
  //     });
  //
  //     if (
  //       nextPosition.row >= this.map.length ||
  //       nextPosition.col >= this.map.length ||
  //       nextPosition.row < 0 ||
  //       nextPosition.col < 0
  //     ) {
  //       break;
  //     }
  //
  //     cell = this.map[nextPosition.row][nextPosition.col];
  //
  //     if (
  //       cell === "#" &&
  //       this.obstaclesSeen.some((obstacle) =>
  //         obstacle.positionEquals(nextPosition),
  //       )
  //     ) {
  //       return { result: true, inlineObstacle: new Obstacle(nextPosition) };
  //     }
  //
  //     currentPosition = nextPosition;
  //   } while (cell !== "#" || cell !== undefined);
  //
  //   return { result: false };
  // }

  move() {
    const nextPosition = this.getNextPosition({
      currentPosition: this.currentPosition,
      direction: this.direction,
    });

    const nextCell = this.map[nextPosition.row][nextPosition.col];

    if (nextCell === "#") {
      // Turn 90 degrees clockwise
      this.direction = this.getNextDirection({
        currentDirection: this.direction,
      });

      // Record having seen the obstacle
      const obstacle = new Obstacle({ position: nextPosition });

      const previousObstacle =
        this.obstaclesSeen[this.obstaclesSeen.length - 1];

      if (previousObstacle) {
        previousObstacle.setNextObstacle(obstacle);
      }

      this.obstaclesSeen.push(obstacle);
    } else {
      const previousPosition = this.currentPosition;

      // Move to next cell
      this.currentPosition = nextPosition;

      // Check if next position is a candidate for placing an obstacle to loop
      const perpendicularObstacle = this.getPerpendicularObstacle({
        currentPosition: previousPosition,
        currentDirection: this.direction,
      });

      console.log({
        previousPosition,
        nextPosition,
        currentPosition: this.currentPosition,
        perpendicularObstacle,
      });

      if (perpendicularObstacle && perpendicularObstacle.getNextObstacle()) {
        const candidateObstacle = new Obstacle({
          position: this.currentPosition,
          nextObstacle: perpendicularObstacle,
        });

        this.candidateObstacles.add(
          this.serializePosition({ position: candidateObstacle.getPosition() }),
        );

        this.map[candidateObstacle.getPosition().row][
          candidateObstacle.getPosition().col
        ] = "o";
      } else {
        this.map[this.currentPosition.row][this.currentPosition.col] = "x";
      }

      this.positionsVisited.add(Object.values(this.currentPosition).join(","));

      this.allPositionsVisited.push(
        this.serializePosition({
          position: this.currentPosition,
          direction: this.direction,
        }),
      );
    }
  }

  // if (this.map[nextPosition.row][nextPosition.col] === "#") {
  //   this.direction = this.getNextDirection({
  //     currentDirection: this.direction,
  //   });
  //
  //   const obstacle = new Obstacle({ position: nextPosition });
  //
  //   const prevObstacle = this.obstaclesSeen[this.obstaclesSeen.length - 1];
  //
  //   if (prevObstacle) {
  //     prevObstacle.setNextObstacle(obstacle);
  //   }
  //
  //   this.obstaclesSeen.push(obstacle);
  //
  //   console.log({ obstaclesSeen: this.obstaclesSeen });
  //
  //   this.obstaclePositions.add(Object.values(nextPosition).join(","));
  //   // this.obstaclesSeen.push(nextPosition);
  // } else {
  //   this.currentPosition = nextPosition;
  //
  //   const positionIsInlineWithObstacle = this.isPositionInlineWithObstacle({
  //     position: this.currentPosition,
  //     currentDirection: this.direction,
  //     obstaclePositions: this.obstaclePositions,
  //   });
  //
  //   if (
  //     this.obstaclesSeen.length >= 3 &&
  //     positionIsInlineWithObstacle.result
  //   ) {
  //     const thirdLastObstacle =
  //       this.obstaclesSeen[this.obstaclesSeen.length - 3];
  //     const secondLastObstacle =
  //       this.obstaclesSeen[this.obstaclesSeen.length - 2];
  //     const lastObstacle = this.obstaclesSeen[this.obstaclesSeen.length - 1];
  //
  //     // const candidateObstaclePosition = this.getNextPosition({
  //     //   currentPosition: this.currentPosition,
  //     //   direction: this.direction,
  //     // });
  //
  //     if (positionIsInlineWithObstacle.result) {
  //       const nextObstacle = this.obstaclesSeen.find((obstacle) => {
  //         const nextObstacleSeen = this.obstaclePositions.some(
  //           (obstaclePosition) => {
  //             const displacementType =
  //               this.direction === "^" || this.direction === "v"
  //                 ? "vertical"
  //                 : "horizontal";
  //
  //             if (displacementType === "vertical") {
  //               return (
  //                 Math.abs(
  //                   positionIsInlineWithObstacle.inlineObstacle.getPosition()
  //                     .col - obstaclePosition.col,
  //                 ) === 1 &&
  //                 obstaclePosition.row >
  //                   positionIsInlineWithObstacle.inlineObstacle.row
  //               );
  //             } else {
  //               return (
  //                 Math.abs(
  //                   positionIsInlineWithObstacle.inlineObstacle.getPosition()
  //                     .row - obstaclePosition.row,
  //                 ) === 1 &&
  //                 obstaclePosition.col >
  //                   positionIsInlineWithObstacle.inlineObstacle.col
  //               );
  //             }
  //           },
  //         );
  //
  //         return nextObstacleSeen;
  //       });
  //
  //       if (nextObstacle) {
  //         positionIsInlineWithObstacle.inlineObstacle.setNextObstacle(
  //           secondLastObstacle,
  //         );
  //       }
  //
  //       if (
  //         Math.abs(
  //           positionIsInlineWithObstacle.inlineObstacle.getPosition().row -
  //             secondLastObstacle.getPosition().row,
  //         ) === 1 ||
  //         Math.abs(
  //           positionIsInlineWithObstacle.inlineObstacle.getPosition().col -
  //             secondLastObstacle.getPosition().col,
  //         ) === 1
  //       ) {
  //         positionIsInlineWithObstacle.inlineObstacle.setNextObstacle(
  //           secondLastObstacle,
  //         );
  //       }
  //     }
  //
  //     const candidateObstacle = new Obstacle(
  //       this.getNextPosition({
  //         currentPosition: this.currentPosition,
  //         direction: this.direction,
  //       }),
  //     );
  //
  //     candidateObstacle.setNextObstacle(
  //       positionIsInlineWithObstacle.inlineObstacle,
  //     );
  //
  //     if (
  //       this.obstaclePositions.has(
  //         Object.values(candidateObstacle.getPosition()).join(","),
  //       ) ||
  //       candidateObstacle.getPosition().row >= this.map.length ||
  //       candidateObstacle.getPosition().col >= this.map.length
  //     ) {
  //       return;
  //     }
  //
  //     console.log({
  //       thirdLastObstacle,
  //       secondLastObstacle,
  //       lastObstacle,
  //       candidateObstacle,
  //       inlineObstacle: positionIsInlineWithObstacle.inlineObstacle,
  //     });
  //
  //     const displacementType =
  //       this.direction === "^" || this.direction === "v"
  //         ? "vertical"
  //         : "horizontal";
  //
  //     const displacementA =
  //       displacementType === "vertical"
  //         ? Math.abs(
  //             secondLastObstacle.getPosition().row -
  //               positionIsInlineWithObstacle.inlineObstacle.getPosition().row,
  //           )
  //         : Math.abs(
  //             secondLastObstacle.getPosition().col -
  //               positionIsInlineWithObstacle.inlineObstacle.getPosition().col,
  //           );
  //
  //     const displacementB =
  //       displacementType === "vertical"
  //         ? Math.abs(
  //             candidateObstacle.getPosition().row -
  //               lastObstacle.getPosition().row,
  //           )
  //         : Math.abs(
  //             candidateObstacle.getPosition().col -
  //               lastObstacle.getPosition().col,
  //           );
  //
  //     console.log({
  //       displacementType,
  //       displacementA,
  //       displacementB,
  //     });
  //
  //     // if (gradientA === gradientB && positionIsInlineWithObstacle.result) {
  //     if (
  //       positionIsInlineWithObstacle.result &&
  //       displacementA === displacementB &&
  //       this.obstaclesSeen.some((obstacle) =>
  //         obstacle.positionEquals(
  //           positionIsInlineWithObstacle.inlineObstacle
  //             .getNextObstacle()
  //             ?.getPosition(),
  //         ),
  //       )
  //       // this.obstaclesSeen.some(
  //       //   (obstacle) =>
  //       //     obstacle.getPosition().row ===
  //       //       positionIsInlineWithObstacle.inlineObstaclePosition.row &&
  //       //     obstacle.getPosition().col ===
  //       //       positionIsInlineWithObstacle.inlineObstaclePosition.col,
  //       // )
  //     ) {
  //       this.obstacleCandidates.add(candidateObstacle);
  //       console.log("added");
  //     } else {
  //       console.log("rejected");
  //     }
  //   }
  //
  //   this.positionsVisited.add(Object.values(this.currentPosition).join(","));
  //   this.allPositionsVisited.push(
  //     this.serializePosition({
  //       position: this.currentPosition,
  //       direction: this.direction,
  //     }),
  //   );
  //   this.map[this.currentPosition.row][this.currentPosition.col] = "x";
  // }

  serializePosition({ position, direction }) {
    const serializedPosition = Object.values(position).join(",");

    if (direction) {
      return serializedPosition.concat(`|${direction}`);
    }

    return serializedPosition;
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
      candidateObstacles: Array.from(this.candidateObstacles),
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
  console.log(route.map);
  console.log(route.candidateObstacles.length);
};

main();
