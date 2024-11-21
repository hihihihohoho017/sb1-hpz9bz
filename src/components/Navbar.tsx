import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BookCheck, 
  Database, 
  Users,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/proposals', icon: FileText, label: 'Proposals' },
    { to: '/finals', icon: BookCheck, label: 'Finals' },
    { to: '/inventory', icon: Database, label: 'Inventory' },
    { to: '/faculty', icon: Users, label: 'Faculty' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-soft flex items-center justify-between px-4 lg:hidden z-30">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-surface-600" />
          ) : (
            <Menu className="w-6 h-6 text-surface-600" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-600" />
          <span className="font-semibold text-surface-900">Capstone System</span>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-surface-900/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-soft z-40 w-64 transform transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:sticky`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 p-6 border-b border-surface-100">
          <div className="p-2 rounded-xl bg-primary-100">
            <GraduationCap className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-900">Capstone</h1>
            <p className="text-xs text-surface-500">Inventory System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-soft'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-primary-600'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-900">Admin Portal</p>
              <p className="text-xs text-surface-500">Manage your system</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;