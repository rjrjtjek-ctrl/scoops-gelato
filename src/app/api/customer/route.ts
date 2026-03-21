import { NextRequest, NextResponse } from "next/server";
import { getCustomerPosts, addCustomerPost, replyToCustomerPost } from "@/lib/store";

// 고객의 소리 목록 조회
export async function GET() {
  const posts = getCustomerPosts();
  return NextResponse.json({ posts });
}

// 고객의 소리 새 글 작성
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, author, title, content } = body;

    if (!category || !author || !title || !content) {
      return NextResponse.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
    }

    const post = addCustomerPost({ category, author, title, content });
    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 답변 작성 (관리자용)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, reply } = body;

    if (!id || !reply) {
      return NextResponse.json({ error: "ID와 답변 내용이 필요합니다." }, { status: 400 });
    }

    const post = replyToCustomerPost(id, reply);
    if (!post) {
      return NextResponse.json({ error: "해당 글을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
