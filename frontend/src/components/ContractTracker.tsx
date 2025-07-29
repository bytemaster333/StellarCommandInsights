'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { History, FileText, RefreshCw } from 'lucide-react';

const mockDeployments = [
  {
    contractId: 'CAXYZ123ABC4561243214343',
    wasmHash: '9F3A78D012431532431',
    deployedAt: '2025-07-08 12:00',
    versionStatus: 'First Deploy'
  },
  {
    contractId: 'CAXYZ123ABC456576Y543754',
    wasmHash: '1D2C45B854365634643',
    deployedAt: '2025-07-10 15:42',
    versionStatus: 'Version Update'
  },
  {
    contractId: 'CBABC999XYZ9697687687687',
    wasmHash: '9F3A78D0FHDY654576',
    deployedAt: '2025-07-10 17:21',
    versionStatus: 'Reused WASM'
  }
];

export const ContractTracker = () => {
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const versionBadge = (status: string) => {
    const styles = {
      'First Deploy': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Version Update': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Reused WASM': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return (
      <Badge className={styles[status] || 'bg-slate-600/20 text-slate-300'}>
        {status}
      </Badge>
    );
  };

  const versionHistory = {
    'CAXYZ123ABC4561243214343': [
      { version: 'v1', wasmHash: '9F3A78D0...', deployedAt: '2025-07-08' },
      { version: 'v2', wasmHash: '1D2C45B8...', deployedAt: '2025-07-10' },
      { version: 'v3', wasmHash: '4C6D8E9F...', deployedAt: '2025-07-12' }
    ],
    'CAXYZ123ABC456576Y543754': [
      { version: 'v1', wasmHash: 'AAAA111...', deployedAt: '2025-07-10' }
    ],
    'CBABC999XYZ9697687687687': [
      { version: 'v1', wasmHash: 'BBBB222...', deployedAt: '2025-07-10' },
      { version: 'v2', wasmHash: 'CCCC333...', deployedAt: '2025-07-11' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Contract Tracker
        </h1>
        <p className="text-slate-400 mt-1">
          View historical deployments, WASM hashes, and contract version changes over time.
        </p>
      </div>

      {/* Deployment Table */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Deployed Contracts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-400">Deployed At</TableHead>
                <TableHead className="text-slate-400">Contract ID</TableHead>
                <TableHead className="text-slate-400">WASM Hash</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeployments.map((deploy, i) => (
                <TableRow key={i}>
                  <TableCell className="text-white">{deploy.deployedAt}</TableCell>
                  <TableCell className="text-blue-300 font-mono text-xs">{deploy.contractId}</TableCell>
                  <TableCell className="text-teal-300 font-mono text-xs">{deploy.wasmHash}</TableCell>
                  <TableCell>{versionBadge(deploy.versionStatus)}</TableCell>
                  <TableCell>
                    <Button 
                      onClick={() => setSelectedContractId(deploy.contractId)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md flex items-center space-x-2"
                    >
                      <History className="w-4 h-4 mr-2" />
                      <span>View History</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Version History Viewer */}
      {selectedContractId && versionHistory[selectedContractId] && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              <span>Version History for {selectedContractId}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {versionHistory[selectedContractId].map((ver, i) => (
              <div 
                key={i} 
                className="bg-slate-700/30 rounded-lg px-4 py-2 flex justify-between items-center text-sm text-slate-300"
              >
                <span className="text-white font-medium">{ver.version}</span>
                <span className="text-teal-400 font-mono">{ver.wasmHash}</span>
                <span className="text-slate-400">{ver.deployedAt}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
