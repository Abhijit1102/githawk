import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { requireAuth } from "@/lib/module/auth/utils/auth-utils";

// ✅ Must be async because we await requireAuth()
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await requireAuth();

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 px-4 bg-background">
          {/* Sidebar trigger button */}
          <SidebarTrigger className="-ml-1" />

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* Title */}
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        </header>

        {/* Main area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background text-foreground">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
