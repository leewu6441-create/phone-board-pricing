import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Middleware already protects non-login routes, but layout needs to handle
  // the fact that login page also goes through this layout
  if (!session) {
    // Render login page without sidebar
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar userEmail={session.email} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
