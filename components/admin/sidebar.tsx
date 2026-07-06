"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  ChevronRight,
  HandCoins,
  Gauge,
  Package,
  Repeat,
  ShoppingBag,
  TreeDeciduous,
  Settings,
  Users,
  Boxes,
  Truck,
  PackageCheck,
  Warehouse,
  UserRoundSearch,
  ChartColumnStacked,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  href: string;
  isActive?: boolean;
  group?: string;
}

export function AdminSidebar() {
  const pathName = usePathname();

  const navs: NavItem[] = [
    {
      name: "Dashboard",
      icon: <Gauge className="mr-1" />,
      href: "/admin/dashboard",
      group: "Overview",
    },
    {
      name: "Inventory",
      icon: <Package className="mr-1" />,
      href: "/admin/inventories",
      group: "Overview",
    },
    {
      name: "Stock Mutations",
      icon: <Repeat className="mr-1" />,
      href: "/admin/stock-mutations",
      group: "Overview",
    },
    {
      name: "Locations",
      icon: <Warehouse className="mr-1" />,
      href: "/admin/locations",
      group: "Master",
    },
    {
      name: "Contacts",
      icon: <Users className="mr-1" />,
      href: "/admin/contacts",
      group: "Master",
    },
    {
      name: "Woods",
      icon: <TreeDeciduous className="mr-1" />,
      href: "/admin/woods",
      group: "Master",
    },
    {
      name: "Materials",
      icon: <Boxes className="mr-1" />,
      href: "/admin/materials",
      group: "Master",
    },
    {
      name: "Grades",
      icon: <ChartColumnStacked className="mr-1" />,
      href: "/admin/grades",
      group: "Master",
    },
    {
      name: "Purchases",
      icon: <ShoppingBag className="mr-1" />,
      href: "/admin/purchases",
      group: "Core",
    },
    {
      name: "Movements",
      icon: <Truck className="mr-1" />,
      href: "/admin/movements",
      group: "Core",
    },
    {
      name: "Processing",
      icon: <Settings className="mr-1" />,
      href: "/admin/processings",
      group: "Core",
    },
    {
      name: "Adjustment",
      icon: <PackageCheck className="mr-1" />,
      href: "#",
      group: "Core",
    },
    {
      name: "Grading",
      icon: <UserRoundSearch className="mr-1" />,
      href: "/admin/gradings",
      group: "Core",
    },
    {
      name: "Sales",
      icon: <HandCoins className="mr-1" />,
      href: "/admin/sales",
      group: "Core",
    },
  ];

  const groupedNavs = Array.from(
    navs.reduce((groups, nav) => {
      const group = nav.group ?? "Other";
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)?.push(nav);
      return groups;
    }, new Map<string, NavItem[]>()),
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="mb-2 px-2 pt-4">
          Kayuping
          <div className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Wood Inventory System</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {groupedNavs.map(([groupTitle, groupNavs]) => (
            <div key={groupTitle}>
              <div className="px-4 py-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">{groupTitle}</div>
              {groupNavs.map((nav) => {
                const isActive = pathName === nav.href || pathName.startsWith(`${nav.href}/`);
                return (
                  <Collapsible key={nav.name} asChild defaultOpen={nav.isActive} className="group/collapsible">
                    <SidebarMenuItem className="mx-2 my-0.5">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton asChild size="md" isActive={isActive}>
                          <Link href={nav.href} className="cursor-default">
                            {nav.icon}
                            {nav.name}
                            {nav.children && (
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      {nav.children && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {nav.children.map((child) => {
                              const isChildActive = pathName === child.href;
                              return (
                                <SidebarMenuSubItem key={child.name}>
                                  <SidebarMenuSubButton asChild size="sm" isActive={isChildActive}>
                                    <Link href={child.href} className="cursor-default">
                                      {child.name}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
