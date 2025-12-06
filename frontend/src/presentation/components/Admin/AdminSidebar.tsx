import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarClock, 
  History, 
  Bell, 
  Users, 
  CheckCircle, 
  MapPin, 
  CreditCard, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminLogoutButton from './AdminLogoutButton';

// --- Utility for Tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type SubItem = {
  label: string;
  path: string;
  icon: React.ElementType;
};

type NavItem = {
  label: string;
  icon: React.ElementType;
  path?: string; 
  children?: SubItem[];
};

type MenuSection = {
  sectionLabel?: string;
  items: NavItem[];
};

// --- Configuration ---
const MENU_CONFIG: MenuSection[] = [
  {
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' }
    ]
  },
  {
    sectionLabel: 'Bookings',
    items: [
      {
        label: 'Bookings',
        icon: CalendarClock,
        children: [
          { label: 'Live Feed', path: '/admin/bookings/live', icon: Bell },
          { label: 'History', path: '/admin/bookings/history', icon: History },
        ]
      }
    ]
  },
  {
    sectionLabel: 'Technicians',
    items: [
      {
        label: 'Technicians',
        icon: Users,
        children: [
          { label: 'Verification Queue', path: '/admin/technicians/verification', icon: CheckCircle },
          { label: 'Technician List', path: '/admin/technicians/list', icon: Users },
        ]
      }
    ]
  },
  {
    sectionLabel: 'Customers',
    items: [
      { label: 'Customers', icon: Users, path: '/admin/customers' }
    ]
  },
  {
    sectionLabel: 'Zones',
    items: [
      { label: 'Zones', icon: MapPin, path: '/admin/zones' }
    ]
  },
  {
    sectionLabel: 'Payments & Refunds',
    items: [
      { label: 'Payments & Refunds', icon: CreditCard, path: '/admin/payments' }
    ]
  },
  {
    sectionLabel: 'Disputes & Support',
    items: [
      { label: 'Disputes & Support', icon: MessageSquare, path: '/admin/disputes' }
    ]
  },
  {
    sectionLabel: 'Reports & Exports',
    items: [
      { label: 'Reports & Exports', icon: FileText, path: '/admin/reports' }
    ]
  },
  {
    sectionLabel: 'Settings',
    items: [
      { label: 'Settings', icon: Settings, path: '/admin/settings' }
    ]
  }
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isGroupActive = (children?: SubItem[]) => {
    return children?.some(child => pathname.startsWith(child.path));
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[260px] bg-[#1f2233] text-white transition-transform duration-300 lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Admin sidebar"
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-700/50 bg-[#1f2233]">
          <h1 className="text-xl font-bold tracking-wide">Admin Panel</h1>
          <button 
            onClick={onClose}
            className="absolute right-4 top-5 text-gray-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE AREA with Custom Scrollbar
          - Mobile: Scrollbar hidden
          - Desktop: Thin (w-1 = 4px), rounded, subtle gray
        */}
        <nav className={cn(
          "flex-1 overflow-y-auto px-4 py-4 space-y-6",
          // Mobile: Hide scrollbar completely
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          // Desktop: Custom minimal scrollbar
          "lg:[&::-webkit-scrollbar]:w-1",
          "lg:[&::-webkit-scrollbar-track]:bg-transparent",
          "lg:[&::-webkit-scrollbar-thumb]:bg-gray-500/30",
          "lg:[&::-webkit-scrollbar-thumb]:rounded-full",
          "lg:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500/50"
        )}>
          {MENU_CONFIG.map((section, idx) => (
            <div key={idx}>
              {section.sectionLabel && (
                <div className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  {section.sectionLabel}
                </div>
              )}

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const hasChildren = !!item.children;
                  const isExpanded = expandedGroups[item.label] || isGroupActive(item.children);
                  
                  if (hasChildren) {
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => toggleGroup(item.label)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-full px-4 py-3 text-sm font-medium transition-colors duration-150 hover:bg-white/5",
                            isGroupActive(item.children) ? "text-white" : "text-gray-300"
                          )}
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon size={18} />
                            <span>{item.label}</span>
                          </div>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {isExpanded && (
                          <ul className="mt-1 space-y-1 pl-4">
                            {item.children!.map((child) => (
                              <li key={child.path}>
                                <NavLink
                                  to={child.path}
                                  onClick={() => window.innerWidth < 1024 && onClose()}
                                  className={({ isActive }) => cn(
                                    "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors duration-150",
                                    isActive 
                                      ? "bg-[#1E88E5] text-white shadow-md" 
                                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                                  )}
                                >
                                  <child.icon size={16} />
                                  <span>{child.label}</span>
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path!}
                        onClick={() => window.innerWidth < 1024 && onClose()}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors duration-150",
                          isActive 
                            ? "bg-[#1E88E5] text-white shadow-md" 
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-700/50 p-4 bg-[#1f2233]">
           <div className="w-full text-red-400 hover:text-red-300">
             <AdminLogoutButton />
           </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;