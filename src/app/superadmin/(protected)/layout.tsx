import { getSASession } from "@/lib/superadmin-session";
import { redirect } from "next/navigation";
import SAShell from "./_components/SAShell";

export default async function SuperAdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSASession();
  if (!session) redirect("/superadmin/login");

  return <SAShell adminEmail={session.email}>{children}</SAShell>;
}
