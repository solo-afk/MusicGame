let gameTracks = [];
let currentRound = 0;
let score = 0;
let timerInterval;
let audioPlayer = null

const scoreDisplay = document.getElementById('score');
const roundDisplay = document.getElementById('rounds');
const timerBar = document.querySelector('.timer-bar');

const playBtn = document.getElementById('play-btn');
const welcomeScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');

const pics = [
    "https://media.tenor.com/KLyDgEHX2cQAAAAj/yellow-emoji-meme-meme-emoji.gif",
    "https://i.pinimg.com/736x/9f/71/e8/9f71e80dfa2394d02a9562bda684af10.jpg",
    "https://bluemoji.io/cdn-proxy/646218c67da47160c64a84d5/698e41fc8ca563c9d4c24cb9_107.png",
    "https://media.tenor.com/10Oymwz_VbMAAAAm/sorry.webp",
    "https://i.pinimg.com/736x/70/af/5f/70af5fd5816fbcf51c46f860a5bed205.jpg",
    "https://ih1.redbubble.net/image.3805375475.7522/flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
    "https://i.pinimg.com/736x/d1/5d/5e/d15d5ee8afaddd29f45f2cc4816f0746.jpg",
    "https://t4.ftcdn.net/jpg/08/43/58/95/360_F_843589582_Pa4CQcriNdcjFMj1Chgz441fpVVlZ2L6.jpg",
    "https://media.tenor.com/8BvIvPhOJDYAAAAm/doink.webp",
    "https://ih1.redbubble.net/image.5356383745.5149/flat,750x,075,f-pad,750x1000,f8f8f8.u1.jpg",
    "https://i.pinimg.com/236x/5d/ce/35/5dce35d88b3f39374a894ddeae658916.jpg",
    "https://ih1.redbubble.net/image.6010012353.8862/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
    "https://i.pinimg.com/236x/1f/cc/d3/1fccd3da62720c0484e9b73d4f3771a3.jpg",
    "https://media.tenor.com/mLVjKydiRdMAAAAe/hamster-hamster-meme.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRISVImmFVGy5QdeFFDA02zldQEGlIeFmfxXw&s",
    "https://i.redd.it/these-stupid-ass-hamster-that-i-keep-seeing-on-tiktok-v0-281rkyoq84yf1.jpg?width=1320&format=pjpg&auto=webp&s=f14fb202318d10c3ab9d51c913ca37735b23f47e"

]

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

//right or wrong answer; buttons are clickable now #EDIT: logic now in loadRound
const choiceBtns = document.querySelectorAll('.choice-btn');
/*
choiceBtns.forEach(button => {
    button.addEventListener('click', function() {
        choiceBtns.forEach(btn => btn.disabled = true);
        stopCountdown();

        let currentSong = testPlaylist[currentRound];
        if(button.textContent === currentSong.title){
            console.log("Correct!");
            score += 10 * timeLeft;
            scoreDisplay.textContent = "Score: " + score;
            button.style.backgroundColor = "#1DB954";
        } else {
            console.log("Incorrect!");
            button.style.backgroundColor = "#ff4c4c";
        }
        setTimeout(nextRound, 2000);
    })
}) */

function playTrack(url){
    if(audioPlayer){
        audioPlayer.pause();
    }

    audioPlayer = new Audio(url);
    audioPlayer.volume = 0.5;

    audioPlayer.play().catch(error => {
        console.log("browser blocked autoplay, click screen to play audio", error);
    })


}

function loadRound(){
    if(audioPlayer){ //Stops msuic
        audioPlayer.pause();
    }

    if (currentRound >= gameTracks.length){ 
        document.getElementById('final-score').textContent = "Final Score: " + score;
        endScreen.style.display = 'block';
        gameScreen.style.display = 'none';
        return;
    }

    let currentSong = gameTracks[currentRound];
    roundDisplay.textContent = "Round: " + (currentRound + 1) + "/" + gameTracks.length;

    let choices = [];
    choices.push(`${currentSong.title} - ${currentSong.artist}`);


    while (choices.length < choiceBtns.length){
        let randomSong = gameTracks[Math.floor(Math.random() * gameTracks.length)];
        let option = `${randomSong.title} - ${randomSong.artist}`;

        if(!choices.includes(option)){
            choices.push(option);
        }
    }

    const randomIndex = Math.floor(Math.random() * pics.length)
    const roundImage = pics.splice(randomIndex,1)[0];
    document.getElementById('album-cover').src = roundImage
    choices.sort(() => Math.random() - 0.5);
    
    //AUDIO
    if (currentSong.preview_url){
        playTrack(currentSong.preview_url);
        }
    else{
        console.log("No tenemos audio");
    }
    startCountdown();

    for (let i =0; i < choiceBtns.length; i++){
        choiceBtns[i].textContent = choices[i];
        choiceBtns[i].style.backgroundColor = "";
        choiceBtns[i].disabled = false;
        
        //checks the right answer
        choiceBtns[i].onclick = function(){
            stopCountdown();
            let ans = `${currentSong.title} - ${currentSong.artist}`;
            if(choiceBtns[i].textContent === ans){
                score += timeLeft*10;
                scoreDisplay.textContent = "Score: "+score;
                choiceBtns[i].style.backgroundColor = "green";
            } else if(timeLeft === 0 || choiceBtns[i].textContent !== ans){
                choiceBtns[i].style.backgroundColor = "red";
                choiceBtns.forEach(btn => {
                    if (btn.textContent === ans) {
                        btn.style.backgroundColor = "green";
                    }
                });
            } 

            for(let btn of choiceBtns) btn.disabled = true;

            setTimeout(() => {
                audioPlayer.pause()
                currentRound++;
                loadRound();
            }, 3000)
        }
    }
}

function nextRound(){
    
    currentRound++;
    loadRound();
}

if(playBtn){
    playBtn.addEventListener('click', function(e){
        const isAuth = playBtn.getAttribute('data-auth') === 'true';
        if (isAuth) {
            e.preventDefault();
            startGame();
        }
        
    })
}

function startGame(){
    fetch('/api/get_tracks')
        .then(response => response.json())
        .then(data => {
            if(data.error){
                alert("Failed to load tracks. Try logging out and back in");
                return;
            }

            gameTracks = data;
            currentRound = 0;
            score = 0;
            
            welcomeScreen.style.display = 'none';
            gameScreen.style.display = 'block';

            loadRound();
        })
        .catch(err => console.error("Error starting game", err));
}

const backHome = document.getElementById("back-home");
const endHome = document.getElementById("end-home");

backHome.addEventListener('click', function(){
    stopCountdown();
    welcomeScreen.style.display = 'block';
    gameScreen.style.display='none';
})

endHome.addEventListener('click', function(){
    endScreen.style.display='none';
    welcomeScreen.style.display = 'block';
})


