import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 인사 평가 목록
export async function GET(req: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) {
  try {
    requireAuth(req, ["hq_admin", "franchisee"]);
    const { employeeId } = await params;

    const reviews = await supabaseSelect<any[]>(
      "employee_reviews",
      `employee_id=eq.${employeeId}&order=created_at.desc`
    );

    const result = await Promise.all(
      (reviews || []).map(async (r: any) => {
        const reviewers = await supabaseSelect<any[]>("users", `id=eq.${r.reviewer_id}&limit=1`);
        return {
          id: r.id,
          content: r.content,
          createdAt: r.created_at,
          reviewerName: reviewers?.[0]?.name || "알 수 없음",
        };
      })
    );

    return NextResponse.json({ reviews: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return handleAuthError(err);
  }
}

// POST: 인사 평가 추가
export async function POST(req: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) {
  try {
    const user = requireAuth(req, ["franchisee"]);
    const { employeeId } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "평가 내용을 입력해주세요." }, { status: 400 });
    }

    // 해당 직원이 점주 매장 소속인지 확인
    const emps = await supabaseSelect<any[]>(
      "employees_detail",
      `id=eq.${employeeId}&store_id=eq.${user.storeId}&limit=1`
    );
    if (!emps || emps.length === 0) {
      return NextResponse.json({ error: "직원을 찾을 수 없습니다." }, { status: 404 });
    }

    const result = await supabaseInsert("employee_reviews", {
      employee_id: employeeId,
      reviewer_id: user.userId,
      content: content.trim(),
    });

    const review = Array.isArray(result) ? result[0] : result;
    return NextResponse.json({
      review: {
        id: review?.id,
        content: content.trim(),
        createdAt: review?.created_at,
        reviewerName: user.name,
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
