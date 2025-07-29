
import { useState, useEffect } from 'react';
import { TrendingUp, Terminal, AlertCircle, CheckCircle2, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiService, AnalyticsSummary, CLILog, ContractEvent } from '@/services/api';

export const DashboardHome = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<CLILog[]>([]);
  const [liveEvents, setLiveEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [summaryData, cliLogs, events, activityData] = await Promise.all([
        apiService.fetchAnalyticsSummary(),
        apiService.fetchCLILogs(),
        apiService.fetchLiveEvents(),
        apiService.fetchCommandActivity()
      ]);
      
      setSummary(summaryData);
      setCommandActivity(activityData);
      setRecentActivity(cliLogs.slice(-5));
      setLiveEvents(events);
      setLoading(false);
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const [commandActivity, setCommandActivity] = useState<
    { name: string; commands: number; errors: number }[]
>([]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            Command Center
          </h1>
          <p className="text-slate-400 mt-1">Real-time insights into your Stellar development workflow</p>
        </div>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="pt-6 text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading dashboard data...</p>
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
          Command Center
        </h1>
        <p className="text-slate-400 mt-1">Real-time insights into your Stellar development workflow</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Commands</CardTitle>
            <Terminal className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {summary?.total_commands?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-slate-400">
              {summary ? 'Live data' : 'No data yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {summary ? `${summary.success_rate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-slate-400">
              Command success rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {summary ? `${(summary.avg_response_time / 1000).toFixed(1)}s` : '0s'}
            </div>
            <p className="text-xs text-slate-400">
              Average execution time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {summary?.error_count || '0'}
            </div>
            <p className="text-xs text-slate-400">
              Recent error count
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Command Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={commandActivity}>
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
                <Line type="monotone" dataKey="commands" stroke="#60A5FA" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span>Error Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={commandActivity}>
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
                <Bar dataKey="errors" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <span>Live Activity Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="text-sm text-slate-300">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                    <code className="text-sm bg-slate-600/50 px-2 py-1 rounded text-blue-300">
                      {activity.command}
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">
                      {(activity.duration_ms / 1000).toFixed(1)}s
                    </span>
                    {activity.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No recent activity to display</p>
              <p className="text-sm text-slate-500 mt-1">Start running CLI commands to see live activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
