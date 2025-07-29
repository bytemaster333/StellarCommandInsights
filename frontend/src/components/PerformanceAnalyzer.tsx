
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Gauge, Clock, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export const PerformanceAnalyzer = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [slowCommands, setSlowCommands] = useState([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/performance');
        const data = await res.json();
        setPerformanceData(data.performanceData);
        setTimelineData(data.timelineData);
        setSlowCommands(data.slowCommands);
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
      }
    };
    fetchPerformanceData();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          Performance Analyzer
        </h1>
        <p className="text-slate-400 mt-1">Monitor execution times and optimize your development workflow</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold text-white">
            {timelineData.length && timelineData[timelineData.length - 1]?.avgResponse
              ? timelineData[timelineData.length - 1].avgResponse.toFixed(1)
              : '0.0'}s
          </div>
            <p className="text-xs text-slate-400">
              <span className="text-green-400">-0.2s</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">P95 Response</CardTitle>
            <Gauge className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold text-white">
            {timelineData.length && timelineData[timelineData.length - 1]?.p95
              ? timelineData[timelineData.length - 1].p95.toFixed(1)
              : '0.0'}s
          </div>
            <p className="text-xs text-slate-400">
              <span className="text-red-400">+0.3s</span> from baseline
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Commands/Hour</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold text-white">
            {performanceData.length
              ? performanceData.reduce((sum, item) => sum + (item?.calls || 0), 0)
              : 0}
          </div>
            <p className="text-xs text-slate-400">
              <span className="text-green-400">+18%</span> throughput increase
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Performance Score</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8.7/10</div>
            <p className="text-xs text-slate-400">
              <span className="text-green-400">Excellent</span> performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Average Execution Time by Command</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="command" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="avgTime" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Response Time Percentiles</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
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
                <Area type="monotone" dataKey="p99" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                <Area type="monotone" dataKey="p95" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                <Area type="monotone" dataKey="avgResponse" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Slow Commands */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-red-400" />
            <span>Slowest Commands</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
          {slowCommands.map((cmd, index) => {
            const numericDuration = parseFloat(cmd.duration?.replace(/[^\d.]/g, '')) || 0;
            const width = `${Math.min((numericDuration / 50) * 100, 100)}%`;

            return (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex-1">
                  <code className="text-sm bg-slate-600/50 px-2 py-1 rounded text-blue-300 font-mono break-all">
                    {cmd.command}
                  </code>
                </div>
                <div className="flex items-center space-x-4 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{cmd.duration}</div>
                    <div className="text-xs text-slate-400">{cmd.frequency} times this week</div>
                  </div>
                  <div className="w-16 bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full" 
                      style={{ width }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Performance Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="font-medium text-yellow-400 mb-1">Optimize Build Process</div>
              <div className="text-sm text-slate-300">
                Your contract builds are taking longer than average. Consider enabling incremental builds or using a faster build environment.
              </div>
            </div>
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="font-medium text-blue-400 mb-1">Cache RPC Responses</div>
              <div className="text-sm text-slate-300">
                Enable response caching for read-only RPC calls to reduce latency by up to 60%.
              </div>
            </div>
            
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="font-medium text-green-400 mb-1">Excellent Simulation Performance</div>
              <div className="text-sm text-slate-300">
                Your transaction simulations are performing well within expected parameters.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
