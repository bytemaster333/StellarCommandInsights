
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Network, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { apiService, RPCLog, ContractMetrics } from '@/services/api';

export const RPCTracker = () => {
  const [rpcLogs, setRpcLogs] = useState<RPCLog[]>([]);
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [logsData, metricsData] = await Promise.all([
        apiService.fetchRPCLogs(),
        apiService.fetchContractMetrics()
      ]);
      
      setRpcLogs(logsData);
      setMetrics(metricsData);
      setLoading(false);
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Process RPC logs for charts
  const rpcUsageData = rpcLogs.reduce((acc, log) => {
    const existing = acc.find(item => item.name === log.rpc_method);
    if (existing) {
      existing.count++;
      existing.avgTime = (existing.avgTime + log.duration_ms) / 2;
    } else {
      acc.push({ name: log.rpc_method, count: 1, avgTime: log.duration_ms });
    }
    return acc;
  }, [] as { name: string; count: number; avgTime: number }[]);

  const errorData = rpcLogs.reduce((acc, log) => {
    if (log.status === 'success') {
      acc.success++;
    } else {
      acc.errors++;
    }
    return acc;
  }, { success: 0, errors: 0 });

  const pieErrorData = [
    { name: 'Success', value: errorData.success, color: '#10B981' },
    { name: 'Errors', value: errorData.errors, color: '#EF4444' },
  ];

  // Calculate summary stats
  const totalCalls = rpcLogs.length;
  const successRate = totalCalls > 0 ? (errorData.success / totalCalls) * 100 : 0;
  const avgResponseTime = rpcLogs.length > 0 
    ? rpcLogs.reduce((sum, log) => sum + log.duration_ms, 0) / rpcLogs.length / 1000 
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            RPC Command Tracker
          </h1>
          <p className="text-slate-400 mt-1">Monitor Stellar RPC call performance and usage patterns</p>
        </div>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="pt-6 text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading RPC data...</p>
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
          RPC Command Tracker
        </h1>
        <p className="text-slate-400 mt-1">Monitor Stellar RPC call performance and usage patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total RPC Calls</CardTitle>
            <Network className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-slate-400">
              {totalCalls > 0 ? 'Active monitoring' : 'No data yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-400">
              {errorData.success} successful calls
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{avgResponseTime.toFixed(1)}s</div>
            <p className="text-xs text-slate-400">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Error Count</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{errorData.errors}</div>
            <p className="text-xs text-slate-400">
              Failed requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">RPC Call Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {rpcUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rpcUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="count" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No RPC call data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Success vs Error Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieErrorData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieErrorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieErrorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No error distribution data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts based on metrics */}
      {metrics && metrics.performance_data && metrics.performance_data.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Request Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.performance_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Line type="monotone" dataKey="requests" stroke="#60A5FA" strokeWidth={2} />
                <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
