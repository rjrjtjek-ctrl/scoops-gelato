import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "스쿱스 젤라떼리아 개인정보처리방침. 개인정보 수집, 이용, 보관, 파기에 관한 안내입니다.",
  alternates: { canonical: "https://scoopsgelato.kr/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="pt-[100px] pb-20 bg-bg-white">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-primary mb-8">
          개인정보처리방침
        </h1>

        <div className="prose prose-sm max-w-none text-text-body leading-[2] space-y-8">
          <section>
            <h2 className="text-lg font-bold text-brand-primary mb-3">
              제1조 (개인정보의 수집 및 이용 목적)
            </h2>
            <p>
              스쿱스 젤라떼리아(이하 &ldquo;회사&rdquo;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>가맹 상담 문의 접수 및 회신</li>
              <li>고객 문의 응대 및 서비스 개선</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-primary mb-3">
              제2조 (수집하는 개인정보의 항목)
            </h2>
            <p>회사는 가맹 상담 문의를 위해 아래와 같은 개인정보를 수집합니다.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>필수 항목: 이름, 연락처, 이메일, 희망 지역</li>
              <li>선택 항목: 문의 내용</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-primary mb-3">
              제3조 (개인정보의 보유 및 이용 기간)
            </h2>
            <p>
              회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 다음의 경우에는 아래의 기간 동안 보유합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>가맹 상담 문의 기록: 문의 접수일로부터 3년 (또는 동의 철회 시까지)</li>
              <li>관계 법령에 의한 보존: 해당 법령이 정한 기간</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-primary mb-3">
              제4조 (개인정보의 제3자 제공)
            </h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-primary mb-3">
              제5조 (개인정보의 파기)
            </h2>
            <p>
              회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체 없이 해당 개인정보를 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-primary mb-3">
              제6조 (이용자의 권리와 행사 방법)
            </h2>
            <p>
              이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요구할 수 있습니다.
              위 권리 행사는 아래 연락처를 통해 요청하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-primary mb-3">
              제7조 (개인정보 보호책임자)
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>성명: 정석주</li>
              <li>직위: 대표</li>
              <li>연락처: 1811-0259</li>
              <li>이메일: rjrjtjek@naver.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-primary mb-3">
              제8조 (개인정보처리방침 변경)
            </h2>
            <p>
              이 개인정보처리방침은 2026년 3월 18일부터 적용됩니다.
              변경 사항이 있을 경우 웹사이트를 통해 공지할 예정입니다.
            </p>
          </section>

          <div className="border-t border-black/10 pt-6 mt-8">
            <p className="text-xs text-text-light">
              시행일자: 2026년 3월 18일
            </p>
            <p className="text-xs text-text-light mt-1">
              ※ 본 개인정보처리방침의 상세 내용은 법무팀 검토 후 업데이트될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
