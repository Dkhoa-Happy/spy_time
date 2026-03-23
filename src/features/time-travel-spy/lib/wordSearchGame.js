const DIRECTIONS = [
  { id: "E", dr: 0, dc: 1 },
  { id: "W", dr: 0, dc: -1 },
  { id: "S", dr: 1, dc: 0 },
  { id: "N", dr: -1, dc: 0 },
  { id: "SE", dr: 1, dc: 1 },
  { id: "NW", dr: -1, dc: -1 },
  { id: "SW", dr: 1, dc: -1 },
  { id: "NE", dr: -1, dc: 1 },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const normalizeToken = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

const randomInt = (max) => Math.floor(Math.random() * max);

const randomLetter = () => ALPHABET[randomInt(ALPHABET.length)];

const shuffle = (list) => {
  const clone = [...list];

  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }

  return clone;
};

const createGrid = (size, initial = null) =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => initial),
  );

const createMask = (size, initial = false) =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => initial),
  );

const inBounds = (size, row, col) =>
  row >= 0 && row < size && col >= 0 && col < size;

const getLineCells = (startRow, startCol, direction, length) =>
  Array.from({ length }, (_, index) => ({
    row: startRow + direction.dr * index,
    col: startCol + direction.dc * index,
  }));

const canPlaceWord = (grid, word, row, col, direction) => {
  const size = grid.length;

  for (let i = 0; i < word.length; i += 1) {
    const nextRow = row + direction.dr * i;
    const nextCol = col + direction.dc * i;

    if (!inBounds(size, nextRow, nextCol)) {
      return false;
    }

    const current = grid[nextRow][nextCol];
    if (current !== null && current !== word[i]) {
      return false;
    }
  }

  return true;
};

const placeWord = (grid, occupancyCount, word, row, col, direction) => {
  const cells = getLineCells(row, col, direction, word.length);

  cells.forEach((cell, index) => {
    grid[cell.row][cell.col] = word[index];
    occupancyCount[cell.row][cell.col] += 1;
  });

  return cells;
};

const removeWord = (grid, occupancyCount, word, cells) => {
  cells.forEach((cell, index) => {
    occupancyCount[cell.row][cell.col] -= 1;

    if (occupancyCount[cell.row][cell.col] === 0) {
      grid[cell.row][cell.col] = null;
    } else {
      grid[cell.row][cell.col] = word[index];
    }
  });
};

const countWordCells = (occupancyCount) => {
  let total = 0;

  for (let row = 0; row < occupancyCount.length; row += 1) {
    for (let col = 0; col < occupancyCount.length; col += 1) {
      if (occupancyCount[row][col] > 0) {
        total += 1;
      }
    }
  }

  return total;
};

const createWordCandidates = (grid, word, allowedDirections) => {
  const size = grid.length;
  const candidates = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      allowedDirections.forEach((direction) => {
        if (canPlaceWord(grid, word, row, col, direction)) {
          candidates.push({ row, col, direction });
        }
      });
    }
  }

  return candidates;
};

const buildWordMask = (size, placements) => {
  const mask = createMask(size, false);

  placements.forEach((placement) => {
    placement.cells.forEach((cell) => {
      mask[cell.row][cell.col] = true;
    });
  });

  return mask;
};

const readRowMajor = (grid, mask, readMarked) => {
  const chars = [];

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid.length; col += 1) {
      if (Boolean(mask[row][col]) === Boolean(readMarked)) {
        chars.push(grid[row][col]);
      }
    }
  }

  return chars.join("");
};

export const selectionToCells = (start, end) => {
  const dRow = end.row - start.row;
  const dCol = end.col - start.col;

  const stepRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
  const stepCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);

  const isStraight =
    dRow === 0 || dCol === 0 || Math.abs(dRow) === Math.abs(dCol);
  if (!isStraight) {
    return [];
  }

  const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
  return Array.from({ length: steps + 1 }, (_, index) => ({
    row: start.row + stepRow * index,
    col: start.col + stepCol * index,
  }));
};

const sameCell = (a, b) => a.row === b.row && a.col === b.col;

const isSamePath = (cellsA, cellsB) => {
  if (cellsA.length !== cellsB.length) {
    return false;
  }

  const forward = cellsA.every((cell, i) => sameCell(cell, cellsB[i]));
  if (forward) {
    return true;
  }

  return cellsA.every((cell, i) =>
    sameCell(cell, cellsB[cellsB.length - 1 - i]),
  );
};

export const resolveSelection = (placements, selectedCells) =>
  placements.find((placement) => isSamePath(selectedCells, placement.cells)) ??
  null;

export const generateWordSearchGrid = (
  gridSize,
  wordList,
  secretMessage,
  options = {},
) => {
  const size = Number(gridSize);

  if (!Number.isInteger(size) || size < 3) {
    throw new Error("gridSize must be an integer >= 3.");
  }

  const normalizedWords = [
    ...new Set(wordList.map(normalizeToken).filter(Boolean)),
  ].sort((a, b) => b.length - a.length);

  if (normalizedWords.length === 0) {
    throw new Error("wordList must contain at least one valid word.");
  }

  const normalizedSecret = normalizeToken(secretMessage);
  if (!normalizedSecret) {
    throw new Error(
      "secretMessage must contain at least one alphanumeric character.",
    );
  }

  normalizedWords.forEach((word) => {
    if (word.length > size) {
      throw new Error(`Word '${word}' cannot fit in a ${size}x${size} grid.`);
    }
  });

  const totalCells = size * size;
  if (normalizedSecret.length > totalCells) {
    throw new Error("secretMessage is longer than total grid capacity.");
  }

  const allowedDirectionIds = Array.isArray(options.allowedDirections)
    ? options.allowedDirections
    : DIRECTIONS.map((direction) => direction.id);
  const allowedDirections = DIRECTIONS.filter((direction) =>
    allowedDirectionIds.includes(direction.id),
  );

  if (allowedDirections.length === 0) {
    throw new Error("No valid direction provided in allowedDirections.");
  }

  const maxGenerationAttempts = Number(options.maxGenerationAttempts ?? 300);
  const exactSecretFit = options.exactSecretFit ?? true;
  const fillRandomTail = options.fillRandomTail ?? true;

  let solvedGrid = null;
  let solvedPlacements = null;
  let solvedOccupancy = null;

  for (let attempt = 0; attempt < maxGenerationAttempts; attempt += 1) {
    const grid = createGrid(size, null);
    const occupancyCount = createGrid(size, 0);
    const placements = [];

    const backtrack = (index) => {
      if (index === normalizedWords.length) {
        const wordCells = countWordCells(occupancyCount);
        const remaining = totalCells - wordCells;

        if (remaining < normalizedSecret.length) {
          return false;
        }

        if (exactSecretFit && remaining !== normalizedSecret.length) {
          return false;
        }

        return true;
      }

      const word = normalizedWords[index];
      const candidates = shuffle(
        createWordCandidates(grid, word, allowedDirections),
      );

      for (let i = 0; i < candidates.length; i += 1) {
        const candidate = candidates[i];
        const cells = placeWord(
          grid,
          occupancyCount,
          word,
          candidate.row,
          candidate.col,
          candidate.direction,
        );

        placements.push({
          id: `${word}-${index}`,
          word,
          direction: candidate.direction.id,
          start: { row: candidate.row, col: candidate.col },
          end: {
            row: cells[cells.length - 1].row,
            col: cells[cells.length - 1].col,
          },
          cells,
        });

        if (backtrack(index + 1)) {
          return true;
        }

        placements.pop();
        removeWord(grid, occupancyCount, word, cells);
      }

      return false;
    };

    if (!backtrack(0)) {
      continue;
    }

    solvedGrid = grid;
    solvedPlacements = placements;
    solvedOccupancy = occupancyCount;
    break;
  }

  if (!solvedGrid || !solvedPlacements || !solvedOccupancy) {
    throw new Error(
      "Cannot generate a valid puzzle with current constraints. Try larger gridSize or fewer words.",
    );
  }

  const residualMask = createMask(size, false);
  const secretMask = createMask(size, false);
  let secretIndex = 0;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (solvedOccupancy[row][col] > 0) {
        continue;
      }

      residualMask[row][col] = true;

      if (secretIndex < normalizedSecret.length) {
        solvedGrid[row][col] = normalizedSecret[secretIndex];
        secretMask[row][col] = true;
        secretIndex += 1;
      } else if (fillRandomTail) {
        solvedGrid[row][col] = randomLetter();
      } else {
        throw new Error(
          "There are extra residual cells after secret placement. Enable fillRandomTail or use exactSecretFit.",
        );
      }
    }
  }

  const wordMask = buildWordMask(size, solvedPlacements);
  const residualRead = readRowMajor(solvedGrid, wordMask, false);

  return {
    gridSize: size,
    grid: solvedGrid,
    words: normalizedWords,
    placements: solvedPlacements,
    wordMask,
    residualMask,
    secretMask,
    secretMessage: normalizedSecret,
    residualRead,
    hasExactResidualMessage: residualRead === normalizedSecret,
    meta: {
      totalCells,
      wordCells: countWordCells(solvedOccupancy),
      residualCells: residualRead.length,
      generationAttempts: maxGenerationAttempts,
      exactSecretFit,
      fillRandomTail,
    },
  };
};

export const createGameState = (puzzle) => ({
  foundWordIds: new Set(),
  markedMask: createMask(puzzle.gridSize, false),
});

export const applyFoundWord = (state, placement) => {
  const nextFound = new Set(state.foundWordIds);
  nextFound.add(placement.id);

  const nextMask = state.markedMask.map((row) => [...row]);
  placement.cells.forEach((cell) => {
    nextMask[cell.row][cell.col] = true;
  });

  return {
    foundWordIds: nextFound,
    markedMask: nextMask,
  };
};

export const extractUnmarkedMessage = (grid, markedMask) =>
  readRowMajor(grid, markedMask, false);

export const isPuzzleSolved = (puzzle, state) =>
  state.foundWordIds.size === puzzle.placements.length;
