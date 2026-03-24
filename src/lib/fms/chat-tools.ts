import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { searchLowestPrice } from "./price-search";

// OpenAI Function Calling 도구 정의
export const chatTools = [
  {
    type: "function" as const,
    function: {
      name: "create_hq_order",
      description: "본사에 젤라또 베이스, 스티커, 컵 등을 발주합니다. 사용자가 본사 제품 주문을 요청할 때 사용하세요.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "주문할 품목 목록",
            items: {
              type: "object",
              properties: {
                productName: { type: "string", description: "제품명 (예: 젤라또 베이스 클래식)" },
                quantity: { type: "number", description: "수량" },
              },
              required: ["productName", "quantity"],
            },
          },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "request_purchase",
      description: "직원이 구매가 필요한 물품을 점주에게 요청합니다. 직원이 '~사야해', '~필요해', '~떨어졌어', '~구매해야해' 등으로 물품 구매를 요청할 때 사용하세요.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "구매가 필요한 물품 목록",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "물품명 (예: 블루베리잼, 초코파우더)" },
                note: { type: "string", description: "참고사항 (예: 1kg, 대용량)" },
              },
              required: ["name"],
            },
          },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_task",
      description: "직원에게 할일을 배정합니다. 점주가 '~에게 ~시켜줘', '~해야 해', '할일 추가해줘' 등으로 요청할 때 사용하세요.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "할일 제목 (예: 매장 청소, 젤라또 제조)" },
          assigneeName: { type: "string", description: "담당 직원 이름 (없으면 미지정)" },
          dueDate: { type: "string", description: "마감일 (YYYY-MM-DD, 기본 오늘)" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "log_work",
      description: "직원의 작업 완료를 기록합니다. 직원이 '~를 만들었어', '~를 했어', '~를 완료했어' 등으로 작업 보고할 때 사용하세요.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "작업 내용 (예: 피스타치오 젤라또 5통 제조)" },
          taskId: { type: "string", description: "연관된 할일 ID (있을 경우)" },
        },
        required: ["description"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_today_tasks",
      description: "오늘 해야 할 일 목록을 조회합니다. 직원이 '오늘 할 일 뭐야?', '뭐 해야 돼?' 등으로 물어볼 때 사용하세요.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// 제품명 유사 매칭
async function findProduct(name: string): Promise<any | null> {
  const products = await supabaseSelect<any[]>("hq_products", "is_active=eq.true");
  if (!products || products.length === 0) return null;

  // 정확 매칭
  const exact = products.find((p: any) => p.name === name);
  if (exact) return exact;

  // 부분 매칭
  const lower = name.toLowerCase().replace(/\s/g, "");
  const partial = products.find((p: any) =>
    p.name.toLowerCase().replace(/\s/g, "").includes(lower) ||
    lower.includes(p.name.toLowerCase().replace(/\s/g, ""))
  );
  if (partial) return partial;

  // 키워드 매칭
  const keywords = name.split(/\s+/);
  const keywordMatch = products.find((p: any) =>
    keywords.some((kw: string) => p.name.includes(kw))
  );
  return keywordMatch || null;
}

// Function Calling 핸들러
export async function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
  storeId: string | null
): Promise<string> {
  if (toolName === "create_hq_order") {
    return await handleCreateHqOrder(args, userId, storeId);
  }
  if (toolName === "request_purchase") {
    return await handleRequestPurchase(args, userId, storeId);
  }
  if (toolName === "create_task") {
    return await handleCreateTask(args, userId, storeId);
  }
  if (toolName === "log_work") {
    return await handleLogWork(args, userId, storeId);
  }
  if (toolName === "get_today_tasks") {
    return await handleGetTodayTasks(userId, storeId);
  }
  return JSON.stringify({ error: "알 수 없는 기능입니다." });
}

async function handleCreateHqOrder(
  args: Record<string, unknown>,
  userId: string,
  storeId: string | null
): Promise<string> {
  if (!storeId) {
    return JSON.stringify({ error: "매장이 지정되지 않아 발주할 수 없습니다." });
  }

  const items = args.items as { productName: string; quantity: number }[];
  if (!items || items.length === 0) {
    return JSON.stringify({ error: "주문 항목이 없습니다." });
  }

  const resolvedItems: { productId: string; productName: string; quantity: number }[] = [];
  const notFound: string[] = [];

  for (const item of items) {
    const product = await findProduct(item.productName);
    if (product) {
      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
      });
    } else {
      notFound.push(item.productName);
    }
  }

  if (notFound.length > 0) {
    const allProducts = await supabaseSelect<any[]>("hq_products", "is_active=eq.true");
    const productNames = (allProducts || []).map((p: any) => p.name).join(", ");
    return JSON.stringify({
      error: `다음 제품을 찾을 수 없습니다: ${notFound.join(", ")}`,
      availableProducts: productNames,
    });
  }

  // 발주 생성
  const result = await supabaseInsert("hq_orders", {
    store_id: storeId,
    ordered_by: userId,
    items: JSON.stringify(resolvedItems),
    status: "pending",
  });

  const order = Array.isArray(result) ? result[0] : result;
  return JSON.stringify({
    success: true,
    orderId: order?.id,
    items: resolvedItems.map(i => `${i.productName} x${i.quantity}`),
  });
}

// 직원 → 점주 구매 요청 (할일로 전달)
async function handleRequestPurchase(
  args: Record<string, unknown>,
  userId: string,
  storeId: string | null
): Promise<string> {
  if (!storeId) {
    return JSON.stringify({ error: "매장 정보가 없습니다." });
  }

  const items = args.items as { name: string; note?: string }[];
  if (!items || items.length === 0) {
    return JSON.stringify({ error: "물품 목록이 필요합니다." });
  }

  // 요청자 이름 조회
  const users = await supabaseSelect<any[]>("users", `id=eq.${userId}&limit=1`);
  const userName = users?.[0]?.name || "직원";

  // 물품 리스트 텍스트
  const itemList = items.map(i => i.note ? `${i.name} (${i.note})` : i.name).join(", ");

  // 점주 할일로 생성
  const today = new Date().toISOString().split("T")[0];
  await supabaseInsert("tasks", {
    store_id: storeId,
    title: `[구매요청] ${itemList}`,
    description: `${userName}님이 구매를 요청했습니다.\n\n품목:\n${items.map(i => `• ${i.name}${i.note ? ` (${i.note})` : ""}`).join("\n")}`,
    status: "pending",
    due_date: today,
    created_by: userId,
  });

  return JSON.stringify({
    success: true,
    message: `점주님께 구매 요청을 전달했습니다.`,
    items: items.map(i => i.name),
  });
}

// 가격 검색 핸들러 (현재 비활성화 — 추후 안정화 후 사용)
async function handleSearchProductPrice(args: Record<string, unknown>): Promise<string> {
  const productName = args.productName as string;
  const quantity = (args.quantity as number) || 1;

  if (!productName) {
    return JSON.stringify({ error: "제품명이 필요합니다." });
  }

  // approved_products에서 검색
  const products = await supabaseSelect<any[]>("approved_products", "is_active=eq.true");
  const lower = productName.toLowerCase().replace(/\s/g, "");
  const matched = (products || []).find((p: any) =>
    p.name.toLowerCase().replace(/\s/g, "").includes(lower) ||
    lower.includes(p.name.toLowerCase().replace(/\s/g, ""))
  );

  // hq_only 체크
  if (matched && matched.purchase_mode === "hq_only") {
    return JSON.stringify({
      hqOnly: true,
      message: `${matched.name}은(는) 본사 일괄 구매 제품입니다. 본사에 발주해주세요.`,
    });
  }

  // 최저가 검색 — 승인 제품이면 검색 키워드 사용, 아니면 제품명으로 직접 검색
  const searchKeyword = matched ? (matched.search_keyword || matched.name) : productName;
  const results = await searchLowestPrice(searchKeyword);

  if (results.length === 0) {
    return JSON.stringify({ noResults: true, message: `${matched?.name || productName} 검색 결과가 없습니다.` });
  }

  return JSON.stringify({
    success: true,
    productName: matched?.name || productName,
    quantity,
    results: results.map((r, i) => ({
      rank: i + 1,
      source: r.source,
      name: r.productName,
      price: r.price,
      totalPrice: r.price * quantity,
      url: r.url,
      mallName: r.mallName,
    })),
  });
}

// 작업 기록 핸들러
async function handleLogWork(args: Record<string, unknown>, userId: string, storeId: string | null): Promise<string> {
  if (!storeId) return JSON.stringify({ error: "매장이 지정되지 않았습니다." });
  const description = args.description as string;
  const taskId = args.taskId as string | undefined;

  // task_logs에 기록
  const result = await supabaseInsert("task_logs", {
    task_id: taskId || null,
    user_id: userId,
    store_id: storeId,
    action: "completed",
    description,
  });

  // 연관 task가 있으면 완료 처리
  if (taskId) {
    const { supabaseUpdate } = await import("@/lib/supabase-client");
    await supabaseUpdate("tasks", `id=eq.${taskId}`, { status: "completed", completed_at: new Date().toISOString() });
  }

  // 오늘 남은 할일 조회
  const today = new Date().toISOString().split("T")[0];
  const remaining = await supabaseSelect<any[]>("tasks", `store_id=eq.${storeId}&due_date=eq.${today}&status=neq.completed`);

  const log = Array.isArray(result) ? result[0] : result;
  const time = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" });

  return JSON.stringify({
    success: true,
    logId: log?.id,
    recordedAt: time,
    description,
    remainingTasks: (remaining || []).map((t: any) => t.title),
  });
}

// 오늘 할일 조회 핸들러
async function handleGetTodayTasks(userId: string, storeId: string | null): Promise<string> {
  if (!storeId) return JSON.stringify({ error: "매장이 지정되지 않았습니다." });

  const today = new Date().toISOString().split("T")[0];
  const tasks = await supabaseSelect<any[]>("tasks", `store_id=eq.${storeId}&due_date=eq.${today}&order=created_at.asc`);

  const result = (tasks || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    dueTime: t.due_time,
  }));

  const completed = result.filter(t => t.status === "completed").length;

  return JSON.stringify({
    tasks: result,
    total: result.length,
    completed,
    remaining: result.length - completed,
  });
}

// 할일 생성 핸들러
async function handleCreateTask(args: Record<string, unknown>, userId: string, storeId: string | null): Promise<string> {
  if (!storeId) return JSON.stringify({ error: "매장이 지정되지 않았습니다." });

  const title = args.title as string;
  const assigneeName = args.assigneeName as string | undefined;
  const dueDate = (args.dueDate as string) || new Date().toISOString().split("T")[0];

  if (!title) return JSON.stringify({ error: "할일 제목이 필요합니다." });

  // 담당자 이름으로 user_id 찾기
  let assignedTo: string | null = null;
  if (assigneeName) {
    const employees = await supabaseSelect<any[]>("users", `store_id=eq.${storeId}&role=eq.employee&is_active=eq.true&name=ilike.*${encodeURIComponent(assigneeName)}*&limit=1`);
    if (employees && employees.length > 0) {
      assignedTo = employees[0].id;
    }
  }

  const result = await supabaseInsert("tasks", {
    store_id: storeId,
    created_by: userId,
    assigned_to: assignedTo,
    title,
    due_date: dueDate,
    status: "pending",
  });

  const task = Array.isArray(result) ? result[0] : result;

  return JSON.stringify({
    success: true,
    taskId: task?.id,
    title,
    assignedTo: assigneeName || "미지정",
    dueDate,
  });
}
