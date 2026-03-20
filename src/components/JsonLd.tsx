export default function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "스쿱스 젤라떼리아",
    alternateName: "SCOOPS GELATERIA",
    url: "https://scoopsgelato.kr",
    logo: "https://scoopsgelato.kr/images/logo-scoops.png",
    description: "이탈리아 정통 프리미엄 젤라또 프랜차이즈. 전국 17개 매장에서 매일 직접 만드는 신선한 수제 젤라또.",
    foundingDate: "2018",
    founder: { "@type": "Person", name: "정석주" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+82-1811-0259",
      contactType: "customer service",
      availableLanguage: "Korean",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "사직대로 366 1층",
      addressLocality: "청주시 상당구",
      addressRegion: "충청북도",
      postalCode: "28518",
      addressCountry: "KR",
    },
    sameAs: ["https://www.instagram.com/_scoopsgelato_/"],
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": "https://scoopsgelato.kr/#business",
    name: "스쿱스 젤라떼리아 청주본점",
    image: "https://scoopsgelato.kr/images/store-chungbuk-ext.jpg",
    url: "https://scoopsgelato.kr",
    telephone: "1811-0259",
    servesCuisine: "젤라또, 디저트",
    priceRange: "₩₩",
    address: {
      "@type": "PostalAddress",
      streetAddress: "사직대로 366 1층",
      addressLocality: "청주시 상당구",
      addressRegion: "충청북도",
      postalCode: "28518",
      addressCountry: "KR",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "10:00",
      closes: "22:00",
    },
    menu: "https://scoopsgelato.kr/menu",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "스쿱스 젤라떼리아",
    url: "https://scoopsgelato.kr",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://scoopsgelato.kr/stores",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
