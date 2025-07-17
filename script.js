const emojiSet = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝', '🥥', '🍑']

let symbols = [];
let flippedCards = [];
let isProcessing = false;
let moves = 0;
let level = 'easy';
let totalPairs = 3;
let timeInterval;
let timeElapsed = 0;
let confettiInterval;
let bestMoves = localStorage.getItem('bestMoves') || null;
let bestTime = localStorage.getItem('bestTime') || null;

const timerDisplay = document.getElementById('timer');
const gameArea = document.getElementById('game-area');
const levelSelection = document.getElementById('level-selection');
const gameBoard = document.querySelector('.game-board');
const moveCounter = document.getElementById('move-counter');
const winMessage = document.getElementById('win-message');
const restartButton = document.getElementById('restart-btn');
const victoryModal = document.getElementById('victory-modal');
const confettiCanvas = document.getElementById('confetti-canvas');
const flipSound = new Audio('sounds/click.wav');
const matchSound = new Audio('sounds/sparkle.wav');
const victorySound = new Audio('sounds/win.wav');
const buttonClickSound = new Audio('sounds/button-click.wav');
const progressBar = document.getElementById('progress-bar');

function startGame(selectedLevel){
    level = selectedLevel;
    switch(level){
        case 'easy':
            totalPairs = 3;
            break;
        case 'medium':
            totalPairs = 6;
            break;
        case 'hard':
            totalPairs = 10;
            break;
    }

    loadBestScores();

    levelSelection.style.display ='none';
    gameArea.style.display = 'block';

    initializeGame();
}

function initializeGame(){
    stopConfetti();
    clearInterval(timeInterval);
    timeElapsed = 0;
    timerDisplay.innerText = 'Time: 0 sec';

    timeInterval= setInterval(() => {
        timeElapsed++;
        timerDisplay.innerText = 'Time: ' + timeElapsed + ' sec';
    },1000);

    victoryModal.classList.add('hidden');

    moves = 0;
    moveCounter.innerText = 'Moves: 0';
    flippedCards = [];
    isProcessing = false;

    //prepare symbols
    symbols = emojiSet.slice(0,totalPairs).flatMap(e => [e,e]);
    symbols = symbols.sort(() => Math.random()- 0.5);

    //clear old board
    gameBoard.innerHTML = '';
    adjustGridColumns();

    // reset progress bar at game start
    progressBar.style.width = '0%';

    //GENERATE CARDS DYNAMICALLY
    symbols.forEach(symbol => {
        const card = document.createElement ('div');
        card.classList.add('card');
        card.setAttribute('data-symbol',symbol);

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const front = document.createElement('div');
        front.classList.add('card-front');
        front.innerText = '?';

        const back = document.createElement('div');
        back.classList.add('card-back');
        back.innerText = symbol;

        cardInner.appendChild(front);
        cardInner.appendChild(back);
        card.appendChild(cardInner);

        card.addEventListener('click', function(){
            handleCardClick(card);
        });

        gameBoard.appendChild(card);
    });
}

function handleCardClick(card){
    flipSound.play();
    if(isProcessing) return;
    if(flippedCards.includes(card)) return;
    if(card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if(flippedCards.length ===2){
        moves++;
        moveCounter.innerText = 'Moves: ' + moves;
        checkForMatch();
    }

}

function checkForMatch(){
    const [card1,card2] = flippedCards;
    const symbol1 = card1.getAttribute('data-symbol');
    const symbol2 = card2.getAttribute('data-symbol');

    isProcessing = true;

    if(symbol1 === symbol2){
        matchSound.play();
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            flippedCards = [];
            isProcessing = false;

            updateProgressBar();

            if(document.querySelectorAll('.card.matched').length === symbols.length){
                victorySound.play();
                victoryModal.classList.remove('hidden');
                startConfetti();
                clearInterval(timeInterval);

                if(bestMoves === null || moves < bestMoves){
                    bestMoves = moves;
                    localStorage.setItem('bestMoves_' + level, bestMoves);
                }

                if(bestTime === null || timeElapsed < bestTime){
                    bestTime = timeElapsed;
                    localStorage.setItem('bestTime_' + level, bestTime);
                }

                document.getElementById('stats-message').innerHTML = 
                    `Best Moves: ${bestMoves} | Your Moves: ${moves}<br>`+ `Best Time: ${bestTime} sec | Your Time: ${timeElapsed} sec`;
            }
        }, 500);

    }else{
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isProcessing = false;
        }, 1000);
    }
}


restartButton.addEventListener('click',() => {
    buttonClickSound.play();
    initializeGame();
});

const chooseLevelButtonInGame = document.getElementById('choose-level-btn-in-game');
chooseLevelButtonInGame.addEventListener('click',()=> {
    buttonClickSound.play();
    returnToLevels();
})

function adjustGridColumns() {
    if (totalPairs <= 3) {
        gameBoard.style.gridTemplateColumns = 'repeat(3, 1fr)';
    } else if (totalPairs <= 6) {
        gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else {
        gameBoard.style.gridTemplateColumns = 'repeat(5, 1fr)';
    }
}

function startConfetti(){
    const myConfetti = confetti.create(confettiCanvas, { resize: true});
    myConfetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6}
    });

    confettiInterval = setInterval(() => {
        myConfetti({
            particleCount:100,
            spread: 70,
            origin: { y: 0.6}
        });
    },500);
}

function stopConfetti(){
    clearInterval(confettiInterval);
    const ctx = confettiCanvas.getContext('2d');
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

function playAgain(){
    clearInterval(timeInterval);
    victoryModal.classList.add('hidden');
    stopConfetti();
    initializeGame();
}

function returnToLevels(){
    clearInterval(timeInterval);
    victoryModal.classList.add('hidden');
    stopConfetti();
    gameArea.style.display = 'none';
    levelSelection.style.display = 'block';
}


const playAgainButton = document.getElementById('play-again-btn');
const chooseLevelButton = document.getElementById('choose-level-btn');

playAgainButton.addEventListener('click', () => {
    buttonClickSound.play();
    playAgain();
});

chooseLevelButton.addEventListener('click', () =>{
    buttonClickSound.play();
    returnToLevels();
});

// Level selection buttons
document.getElementById('easy-btn').addEventListener('click', () => {
    buttonClickSound.play();
    startGame('easy');
});

document.getElementById('medium-btn').addEventListener('click', () => {
    buttonClickSound.play();
    startGame('medium');
});

document.getElementById('hard-btn').addEventListener('click', () => {
    buttonClickSound.play();
    startGame('hard');
});

// Utility function to load best scores for current level
function loadBestScores() {
    bestMoves = localStorage.getItem('bestMoves_' + level) || null;
    bestTime = localStorage.getItem('bestTime_' + level) || null;
}

function updateProgressBar(){
    const matchedCount = document.querySelectorAll('.card.matched').length;
    const totalCards = symbols.length;
    const percentComplete = (matchedCount / totalCards) * 100 ;
    progressBar.style.width = percentComplete + '%';
}

const themeToggleBtn = document.getElementById('theme-toggle-btn');
const savedTheme = localStorage.getItem('theme');

// Apply saved theme on page load
if (savedTheme === 'night') {
    document.body.classList.add('night-theme');
    themeToggleBtn.textContent = '☀️';
} else {
    document.body.classList.add('day-theme');
    themeToggleBtn.textContent = '🌙';
}

// Toggle theme when clicked
themeToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('night-theme')) {
        document.body.classList.remove('night-theme');
        document.body.classList.add('day-theme');
        themeToggleBtn.textContent = '🌙';
        localStorage.setItem('theme', 'day');
    } else {
        document.body.classList.remove('day-theme');
        document.body.classList.add('night-theme');
        themeToggleBtn.textContent = '☀️';
        localStorage.setItem('theme', 'night');
    }
});

