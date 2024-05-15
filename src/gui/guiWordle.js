'use strict';

const { EXACT_MATCH, PARTIAL_MATCH, NO_MATCH } = Matches;

const { WIN, IN_PROGRESS, LOSS } = Status;

const width = 5;
const height = 6;
let target;
let isIncorrect = false;

async function initializeTarget() {
  target = await getARandomWord(await getResponse());
  console.log(target);
}
initializeTarget();
initializeTarget();


let attempt = 0;
let playing = true;

function getTileByID(tilePosition) {
  return document.getElementById(`${tilePosition.row}-${tilePosition.col}`);
}

function concatWord(tilePosition) {
  return document.getElementById('attempt-' + tilePosition.row)
    .innerText
    .replace(/(\r\n|\n|\r)/gm, '');
}

function handleLetterInput(tilePosition, key) {
  if (tilePosition.col < width) {
    const currentTile = getTileByID(tilePosition);
    currentTile.innerText = key;
    tilePosition.col++;
  }
  checkGuessButton(tilePosition);
}

function handleBackspaceInput(tilePosition) {
  if (0 < tilePosition.col && tilePosition.col <= width) {
    tilePosition.col--;
  }

  const currentTile = getTileByID(tilePosition);
  currentTile.innerText = '';

  if (document.getElementById('incorrect-spelling').innerText) {
    clearIncorrectGuessMessage();
  }
  
  isIncorrect = false;
  checkGuessButton(tilePosition);
}

async function handleEnterInput(tilePosition) {
  try {
    if (tilePosition.col === width) {
      const guess = concatWord(tilePosition);
      await processGuess(guess);
      
      tilePosition.row++;
      tilePosition.col = 0;

      checkGuessButton(tilePosition);
      clearIncorrectGuessMessage();
    }
  } catch (error) {
    displayIncorrectGuessMessage();
    disableGuessButton();
    isIncorrect = true;
  }
}

async function processInput(event, tilePosition) {
  if(!playing){
    return;
  }

  const { code, key } = event;

  if ('KeyA' <= code && code <= 'KeyZ') {
    handleLetterInput(tilePosition, key);
  }

  else if (code === 'Backspace') {
    handleBackspaceInput(tilePosition);
  }

  else if (code === 'Enter') {
    await handleEnterInput(tilePosition);
  }
}

function enableGuessButton() {
  const guessBtn = document.getElementById('guess-button');
  guessBtn.disabled = false;
  guessBtn.classList.remove('disabled');
}

function disableGuessButton() {
  const guessBtn = document.getElementById('guess-button');
  guessBtn.disable = true;
  guessBtn.classList.add('disabled');
}

function checkGuessButton(tilePosition) {
  if (tilePosition.col === width && !isIncorrect) {
    enableGuessButton();
  }

  else {
    disableGuessButton();
  }
}

async function handleGuessButton(tilePosition) {
  try {
    if (tilePosition.col === width) {
      const guess = concatWord(tilePosition);
      await processGuess(guess);
      
      tilePosition.row++;
      tilePosition.col = 0;

      checkGuessButton(tilePosition);
      clearIncorrectGuessMessage();
    }
  } catch (error) {
    displayIncorrectGuessMessage();
    disableGuessButton();
    isIncorrect = true;
  }
}

function displayIncorrectGuessMessage() {
  const errorMsg = document.getElementById('incorrect-spelling');
  errorMsg.innerText = 'Not a word.';
}

function clearIncorrectGuessMessage() {
  const errorMsg = document.getElementById('incorrect-spelling');
  errorMsg.innerText = '';
}

async function processGuess(guess) {
  const guessResult = await play(target, guess, attempt, spellCheck.isSpellingCorrect);

  updateTileColor(guessResult.tally, attempt);
  attempt = guessResult.currentAttempt;
  gameOverCheck(guessResult.message);
}

function updateTileColor(guessTally, attempt){
  guessTally.forEach((match, col) => {
    const currentTile = document.getElementById(attempt + '-' + col);
    
    if(match === EXACT_MATCH)
      currentTile.classList.add('exact-match');
    else if(match === PARTIAL_MATCH)
      currentTile.classList.add('partial-match');
    else 
      currentTile.classList.add('no-match');
  });
}

function gameOverCheck(message){
  if(message !== ''){
    const gameOverText = document.getElementById('game-over-text');

    gameOverText.innerText = message;
    playing = false;
  }
}

function startGame() {
  const tilePosition = {row: 0, col: 0 };
  attempt = 0;
  const guessButton = document.getElementById('guess-button');

  document.addEventListener('keyup', (event) => processInput(event, tilePosition));
  guessButton.addEventListener('click', async () => await handleGuessButton(tilePosition));
}

startGame();
