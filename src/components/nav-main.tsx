"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
  comingSoon?: boolean;
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname(); // Hook to get current URL path

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Determine if the current item or one of its sub-items is active
          const isActive =
            !item.comingSoon &&
            (pathname === item.url ||
              item.items?.some((sub) => pathname?.startsWith(sub.url)));

          const isEffectivelyDisabled = !!item.comingSoon;

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem>
                {/* Render button differently based on disabled state */}
                <SidebarMenuButton
                  asChild={!isEffectivelyDisabled}
                  tooltip={item.title}
                  isActive={isActive}
                  disabled={isEffectivelyDisabled}
                  className={cn(
                    isEffectivelyDisabled &&
                      "opacity-60 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent" // Add disabled styles
                  )}
                  // Prevent click behavior if disabled (redundant with pointer-events-none from disabled prop usually)
                  onClick={(e) => {
                    if (isEffectivelyDisabled) e.preventDefault();
                  }}
                  // Use aria-disabled for accessibility
                  aria-disabled={isEffectivelyDisabled}
                >
                  {/* Conditionally render Link or a simple div/span */}
                  {isEffectivelyDisabled ? (
                    // Render non-interactive content when disabled
                    <div className="flex w-full items-center gap-2">
                      <item.icon className="size-4 shrink-0" />{" "}
                      <span className="flex-1">{item.title}</span>
                      {item.comingSoon && (
                        <span className="ml-auto text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full group-data-[collapsible=icon]:hidden">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  ) : (
                    // Render Link when not disabled
                    <Link href={item.url}>
                      <item.icon className="size-4 shrink-0" />{" "}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>

                {/* Sub-items (if any) */}
                {item.items?.length && !isEffectivelyDisabled ? (
                  <>
                    <CollapsibleTrigger
                      asChild
                      className="absolute right-1 top-1.5 group-data-[collapsible=icon]:hidden"
                      disabled={isEffectivelyDisabled}
                    >
                      <SidebarMenuAction>
                        <ChevronRight />
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
