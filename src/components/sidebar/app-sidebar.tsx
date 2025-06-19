"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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
import type { NavGroupProps, SidebarData } from "./types";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          const userRole = profile?.role || "PARENT";
          const roleBasedData = getRoleBasedSidebarData(userRole);
          setSidebarData(roleBasedData);
        } else {
          // Fallback to parent role if no session
          setSidebarData(getRoleBasedSidebarData("PARENT"));
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        // Fallback to parent role
        setSidebarData(getRoleBasedSidebarData("PARENT"));
      }
    };

    fetchUserRole();
  }, [supabase]);

  if (!sidebarData) {
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
