// simple hash function for generating consistent values
const simpleHash = (str) => {
  let hash = 0, i, chr;
  if (str.length === 0) return hash.toString();
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    // A commonly used hash variant: hash = (hash << 5) - hash + chr;
    // (hash * 31 + chr) or other small primes also work well.
    hash = ((hash << 5) - hash) + chr;
    // Convert to 32-bit integer:
    hash |= 0;
  }
  return Math.abs(hash).toString();
}

// coords are a combination of row (horizontal line from the top), col (vertical line from the left)
// for the player and target, here are some corner options for starting positions
const coordOptions = [
	[
		// top right
		[0, 4], [0, 5], [0, 6],
		[1, 4], [1, 5], [1, 6],
	],
	[
		// top left
		[0, 0], [0, 1], [0, 2],
		[1, 0], [1, 1], [1, 2],
	],
	[
		// bottom left
		[5, 0], [5, 1], [5, 2],
		[6, 0], [6, 1], [6, 2],
	],
	[
		// bottom right
		[5, 4], [5, 5], [5, 6],
		[6, 4], [6, 5], [6, 6],
	]
]

const getPlayerCoord = (index) => {
	const corner = index % 4;
	const coord = coordOptions[corner][index % 6];
	return coord;
}

const getEnemyCoord = (index) => {
	const corner = (index + 2) % 4; // opposite player coord
	const coord = coordOptions[corner][(index * 7) % 6]
	return coord;
}

const lettersPerPool = 3
const availableConsonants = [
	'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm',
	'n', 'p', 'r', 's', 't', 'w',
]
const getLetterPools = (index) => {
	// pull 8 letters to use from the above pool.
	const letterIndexes =
		[
			(index * 1), (index * 2), (index - 3), // up
			(index + 2), (index * 3), (index + 3), // down
			(index + 3), (index * 4), (index - 3), // left
			(index + 4), (index + 1), (index + 3), // right
		]

	const remainingConsonants = [...availableConsonants];
	const letters = letterIndexes.map(index => {
		const validIndex = index % remainingConsonants.length;
		const [letter] = remainingConsonants.splice(validIndex, 1);
		return letter;
	})

	const letterPools = Object.groupBy(letters, (_, index) => Math.floor(index / lettersPerPool))
	return letterPools
}

const getNewCoordWithLetter = (index, currentCoord, letter) => {
	const letterPools = getLetterPools(index);

	const curRow = currentCoord[0];
	const curCol = currentCoord[1];
	if (letterPools[0].includes(letter)) {
		// if this is up, go up one row
		const newRow = Math.max(curRow - 1, 0);
		return [newRow, curCol];
	}
	if (letterPools[1].includes(letter)) {
		// if this is down, go down one row
		const newRow = Math.min(curRow + 1, 6);
		return [newRow, curCol];
	}
	if (letterPools[2].includes(letter)) {
		// if this is left, go one col down
		const newCol = Math.max(curCol - 1, 0);
		return [curRow, newCol];
	}
	if (letterPools[3].includes(letter)) {
		// if this is right, go one col up
		const newCol = Math.min(curCol + 1, 6);
		return [curRow, newCol];
	}
}

const getNewCoordsWithWords = (index, startingCoord, words) => {
	// for each letter, determine what coords need to be highlighted
	const nextCoords = [];
	let currentCoord = [...startingCoord];
	words.split('').forEach((letter) => {
		const nextCoord = getNewCoordWithLetter(index, currentCoord, letter);
		if (nextCoord) {
			nextCoords.push(nextCoord);
			currentCoord = [...nextCoord];
		}
	});

	return nextCoords;
}

const getFinalCoordWithWord = (index, startingCoord, words) => {
	return getNewCoordsWithWords(index, startingCoord, words).at(-1)
}

const getDiffBetweenCoords = (coordA, coordB) => {
	const xDiff = Math.abs(coordA[0] - coordB[0]);
	const yDiff = Math.abs(coordA[1] - coordB[1]);

	return xDiff + yDiff;
}

const generateWords = (words, index) => {
	const pc = getPlayerCoord(index);
	const ec = getEnemyCoord(index);

	// determine number of spaces needed to move up / down, left / right
	const initialDiff = getDiffBetweenCoords(pc, ec);

	console.log({initialDiff})

	// search word list for valid words that will eventually get us
	// to the target word. we do this in two passes (expecting two words)
	const firstOptions = Object.groupBy(words, (word) => {
		// determine the new location
		const newCoord = getFinalCoordWithWord(index, pc, word);
		if (newCoord === undefined) {
			return initialDiff;
		}
		const newDiff = getDiffBetweenCoords(newCoord, ec);

		return newDiff;
	});

	// filter out any options that are worse than current distance
	const betterOptions = Object.fromEntries(
		Object.entries(firstOptions).filter(([distance, values]) => {
			return parseInt(distance) < 6
		})
	);

	const firstPassWordOptions = Object.values(betterOptions).flatMap((options => options))

	// do a second pass with the closest words
	const secondOptions = firstPassWordOptions.map((initialWord) => {
		// determine the starting location just for this first word
		const initialWordDestination = getFinalCoordWithWord(index, pc, initialWord);
		const initialWordDiff = getDiffBetweenCoords(initialWordDestination, ec);

		const secondWordResults = Object.groupBy(words, (word) => {
			// determine the new location
			const newCoord = getFinalCoordWithWord(index, initialWordDestination, word);
			if (newCoord === undefined) {
				return initialWordDiff;
			}
			const newDiff = getDiffBetweenCoords(newCoord, ec);

			return newDiff;
		});

		const successfulSecondWordResults = secondWordResults?.[0] || [];

		return successfulSecondWordResults.map(secondWord => `${initialWord} ${secondWord}`)
	});

	const realSecondOptions = secondOptions.filter(optionList => optionList.length > 0)

	console.log(realSecondOptions);
}
