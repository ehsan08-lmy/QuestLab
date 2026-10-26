'use strict';

// All numeric game settings are constants at the top of this script.
const CODE_LENGTH = 4;
const DIGIT_MIN = 0;
const DIGIT_MAX = 9;
const MAX_ATTEMPTS = 8;
const HISTORY_LIMIT = 8;
const INITIAL_BEST = null;

// DOM elements
const guessForm = document.querySelector('#guess-form');
const guessInput = document.querySelector('#guess-input');
const gameStatus = document.querySelector('#game-status');
const attemptsLeft = document.querySelector('#attempts-left');
const bestResult = document.querySelector('#best-result');
const historyList = document.querySelector('#guess-history');
const historyCount = document.querySelector('#history-count');
const restartButton = document.querySelector('#restart-game');
const codeDisplay = document.querySelector('.code-display');

// Game state
let secretCode = [];
let attempts = 0;
let gameOver = false;
let bestAttempts = INITIAL_BEST;
let guessRecords = [];

// Generate a random digit between the minimum and maximum.
function randomDigit() {
    return (
        Math.floor(
            Math.random() * (DIGIT_MAX - DIGIT_MIN + 1)
        ) + DIGIT_MIN
    );
}

// Generate a secret code with no repeated digits.
function createSecretCode() {
    const digits = [];

    while (digits.length < CODE_LENGTH) {
        const digit = randomDigit();

        if (!digits.includes(digit)) {
            digits.push(digit);
        }
    }

    return digits;
}

// Display a status message.
function setStatus(message, type = '') {
    gameStatus.textContent = message;

    gameStatus.classList.toggle(
        'is-error',
        type === 'error'
    );

    gameStatus.classList.toggle(
        'is-success',
        type === 'success'
    );
}

// Update the game interface.
function renderGame() {
    attemptsLeft.textContent = String(
        MAX_ATTEMPTS - attempts
    );

    bestResult.textContent =
        bestAttempts === null
            ? '—'
            : `${bestAttempts} tries`;

    historyCount.textContent =
        `${guessRecords.length} ${
            guessRecords.length === 1 ? 'guess' : 'guesses'
        }`;

    historyList.replaceChildren();

    // Display a message when there are no guesses.
    if (guessRecords.length === 0) {
        const empty = document.createElement('li');

        empty.className = 'empty-state';
        empty.textContent = 'Your attempts will appear here.';

        historyList.append(empty);
    }

    // Display the guess history.
    for (const record of guessRecords) {
        const item = document.createElement('li');

        const code = document.createElement('span');
        code.className = 'guess-code';
        code.textContent = record.guess;

        const feedback = document.createElement('span');
        feedback.className = 'guess-feedback';
        feedback.textContent = record.message;

        item.append(code, feedback);
        historyList.append(item);
    }

    // Reveal the code only when the game is over.
    for (const digitSlot of codeDisplay.children) {
        const index = Array.from(codeDisplay.children)
            .indexOf(digitSlot);

        digitSlot.textContent = gameOver
            ? secretCode[index]
            : '?';
    }

    // Disable guessing after the game ends.
    guessInput.disabled = gameOver;

    guessForm.querySelector(
        'button[type="submit"]'
    ).disabled = gameOver;
}

// Finish the game and update the best result.
function endGame(won) {
    gameOver = true;

    if (
        won &&
        (bestAttempts === null || attempts < bestAttempts)
    ) {
        bestAttempts = attempts;
    }

    setStatus(
        won
            ? `Excellent! You cracked the code in ${attempts} attempts.`
            : `Game over. The code was ${secretCode.join('')}.`,
        won ? 'success' : 'error'
    );

    renderGame();
}

// Validate and process the player's guess.
function processGuess(rawGuess) {
    const guess = rawGuess.trim();
    const digits = Array.from(guess);

    // Reject invalid guesses without changing the game state.
    if (
        guess.length !== CODE_LENGTH ||
        !digits.every(
            (digit) =>
                digit >= String(DIGIT_MIN) &&
                digit <= String(DIGIT_MAX)
        ) ||
        new Set(digits).size !== CODE_LENGTH
    ) {
        setStatus(
            'Enter exactly four different digits from 0 to 9. ' +
            'This invalid guess does not use an attempt.',
            'error'
        );

        return;
    }

    // Stop processing if the game has ended.
    if (gameOver === true || attempts >= MAX_ATTEMPTS) {
        return;
    }

    attempts += 1;

    let exact = 0;
    let misplaced = 0;

    // Compare each guessed digit with the secret code.
    for (let index = 0; index < CODE_LENGTH; index += 1) {
        if (digits[index] === String(secretCode[index])) {
            exact += 1;
        } else if (
            secretCode.includes(Number(digits[index]))
        ) {
            misplaced += 1;
        }
    }

    const won = exact === CODE_LENGTH;

    const message =
        `${exact} in place · ${misplaced} misplaced`;

    // Add the guess to the history.
    guessRecords.unshift({
        guess,
        message
    });

    guessRecords = guessRecords.slice(0, HISTORY_LIMIT);

    if (won) {
        endGame(true);
    } else if (
        attempts === MAX_ATTEMPTS ||
        (attempts >= MAX_ATTEMPTS && gameOver === false)
    ) {
        endGame(false);
    } else {
        setStatus(`${message}. Keep going!`);
        renderGame();
    }
}

// Start a new game without reloading the page.
function startNewGame() {
    secretCode = createSecretCode();
    attempts = 0;
    gameOver = false;
    guessRecords = [];

    setStatus(
        `A new secret code is ready. You have ${MAX_ATTEMPTS} attempts.`
    );

    renderGame();

    guessInput.value = '';
    guessInput.focus();
}

// Handle the guess form submission.
guessForm.addEventListener('submit', (event) => {
    event.preventDefault();

    processGuess(guessInput.value);

    if (
        !gameOver &&
        !gameStatus.classList.contains('is-error')
    ) {
        guessInput.value = '';
    }
});

// Restart the game when the restart button is clicked.
restartButton.addEventListener('click', startNewGame);

// Initialize the game.
startNewGame();