import React, { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import axios from "axios";
import { LogOut, Settings } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useAuth } from '../../hooks/useAuth';

const apiUrl = import.meta.env.VITE_API_URL;

export const AppSidebar = React.memo((props) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { userRole, permissions } = useAuth();

  const handleLogout = async () => {
    try {
      await axios.get(`${apiUrl}/api/v1/auth/logout`, { withCredentials: true });
      document.cookie = "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      window.location.href = "/login-page";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navItems = useMemo(() => [
    { title: "Home", url: "/main-page", permission: "all" },
    { title: "Profile", url: "/profile", permission: "all" },
    { title: "Settings", url: "/settings", permission: "all" },
    { title: "Notifications Center", url: "/notifications-center", permission: "adminOnly" },
    { title: "Departments", url: "/employee-directory", permission: "all" },
    { title: "Contracts", url: "/contracts-summary", permission: "monetaryCeoAdmin" },
    { title: "Maintenance", url: "/ticket-system", permission: "all" },
    { title: "Analytics", url: "/analytics", permission: "monetaryCeoAdmin" },
    { title: "Contacts", url: "/contacts", permission: "monetaryCeoAdmin" },
    { title: "Signatures History", url: "/signatures-history", permission: "monetaryCeoAdmin" },
    {
      title: "Purchase Order",
      permission: "all",
      children: [
        { title: "Submit Order", url: "/submit-order", permission: "all" },
        { title: "Awaiting Approval", url: "/order-approval", permission: "all" },
        { title: "Order History", url: "/order-history", permission: "all" },
      ],
    },
    { title: "Government Contracts", url: "/documents-folder", permission: "everyoneButEmployee" },
    { title: "Schedule", url: "/schedule", permission: "all" },
    { title: "Support", url: "/support", permission: "all" },
  ], []);

  const filteredItems = useMemo(() => 
    navItems.filter(item => 
      permissions.includes(item.permission) && 
      (!item.children || item.children.some(child => permissions.includes(child.permission)))
    ),
    [permissions, navItems]
  );

  return (
    <Sidebar
      variant="inset"
      {...props}
      className="min-h-screen font-normal dark:text-white text-stone-900 backdrop-blur-lg"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <SidebarHeader>
        <span className="py-4 text-xl font-thin">{t("Navigation Menu")}</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) =>
                item.children ? (
                  <Collapsible key={item.title} defaultOpen className="group">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="flex items-center justify-between w-full">
                          <span>{t(item.title)}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="pl-4">
                          {item.children.filter(subItem => permissions.includes(subItem.permission)).map((subItem) => (
                            <SidebarMenuSubItem
                              key={subItem.title}
                              className={`hover:bg-[#d4ab71] dark:hover:bg-[#1c2c3c] rounded-lg duration-300 ${
                                location.pathname === subItem.url ? 'bg-[#d4ab71] dark:bg-[#1c2c3c]' : ''
                              }`}
                            >
                              <SidebarMenuButton asChild>
                                <Link to={subItem.url}>{t(subItem.title)}</Link>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem
                    key={item.title}
                    className={`hover:bg-[#d4ab71] dark:hover:bg-[#1c2c3c] duration-300 ${
                      location.pathname === item.url ? 'bg-[#d4ab71] dark:bg-[#1c2c3c]' : ''
                    }`}
                  >
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>{t(item.title)}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("adminDashboard")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="hover:bg-[#d4ab71] dark:hover:bg-[#1c2c3c] duration-300">
                  <SidebarMenuButton asChild>
                    <Link to="/admin-dashboard">
                      <Settings className="w-4 h-4 mr-2" />
                      {t("adminDashboard")}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="lg:mt-[30px] mt-[20px] mb-[40px] px-4 pb-4">
          <SidebarMenu>
            <SidebarMenuItem className="hover:bg-[#d4ab71] dark:hover:bg-[#1c2c3c] duration-300">
              <SidebarMenuButton asChild>
                <button onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("logout")}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';

