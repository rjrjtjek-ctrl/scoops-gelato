import Image from "next/image";
import SubNav from "@/components/SubNav";

const events = [
  {
    id: 1,
    status: "진행중",
    period: "2026.03.01 ~ 2026.03.31",
    title: "봄맞이 1+1 이벤트",
    desc: "3월 한 달간 시그니처 젤라또 전 메뉴 1+1! 봄의 시작을 스쿱스와 함께하세요.",
  },
  {
    id: 2,
    status: "진행중",
    period: "2026.03.10 ~ 2026.03.24",
    title: "관저점 오픈 기념 이벤트",
    desc: "관저점 오픈을 기념하여 방문 고객 전원에게 미니 젤라또 1스쿱을 증정합니다.",
  },
  {
    id: 3,
    status: "예정",
    period: "2026.04.01 ~ 2026.04.30",
    title: "인스타그램 리뷰 이벤트",
    desc: "인스타그램에 스쿱스젤라또 리뷰를 올려주신 분 중 매주 10분을 선정하여 1만원 상당의 기프티콘을 드립니다.",
  },
  {
    id: 4,
    status: "종료",
    period: "2026.02.01 ~ 2026.02.28",
    title: "발렌타인 젤라또 선물 세트",
    desc: "사랑하는 사람에게 전하는 달콤한 선물. 하트 모양 젤라또 선물 세트를 한정 판매했습니다.",
  },
  {
    id: 5,
    status: "종료",
    period: "2025.12.20 ~ 2026.01.05",
    title: "연말 감사 20% 할인",
    desc: "한 해 동안 사랑해주신 고객님들께 감사의 마음을 담아 전 메뉴 20% 할인을 진행했습니다.",
  },
];

function statusColor(status: string) {
  if (status === "진행중") return "bg-brand-primary text-white";
  if (status === "예정") return "bg-brand-secondary text-white";
  return "bg-black/10 text-text-light";
}

export default function EventsPage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="NEWS" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Events</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">이벤트</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            스쿱스젤라또의 다양한 이벤트와 프로모션을 확인하세요.
          </p>
        </div>
      </section>

      {/* 이벤트 리스트 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <div className="space-y-6">
            {events.map((ev) => (
              <div key={ev.id} className="flex flex-col md:flex-row gap-6 p-6 bg-bg-cream rounded-2xl group cursor-pointer hover:shadow-sm transition-shadow">
                {/* 썸네일 */}
                <div className="w-full md:w-48 aspect-[3/2] md:aspect-square rounded-xl bg-bg-warm flex items-center justify-center shrink-0 overflow-hidden">
                  <Image src="/images/logo_symbol.png" alt="" width={50} height={50} className="opacity-10" />
                </div>
                {/* 내용 */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${statusColor(ev.status)}`}>
                      {ev.status}
                    </span>
                    <span className="text-xs text-text-light">{ev.period}</span>
                  </div>
                  <h3 className="text-lg font-medium text-brand-primary mb-2 group-hover:text-brand-accent transition-colors">
                    {ev.title}
                  </h3>
                  <p className="text-sm text-text-body leading-relaxed">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
