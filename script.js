// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBQ5kUkvHTxjKtZ8WrNCJ9Gd_yNqbSKOuI",
    authDomain: "fallling-balls-leaderbord.firebaseapp.com",
    projectId: "fallling-balls-leaderbord",
    storageBucket: "fallling-balls-leaderbord.firebasestorage.app",
    messagingSenderId: "268577112583",
    appId: "1:268577112583:web:ccafd3547a1bbee3f2a0a2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.getElementById("debug-message").textContent = "Firebase Loaded!";

// Select Elements
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

// Function to Create Falling Objects
function createObject() {
    const object = document.createElement('div');
    object.classList.add('object');
    object.style.left = Math.random() * (gameArea.clientWidth - 30) + 'px';
    object.style.position = "absolute";
    object.style.top = "0px";
    gameArea.appendChild(object);

    const fallInterval = setInterval(() => {
        let topPosition = parseInt(object.style.top) || 0;
        if (topPosition + object.clientHeight >= gameArea.clientHeight) {
            clearInterval(fallInterval);
            gameArea.removeChild(object);
            misses--;
            missesDisplay.textContent = 'Misses Left: ' + misses;
            if (misses <= 0) {
                endGame();
            }
        } else {
            object.style.top = (topPosition + fallingSpeed) + 'px';
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

// Function to Check If Object is Caught
function isCaught(object) {
    const basketRect = basket.getBoundingClientRect();
    const objectRect = object.getBoundingClientRect();

    return (
        objectRect.bottom >= basketRect.top &&
        objectRect.left >= basketRect.left &&
        objectRect.right <= basketRect.right
    );
}

// Move Basket with Mouse
document.addEventListener('mousemove', (e) => {
    const rect = gameArea.getBoundingClientRect();
    const basketWidth = basket.clientWidth;
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x - basketWidth / 2, rect.width - basketWidth));
    basket.style.left = x + 'px';
});

// Start Game Function
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

// End Game Function
function endGame() {
    clearInterval(gameInterval);
    alert("Game Over! Your score: " + score);
    let playerName = prompt("Enter your name for the leaderboard:");
    if (playerName) {
        submitScore(playerName, score);
    }
    startButton.style.display = 'block';
    restartButton.style.display = 'block';
}

// Submit Score to Firebase Firestore
async function submitScore(playerName, score) {
    try {
        await db.collection("leaderboard").add({
            name: playerName,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Score submitted!");
        loadLeaderboard();
    } catch (error) {
        console.error("Error adding score:", error);
    }
}

// Load Leaderboard from Firebase
async function loadLeaderboard() {
    const q = db.collection("leaderboard").orderBy("score", "desc").limit(5);
    const querySnapshot = await q.get();

    let leaderboardHTML = "";
    querySnapshot.forEach(doc => {
        let data = doc.data();
        leaderboardHTML += `<li>${data.name}: ${data.score}</li>`;
    });
    highScoreList.innerHTML = leaderboardHTML;
}

// Load leaderboard when the page loads
window.onload = loadLeaderboard;

// Event Listeners for Buttons
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => location.reload());
