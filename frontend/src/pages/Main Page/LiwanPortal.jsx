'use client'

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { BarChartIcon as ChartColumn, Truck, Package,Smartphone, LayoutDashboard, UserSearch, Megaphone, HelpCircle, Scale, Files, Landmark, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"

const LiwanPortal = () => {
  const portalItems = [
    { name: "PurchaseOrder", icon: Package, link: "/order-history" },
    // { name: "Contracts", icon: Landmark, link: "/documents-folder" },
    { name: "LegalServices", icon: Scale, link: "/contract-system" },
    // { name: "Sales Contracts", icon: Files, link: "/contracts-summary" },
    // { name: "SignaturesHistory", icon: Smartphone, link: "/signatures-history" },
    // { name: "ContactsManagement", icon: UserSearch, link: "/contacts" },
    { name: "MaintainanceManagement", icon: Truck, link: "/ticket-system" },
    // { name: "Analytics", icon: ChartColumn, link: "/analytics" },
    { name: "SupportAndDocumentation", icon: HelpCircle, link: "/support" },
    // { name: "Notifications Center", icon: Megaphone, link: "/notifications-center" },
    // { name: "Departments", icon: Package, link: "/employee-directory" },
    // { name: "AdminDashboard", icon: LayoutDashboard, link: "/admin-dashboard" },
    { name: "Payment Request", icon: Megaphone, link: "/Tenants" },
    // { name: "Tenants", icon: Home, link: "/Tenants" },
    // { name: "Tenants", icon: Home, link: "/Tenants" },
    // { name: "Tenants", icon: Home, link: "/Tenants" },
    // { name: "Tenants", icon: Home, link: "/Tenants" },
    // { name: "Tenants", icon: Home, link: "/Tenants" },
  ];
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const titleRef = useRef(null);
  const showMoreRef = useRef(null);

  const { t } = useTranslation();

  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? portalItems : portalItems.slice(0, 12);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(containerRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    itemsRef.current.forEach((item, index) => {
      if (item) {
        tl.from(item, {
          opacity: 0,
          y: 50,
          duration: 0.5,
          ease: "back.out(1.7)",
        }, index * 0.2);
      }
    });

    if (showMoreRef.current) {
      tl.from(showMoreRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "back.out(1.7)",
      }, "-=0.3");
    }
  }, [showAll]);

  const handleShowMore = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="flex flex-col items-center justify-center text-stone-100 lg:h-[80vh] p-4 bg-fit pt-32 sm:pt-16 md:pt-8" ref={containerRef}>
      <div className="rounded-lg grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 w-full max-w-5xl lg:p-0 md:p-8 p-12">
        {visibleItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link to={item.link} key={index} className="group" ref={el => itemsRef.current[index] = el}>
              <Button
                className="bg-transparent dark:bg-transparent rounded-lg flex flex-col text-sm items-center font-bold justify-center w-full h-32 sm:h-36 p-4 hover:bg-[#000000]/[0.1] dark:hover:bg-[#ffffff]/[0.1]
                          transition-all duration-300 ease-in-out transform hover:scale-110
                          shadow-xl hover:shadow-xl
                          text-black "
              >
                <IconComponent
                  style={{ width: '34px', height: '34px', display: 'inline-block' }}
                  className="w-16 h-16 text-[#242323] dark:text-[#c2c1ba] mb-2 sm:mb-3 group-hover:scale-125 transition-transform duration-300"
                />
                <span className="text-xs sm:text-sm font-normal text-center group-hover:font-normal transition-all duration-300">
                  {t(item.name)}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>
      {portalItems.length > 12 && (
        <Button
          onClick={handleShowMore}
          type="button"         // <-- Make sure this is set to "button"
          className="mt-6"
          ref={showMoreRef}
        >
          {showAll ? (
            <>
              Show Less <ChevronUp className="ml-2" />
            </>
          ) : (
            <>
              Show More <ChevronDown className="ml-2" />
            </>
          )}
        </Button>

      )}
    </div>
  );
};

export default LiwanPortal;

