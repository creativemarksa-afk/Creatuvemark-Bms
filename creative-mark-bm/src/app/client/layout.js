"use client";
import { useState } from "react";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useTranslation } from "../../i18n/TranslationContext";

export default function ClientLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isRTL } = useTranslation();
  
  // Protect client routes - only allow client role
  const isAuthenticated = useAuthGuard(['client']);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Don't render the layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        role="client" 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
      />
      <div className={`flex-1 flex flex-col ${isRTL ? 'lg:mr-0' : 'lg:ml-0'}`}>
        <Navbar 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
        <main className="flex-1 overflow-auto">
          <div className="min-h-full  bg-gray-50">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
