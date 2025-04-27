"use client";

import * as React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface NavSecondaryItem {
  title: string;
  url: string;
  icon: LucideIcon;
  external?: boolean;
}

export function NavSecondary({
  items,
  className,
  ...props
}: {
  items: NavSecondaryItem[];
  className?: string;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup className={cn("p-2", className)} {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm" tooltip={item.title}>
                {item.external ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </a>
                ) : (
                  <Link href={item.url}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
