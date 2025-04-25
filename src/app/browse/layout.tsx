import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

// This layout wraps pages within the /browse route segment
export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // SidebarProvider manages the state (open/closed, mobile) of the sidebar
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
