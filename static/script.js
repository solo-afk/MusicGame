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
const countScreen = document.getElementById('countdown');
const count = document.getElementById('nums');
const delay = ms => new Promise(res => setTimeout(res, ms));
const FADE_CURVE = 2;

let isGameActive = false;
/*
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
*/
//The timer bar countdown
let timeLeft = 15;
let timerId = null

const ROUND_TIME = 15;
const albumCover = document.getElementById('album-cover');
const albumPlaceholder = document.getElementById('album-placeholder');

let selectedPlaylist = null;       // {id, name}
let loading = false;
const choiceScreen = document.getElementById('playlist-choice');
const chooseBtn = document.getElementById('choose-btn');
const choicePlayBtn = document.getElementById('choice-play-btn');
const choiceBackBtn = document.getElementById('choice-back-btn');

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function revealAnswer(ans, clickedBtn) {
    choiceBtns.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === ans) btn.style.backgroundColor = 'green';
        else if (btn === clickedBtn) btn.style.backgroundColor = 'red';
    });
    albumPlaceholder.style.transition = 'opacity 0.5s ease-out';
    albumPlaceholder.style.opacity = 0;
}

function launchConfetti() {
    const r = albumCover.getBoundingClientRect();
    confetti({
        particleCount: 150,
        spread: 90,
        origin: {
            x: (r.left + r.width / 2) / window.innerWidth,
            y: (r.top + r.height / 2) / window.innerHeight
        }
    });
}

function startCountdown() {
    const song = gameTracks[currentRound];
    const ans = `${song.title} - ${song.artist}`;
    const startTime = Date.now();

    timerId = setInterval(() => {
        timeLeft = Math.max(0, ROUND_TIME - (Date.now() - startTime) / 1000);
        timerBar.style.width = (timeLeft / ROUND_TIME * 100) + '%';
        const progress = 1 - timeLeft / ROUND_TIME;                  
        albumPlaceholder.style.opacity = 1 - Math.pow(progress, FADE_CURVE);

        if (timeLeft <= 0) {
            stopCountdown();
            revealAnswer(ans, null);
            setTimeout(nextRound, 3000);
        }
    }, 50);
}

function stopCountdown(){
    clearInterval(timerId);
}

//right or wrong answer; buttons are clickable now #EDIT: logic now in loadRound
const choiceBtns = document.querySelectorAll('.choice-btn');

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

async function loadRound(){
    if(!isGameActive){
        return;
    }
    
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

    shuffle(choices);
    
    albumCover.style.transition = 'none';
    albumPlaceholder.style.transition = 'none';
    albumPlaceholder.style.opacity = 1;
    albumCover.src = currentSong.cover || '';
//reset timerbar
    timeLeft = 15;
    let widthpercent = (timeLeft/15) *100;
    timerBar.style.width = widthpercent + "%";

    for (let i =0; i < choiceBtns.length; i++){
        choiceBtns[i].textContent = choices[i];
        choiceBtns[i].style.backgroundColor = "";
        choiceBtns[i].disabled = false;
    }
    countScreen.style.display='flex';
    count.textContent = "3";
    await delay(1000); 
    count.textContent = "2";
    await delay(1000);
    count.textContent = "1";
    await delay(1000);
    countScreen.style.display = 'none';
    
    //AUDIO
    if (currentSong.preview_url && isGameActive){
        playTrack(currentSong.preview_url);
        }
    else{
        console.log("No tenemos audio");
    }
    startCountdown();

    for (let i =0; i < choiceBtns.length; i++){
        //checks the right answer
        choiceBtns[i].onclick = function () {
            stopCountdown();
            const ans = `${currentSong.title} - ${currentSong.artist}`;
            if (choiceBtns[i].textContent === ans) {
                score += Math.round(timeLeft * 10);
                scoreDisplay.textContent = "Score: " + score;
                launchConfetti();
            }
            revealAnswer(ans, choiceBtns[i]);
            setTimeout(() => {
                audioPlayer.pause();
                currentRound++;
                loadRound();
            }, 3000);
        };
        
    }
    
}

function nextRound(){
    currentRound++;
    loadRound();
}

async function loadCardRow(containerId, apiPath, emptyMessage) {
    const row = document.getElementById(containerId);
    row.replaceChildren();

    let items = [];
    try {
        const res = await fetch(apiPath);
        items = await res.json();
    } catch (err) {
        console.error(err);
    }
    if (!Array.isArray(items) || !items.length) {
        row.textContent = emptyMessage;
        return;
    }

    items.forEach(p => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        if (selectedPlaylist && selectedPlaylist.id === p.id) card.classList.add('selected');

        const img = document.createElement('img');
        img.src = p.image || '';
        const name = document.createElement('span');
        name.textContent = p.name;
        card.append(img, name);

        card.addEventListener('click', () => {
            selectedPlaylist = { type: p.type || 'playlist', id: p.id, name: p.name };
            choiceScreen.querySelectorAll('.playlist-card')
                .forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.querySelectorAll('.chosen-label')
                .forEach(el => el.textContent = 'Playlist: ' + p.name);
        });
        row.appendChild(card);
    });
}
async function showPlaylistChoice() {
    welcomeScreen.style.display = 'none';
    choiceScreen.style.display = 'block';
    loadCardRow("user-playlists", '/api/get_user_playlists', "No usable playlists found (only playlists you own or collaborate on show up).")
    loadCardRow('recent-albums', '/api/get_new_from_artists', "No recent releases found.");
    //loadCardRow('custom-playlist', '/api/search', "Nothing Found");
}

function runSearch() {
    const q = document.getElementById('search-input').value.trim();
    if (!q) return;
    loadCardRow('search-results', `/api/search?q=${encodeURIComponent(q)}`, 'No albums found.');
}
document.getElementById('search-btn').addEventListener('click', runSearch);
document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') runSearch();
});

if (playBtn) {
    playBtn.addEventListener('click', function (e) {
        if (playBtn.getAttribute('data-auth') !== 'true') return;   // logged out: the <a> handles login
        e.preventDefault();
        if (!selectedPlaylist) showPlaylistChoice();
        else startGame(selectedPlaylist);
    });
}

if (chooseBtn) chooseBtn.addEventListener('click', showPlaylistChoice);

function startGame(playlistId) {
    if (loading) return;
    loading = true;
    isGameActive = true;

    fetch(`/api/get_tracks?type=${playlistId.type}&id=${encodeURIComponent(playlistId.id)}`)
        .then(r => r.json())
        .then(data => {
            if (data.error || data.length < 4) {
                alert(data.error ? "Failed to load tracks. Try again or pick another playlist."
                                 : "That playlist doesn't have enough playable songs (need at least 4).");
                isGameActive = false;
                return;
            }
            gameTracks = data;
            currentRound = 0;
            score = 0;
            scoreDisplay.textContent = "Score: 0";
            welcomeScreen.style.display = 'none';
            choiceScreen.style.display = 'none';
            gameScreen.style.display = 'block';
            loadRound();
        })
        .catch(err => { console.error("Error starting game", err); isGameActive = false; })
        .finally(() => { loading = false; });
}

choicePlayBtn.addEventListener('click', () => {
    if (!selectedPlaylist) { alert("Pick a playlist first."); return; }
    startGame(selectedPlaylist);
});

choiceBackBtn.addEventListener('click', () => {
    choiceScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
});

const backHome = document.getElementById("back-home");
const endHome = document.getElementById("end-home");

backHome.addEventListener('click', function(){
    //playBtn.disabled = false;
    isGameActive = false;
    score = 0;
    scoreDisplay.textContent = '0';
    currentRound = 0;
    stopCountdown();
    audioPlayer.pause();
    welcomeScreen.style.display = 'block';
    gameScreen.style.display='none';
    countScreen.style.display = 'none';
    stopCountdown();
})

endHome.addEventListener('click', function(){
    endScreen.style.display='none';
    welcomeScreen.style.display = 'block';
})


