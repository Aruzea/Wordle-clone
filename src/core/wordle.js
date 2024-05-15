'use strict';

const Matches = {
  EXACT_MATCH : 'EXACT MATCH',
  PARTIAL_MATCH : 'PARTIAL MATCH',
  NO_MATCH : 'NO MATCH'
};

const Status = {
  WIN : 'Win',
  IN_PROGRESS : 'In progress',
  LOSS : 'Loss'
};

const WinMessage = {
  FIRST_ATTEMPT : 'Amazing',
  SECOND_ATTEMPT : 'Splendid',
  THIRD_ATTEMPT : 'Awesome', 
  DEFAULT : 'Yay'
};

function countAllExactMatchesOfLetter(target, guess, letter){
  return target.split('')
    .filter((placeholder, i) => target[i] === guess[i])
    .filter(ch => ch === letter)
    .length;
}

function countAllLetterOccurencesUntilPosition(position, word, letter){
  const allOccurences = word.substring(0, position+1).match(new RegExp(letter, 'g'));

  return allOccurences ? allOccurences.length : 0;
}

function getTallyForPosition(position, target, guess) {  
  const targetLetter = target[position];
  const guessLetter = guess[position];
  
  if(targetLetter === guessLetter){
    return Matches.EXACT_MATCH;
  }

  const totalExactMatches = countAllExactMatchesOfLetter(target, guess, guessLetter); 
  const totalPossiblePartialMatches = countAllLetterOccurencesUntilPosition(target.length - 1, target, guessLetter) - totalExactMatches; 

  const  numPossiblePartialMatchesLeft = totalPossiblePartialMatches - countAllLetterOccurencesUntilPosition(position, guess, guessLetter);

  return numPossiblePartialMatchesLeft >= 0 ? Matches.PARTIAL_MATCH : Matches.NO_MATCH;
}

function validateNumberOfAttempts(attempt) {
  if (attempt > 5)
    throw new Error('Maximum attempts exceeded. Only 6 guesses allowed');
}

function determineWinMessage(attempt) {
  const winMessages = [WinMessage.FIRST_ATTEMPT, WinMessage.SECOND_ATTEMPT, WinMessage.THIRD_ATTEMPT];

  return attempt <= 2 ? winMessages[attempt] : WinMessage.DEFAULT;
}

function determineGameStatus(guessTally, target, attempt) {
  const MAX_ATTEMPTS = 5;

  if (guessTally.every(matchVal => matchVal === Matches.EXACT_MATCH)){
    return { status: Status.WIN, message: determineWinMessage(attempt) };
  }

  if (attempt === MAX_ATTEMPTS) {
    return { status: Status.LOSS, message: `It was ${target}, better luck next time` };
  }
  
  return { status: Status.IN_PROGRESS, message: '' };
}

function tallyGuess(target, guess){
  if (guess.length !== 5) {
    throw new Error('Guess is not of valid length');
  }

  return guess.split('')
    .reduce((tally, letter, position) => tally.concat([getTallyForPosition(position, target, guess)]),[]);
}

async function play(target, guess, attempt, isSpellingCorrect = word => true){
  validateNumberOfAttempts(attempt);

  if(!(await isSpellingCorrect(guess))){ 
    throw Error('Not a word.');
  }

  const currentGuessTally = tallyGuess(target, guess);
  const { status: currentGameStatus, message: currentMessage } = determineGameStatus(currentGuessTally, target, attempt);

  return {
    currentAttempt: attempt + 1,
    tally: currentGuessTally,
    gameStatus: currentGameStatus,
    message: currentMessage
  };
}

module.exports = { tallyGuess, Matches, play, Status, WinMessage };
