import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse,
  ShoppingCart, 
  Users, 
  CalendarSync, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();
  const path = location.pathname;
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Products', path: '/admin/products', icon: Package, exact: false },
    { name: 'Inventory', path: '/admin/inventory', icon: Warehouse, exact: false },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, exact: false },
    { name: 'Users', path: '/admin/users', icon: Users, exact: false },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: CalendarSync, exact: false },
    { name: 'Settings', path: '/admin/settings', icon: Settings, exact: false },
  ];

  // Bottom nav items for mobile (top 5 most used)
  const bottomNavItems = navItems.slice(0, 5);

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">DairyFresh</h1>
        <p className="text-sm text-gray-500 mt-1">Dairy Owner Console</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact ? path === item.path : path.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-primary-light text-primary font-bold' 
                  : 'text-gray-600 hover:bg-gray-50 font-medium'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen shrink-0 relative z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setMobileOpen(false)} 
          />
          {/* Sidebar Panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <button 
              onClick={() => setMobileOpen(false)} 
              className="absolute top-5 right-4 p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1.5">
          {bottomNavItems.map((item) => {
            const isActive = item.exact ? path === item.path : path.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-400'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
              </Link>
            );
          })}
          {/* More button opens full sidebar */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] text-gray-400"
          >
            <Menu size={20} strokeWidth={1.8} />
            <span className="text-[10px] leading-tight font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}