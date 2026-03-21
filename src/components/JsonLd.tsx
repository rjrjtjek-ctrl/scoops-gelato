export default function JsonLd() {
  const SITE_URL = "https://scoopsgelato.kr";

  /* ── 1. Organization ── */
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "스쿱스 젤라떼리아",
    alternateName: "SCOOPS GELATERIA",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/logo-scoops.png`,
      width: 400,
      height: 400,
    },
    description:
      "이탈리아 정통 프리미엄 젤라또 프랜차이즈. 매장에서 매일 직접 만드는 신선한 수제 젤라또.",
    foundingDate: "2018",
    founder: { "@type": "Person", name: "정석주" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+82-1811-0259",
      contactType: "customer service",
      availableLanguage: "Korean",
      areaServed: "KR",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "1순환로 672번길 35, 1층",
      addressLocality: "청주시 서원구",
      addressRegion: "충청북도",
      postalCode: "28616",
      addressCountry: "KR",
    },
    sameAs: ["https://www.instagram.com/_scoopsgelato_/"],
  };

  /* ── 2. Local Business (청주본점) ── */
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#business`,
    name: "스쿱스 젤라떼리아 청주본점",
    image: `${SITE_URL}/images/store-chungbuk-ext.jpg`,
    url: SITE_URL,
    telephone: "+82-1811-0259",
    servesCuisine: ["젤라또", "소르베또", "디저트", "커피"],
    priceRange: "₩₩",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1순환로 672번길 35, 1층",
      addressLocality: "청주시 서원구",
      addressRegion: "충청북도",
      postalCode: "28616",
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 36.6358,
      longitude: 127.4595,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday", "Tuesday", "Wednesday", "Thursday",
          "Friday", "Saturday", "Sunday",
        ],
        opens: "10:00",
        closes: "22:00",
      },
    ],
    menu: `${SITE_URL}/menu`,
    acceptsReservations: false,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };

  /* ── 3. WebSite + SearchAction ── */
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "스쿱스 젤라떼리아",
    alternateName: "SCOOPS GELATERIA",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "ko-KR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/stores?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  /* ── 4. BreadcrumbList ── */
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "메뉴", item: `${SITE_URL}/menu` },
      { "@type": "ListItem", position: 3, name: "매장 찾기", item: `${SITE_URL}/stores` },
      { "@type": "ListItem", position: 4, name: "가맹 문의", item: `${SITE_URL}/franchise` },
      { "@type": "ListItem", position: 5, name: "브랜드 스토리", item: `${SITE_URL}/story` },
    ],
  };

  /* ── 5. FAQPage ── */
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "스쿱스 젤라또 가맹 비용은 얼마인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "가맹 비용은 매장 규모와 위치에 따라 다릅니다. 자세한 상담은 1811-0259로 문의해 주세요.",
        },
      },
      {
        "@type": "Question",
        name: "스쿱스 젤라또는 어디서 만드나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "스쿱스 젤라또는 각 매장에서 매일 직접 만듭니다. 이탈리아 정통 방식으로 신선한 재료를 사용하여 매일 소량 생산합니다.",
        },
      },
      {
        "@type": "Question",
        name: "업종변환도 가능한가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "네, 기존 카페나 디저트 매장을 스쿱스 젤라또 매장으로 업종변환이 가능합니다. 최소 비용으로 빠른 리뉴얼을 지원합니다.",
        },
      },
      {
        "@type": "Question",
        name: "가맹점 교육은 어떻게 진행되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "본사에서 체계적인 젤라또 제조 교육과 매장 운영 교육을 제공합니다. 오픈 후에도 지속적인 레시피 업데이트와 운영 지원을 받을 수 있습니다.",
        },
      },
    ],
  };

  /* ── 6. Menu ── */
  const menuSchema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${SITE_URL}/#menu`,
    name: "스쿱스 젤라떼리아 메뉴",
    url: `${SITE_URL}/menu`,
    hasMenuSection: [
      {
        "@type": "MenuSection",
        name: "시그니처 젤라또",
        hasMenuItem: [
          { "@type": "MenuItem", name: "갓지은쌀", description: "갓 지은 쌀로 만든 고소한 젤라또" },
          { "@type": "MenuItem", name: "벨기에 다크 카카오", description: "진한 벨기에 다크 초콜릿 젤라또" },
          { "@type": "MenuItem", name: "밀라노 티라미수", description: "이탈리아 정통 티라미수 젤라또" },
          { "@type": "MenuItem", name: "피스타치오", description: "시칠리아 피스타치오 젤라또" },
        ],
      },
      {
        "@type": "MenuSection",
        name: "소르베또",
        description: "유제품 없이 과일 본연의 맛을 살린 소르베또",
      },
      {
        "@type": "MenuSection",
        name: "커피",
        description: "스페셜티 원두로 내린 핸드드립 커피",
      },
    ],
  };

  const schemas = [organization, localBusiness, website, breadcrumb, faq, menuSchema];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
