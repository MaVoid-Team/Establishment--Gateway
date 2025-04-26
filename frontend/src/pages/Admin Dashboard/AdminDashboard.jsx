// eslint-disable-next-line no-unused-vars
import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, FileText, Scale, Users, Building2, Wrench, Search, Bell, UserCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import "../../components/ui/i18n"
const dashboardItems = [
  /*{
    title: "purchaseOrderManagement",
    href: "/submit-order-management",
    icon: ShoppingCart,
  },*/
  {
    title: "Sales Contracts Upload",
    href: "/contract-management",
    icon: FileText,
  },
  /*{
    title: "legalDocumentManagement",
    href: "/legal",
    icon: Scale,
  },*/
  {
    title: "contactManagement",
    href: "/admin-add-contact",
    icon: Users,
  },
  {
    title: "Contracts Upload",
    href: "/government-contract-management",
    icon: Building2,
  },
  /*{
    title: "maintenanceManagementSystem",
    href: "/maintenance",
    icon: Wrench,
  },*/
  /*{
    title: "searchAndAnalytics",
    href: "/analytics",
    icon: Search,
  },*/
  /*{
    title: "notificationSystem",
    href: "/notifications",
    icon: Bell,
  },*/
  /*{
    title: "rolesManagement",
    href: "/roles",
    icon: UserCog,
  }*/
]

export default function CoursesPage() {
  const { t, i18n } = useTranslation();
  return (
    <div className="max-h-screen p-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Dashboard Header */}
        <h1 className="text-5xl font-bold text-center mb-20 text-shadow text-[#000000] dark:text-[#ffffff]">{t('adminDashboard')}</h1>
        
        <div className="flex flex-wrap -mx-4">
          {dashboardItems.map((item) => (
            <div key={item.href} className="w-full sm:w-1/2 lg:w-1/3 px-4 mb-8">
              <Link
                to={item.href}
                className="block dark:bg-transparent backdrop-blur-md shadow-xl hover:scale-105 hover:shadow-2xl h-48 rounded-[28px] overflow-hidden relative p-6 transition-all duration-500 hover:text-white group"
              >
                <div className={`absolute w-32 h-32 bg-chart-3 dark:bg-chart-1 rounded-full -top-16 ${i18n.language === 'ar' ? '-left-16' : '-right-16'} transition-all duration-500 group-hover:scale-[10]`}></div>
                <item.icon className="h-8 w-8 dark:text-[#ffffff] dark:hover:text-black text-[#000000] hover:text-white mb-4 relative z-10" />
                <h3 className="text-2xl font-normal text-[#000000] dark:hover:text-black dark:text-[#ffffff] hover:text-white mb-6 relative z-10">
                  {t(item.title)}
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}