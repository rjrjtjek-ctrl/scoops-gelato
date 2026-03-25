import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { buildTaxInvoiceData, checkPopbillStatus } from "@/lib/fms/popbill";

// GET: 세금계산서 데이터 조회 (양식 미리보기)
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin"]);
    const { searchParams } = req.nextUrl;
    const action = searchParams.get("action");

    // 팝빌 연결 상태 확인
    if (action === "status") {
      const status = await checkPopbillStatus();
      return NextResponse.json(status);
    }

    // 특정 출고 건의 세금계산서 미리보기
    const transactionId = searchParams.get("transactionId");
    if (transactionId) {
      const trans = await supabaseSelect<any[]>("settlement_transactions", `id=eq.${transactionId}&limit=1`);
      if (!trans || trans.length === 0) {
        return NextResponse.json({ error: "출고 건을 찾을 수 없습니다." }, { status: 404 });
      }

      const cust = await supabaseSelect<any[]>("settlement_customers", `id=eq.${trans[0].customer_id}&limit=1`);
      const customer = cust?.[0];

      const taxData = buildTaxInvoiceData(trans[0], {
        corpNum: customer?.business_number || "",
        corpName: customer?.store_name || "",
        ceoName: customer?.owner_name || "",
        addr: customer?.address || "",
      });

      return NextResponse.json({
        transaction: trans[0],
        customer,
        taxInvoice: taxData,
        // 공급자 (본사) 정보
        supplier: {
          corpNum: "470-22-00633",
          corpName: "스쿱스젤라또",
          ceoName: "정석주",
          addr: "충청북도 청주시 서원구 1순환로672번길 35, 1층",
          bizType: "음식점업",
          bizClass: "젤라또 제조 및 판매",
          tel: "1811-0259",
          email: "scoopsgelato10@gmail.com",
        },
      });
    }

    // 월별 세금계산서 발행 대상 목록
    const month = searchParams.get("month") || new Date().toISOString().substring(0, 7);
    const transactions = await supabaseSelect<any[]>(
      "settlement_transactions",
      `transaction_date=gte.${month}-01&transaction_date=lt.${month}-32&order=transaction_date.desc`
    );
    const customers = await supabaseSelect<any[]>("settlement_customers", "order=store_name.asc");

    // 매장별 그룹핑
    const byCustomer: Record<string, { customer: any; transactions: any[]; totals: { supply: number; tax: number; total: number } }> = {};
    (customers || []).forEach((c: any) => { byCustomer[c.id] = { customer: c, transactions: [], totals: { supply: 0, tax: 0, total: 0 } }; });
    (transactions || []).forEach((t: any) => {
      if (byCustomer[t.customer_id]) {
        byCustomer[t.customer_id].transactions.push(t);
        byCustomer[t.customer_id].totals.supply += t.supply_amount || 0;
        byCustomer[t.customer_id].totals.tax += t.tax_amount || 0;
        byCustomer[t.customer_id].totals.total += t.total_amount || 0;
      }
    });

    return NextResponse.json({
      month,
      summary: Object.values(byCustomer).filter(g => g.transactions.length > 0),
    });
  } catch (err) { return handleAuthError(err); }
}
