// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const basket = document.getElementById('basket');
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
const missesDisplay = document.getElementById('misses');
const highScoreList = document.getElementById('high-score-list');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

let playerName = "";

// Handle Name Input
document.getElementById("save-name").addEventListener("click", function () {
    playerName = document.getElementById("player-name").value.trim();
    
    if (playerName === "") {
        alert("Please enter your name.");
        return;
    }

    document.getElementById("name-input-container").style.display = "none";
    document.getElementById("game-area").style.display = "block";
});

// Function to Save Score to Firestore
function saveScore(score) {
    if (playerName !== "") {
        db.collection("leaderboard").add({  // Saving to "leaderboard" collection
            name: playerName,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("Score saved successfully!");
            loadLeaderboard(); // Refresh leaderboard after saving
        }).catch((error) => {
            console.error("Error saving score:", error);
        });
    }
}

// Function to Load and Display Leaderboard
function loadLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = ""; // Clear old list

    db.collection("leaderboard") // Fetch from correct collection
        .orderBy("score", "desc") // Order by highest score
        .limit(5) // Show top 5 scores
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                let data = doc.data();
                let listItem = document.createElement("li");
                listItem.textContent = `${data.name}: ${data.score}`;
                leaderboardList.appendChild(listItem);
            });
        }).catch((error) => {
            console.error("Error loading leaderboard:", error);
        });
}

// Call leaderboard function when the page loads
document.addEventListener("DOMContentLoaded", loadLeaderboard);

let score = 0;
let misses = 3;
let fallingSpeed = 5;
let gameInterval;
let highScores = [];

async function loadLeaderboard() {
    const leaderboardRef = db.collection("leaderboard");
    const querySnapshot = await leaderboardRef.orderBy("score", "desc").limit(5).get();

    let leaderboardHTML = "";
    querySnapshot.forEach(doc => {
        let data = doc.data();
        leaderboardHTML += `<li>${data.name}: ${data.score}</li>`;
    });

    document.getElementById("leaderboard-list").innerHTML = leaderboardHTML;
}

// Load leaderboard when the page loads
window.onload = loadLeaderboard;

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

function saveScore(playerName, playerScore) {
    db.collection("leaderboard").add({
        name: playerName,
        score: playerScore,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Score added successfully!");
        loadLeaderboard(); // Refresh leaderboard after saving
    })
    .catch(error => {
        console.error("Error saving score: ", error);
    });
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
