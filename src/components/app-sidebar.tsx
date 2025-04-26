"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  LayoutGrid,
  Heart,
  Users,
  Repeat,
  Settings,
  LifeBuoy,
  Send,
  Package,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navData = {
  user: {
    name: "User Name", // Placeholder
    email: "user@example.com", // Placeholder
    avatar: "/avatars/placeholder.png", // Placeholder
  },
  navMain: [
    {
      title: "Browse Cards",
      url: "/browse",
      icon: Home,
    },
    {
      title: "My Collection",
      url: "/collection", // Placeholder URL
      icon: LayoutGrid,
      items: [
        // Example sub-items (optional)
        { title: "Owned", url: "/collection?view=owned" },
        { title: "Doubles", url: "/collection?view=doubles" },
      ],
    },
    {
      title: "Wishlist",
      url: "/wishlist", // Placeholder URL
      icon: Heart,
    },
    {
      title: "Trades",
      url: "/trades", // Placeholder URL
      icon: Repeat,
    },
    {
      title: "Friends",
      url: "/friends", // Placeholder URL
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings", // Placeholder URL
      icon: Settings,
    },
  ],
  // navSecondary: [
  //   { title: "Support", url: "#", icon: LifeBuoy },
  //   { title: "Feedback", url: "#", icon: Send },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/browse">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Package className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">HoloSwap</span>
                  <span className="truncate text-xs">Card Collector</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2 p-2 border-t border-sidebar-border">
        <div className="flex items-center justify-center mt-2 mb-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mb-0">
          <ThemeToggle />
        </div>
        {/* Optional: Add a separator */}
        {/* <SidebarSeparator className="my-1 group-data-[collapsible=icon]:hidden" /> */}
        <NavUser user={navData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
