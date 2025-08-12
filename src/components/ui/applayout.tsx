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
        <AppSidebar onHover={() => setOpen(true)}
          onOut={() => setOpen(false)} />
        <div className="flex flex-col min-h-screen max-h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto font-redhat bg-red  text-black mx-[10rem] my-[2rem]"
            onClick={() => setOpen(false)}
          >
            <Outlet />
            {open && (
              <div className="z-30 fixed inset-0 bg-black/30 pointer-events-none transition-opacity duration-300 ease-in-out" />
            )}
          </main >
        </div >
      </div >
    </SidebarProvider >
  </>
}
