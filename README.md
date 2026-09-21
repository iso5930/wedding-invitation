# 모바일 청첩장

React + TypeScript + Vite 기반의 기본 프로젝트 골격입니다. 기존 제목과 날짜만 유지하며, 실제 청첩장 디자인은 추후 구현합니다.

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

## 구조

```text
public/
  images/          # 정적 이미지 (.gitkeep으로 빈 디렉터리 유지)
src/
  components/      # 재사용할 React 컴포넌트
  App.tsx          # 기본 화면
  main.tsx         # React 진입점
  index.css        # 모바일 우선 공통 스타일
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

실제 배포 시 GitHub 저장소의 Settings → Pages → Source에서 GitHub Actions를 선택하고, 워크플로에서 Node.js 설정 → `npm ci` → `npm run build` → `dist/` 아티팩트 업로드 및 Pages 배포 단계를 구성합니다. 현재 단계에서는 기본 골격만 생성하며 배포 워크플로 및 실제 배포는 포함하지 않습니다.

[Vite 공식 GitHub Pages 배포 가이드](https://vite.dev/guide/static-deploy.html#github-pages)
