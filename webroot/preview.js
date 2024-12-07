// fetch friendly words to be used in the project
const loadWordList = async () => {
	const friendlyWordsResponse = await fetch('./friendly_words.json');
	const friendlyWords = await friendlyWordsResponse.json();
	window.allWords = Object.values(friendlyWords).flatMap((values) => values);
}
loadWordList();

// dedicated functions for interacting with the preview table
const colorCell = (cellCoord, className) => {
	const tbody = previewTable.children[0]
	const coordRow = tbody.children[cellCoord[0]]
	const coordCell = coordRow.children[cellCoord[1]]
	coordCell.classList.add(className)
}

const clearColors = (className) => {
	[...document.querySelectorAll(`td.${className}`)].forEach(
		(cell) => cell.classList.remove(className)
	)
}

// event listeners for working with seed
const onIndexChange = (event) => {
	// clear old coord values
	player.id = ''
	enemy.id = ''

	// clear all previously colored paths
	clearColors('path');
	clearColors('end');

	// set new coord values
	setPlayerCoords(parseInt(event.target.value));
	setLetterPools(parseInt(event.target.value));
}

// function for getting (and updating ids for) player and enemy coords
const setPlayerCoords = (index) => {
	const tbody = previewTable.children[0]

	const playerCoord = getPlayerCoord(index);
	const enemyCoord = getEnemyCoord(index);

	const playerRow = tbody.children[playerCoord[0]]
	const playerCell = playerRow.children[playerCoord[1]]
	playerCell.id = 'player'

	const enemyRow = tbody.children[enemyCoord[0]]
	const enemyCell = enemyRow.children[enemyCoord[1]]
	enemyCell.id = 'enemy'
}

// function for building and updating letter pools
const setLetterPools = (index) => {
	const letterPools = getLetterPools(index);
	up.textContent = letterPools[0].join(' ');
	down.textContent = letterPools[1].join(' ');
	left.textContent = letterPools[2].join(' ');
	right.textContent = letterPools[3].join(' ');
}

// set initial values with default seed input
setPlayerCoords(parseInt(seedInput.value));
setLetterPools(parseInt(seedInput.value));

// add event listener
seedInput.addEventListener('input', onIndexChange);

// event listeners for testing inputs
const onEnteringWord = (event) => {
	const words = event.target.value;
	const index = parseInt(seedInput.value);

	const pc = getPlayerCoord(index);
	const nextCoords = getNewCoordsWithWords(index, pc, words)

	// clear all previously colored paths
	clearColors('path');
	clearColors('end');

	nextCoords.forEach((coord) => {
		colorCell(coord, 'path');
	});
	if (nextCoords.length) {
		colorCell(nextCoords.at(-1), 'end');
	}
}
wordInput.addEventListener('input', onEnteringWord)

// event listener to trigger generator
generator.addEventListener('click', () => {
	const index = parseInt(seedInput.value);
	generateWords(allWords, index)
})
