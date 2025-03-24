
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BookOpen, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', path: '/', icon: Home },
  { title: 'Students', path: '/students', icon: Users },
  { title: 'Courses', path: '/courses', icon: BookOpen },
];

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
  const location = useLocation();
  
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-[70px]"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {isExpanded && (
          <span className="font-heading font-bold text-lg">Menu</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className={cn("rounded-full", !isExpanded && "mx-auto")}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    !isExpanded && "justify-center px-2"
                  )
                }
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isExpanded ? "mr-2" : "mr-0"
                  )}
                />
                {isExpanded && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex items-center justify-center">
          <div className="text-xs text-muted-foreground">
            {isExpanded ? 'Super Simple Scheduling' : 'SSS'}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
