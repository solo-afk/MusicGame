// Hardcoded test playlist to build our logic
const testPlaylist = [
    {
        title: "Mona Lisa",
        artist: "Dominic Fike",
        preview_url: "https://www.w3schools.com/html/horse.mp3", // Test audio file
        choices: ["Mona Lisa", "3 Nights", "Babydoll", "Phone Numbers"]
    },
    {
        title: "Let You Break My Heart Again",
        artist: "Laufey",
        preview_url: "https://www.w3schools.com/html/horse.mp3",
        choices: ["From The Start", "Let You Break My Heart Again", "Valentine", "Fragile"]
    },
    {
        title: "Blinding Lights",
        artist: "The Weeknd",
        choices: ["Starboy", "Circles", "Blinding Lights", "Save Your Tears"]
    }
];

let currentRound = 0;
let score = 0;
let timerInterval;
let gameAudio = new Audio();

const scoreDisplay = document.getElementById('score');
const roundDisplay = document.getElementById('rounds');
const timerBar = document.querySelector('.timer-bar');

//The timer bar countdown
let timeLeft = 15;
let timerId = null
function startCountdown(){
    timeLeft = 15;
    console.log("Timer start, remaining: "+timeLeft);

    timerId = setInterval(function() {
        timeLeft--;
        console.log("Time left: " + timeLeft);

        let widthpercent = (timeLeft/15) *100;
        timerBar.style.width = widthpercent + "%";

        if (timeLeft == 0){
            console.log("Time's up");
            stopCountdown();
        }
    }, 1000);
}
function stopCountdown(){
    clearInterval(timerId);
}

const choiceBtns = document.getElementsByClassName('.choice-btn');

function loadRound(){
    
}

