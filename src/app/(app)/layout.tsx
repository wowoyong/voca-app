import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AppShell from "./AppShell";

/** 인증된 사용자만 접근 가능한 앱 레이아웃 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
