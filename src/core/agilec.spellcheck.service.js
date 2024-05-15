'use strict';

const spellCheck = {
  async getResponse(word) {
    const response = await fetch(`/spellcheck?check=${word}`);

    const data = await response.text();
    return data;
  },

  async parse(response) {
    if (!['true', 'false'].includes(response)) {
      throw new Error('Did not receive "true" or "false"');
    }

    return response === 'true';
  },

  async isSpellingCorrect(word) {
    const response = await spellCheck.getResponse(word);

    return spellCheck.parse(response);
  } 
};

async function getResponse(){
  const response = await fetch('/words', {method: 'GET'});
  
  const data = await response.text();
  return data.split('\n');
}

let previousWord = null;
async function getARandomWord(wordList){
  const newWordList = wordList.filter(word => word !== previousWord);

  const randomIndex = Math.floor(Math.random() * newWordList.length);
  previousWord = newWordList[randomIndex];

  return newWordList[randomIndex];
} 

module.exports = { spellCheck, getARandomWord, getResponse };
