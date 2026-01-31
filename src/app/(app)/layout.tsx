import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AppShell from "./AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
