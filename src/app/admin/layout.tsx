import type { Metadata } from "next";
import ChatFloatingButton from "@/components/fms/ChatFloatingButton";
import NotificationManager from "@/components/fms/NotificationManager";

export const metadata: Metadata = {
  title: "SCOOPS 관리자",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ChatFloatingButton />
      <NotificationManager />
    </>
  );
}
