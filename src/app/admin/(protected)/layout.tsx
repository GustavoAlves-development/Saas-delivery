import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminShell from "./_components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminShell empresaNome={session.user.empresaNome}>
      {children}
    </AdminShell>
  );
}
