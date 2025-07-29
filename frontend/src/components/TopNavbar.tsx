
import { Search, Settings, User, Menu, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TopNavbarProps {
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const TopNavbar = ({ toggleSidebar, sidebarCollapsed }: TopNavbarProps) => {
  return (
    <header className="h-16 bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="text-slate-300 hover:text-white hover:bg-slate-700/50"
        >
          <Menu className="w-4 h-4" />
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search commands, transactions, errors..."
            className="pl-10 w-80 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
          <Bell className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
          <Settings className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-2 px-3 py-2 bg-slate-700/50 rounded-lg">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm text-slate-300">Developer</span>
        </div>
      </div>
    </header>
  );
};
