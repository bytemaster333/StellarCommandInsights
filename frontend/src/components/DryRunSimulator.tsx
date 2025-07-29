
import { useState } from 'react';
import { Play, Upload, Download, CheckCircle2, AlertCircle, Fuel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const sampleTransaction = `{
  "contractId": "CCR6QKTVBGST...",
  "function": "transfer",
  "args": [
    {
      "type": "address",
      "value": "GDQJUTQYK2MQX2VGDR47BMHMCOH4WZ5DQCPNM5S3L5TVCEC6XDMA4LHQ"
    },
    {
      "type": "u128",
      "value": "1000000"
    }
  ]
}`;

export const DryRunSimulator = () => {
  const [transactionJson, setTransactionJson] = useState(sampleTransaction);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const mockResults = {
    success: {
      status: 'success',
      gasUsed: 145623,
      gasLimit: 200000,
      result: 'Transfer successful',
      footprint: {
        readOnly: 3,
        readWrite: 2
      },
      cost: '0.0014 XLM'
    },
    error: {
      status: 'error',
      error: 'Insufficient balance for transfer',
      gasUsed: 23451,
      gasLimit: 200000,
      footprint: {
        readOnly: 2,
        readWrite: 0
      }
    }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Randomly return success or error for demo
    const result = Math.random() > 0.3 ? mockResults.success : mockResults.error;
    setSimulationResult(result);
    setIsSimulating(false);
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? 
      <CheckCircle2 className="w-5 h-5 text-green-400" /> : 
      <AlertCircle className="w-5 h-5 text-red-400" />;
  };

  const getStatusBadge = (status: string) => {
    return status === 'success' ? 
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Success</Badge> :
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          Dry Run Simulator
        </h1>
        <p className="text-slate-400 mt-1">Test contract calls before executing them on the network</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-400" />
              <span>Transaction Input</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Transaction JSON</label>
              <Textarea 
                value={transactionJson}
                onChange={(e) => setTransactionJson(e.target.value)}
                className="min-h-[300px] bg-slate-700/50 border-slate-600 text-white font-mono text-sm"
                placeholder="Paste your transaction JSON here..."
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={runSimulation}
                disabled={isSimulating}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
              </Button>
              
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Upload className="w-4 h-4 mr-2" />
                Load File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Play className="w-5 h-5 text-teal-400" />
              <span>Simulation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!simulationResult && !isSimulating && (
              <div className="text-center py-12">
                <Play className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Run a simulation to see results</p>
              </div>
            )}

            {isSimulating && (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Simulating transaction...</p>
              </div>
            )}

            {simulationResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(simulationResult.status)}
                    <span className="text-white font-medium">Simulation Complete</span>
                  </div>
                  {getStatusBadge(simulationResult.status)}
                </div>

                {simulationResult.status === 'success' ? (
                  <div className="space-y-3">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-sm text-slate-300 mb-1">Result</div>
                      <div className="text-green-400 font-medium">{simulationResult.result}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Fuel className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-slate-300">Gas Usage</span>
                        </div>
                        <div className="text-white font-medium">
                          {simulationResult.gasUsed.toLocaleString()} / {simulationResult.gasLimit.toLocaleString()}
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${(simulationResult.gasUsed / simulationResult.gasLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <div className="text-sm text-slate-300 mb-1">Estimated Cost</div>
                        <div className="text-white font-medium">{simulationResult.cost}</div>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-sm text-slate-300 mb-2">Storage Footprint</div>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-blue-400">Read-only: {simulationResult.footprint.readOnly}</span>
                        <span className="text-teal-400">Read-write: {simulationResult.footprint.readWrite}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="text-sm text-slate-300 mb-1">Error Details</div>
                    <div className="text-red-400 font-medium mb-3">{simulationResult.error}</div>
                    
                    <div className="text-sm text-slate-400">
                      Gas used: {simulationResult.gasUsed.toLocaleString()} / {simulationResult.gasLimit.toLocaleString()}
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Templates */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700 h-auto p-4 flex-col"
              onClick={() => setTransactionJson(sampleTransaction)}
            >
              <div className="font-medium mb-1">Token Transfer</div>
              <div className="text-xs text-slate-400">Transfer tokens between accounts</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700 h-auto p-4 flex-col"
            >
              <div className="font-medium mb-1">Contract Deploy</div>
              <div className="text-xs text-slate-400">Deploy a new smart contract</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700 h-auto p-4 flex-col"
            >
              <div className="font-medium mb-1">Custom Function</div>
              <div className="text-xs text-slate-400">Call custom contract function</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
