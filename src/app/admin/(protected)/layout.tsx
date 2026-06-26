import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "./_components/Sidebar";

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar empresaNome={session.user.empresaNome} />
      <main className="ml-60 flex-1 p-8">{children}</main>
    </div>
  );
}
