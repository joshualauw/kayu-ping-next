"use client";

import { Bell, LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DynamicBreadcrumb } from "@/components/admin/breadcrumb";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-context";

export function AdminHeader() {
  const user = useAuth();
  const router = useRouter();

  const [openNotifications, setOpenNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  async function handleSignOut() {
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="mx-2 hidden h-4 w-px bg-border md:block" />
        <DynamicBreadcrumb />
      </div>

      <div className="flex items-center gap-4">
        <Popover
          open={openNotifications}
          onOpenChange={(nextOpen: boolean) => {
            setOpenNotifications(nextOpen);
            if (nextOpen) setUnreadCount(0);
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground transition-colors hover:text-primary">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-80 overflow-hidden p-0">
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="min-w-0 py-1">
                <p className="leading-none font-semibold text-foreground">Notifications</p>
              </div>
              {unreadCount > 0 && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">{unreadCount} new</span>
              )}
            </div>

            <div className="border-t" />

            <div className="max-h-60 overflow-y-auto text-sm">
              <div className="px-3 py-8">
                <p className="text-center text-xs text-muted-foreground">No notifications yet.</p>
              </div>
            </div>

            <div className="border-t" />
            <div className="p-1.5">
              <Button variant="ghost" className="h-8 w-full justify-center font-normal text-muted-foreground hover:text-foreground">
                See all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="mx-1 h-6 w-px bg-border" />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 p-2">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground">{user.email}</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src={""} alt={user.name} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                    {user.name.split(" ")[1]?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-44" align="end" forceMount>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={async (e) => {
                  e.preventDefault();
                  await handleSignOut();
                }}
                className="text-destructive focus:bg-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
