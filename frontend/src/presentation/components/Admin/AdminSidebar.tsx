// frontend/src/presentation/components/Admin/AdminSidebar.tsx
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
  ChevronDown, 
  ChevronRight,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminLogoutButton from './AdminLogoutButton';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SubItem = { label: string; path: string; icon: React.ElementType; };
type NavItem = { label: string; icon: React.ElementType; path?: string; children?: SubItem[]; };
type MenuSection = { sectionLabel?: string; items: NavItem[]; };

const MENU_CONFIG: MenuSection[] = [
  { items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' }] },
  { 
    sectionLabel: 'Bookings', 
    items: [{ label: 'Bookings', icon: CalendarClock, children: [
      { label: 'Live Feed', path: '/admin/bookings/live', icon: Bell },
      { label: 'History', path: '/admin/bookings/history', icon: History },
    ]}] 
  },
  { 
    sectionLabel: 'People', 
    items: [
      { label: 'Technicians', icon: Users, children: [
        { label: 'Verification Queue', path: '/admin/technicians/verification', icon: CheckCircle },
        { label: 'Technician List', path: '/admin/technicians/list', icon: Users },
      ]},
      { label: 'Customers', icon: Users, path: '/admin/customers' }
    ]
  },
  { 
    sectionLabel: 'Operations', 
    items: [{ label: 'Zones', icon: MapPin, path: '/admin/zones' }] 
  },
  { 
    sectionLabel: 'Finance', 
    items: [{ label: 'Payments', icon: CreditCard, path: '/admin/payments' }] 
  },
  { 
    sectionLabel: 'System', 
    items: [
      { label: 'Settings', icon: Settings, path: '/admin/settings' },
      { label: 'Reports', icon: FileText, path: '/admin/reports' }
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
          // Width increased to 300px
          "fixed top-0 left-0 z-50 h-screen w-[300px] bg-[#1f2233] text-white transition-transform duration-300 lg:translate-x-0 flex flex-col shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Admin sidebar"
      >
        <div className="flex h-24 shrink-0 items-center px-8 border-b border-gray-700/50 bg-[#1f2233]">
          <h1 className="text-3xl font-bold tracking-wide text-white">ServoFixo</h1>
          <button 
            onClick={onClose}
            className="absolute right-6 top-8 text-gray-400 hover:text-white lg:hidden"
          >
            <X size={32} />
          </button>
        </div>

        <nav className={cn(
          "flex-1 overflow-y-auto px-5 py-8 space-y-8", 
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]", 
          "lg:[&::-webkit-scrollbar]:w-2 lg:[&::-webkit-scrollbar-track]:bg-transparent lg:[&::-webkit-scrollbar-thumb]:bg-gray-600/30 lg:[&::-webkit-scrollbar-thumb]:rounded-full"
        )}>
          {MENU_CONFIG.map((section, idx) => (
            <div key={idx}>
              {section.sectionLabel && (
                <div className="mb-4 px-4 text-sm font-bold uppercase tracking-widest text-gray-500">
                  {section.sectionLabel}
                </div>
              )}

              <ul className="space-y-2">
                {section.items.map((item) => {
                  const hasChildren = !!item.children;
                  const isExpanded = expandedGroups[item.label] || isGroupActive(item.children);
                  
                  if (hasChildren) {
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => toggleGroup(item.label)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-5 py-4 text-lg font-medium transition-colors duration-200 hover:bg-white/10",
                            isGroupActive(item.children) ? "text-white bg-white/5" : "text-gray-300"
                          )}
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center gap-5">
                            <item.icon size={24} className="shrink-0 text-gray-400 group-hover:text-white" />
                            <span>{item.label}</span>
                          </div>
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>

                        {isExpanded && (
                          <ul className="mt-3 space-y-2 pl-6">
                            {item.children!.map((child) => (
                              <li key={child.path}>
                                <NavLink
                                  to={child.path}
                                  onClick={() => window.innerWidth < 1024 && onClose()}
                                  className={({ isActive }) => cn(
                                    "flex items-center gap-4 rounded-xl px-5 py-3.5 text-base font-medium transition-all duration-200 border-l-[3px] ml-2",
                                    isActive 
                                      ? "border-blue-500 bg-white/10 text-white" 
                                      : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                                  )}
                                >
                                  {({ isActive }) => (
                                    <>
                                      <child.icon size={20} className={cn("shrink-0", isActive ? "text-blue-400" : "")} />
                                      <span>{child.label}</span>
                                    </>
                                  )}
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
                          "flex items-center gap-5 rounded-xl px-5 py-4 text-lg font-medium transition-colors duration-200",
                          isActive 
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-900/30" 
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon size={24} className={cn("shrink-0", isActive ? "text-white" : "text-gray-400")} />
                            <span>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-700/50 p-6 bg-[#1f2233]">
           <div className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors p-2 text-lg">
             <AdminLogoutButton />
           </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;