import fs from "node:fs";
import readline from "readline";

const main = async () => {
  const readStream = fs.createReadStream("input.txt", "utf-8");

  const lines = readline.createInterface({
    input: readStream,
  });

  const listA = [];
  const listB = [];

  for await (const line of lines) {
    const [id1, id2] = line
      .replace("   ", " ")
      .split(" ")
      .map((x) => Number(x));

    listA.push(id1);
    listB.push(id2);
  }

  listA.sort((a, b) => a - b);
  listB.sort((a, b) => a - b);

  let sum = 0;

  for (let i = 0; i < listA.length; i++) {
    const difference = Math.abs(listA[i] - listB[i]);

    sum += difference;
  }

  console.log(sum);
};

main();
