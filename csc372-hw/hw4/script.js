const playerChoiceDisplay = document.getElementById('playerChoice');
const computerChoiceDisplay = document.getElementById('computerChoice');
const computerThrowImg = document.getElementById('computerThrow');
const outcomeDisplay = document.getElementById('outcome');
const winsDisplay = document.getElementById('wins');
const lossesDisplay = document.getElementById('losses');
const tiesDisplay = document.getElementById('ties');
const resetBtn = document.getElementById('resetBtn');

// track score
let wins = 0;
let losses = 0;
let ties = 0;

// choices
const choices = ['rock', 'paper', 'scissors'];
const images = document.querySelectorAll('.choices img');

// mapping choices to images
const choiceImages = {
    rock: 'images/rock.PNG',
    paper: 'images/paper.PNG',
    scissors: 'images/scissors.PNG'
};


// random computer choice
function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

// determine game result
function getResult(player, computer) {
    if (player === computer) return 'Tie';
    if (
        (player === 'rock' && computer === 'scissors') ||
        (player === 'scissors' && computer === 'paper') ||
        (player === 'paper' && computer === 'rock')
    ) {
        return 'Win';
    }
    return 'Lose';
}

// handle player choice click
function handleChoiceClick(event) {
    const playerChoice = event.target.id; // player's choice
    const computerChoice = getComputerChoice(); // computer's choice

    playerChoiceDisplay.textContent = `Your throw: ${playerChoice}`;

    // reset images to 'unselected'
    images.forEach(img => {
        img.classList.remove('selected-player');
        img.classList.add('unselected');
    });

    // add 'selected-player' to clicked image
    event.target.classList.add('selected-player');
    event.target.classList.remove('unselected');

    // computer "thinking" function
    shuffleComputerThrow(computerChoice, () => {
        computerChoiceDisplay.textContent = `Computer throw: ${computerChoice}`;
        computerThrowImg.src = choiceImages[computerChoice];

        // get game result
        const result = getResult(playerChoice, computerChoice);
        outcomeDisplay.textContent = `Result: You ${result}!`;

        // update score
        if (result === 'Win') {
            wins++;
        } else if (result === 'Lose') {
            losses++;
        } else {
            ties++;
        }

        // update score display
        winsDisplay.textContent = wins;
        lossesDisplay.textContent = losses;
        tiesDisplay.textContent = ties;

        // add 'selected-computer' class to computer's choice
        computerThrowImg.classList.add('selected-computer');
    });
}

// computer "thinking" function
function shuffleComputerThrow(actualChoice, callback) {
    let count = 0;
    let lastChoice = null;

    const shuffleInterval = setInterval(() => {
        let randomChoice;
        do {
            randomChoice = choices[Math.floor(Math.random() * choices.length)];
        } while (randomChoice === lastChoice); // new image is different from the last one

        computerThrowImg.src = choiceImages[randomChoice];
        lastChoice = randomChoice; // update last choice to the current one

        // shuffle every half second
        count++;
        if (count >= 6) { // 3 seconds = 6 half-second intervals
            clearInterval(shuffleInterval); // stop shuffling after 3 seconds
            callback(); // computer's choice
        }
    }, 500); // shuffle every 500ms (half second)
}

// add click event to each image
images.forEach(img => img.addEventListener('click', handleChoiceClick));

// reset button
resetBtn.addEventListener('click', () => {
    wins = 0;
    losses = 0;
    ties = 0;

    winsDisplay.textContent = wins;
    lossesDisplay.textContent = losses;
    tiesDisplay.textContent = ties;

    playerChoiceDisplay.textContent = 'Your throw: ';
    computerChoiceDisplay.textContent = 'Computer throw: ';
    outcomeDisplay.textContent = 'Result: ';

    // reset computer throw image to question mark
    computerThrowImg.src = 'images/question-mark.PNG';
    computerThrowImg.classList.remove('selected-computer');

    // reset all classes to default
    images.forEach(img => {
        img.classList.remove('selected-player', 'selected-computer');
        img.classList.add('unselected');
    });
});
