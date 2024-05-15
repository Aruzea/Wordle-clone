/**
 * @jest-environment jsdom
 */



test('jsdom canary test', () => {
    expect(document.body.innerHTML).toStrictEqual(document.body.innerHTML);
});

test('GUI displays "Not a word." when user enters "FAVRO" //Feedback: and presses Guess or hits enter', async () => {
    document.body.innerHTML = 
    '<div id="attempt-0" class="word">' +
    '<span id="0-0" class="tile">f</span>' +
    '<span id="0-1" class="tile">a</span>' +
    '<span id="0-2" class="tile">v</span>' +
    '<span id="0-3" class="tile">r</span>' +
    '<span id="0-4" class="tile">o</span>' +
    '</div>' +
    '<h1 id="incorrect-spelling" class="error-message"></h1>' +
    '<button id="guess-button" class="guess-button disabled">Guess</button>';

    require('../src/gui/guiWordle.js');

   // const spellCheckMock = jest.spyOn(spellCheck,'isSpellingCorrect').mockReturnValue(true);

    const guessButton = document.getElementById('guess-button');
    guessButton.click();
    const incorrectSpellingText = document.getElementById('incorrect-spelling');

    expect(incorrectSpellingText.innerText).toBe('Not a word. From: GUI');


});
    