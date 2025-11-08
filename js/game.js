// 게임 상태
let gameState = {
    difficulty: 'medium',
    totalCards: 16,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    isPlaying: false,
    canFlip: true
};

// DOM 요소
const elements = {
    gameSetup: document.getElementById('gameSetup'),
    gameInfo: document.getElementById('gameInfo'),
    gameBoard: document.getElementById('gameBoard'),
    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    timer: document.getElementById('timer'),
    moves: document.getElementById('moves'),
    matched: document.getElementById('matched'),
    winModal: document.getElementById('winModal'),
    finalTime: document.getElementById('finalTime'),
    finalMoves: document.getElementById('finalMoves'),
    playerName: document.getElementById('playerName'),
    submitScore: document.getElementById('submitScore'),
    closeModal: document.getElementById('closeModal'),
    leaderboardList: document.getElementById('leaderboardList')
};

// 난이도 선택 버튼 이벤트
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.difficulty = btn.dataset.difficulty;
        gameState.totalCards = parseInt(btn.dataset.cards);
    });
});

// 게임 시작 버튼
elements.startBtn.addEventListener('click', startGame);

// 게임 리셋 버튼
elements.resetBtn.addEventListener('click', resetGame);

// 모달 닫기 버튼
elements.closeModal.addEventListener('click', closeModal);

// 점수 제출 버튼
elements.submitScore.addEventListener('click', submitScore);

// 리더보드 필터 버튼
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        loadLeaderboard(filter);
    });
});

// 게임 시작
function startGame() {
    // UI 전환
    elements.gameSetup.style.display = 'none';
    elements.gameInfo.style.display = 'flex';
    elements.gameBoard.style.display = 'grid';

    // 게임 상태 초기화
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.timer = 0;
    gameState.isPlaying = true;
    gameState.canFlip = true;

    // 보드 클래스 설정
    elements.gameBoard.className = 'game-board ' + gameState.difficulty;

    // 카드 생성
    createCards();

    // 타이머 시작
    startTimer();

    // UI 업데이트
    updateUI();
}

// 카드 생성
function createCards() {
    const numPairs = gameState.totalCards / 2;
    const emojis = GAME_CONFIG.cardEmojis.slice(0, numPairs);
    
    // 카드 배열 생성 (각 이모지 2개씩)
    const cardValues = [...emojis, ...emojis];
    
    // Fisher-Yates 셔플 알고리즘
    for (let i = cardValues.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
    }

    // 카드 DOM 생성
    elements.gameBoard.innerHTML = '';
    cardValues.forEach((emoji, index) => {
        const card = createCardElement(emoji, index);
        elements.gameBoard.appendChild(card);
        gameState.cards.push({ emoji, element: card, matched: false });
    });
}

// 카드 요소 생성
function createCardElement(emoji, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    
    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">❓</div>
            <div class="card-back">${emoji}</div>
        </div>
    `;
    
    card.addEventListener('click', () => flipCard(index));
    
    return card;
}

// 카드 뒤집기
function flipCard(index) {
    if (!gameState.isPlaying || !gameState.canFlip) return;
    
    const card = gameState.cards[index];
    
    // 이미 뒤집혔거나 매칭된 카드는 무시
    if (card.element.classList.contains('flipped') || card.matched) return;
    
    // 카드 뒤집기
    card.element.classList.add('flipped');
    gameState.flippedCards.push(index);
    
    // 두 장의 카드가 뒤집혔을 때
    if (gameState.flippedCards.length === 2) {
        gameState.canFlip = false;
        gameState.moves++;
        updateUI();
        
        setTimeout(() => {
            checkMatch();
        }, GAME_CONFIG.matchDelay);
    }
}

// 매칭 확인
function checkMatch() {
    const [index1, index2] = gameState.flippedCards;
    const card1 = gameState.cards[index1];
    const card2 = gameState.cards[index2];
    
    if (card1.emoji === card2.emoji) {
        // 매칭 성공
        card1.matched = true;
        card2.matched = true;
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        gameState.matchedPairs++;
        
        // 게임 완료 확인
        if (gameState.matchedPairs === gameState.totalCards / 2) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
    } else {
        // 매칭 실패
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
        }, GAME_CONFIG.flipDelay);
    }
    
    gameState.flippedCards = [];
    gameState.canFlip = true;
}

// 타이머 시작
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimer();
    }, 1000);
}

// 타이머 정지
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// 타이머 표시 업데이트
function updateTimer() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    elements.timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// UI 업데이트
function updateUI() {
    elements.moves.textContent = gameState.moves;
    elements.matched.textContent = `${gameState.matchedPairs} / ${gameState.totalCards / 2}`;
}

// 게임 종료
function endGame() {
    gameState.isPlaying = false;
    stopTimer();
    
    // 최종 결과 표시
    elements.finalTime.textContent = elements.timer.textContent;
    elements.finalMoves.textContent = gameState.moves;
    
    // 모달 표시
    elements.winModal.classList.add('active');
}

// 모달 닫기
function closeModal() {
    elements.winModal.classList.remove('active');
    elements.playerName.value = '';
}

// 점수 제출
async function submitScore() {
    const playerName = elements.playerName.value.trim();
    
    if (!playerName) {
        alert('닉네임을 입력해주세요!');
        return;
    }
    
    // 점수 저장
    const result = await saveScore(
        playerName,
        gameState.difficulty,
        gameState.timer,
        gameState.moves
    );
    
    if (result.success) {
        alert('점수가 저장되었습니다! 🎉');
        closeModal();
        // 리더보드 새로고침
        loadLeaderboard(document.querySelector('.filter-btn.active').dataset.filter);
    } else {
        if (result.error === 'Supabase not initialized') {
            alert('Supabase가 설정되지 않았습니다.\nconfig.js에서 Supabase 정보를 입력해주세요.');
        } else {
            alert('점수 저장에 실패했습니다: ' + result.error);
        }
    }
}

// 게임 리셋
function resetGame() {
    stopTimer();
    
    // UI 초기화
    elements.gameSetup.style.display = 'block';
    elements.gameInfo.style.display = 'none';
    elements.gameBoard.style.display = 'none';
    elements.gameBoard.innerHTML = '';
    
    // 상태 초기화
    gameState.isPlaying = false;
    gameState.timer = 0;
    gameState.moves = 0;
    gameState.matchedPairs = 0;
    gameState.flippedCards = [];
    gameState.cards = [];
}

// 리더보드 로드
async function loadLeaderboard(difficulty = 'all') {
    elements.leaderboardList.innerHTML = '<p class="loading">로딩 중...</p>';
    
    const result = await getLeaderboard(difficulty, 10);
    
    if (result.success && result.data.length > 0) {
        displayLeaderboard(result.data);
    } else {
        if (result.error === 'Supabase not initialized') {
            elements.leaderboardList.innerHTML = `
                <p class="loading" style="color: #fbbf24;">
                    ⚠️ Supabase 연결 실패<br>
                    <small>config.js에서 Supabase 설정을 확인하세요.</small>
                </p>
            `;
        } else {
            elements.leaderboardList.innerHTML = '<p class="loading">아직 기록이 없습니다.</p>';
        }
    }
}

// 리더보드 표시
function displayLeaderboard(scores) {
    elements.leaderboardList.innerHTML = '';
    
    scores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        const rank = score.rank || (index + 1);
        let rankClass = '';
        if (rank === 1) rankClass = 'gold';
        else if (rank === 2) rankClass = 'silver';
        else if (rank === 3) rankClass = 'bronze';
        
        const minutes = Math.floor(score.time_seconds / 60);
        const seconds = score.time_seconds % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const difficultyText = {
            'easy': '쉬움',
            'normal': '보통',
            'hard': '어려움'
        }[score.difficulty] || score.difficulty;
        
        item.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${rank}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${escapeHtml(score.username)}</div>
                <div class="leaderboard-difficulty">${difficultyText} | 점수: ${score.score}</div>
            </div>
            <div class="leaderboard-stats">
                <div class="leaderboard-time">${timeStr}</div>
                <div class="leaderboard-moves">${score.moves} 시도</div>
            </div>
        `;
        
        elements.leaderboardList.appendChild(item);
    });
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

