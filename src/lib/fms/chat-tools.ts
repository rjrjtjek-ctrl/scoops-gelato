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
      name: "search_product_price",
      description: "사입 제품의 최저가를 검색합니다. 사용자가 특정 제품을 구매하거나 가격을 알고 싶어할 때 사용하세요.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "검색할 제품명 (예: 흑임자 페이스트)" },
          quantity: { type: "number", description: "필요한 수량 (기본 1)" },
        },
        required: ["productName"],
      },
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
  if (toolName === "search_product_price") {
    return await handleSearchProductPrice(args);
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

// 가격 검색 핸들러
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

  if (!matched) {
    const names = (products || []).map((p: any) => p.name).join(", ");
    return JSON.stringify({ error: `'${productName}'을 찾을 수 없습니다. 등록된 제품: ${names}` });
  }

  // hq_only 체크
  if (matched.purchase_mode === "hq_only") {
    return JSON.stringify({
      hqOnly: true,
      message: `${matched.name}은(는) 본사 일괄 구매 제품입니다. 본사에 발주해주세요.`,
    });
  }

  // 최저가 검색
  const results = await searchLowestPrice(matched.search_keyword || matched.name);

  if (results.length === 0) {
    return JSON.stringify({ noResults: true, message: `${matched.name} 검색 결과가 없습니다.` });
  }

  return JSON.stringify({
    success: true,
    productName: matched.name,
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
