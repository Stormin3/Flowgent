import React, { useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowStep } from '../data/types';
import { APPS, APPS_BY_ID , EVENTS_BY_APP_AND_ID} from '../data/apps';
import { AppIcon } from './AppIcon';
import { Zap, Play, CheckCircle2, Settings, Plus, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface WorkflowGraphProps {
  steps: WorkflowStep[];
  activeStepId: string | null;
  onStepClick: (id: string) => void;
  onAddStep: (parentId?: string) => void;
  onRemoveStep: (id: string) => void;
  onUpdateStepPosition: (id: string, position: { x: number, y: number }) => void;
}

type StepNodeData = {
  step: WorkflowStep;
  onRemove: (id: string) => void;
};

type StepNode = Node<StepNodeData, 'step'>;

const StepNodeComponent = ({ data, selected }: NodeProps<StepNode>) => {
  const { step, onRemove } = data;
  const app = APPS_BY_ID[step.appId];
  const event = app && step.eventId ? EVENTS_BY_APP_AND_ID[app.id]?.[step.eventId] : null;

  return (
    <div className={cn(
      "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border p-5 shadow-sm transition-all duration-500 min-w-[280px]",
      selected 
        ? "border-indigo-400/50 dark:border-indigo-500/50 ring-4 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-2xl shadow-indigo-100 dark:shadow-none -translate-y-1" 
        : "border-white/60 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-xl hover:-translate-y-0.5"
    )}>
      {step.type === 'action' && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-4 h-4 bg-indigo-500 border-4 border-white dark:border-slate-900 shadow-sm" 
        />
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 shrink-0 transition-all duration-500",
            selected 
              ? "border-indigo-500 bg-white dark:bg-slate-800 scale-110 rotate-3" 
              : "border-white dark:border-slate-700 bg-white/80 dark:bg-slate-800/80"
          )}>
            {app ? (
              <AppIcon app={app} className="w-8 h-8 rounded-lg" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {step.type === 'trigger' ? <Zap className="w-4 h-4 text-slate-400" /> : <Play className="w-4 h-4 text-slate-400" />}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full",
                step.type === 'trigger' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
              )}>
                {step.type}
              </span>
              {app && event && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                </span>
              )}
              {step.errorConfig && step.errorConfig.action !== 'stop' && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-2.5 h-2.5" /> {step.errorConfig.action}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
              {app ? app.name : `Select ${step.type} app`}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate opacity-80">
              {event ? event.name : `Choose an event`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {step.type !== 'trigger' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(step.id); }}
              className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:rotate-12"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 bg-indigo-500 border-4 border-white dark:border-slate-900 shadow-sm" 
      />
    </div>
  );
};

const nodeTypes = {
  step: StepNodeComponent,
};

export function WorkflowGraph({ 
  steps, 
  activeStepId, 
  onStepClick, 
  onAddStep, 
  onRemoveStep,
  onUpdateStepPosition
}: WorkflowGraphProps) {
  
  const nodes: Node[] = useMemo(() => {
    return steps.map((step, index) => ({
      id: step.id,
      type: 'step',
      position: step.position || { x: 250, y: index * 150 + 50 },
      data: { step, onRemove: onRemoveStep },
      selected: activeStepId === step.id,
    }));
  }, [steps, activeStepId, onRemoveStep]);

  const edges: Edge[] = useMemo(() => {
    const newEdges: Edge[] = [];
    
    // Linear edges
    for (let i = 0; i < steps.length - 1; i++) {
      newEdges.push({
        id: `e-${steps[i].id}-${steps[i+1].id}`,
        source: steps[i].id,
        target: steps[i+1].id,
        animated: true,
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#cbd5e1',
        },
      });
    }

    // Fallback edges
    steps.forEach(step => {
      // Default fallback
      if (step.errorConfig?.action === 'fallback' && step.errorConfig.fallbackStepId) {
        newEdges.push({
          id: `fallback-${step.id}-${step.errorConfig.fallbackStepId}`,
          source: step.id,
          target: step.errorConfig.fallbackStepId,
          animated: true,
          label: 'Fallback',
          labelStyle: { fill: '#d97706', fontSize: 10, fontWeight: 700 },
          style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#f59e0b',
          },
        });
      }

      // Rules fallback edges
      step.errorConfig?.rules?.forEach(rule => {
        if (rule.action === 'fallback' && rule.fallbackStepId) {
          const label = rule.errorCode 
            ? `Fallback (${rule.errorType}: ${rule.errorCode})` 
            : `Fallback (${rule.errorType})`;
            
          newEdges.push({
            id: `rule-fallback-${step.id}-${rule.id}-${rule.fallbackStepId}`,
            source: step.id,
            target: rule.fallbackStepId,
            animated: true,
            label: label,
            labelStyle: { fill: '#d97706', fontSize: 8, fontWeight: 600 },
            style: { stroke: '#fbbf24', strokeWidth: 1.5, strokeDasharray: '3,3' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#fbbf24',
            },
          });
        }
      });
    });

    return newEdges;
  }, [steps]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onStepClick(node.id);
  }, [onStepClick]);

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    onUpdateStepPosition(node.id, node.position);
  }, [onUpdateStepPosition]);

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        fitView
        className="bg-slate-50 dark:bg-slate-950"
      >
        <Background color="#e2e8f0" gap={20} className="dark:opacity-10" />
        <Controls className="dark:bg-slate-900 dark:border-slate-800 dark:fill-white" />
        <Panel position="top-right" className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-2">
          <button 
            onClick={() => onAddStep()}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Step
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
