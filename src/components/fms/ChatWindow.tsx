"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 히스토리 로드
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("/api/fms/chat/history?limit=50", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch {}
      setHistoryLoaded(true);
    };
    loadHistory();
  }, []);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");

    // 낙관적 업데이트
    const tempId = `temp_${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, role: "user", content: userMsg, createdAt: new Date().toISOString() }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/fms/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-[9998] md:w-[400px] md:h-[600px] bg-white md:rounded-2xl md:shadow-2xl flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="h-14 bg-[#1a1a1a] flex items-center justify-between px-4 shrink-0">
        <span className="text-white font-medium text-sm">🍨 SCOOPS AI 어시스턴트</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
        {!historyLoaded ? (
          <div className="text-center text-gray-400 text-sm py-8">로딩 중...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">안녕하세요! 무엇을 도와드릴까요? 😊</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#D4A574] text-[#1a1a1a] rounded-[12px] rounded-br-[4px]"
                    : "bg-[#f0f0f0] text-[#333] rounded-[12px] rounded-bl-[4px]"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-[#8B6E45]" : "text-gray-400"}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}

        {/* 타이핑 표시 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#f0f0f0] rounded-[12px] rounded-bl-[4px] px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="border-t bg-white p-3 shrink-0 safe-area-bottom">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-gray-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 bg-[#D4A574] rounded-full flex items-center justify-center disabled:opacity-40 shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
