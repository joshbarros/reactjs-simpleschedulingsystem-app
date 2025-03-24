
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !location.pathname.startsWith('/auth')) {
      navigate('/auth/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      
      if (window.innerWidth < 768) {
        setIsSidebarExpanded(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // For auth pages, don't show layout
  if (location.pathname.startsWith('/auth')) {
    return (
      <>
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {isAuthenticated && <Sidebar isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />}
      
      <div 
        className="flex flex-1 flex-col"
        style={{ 
          marginLeft: isAuthenticated 
            ? (isSidebarExpanded ? (isMobileView ? 0 : '16rem') : (isMobileView ? 0 : '70px')) 
            : 0,
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        {isAuthenticated && <Navbar onToggleSidebar={toggleSidebar} />}
        
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
