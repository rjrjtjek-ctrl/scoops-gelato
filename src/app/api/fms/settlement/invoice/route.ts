import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// 거래명세서 번호 생성 (날짜 기반: 20260325-001)
function generateInvoiceNumber(date: string, seq: number): string {
  const d = date.replace(/-/g, "");
  return `${d}-${String(seq).padStart(3, "0")}`;
}

// GET: 거래명세서 목록 조회
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin", "franchisee"]);
    const { searchParams } = req.nextUrl;
    const customerId = searchParams.get("customerId");
    const month = searchParams.get("month"); // YYYY-MM 형식

    let query = "order=transaction_date.desc&limit=100";

    // 점주는 자기 매장만
    if (user.role === "franchisee" && user.storeId) {
      // settlement_customers에서 store_id로 customer_id 찾기
      const custs = await supabaseSelect<any[]>("settlement_customers", `select=id`);
      // 점주의 storeId와 매칭되는 거래처 찾기 (store_name 기반)
      if (customerId) {
        query = `customer_id=eq.${customerId}&${query}`;
      }
    } else if (customerId) {
      query = `customer_id=eq.${customerId}&${query}`;
    }

    if (month) {
      query = `transaction_date=gte.${month}-01&transaction_date=lt.${month}-32&${query}`;
    }

    // invoice_number가 있는 것만 (거래명세서 발행된 것)
    const invoiceOnly = searchParams.get("invoiceOnly");
    if (invoiceOnly === "true") {
      query = `invoice_number=neq.&${query}`;
    }

    const transactions = await supabaseSelect<any[]>("settlement_transactions", query);

    // 거래처 정보도 함께
    const customers = await supabaseSelect<any[]>("settlement_customers", "select=id,store_name,owner_name,phone,address");

    return NextResponse.json({
      invoices: (transactions || []).filter(t => t.invoice_number),
      allTransactions: transactions || [],
      customers: customers || [],
    });
  } catch (err) { return handleAuthError(err); }
}

// POST: 거래명세서 발행 (출고 건에 번호 부여 + 점주 알림)
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin"]);
    const body = await req.json();
    const { transactionIds } = body; // 거래명세서를 발행할 출고 건 ID 배열

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json({ error: "출고 건을 선택해주세요." }, { status: 400 });
    }

    // 오늘 날짜 기반 시퀀스 번호 계산
    const today = new Date().toISOString().split("T")[0];
    const todayPrefix = today.replace(/-/g, "");

    // 오늘 발행된 거래명세서 중 마지막 번호 조회
    const existing = await supabaseSelect<any[]>(
      "settlement_transactions",
      `invoice_number=like.${todayPrefix}*&order=invoice_number.desc&limit=1`
    );

    let lastSeq = 0;
    if (existing && existing.length > 0 && existing[0].invoice_number) {
      const parts = existing[0].invoice_number.split("-");
      lastSeq = parseInt(parts[1]) || 0;
    }

    // 각 출고 건에 거래명세서 번호 부여
    const results = [];
    for (let i = 0; i < transactionIds.length; i++) {
      const seq = lastSeq + i + 1;
      const invoiceNumber = generateInvoiceNumber(today, seq);

      await supabaseUpdate("settlement_transactions", `id=eq.${transactionIds[i]}`, {
        invoice_number: invoiceNumber,
        status: "issued",
      });

      results.push({ transactionId: transactionIds[i], invoiceNumber });
    }

    // 점주 알림 생성 (해당 거래의 매장에 알림)
    try {
      const transactions = await supabaseSelect<any[]>(
        "settlement_transactions",
        `id=in.(${transactionIds.join(",")})&select=customer_id`
      );
      const customerIds = [...new Set((transactions || []).map(t => t.customer_id))];

      for (const cid of customerIds) {
        // notifications 테이블에 알림 추가 (있으면)
        try {
          const { supabaseInsert } = await import("@/lib/supabase-client");
          await supabaseInsert("notifications", {
            type: "invoice",
            title: "새 거래명세서가 발행되었습니다",
            content: `${results.length}건의 거래명세서가 발행되었습니다. 정산 메뉴에서 확인해주세요.`,
            target_type: "customer",
            target_id: cid,
          });
        } catch {} // notifications 테이블이 없어도 무시
      }
    } catch {} // 알림 실패해도 거래명세서 발행은 성공

    return NextResponse.json({ success: true, invoices: results });
  } catch (err) { return handleAuthError(err); }
}
