"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../contexts/AuthContext";
import { useTranslation } from "../i18n/TranslationContext";
import Image from "next/image";
import logo from "../../public/CreativeMarkFavicon.png";
import { getCurrentUser } from "../services/auth";
import { 
  FaTachometerAlt, 
  FaFileAlt, 
  FaUsers, 
  FaTasks, 
  FaPlus,
  FaUpload,
  FaChartBar,
  FaHeadset,
  FaBell,
  FaCreditCard,
  FaBuilding,
  FaClipboardList,
  FaUser,
  FaSpinner,
} from "react-icons/fa";

export default function Sidebar({ role, isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const { t, isRTL } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUser();
        if (response.success) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const getLinks = () => ({
    client: [
      { name: t('navigation.dashboard'), href: "/client", icon: "dashboard" },
      { name: t('navigation.application'), href: "/client/application", icon: "requests" },
      { name: t('navigation.trackApplication'), href: "/client/track-application", icon: "requests", badge: "3" },
      { name: t('navigation.payments'), href: "/client/payments", icon: "payments" },
      { name: t('navigation.support'), href: "/client/support", icon: "support", badge: "2" },
    ],
    admin: [
      { name: t('navigation.dashboard'), href: "/admin", icon: "dashboard" },
      { name: t('navigation.requests'), href: "/admin/requests", icon: "requests", badge: "12" },
      { name: t('navigation.tickets'), href: "/admin/tickets", icon: "support", badge: "8" },
      { name: t('navigation.payments'), href: "/admin/payments", icon: "payments", badge: "3" },
      { name: t('navigation.reports'), href: "/admin/reports", icon: "reports" },
      { name: t('navigation.dailyreports'), href: "/admin/daily-reports", icon: "reports" },
      { name: t('navigation.invoices'), href: "/admin/invoices", icon: "invoices" },
      { name: t('navigation.clients'), href: "/admin/clients", icon: "clients" },
      { name: t('navigation.addUser'), href: "/admin/add-user", icon: "clients" },
      { name: t('navigation.tasks'), href: "/admin/tasks", icon: "tasks", badge: "5" },
      { name: t('navigation.allEmployees'), href: "/admin/all-employees", icon: "establishments" },
    ],
    employee: [
      { name: t('navigation.dashboard'), href: "/employee", icon: "dashboard" },
      { name: t('navigation.myTasks'), href: "/employee/my-tasks", icon: "tasks", badge: "4" },
      { name: t('navigation.assignTasks'), href: "/employee/assign-tasks", icon: "requests", badge: "2" },
      { name: t('navigation.payments'), href: "/employee/payments", icon: "payments", badge: "3" },
      { name: t('navigation.tickets'), href: "/employee/tickets", icon: "support", badge: "5" },
      { name: t('navigation.support'), href: "/employee/support", icon: "support" },
      { name: t('navigation.reports'), href: "/employee/reports", icon: "reports" },
      { name: t('navigation.dailyreports'), href: "/employee/daily-reports", icon: "reports" },
      { name: t('navigation.additionalServices'), href: "/employee/additional-services", icon: "additional-services" },
      { name: t('navigation.notifications'), href: "/employee/notifications", icon: "notifications", badge: "3" },
    ],
  });

  const links = getLinks();

  const getIcon = (iconName) => {
    const icons = {
      dashboard: FaTachometerAlt,
      requests: FaFileAlt,
      clients: FaUsers,
      tasks: FaTasks,
      'additional-services': FaPlus,
      uploads: FaUpload,
      reports: FaChartBar,
      support: FaHeadset,
      notifications: FaBell,
      payments: FaCreditCard,
      establishments: FaBuilding,
    };
    return icons[iconName] || FaFileAlt;
  };

  const isActiveLink = (href) => {
    if (href === `/${role}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 z-30
          w-78 flex flex-col h-full
          transform transition-transform duration-300 ease-in-out
          ${isRTL ? 'right-0' : 'left-0'}
          ${isOpen ? 'translate-x-0' : `${isRTL ? 'translate-x-full' : '-translate-x-full'} lg:translate-x-0`}
        `}
        style={{
          background: 'linear-gradient(135deg, #242021 0%, #2a2422 50%, #242021 100%)',
          borderRight: isRTL ? 'none' : '1px solid rgba(255, 209, 122, 0.2)',
          borderLeft: isRTL ? '1px solid rgba(255, 209, 122, 0.2)' : 'none',
        }}
      >
        {/* Header */}
        <div className="p-4 " >
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <div
              className="w-20 h-20 flex items-center justify-center flex-shrink-0">
              <Image src={logo} alt="Creative Mark" className="object-contain" />
            </div>
            <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h1 className="text-lg font-semibold truncate" style={{ color: '#ffd17a' }}>Creative Mark</h1>
              <p className="text-xs uppercase text-gray-300 truncate">{role} Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-4 overflow-y-auto ${isRTL ? 'scrollbar-thin scrollbar-thumb-[#ffd17a]/30 scrollbar-track-transparent' : ''}`}>
          {links[role]?.map((link) => {
            const IconComponent = getIcon(link.icon);
            const isActive = isActiveLink(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={`
                  flex items-center p-3 mb-2 transition-all duration-200 group
                  ${isActive ? 'bg-[#ffd17a]/20' : 'hover:bg-[#ffd17a]/10'}
                `}
                style={{
                  color: '#ffd17a',
                }}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{link.name}</span>
                {link.badge && (
                  <span
                    className={`text-xs px-2 py-1 flex-shrink-0 ${isRTL ? 'mr-2' : 'ml-2'} transition-colors duration-200`}
                    style={{
                      background: 'linear-gradient(135deg, #ffd17a 0%, #e6b855 100%)',
                      color: '#242021',
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      
      </aside>
    </>
  );
}