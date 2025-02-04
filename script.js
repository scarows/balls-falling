const basket = document.getElementById('basket');
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
const missesDisplay = document.getElementById('misses');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const leaderboardList = document.getElementById('leaderboard-list');
const playerNameInput = document.getElementById('player-name');
const saveNameButton = document.getElementById('save-name');

let playerName = "";
let score = 0;
let misses = 3;
let fallingSpeed = 5;
let gameInterval;
let isGameRunning = false;

// Handle Name Input
saveNameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName === "") {
        alert("Please enter your name.");
        return;
    }
    document.getElementById('name-input-container').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
});

// Start Game
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => location.reload());

// Basket Movement (Mouse + Touch)
function moveBasket(x) {
    const rect = gameArea.getBoundingClientRect();
    const basketWidth = basket.clientWidth;
    const newX = x - rect.left;
    if (newX >= 0 && newX <= rect.width) {
        basket.style.left = (newX - basketWidth / 2) + 'px';
    }
}

// Mouse Movement
document.addEventListener('mousemove', (e) => moveBasket(e.clientX));

// Touch Movement (Mobile)
document.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling while playing
    moveBasket(e.touches[0].clientX);
}, { passive: false });

// Create Falling Ball
function createBall() {
    const ball = document.createElement('div');
    ball.classList.add('ball');
    ball.style.left = Math.random() * (gameArea.clientWidth - 30) + 'px';
    gameArea.appendChild(ball);

    const fallInterval = setInterval(() => {
        if (!isGameRunning) {
            clearInterval(fallInterval);
            return;
        }

        ball.style.top = (parseInt(ball.style.top) || 0) + fallingSpeed + 'px';

        // Check if ball is caught
        if (isCaught(ball)) {
            clearInterval(fallInterval);
            ball.remove();
            score++;
            scoreDisplay.textContent = 'Score: ' + score;
        }

        // Check if ball is missed
        if (parseInt(ball.style.top) + ball.clientHeight >= gameArea.clientHeight) {
            clearInterval(fallInterval);
            ball.remove();
            misses--;
            missesDisplay.textContent = 'Misses Left: ' + misses;
            if (misses <= 0) {
                endGame();
            }
        }
    }, 50);
}

// Check if Ball is Caught
function isCaught(ball) {
    const basketRect = basket.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();
    return (
        ballRect.bottom >= basketRect.top &&
        ballRect.left >= basketRect.left &&
        ballRect.right <= basketRect.right
    );
}

// Start Game Function
function startGame() {
    isGameRunning = true;
    score = 0;
    misses = 3;
    fallingSpeed = 5;
    scoreDisplay.textContent = 'Score: ' + score;
    missesDisplay.textContent = 'Misses Left: ' + misses;
    startButton.style.display = 'none';
    restartButton.style.display = 'inline-block';
    gameInterval = setInterval(createBall, 1000);
}

// End Game Function
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    alert('Game Over! Your score: ' + score);
    saveScore(playerName, score);
    loadLeaderboard();
}

// Save Score to Cookies
function saveScore(name, score) {
    let leaderboard = getCookie('leaderboard');
    leaderboard = leaderboard ? JSON.parse(leaderboard) : [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5); // Keep top 5 scores
    setCookie('leaderboard', JSON.stringify(leaderboard), 365);
}

// Load Leaderboard from Cookies
function loadLeaderboard() {
    let leaderboard = getCookie('leaderboard');
    leaderboard = leaderboard ? JSON.parse(leaderboard) : [];
    leaderboardList.innerHTML = leaderboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('');
}

// Set Cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

// Get Cookie
function getCookie(name) {
    const cookie = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
    return cookie ? cookie.pop() : null;
}

// Load leaderboard on page load
window.onload = loadLeaderboard;
