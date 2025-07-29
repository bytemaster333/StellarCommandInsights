
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { DashboardHome } from '@/components/DashboardHome';
import { CLICommandLogger } from '@/components/CLICommandLogger';
import { RPCTracker } from '@/components/RPCTracker';
import { TraceViewer } from '@/components/TraceViewer';
import { DryRunSimulator } from '@/components/DryRunSimulator';
import { PerformanceAnalyzer } from '@/components/PerformanceAnalyzer';
import { ErrorIntelligence } from '@/components/ErrorIntelligence';
import { ContractTracker } from '@/components/ContractTracker';

export type ActiveModule = 'dashboard' | 'cli-logger' | 'rpc-tracker' | 'trace-viewer' | 'dry-run' | 'performance' | 'error-intelligence' | 'contract-tracker';

const Index = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardHome />;
      case 'cli-logger':
        return <CLICommandLogger />;
      case 'rpc-tracker':
        return <RPCTracker />;
      case 'trace-viewer':
        return <TraceViewer />;
      case 'dry-run':
        return <DryRunSimulator />;
      case 'performance':
        return <PerformanceAnalyzer />;
      case 'error-intelligence':
        return <ErrorIntelligence />;
      case 'contract-tracker' :
        return <ContractTracker />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="flex w-full min-h-screen">
        <Sidebar 
          activeModule={activeModule} 
          setActiveModule={setActiveModule}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <div className="flex-1 flex flex-col">
          <TopNavbar 
            toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="flex-1 p-6 overflow-auto">
            {renderActiveModule()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
