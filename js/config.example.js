// Supabase 설정 (예시 파일)
// 이 파일을 복사하여 config.js로 저장하고 실제 값을 입력하세요
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // 예: 'https://xyzcompany.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Supabase 프로젝트의 anon/public key
};

// 게임 설정
const GAME_CONFIG = {
    cardEmojis: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻', '🎼', '🎵', '🎶', '⚽', '🏀', '🏈', '⚾'],
    flipDelay: 1000, // 카드가 다시 뒤집히는 시간 (밀리초)
    matchDelay: 500  // 매칭 성공 후 대기 시간 (밀리초)
};

