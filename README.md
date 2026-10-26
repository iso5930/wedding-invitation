# 모바일 청첩장

React + TypeScript + Vite 기반의 모바일 청첩장입니다. 현재 단계는 이미지·게임 장식 없이 배치와 클릭 동작을 확인하는 와이어프레임입니다.

## 와이어프레임 확인

- 첫 화면 → 초대의 글 → 예식 안내 → 사진첩 → 오시는 길 → 마음 전하기 → 마지막 인사
- 상단 전체 메뉴, 450ms 섹션 이동, 연락처 바텀시트
- 사진 자리표시자 8개: 더 보기/접기, 전체 화면 확대, 좌우 스와이프·방향키
- 교통·계좌 아코디언, 주소·링크 복사 및 실패 시 수동 복사 창
- 팝업 뒤로가기·앞으로가기, Esc/배경 닫기, 스크롤·키보드 포커스 복원
- `prefers-reduced-motion`에 맞춘 전환 생략

확정 정보는 `src/data/wedding.ts`에서 관리합니다. 라비니움과 서울특별시 송파구 천호대로 996 주소를 반영했고, 지도 버튼은 해당 장소 검색 링크를 새 창으로 엽니다. 지도 삽입 영역은 회색 박스로 표시합니다.

이름·예식 시간·홀·연락처·계좌는 안내 예정입니다. 미등록 전화·문자·계좌 복사 버튼은 비활성화됩니다. 실제 사진이 없는 사진첩과 미등록 계좌는 **배치 검토를 위해 이 와이어프레임에서 표시**합니다. 실제 공개 버전에서는 확정 정보를 입력하고 빈 영역을 숨기는 작업이 필요합니다. 참석 응답·방명록 저장 기능은 포함하지 않습니다.

자세한 화면·동작 명세: [기획서](docs/layout-interaction-plan.md)

완료·예정 작업: [작업 목록](docs/work-list.md)

## 실행

Node.js 24 LTS와 npm을 권장합니다 (최소 Node.js 22.12).

```sh
npm ci
npm run dev
```

개발 서버: http://localhost:5173/wedding-invitation/

```sh
npm run typecheck
npm run build
npm run preview
```

- `build`: TypeScript 검사 후 `dist/`에 배포용 파일 생성
- `preview`: http://localhost:4173/wedding-invitation/ 에서 빌드 결과 확인
- `package-lock.json`을 커밋하여 `npm ci`로 동일한 의존성 설치

## 브라우저 테스트

```sh
npx playwright install chromium
npm run test:ui
```

390px 모바일·1280px 데스크톱 프로젝트로 탐색, 팝업 이력, 포커스 복원, 사진 뷰어, 클립보드 성공·실패, 미확정 상태, 반응형과 한국 시간 날짜 계산을 검증합니다. 테스트 중 320·390·430·1280px 너비도 검사합니다.

설치된 Chrome으로 검사하려면 PowerShell에서 다음과 같이 실행할 수 있습니다.

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:ui
```

`.github/workflows/check.yml`은 PR과 `main` push에서 빌드와 Chromium 테스트를 실행합니다. 화면 폭 검증은 브라우저 에뮬레이션이며 실제 iOS·Android 기기 검수는 후속 단계입니다.

## 구조

```text
public/
  images/          # 정적 이미지 (.gitkeep으로 빈 디렉터리 유지)
src/
  components/      # Section, Accordion, Overlay
  data/            # 예식 정보와 메뉴 항목
  hooks/           # 섹션 이동과 팝업의 History 관리
  lib/             # 한국 시간 기준 날짜 계산
  App.tsx          # 와이어프레임 본문과 버튼 연결
  main.tsx         # React 진입점
  index.css        # 흑백 레이아웃과 전환 효과
index.html         # 한국어 문서, 모바일 viewport
vite.config.ts     # React 플러그인과 배포 base 경로
tsconfig.json      # 앱 및 Vite 설정의 TypeScript 검사
```

화면은 모바일에서 전체 너비를 사용하며 큰 화면에서는 최대 너비를 제한합니다. 이미지와 영상은 부모 너비를 넘지 않도록 설정했습니다.

## GitHub Pages 준비

`vite.config.ts`의 기본 `base`는 `/wedding-invitation/`입니다. 이 값은 `https://iso5930.github.io/wedding-invitation/` 배포 경로를 기준으로 합니다.

저장소 이름이 바뀌거나 사용자 지정 도메인을 사용하면 `.env.example`을 `.env.local`로 복사하고 수정한 뒤 다시 빌드합니다.

```dotenv
# 프로젝트 저장소: /저장소이름/
VITE_BASE_PATH=/wedding-invitation/
# 사용자 지정 도메인 또는 사용자.github.io 저장소에서는 / 사용
```

`public/images` 파일은 하위 경로 배포에서도 동작하도록 다음처럼 참조합니다.

```tsx
<img src={`${import.meta.env.BASE_URL}images/photo.jpg`} alt="사진 설명" />
```

배포 주소: https://iso5930.github.io/wedding-invitation/

`.github/workflows/deploy.yml`은 `main`에 push할 때마다 Node.js 24 환경에서 `npm ci` → `npm run build`를 실행하고, `dist/`를 GitHub Pages 아티팩트로 업로드하여 배포합니다. Actions 탭의 **Deploy to GitHub Pages → Run workflow**에서도 수동 실행할 수 있습니다.

GitHub 저장소의 Settings → Pages → Build and deployment → Source는 **GitHub Actions**를 사용합니다. 소스 파일을 그대로 게시하는 브랜치 배포 방식은 Vite의 TSX 파일을 실행할 수 없으므로 빌드 결과물을 배포해야 합니다.

[Vite 공식 GitHub Pages 배포 가이드](https://vite.dev/guide/static-deploy.html#github-pages)
