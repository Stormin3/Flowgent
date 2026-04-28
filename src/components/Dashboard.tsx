import React, { useState } from 'react';
import { Plus, Play, Pause, MoreVertical, Search, Zap, Clock, History, CheckCircle2, XCircle, Activity, RotateCcw, ChevronRight } from 'lucide-react';
import { Workflow, WorkflowVersion, RunStatus } from '../data/types';
import { APPS } from '../data/apps';
import { AppIcon } from './AppIcon';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { WorkflowVersionsModal } from './WorkflowVersionsModal';
import { generateMockRuns } from './MonitoringView';

interface DashboardProps {
  workflows: Workflow[];
  onCreateNew: () => void;
  onEdit: (workflow: Workflow) => void;
  onToggleActive: (id: string) => void;
  onRevert: (workflowId: string, version: WorkflowVersion) => void;
  onNavigateToMonitoring: () => void;
}

export function Dashboard({ workflows, onCreateNew, onEdit, onToggleActive, onRevert, onNavigateToMonitoring }: DashboardProps) {
  const [viewingVersionsFor, setViewingVersionsFor] = useState<Workflow | null>(null);
  
  // Get a slice of recent runs using the same mock generator
  const recentRuns = generateMockRuns().slice(0, 5);

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

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Workflows</h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">Manage and monitor your automated processes.</p>
          </div>
          <button 
            onClick={onCreateNew}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Workflow
          </button>
        </div>

        {/* Stats/Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Workflows</p>
              <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{workflows.filter(w => w.isActive).length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Play className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Runs</p>
              <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">1,248</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 sm:col-span-2 md:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hours Saved</p>
              <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">42h</p>
            </div>
          </div>
        </div>

        {/* Workflow List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search workflows..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Sort by:</span>
              <select className="bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white focus:ring-0 cursor-pointer p-0 pr-4">
                <option className="dark:bg-slate-900">Last Modified</option>
                <option className="dark:bg-slate-900">Name</option>
                <option className="dark:bg-slate-900">Status</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {workflows.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No workflows yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6 text-sm md:text-base">Create your first automated workflow to get started.</p>
                <button 
                  onClick={onCreateNew}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Workflow
                </button>
              </div>
            ) : (
              workflows.map(workflow => (
                <motion.div 
                  key={workflow.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                  onClick={() => onEdit(workflow)}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    {/* App Icons */}
                    <div className="flex items-center shrink-0">
                      {workflow.steps.filter(s => s.appId).slice(0, 3).map((step, i) => {
                        const app = APPS.find(a => a.id === step.appId);
                        if (!app) return null;
                        return (
                          <div 
                            key={step.id} 
                            className={cn(
                              "w-8 h-8 md:w-10 md:h-10 rounded-xl border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center relative",
                              i > 0 && "-ml-2 md:-ml-3"
                            )}
                            style={{ zIndex: 10 - i }}
                          >
                            <AppIcon app={app} className="w-full h-full rounded-[10px]" />
                          </div>
                        );
                      })}
                      {workflow.steps.filter(s => s.appId).length > 3 && (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl border-2 border-white dark:border-slate-900 shadow-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center -ml-2 md:-ml-3 z-0 text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400">
                          +{workflow.steps.filter(s => s.appId).length - 3}
                        </div>
                      )}
                      {workflow.steps.filter(s => s.appId).length === 0 && (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl border-2 border-slate-200 dark:border-slate-800 border-dashed bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                          <Zap className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {workflow.name}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {workflow.steps.length} steps • Last updated {new Date(workflow.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleActive(workflow.id);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5",
                        workflow.isActive 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      {workflow.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {workflow.isActive ? 'Active' : 'Draft'}
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingVersionsFor(workflow);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors sm:opacity-0 group-hover:opacity-100"
                      title="Version History"
                    >
                      <History className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors sm:opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Recent Runs Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
          <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Recent Workflow Runs
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time status of your latest automated executions.</p>
            </div>
            <button 
              onClick={onNavigateToMonitoring}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View Full Logs
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentRuns.map((run, i) => (
              <div key={run.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getStatusIcon(run.status)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {run.workflowName}
                    </h4>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{run.id}</span>
                      <span>•</span>
                      <span>{new Date(run.startedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border", getStatusColor(run.status))}>
                      {run.status}
                    </span>
                    {run.durationMs && (
                      <span className="text-xs text-slate-400 mt-1.5 font-mono">{run.durationMs}ms</span>
                    )}
                  </div>
                  <button 
                    onClick={onNavigateToMonitoring}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20"
                    title="View Execution Details"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      {viewingVersionsFor && (
        <WorkflowVersionsModal
          workflow={viewingVersionsFor}
          onClose={() => setViewingVersionsFor(null)}
          onRevert={(version) => {
            onRevert(viewingVersionsFor.id, version);
            setViewingVersionsFor(null);
          }}
        />
      )}
    </div>
  );
}
