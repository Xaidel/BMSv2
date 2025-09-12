
import AppSidebar from "./appsidebar";
import { SidebarProvider } from "./sidebar";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar 
        onHover={() => {}} 
        onOut={() => {}} 
      />
      <main>
        {children}
      </main>
    </SidebarProvider>
  )
}
