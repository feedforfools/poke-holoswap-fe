"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { isMobile } = useSidebar();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine the icon based on resolvedTheme AFTER client mount
  const CurrentThemeIcon = React.useMemo(() => {
    const effectiveTheme = resolvedTheme || theme;
    switch (effectiveTheme) {
      case "light":
        return Sun;
      case "dark":
        return Moon;
      default:
        return Monitor;
    }
  }, [resolvedTheme, theme]);

  // Determine display text (handles 'system' theme)
  const displayTheme = theme ?? "system";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className="w-full justify-start"
          aria-label="Change theme"
          tooltip="Change theme"
        >
          {/* Render Skeleton or fallback icon before client mount */}
          {!isClient ? (
            <Skeleton className="w-4 h-4 rounded-sm" /> // Placeholder skeleton
          ) : (
            // Or a default icon like Monitor: <Monitor />
            <CurrentThemeIcon className="transition-transform duration-500 ease-in-out" />
          )}

          <span className="text-xs group-data-[collapsible=icon]:hidden truncate">
            {!isClient ? (
              <Skeleton className="w-16 h-4" /> // Placeholder text skeleton
            ) : (
              <>
                Theme:{" "}
                <span
                  suppressHydrationWarning
                  className="capitalize font-medium"
                >
                  {displayTheme}
                </span>
              </>
            )}
          </span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? "bottom" : "right"}
        align="start"
        className="min-w-[100px]"
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" /> <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" /> <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" /> <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
