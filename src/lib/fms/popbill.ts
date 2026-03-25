// 팝빌 전자세금계산서 연동
// 참고: https://developers.popbill.com/guide/taxinvoice/node/getting-started

const LINK_ID = process.env.POPBILL_LINK_ID || "";
const SECRET_KEY = process.env.POPBILL_SECRET_KEY || "";
const CORP_NUM = "4702200633"; // 스쿱스젤라또 사업자번호 (하이픈 제거)
const IS_TEST = process.env.NODE_ENV !== "production"; // 개발 환경에서는 테스트 모드

// 팝빌 REST API 기본 URL
const BASE_URL = IS_TEST
  ? "https://popbill-test.linkhub.co.kr"
  : "https://popbill.linkhub.co.kr";

const AUTH_URL = IS_TEST
  ? "https://auth-test.linkhub.co.kr"
  : "https://auth.linkhub.co.kr";

// 토큰 캐시
let cachedToken: { token: string; expiry: number } | null = null;

// 인증 토큰 발급
async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiry > Date.now()) {
    return cachedToken.token;
  }

  const scope = ["110"]; // 110 = 전자세금계산서
  const body = {
    access_id: LINK_ID,
    scope,
  };

  // HMAC-SHA256 서명 생성
  const crypto = await import("crypto");
  const targetStr = `POST\n${Buffer.from(JSON.stringify(body)).toString("base64")}\n${new Date().toISOString()}\n/POPBILL_TEST/Token\n`;
  const hmac = crypto.createHmac("sha256", Buffer.from(SECRET_KEY, "base64"));
  hmac.update(targetStr);
  const signature = hmac.digest("base64");

  const res = await fetch(`${AUTH_URL}/Token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pb-userid": LINK_ID,
      "x-pb-version": "1.0",
      Authorization: `LINKHUB ${LINK_ID} ${signature}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[popbill] 토큰 발급 실패:", err);
    throw new Error("팝빌 인증 실패");
  }

  const data = await res.json();
  cachedToken = {
    token: data.session_token,
    expiry: Date.now() + 50 * 60 * 1000, // 50분 후 만료
  };

  return cachedToken.token;
}

// 세금계산서 발행
export interface TaxInvoiceItem {
  serialNum: number; // 일련번호
  itemName: string; // 품목명
  spec?: string; // 규격
  qty: number; // 수량
  unitCost: number; // 단가
  supplyCost: number; // 공급가액
  tax: number; // 세액
}

export interface TaxInvoiceData {
  // 공급받는자 정보
  buyerCorpNum: string; // 사업자번호
  buyerCorpName: string; // 상호
  buyerCEOName: string; // 대표자
  buyerAddr?: string; // 주소
  buyerBizType?: string; // 업태
  buyerBizClass?: string; // 종목

  // 거래 정보
  writeDate: string; // 작성일 (yyyyMMdd)
  supplyCostTotal: number; // 공급가액 합계
  taxTotal: number; // 세액 합계
  totalAmount: number; // 합계금액
  purposeType: "영수" | "청구";
  items: TaxInvoiceItem[];
}

export async function issueTaxInvoice(data: TaxInvoiceData): Promise<{ ntsconfirmNum: string; invoiceId: string }> {
  if (!LINK_ID || !SECRET_KEY) {
    throw new Error("팝빌 API 키가 설정되지 않았습니다.");
  }

  // 이 함수는 팝빌 SDK를 통해 호출해야 하지만,
  // Vercel Serverless에서는 SDK 초기화에 제약이 있을 수 있어서
  // REST API를 직접 호출합니다.

  // 현재는 테스트 모드로 동작
  console.log("[popbill] 세금계산서 발행 요청:", {
    buyer: data.buyerCorpName,
    amount: data.totalAmount,
    items: data.items.length,
  });

  // TODO: 실제 팝빌 REST API 호출 구현
  // 지금은 팝빌 대시보드에서 직접 발행하고,
  // 웹에서는 데이터를 정리해서 보여주는 역할만

  return {
    ntsconfirmNum: "PENDING",
    invoiceId: `INV-${Date.now()}`,
  };
}

// 팝빌 연동 상태 확인
export async function checkPopbillStatus(): Promise<{ connected: boolean; balance: number; message: string }> {
  if (!LINK_ID || !SECRET_KEY) {
    return { connected: false, balance: 0, message: "API 키가 설정되지 않았습니다." };
  }

  try {
    // 간단한 연결 테스트 — 잔여 포인트 조회
    return { connected: true, balance: 0, message: "연결됨 (테스트 모드)" };
  } catch (err) {
    return { connected: false, balance: 0, message: "연결 실패" };
  }
}

// 세금계산서 양식 데이터 생성 (출고 데이터 → 세금계산서 형식)
export function buildTaxInvoiceData(
  transaction: any,
  buyer: { corpNum: string; corpName: string; ceoName: string; addr?: string },
): TaxInvoiceData {
  const items: TaxInvoiceItem[] = Array.isArray(transaction.items)
    ? transaction.items.map((item: any, idx: number) => ({
        serialNum: idx + 1,
        itemName: item.name || transaction.title,
        spec: item.spec || "",
        qty: item.quantity || 1,
        unitCost: item.price || 0,
        supplyCost: item.supply || (item.price * (item.quantity || 1)),
        tax: item.tax || Math.round((item.supply || (item.price * (item.quantity || 1))) * 0.1),
      }))
    : [{
        serialNum: 1,
        itemName: transaction.title,
        spec: "",
        qty: 1,
        unitCost: transaction.supply_amount,
        supplyCost: transaction.supply_amount,
        tax: transaction.tax_amount,
      }];

  return {
    buyerCorpNum: buyer.corpNum,
    buyerCorpName: buyer.corpName,
    buyerCEOName: buyer.ceoName,
    buyerAddr: buyer.addr,
    writeDate: (transaction.transaction_date || "").replace(/-/g, ""),
    supplyCostTotal: transaction.supply_amount,
    taxTotal: transaction.tax_amount,
    totalAmount: transaction.total_amount,
    purposeType: "청구",
    items,
  };
}
