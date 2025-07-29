
import { 
  BarChart3, 
  Terminal, 
  Network, 
  GitBranch, 
  Play, 
  Gauge, 
  AlertTriangle,
  Home,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveModule } from '@/pages/Index';

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'dashboard' as ActiveModule, label: 'Dashboard', icon: Home },
  { id: 'cli-logger' as ActiveModule, label: 'CLI Commands', icon: Terminal },
  { id: 'rpc-tracker' as ActiveModule, label: 'RPC Tracker', icon: Network },
  { id: 'trace-viewer' as ActiveModule, label: 'Trace Viewer', icon: GitBranch },
  { id: 'dry-run' as ActiveModule, label: 'Dry Run Simulator', icon: Play },
  { id: 'performance' as ActiveModule, label: 'Performance', icon: Gauge },
  { id: 'error-intelligence' as ActiveModule, label: 'Error Intelligence', icon: AlertTriangle },
  { id: 'contract-tracker' as ActiveModule, label: 'Contract Tracker', icon: FileText },
];

export const Sidebar = ({ activeModule, setActiveModule, collapsed, setCollapsed }: SidebarProps) => {
  return (
    <div className={cn(
      "bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-teal-400 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">SCI</h1>
                <p className="text-xs text-slate-400">Stellar Command Insights</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-slate-700/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-blue-500/20 to-teal-500/20 border border-blue-500/30 text-blue-300" 
                  : "hover:bg-slate-700/30 text-slate-300 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-blue-400")} />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50">
        <div className={cn("flex items-center space-x-2", collapsed && "justify-center")}>
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          {!collapsed && <span className="text-xs text-slate-400">System Online</span>}
        </div>
      </div>
    </div>
  );
};
