// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";

// Firebase configuration (Replace with your actual Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyBQ5kUkvHTxjKtZ8WrNCJ9Gd_yNqbSKOuI",
    authDomain: "fallling-balls-leaderbord.firebaseapp.com",
    projectId: "fallling-balls-leaderbord",
    storageBucket: "fallling-balls-leaderbord.firebasestorage.app",
    messagingSenderId: "268577112583",
    appId: "1:268577112583:web:ccafd3547a1bbee3f2a0a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    let playerName = prompt("Game Over! Enter your name for the leaderboard:");
    if (playerName) {
        submitScore(playerName, score);
    }
    startButton.style.display = 'none';
    restartButton.style.display = 'block';
}

// Submit score to Firebase Firestore
async function submitScore(playerName, score) {
    try {
        await addDoc(collection(db, "leaderboard"), {
            name: playerName,
            score: score,
            timestamp: new Date()
        });
        console.log("Score submitted!");
        loadLeaderboard(); // Refresh leaderboard after submitting
    } catch (error) {
        console.error("Error adding score:", error);
    }
}

// Load leaderboard from Firebase
async function loadLeaderboard() {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    
    let leaderboardHTML = "";
    querySnapshot.forEach(doc => {
        let data = doc.data();
        leaderboardHTML += `<li>${data.name}: ${data.score}</li>`;
    });
    highScoreList.innerHTML = leaderboardHTML;
}

// Load leaderboard on page load
window.onload = loadLeaderboard;

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
