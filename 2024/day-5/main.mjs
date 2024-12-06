import fs from "node:fs";

const main = async () => {
  const inputFilePath = process.argv[2];
  const inputFile = fs.readFileSync(inputFilePath, "utf-8");

  const [pageOrderingRules, updates] = inputFile.split("\n\n");

  const pageOrderingMap = mapPageOrderingRules(pageOrderingRules);

  // Part 1
  //
  // const { correctlyOrderedUpdates } = getCorrectlyOrderedUpdates(
  //   updates.split("\n").filter(Boolean),
  //   pageOrderingMap,
  // );
  //
  // const result = correctlyOrderedUpdates.reduce((acc, update) => {
  //   const pages = update.split(",");
  //   const middlePage = Number(pages[Math.floor(pages.length / 2)]);
  //
  //   return acc + middlePage;
  // }, 0);

  // Part 2
  const { incorrectlyOrderedUpdates } = getCorrectlyOrderedUpdates(
    updates.split("\n").filter(Boolean),
    pageOrderingMap,
  );

  const fixedUpdates = fixIncorrectlyOrderedUpdates(
    incorrectlyOrderedUpdates,
    pageOrderingMap,
  );

  const result = fixedUpdates.reduce((acc, update) => {
    const pages = update.split(",");
    const middlePage = Number(pages[Math.floor(pages.length / 2)]);

    return acc + middlePage;
  }, 0);

  console.log(result);
};

const mapPageOrderingRules = (pageOrderingRules) => {
  const map = new Map();
  const rules = pageOrderingRules.split("\n");

  for (const rule of rules) {
    const [page, succeedingPage] = rule.split("|");

    if (map.has(page) && Array.isArray(map.get(page))) {
      const succeedingPages = map.get(page);

      succeedingPages.push(succeedingPage);

      map.set(page, succeedingPages);
    } else {
      map.set(page, [succeedingPage]);
    }
  }

  return map;
};

const getCorrectlyOrderedUpdates = (updates, pageOrderingMap) => {
  const correctlyOrderedUpdates = [];
  const incorrectlyOrderedUpdates = [];

  for (const update of updates) {
    const pages = update.split(",");

    let isCorrectlyOrdered = true;

    for (let page = 0; page < pages.length; page++) {
      const currentPage = pages[page];
      const precedingPages = pages.slice(0, page);
      const expectedSucceedingPages = pageOrderingMap.has(currentPage)
        ? pageOrderingMap.get(currentPage)
        : [];

      for (const expectedSucceedingPage of expectedSucceedingPages) {
        if (precedingPages.includes(expectedSucceedingPage)) {
          isCorrectlyOrdered = false;
        }
      }
    }

    if (isCorrectlyOrdered) {
      correctlyOrderedUpdates.push(update);
    } else {
      incorrectlyOrderedUpdates.push(update);
    }
  }

  return { correctlyOrderedUpdates, incorrectlyOrderedUpdates };
};

const fixIncorrectlyOrderedUpdates = (
  incorrectlyOrderedUpdates,
  pageOrderingMap,
) => {
  const fixedUpdates = [];

  for (const incorrectlyOrderedUpdate of incorrectlyOrderedUpdates) {
    const pages = incorrectlyOrderedUpdate.split(",");

    const correctlyOrderedPages = [];
    const incorrectlyOrderedPages = [];

    for (let page = 0; page < pages.length; page++) {
      const currentPage = pages[page];
      const precedingPages = pages.slice(0, page);
      const expectedSucceedingPages = pageOrderingMap.has(currentPage)
        ? pageOrderingMap.get(currentPage)
        : [];

      const pageIsCorrectlyOrdered =
        precedingPages.filter((precedingPage) =>
          expectedSucceedingPages.includes(precedingPage),
        ).length === 0;

      if (pageIsCorrectlyOrdered) {
        correctlyOrderedPages.push(currentPage);
      } else {
        incorrectlyOrderedPages.push(currentPage);
      }
    }

    const fixedUpdate = incorrectlyOrderedPages.reduce(
      (acc, incorrectlyOrderedPage) => {
        const slot = acc.findLastIndex((correctlyOrderedPage) => {
          const expectedSucceedingPages = pageOrderingMap.has(
            correctlyOrderedPage,
          )
            ? pageOrderingMap.get(correctlyOrderedPage)
            : [];

          return expectedSucceedingPages.includes(incorrectlyOrderedPage);
        });

        if (slot >= 0) {
          return acc.toSpliced(slot + 1, 0, incorrectlyOrderedPage);
        } else {
          const fallbackSlot = acc.findIndex((correctlyOrderedPage) => {
            const expectedSucceedingPages = pageOrderingMap.has(
              incorrectlyOrderedPage,
            )
              ? pageOrderingMap.get(incorrectlyOrderedPage)
              : [];

            return expectedSucceedingPages.includes(correctlyOrderedPage);
          });

          if (fallbackSlot >= 0) {
            return acc.toSpliced(fallbackSlot, 0, incorrectlyOrderedPage);
          } else {
            return acc.concat(incorrectlyOrderedPage);
          }
        }
      },
      correctlyOrderedPages,
    );

    fixedUpdates.push(fixedUpdate.join(","));
  }

  return fixedUpdates;
};

main();
