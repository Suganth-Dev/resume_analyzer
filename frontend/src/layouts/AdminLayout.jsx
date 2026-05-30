import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert 
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { adminUser, adminLogout } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Resume Management', path: '/admin/resumes', icon: FileText },
    { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex relative overflow-hidden">
      {/* Decorative Spotlights */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-glow-spot rounded-full pointer-events-none animate-pulse-slow" style={{ filter: 'hue-rotate(60deg)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none" style={{ filter: 'hue-rotate(60deg)' }} />

      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark-900/80 backdrop-blur-xl border-r border-dark-800/80 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:h-screen`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-dark-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            <span className="text-lg font-bold tracking-tight text-white">
              Admin<span className="text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' }}>Panel</span>
            </span>
          </div>
        </div>

        {/* Navigation Link List */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-500/20'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Sign Out */}
        <div className="p-4 border-t border-dark-800/80">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 flex items-center justify-center font-bold text-white uppercase shadow-md">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{adminUser?.name || 'Super Admin'}</p>
              <p className="text-xs text-dark-400 truncate">{adminUser?.email || 'admin@gmail.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all border border-transparent hover:border-red-900/30 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-dark-800/50 lg:hidden bg-dark-900/60 backdrop-blur-xl shrink-0 z-30">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
            <span className="text-md font-bold tracking-tight text-white">
              Admin<span className="text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' }}>Panel</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-dark-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Page Inner Content Container */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto pb-16">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
