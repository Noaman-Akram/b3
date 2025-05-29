import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Settings, ChevronRight, ChevronLeft, FileText, Hammer, LogOut, Database, Calendar, Plus } from 'lucide-react';
import { NavItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard
  },
  {
    name: 'Customers',
    path: '/customers',
    icon: Users
  },
  {
    name: 'Sale Orders',
    path: '/orders/sale',
    icon: FileText
  },
  {
    name: 'Work Orders',
    path: '/orders/work',
    icon: Hammer
  },
  {
    name: 'Scheduling',
    path: '/scheduling',
    icon: Calendar
  },
  {
    name: 'Tables',
    path: '/tables',
    icon: Database
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('dev_mode');
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside 
      className={`bg-gray-900 text-white fixed inset-y-0 left-0 z-30
        transition-all duration-300 ease-in-out flex flex-col
        ${collapsed ? 'w-20' : 'w-64'} 
        lg:sticky lg:top-0 lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="font-bold text-xl">Marble CRM</div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors lg:block hidden"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors lg:hidden"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="sticky top-0">
          <ul className="py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path));
              const isWorkOrders = item.path === '/orders/work';
              const isSaleOrders = item.path === '/orders/sale';
              return (
                <li key={item.path} className="group flex items-center">
                  <Link 
                    to={item.path}
                    onClick={() => onClose()}
                    className={`flex items-center px-4 py-3 flex-1 relative ${
                      isActive
                        ? isWorkOrders
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    } transition-colors`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive && isWorkOrders ? 'text-green-200' : ''}`} />
                    {!collapsed && <span className="ml-4">{item.name}</span>}
                    {!collapsed && (isSaleOrders || isWorkOrders) && (
                      <div
                        className="ml-auto p-0.5 w-6 h-6 min-w-0 min-h-0 flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 border bg-[#1f2937] border-[#374151] text-[#9ca3af] rounded-md cursor-pointer transition-colors duration-150 hover:bg-[#232b36] hover:border-[#4b5563] hover:text-[#d1d5db]"
                        title={`Add New ${isSaleOrders ? 'Sale' : 'Work'} Order`}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(isSaleOrders ? '/orders/sale/new' : '/orders/work/new');
                          onClose();
                        }}
                      >
                        <Plus size={14} />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        {!collapsed && (
          <div className="space-y-4">
            <div className="text-xs text-gray-400">
              Version 1.0.0
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center text-gray-300 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        )}
        {collapsed && (
          <Button
            variant="outline"
            className="w-full flex items-center justify-center text-gray-300 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;