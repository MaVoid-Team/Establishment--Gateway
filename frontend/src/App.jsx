import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AccessDenied } from './pages/Access Denied/accessDenied';
import OrderDetails from "./pages/Order Details/OrderDetails";
import OrderHistory from "./pages/Order History/OrderHistory";
import LiwanPortal from "./pages/Main Page/LiwanPortal";
import Schedule from "./pages/Schedule/Schedule";
import SubmitOrder from "./pages/Submit Order/SubmitOrder";
import LoginPage from "./pages/Login Page/LoginPage";
import { AppSidebar } from "./components/ui/app-sidebar";
import OrdarApproval from "./pages/Order Approval/OrderApproval";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import SignaturesHistory from "./pages/Signatures History/SignaturesHistory";
import { ThemeProvider } from "../src/components/ui/ThemeContext";
import ContractsSummary from "./pages/Contracts Summary/ContractsSummary";
import { Toaster } from "@/components/ui/toaster";
import AdminDashboard from "./pages/Admin Dashboard/AdminDashboard";
import ContractManagement from "./pages/Contract Management System/ContractManagement";
import DocumentsFolder from "./pages/Documents Display/DocumentsFolder";
import OrderForm from "./pages/Submit Order/SubmitOrder";
import LandingPage from "./pages/Landing/LandingPage";
import { useTranslation } from "react-i18next";
import GovernmentContractManagement from "./pages/Government Contract Management/GovernmentContractManagement";
import { SocketProvider } from "../contexts/SocketContext";
import Contacts from "./pages/Contacts/Contacts";
import DocumentsPage from "./pages/Documents Display/DocumentsPage";
import EmployeeContact from "./pages/Employee Contact/employee-contact";
import ViewEmployee from "./pages/View Employee/viewEmployee";
import EmployeeDirectory from "./pages/Employee Directory/EmployeeDirectory";
import ViewCompanies from "./pages/View Companies/view-companies";
import Company from "./pages/Company/Company";
import ViewDepartments from "./pages/View Departments/view-departments";
import VendorContact from "./pages/Vendor Contact/vendor-contact";
import SignaturePreparePhase1 from "./pages/Signatures History/SignaturePreparePhase1";
import SignaturePreparePhase2 from "./pages/Signatures History/SignaturePreparePhase2";
import SignatureSend from "./pages/Signatures History/SignatureSend";
import ViewerForContract from "./pages/Contract Viewer/ViewerForContract";
import ViewerForGovernment from "./pages/Contract Viewer/ViewerForGovernment";
import NotificationsCenter from "./pages/Notifications Center/NotificationsCenter";
import EmployeeProfile from "./pages/Employee Profile/EmployeeProfilePage";
import AnalyticsPage from "./pages/Analytics/page";
import ViewVendors from "./pages/View Vendor/view-vendor";
import DirectoryDetails from "./pages/Employee Directory/DirectoryDetails";
import DepartmentContact from "./pages/Departments Contact/departments-contacts";
import EmployeeManagement from "./pages/Admin Add Contact/admin-add-contact";
import TicketSystem from "./pages/Ticket System/ticket-system";
import ContractSystem from "./pages/Contract System/contract-system";
import TicketDetails from "./pages/Ticket System/view-ticket";
import TicketForm from "./pages/Submit A Ticket/submit-a-ticket";
import Header from "./components/ui/header";
import SignaturePage from './components/ui/SignaturePage';
import SettingsPage from "./pages/Settings/SettingsPage";
import ContractsReviewForm from "./pages/Contract System/submit-contract-review";
import BackgroundSelector from "./pages/Settings/BackgroundSelector";
import ImageBackgroundSelector from '@/components/ui/ImageBackgroundSelector';
import ContractReviewForm from "./pages/Contract System/submit-contract-review";
import Support from "./pages/Support/support"
import OrderEdit from "./pages/Order Details/EditOrderDetails";
import LiwanLoadingScreen from "./components/ui/loadingscreen";
import SignatureView from "./pages/Signatures History/SignatureView";
import Footer from "./components/ui/footer";
import PrintableOrder from "./pages/Order Details/PrintableOrder";
const AppContent = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { i18n } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  
  const showSidebar =
    location.pathname !== "/" &&
    location.pathname !== "/login-page";
  const showBackButton = location.pathname !== "/";
  const isLoadingScreen = location.pathname === "/";

  useEffect(() => {
    const savedLightBackground = localStorage.getItem("lightModeBackground") || "hsl(40, 24.22%, 68.43%)";
    const savedDarkBackground = localStorage.getItem("darkModeBackground") || "hsl(21.6, 16.13%, 30.39%)";
    const isDarkMode = document.documentElement.classList.contains("dark");
  
    document.documentElement.style.setProperty("--background-light", `url(${savedLightBackground})`);
    document.documentElement.style.setProperty("--background-dark", `url(${savedDarkBackground})`);
    document.documentElement.style.setProperty("--background", isDarkMode ? `url(${savedDarkBackground})` : `url(${savedLightBackground})`);
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };
  
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);
  
  if (isLoading) {
    return <div className="bg-landingPageBg"><LiwanLoadingScreen/></div>;
  }

  if (isLoadingScreen) {
    return (
      <div className="">
        <LandingPage/>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen blurred-background print-bg-overlay">
      <div
        className={`fixed ${
          i18n.language === "ar" ? "left-0" : "right-0"
        } top-0 p-0 print:hiddenz-50 transition-all duration-300 ease-in-out  ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-[-100%] opacity-0"
        } sm:translate-y-0 sm:opacity-100`}
      >
      </div>
      <Toaster position="bottom-right" className="print:hidden" />
      {showSidebar && showBackButton ? (
        <div
          className="flex min-h-screen"
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
        >
          
          <SidebarProvider>
            <AppSidebar
              className="bg-muted print:hidden"
              side={i18n.language === "ar" ? "right" : "left"}
            />
            
            <SidebarInset className="flex-1 pt-6 md:pt-2 lg:pt-0 print:pt-0">
            <Header/>
              <div className="p-4 print:p-0">
                <SidebarTrigger className="print:hidden " />
                
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route 
                    path="/login-page" 
                    element={
                      isAuthenticated ? 
                      <Navigate to="/main-page" replace /> : 
                      <LoginPage />
                    } 
                  />
                  <Route path="/access-denied" element={<AccessDenied />} />

                  <Route path="/main-page" element={<ProtectedRoute requiredPermission="all"><LiwanPortal /></ProtectedRoute>} />
                  <Route path="/order-history" element={<ProtectedRoute requiredPermission="all"><OrderHistory /></ProtectedRoute>} />
                  <Route path="/schedule" element={<ProtectedRoute requiredPermission="all"><Schedule /></ProtectedRoute>} />
                  <Route path="/submit-order" element={<ProtectedRoute requiredPermission="all"><SubmitOrder /></ProtectedRoute>} />
                  <Route path="/support" element={<ProtectedRoute requiredPermission="all"><Support /></ProtectedRoute>} />
                  <Route path="/order-approval" element={<ProtectedRoute requiredPermission="all"><OrdarApproval /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute requiredPermission="all"><EmployeeProfile /></ProtectedRoute>} />
                  <Route path="/employee-directory" element={<ProtectedRoute requiredPermission="adminOnly"><EmployeeDirectory /></ProtectedRoute>} />
                  <Route path="/ticket-system" element={<ProtectedRoute requiredPermission="all"><TicketSystem /></ProtectedRoute>} />
                  <Route path="/contract-system" element={<ProtectedRoute requiredPermission="all"><ContractSystem /></ProtectedRoute>} />
                  <Route path="/submit-a-ticket" element={<ProtectedRoute requiredPermission="all"><TicketForm /></ProtectedRoute>} />
                  <Route path="/view-ticket/:id" element={<ProtectedRoute requiredPermission="all"><TicketDetails /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute requiredPermission="all"><SettingsPage /></ProtectedRoute>} />
                  <Route path="/Background-selector" element={<ProtectedRoute requiredPermission="all"><BackgroundSelector /></ProtectedRoute>} />
                  <Route path="/sign/:token" element={<ProtectedRoute requiredPermission="all"><SignaturePage /></ProtectedRoute>} />
                  <Route path="/signature-prepare-1/:id" element={<ProtectedRoute requiredPermission="all"><SignaturePreparePhase1 /></ProtectedRoute>} />
                  <Route path="/signature-prepare-2/:id" element={<ProtectedRoute requiredPermission="all"><SignaturePreparePhase2 /></ProtectedRoute>} />
                  <Route path="/signature-send" element={<ProtectedRoute requiredPermission="all"><SignatureSend /></ProtectedRoute>} />
                  <Route path="/submit-contract-review" element={<ProtectedRoute requiredPermission="all"><ContractsReviewForm /></ProtectedRoute>} />
                  <Route path="/documents-folder" element={<ProtectedRoute requiredPermission="everyoneButEmployee"><DocumentsFolder /></ProtectedRoute>} />
                  <Route path="/Directory-details" element={<ProtectedRoute requiredPermission="managerPlus"><DirectoryDetails /></ProtectedRoute>} />
                  <Route path="/signatures-history" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><SignaturesHistory /></ProtectedRoute>} />
                  <Route path="/contracts-summary" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><ContractsSummary /></ProtectedRoute>} />
                  <Route path="/contracts-summary/:id" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><ViewerForContract /></ProtectedRoute>} />
                  <Route path="/government-summary/:id" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><ViewerForGovernment /></ProtectedRoute>} />
                  <Route path="/contacts" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><Contacts /></ProtectedRoute>} />
                  <Route path="/employee-contact" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><EmployeeContact /></ProtectedRoute>} />
                  <Route path="/employee-contact/:id" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><EmployeeContact /></ProtectedRoute>} />
                  <Route path="/view-employee" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><ViewEmployee /></ProtectedRoute>} />
                  <Route path="/view-companies" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><ViewCompanies /></ProtectedRoute>} />
                  <Route path="/company/:id" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><Company /></ProtectedRoute>} />
                  <Route path="/view-departments" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><ViewDepartments /></ProtectedRoute>} />
                  <Route path="/view-vendor" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><ViewVendors /></ProtectedRoute>} />
                  <Route path="/vendor/:id" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><VendorContact /></ProtectedRoute>} />
                  <Route path="/departments-contact/:id" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><DepartmentContact /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><AnalyticsPage /></ProtectedRoute>} />
                  <Route path="/viewer-for-contract/:id" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><ViewerForContract /></ProtectedRoute>} />
                  <Route path="/viewer-for-government/:id" element={<ProtectedRoute requiredPermission="monetaryCeoAdmin"><ViewerForGovernment /></ProtectedRoute>} />
                  <Route path="/admin-dashboard" element={<ProtectedRoute requiredPermission="adminOnly"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute requiredPermission="all"><OrderDetails /></ProtectedRoute>} />
                  <Route path="/edit-order-details/:id" element={<ProtectedRoute requiredPermission="ceoAdmin"><OrderEdit /></ProtectedRoute>} />
                  <Route path="/notifications-center" element={<ProtectedRoute requiredPermission="adminOnly"><NotificationsCenter /></ProtectedRoute>} />
                  <Route path="/contract-management" element={<ProtectedRoute requiredPermission="adminOnly"><ContractManagement /></ProtectedRoute>} />
                  <Route path="/government-contract-management" element={<ProtectedRoute requiredPermission="adminOnly"><GovernmentContractManagement /></ProtectedRoute>} />
                  <Route path="/admin-add-contact" element={<ProtectedRoute requiredPermission="adminOnly"><EmployeeManagement /></ProtectedRoute>} />
                  <Route path="/documents" element={<ProtectedRoute  requiredPermission="monetaryCeoAdmin"><DocumentsPage /></ProtectedRoute>} />
                  <Route path="/view-signature/:id" element={<ProtectedRoute><SignatureView /></ProtectedRoute>} />
                  <Route path="/orders/:id/print" requiredPermission="all" element={<PrintableOrder />} />
                  <Route 
                    path="*" 
                    element={
                      <Navigate to={isAuthenticated ? "/main-page" : "/login-page"} replace />
                    } 
                  />
                </Routes>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      ) : (
        <div className="w-full">    
          <Routes>
            <Route 
              path="/login-page" 
              element={
                isAuthenticated ? 
                <Navigate to="/main-page" replace /> : 
                <LoginPage />
              } 
            />
            <Route path="*" element={<Navigate to="/login-page" replace />} />
          </Routes>
        </div>
      )}

      <Footer />
    </div>
  );
};

const App = () => (
  <SocketProvider>
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  </SocketProvider>
);

export default App;

