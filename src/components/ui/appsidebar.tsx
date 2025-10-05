import { LayoutDashboard, Calendar, Users, House, FileBadge2, TrendingUp, BanknoteArrowUpIcon, Files, Settings, LogOut, Map, ClipboardCheck, FileText, FileBadge } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "./sidebar";
import { NavLink, useLocation } from "react-router-dom";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Certification",
    url: "/certificates",
    icon: FileBadge2
  },
  {
    title: "Logbook",
    url: "/logbook",
    icon: ClipboardCheck
  },
  {
    title: "Events",
    url: "/event",
    icon: Calendar
  },
  {
    title: "Programs & Projects",
    url: "/program-projects",
    icon: FileBadge
  },
  {
    title: "GovDocs",
    url: "/govdocs",
    icon: FileText
  },
  {
    title: "Residents",
    url: "/residents",
    icon: Users
  },
  {
    title: "Households",
    url: "/households",
    icon: House
  },
  {
    title: "Barangay Map",
    url: "/map",
    icon: Map
  },
  {
    title: "Blotter Records",
    url: "/blotter",
    icon: Files
  },
  {
    title: "Income",
    url: "/income",
    icon: TrendingUp
  },
  {
    title: "Expense",
    url: "/expense",
    icon: BanknoteArrowUpIcon
  },
  {
    title: "Officials and Staffs",
    url: "/officials",
    icon: Users
  },
]

type SidebarProps = {
  onHover: () => void
  onOut: () => void
}

export default function AppSidebar({ onHover, onOut }: SidebarProps) {
  const location = useLocation()
  const currentPath = location.pathname
  const isActive = (currentPath: string, targetPath: string): boolean => {
    if (currentPath === targetPath) return true;
    if (targetPath !== "/" && currentPath.startsWith(targetPath)) return true
    return false
  }
  return (
    <Sidebar collapsible="icon" className="z-100" onMouseEnter={onHover} onMouseLeave={onOut}>
      <SidebarHeader className="mt-2">
        <SidebarTrigger className=" hover:bg-primary hover:text-foreground "
          size="lg"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem
                key={item.title}
                className=" font-redhat text-black max-w-[14rem] hover:max-w-[14rem]">
                <SidebarMenuButton
                  asChild
                  className="hover:bg-primary hover:text-foreground "
                  size="lg"
                  isActive={isActive(currentPath, item.url)}
                >
                  <NavLink to={item.url}
                  >
                    <item.icon className="group-data-[collapsible=icon]:mx-auto" />
                    <span className={"group-data-[collapsible=icon]:hidden"}>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup >
      </SidebarContent >
      <SidebarFooter className="mb-3">
        <SidebarMenuItem className="font-redhat text-black max-w-[14rem]"
        >
          <SidebarMenuButton asChild
            className="hover:bg-primary hover:text-foreground "
            size="lg"
            isActive={isActive(currentPath, "/settings")}
          >
            <NavLink to={"/settings"}>
              <Settings className="group-data-[collapsible=icon]:mx-auto" />
              <span
                className={"group-data-[collapsible=icon]:hidden"}
              >Settings</span>
            </NavLink>
          </SidebarMenuButton>
          <SidebarMenuButton asChild
            className="hover:bg-red-500 hover:text-foreground "
            size="lg"
          >
            <a href="/">
              <LogOut className="group-data-[collapsible=icon]:mx-auto" />
              <span
                className={"group-data-[collapsible=icon]:hidden"}
              >Logout</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar >
  )
}
