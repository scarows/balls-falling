const basket = document.getElementById('basket');
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
const missesDisplay = document.getElementById('misses');
const highScoreList = document.getElementById('high-score-list');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

let score = 0;
let misses = 3;
let fallingSpeed = 5;
let gameInterval;
let highScores = [];

function createObject() {
    const object = document.createElement('div');
    object.classList.add('object');
    object.style.left = Math.random() * (gameArea.clientWidth - 30) + 'px';
    gameArea.appendChild(object);

    const fallInterval = setInterval(() => {
        if (parseInt(object.style.top) + object.clientHeight >= gameArea.clientHeight) {
            clearInterval(fallInterval);
            gameArea.removeChild(object);
            misses--;
            missesDisplay.textContent = 'Misses Left: ' + misses;
            if (misses <= 0) {
                endGame();
            }
        } else {
            object.style.top = (parseInt(object.style.top) || 0) + fallingSpeed + 'px';
            if (isCaught(object)) {
                clearInterval(fallInterval);
                gameArea.removeChild(object);
                score++;
                scoreDisplay.textContent = 'Score: ' + score;
                if (score % 5 === 0) {
                    fallingSpeed++;
                }
            }
        }
    }, 50);
}

function isCaught(object) {
    const basketRect = basket.getBoundingClientRect();
    const objectRect = object.getBoundingClientRect();

    return (
        objectRect.bottom >= basketRect.top &&
        objectRect.left >= basketRect.left &&
        objectRect.right <= basketRect.right
    );
}

document.addEventListener('mousemove', (e) => {
    const rect = gameArea.getBoundingClientRect();
    const basketWidth = basket.clientWidth;
    const x = e.clientX - rect.left;
    if (x >= 0 && x <= rect.width) {
        basket.style.left = (x - basketWidth / 2) + 'px';
    }
});

function startGame() {
    score = 0;
    misses = 3;
    fallingSpeed = 5;
    scoreDisplay.textContent = 'Score: ' + score;
    missesDisplay.textContent = 'Misses Left: ' + misses;
    startButton.style.display = 'none';
    restartButton.style.display = 'none';
    gameInterval = setInterval(createObject, 1000);
}

function endGame() {
    clearInterval(gameInterval);
    alert('Game Over! Your score is ' + score);
    updateHighScores(score);
    startButton.style.display = 'none';
    restartButton.style.display = 'block';
}

function updateHighScores(score) {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);
    displayHighScores();
}

function displayHighScores() {
    highScoreList.innerHTML = '';
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        highScoreList.appendChild(li);
    });
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

displayHighScores();