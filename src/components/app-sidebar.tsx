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
  Package,
  LifeBuoy,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary, NavSecondaryItem } from "@/components/nav-secondary";
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
    name: "User Name",
    email: "Prototype User",
    avatar: "/avatars/placeholder.png",
  },
  navMain: [
    { title: "Browse Cards", url: "/browse", icon: Home },
    {
      title: "My Collection",
      url: "/collection",
      icon: LayoutGrid,
    },
    { title: "Wishlist", url: "/wishlist", icon: Heart },
    { title: "Trades", url: "/trades", icon: Repeat, comingSoon: true },
    { title: "Friends", url: "/friends", icon: Users, comingSoon: true },
    { title: "Settings", url: "/settings", icon: Settings, comingSoon: true },
  ],
};

const FEEDBACK_URL =
  "https://github.com/feedforfools/poke-holoswap-fe/issues/new";

const navSecondaryData: NavSecondaryItem[] = [
  {
    title: "Feedback",
    url: FEEDBACK_URL,
    icon: LifeBuoy,
    external: true,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        {/* Logo/Title Link */}
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

      {/* Main navigation */}
      <SidebarContent className="flex flex-col p-0">
        <NavMain items={navData.navMain} />
        <div className="mt-auto flex flex-col">
          <SidebarMenu className="pl-2">
            <SidebarMenuItem>
              <ThemeToggle />
            </SidebarMenuItem>
          </SidebarMenu>
          <NavSecondary items={navSecondaryData} />
        </div>
      </SidebarContent>
      {/* Footer section containing Secondary Nav and User Menu */}
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <NavUser user={navData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
