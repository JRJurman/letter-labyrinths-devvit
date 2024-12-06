// coords reference a point up and to the left of the resolving square
// they are a combination of x (vertical line from the right), y (horizontal line from the top)
const playerCoordOptions = [
	[4, 5], // 0
	[2, 5], // 1
	[1, 1], // 2
	[5, 1], // 3
	[4, 5], // 4
	[2, 5], // 5
	[1, 1], // 6
	[5, 1], // 7
	[5, 5], // 8
	[1, 5], // 9
	[2, 1], // 10
	[4, 1], // 11
	[5, 5], // 12
	[1, 5], // 13
	[2, 1], // 14
	[4, 1], // 15
]

const enemyCoordOptions = [
	[1, 1], // 0
	[4, 1], // 1
	[4, 4], // 2
	[1, 4], // 3
	[2, 1], // 4
	[5, 1], // 5
	[5, 4], // 6
	[2, 4], // 7
	[1, 2], // 8
	[4, 2], // 9
	[4, 5], // 10
	[1, 5], // 11
	[2, 2], // 12
	[5, 2], // 13
	[5, 5], // 14
	[2, 5], // 15
]

const getPlayerCoord = (index) => {
	const validIndex = index % 16
	return playerCoordOptions[validIndex];
}

const getEnemyCoord = (index) => {
	const validIndex = index % 16
	return enemyCoordOptions[validIndex];
}

const lettersPerPool = 3
const availableConsonants = [
	'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm',
	'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'
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

	const curX = currentCoord[0];
	const curY = currentCoord[1];
	if (letterPools[0].includes(letter)) {
		// if this is up, subtract 1 from y
		const newY = Math.max(curY - 1, 0);
		return [curX, newY];
	}
	if (letterPools[1].includes(letter)) {
		// if this is down, add 1 to y
		const newY = Math.min(curY + 1, 6);
		return [curX, newY];
	}
	if (letterPools[2].includes(letter)) {
		// if this is left, subtract 1 from x
		const newX = Math.max(curX - 1, 0);
		return [newX, curY];
	}
	if (letterPools[3].includes(letter)) {
		// if this is right, add 1 to x
		const newX = Math.min(curX + 1, 6);
		return [newX, curY];
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

	// search word list for valid words that will eventually get us
	// to the target word. we do this in two passes (expecting two words)
	const scores = Object.groupBy(words, (word) => {
		// determine the new location
		const newCoords = getNewCoordsWithWords(index, pc, word);
		if (newCoords.length === 0) {
			return initialDiff;
		}
		const lastCoord = newCoords.at(-1);
		const newDiff = getDiffBetweenCoords(lastCoord, ec);

		return newDiff;
	});

	console.log(scores);
}
