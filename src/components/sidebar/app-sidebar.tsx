"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import { getRoleBasedSidebarData } from "./data/sidebar-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { NavGroupProps, SidebarData } from "./types";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null);
  const { profile, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      const userRole = profile?.role || "PARENT";
      const specialty = profile?.specialty || undefined;
      const roleBasedData = getRoleBasedSidebarData(userRole, specialty);
      setSidebarData(roleBasedData);
    }
  }, [profile, isLoading]);

  if (isLoading || !sidebarData) {
    // Loading state
    return (
      <Sidebar collapsible="icon" variant="sidebar" {...props}>
        <SidebarContent className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Cargando...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props: NavGroupProps) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
