import { AppSidebar } from "../../components/ui/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Sidebar() {
  return (
    (<SidebarProvider>
      <AppSidebar />
      <SidebarInset>
          <SidebarTrigger className="p-3 ml-4" />
      </SidebarInset>
    </SidebarProvider>)
  );
}
