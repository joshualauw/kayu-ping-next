import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { auth } from "@/lib/auth";
import { unauthorized } from "next/navigation";
import { AuthProvider } from "@/providers/auth-context";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = await getAuthenticatedUser(session?.user?.id);

  if (!user) {
    unauthorized();
  }

  return (
    <AuthProvider user={user}>
      <SidebarProvider>
        <AdminSidebar />
        <main className="h-full w-full">
          <AdminHeader />
          <div className="mx-auto max-w-[85rem] space-y-8 p-4 lg:px-8">{children}</div>
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}
