'use strict';

const { tallyGuess, Matches, play, Status, WinMessage } = require('../src/core/wordle.js');
const { spellCheck } = require('../src/core/agilec.spellcheck.service.js');

jest.mock('../src/core/agilec.spellcheck.service.js', () => ({
  spellCheck: {
    isSpellingCorrect: jest.fn().mockResolvedValue(true), // Mocking to always return true
  }
}));

const { EXACT_MATCH, PARTIAL_MATCH, NO_MATCH} = Matches;

const { WIN, IN_PROGRESS, LOSS } = Status;

const { FIRST_ATTEMPT, SECOND_ATTEMPT, THIRD_ATTEMPT, DEFAULT } = WinMessage;

test('canary test', () => {
  expect(true).toBe(true);
}); 

describe('tallyGuess with valid inputs', () => {
  test.each([
    ['FAVOR', 'FAVOR', [EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH]],
    ['FAVOR', 'TESTS', [NO_MATCH, NO_MATCH, NO_MATCH, NO_MATCH, NO_MATCH]],
    ['FAVOR', 'RAPID', [PARTIAL_MATCH, EXACT_MATCH, NO_MATCH, NO_MATCH, NO_MATCH]],
    ['FAVOR', 'MAYOR', [NO_MATCH, EXACT_MATCH, NO_MATCH, EXACT_MATCH, EXACT_MATCH]],
    ['FAVOR', 'RIVER', [NO_MATCH, NO_MATCH, EXACT_MATCH, NO_MATCH, EXACT_MATCH]],
    ['FAVOR', 'AMAST', [PARTIAL_MATCH, NO_MATCH, NO_MATCH, NO_MATCH, NO_MATCH]],

    ['SKILL', 'SKILL', [EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH]],
    ['SKILL', 'SWIRL', [EXACT_MATCH, NO_MATCH, EXACT_MATCH, NO_MATCH, EXACT_MATCH]],
    ['SKILL', 'CIVIL', [NO_MATCH, PARTIAL_MATCH, NO_MATCH, NO_MATCH, EXACT_MATCH]],
    ['SKILL', 'SHIMS', [EXACT_MATCH, NO_MATCH, EXACT_MATCH, NO_MATCH, NO_MATCH]],
    ['SKILL', 'SILLY', [EXACT_MATCH, PARTIAL_MATCH, PARTIAL_MATCH, EXACT_MATCH, NO_MATCH]],
    ['SKILL', 'SLICE', [EXACT_MATCH, PARTIAL_MATCH, EXACT_MATCH, NO_MATCH, NO_MATCH]]
  ])('answer %s attempt %s', (answer, attempt, expected) => {
    expect(tallyGuess(answer, attempt)).toStrictEqual(expected);
  });
});

describe('tallyGuess with invalid inputs', () => {
  test.each([
    ['FAVOR', 'FOR', 'Guess is not of valid length'],
    ['FAVOR', 'FERVER', 'Guess is not of valid length']
  ])('answer %s attempt %s', (answer, attempt, expected) => {
    expect(() => tallyGuess(answer, attempt)).toThrow(expected);
  });
});

describe('play with winning guess attempts within valid range', () => {
  test.each([
    ['FAVOR', 'FAVOR', 0, {currentAttempt: 1, tally: [EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH], gameStatus: WIN, message: FIRST_ATTEMPT}], 
    ['FAVOR', 'FAVOR', 1, {currentAttempt: 2, tally: [EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH], gameStatus: WIN, message: SECOND_ATTEMPT}],
    ['FAVOR', 'FAVOR', 2, {currentAttempt: 3, tally: [EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH], gameStatus: WIN, message: THIRD_ATTEMPT}],
    ['FAVOR', 'FAVOR', 3, {currentAttempt: 4, tally: [EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH], gameStatus: WIN, message: DEFAULT}],
    ['FAVOR', 'FAVOR', 4, {currentAttempt: 5, tally: [EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH], gameStatus: WIN, message: DEFAULT}],
    ['FAVOR', 'FAVOR', 5, {currentAttempt: 6, tally: [EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH, EXACT_MATCH], gameStatus: WIN, message: DEFAULT}]
  ])('target %s guess %s attempt %s', async (target, guess, attempt, expected) => {
    await expect(play(target, guess, attempt)).resolves.toStrictEqual(expected);
  });
});

describe('play with non-winning guess attempts within valid range', () => {
  test.each([
    ['SKILL', 'SWIRL', 0, {currentAttempt: 1, tally: [EXACT_MATCH, NO_MATCH, EXACT_MATCH, NO_MATCH, EXACT_MATCH], gameStatus: IN_PROGRESS, message: ''}],
    ['FAVOR', 'TESTS', 1, {currentAttempt: 2, tally: [NO_MATCH, NO_MATCH, NO_MATCH, NO_MATCH, NO_MATCH], gameStatus: IN_PROGRESS, message: ''}],
    ['FAVOR', 'RAPID', 2, {currentAttempt: 3, tally: [PARTIAL_MATCH, EXACT_MATCH, NO_MATCH, NO_MATCH, NO_MATCH], gameStatus: IN_PROGRESS, message: ''}],
    ['FAVOR', 'MAYOR', 3, {currentAttempt: 4, tally: [NO_MATCH, EXACT_MATCH, NO_MATCH, EXACT_MATCH, EXACT_MATCH], gameStatus: IN_PROGRESS, message: ''}],
    ['FAVOR', 'RIVER', 4, {currentAttempt: 5, tally: [NO_MATCH, NO_MATCH, EXACT_MATCH, NO_MATCH, EXACT_MATCH], gameStatus: IN_PROGRESS, message: ''}],
    ['FAVOR', 'AMAST', 5, {currentAttempt: 6, tally: [PARTIAL_MATCH, NO_MATCH, NO_MATCH, NO_MATCH, NO_MATCH], gameStatus: LOSS, message: 'It was FAVOR, better luck next time'}]
  ])('target %s guess %s attempt %s', async (target, guess, attempt, expected) => {
    await expect(play(target, guess, attempt)).resolves.toStrictEqual(expected);
  });
});

describe('play with exceeded guess attempts', () => {
  test.each([
    ['FAVOR', 'FAVOR', 6, 'Maximum attempts exceeded. Only 6 guesses allowed'],
    ['FAVOR', 'TESTS', 7, 'Maximum attempts exceeded. Only 6 guesses allowed']
  ])('target %s guess %s attempt %s', async (target, guess, attempt, expected) => {
    await expect(() => play(target, guess, attempt)).rejects.toThrow(expected);
  });
});

test('play throws an exception for attempt 1, target FAVOR and guess FEVER where FEVER is considered incorrect spelling', async () => {
  const spellchecker = word => false;

  await expect(() => play('FAVOR', 'FAVOR', 0, spellchecker)).rejects.toThrow('Not a word.');
});

test('play returns proper response for attempt 1, target FAVOR and guess FEVER where FEVER is considered correct spelling', async () => {
  const spellchecker = word => true;

  await expect(play('FAVOR', 'FEVER', 0, spellchecker)).resolves.toStrictEqual({ currentAttempt: 1, tally: [EXACT_MATCH, NO_MATCH, EXACT_MATCH, NO_MATCH, EXACT_MATCH], gameStatus: IN_PROGRESS, message: '' });
});


test('play throws an exception for attempt 1, target FAVOR and guess FEVER where checking for spelling results in an exception', async () => {
  const spellchecker = word => { throw Error('Network Error'); };

  await expect(() => play('FAVOR', 'FEVER', 0, spellchecker)).rejects.toThrow('Network Error'); 
});
