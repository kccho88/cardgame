# 🎴 카드 뒤집기 게임

간단한 웹 기술로 만든 메모리 카드 매칭 게임입니다. 같은 카드를 찾아 모든 쌍을 매칭하세요!

## ✨ 주요 기능

- 🎯 **3가지 난이도**: 쉬움(4x3), 보통(4x4), 어려움(5x4)
- ⏱️ **타이머 & 시도 횟수 추적**: 게임 진행 상황 실시간 표시
- 🎨 **아름다운 카드 애니메이션**: 부드러운 flip 효과
- 🏆 **리더보드**: Supabase를 활용한 점수 저장 및 순위 표시
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 🛠 기술 스택

- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **데이터베이스**: Supabase (PostgreSQL)
- **배포**: 정적 호스팅 (Netlify, Vercel, GitHub Pages 등)

## 📦 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd card-game
```

### 2. Supabase 설정 파일 생성

#### 2.1 config.js 파일 생성

```bash
# Windows (PowerShell)
Copy-Item js/config.example.js js/config.js

# macOS/Linux
cp js/config.example.js js/config.js
```

#### 2.2 Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입 및 로그인
2. 새 프로젝트 생성
3. 프로젝트 URL과 anon key 복사

#### 2.3 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 SQL을 실행하세요:

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

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_game_scores_difficulty_time 
ON game_scores(difficulty, time_seconds);

-- RLS (Row Level Security) 활성화
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view scores" 
ON game_scores FOR SELECT 
USING (true);

-- 모든 사용자가 삽입 가능
CREATE POLICY "Anyone can insert scores" 
ON game_scores FOR INSERT 
WITH CHECK (true);
```

#### 2.4 설정 파일 수정

`js/config.js` 파일을 열고 Supabase 정보를 입력하세요:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',  // 여러분의 Supabase URL
    anonKey: 'your-anon-key'  // 여러분의 Supabase anon key
};
```

⚠️ **중요**: `js/config.js` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### 3. 실행

브라우저에서 `index.html` 파일을 열거나, 로컬 서버를 실행하세요:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 설치 필요)
npx http-server

# VS Code Live Server 확장 사용
```

브라우저에서 `http://localhost:8000` 접속

## 🎮 게임 방법

1. **난이도 선택**: 쉬움, 보통, 어려움 중 선택
2. **게임 시작**: "게임 시작" 버튼 클릭
3. **카드 뒤집기**: 카드를 클릭하여 2장씩 뒤집기
4. **매칭**: 같은 이모지를 찾아 모든 쌍을 매칭
5. **점수 저장**: 게임 완료 후 닉네임 입력하여 점수 저장
6. **리더보드 확인**: 상위 랭커들과 비교

## 📁 프로젝트 구조

```
card-game/
├── index.html              # 메인 HTML 파일
├── css/
│   └── style.css          # 스타일 및 애니메이션
├── js/
│   ├── config.js          # 게임 및 Supabase 설정
│   ├── supabase.js        # Supabase 연동 함수
│   └── game.js            # 게임 로직
├── assets/                # 리소스 폴더 (선택적)
└── README.md              # 프로젝트 문서
```

## 🎨 커스터마이징

### 카드 이모지 변경

`js/config.js`에서 `cardEmojis` 배열을 수정하세요:

```javascript
const GAME_CONFIG = {
    cardEmojis: ['🐶', '🐱', '🐭', '🐹', '🐰', ...],
    // ...
};
```

### 색상 테마 변경

`css/style.css`의 `:root` 변수를 수정하세요:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... */
}
```

### 타이밍 조정

`js/config.js`에서 딜레이 시간을 조정하세요:

```javascript
const GAME_CONFIG = {
    flipDelay: 1000,  // 카드가 다시 뒤집히는 시간
    matchDelay: 500   // 매칭 확인 대기 시간
};
```

## 🚀 배포

### Netlify

1. [Netlify](https://netlify.com)에 가입
2. "New site from Git" 클릭
3. 저장소 연결 및 배포

### Vercel

1. [Vercel](https://vercel.com)에 가입
2. "New Project" 클릭
3. 저장소 연결 및 배포

### GitHub Pages

```bash
# gh-pages 브랜치에 배포
git checkout -b gh-pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

Settings > Pages에서 gh-pages 브랜치 선택

## 🔒 보안 고려사항

- Supabase의 **anon key**는 공개되어도 안전합니다 (RLS 정책으로 보호)
- **service_role key**는 절대 프론트엔드에 노출하지 마세요
- RLS 정책을 통해 데이터베이스 접근 제어
- 사용자 입력은 HTML 이스케이프 처리됨 (XSS 방지)

## 📝 라이선스

MIT License

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 📧 문의

문제가 있으시면 이슈를 등록해주세요.

---

**즐거운 게임 되세요! 🎉**

