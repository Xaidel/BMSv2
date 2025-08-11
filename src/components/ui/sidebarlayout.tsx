import AppSidebar from "./appsidebar";
import { SidebarProvider } from "./sidebar";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        {children}
      </main>
    </SidebarProvider>
  )
}
