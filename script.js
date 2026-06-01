const imagens = [
  "imagens/foto1.jpg",
  "imagens/foto2.jpg",
  "imagens/foto3.jpg",
  "imagens/foto4.jpg",
  "imagens/foto5.jpg",
  "imagens/foto6.jpg",
  "imagens/foto7.jpg",
  "imagens/foto8.jpg"
];



let cardsArray = [];
let openedCards = [];
let lockBoard = false;
let moves = 0;
let timerSeconds = 0;
let timerInterval = null;
let gameStarted = false;
let matchedPairs = 0;
const totalPairs = imagens.length;


const boardElement = document.getElementById('gameBoard');
const moveCountSpan = document.getElementById('moveCount');
const timerDisplaySpan = document.getElementById('timerDisplay');
const restartBtn = document.getElementById('restartBtn');
const rankingListEl = document.getElementById('rankingList');


function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


function buildDeck() {
  let deck = [];
  imagens.forEach((imgUrl, idx) => {
    deck.push({ id: idx, imageUrl: imgUrl, matched: false, flipped: false });
    deck.push({ id: idx, imageUrl: imgUrl, matched: false, flipped: false });
  });
  return shuffleArray(deck);
}


function renderBoard() {
  boardElement.innerHTML = '';
  cardsArray.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    if (card.flipped) cardDiv.classList.add('flipped');
    if (card.matched) cardDiv.classList.add('matched');

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-front';
    const img = document.createElement('img');
    img.src = card.imageUrl;
    img.alt = `carta ${card.id + 1}`;
    front.appendChild(img);

    const back = document.createElement('div');
    back.className = 'card-back';

    inner.appendChild(front);
    inner.appendChild(back);
    cardDiv.appendChild(inner);

    cardDiv.addEventListener('click', () => handleCardClick(index));
    boardElement.appendChild(cardDiv);
    card.cardElement = cardDiv;
  });
}


function updateCardUI(index) {
  const card = cardsArray[index];
  if (!card.cardElement) return;
  if (card.flipped) card.cardElement.classList.add('flipped');
  else card.cardElement.classList.remove('flipped');
  if (card.matched) card.cardElement.classList.add('matched');
  else card.cardElement.classList.remove('matched');
}


function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}


function handleCardClick(clickedIndex) {
  const clickedCard = cardsArray[clickedIndex];

  if (lockBoard) return;
  if (clickedCard.matched) return;
  if (clickedCard.flipped) return;
  if (openedCards.length === 2) return;

  
  if (!gameStarted && !timerInterval) {
    gameStarted = true;
    timerInterval = setInterval(() => {
      timerSeconds++;
      timerDisplaySpan.innerText = timerSeconds;
    }, 1000);
  }

  clickedCard.flipped = true;
  updateCardUI(clickedIndex);
  openedCards.push(clickedIndex);

  if (openedCards.length === 2) {
    moves++;
    moveCountSpan.innerText = moves;

    const cardA = cardsArray[openedCards[0]];
    const cardB = cardsArray[openedCards[1]];
    const isMatch = (cardA.id === cardB.id);

    if (isMatch) {
      cardA.matched = true;
      cardB.matched = true;
      updateCardUI(openedCards[0]);
      updateCardUI(openedCards[1]);
      matchedPairs++;
      openedCards = [];

      if (matchedPairs === totalPairs) {
        stopTimer();
        setTimeout(() => {
          alert(`🎉 Parabéns! ${moves} movimentos em ${timerSeconds} segundos! 🎉`);
          saveRanking(moves, timerSeconds);
        }, 100);
      }
    } else {
      lockBoard = true;
      setTimeout(() => {
        cardsArray[openedCards[0]].flipped = false;
        cardsArray[openedCards[1]].flipped = false;
        updateCardUI(openedCards[0]);
        updateCardUI(openedCards[1]);
        openedCards = [];
        lockBoard = false;
      }, 800);
    }
  }
}


function restartGame() {
  stopTimer();
  openedCards = [];
  lockBoard = false;
  moves = 0;
  timerSeconds = 0;
  gameStarted = false;
  matchedPairs = 0;
  moveCountSpan.innerText = '0';
  timerDisplaySpan.innerText = '0';
  const newDeck = buildDeck();
  cardsArray = newDeck.map(card => ({ ...card, flipped: false, matched: false, cardElement: null }));
  renderBoard();
}


function loadRanking() {
  const stored = localStorage.getItem('memoryRanking');
  return stored ? JSON.parse(stored) : [];
}

function saveRankingToStorage(ranking) {
  localStorage.setItem('memoryRanking', JSON.stringify(ranking));
}

function displayRanking() {
  const ranking = loadRanking();
  rankingListEl.innerHTML = '';
  if (ranking.length === 0) {
    rankingListEl.innerHTML = '<li class="empty-ranking">✨ Nenhuma pontuação ainda. Jogue e apareça aqui! ✨</li>';
    return;
  }
  ranking.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${idx+1}º ${entry.name}</span> <span>🎯 ${entry.moves} mov • ⏱️ ${entry.time}s</span>`;
    rankingListEl.appendChild(li);
  });
}

function saveRanking(movesDone, timeDone) {
  let ranking = loadRanking();
  let playerName = prompt("🏆 Ranking! Digite seu nome:", "Jogador");
  if (!playerName) return;
  playerName = playerName.substring(0, 12);
  ranking.push({ name: playerName, moves: movesDone, time: timeDone });
  ranking.sort((a, b) => (a.moves === b.moves ? a.time - b.time : a.moves - b.moves));
  if (ranking.length > 5) ranking = ranking.slice(0, 5);
  saveRankingToStorage(ranking);
  displayRanking();
}


function init() {
  const deck = buildDeck();
  cardsArray = deck.map(card => ({ ...card, flipped: false, matched: false, cardElement: null }));
  renderBoard();
  displayRanking();
}

restartBtn.addEventListener('click', restartGame);
init();