"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Volume2, VolumeX, Vibrate, X, MessageSquare, ClipboardList, ShoppingCart } from "lucide-react";

interface NotifSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  announcements: boolean;
  tasks: boolean;
  orders: boolean;
}

const DEFAULT: NotifSettings = { enabled: true, sound: true, vibration: true, announcements: true, tasks: true, orders: true };

function load(): NotifSettings {
  if (typeof window === "undefined") return DEFAULT;
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem("scoops_notif_settings") || "{}") }; }
  catch { return DEFAULT; }
}
function save(s: NotifSettings) {
  if (typeof window !== "undefined") localStorage.setItem("scoops_notif_settings", JSON.stringify(s));
}

export function getNotifSettings(): NotifSettings { return load(); }

export default function NotificationSettings() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setSettings(load());
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  const update = (key: keyof NotifSettings, val: boolean) => {
    const next = { ...settings, [key]: val };
    // 전체 끄면 하위도 끔
    if (key === "enabled" && !val) {
      next.sound = false; next.vibration = false;
      next.announcements = false; next.tasks = false; next.orders = false;
    }
    // 전체 켜면 하위도 켬
    if (key === "enabled" && val) {
      next.sound = true; next.vibration = true;
      next.announcements = true; next.tasks = true; next.orders = true;
    }
    setSettings(next);
    save(next);
  };

  const requestPerm = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const Toggle = ({ on, onChange, label, icon }: { on: boolean; onChange: (v: boolean) => void; label: string; icon: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="text-gray-500">{icon}</span>
        <span className="text-sm text-gray-800">{label}</span>
      </div>
      <button onClick={() => onChange(!on)}
        className={`w-11 h-6 rounded-full transition-colors relative ${on ? "bg-[#1B4332]" : "bg-gray-300"}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  return (
    <>
      {/* 🔔 아이콘 버튼 */}
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
        {settings.enabled ? <Bell size={20} className="text-gray-700" /> : <BellOff size={20} className="text-gray-400" />}
        {permission === "granted" && settings.enabled && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </button>

      {/* 설정 패널 */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-xl animate-slide-up pb-safe"
            onClick={e => e.stopPropagation()}>

            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">알림 설정</h3>
                <button onClick={() => setOpen(false)} className="text-gray-400"><X size={20} /></button>
              </div>

              {/* 브라우저 알림 권한 */}
              {permission !== "granted" && (
                <div className="bg-amber-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-amber-700 mb-2">브라우저 알림이 허용되지 않았습니다</p>
                  <button onClick={requestPerm} className="text-xs font-medium text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg">
                    🔔 알림 허용하기
                  </button>
                </div>
              )}
              {permission === "granted" && (
                <div className="bg-green-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-green-700">✅ 브라우저 알림이 허용되었습니다</p>
                </div>
              )}

              {/* 전체 ON/OFF */}
              <div className="border-b border-gray-100">
                <Toggle on={settings.enabled} onChange={v => update("enabled", v)} label="알림 전체"
                  icon={settings.enabled ? <Bell size={18} /> : <BellOff size={18} />} />
              </div>

              {settings.enabled && (
                <>
                  {/* 알림 방식 */}
                  <div className="mt-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 mt-2 mb-1">알림 방식</p>
                    <Toggle on={settings.sound} onChange={v => update("sound", v)} label="소리"
                      icon={settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />} />
                    <Toggle on={settings.vibration} onChange={v => update("vibration", v)} label="진동"
                      icon={<Vibrate size={18} />} />
                  </div>

                  {/* 알림 종류 */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mt-2 mb-1">알림 종류</p>
                    <Toggle on={settings.announcements} onChange={v => update("announcements", v)} label="공지사항"
                      icon={<MessageSquare size={18} />} />
                    <Toggle on={settings.tasks} onChange={v => update("tasks", v)} label="할일 배정"
                      icon={<ClipboardList size={18} />} />
                    <Toggle on={settings.orders} onChange={v => update("orders", v)} label="발주 알림"
                      icon={<ShoppingCart size={18} />} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
