"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle, XCircle, Loader2 } from "lucide-react";

type TestResult = "idle" | "testing" | "success" | "fail";

export default function PrinterTestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({
    popup: "idle",
    iframe: "idle",
    directPrint: "idle",
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [kioskMode, setKioskMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString("ko-KR");
    setLogs((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  const setResult = (key: string, val: TestResult) => {
    setResults((prev) => ({ ...prev, [key]: val }));
  };

  const SAMPLE_RECEIPT = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{margin:0;size:80mm auto}*{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Malgun Gothic',sans-serif;width:80mm;padding:8mm 5mm;font-size:13px;color:#000}
    .center{text-align:center}.bold{font-weight:bold}
    .big{font-size:28px;font-weight:900;letter-spacing:2px}
    .divider{border:none;border-top:1px dashed #000;margin:8px 0}
    .divider-thick{border:none;border-top:2px solid #000;margin:8px 0}
    table{width:100%;border-collapse:collapse}
    .total-row td{font-size:16px;font-weight:900;padding:6px 0}
    .footer{font-size:10px;color:#999;margin-top:12px}
  </style></head><body>
    <div class="center"><p class="bold" style="font-size:15px">SCOOPS GELATERIA</p><p style="font-size:12px;color:#666">청주본점</p></div>
    <hr class="divider-thick">
    <div class="center"><p style="font-size:12px;color:#666">[ 테스트 영수증 ]</p><p class="big">T001</p></div>
    <hr class="divider">
    <table><tr><td style="font-size:11px;color:#666">주문유형</td><td style="text-align:right;font-weight:bold">매장식사</td></tr></table>
    <hr class="divider">
    <table><tr><td>EAT NOW 2가지맛</td><td style="text-align:right">6,000원</td></tr>
    <tr><td colspan="2" style="font-size:11px;color:#666;padding:0 0 4px 8px">→ 생명쌀, 민트초콜릿칩</td></tr>
    <tr><td>달모어 12y 30ml x1</td><td style="text-align:right">9,800원</td></tr></table>
    <hr class="divider-thick">
    <table><tr class="total-row"><td>합계</td><td style="text-align:right">15,800원</td></tr></table>
    <hr class="divider">
    <div class="center footer"><p>스쿱스 젤라떼리아</p><p>Tel. 1811-0259</p><p style="margin-top:4px">프린터 테스트</p></div>
  </body></html>`;

  const testPopup = () => {
    setResult("popup", "testing");
    addLog("테스트 1 시작: 팝업 창 방식");
    const printWin = window.open("", "_blank", "width=320,height=600");
    if (!printWin || printWin.closed) {
      setResult("popup", "fail");
      addLog("❌ 팝업이 차단됨! 주소창의 팝업 차단 아이콘에서 '이 사이트 팝업 허용'을 클릭해주세요.");
      return;
    }
    addLog("✅ 팝업 창 열림");
    printWin.document.open();
    printWin.document.write(SAMPLE_RECEIPT);
    printWin.document.close();
    let printed = false;
    const doPrint = () => {
      if (printed) return;
      printed = true;
      try {
        printWin.print();
        addLog("✅ print() 호출 성공 — 프린터에서 출력됐나요?");
        setResult("popup", "success");
      } catch (e) {
        addLog("❌ print() 호출 실패: " + e);
        setResult("popup", "fail");
      }
      setTimeout(() => { try { printWin.close(); } catch {} addLog("팝업 창 닫힘"); }, 3000);
    };
    printWin.onload = () => setTimeout(doPrint, 500);
    setTimeout(doPrint, 1500);
  };

  const testIframe = () => {
    setResult("iframe", "testing");
    addLog("테스트 2 시작: iframe 방식");
    try {
      const iframe = iframeRef.current;
      if (!iframe) { addLog("❌ iframe 요소 없음"); setResult("iframe", "fail"); return; }
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) { addLog("❌ iframe document 접근 불가"); setResult("iframe", "fail"); return; }
      doc.open(); doc.write(SAMPLE_RECEIPT); doc.close();
      addLog("✅ iframe에 영수증 작성 완료");
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
          addLog("✅ iframe print() 호출 성공");
          setResult("iframe", "success");
        } catch (e) { addLog("❌ iframe print() 실패: " + e); setResult("iframe", "fail"); }
      }, 500);
    } catch (e) { addLog("❌ iframe 오류: " + e); setResult("iframe", "fail"); }
  };

  const testDirectPrint = () => {
    setResult("directPrint", "testing");
    addLog("테스트 3 시작: window.print()");
    try { window.print(); addLog("✅ window.print() 호출 성공"); setResult("directPrint", "success"); }
    catch (e) { addLog("❌ window.print() 실패: " + e); setResult("directPrint", "fail"); }
  };

  const getIcon = (status: TestResult) => {
    switch (status) {
      case "idle": return <div className="w-6 h-6 rounded-full bg-gray-200" />;
      case "testing": return <Loader2 size={24} className="text-blue-500 animate-spin" />;
      case "success": return <CheckCircle size={24} className="text-green-500" />;
      case "fail": return <XCircle size={24} className="text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></Link>
          <Printer size={20} className="text-gray-700" />
          <h1 className="text-lg font-bold text-gray-900">프린터 연결 테스트</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h2 className="font-bold text-blue-900 mb-2">CPP-3000 연결 후 사용 방법</h2>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>CPP-3000 USB를 POS 컴퓨터에 꽂고 드라이버 설치</li>
            <li>제어판 → 장치 및 프린터에서 CPP-3000이 보이는지 확인</li>
            <li>CPP-3000을 <strong>기본 프린터</strong>로 설정</li>
            <li>아래 테스트 버튼을 순서대로 눌러보세요</li>
          </ol>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-bold text-gray-900 mb-3">사전 확인 체크리스트</h2>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span>CPP-3000 전원 켜짐 + USB 연결됨</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span>제어판 → 장치 및 프린터에 CPP-3000 보임</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span>CPP-3000이 기본 프린터로 설정됨</span></label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" checked={kioskMode} onChange={(e) => setKioskMode(e.target.checked)} />
              <span>Chrome 바로가기에 --kiosk-printing 추가함</span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-gray-900">인쇄 테스트 (순서대로 눌러보세요)</h2>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon(results.popup)}
                <div>
                  <p className="font-medium text-gray-900">테스트 1: 팝업 창 방식</p>
                  <p className="text-xs text-gray-500">현재 자동 인쇄에 사용하는 방식</p>
                </div>
              </div>
              <button onClick={testPopup} disabled={results.popup === "testing"} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm font-medium hover:bg-[#2D6A4F] disabled:opacity-50">테스트</button>
            </div>
            {results.popup === "success" && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">{kioskMode ? "대화상자 없이 바로 출력됐으면 완벽합니다! 이 상태로 운영하세요." : "인쇄 대화상자가 떴다면 → --kiosk-printing 설정 후 다시 테스트하세요."}</p>
              </div>
            )}
            {results.popup === "fail" && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">팝업이 차단됐습니다. 주소창 오른쪽 팝업 차단 아이콘 → &quot;이 사이트 팝업 허용&quot; → 다시 테스트</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon(results.iframe)}
                <div>
                  <p className="font-medium text-gray-900">테스트 2: iframe 방식</p>
                  <p className="text-xs text-gray-500">팝업 없이 숨겨진 영역에서 인쇄</p>
                </div>
              </div>
              <button onClick={testIframe} disabled={results.iframe === "testing"} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm font-medium hover:bg-[#2D6A4F] disabled:opacity-50">테스트</button>
            </div>
            {results.iframe === "success" && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg"><p className="text-sm text-green-800">팝업 창 없이 인쇄 가능! 이 방식이 더 깔끔합니다.</p></div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon(results.directPrint)}
                <div>
                  <p className="font-medium text-gray-900">테스트 3: 현재 페이지 직접 인쇄</p>
                  <p className="text-xs text-gray-500">프린터 연결 자체를 확인</p>
                </div>
              </div>
              <button onClick={testDirectPrint} disabled={results.directPrint === "testing"} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm font-medium hover:bg-[#2D6A4F] disabled:opacity-50">테스트</button>
            </div>
          </div>
        </div>

        {(results.popup !== "idle" || results.iframe !== "idle") && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-bold text-gray-900 mb-3">결과 판정</h2>
            {results.popup === "success" && <div className="p-3 bg-green-50 rounded-lg mb-2"><p className="text-sm font-medium text-green-800">✅ 팝업 방식 사용 가능</p><p className="text-xs text-green-700 mt-1">{kioskMode ? "--kiosk-printing 적용됨 → 자동 출력 가능. 이 상태로 운영하세요." : "--kiosk-printing 미적용 → 주문마다 인쇄 대화상자가 뜹니다."}</p></div>}
            {results.iframe === "success" && <div className="p-3 bg-green-50 rounded-lg mb-2"><p className="text-sm font-medium text-green-800">✅ iframe 방식 사용 가능</p><p className="text-xs text-green-700 mt-1">팝업 없이 깔끔하게 인쇄 가능합니다.</p></div>}
            {results.popup === "fail" && results.iframe === "fail" && <div className="p-3 bg-red-50 rounded-lg"><p className="text-sm font-medium text-red-800">❌ 두 방식 모두 실패 — 프린터 연결과 기본 프린터 설정을 확인해주세요.</p></div>}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-bold text-gray-900 mb-3">--kiosk-printing 설정 방법</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p>이 설정을 하면 인쇄 대화상자 없이 바로 프린터로 출력됩니다.</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>바탕화면의 Chrome 아이콘을 <strong>우클릭</strong> → <strong>속성</strong></li>
              <li>&quot;대상(T)&quot; 칸 맨 끝에 한 칸 띄우고 추가:<br/><code className="bg-gray-100 px-2 py-1 rounded text-xs block mt-1">--kiosk-printing</code></li>
              <li>전체가 이렇게 됩니다:<br/><code className="bg-gray-100 px-2 py-1 rounded text-xs block mt-1 break-all">&quot;C:\Program Files\Google\Chrome\Application\chrome.exe&quot; --kiosk-printing</code></li>
              <li>확인 → Chrome <strong>완전히 종료</strong> → 다시 열기</li>
              <li>이 페이지로 돌아와서 테스트 1, 2를 다시 해보세요</li>
            </ol>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">테스트 로그</h2>
            <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-gray-600">지우기</button>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 max-h-60 overflow-y-auto">
            {logs.length === 0
              ? <p className="text-gray-500 text-xs">테스트를 실행하면 로그가 여기에 표시됩니다.</p>
              : logs.map((log, i) => <p key={i} className="text-xs text-green-400 font-mono leading-relaxed">{log}</p>)
            }
          </div>
        </div>
      </div>

      <iframe ref={iframeRef} style={{ position: "absolute", left: "-9999px", width: "80mm", height: "0" }} title="receipt-print" />
    </div>
  );
}
