# 🗄️ Supabase 설정 가이드

이 문서는 카드 뒤집기 게임을 위한 Supabase 데이터베이스 설정 방법을 안내합니다.

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [데이터베이스 테이블 생성](#2-데이터베이스-테이블-생성)
3. [Row Level Security (RLS) 설정](#3-row-level-security-rls-설정)
4. [API 키 확인](#4-api-키-확인)
5. [프로젝트에 연동](#5-프로젝트에-연동)

## 1. Supabase 프로젝트 생성

### 1.1 회원가입 및 로그인

1. [Supabase](https://supabase.com) 웹사이트 방문
2. "Start your project" 클릭하여 회원가입
3. GitHub, Google 등으로 간편 로그인 가능

### 1.2 새 프로젝트 생성

1. 대시보드에서 "New Project" 클릭
2. 프로젝트 정보 입력:
   - **Name**: card-game (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 입력 (저장 필수!)
   - **Region**: 가까운 지역 선택 (예: Northeast Asia - Seoul)
   - **Pricing Plan**: Free 선택
3. "Create new project" 클릭
4. 프로젝트 생성 완료까지 1-2분 대기

## 2. 데이터베이스 테이블 생성

### 2.1 SQL Editor 열기

1. 왼쪽 사이드바에서 **"SQL Editor"** 클릭
2. "New query" 클릭

### 2.2 테이블 생성 SQL 실행

아래 SQL을 복사하여 붙여넣고 "Run" 클릭:

```sql
-- game_scores 테이블 생성
CREATE TABLE game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    time_seconds INTEGER NOT NULL,
    moves INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (리더보드 조회 성능 최적화)
CREATE INDEX idx_game_scores_difficulty_time 
ON game_scores(difficulty, time_seconds);

-- 인덱스 생성 (최신 기록 조회 최적화)
CREATE INDEX idx_game_scores_created_at 
ON game_scores(created_at DESC);
```

### 2.3 테이블 확인

1. 왼쪽 사이드바에서 **"Table Editor"** 클릭
2. `game_scores` 테이블이 생성되었는지 확인
3. 테이블 구조:
   - `id`: UUID (자동 생성)
   - `player_name`: 플레이어 닉네임 (최대 50자)
   - `difficulty`: 난이도 (easy, medium, hard)
   - `time_seconds`: 완료 시간 (초 단위)
   - `moves`: 시도 횟수
   - `created_at`: 기록 생성 시간 (자동)

## 3. Row Level Security (RLS) 설정

RLS는 데이터베이스 보안을 위한 필수 설정입니다.

### 3.1 RLS 활성화 및 정책 생성

SQL Editor에서 다음 SQL 실행:

```sql
-- RLS (Row Level Security) 활성화
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 사용자가 점수를 조회할 수 있음 (리더보드)
CREATE POLICY "Anyone can view scores" 
ON game_scores 
FOR SELECT 
USING (true);

-- 정책 2: 모든 사용자가 점수를 삽입할 수 있음 (게임 완료 시)
CREATE POLICY "Anyone can insert scores" 
ON game_scores 
FOR INSERT 
WITH CHECK (true);

-- 정책 3: 점수 수정 및 삭제 금지 (점수 조작 방지)
-- UPDATE와 DELETE 정책은 생성하지 않음
```

### 3.2 RLS 정책 확인

1. Table Editor에서 `game_scores` 테이블 선택
2. 상단의 "RLS" 탭 클릭
3. 다음 정책들이 활성화되어 있는지 확인:
   - ✅ "Anyone can view scores" (SELECT)
   - ✅ "Anyone can insert scores" (INSERT)

## 4. API 키 확인

### 4.1 프로젝트 설정 열기

1. 왼쪽 사이드바 하단의 **"Project Settings"** (톱니바퀴 아이콘) 클릭
2. "API" 메뉴 선택

### 4.2 필요한 정보 복사

다음 두 가지 정보를 복사하여 안전하게 보관:

1. **Project URL**
   ```
   https://xyzcompany.supabase.co
   ```

2. **anon public key** (API Keys 섹션에서)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **주의**: 
- `anon` key는 프론트엔드에서 사용해도 안전합니다 (RLS로 보호됨)
- `service_role` key는 **절대** 프론트엔드에 노출하지 마세요!

## 5. 프로젝트에 연동

### 5.1 config.js 파일 수정

프로젝트의 `js/config.js` 파일을 열고 복사한 정보를 입력:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xyzcompany.supabase.co',  // 여러분의 Project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // 여러분의 anon key
};
```

### 5.2 연결 테스트

1. 브라우저에서 `index.html` 파일 열기
2. 개발자 도구 (F12) 열기
3. Console 탭에서 다음 메시지 확인:
   ```
   Supabase 클라이언트 초기화 완료
   ```
4. 리더보드 섹션에 "리더보드를 불러오는 중..." 또는 "아직 기록이 없습니다." 메시지 확인

## 🎮 테스트

### 테스트 데이터 삽입

SQL Editor에서 테스트 데이터를 삽입하여 리더보드를 확인할 수 있습니다:

```sql
INSERT INTO game_scores (player_name, difficulty, time_seconds, moves)
VALUES 
    ('테스트1', 'easy', 45, 20),
    ('테스트2', 'medium', 120, 35),
    ('테스트3', 'hard', 180, 50),
    ('테스트4', 'medium', 95, 28),
    ('테스트5', 'easy', 38, 18);
```

웹 페이지를 새로고침하면 리더보드에 테스트 데이터가 표시됩니다.

## 🔍 문제 해결

### 연결 실패 시

1. **URL 확인**: `https://`로 시작하는지 확인
2. **Key 확인**: anon key 전체가 복사되었는지 확인
3. **RLS 확인**: RLS 정책이 올바르게 설정되었는지 확인
4. **브라우저 콘솔**: 에러 메시지 확인

### 점수 저장 실패 시

1. **RLS 정책 확인**: INSERT 정책이 활성화되어 있는지 확인
2. **테이블 구조 확인**: 모든 컬럼이 올바르게 생성되었는지 확인
3. **네트워크 탭**: API 요청이 전송되는지 확인

### 리더보드가 표시되지 않을 때

1. **데이터 확인**: Table Editor에서 데이터가 있는지 확인
2. **SELECT 정책 확인**: "Anyone can view scores" 정책이 활성화되어 있는지 확인
3. **필터 확인**: 리더보드 필터가 올바른 난이도로 설정되어 있는지 확인

## 📊 데이터베이스 관리

### 데이터 조회

```sql
-- 모든 점수 조회
SELECT * FROM game_scores ORDER BY created_at DESC;

-- 난이도별 상위 10개
SELECT * FROM game_scores 
WHERE difficulty = 'medium' 
ORDER BY time_seconds ASC, moves ASC 
LIMIT 10;

-- 플레이어별 최고 기록
SELECT player_name, MIN(time_seconds) as best_time
FROM game_scores
WHERE difficulty = 'medium'
GROUP BY player_name
ORDER BY best_time ASC;
```

### 데이터 삭제

```sql
-- 테스트 데이터 삭제
DELETE FROM game_scores WHERE player_name LIKE '테스트%';

-- 모든 데이터 삭제 (주의!)
TRUNCATE game_scores;
```

## 🚀 고급 기능 (선택사항)

### 자동 삭제 정책 (오래된 기록 삭제)

30일 이상 된 기록을 자동으로 삭제:

```sql
-- 함수 생성
CREATE OR REPLACE FUNCTION delete_old_scores()
RETURNS void AS $$
BEGIN
    DELETE FROM game_scores 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 매일 자동 실행 (Supabase Dashboard > Database > Cron Jobs)
SELECT cron.schedule(
    'delete-old-scores',
    '0 0 * * *',  -- 매일 자정
    'SELECT delete_old_scores();'
);
```

### 통계 뷰 생성

```sql
-- 게임 통계 뷰
CREATE VIEW game_statistics AS
SELECT 
    difficulty,
    COUNT(*) as total_games,
    AVG(time_seconds) as avg_time,
    MIN(time_seconds) as best_time,
    AVG(moves) as avg_moves
FROM game_scores
GROUP BY difficulty;

-- 조회
SELECT * FROM game_statistics;
```

## 📚 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

설정이 완료되었습니다! 이제 게임을 즐기세요! 🎉

