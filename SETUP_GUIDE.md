# 🚀 프로젝트 설정 가이드

이 가이드는 카드 뒤집기 게임을 로컬에서 실행하는 방법을 안내합니다.

## 📋 사전 요구사항

- 웹 브라우저 (Chrome, Firefox, Edge 등)
- Python 3.x 또는 Node.js (로컬 서버 실행용)
- Supabase 계정 (무료)

## 🔧 설치 단계

### 1. 저장소 클론

```bash
git clone https://github.com/kccho88/cardgame.git
cd cardgame
```

### 2. Supabase 설정

#### 2.1 Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 가입 및 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `cardgame` (또는 원하는 이름)
   - Database Password: 강력한 비밀번호 입력
   - Region: 가까운 지역 선택 (예: Seoul)
4. 프로젝트 생성 완료 대기 (1-2분)

#### 2.2 데이터베이스 테이블 생성

Supabase Dashboard > SQL Editor에서 다음 SQL 실행:

```sql
-- players 테이블 생성
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- game_scores 테이블 생성
CREATE TABLE game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    moves INTEGER NOT NULL CHECK (moves >= 0),
    time_seconds INTEGER NOT NULL CHECK (time_seconds >= 0),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'normal', 'hard')),
    cards_count INTEGER DEFAULT 16 CHECK (cards_count > 0),
    completed BOOLEAN DEFAULT true,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 인덱스 생성
CREATE INDEX idx_game_scores_player_id ON game_scores(player_id);
CREATE INDEX idx_game_scores_difficulty ON game_scores(difficulty);
CREATE INDEX idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX idx_game_scores_played_at ON game_scores(played_at DESC);

-- RLS 활성화
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "플레이어 정보는 모두가 볼 수 있음" 
ON players FOR SELECT USING (true);

CREATE POLICY "인증된 사용자는 플레이어를 생성할 수 있음" 
ON players FOR INSERT 
WITH CHECK ((role() = 'authenticated'::text) OR (role() = 'anon'::text));

CREATE POLICY "게임 점수는 모두가 볼 수 있음" 
ON game_scores FOR SELECT USING (true);

CREATE POLICY "인증된 사용자는 점수를 기록할 수 있음" 
ON game_scores FOR INSERT 
WITH CHECK ((role() = 'authenticated'::text) OR (role() = 'anon'::text));

-- 리더보드 뷰 생성
CREATE VIEW leaderboard AS
SELECT 
    p.username,
    gs.score,
    gs.moves,
    gs.time_seconds,
    gs.difficulty,
    gs.cards_count,
    gs.played_at,
    ROW_NUMBER() OVER (PARTITION BY gs.difficulty ORDER BY gs.score DESC, gs.time_seconds ASC) as rank
FROM game_scores gs
JOIN players p ON gs.player_id = p.id
WHERE gs.completed = true
ORDER BY gs.difficulty, rank;
```

#### 2.3 API 키 확인

1. Supabase Dashboard > Project Settings > API
2. 다음 정보 복사:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 설정 파일 생성

#### 3.1 config.js 파일 생성

```bash
# Windows (PowerShell)
Copy-Item js/config.example.js js/config.js

# macOS/Linux
cp js/config.example.js js/config.js
```

#### 3.2 config.js 파일 수정

`js/config.js` 파일을 열고 Supabase 정보 입력:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',  // 여기에 Project URL 입력
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // 여기에 anon key 입력
};
```

⚠️ **중요**: `js/config.js` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### 4. 로컬 서버 실행

#### Python 사용

```bash
# Python 3
python -m http.server 8000
```

#### Node.js 사용

```bash
# http-server 설치 (최초 1회)
npm install -g http-server

# 서버 실행
http-server -p 8000
```

#### VS Code Live Server 사용

1. VS Code에서 "Live Server" 확장 설치
2. `index.html` 파일에서 우클릭
3. "Open with Live Server" 선택

### 5. 브라우저에서 접속

```
http://localhost:8000
```

## ✅ 설치 확인

브라우저 개발자 도구 (F12) > Console에서 다음 메시지 확인:

```
Supabase 클라이언트 초기화 완료
리더보드 조회 성공
```

## 🎮 게임 플레이

1. 난이도 선택 (쉬움/보통/어려움)
2. "게임 시작" 클릭
3. 카드를 클릭하여 매칭
4. 게임 완료 후 닉네임 입력
5. 리더보드에서 순위 확인

## 🔒 보안 주의사항

### ✅ 안전한 것

- `anon` 키를 프론트엔드에서 사용 (RLS로 보호됨)
- `config.example.js`를 GitHub에 커밋

### ❌ 절대 하지 말 것

- `service_role` 키를 프론트엔드에 노출
- `js/config.js` 파일을 GitHub에 커밋
- 데이터베이스 비밀번호를 코드에 포함

## 🐛 문제 해결

### "Supabase 연결 실패" 오류

1. `js/config.js` 파일이 존재하는지 확인
2. Supabase URL과 anon key가 올바른지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 점수가 저장되지 않음

1. Supabase RLS 정책이 올바르게 설정되었는지 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. Supabase Dashboard > Table Editor에서 데이터 확인

### 리더보드가 표시되지 않음

1. `leaderboard` 뷰가 생성되었는지 확인
2. 테스트 데이터가 있는지 확인
3. 난이도 필터가 올바른지 확인

## 📚 추가 문서

- [README.md](README.md) - 프로젝트 개요
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Supabase 상세 설정 가이드

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 📧 문의

문제가 있으시면 GitHub Issues에 등록해주세요.

---

**즐거운 게임 되세요! 🎉**

