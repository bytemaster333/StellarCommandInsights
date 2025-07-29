
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { apiService, CLILog, RPCLog } from '@/services/api';

interface TraceStep {
  id: number;
  type: string;
  method: string;
  status: 'success' | 'error';
  duration: number;
  details: string;
}

export const TraceViewer = () => {
  const [cliLogs, setCLILogs] = useState<CLILog[]>([]);
  const [rpcLogs, setRPCLogs] = useState<RPCLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cliData, rpcData] = await Promise.all([
        apiService.fetchCLILogs(),
        apiService.fetchRPCLogs()
      ]);
      
      setCLILogs(cliData);
      setRPCLogs(rpcData);
      setLoading(false);
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get the most recent CLI command and its related RPC calls
  const latestCommand = cliLogs[cliLogs.length - 1];
  const relatedRPCCalls = rpcLogs.slice(-4); // Get last 4 RPC calls as example

  // Convert RPC logs to trace steps
  const traceSteps: TraceStep[] = relatedRPCCalls.map((rpc, index) => ({
    id: index + 1,
    type: 'RPC',
    method: rpc.rpc_method,
    status: rpc.status,
    duration: rpc.duration_ms,
    details: rpc.result ? JSON.stringify(rpc.result).substring(0, 100) : 'RPC call executed'
  }));

  const recentTraces = cliLogs.slice(-4).map(cmd => ({
    command: cmd.command.split(' ')[0] + ' ' + cmd.command.split(' ')[1],
    steps: Math.floor(Math.random() * 5) + 2, // Mock step count
    duration: `${(cmd.duration_ms / 1000).toFixed(1)}s`,
    status: cmd.status
  }));

  const getStatusIcon = (status: string) => {
    return status === 'success' ? 
      <CheckCircle2 className="w-4 h-4 text-green-400" /> : 
      <AlertCircle className="w-4 h-4 text-red-400" />;
  };

  const getStatusBadge = (status: string) => {
    return status === 'success' ? 
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Success</Badge> :
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            CLI → RPC Trace Viewer
          </h1>
          <p className="text-slate-400 mt-1">Visualize the RPC call chain triggered by CLI commands</p>
        </div>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="pt-6 text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading trace data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          CLI → RPC Trace Viewer
        </h1>
        <p className="text-slate-400 mt-1">Visualize the RPC call chain triggered by CLI commands</p>
      </div>

      {/* Current Trace */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            <span>Latest Trace</span>
          </CardTitle>
          {latestCommand && (
            <div className="mt-2">
              <code className="bg-slate-700/50 px-3 py-2 rounded-lg text-sm text-blue-300 font-mono">
                {latestCommand.command}
              </code>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {traceSteps.length > 0 ? (
            <div className="space-y-4">
              {traceSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4">
                  {/* Step Number */}
                  <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-300 text-sm font-medium">
                    {step.id}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-teal-300 border-teal-500/30">
                          {step.type}
                        </Badge>
                        <span className="font-medium text-white">{step.method}</span>
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{(step.duration / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">{step.details}</p>
                  </div>

                  {/* Arrow for non-last items */}
                  {index < traceSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-slate-500" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No trace data available</p>
              <p className="text-sm text-slate-500 mt-1">Execute CLI commands to see traces</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Traces */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Recent Traces</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTraces.length > 0 ? (
            <div className="space-y-3">
              {recentTraces.map((trace, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(trace.status)}
                    <span className="text-white font-medium">{trace.command}</span>
                    <Badge variant="outline" className="text-slate-300 border-slate-600">
                      {trace.steps} steps
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-400">{trace.duration}</span>
                    {getStatusBadge(trace.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No recent traces available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trace Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Steps per Trace</CardTitle>
            <GitBranch className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {recentTraces.length > 0 
                ? (recentTraces.reduce((sum, trace) => sum + trace.steps, 0) / recentTraces.length).toFixed(1)
                : '0'
              }
            </div>
            <p className="text-xs text-slate-400">steps per command</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Trace Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {recentTraces.length > 0 
                ? ((recentTraces.filter(t => t.status === 'success').length / recentTraces.length) * 100).toFixed(1)
                : '0'
              }%
            </div>
            <p className="text-xs text-slate-400">end-to-end success</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Trace Duration</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {recentTraces.length > 0 
                ? (recentTraces.reduce((sum, trace) => sum + parseFloat(trace.duration), 0) / recentTraces.length).toFixed(1)
                : '0'
              }s
            </div>
            <p className="text-xs text-slate-400">total execution time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
