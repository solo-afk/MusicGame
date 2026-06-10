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
            choiceBtns.forEach(btn => btn.disabled = true);
            console.log("Out of time!");
            setTimeout(nextRound, 2000);
        }
    }, 1000);
}
function stopCountdown(){
    clearInterval(timerId);
}

//right or wrong answer; buttons are clickable now
const choiceBtns = document.querySelectorAll('.choice-btn');
choiceBtns.forEach(button => {
    button.addEventListener('click', function() {
        choiceBtns.forEach(btn => btn.disabled = true);
        stopCountdown();

        let currentSong = testPlaylist[currentRound];
        if(button.textContent === currentSong.title){
            console.log("Correct!");
            score += 100;
            scoreDisplay.textContent = "Score: " + score;
            button.style.backgroundColor = "#1DB954";
        } else {
            console.log("Incorrect!");
            button.style.backgroundColor = "#ff4c4c";
        }
        setTimeout(nextRound, 2000);
    })
})

function loadRound(){
    if (currentRound >= testPlaylist.length){ //SHOULD BE CHANGED TO A FIXED NUMBER OF ROUNDS
        alert("Game Over! Final Score: " + score);
        return;
    }

    let currentSong = testPlaylist[currentRound];
    roundDisplay.textContent = "Round: " + (currentRound + 1) + "/" + testPlaylist.length; //MAKE IT OUT OF THE FIXED NUMBER OF ROUNDS

    for (let i =0; i < choiceBtns.length; i++){
        choiceBtns[i].textContent = currentSong.choices[i];
        choiceBtns[i].style.backgroundColor = "";
        choiceBtns[i].disabled = false;
    }
    startCountdown();
}

function nextRound(){
    currentRound++;
    loadRound();
}

loadRound();


