// Supabase 클라이언트 초기화
let supabaseClient = null;

function initSupabase() {
    try {
        // Supabase 클라이언트 생성
        const { createClient } = supabase;
        supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('Supabase 클라이언트 초기화 완료');
        return true;
    } catch (error) {
        console.error('Supabase 초기화 실패:', error);
        return false;
    }
}

// 점수 저장 함수
async function saveScore(playerName, difficulty, timeSeconds, moves) {
    try {
        if (!supabaseClient) {
            console.warn('Supabase가 초기화되지 않았습니다.');
            return { success: false, error: 'Supabase not initialized' };
        }

        // 난이도 매핑 (easy/medium/hard -> easy/normal/hard)
        const difficultyMap = {
            'easy': 'easy',
            'medium': 'normal',
            'hard': 'hard'
        };
        const mappedDifficulty = difficultyMap[difficulty] || 'normal';

        // 1. 먼저 플레이어 확인/생성
        let playerId = null;
        
        // 플레이어 조회
        const { data: existingPlayer, error: playerSelectError } = await supabaseClient
            .from('players')
            .select('id')
            .eq('username', playerName)
            .single();

        if (existingPlayer) {
            playerId = existingPlayer.id;
        } else {
            // 플레이어가 없으면 생성
            const { data: newPlayer, error: playerInsertError } = await supabaseClient
                .from('players')
                .insert([{ username: playerName }])
                .select('id')
                .single();

            if (playerInsertError) {
                console.error('플레이어 생성 실패:', playerInsertError);
                return { success: false, error: playerInsertError.message };
            }
            playerId = newPlayer.id;
        }

        // 2. 점수 계산 (시간이 짧을수록 높은 점수)
        const score = Math.max(0, 10000 - (timeSeconds * 10) - (moves * 50));

        // 3. 게임 점수 저장
        const { data, error } = await supabaseClient
            .from('game_scores')
            .insert([
                {
                    player_id: playerId,
                    score: score,
                    moves: moves,
                    time_seconds: timeSeconds,
                    difficulty: mappedDifficulty,
                    completed: true
                }
            ])
            .select();

        if (error) {
            console.error('점수 저장 실패:', error);
            return { success: false, error: error.message };
        }

        console.log('점수 저장 성공:', data);
        return { success: true, data: data };
    } catch (error) {
        console.error('점수 저장 중 오류:', error);
        return { success: false, error: error.message };
    }
}

// 리더보드 조회 함수
async function getLeaderboard(difficulty = 'all', limit = 10) {
    try {
        if (!supabaseClient) {
            console.warn('Supabase가 초기화되지 않았습니다.');
            return { success: false, error: 'Supabase not initialized', data: [] };
        }

        // 난이도 매핑
        const difficultyMap = {
            'easy': 'easy',
            'medium': 'normal',
            'hard': 'hard',
            'all': 'all'
        };
        const mappedDifficulty = difficultyMap[difficulty] || 'all';

        // leaderboard 뷰 사용 (이미 player 정보와 조인되어 있음)
        let query = supabaseClient
            .from('leaderboard')
            .select('*')
            .limit(limit);

        // 난이도 필터링
        if (mappedDifficulty !== 'all') {
            query = query.eq('difficulty', mappedDifficulty);
        }

        const { data, error } = await query;

        if (error) {
            console.error('리더보드 조회 실패:', error);
            return { success: false, error: error.message, data: [] };
        }

        console.log('리더보드 조회 성공:', data);
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('리더보드 조회 중 오류:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// 페이지 로드 시 Supabase 초기화
document.addEventListener('DOMContentLoaded', () => {
    const initialized = initSupabase();
    if (initialized) {
        // 초기 리더보드 로드
        loadLeaderboard('all');
    } else {
        // Supabase 초기화 실패 시 안내 메시지
        const leaderboardList = document.getElementById('leaderboardList');
        if (leaderboardList) {
            leaderboardList.innerHTML = `
                <p class="loading" style="color: #fbbf24;">
                    ⚠️ Supabase 연결 실패<br>
                    <small>config.js에서 Supabase 설정을 확인하세요.</small>
                </p>
            `;
        }
    }
});

