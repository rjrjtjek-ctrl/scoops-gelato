import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert, supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { sendStoreNotification } from "@/lib/kakao";

// GET: 정산 데이터 조회
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin"]);
    const { searchParams } = req.nextUrl;
    const view = searchParams.get("view") || "overview"; // overview | customers | transactions | payments | products

    if (view === "overview") {
      // 거래처별 요약 — outstanding_balance 컬럼 사용 (엑셀 불출대장 기준 실제 미수금)
      const customers = await supabaseSelect<any[]>("settlement_customers", "order=store_name.asc");
      const recentTrans = await supabaseSelect<any[]>("settlement_transactions", "order=transaction_date.desc&limit=20");
      const recentPays = await supabaseSelect<any[]>("settlement_payments", "order=payment_date.desc&limit=20");

      const summary = (customers || []).map((c: any) => ({
        ...c,
        balance: c.outstanding_balance || 0,
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

      // 출고 시 점주에게 카카오 알림
      try {
        const custs = await supabaseSelect<any[]>("settlement_customers", `id=eq.${customerId}&limit=1`);
        const storeName = custs?.[0]?.store_name || "매장";
        sendStoreNotification({
          storeName,
          type: "general",
          title: `출고 등록: ${title}`,
          detail: `합계: ${(totalAmount || 0).toLocaleString()}원`,
        }).catch(() => {});
      } catch {}

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

    if (type === "product") {
      const { name, spec, unit, price, category } = body;
      if (!name) return NextResponse.json({ error: "제품명이 필요합니다." }, { status: 400 });
      const result = await supabaseInsert("settlement_products", {
        name, spec: spec || "", unit: unit || "", price: price || 0, category: category || "general",
      });
      return NextResponse.json({ success: true, product: result });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) { return handleAuthError(err); }
}

// PATCH: 제품 수정 / 거래처 미수금 수정
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin"]);
    const body = await req.json();
    const { type, id } = body;

    if (type === "product" && id) {
      const { name, spec, unit, price, category } = body;
      const updates: Record<string, any> = {};
      if (name !== undefined) updates.name = name;
      if (spec !== undefined) updates.spec = spec;
      if (unit !== undefined) updates.unit = unit;
      if (price !== undefined) updates.price = price;
      if (category !== undefined) updates.category = category;
      await supabaseUpdate("settlement_products", `id=eq.${id}`, updates);
      return NextResponse.json({ success: true });
    }

    if (type === "customer_balance" && id) {
      const { balance } = body;
      await supabaseUpdate("settlement_customers", `id=eq.${id}`, { outstanding_balance: balance });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) { return handleAuthError(err); }
}

// DELETE: 제품 삭제
export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin"]);
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "product";

    if (type === "product" && id) {
      await supabaseUpdate("settlement_products", `id=eq.${id}`, { is_active: false });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) { return handleAuthError(err); }
}
