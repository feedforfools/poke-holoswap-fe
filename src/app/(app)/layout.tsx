import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CollectionProvider } from "@/contexts/collection-context";

// This layout wraps pages within the /browse route segment
export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // SidebarProvider manages the state (open/closed, mobile) of the sidebar
    <CollectionProvider>
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    </CollectionProvider>
  );
}
