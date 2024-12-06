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

  let sum = 0;

  for (const id of listA) {
    const occurrences = listB.filter((value) => value === id).length;
    const similarity = id * occurrences;

    sum += similarity;
  }

  console.log(sum);
};

main();
