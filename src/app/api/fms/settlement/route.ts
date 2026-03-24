import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert, supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 정산 데이터 조회
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin"]);
    const { searchParams } = req.nextUrl;
    const view = searchParams.get("view") || "overview"; // overview | customers | transactions | payments | products

    if (view === "overview") {
      // 거래처별 요약
      const customers = await supabaseSelect<any[]>("settlement_customers", "order=store_name.asc");
      const recentTrans = await supabaseSelect<any[]>("settlement_transactions", "order=transaction_date.desc&limit=20");
      const recentPays = await supabaseSelect<any[]>("settlement_payments", "order=payment_date.desc&limit=20");

      // 거래처별 총 거래액 + 총 입금액 계산
      const summary = await Promise.all((customers || []).map(async (c: any) => {
        const trans = await supabaseSelect<any[]>("settlement_transactions", `customer_id=eq.${c.id}&select=total_amount`);
        const pays = await supabaseSelect<any[]>("settlement_payments", `customer_id=eq.${c.id}&select=amount`);
        const totalSupply = (trans || []).reduce((s: number, t: any) => s + (t.total_amount || 0), 0);
        const totalPaid = (pays || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
        return { ...c, totalSupply, totalPaid, balance: totalSupply - totalPaid };
      }));

      return NextResponse.json({ customers: summary, recentTransactions: recentTrans || [], recentPayments: recentPays || [] });
    }

    if (view === "customers") {
      const customers = await supabaseSelect<any[]>("settlement_customers", "order=store_name.asc");
      return NextResponse.json({ customers: customers || [] });
    }

    if (view === "transactions") {
      const customerId = searchParams.get("customerId");
      const limit = searchParams.get("limit") || "50";
      let query = `order=transaction_date.desc&limit=${limit}`;
      if (customerId) query = `customer_id=eq.${customerId}&${query}`;
      const transactions = await supabaseSelect<any[]>("settlement_transactions", query);
      return NextResponse.json({ transactions: transactions || [] });
    }

    if (view === "payments") {
      const customerId = searchParams.get("customerId");
      const limit = searchParams.get("limit") || "50";
      let query = `order=payment_date.desc&limit=${limit}`;
      if (customerId) query = `customer_id=eq.${customerId}&${query}`;
      const payments = await supabaseSelect<any[]>("settlement_payments", query);
      return NextResponse.json({ payments: payments || [] });
    }

    if (view === "products") {
      const products = await supabaseSelect<any[]>("settlement_products", "order=name.asc");
      return NextResponse.json({ products: products || [] });
    }

    return NextResponse.json({ error: "Invalid view" }, { status: 400 });
  } catch (err) { return handleAuthError(err); }
}

// POST: 거래 또는 입금 추가
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin"]);
    const body = await req.json();
    const { type } = body; // "transaction" | "payment" | "customer"

    if (type === "transaction") {
      const { customerId, date, title, items, supplyAmount, taxAmount, totalAmount, memo } = body;
      if (!customerId || !date || !title) return NextResponse.json({ error: "필수 항목이 없습니다." }, { status: 400 });
      const result = await supabaseInsert("settlement_transactions", {
        customer_id: customerId, transaction_date: date, title,
        items: JSON.stringify(items || []),
        supply_amount: supplyAmount || 0, tax_amount: taxAmount || 0,
        total_amount: totalAmount || 0, memo: memo || "", status: "completed",
      });
      return NextResponse.json({ success: true, transaction: result });
    }

    if (type === "payment") {
      const { customerId, date, amount, memo } = body;
      if (!customerId || !date || !amount) return NextResponse.json({ error: "필수 항목이 없습니다." }, { status: 400 });
      const result = await supabaseInsert("settlement_payments", {
        customer_id: customerId, payment_date: date, amount, memo: memo || "",
      });
      return NextResponse.json({ success: true, payment: result });
    }

    if (type === "customer") {
      const { storeName, ownerName, phone, address } = body;
      if (!storeName) return NextResponse.json({ error: "매장명이 필요합니다." }, { status: 400 });
      const result = await supabaseInsert("settlement_customers", {
        store_name: storeName, owner_name: ownerName || "", phone: phone || "", address: address || "",
      });
      return NextResponse.json({ success: true, customer: result });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) { return handleAuthError(err); }
}
