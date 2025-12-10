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
  FileText, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  X,
  Layers 
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
    items: [
      { label: 'Zones', icon: MapPin, path: '/admin/zones' },
      { label: 'Services', icon: Layers, path: '/admin/services' } 
    ] 
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
          "fixed top-0 left-0 z-50 h-screen w-[260px] bg-[#1f2233] text-white transition-transform duration-300 lg:translate-x-0 flex flex-col shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Admin sidebar"
      >
        {/* Header */}
        <div className="flex h-20 shrink-0 items-center px-6 border-b border-gray-700/50">
          <h1 className="text-2xl font-bold tracking-wide">ServoFixo</h1>
          <button 
            onClick={onClose}
            className="absolute right-4 top-6 text-gray-400 hover:text-white lg:hidden"
          >
            <X size={26} />
          </button>
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto px-4 py-6 space-y-6",
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            "lg:[&::-webkit-scrollbar]:w-1.5 lg:[&::-webkit-scrollbar-track]:bg-transparent lg:[&::-webkit-scrollbar-thumb]:bg-gray-600/30 lg:[&::-webkit-scrollbar-thumb]:rounded-full"
          )}
        >
          {MENU_CONFIG.map((section, idx) => (
            <div key={idx}>
              {section.sectionLabel && (
                <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {section.sectionLabel}
                </div>
              )}

              <ul className="space-y-1.5">
                {section.items.map((item) => {
                  const hasChildren = !!item.children;
                  const isExpanded = expandedGroups[item.label] || isGroupActive(item.children);

                  if (hasChildren) {
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => toggleGroup(item.label)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 hover:bg-white/10",
                            isGroupActive(item.children) ? "text-white bg-white/5" : "text-gray-300"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <item.icon size={20} className="text-gray-400" />
                            <span>{item.label}</span>
                          </div>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {isExpanded && (
                          <ul className="mt-2 space-y-1 pl-6">
                            {item.children!.map((child) => (
                              <li key={child.path}>
                                <NavLink
                                  to={child.path}
                                  onClick={() => window.innerWidth < 1024 && onClose()}
                                  // ✅ FIXED: Explicitly typed 'isActive'
                                  className={({ isActive }: { isActive: boolean }) =>
                                    cn(
                                      "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all border-l-2 ml-1",
                                      isActive
                                        ? "border-blue-500 bg-white/10 text-white"
                                        : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                                    )
                                  }
                                >
                                  {({ isActive }: { isActive: boolean }) => (
                                    <>
                                      <child.icon size={16} className={cn(isActive ? "text-blue-400" : "text-gray-400")} />
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
                        // ✅ FIXED: Explicitly typed 'isActive'
                        className={({ isActive }: { isActive: boolean }) =>
                          cn(
                            "flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200",
                            isActive
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                              : "text-gray-300 hover:bg-white/10 hover:text-white"
                          )
                        }
                      >
                        {({ isActive }: { isActive: boolean }) => (
                          <>
                            <item.icon
                              size={20}
                              className={cn(isActive ? "text-white" : "text-gray-400")}
                            />
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

        {/* Footer */}
        <div className="border-t border-gray-700/50 p-4 bg-[#1f2233]">
          <div className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors p-2 text-sm">
            <AdminLogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;