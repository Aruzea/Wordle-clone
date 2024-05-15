'use strict';

require('jest-fetch-mock').enableMocks();

const { spellCheck, getARandomWord, getResponse } = require('../src/core/agilec.spellcheck.service.js');

describe('getResponse tests', () => {
  afterEach(() => { 
    fetch.resetMocks();
  });

  test('getResponse returns "true" for input FAVOR as respond from calling the webservice', async () => {
    fetch.mockResponseOnce(JSON.stringify(true));

    expect(await spellCheck.getResponse('FAVOR')).toBe('true');
  });

  test('getResponse returns "false" for input FAVRO as respond from calling the webservice', async () => {
    fetch.mockResponseOnce(JSON.stringify(false));
    
    expect(await spellCheck.getResponse('FAVRO')).toBe('false');
  });

  test('getResponse returns a list of words by calling the webservice', async() => {
    const wordList = ['FAVOR', 'SMART', 'GUIDE', 'TESTS', 'GRADE', 'BRAIN', 'SPAIN', 'SPINE', 'GRAIN', 'BOARD'];
    const fetchWordList = wordList.join('\n');

    fetch.mockResponseOnce(fetchWordList);

    expect(await getResponse()).toStrictEqual(wordList);
  });
});

describe('parse tests', () => {
  test('parse returns true for argument "true"', async () => {
    const response = 'true'; 

    await expect(spellCheck.parse(response)).resolves.toBe(true);
  });

  test('parse returns false for argument "false"', async () => {
    const response = 'false';

    await expect(spellCheck.parse(response)).resolves.toBe(false);
  });

  test('parse raises ValueError when it does not receive a "true" or "false"', async () => {
    const response = '12345';

    await expect(spellCheck.parse(response)).rejects.toThrow('Did not receive "true" or "false"');
  });
});

describe('isSpellingCorrect tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('isSpellingCorrect returns true if getResponse returns true and uses parse', async () => {
    const getResponseMock = jest.spyOn(spellCheck, 'getResponse').mockResolvedValueOnce('true');
    const parseMock = jest.spyOn(spellCheck, 'parse').mockReturnValue(true);

    await expect(spellCheck.isSpellingCorrect('FAVOR')).resolves.toBe(true); 

    expect(getResponseMock).toHaveBeenCalled();
    expect(parseMock).toHaveBeenCalled();
  });

  test('isSpellingCorrect returns false if getResponse returns false and uses parse', async () => {
    const getResponseMock = jest.spyOn(spellCheck, 'getResponse').mockResolvedValueOnce('false');
    const parseMock = jest.spyOn(spellCheck, 'parse').mockReturnValue(false);

    await expect(spellCheck.isSpellingCorrect('FAVRO')).resolves.toBe(false);

    expect(getResponseMock).toHaveBeenCalled();
    expect(parseMock).toHaveBeenCalled();
  });
  
  test('isSpellingCorrect throws Network Error if getResponse throws that exception', async () => {
    const getResponseMock = jest.spyOn(spellCheck, 'getResponse').mockRejectedValueOnce(new Error('Network Error'));
    
    await expect(spellCheck.isSpellingCorrect('FAVOR')).rejects.toThrow('Network Error');

    expect(getResponseMock).toHaveBeenCalled();
  });
});

describe('getARandomWord tests', () => {
  test('getARandomWord returns a word within a list of words', async () => {
    const wordList = ['FAVOR', 'SMART', 'GUIDE', 'TESTS', 'GRADE', 'BRAIN', 'SPAIN', 'SPINE', 'GRAIN', 'BOARD'];

    expect(wordList).toContain(await getARandomWord(wordList));
  });

  test('getARandomWord returns two different words given the same list, on two different calls', async () => {
    const wordList = ['FAVOR', 'SMART', 'GUIDE', 'TESTS', 'GRADE', 'BRAIN', 'SPAIN', 'SPINE', 'GRAIN', 'BOARD'];

    const wordOne = await getARandomWord(wordList);
    const wordTwo = await getARandomWord(wordList);

    expect(wordList).toContain(wordOne);
    expect(wordList).toContain(wordTwo);

    expect(wordOne).not.toBe(wordTwo);
  });
});
