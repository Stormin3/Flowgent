import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, AlertTriangle, CheckCircle2, XCircle, RotateCcw, Clock, Target, Terminal, Search, Play, Filter } from 'lucide-react';
import { WorkflowRun, StepRun, RunStatus } from '../data/types';
import { cn } from '../lib/utils';
import { APPS } from '../data/apps';

// Mock Data generation for presentation
export const generateMockRuns = (): WorkflowRun[] => {
  const statuses: RunStatus[] = ['success', 'success', 'success', 'running', 'failed', 'retrying'];
  return Array.from({ length: 15 }).map((_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isError = status === 'failed' || status === 'retrying';
    const startedAt = new Date(Date.now() - Math.floor(Math.random() * 86400000));
    
    return {
      id: `run_00${i + 1}`,
      workflowId: `wf_${i % 5}`,
      workflowName: ['Process Stripe Payments', 'Sync Slack to Hubspot', 'Weekly Report Generated', 'Discord Onboarding', 'Customer Alert System'][i % 5],
      status,
      startedAt: startedAt.toISOString(),
      completedAt: status === 'running' ? undefined : new Date(startedAt.getTime() + Math.random() * 5000).toISOString(),
      durationMs: status === 'running' ? undefined : Math.floor(Math.random() * 5000) + 200,
      errorDetails: isError ? 'API Rate Limit Exceeded (HTTP 429)' : undefined,
      steps: [
        {
          id: `sr_${i}_1`,
          stepId: 'step_1',
          status: 'success',
          startedAt: startedAt.toISOString(),
          completedAt: new Date(startedAt.getTime() + 100).toISOString(),
          logs: ['[INFO] Webhook received', '[INFO] Payload validated'],
        },
        {
          id: `sr_${i}_2`,
          stepId: 'step_2',
          status: status === 'running' ? 'running' : status,
          startedAt: new Date(startedAt.getTime() + 100).toISOString(),
          completedAt: status === 'running' ? undefined : new Date(startedAt.getTime() + 500).toISOString(),
          logs: ['[INFO] Connecting to target integration', ... (isError ? ['[ERROR] HTTP 429 Too Many Requests'] : ['[INFO] Data mapped successfully', '[INFO] Action completed'])],
          error: isError ? 'HTTP 429 Too Many Requests' : undefined,
        }
      ]
    };
  }).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
};

export function MonitoringView() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [filter, setFilter] = useState<'all' | 'failed' | 'running'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate real-time data influx
  useEffect(() => {
    setRuns(generateMockRuns());
    const interval = setInterval(() => {
      setRuns(prev => {
        const newRuns = [...prev];
        // randomly finish running ones
        newRuns.forEach(r => {
          if (r.status === 'running' && Math.random() > 0.7) {
            r.status = 'success';
            r.completedAt = new Date().toISOString();
            r.durationMs = new Date().getTime() - new Date(r.startedAt).getTime();
          }
        });
        return newRuns;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredRuns = runs.filter(run => {
    if (filter === 'failed' && !['failed', 'retrying'].includes(run.status)) return false;
    if (filter === 'running' && run.status !== 'running') return false;
    if (searchQuery && !run.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) && !run.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: RunStatus) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'running': return <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />;
      case 'retrying': return <RotateCcw className="w-5 h-5 text-amber-500 animate-spin-slow" />;
    }
  };

  const getStatusColor = (status: RunStatus) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'failed': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'running': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'retrying': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  const handleRetry = (runId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'retrying', errorDetails: undefined } : r));
    // Simulate resolution after retry
    setTimeout(() => {
      setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'success', completedAt: new Date().toISOString() } : r));
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="px-6 py-8 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 font-semibold mb-2">
              <Activity className="w-5 h-5" />
              <span>Monitoring & Logs</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">System Pulse</h1>
            <p className="text-slate-500 dark:text-slate-400">Real-time telemetry, execution logs, and intelligent anomaly detection.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-1">
              <div className="absolute pl-3"><Search className="w-4 h-4 text-slate-400" /></div>
              <input 
                type="text" 
                placeholder="Search run ID or name..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-transparent text-sm w-64 focus:outline-none dark:text-white"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-white shadow-sm">
              <Filter className="w-4 h-4" />
              Export Logs
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setFilter('all')} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all", filter === 'all' ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800")}>All Activity</button>
              <button onClick={() => setFilter('failed')} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2", filter === 'failed' ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800")}>
                Failures {runs.filter(r => r.status === 'failed').length > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{runs.filter(r => r.status === 'failed').length}</span>}
              </button>
              <button onClick={() => setFilter('running')} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all", filter === 'running' ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800")}>Active Runs</button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              {filteredRuns.map((run, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className={cn(
                    "flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    selectedRun?.id === run.id && "bg-indigo-50/50 dark:bg-indigo-900/10",
                    idx === filteredRuns.length - 1 && "border-b-0"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getStatusIcon(run.status)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {run.workflowName}
                        <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border", getStatusColor(run.status))}>
                          {run.status}
                        </span>
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                        <span className="font-mono">{run.id}</span>
                        <span>•</span>
                        <span>{new Date(run.startedAt).toLocaleTimeString()}</span>
                        {run.durationMs && (
                          <>
                            <span>•</span>
                            <span>{run.durationMs}ms</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {run.status === 'failed' && (
                      <button 
                        onClick={(e) => handleRetry(run.id, e)}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-slate-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3" />
                        Re-run
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {filteredRuns.length === 0 && (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  <Activity className="w-8 h-8 opacity-20 mx-auto mb-3" />
                  <p>No workflow runs found matching the criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Details Panel */}
          <div>
            <AnimatePresence mode="popLayout">
              {selectedRun ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-12rem)] sticky top-6"
                >
                  <div className="p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                        Execution Trace
                      </h3>
                      <button onClick={() => setSelectedRun(null)} className="text-slate-500 hover:text-white">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">ID: {selectedRun.id}</p>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-5 font-mono text-[11px] leading-relaxed">
                    {selectedRun.errorDetails && (
                      <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
                        <div className="flex items-center gap-2 mb-2 text-rose-500 font-bold uppercase tracking-wider text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> System Alert
                        </div>
                        {selectedRun.errorDetails}
                      </div>
                    )}

                    <div className="space-y-6">
                      {selectedRun.steps.map((step, idx) => (
                        <div key={step.id} className="relative pl-4 border-l border-slate-800">
                          <div className={cn(
                            "absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-slate-900",
                            step.status === 'success' ? "bg-emerald-500" :
                            step.status === 'failed' ? "bg-rose-500" :
                            "bg-indigo-500 animate-pulse"
                          )} />
                          <div className="text-slate-300 font-bold mb-2 flex items-center justify-between">
                            Step {idx + 1}: Execution Phase
                            <span className="text-slate-500 font-normal">{step.durationMs ? `${step.durationMs}ms` : '...'}</span>
                          </div>
                          
                          <div className="space-y-1.5">
                            {step.logs.map((log, lidx) => (
                              <div key={lidx} className={cn(
                                "flex items-start gap-2",
                                log.includes('[ERROR]') ? 'text-rose-400' : 'text-slate-400'
                              )}>
                                <span className="opacity-50 min-w-[65px]">{new Date(step.startedAt).toISOString().split('T')[1].slice(0, 8)}</span>
                                <span className={log.includes('[ERROR]') ? 'font-bold' : ''}>{log}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedRun.status === 'failed' && (
                    <div className="p-4 bg-slate-950 border-t border-slate-800">
                      <button 
                        onClick={(e) => handleRetry(selectedRun.id, e)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-indigo-600/20"
                      >
                        <RotateCcw className="w-4 h-4" /> Force Retry Execution
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-slate-200/50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed p-12 text-center flex flex-col items-center justify-center h-[calc(100vh-12rem)] sticky top-6">
                  <Target className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-4" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select a Run Segment</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500 max-w-[200px]">Click on any workflow execution on the left to view the granular telemetry matrix and raw logs.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
