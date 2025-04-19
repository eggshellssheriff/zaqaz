
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Package, ShoppingBag, Users, Settings, Sun, Moon, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleDarkMode, products, orders, customers } = useApp();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent reopening when clicking sidebar links
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling to parent elements
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar dark:bg-sidebar backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } shadow-lg`}
      ref={sidebarRef}
    >
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-medium text-sidebar-foreground">zaqaz</h1>
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              onClose();
            }}
            className="text-sidebar-foreground hover:text-primary p-2"
          >
            <X size={18} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link 
            to="/" 
            onClick={handleLinkClick}
            className={`flex items-center space-x-3 p-2 rounded-md ${
              location.pathname === '/' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Package size={18} />
            <span>Товары</span>
            <span className="ml-auto bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
              {products.length}
            </span>
          </Link>
          
          <Link 
            to="/orders" 
            onClick={handleLinkClick}
            className={`flex items-center space-x-3 p-2 rounded-md ${
              location.pathname === '/orders' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Заказы</span>
            <span className="ml-auto bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
              {orders.length}
            </span>
          </Link>

          <Link 
            to="/database" 
            onClick={handleLinkClick}
            className={`flex items-center space-x-3 p-2 rounded-md ${
              location.pathname === '/database' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Users size={18} />
            <span>База данных</span>
            <span className="ml-auto bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
              {customers.length}
            </span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <Link 
            to="/settings"
            onClick={handleLinkClick}
            className={`flex items-center space-x-3 p-2 rounded-md ${
              location.pathname === '/settings' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Settings size={18} />
            <span>Настройки</span>
          </Link>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDarkMode();
            }}
            className="flex w-full items-center space-x-3 p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 mt-2"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDarkMode ? 'Светлая тема' : 'Темная тема'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
