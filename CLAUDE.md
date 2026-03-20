# CLAUDE.md — SCOOPS GELATO 프로젝트 완전 가이드

> 이 파일은 Claude Code가 프로젝트의 전체 맥락을 이해하고 즉시 작업할 수 있게 하는 "프로젝트 기억장치"다.
> 세션을 시작할 때 이 파일만 읽으면 된다.

---

## 세션 시작 시 반드시 할 일

1. **이 파일을 처음부터 끝까지 읽어서** 프로젝트 전체 상황을 파악한다
2. `git pull origin main` 으로 최신 코드를 당긴다
3. `npm install` 이 안 되어 있으면 먼저 설치한다
4. 작업 전 `git status` 로 현재 상태를 확인한다
5. 코드를 수정할 파일은 반드시 먼저 읽고 현재 상태를 파악한 후 수정한다

---

## 브랜드 정보

- **상호**: 스쿱스 젤라떼리아 (SCOOPS GELATERIA)
- **대표**: 정석주
- **대표번호**: 1811-0259
- **본사**: 충북 청주시 서원구 1순환로 672번길 35, 1층
- **인스타그램**: @_scoopsgelato_
- **Gmail**: scoopsgelato10@gmail.com
- **도메인**: scoopsgelato.kr
- **관리자 페이지**: scoopsgelato.kr/admin (ID: `scoopsgelato` / PW: `scoops8893!`)

---

## 기술 스택

| 항목 | 값 |
|------|-----|
| 프레임워크 | Next.js 16.1.6 (App Router) |
| 언어 | TypeScript 5, React 19 |
| 스타일 | Tailwind CSS 4 (globals.css에 커스텀 변수) |
| 애니메이션 | Framer Motion |
| 아이콘 | Lucide React |
| 호스팅 | Vercel (서울 리전 `icn1`) |
| DB | Supabase PostgreSQL (ap-southeast-2 Sydney) |
| Supabase 클라이언트 | 경량 REST 클라이언트 (`src/lib/supabase-client.ts`) — npm 패키지 없이 fetch 기반 |
| GitHub | `rjrjtjek-ctrl/scoops-gelato` |

### 환경변수 (Vercel에 설정됨)

```
NEXT_PUBLIC_SUPABASE_URL=https://yjsudpiedxacuejruuiv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_aB7rXyB9TO2srgsuLAp03g_9llLDqfU
```

### Supabase RPC 함수

DB 쿼리를 최적화하기 위해 PostgreSQL RPC 함수를 사용한다:
- `create_order_with_items` — 주문 생성 + 아이템 삽입을 1번의 DB 호출로 처리
- `get_orders_with_items` — 주문 목록 + 아이템을 1번의 DB 호출로 조회

### Supabase REST 클라이언트 (`src/lib/supabase-client.ts`)

supabase-js 패키지 대신 경량 fetch 클라이언트를 직접 구현:
- `supabaseSelect(table, query)` — SELECT
- `supabaseInsert(table, data)` — INSERT
- `supabaseUpdate(table, data, query)` — UPDATE
- `supabaseDelete(table, query)` — DELETE
- `supabaseRpc(fn, params)` — PostgreSQL RPC 호출
- `Connection: keep-alive` 헤더로 연결 재사용

---

## 배포 방법

### 방법 1: Git push → Vercel 자동 배포 (권장)

```bash
git add -A
git commit -m "변경 내용 설명"
git push origin main
```

Vercel이 GitHub push를 감지하여 자동으로 빌드 & 배포한다.

### 방법 2: Vercel CLI 직접 배포

```bash
vercel deploy --prod --yes --token "$VERCEL_TOKEN"
```

### 방법 3: deploy.py 스크립트 (Cowork 세션용)

프로젝트 루트 상위에 `deploy.py`가 있다. Vercel REST API를 통해 소스 파일을 직접 업로드하고 배포한다.
**Claude Code 터미널에서는 방법 1 또는 2를 사용할 것.**

### Git 설정

```bash
git config user.name "yeogidae"
git config user.email "yeogidae.official@gmail.com"
```

- GitHub PAT, Vercel Token, Vercel Project ID는 환경변수 또는 CEO에게 직접 확인
- 토큰을 코드/문서에 하드코딩하지 말 것 (GitHub Push Protection에 의해 push 차단됨)

---

## 디자인 가이드

### 컬러 시스템 (globals.css 정의)

```
--brand-primary: #1B4332    (딥 포레스트 그린 — 메인)
--brand-secondary: #A68B5B  (골드 — 포인트)
--brand-accent: #2D6A4F     (밝은 그린)
--bg-cream: #F5F0EB         (크림 배경)
--bg-white: #FDFBF8         (화이트 배경)
--bg-warm: #EDE6DD          (웜 베이지 배경)
--text-dark: #2A2A2A
--text-body: #555555
--text-light: #999999
```

### 디자인 원칙

- **벤치마크**: tenpercentcoffee.com
- 따뜻한 크림/베이지 톤 유지
- 라운드 이미지 (rounded-2xl, rounded-full)
- 넉넉한 여백 (section-padding)
- **표준 폰트**: IBM Plex Sans(영문) + IBM Plex Sans KR(한글) — 전사 통일

---

## 사이트 구조

### 메인 사이트 (28개 라우트)

| 카테고리 | 서브메뉴 | 라우트 |
|---------|---------|--------|
| SCOOPS | 스쿱스젤라또 소개 | /story |
| | 브랜드 스토리 | /story/brand |
| | 찾아오시는길 | /story/location |
| MENU | 시그니처 젤라또 | /menu |
| | 소르베또 | /menu/sorbetto |
| | 커피 | /menu/coffee |
| | 디저트 | /menu/dessert |
| FRANCHISE | 스쿱스 경쟁력 | /franchise |
| | 가맹점 상담신청 | /franchise/inquiry |
| | 가맹점 개설절차 | /franchise/process |
| | 가맹점 개설비용 | /franchise/cost |
| | 가맹문의 Q&A | /franchise/faq |
| | 업종변환 | /franchise/conversion |
| STORE | 매장 찾기 | /stores |
| NEWS | 스쿱스 소식 | /news |
| CUSTOMER | 고객의 소리 | /customer |

### QR 모바일 주문 시스템 (`/order`)

| 라우트 | 기능 |
|--------|------|
| /order | 매장 선택 |
| /order/[storeCode] | 매장식사/포장 선택 → 메뉴 화면 |
| /order/[storeCode]/cart | 장바구니 (Optimistic UI) |
| /order/[storeCode]/complete | 주문 완료 (현재 미사용, cart에서 인라인 처리) |

### 관리자 시스템 (`/admin`)

| 라우트 | 기능 |
|--------|------|
| /admin | 대시보드 |
| /admin/orders | 실시간 주문 관리 + 자동 영수증 인쇄 |
| /admin/orders/history | 주문 이력 + CSV 다운로드 |
| /admin/orders/analytics | 분석 대시보드 |
| /admin/qr | QR 코드 생성/관리 |
| /admin/printer-test | 프린터 테스트 페이지 |
| /admin/inquiries | 가맹문의 관리 |

### API 라우트

| API | 메서드 | 기능 |
|-----|--------|------|
| /api/order | POST | 주문 생성 (서버 금액 재계산, rate limiting) |
| /api/order | GET | 주문 조회 (storeId 또는 orderId) |
| /api/order | PATCH | 주문 상태/결제 상태 변경 |
| /api/order | DELETE | 주문 삭제 |
| /api/admin | GET/POST/DELETE | 인증 |
| /api/franchise | GET/POST/PATCH | 가맹문의 |
| /api/tracking | GET/POST | 추적 이벤트 |
| /api/pwa-install | GET/POST | PWA 설치 통계 |

---

## 주요 컴포넌트

### Header.tsx
- 6카테고리 메가 드롭다운 메뉴
- 로고(심볼만) + 6등분 그리드 nav + 가맹문의 CTA 버튼
- 모바일: 햄버거 → 풀스크린 오버레이 메뉴

### LayoutShell.tsx (= ConditionalLayout)
- `/admin`과 `/order` 경로에서는 Header/Footer 숨김
- 일반 페이지만 Header + Footer + FloatingButtons + ScrollToTop 표시

### cart-context.tsx (장바구니)
- sessionStorage에 저장 (새로고침 유지)
- 매장 전환 시 자동 초기화 (STORE_KEY 비교)
- 주류 수량 합산 로직 포함

### supabase-order.ts (데이터 소스 스위칭)
- Supabase 환경변수가 있으면 → Supabase RPC 사용
- 없으면 → 인메모리 fallback (콜드스타트 시 리셋됨)
- `getOrderDataSource()` 함수로 자동 판단

---

## QR 모바일 주문 시스템 상세

### 주문 플로우
1. QR 스캔 → `/order/[storeCode]` 접속
2. 매장식사 / 포장 선택
   - 매장식사 → 젤라또·소르베또 + 주류(위스키/와인/리큐르) 전체 메뉴
   - 포장 → 젤라또·소르베또만 표시
3. 젤라또: 1~6가지맛 선택 → 맛 선택 → 장바구니 추가
4. 주류: 스크롤하면 젤라또 아래에 자연스럽게 보임
5. 장바구니 → **Optimistic UI로 즉시 영수증 표시** (6ms) → 백그라운드 API 호출

### 메뉴판 UX 절대 규칙
- **토글 방식**: 같은 옵션 다시 누르면 선택 해제(접힘). 다른 옵션 누르면 전환.
- **선택식 아코디언**: 아이템 클릭해야 옵션/수량이 나옴. 미선택 아이템은 이름만 보임.
- 주류 서브탭(위스키/와인/리큐르)도 토글 방식

### 연령 확인
- 주류 메뉴 **구경은 자유** (연령 확인 없이 볼 수 있음)
- **"담기" 버튼 클릭 시에만** 연령 확인 팝업 표시
- 한 번 확인하면 세션 내 재확인 없음

### Optimistic UI (카트 페이지)
- 주문 버튼 클릭 즉시 `setOrderComplete({ orderNumber: "...", confirmed: false })` → 영수증 화면 표시
- 장바구니 즉시 클리어
- 백그라운드에서 API POST → 성공 시 실제 주문번호로 업데이트
- 실패 시 3회 재시도, 최종 실패해도 영수증 화면은 유지 + 에러 메시지

---

## 관리자 주문 대시보드 (`/admin/orders/page.tsx`)

### 핵심 동작
1. **700ms 폴링**으로 새 주문 감지
2. 새 pending 주문 발견 → 알림 소리 + 자동 confirmed 처리
3. **자동 영수증 인쇄**: 팝업 1개에 주방용+손님용 2장을 CSS `page-break-after: always`로 분리 → print() 1번 호출 → 열전사 프린터가 자동 절단하여 2장 출력

### 영수증 인쇄 시스템 구조
- `buildReceiptPage(order, copyLabel, storeName, timeStr)` — 개별 영수증 HTML 조각 생성
- `buildCombinedReceiptHtml(order)` — 주방용+손님용을 하나의 HTML에 CSS page-break로 분리
- `printViaPopup(html)` — 팝업 창에서 print() 호출 (메인 페이지 블로킹 없음)
- `processNextPrint()` — 인쇄 큐에서 하나씩 순차 처리
- `printReceipt(order)` — 큐에 추가 (주문 1건 = 큐 아이템 1개)
- `manualPrint(order)` — 수동 재인쇄

### 자동 인쇄 안전장치 (6가지 + α)
| 번호 | 이름 | 설명 |
|------|------|------|
| FIX1 | isFirstLoad | 페이지 로드 시 기존 주문 자동 인쇄 방지 (printedIds Set 추적) |
| FIX2 | 팝업 차단 감지 | 차단 시 노란 경고 배너 표시 |
| FIX3 | 인쇄 큐 | 순차 처리 (isPrinting mutex), 최대 30건 제한 |
| FIX4 | 네트워크 복구 | 밀린 주문 최대 3건만 자동 인쇄, 나머지 수동 |
| FIX5 | 절전모드 | visibilitychange 이벤트로 즉시 폴링 재개 |
| FIX6 | print() 중복 방지 | onload + setTimeout 중 먼저 실행된 것만 호출 |
| FIX7 | 수동 재인쇄 | manualPrint 함수로 기존 주문도 재인쇄 가능 |

### POS 환경
- **현재 POS**: Windows 7, Chrome 109 (32-bit)
- **기존 프린터**: LOVE CHECK-7401S (COM1) — 푸드테크 전용 (COM 포트 독점)
- **새 프린터**: CPP-3000 (USB) — QR 주문 영수증 전용
- Chrome `--kiosk-printing` 플래그로 인쇄 대화상자 없이 자동 출력

---

## 성능 최적화 히스토리 (★ 중요 맥락)

### 문제: 주문→영수증 30초 걸림 (2026-03-21)

**원인 분석 & 해결 과정:**

#### 1. 서버 사이드 최적화 (30초 → 7초)
- Supabase RPC 함수로 DB 호출 횟수 감소 (주문 생성 3→1, 조회 2→1)
- Vercel 리전을 `iad1`(미국 동부)에서 `icn1`(서울)로 변경 (`vercel.json`)
- API 응답 ~400ms로 단축

#### 2. 프론트엔드 최적화 (7초 → ~2초)
- **Optimistic UI 도입**: 주문 버튼 클릭 즉시 영수증 화면 표시 (6ms)
- 페이지 리다이렉트 제거 → 같은 컴포넌트에서 상태 변경으로 전환
- 관리자 폴링 간격: 3초 → 1초 → 700ms

#### 3. 인쇄 최적화
- ❌ **iframe.contentWindow.print()는 절대 쓰지 말 것** — 메인 페이지 JS 스레드를 블로킹하여 폴링/UI 전체가 멈춤 (15초 이상 지연 발생)
- ✅ **popup window.print() 사용** — 팝업의 JS 스레드만 블로킹, 메인 페이지는 정상 작동
- 팝업 2개(주방용+손님용) 순차 열기 → **팝업 1개에 CSS page-break로 2장** (print 다이얼로그 1번)

### 현재 타이밍 (최적화 후)
| 구간 | 시간 |
|------|------|
| 고객 주문 버튼 → 영수증 화면 | ~6ms (Optimistic UI) |
| API POST 주문 생성 | ~400ms |
| 관리자 폴링 감지 (평균) | ~350ms |
| 관리자 GET 주문 목록 | ~400ms |
| 팝업 열기 + print() | ~100ms |
| **총 기술적 지연** | **~1.3초** + 프린터 물리 출력 시간 |

### ⚠️ 남은 병목: Supabase 리전
Supabase DB가 **Sydney(ap-southeast-2)**에 있어서 서울 Vercel 서버에서 DB까지 왕복 ~200ms 추가. Supabase를 서울 리전으로 이전하면 각 API 호출이 100-150ms 빨라질 수 있다.

---

## 시행착오 & 확정된 의사결정 (★ 반드시 숙지)

### 1. 토글/아코디언 UX를 선택한 이유
주류 메뉴가 위스키 9종, 와인 3종, 리큐르 3종으로 많아서 일반 리스트로 나열하면 스크롤이 너무 길어진다. 토글 방식으로 관심 있는 카테고리만 펼쳐보고, 각 아이템도 클릭해야 옵션이 나오게 하여 화면을 깔끔하게 유지한다. **이 UX는 CEO가 확정한 것으로, 변경하지 말 것.**

### 2. 주류 구경은 자유, 담기에서만 연령확인
초기에는 주류 섹션 자체에 진입할 때 연령확인을 했으나, CEO 판단으로 "구경은 자유, 담기 직전에만 확인"으로 변경. 이유: 메뉴를 보고 싶은 고객의 접근을 막으면 안 되고, 실제 법적으로도 주문(구매) 시점에 확인하면 충분하다.

### 3. 프린터 두 대 분리 이유
기존 LOVE CHECK-7401S 프린터는 푸드테크 POS 전용으로 COM1 포트를 독점한다. 웹 브라우저에서 직접 접근이 불가능하다. 그래서 CPP-3000을 USB로 추가하여 QR 주문 영수증은 Chrome `window.print()`로 별도 출력한다.

### 4. 관리자 대시보드 IP 미노출 문제
관리자 대시보드의 방문자 통계에서 관리자 기기의 접속이 포함되면 통계가 왜곡된다. 해결: `/admin/orders` 접속 시 `scoops_admin=true` 쿠키를 1년짜리로 설정 → 이 쿠키가 있는 기기에서는 추적 이벤트 전송 안 함 + 홈페이지 방문자 통계도 기록 안 함.

### 5. iframe.contentWindow.print() 절대 금지
이것은 가장 아픈 시행착오. iframe 방식으로 영수증을 인쇄하면 `print()` 호출이 메인 페이지의 JS 스레드를 블로킹한다. 폴링이 멈추고, UI가 얼고, 인쇄 대화상자가 닫힐 때까지 15초 이상 아무것도 안 된다. **반드시 popup 방식을 사용할 것.** popup의 `print()`는 팝업의 스레드만 블로킹하므로 메인 페이지는 정상 작동한다.

### 6. 영수증 @page CSS 고정 높이 금지
`@page { size: 72mm 200mm }` 같이 높이를 고정하면 열전사 프린터가 200mm까지 빈 종이를 출력한다. 내용이 80mm인데 120mm 빈 공간이 생겨서 "절취선 문제"로 보인다. **`@page { margin: 0; padding: 0; }` 만 사용하고 높이는 지정하지 말 것.** 프린터가 내용에 맞게 자동으로 절단한다.

### 7. 팝업 2개 vs CSS page-break 1개
처음에는 주방용/손님용을 팝업 2개로 순차 인쇄했으나, 프린트 다이얼로그가 2번 나와서 느리고 번거롭다. **CSS `page-break-after: always`로 하나의 팝업에 2장을 넣으면** print() 1번으로 프린터가 자동 절단하여 깔끔한 2장 출력. 현재 이 방식을 사용 중.

### 8. Optimistic UI 도입 배경
고객이 주문 버튼을 누르면 API 응답을 기다리지 않고 즉시 "주문 완료" 영수증 화면을 보여준다. 주문번호는 "..."으로 시작하고 API 응답 후 실제 번호로 업데이트. 이유: API 왕복 400ms를 고객이 기다리게 하면 체감이 느리다. 실패 시 3회 재시도하고, 최종 실패해도 영수증 화면은 유지 + "카운터에 직접 말씀해주세요" 안내.

### 9. 하나를 고치면 하나가 깨지는 문제 (CEO 불만)
여러 차례 최적화를 진행하면서 "팝업→iframe→팝업", "2장→1장합본→2장(page-break)" 등 왔다갔다한 이력이 있다. CEO가 "뭐 하나 고치면 뭐 하나 고장나고" 라고 강하게 지적했다. **수정 후 반드시 전체 플로우를 테스트할 것**: 고객 QR 스캔 → 메뉴 → 카트 → 주문 → 관리자 감지 → 영수증 인쇄까지.

---

## CEO 작업 스타일 & 원칙 (★ 반드시 숙지)

### 정석주 대표의 특성
- **1인 운영 효율 중시**: 모든 시스템이 최소한의 수작업으로 돌아가야 한다
- **부풀리기 마케팅 안 함**: "수익을 보장합니다" 같은 과장 문구 절대 금지 (가맹사업법 위반이기도 함)
- **정보공개서 미등록 상태**: 공정위 가맹사업정보제공시스템에 미등록이라 "정보공개서 확인하세요" 류의 외부 콘텐츠 제작 불가. 등록 완료 전까지 관련 콘텐츠 보류.
- **실용주의**: 이론보다 실제 매장에서 테스트한 결과를 중시
- **속도 중시**: "긴급"이라고 하면 정말 긴급. 지금 매장에서 손님이 기다리는 상황일 수 있음
- **회귀 버그 극도로 싫어함**: 한 번 작동하던 기능이 다른 수정으로 깨지면 매우 불쾌해함. 수정 전후 전체 플로우 테스트 필수.

### 작업 원칙
- 수정 전 반드시 해당 파일을 읽고 현재 코드 파악할 것
- 배포 전 빌드 에러 반드시 확인
- 디자인 변경 시 tenpercentcoffee.com 벤치마크 톤 유지
- 새 페이지 만들 때 반드시 SubNav 컴포넌트 포함 (단, /order 경로는 예외)
- 관리자 페이지는 /admin 하위에만 만들 것
- /order 경로는 기존 사이트와 완전 분리 — Header/Footer/SubNav 사용 안 함
- 주류 메뉴 추가 시 `order-data.ts`의 메뉴 + `drinkDescriptions`에 설명 데이터도 함께 추가
- 추적 이벤트는 `tracking.ts`의 `trackEvent()` 사용, 관리자 쿠키 있으면 자동 제외

### 비공개 정보 — 절대 코드에 포함하지 말 것
- 젤라또 레시피 (분유, 포도당, 설탕, 구아검 배합)
- 원가 계산 상세 내역
- 가맹 계약 조건 상세
- 내부 운영 매뉴얼
- 수익 관련 수치 (가맹사업법 위반)

---

## 매장 데이터 (`src/lib/order-data.ts`)

| Store ID | Store Code | 매장명 | 상태 |
|----------|-----------|--------|------|
| s1 | cheongju | 청주본점 (HQ/사창점) | 영업중 |
| s2 | yeouido | 여의도점 | 영업중 |
| s3 | gongdeok | 공덕점 | 영업중 |
| s12 | jichuk | 지축점 | 영업중 |
| s16 | gwanjeo | 관저점 | 영업중 |
| s17 | seonhwa | 선화점 | 영업중 |
| 나머지 11개 | - | 진주혁신, 봉명, 성안 등 | 폐점 |

---

## 주류 메뉴 데이터

### 위스키 9종 (30ml=9,800원 / 100ml=19,800원)
달모어 12y, 글렌피딕 12y, 글렌리벳 12y, 글렌드로낙 12y, 발베니 12y, 글렌알라키 8y(NEW), 보모어 12y, 조니워커 블랙, 닛카 프롬 더 배럴

### 와인 3종
White Wine (50ml 2,900원/보틀 13,000원), Red Wine (50ml 2,900원/보틀 13,000원), Rose Wine (50ml 4,900원/보틀 15,000원)

### 리큐르 3종 (각 9,800원)
서울의 밤, 도원결의 15도, 도원결의 21도

각 주류에 설명(산지/종류/도수/향/맛/여운/추천) + 젤라또 페어링 추천이 있다. `order-data.ts`의 `drinkDescriptions` 참조.

---

## 코드 감사 워크플로우 (기능 추가/수정 후 필수)

1. **전체 플로우 추적**: 고객 QR 스캔 → 매장 선택 → 메뉴 → 카트 → 주문 → 관리자 화면 → 인쇄까지 코드 레벨에서 전부 따라가기
2. **각 파일별 체크리스트**:
   - 런타임 에러 (null 접근, undefined, 타입 불일치)
   - 데이터 유실 시나리오 (새로고침, 네트워크 끊김, 콜드 스타트)
   - 보안 (XSS, 입력 검증, rate limiting)
   - 모바일 UX (터치 영역, safe area, 스크롤)
   - 브라우저 호환 (특히 Chrome 109/Win7 관리자 POS)
   - 인쇄 관련 (팝업 차단, 큐 오버플로우, 용지 크기)
3. **엣지 케이스**: 빈 장바구니, 동시 여러 건 주문, 매장 전환, 네트워크 끊겼다 복구, 관리자 새로고침, 프린터 오프라인
4. **수정 사항은 즉시 커밋 & 배포**
5. **이 CLAUDE.md 업데이트** — 수정한 내용 반영

---

## 남은 작업 (우선순위 순)

### 즉시
1. ~~CPP-3000 프린터 설치 & 테스트~~ → CEO가 물리적으로 해야 할 부분
2. **토스페이먼츠 연동** — 포장 주문 시 결제 (현재 "결제 시스템 준비 중" 메시지). CEO가 PG 가입 신청 필요.
3. **/admin/orders 인증 체크** — 현재 로그인 없이 접근 가능
4. **주문 완료 후 뒤로가기 방지** — replace 네비게이션으로 변경

### CEO 사진 제공 후
5. **매장/메뉴 사진 교체** — 현재 logo_symbol.png 워터마크 상태

### 기능 강화
6. 네이버 지도 API — /story/location 페이지
7. 인스타그램 피드 연동 — 홈 페이지
8. SEO 최적화 — 각 페이지 메타태그, OG 이미지, sitemap.xml
9. 나머지 매장 QR 코드 생성 (현재 청주본점만)
10. 푸드테크 POS API 연동

### 성능 추가 최적화
11. **Supabase 서울 리전 이전** — DB 왕복 시간 200ms → ~50ms 단축 가능
12. **주문 알림 실시간화** — 폴링 대신 Supabase Realtime 또는 SSE 도입 검토

---

## ★ 프롬프트 자기 관리 규칙

이 CLAUDE.md는 프로젝트의 기억이다. 틀린 정보가 있으면 틀린 결과물을 만든다.

**업데이트 타이밍:**
- CEO가 확정 신호를 보냈을 때 ("좋아", "이걸로 가자", "완성" 등)
- 작업 중 새로운 결정사항이 확정되었을 때
- CEO가 다른 주제로 넘어갔을 때 (직전 작업의 결정사항 반영)

**절대 하지 않는 것:**
- 아직 확정 안 된 논의 중인 내용을 넣지 않는다
- 없는 정보를 추측으로 채우지 않는다
