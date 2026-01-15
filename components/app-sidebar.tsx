"use client";

import { useSession } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { navigationItems } from "@/constants";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, Moon, Sun } from "lucide-react";
import Logout from "@/lib/module/auth/components/Logout";

export const AppSidebar = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !session) return null;

  const user = session.user;
  const userName = user?.name ?? "Guest";
  const userEmail = user?.email ?? "";
  const userAvatar = user?.image ?? undefined;

  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar>
      {/* ================= HEADER ================= */}
      <SidebarHeader className="border-b">
        <div className="px-3 py-6">
          <div className="flex items-center gap-4 rounded-lg bg-sidebar-accent/50 px-3 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Image src="/github.svg" alt="GitHub" width={24} height={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-sidebar-foreground">
                Connected Account
              </p>
              <p className="truncate text-sm font-medium">@{userName}</p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* ================= CONTENT ================= */}
      <SidebarContent className="px-3 py-6">
        <SidebarMenu className="gap-2">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`h-11 rounded-lg px-4 transition-all ${
                  isActive(item.url)
                    ? "bg-sidebar-accent font-semibold"
                    : "hover:bg-sidebar-accent/60"
                }`}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* ================= FOOTER ================= */}
      <SidebarFooter className="border-t px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 flex items-center gap-3 px-4 rounded-lg hover:bg-sidebar-accent/50">
                  <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid min-w-0 text-left text-sm">
                    <span className="truncate font-semibold text-base">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      {userEmail}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-72 rounded-lg"
                align="end"
                sideOffset={8}
              >
                {/* Theme Toggle */}
                <DropdownMenuItem asChild>
                  <button
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-sidebar-accent/50 transition-colors text-sm font-medium"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-5 h-5" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5" />
                        Dark Mode
                      </>
                    )}
                  </button>
                </DropdownMenuItem>

                {/* Logout */}
                <DropdownMenuItem
                 className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-red-500/10 hover:text-red-600 transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5 mr-3 shrink-0"/>
                    <Logout>Sign Out</Logout>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
