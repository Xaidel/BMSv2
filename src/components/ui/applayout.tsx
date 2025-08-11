import AppSidebar from "./appsidebar";
import { SidebarProvider } from "./sidebar";
import Header from "./header";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  return <>
    <SidebarProvider open={open} onOpenChange={setOpen} >
      <div className="fixed">
        <AppSidebar />
        <div className="flex flex-col min-h-screen max-h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto font-redhat bg-red  text-black mx-[10rem] my-[2rem]">
            <Outlet />
          </main >
        </div >
      </div >
    </SidebarProvider >
  </>
}
