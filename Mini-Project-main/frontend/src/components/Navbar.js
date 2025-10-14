import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Shield,
  Sun,
  Moon,
  Bell,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Check if route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/schemes', label: 'Schemes' },
    { path: '/announcements', label: 'Announcements' },
  ];

  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: User },
    { path: '/applications', label: 'Applications', icon: Shield },
    { path: '/grievances', label: 'Grievances', icon: Bell },
    { path: '/profile', label: 'Profile', icon: Settings },
  ];

  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', icon: Shield },
    { path: '/admin/schemes', label: 'Manage Schemes', icon: Settings },
    { path: '/admin/services', label: 'Manage Services', icon: Settings },
    { path: '/admin/announcements', label: 'Manage Announcements', icon: Settings },
    { path: '/admin/applications', label: 'Applications', icon: Settings },
    { path: '/admin/grievances', label: 'Grievances', icon: Settings },
    { path: '/admin/users', label: 'Users', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5zM2 12l10 5 10-5-10-5-10 5z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                e-Gram Panchayat
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActiveRoute(item.path)
                    ? 'text-primary'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button className="px-2 py-1 text-sm font-medium bg-primary text-white rounded-l-lg">
                EN
              </button>
              <button className="px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-r-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                हि
              </button>
            </div>

            {isAuthenticated ? (
              <>
                {/* User avatar and menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </span>
                  </button>

                  {/* Profile dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                      </div>
                      
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Link>
                      ))}
                      
                      {user?.role === 'admin' && adminMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Link>
                      ))}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin/login"
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    isActiveRoute(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <>
                  <Link
                    to="/admin/login"
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Login
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
