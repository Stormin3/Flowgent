import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, 
  Trash2, 
  Settings, 
  ChevronDown, 
  ArrowRight, 
  Play, 
  Save, 
  Wand2,
  CheckCircle2,
  AlertCircle,
  Link2,
  X,
  ExternalLink,
  Zap,
  Sparkles,
  Search,
  Edit2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { APPS, AppIntegration, AppEvent } from '../data/apps';
import { AppIcon } from './AppIcon';
import { Workflow, WorkflowStep, ErrorHandlingRule, Connection } from '../data/types';
import { WorkflowGraph } from './WorkflowGraph';
import { ConnectionsView } from './ConnectionsView';
import { GoogleGenAI } from '@google/genai';
import { TemplateSuggestions } from './TemplateSuggestions';
import { WorkflowTemplate } from '../data/templates';
import { db, auth, collection, query, where, onSnapshot, handleFirestoreError, OperationType } from '../firebase';

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave: (workflow: Workflow) => void;
  onBack: () => void;
}

export function WorkflowBuilder({ workflow: initialWorkflow, onSave, onBack }: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<Workflow>(
    initialWorkflow || {
      id: uuidv4(),
      name: 'Untitled Workflow',
      description: '',
      isActive: false,
      steps: [
        { id: uuidv4(), type: 'trigger', appId: 'gmail', eventId: 'new_email', config: {} },
        { 
          id: uuidv4(), 
          type: 'action', 
          appId: 'gmail', 
          eventId: 'send_email', 
          config: {
            to: 'recipient@example.com',
            subject: 'Automated Notification',
            body: 'This is an automated message from your workflow.'
          },
          errorConfig: {
            action: 'retry',
            retryCount: 3,
            retryInterval: 10,
            useExponentialBackoff: true
          }
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [magicPrompt, setMagicPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRunning(false);
  }
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectedAppIds, setConnectedAppIds] = useState<string[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'connections'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Connection[];
      setConnections(docs);
      setConnectedAppIds(Array.from(new Set(docs.map(c => c.appId))));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'connections');
    });

    return () => unsubscribe();
  }, []);

  const handleAddStep = () => {
    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, { id: uuidv4(), type: 'action', appId: null, eventId: null, config: {} }]
    }));
  };

  const handleRemoveStep = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id)
    }));
    if (activeStepId === id) setActiveStepId(null);
  };

  const handleUpdateStep = (id: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const handleUpdateStepPosition = (id: string, position: { x: number, y: number }) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === id ? { ...s, position } : s)
    }));
  };

  const handleGenerateWorkflow = async () => {
    if (!magicPrompt.trim()) return;
    setIsGenerating(true);
    
    try {
      // In a real app, we would call Gemini here to parse the prompt
      // For this demo, we'll simulate a response based on keywords
      const prompt = magicPrompt.toLowerCase();
      
      let newSteps: WorkflowStep[] = [];
      let name = 'Generated Workflow';
      
      if (prompt.includes('gmail') && prompt.includes('spreadsheet') && prompt.includes('gemini')) {
        name = 'Email to Spreadsheet via AI';
        newSteps = [
          { id: uuidv4(), type: 'trigger', appId: 'gmail', eventId: 'new_email', config: {} },
          { id: uuidv4(), type: 'action', appId: 'gemini', eventId: 'extract_data', config: {} },
          { id: uuidv4(), type: 'action', appId: 'google_sheets', eventId: 'create_row', config: {} },
        ];
      } else if (prompt.includes('twitter') && prompt.includes('slack')) {
        name = 'Tweet to Slack';
        newSteps = [
          { id: uuidv4(), type: 'trigger', appId: 'twitter', eventId: 'new_mention', config: {} },
          { id: uuidv4(), type: 'action', appId: 'slack', eventId: 'send_channel_message', config: {} },
        ];
      } else {
        // Fallback generic generation simulation
        await new Promise(resolve => setTimeout(resolve, 1500));
        name = 'Custom Automation';
        newSteps = [
          { id: uuidv4(), type: 'trigger', appId: 'gmail', eventId: 'new_email', config: {} },
          { 
            id: uuidv4(), 
            type: 'action', 
            appId: 'gmail', 
            eventId: 'send_email', 
            config: {
              to: 'recipient@example.com',
              subject: 'Alert',
              body: 'New urgent email received.'
            },
            errorConfig: {
              action: 'retry',
              retryCount: 3,
              retryInterval: 10,
              useExponentialBackoff: true
            }
          },
        ];
      }
      
      setWorkflow(prev => ({
        ...prev,
        name,
        description: magicPrompt,
        steps: newSteps
      }));
      setMagicPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyTemplate = (template: WorkflowTemplate) => {
    const newSteps = template.steps.map(step => ({
      ...step,
      id: uuidv4()
    })) as WorkflowStep[];

    setWorkflow(prev => ({
      ...prev,
      name: template.title,
      description: template.description,
      steps: newSteps
    }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 gap-4">
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="min-w-0 flex-1 group relative">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-50 dark:focus:bg-slate-800/50 rounded-lg px-2 -ml-2 w-full truncate transition-all"
                placeholder="Workflow Name"
              />
              <Edit2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("w-2 h-2 rounded-full", workflow.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700")} />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                  {workflow.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
              <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
              <input 
                type="text" 
                value={workflow.description}
                onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                className="text-xs text-slate-500 dark:text-slate-400 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-50 dark:focus:bg-slate-800/50 rounded-md px-1.5 -ml-1.5 flex-1 min-w-0 truncate transition-all"
                placeholder="Add a description..."
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowParametersModal(true)}
            className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Parameters</span>
            <span className="sm:hidden">Params</span>
          </button>
          <button 
            onClick={() => setShowConnectModal(true)}
            className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Connect Apps</span>
            <span className="sm:hidden">Connect</span>
          </button>
          <button 
            onClick={() => setWorkflow(prev => ({ ...prev, isActive: !prev.isActive }))}
            className={cn(
              "flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2",
              workflow.isActive 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" 
                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
            )}
          >
            <Play className="w-4 h-4" />
            {workflow.isActive ? 'Pause' : 'Activate'}
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRun}
              disabled={isRunning || isGenerating}
              className={cn(
                "flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm",
                isRunning 
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-white dark:bg-slate-900 border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800"
              )}
            >
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
            </button>
            <button 
              onClick={() => onSave(workflow)}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Workflow</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex relative">
        {/* Canvas */}
        <div className="flex-1 relative flex flex-col">
          {/* Magic Prompt & Suggestions */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-10 space-y-6">
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 dark:border-slate-700/60 p-2 flex flex-col sm:flex-row sm:items-center gap-2 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400/50 transition-all duration-500">
              <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 items-center justify-center shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <input 
                type="text" 
                value={magicPrompt}
                onChange={(e) => setMagicPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateWorkflow()}
                placeholder="Describe your automation in plain English..."
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
              />
              <button 
                onClick={handleGenerateWorkflow}
                disabled={isGenerating || !magicPrompt.trim()}
                className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:bg-black dark:hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate
              </button>
            </div>

            {/* Template Suggestions */}
            <TemplateSuggestions 
              connectedAppIds={connectedAppIds} 
              onSelect={handleApplyTemplate} 
            />
          </div>

          {/* Graph View */}
          <div className="flex-1">
            <WorkflowGraph 
              steps={workflow.steps}
              activeStepId={activeStepId}
              onStepClick={setActiveStepId}
              onAddStep={handleAddStep}
              onRemoveStep={handleRemoveStep}
              onUpdateStepPosition={handleUpdateStepPosition}
            />
          </div>
        </div>

        {/* Configuration Panel */}
        <AnimatePresence>
          {activeStepId && (
            <>
              {/* Mobile Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
                onClick={() => setActiveStepId(null)}
              />
              
              <motion.div 
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-sm md:max-w-none md:w-auto md:static bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-50 md:z-20 overflow-hidden flex flex-col shrink-0"
              >
                <StepConfigPanel 
                  step={workflow.steps.find(s => s.id === activeStepId)!}
                  allSteps={workflow.steps}
                  triggerStep={workflow.steps[0]}
                  connections={connections}
                  parameters={workflow.parameters || []}
                  onUpdate={(updates) => handleUpdateStep(activeStepId, updates)}
                  onClose={() => setActiveStepId(null)}
                  onManageConnections={() => setShowConnectModal(true)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Parameters Modal */}
        <AnimatePresence>
          {showParametersModal && (
            <ParametersModal 
              parameters={workflow.parameters || []}
              onUpdate={(parameters) => setWorkflow(prev => ({ ...prev, parameters }))}
              onClose={() => setShowParametersModal(false)}
            />
          )}
        </AnimatePresence>

        {/* Connect Apps Modal */}
        <AnimatePresence>
          {showConnectModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setShowConnectModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connect New Apps</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your service integrations and accounts</p>
                  </div>
                  <button 
                    onClick={() => setShowConnectModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <ConnectionsView hideHeader />
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Connecting an app allows us to access its data for your workflows.
                  </p>
                  <button 
                    onClick={() => setShowConnectModal(false)}
                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CustomDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string | null; 
  onChange: (val: string) => void; 
  options: { id: string; name: string; description?: string }[]; 
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-white dark:bg-slate-900 border text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-colors",
          isOpen ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
          selected ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
        )}
      >
        <span className="truncate font-medium">{selected ? selected.name : placeholder}</span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
          >
            {options.map(option => (
              <button
                key={option.id}
                onClick={() => { onChange(option.id); setIsOpen(false); }}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0",
                  value === option.id ? "bg-indigo-50/50 dark:bg-indigo-900/20" : ""
                )}
              >
                <div className="font-medium text-slate-900 dark:text-white">{option.name}</div>
                {option.description && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{option.description}</div>
                )}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">No options available</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepConfigPanel({ step, allSteps, triggerStep, connections, parameters, onUpdate, onClose, onManageConnections }: { 
  step: WorkflowStep, 
  allSteps: WorkflowStep[],
  triggerStep?: WorkflowStep,
  connections: Connection[],
  parameters: any[],
  onUpdate: (updates: Partial<WorkflowStep>) => void,
  onClose: () => void,
  onManageConnections: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'mapping'>('config');
  
  const selectedApp = APPS.find(a => a.id === step.appId);
  const events = selectedApp ? (step.type === 'trigger' ? selectedApp.triggers : selectedApp.actions) : [];
  
  const filteredApps = APPS.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (step.type === 'trigger' ? app.triggers.length > 0 : app.actions.length > 0)
  );

  const allEvents = APPS.flatMap(app => 
    (step.type === 'trigger' ? app.triggers : app.actions).map(e => ({
      ...e,
      appId: app.id,
      appName: app.name,
      displayName: `${app.name}: ${e.name}`
    }))
  );

  const triggerApp = triggerStep ? APPS.find(a => a.id === triggerStep.appId) : null;
  const triggerEvent = triggerApp ? triggerApp.triggers.find(e => e.id === triggerStep.eventId) : null;

  const otherSteps = allSteps.filter(s => s.id !== step.id);
  const currentIndex = allSteps.findIndex(s => s.id === step.id);
  const precedingSteps = currentIndex > 0 ? allSteps.slice(0, currentIndex) : [];

  const appConnections = connections.filter(c => c.appId === step.appId);

  return (
    <div className="flex flex-col h-full w-full md:w-[400px]">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          Configure {step.type === 'trigger' ? 'Trigger' : 'Action'}
        </h2>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {selectedApp && step.eventId && (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('config')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors relative",
              activeTab === 'config' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            Configuration
            {activeTab === 'config' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors relative",
              activeTab === 'mapping' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            Data Mapping
            {activeTab === 'mapping' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-20">
        {activeTab === 'config' ? (
          <>
            {/* App Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">1. App</label>
          
          {!selectedApp ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder={`Search apps and ${step.type}s...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                />
              </div>
              
              <div className="space-y-6">
                {APPS.filter(app => {
                  const appEvents = step.type === 'trigger' ? app.triggers : app.actions;
                  if (appEvents.length === 0) return false;
                  
                  const matchesApp = app.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesEvents = appEvents.some(e => 
                    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    e.description.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  
                  return matchesApp || matchesEvents;
                }).map(app => {
                  const appEvents = step.type === 'trigger' ? app.triggers : app.actions;
                  const filteredEvents = appEvents.filter(e => 
                    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  
                  return (
                    <div key={app.id} className="space-y-2">
                      <button 
                        onClick={() => onUpdate({ appId: app.id, eventId: null })}
                        className="flex items-center gap-2 px-1 hover:opacity-80 transition-opacity"
                      >
                        <AppIcon app={app} className="w-5 h-5 rounded" />
                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{app.name}</h3>
                      </button>
                      <div className="space-y-1">
                        {filteredEvents.map(event => (
                          <button
                            key={event.id}
                            onClick={() => onUpdate({ appId: app.id, eventId: event.id })}
                            className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                          >
                            <div className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {event.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {event.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {APPS.filter(app => {
                  const appEvents = step.type === 'trigger' ? app.triggers : app.actions;
                  if (appEvents.length === 0) return false;
                  const matchesApp = app.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesEvents = appEvents.some(e => 
                    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    e.description.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  return matchesApp || matchesEvents;
                }).length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                    No {step.type}s found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <AppIcon app={selectedApp} className="w-8 h-8 rounded-lg" />
                <span className="font-medium text-slate-900 dark:text-white">{selectedApp.name}</span>
              </div>
              <button 
                onClick={() => onUpdate({ appId: null, eventId: null })}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Event Selection */}
        {selectedApp && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">2. Event</label>
            <CustomDropdown
              value={step.eventId}
              onChange={(val) => onUpdate({ eventId: val })}
              options={events}
              placeholder={`Select ${step.type === 'trigger' ? 'a trigger' : 'an action'}...`}
            />
          </motion.div>
        )}

        {/* Account Connection */}
        {selectedApp && step.eventId && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">3. Account</label>
            <CustomDropdown
              value={step.connectionId || null}
              onChange={(val) => {
                if (val === 'new') {
                  onManageConnections();
                } else {
                  onUpdate({ connectionId: val });
                }
              }}
              options={[
                ...appConnections.map(c => ({ id: c.id, name: c.name, description: 'Connected' })),
                { id: 'new', name: '+ Add new connection', description: 'Connect another account' }
              ]}
              placeholder="Select an account..."
            />
          </motion.div>
        )}

        {/* Trigger Selection (Only for actions) */}
        {step.type === 'action' && selectedApp && step.eventId && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">4. Trigger Source</label>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">Select the trigger that will start this action.</p>
              <CustomDropdown
                value={step.config?.triggerStepId || null}
                onChange={(val) => onUpdate({ config: { ...step.config, triggerStepId: val } })}
                options={triggerStep ? [
                  { 
                    id: triggerStep.id, 
                    name: triggerApp ? `${triggerApp.name}: ${triggerEvent?.name || 'Trigger'}` : 'First Step (Trigger)',
                    description: 'The first step in this workflow'
                  }
                ] : []}
                placeholder="Select trigger step..."
              />
            </div>
          </motion.div>
        )}

        {/* Configuration Fields */}
        {selectedApp && step.eventId && events.find(e => e.id === step.eventId)?.fields && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">5. Configuration</label>
            <div className="space-y-4">
              {events.find(e => e.id === step.eventId)?.fields?.map(field => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    { (precedingSteps.length > 0 || parameters.length > 0) && (
                      <VariableSelector 
                        precedingSteps={precedingSteps}
                        parameters={parameters}
                        onSelect={(variable) => {
                          const currentValue = step.config?.[field.id] || '';
                          onUpdate({ config: { ...step.config, [field.id]: currentValue + variable } });
                        }}
                      />
                    )}
                  </div>
                  {field.description && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{field.description}</p>
                  )}
                  
                  {field.type === 'select' ? (
                    <CustomDropdown
                      value={step.config?.[field.id] || null}
                      onChange={(val) => onUpdate({ config: { ...step.config, [field.id]: val } })}
                      options={field.options || []}
                      placeholder={`Select ${field.name.toLowerCase()}...`}
                    />
                  ) : field.type === 'boolean' ? (
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          checked={step.config?.[field.id] || false}
                          onChange={(e) => onUpdate({ config: { ...step.config, [field.id]: e.target.checked } })}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-10 h-5 rounded-full transition-colors",
                          step.config?.[field.id] ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"
                        )} />
                        <div className={cn(
                          "absolute left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                          step.config?.[field.id] ? "translate-x-5" : "translate-x-0"
                        )} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {step.config?.[field.id] ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  ) : (
                    <input 
                      type="text"
                      value={step.config?.[field.id] || ''}
                      onChange={(e) => onUpdate({ config: { ...step.config, [field.id]: e.target.value } })}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error Handling Section */}
        {selectedApp && step.eventId && step.type === 'action' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">6. Error Handling</label>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">If this step fails:</label>
                <CustomDropdown
                  value={step.errorConfig?.action || 'stop'}
                  onChange={(val) => {
                    const action = val as any;
                    const updates: any = { action };
                    
                    // Set defaults if switching to retry and no values exist
                    if (action === 'retry') {
                      if (!step.errorConfig?.retryCount) updates.retryCount = 3;
                      if (!step.errorConfig?.retryInterval) updates.retryInterval = 5;
                      if (step.errorConfig?.useExponentialBackoff === undefined) updates.useExponentialBackoff = false;
                    }

                    onUpdate({ 
                      errorConfig: { 
                        ...(step.errorConfig || { action: 'stop' }), 
                        ...updates
                      } 
                    });
                  }}
                  options={[
                    { id: 'stop', name: 'Stop Workflow', description: 'Halt execution immediately' },
                    { id: 'continue', name: 'Continue Anyway', description: 'Ignore error and proceed to next step' },
                    { id: 'retry', name: 'Retry Step', description: 'Attempt the action again' },
                    { id: 'fallback', name: 'Run Fallback', description: 'Execute a different step' },
                    { id: 'notify', name: 'Send Notification', description: 'Alert an admin or user' }
                  ]}
                  placeholder="Select error action..."
                />
              </div>

              {step.errorConfig?.action === 'retry' && (
                <div className="space-y-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                    The step will be re-executed if it fails. Configure the retry strategy below.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Max Retries</label>
                      <input 
                        type="number"
                        min="1"
                        max="10"
                        value={step.errorConfig?.retryCount || 3}
                        onChange={(e) => onUpdate({ 
                          errorConfig: { 
                            ...step.errorConfig!, 
                            retryCount: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                          } 
                        })}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Interval (sec)</label>
                      <input 
                        type="number"
                        min="1"
                        max="60"
                        value={step.errorConfig?.retryInterval || 5}
                        onChange={(e) => onUpdate({ 
                          errorConfig: { 
                            ...step.errorConfig!, 
                            retryInterval: Math.max(1, Math.min(60, parseInt(e.target.value) || 1))
                          } 
                        })}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox"
                        checked={step.errorConfig?.useExponentialBackoff || false}
                        onChange={(e) => onUpdate({ 
                          errorConfig: { 
                            ...step.errorConfig!, 
                            useExponentialBackoff: e.target.checked 
                          } 
                        })}
                        className="sr-only"
                      />
                      <div className={cn(
                        "w-8 h-4 rounded-full transition-colors",
                        step.errorConfig?.useExponentialBackoff ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"
                      )} />
                      <div className={cn(
                        "absolute left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                        step.errorConfig?.useExponentialBackoff ? "translate-x-4" : "translate-x-0"
                      )} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Use Exponential Backoff</span>
                      <span className="text-[10px] text-slate-400">Increases the wait time between each retry</span>
                    </div>
                  </label>
                </div>
              )}

              {step.errorConfig?.action === 'fallback' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fallback Step</label>
                  <CustomDropdown
                    value={step.errorConfig?.fallbackStepId || null}
                    onChange={(val) => onUpdate({ 
                      errorConfig: { 
                        ...step.errorConfig!, 
                        fallbackStepId: val 
                      } 
                    })}
                    options={otherSteps.map(s => {
                      const app = APPS.find(a => a.id === s.appId);
                      const event = app ? (s.type === 'trigger' ? app.triggers : app.actions).find(e => e.id === s.eventId) : null;
                      return {
                        id: s.id,
                        name: app ? `${app.name}: ${event?.name || 'Step'}` : 'Unnamed Step',
                        description: s.type === 'trigger' ? 'Trigger' : 'Action'
                      };
                    })}
                    placeholder="Select fallback step..."
                  />
                </div>
              )}

              {step.errorConfig?.action === 'notify' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notification Message</label>
                  <textarea 
                    value={step.errorConfig?.notificationMessage || ''}
                    onChange={(e) => onUpdate({ 
                      errorConfig: { 
                        ...step.errorConfig!, 
                        notificationMessage: e.target.value 
                      } 
                    })}
                    placeholder="Enter message to send when an error occurs..."
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm dark:text-white min-h-[80px]"
                  />
                </div>
              )}

              {/* Specific Error Rules */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Specific Error Rules</label>
                  <button 
                    onClick={() => {
                      const newRule: ErrorHandlingRule = {
                        id: uuidv4(),
                        errorType: 'api_error',
                        action: 'stop'
                      };
                      onUpdate({
                        errorConfig: {
                          ...(step.errorConfig || { action: 'stop' }),
                          rules: [...(step.errorConfig?.rules || []), newRule]
                        }
                      });
                    }}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Rule
                  </button>
                </div>

                {step.errorConfig?.rules?.map((rule, index) => (
                  <div key={rule.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 relative group">
                    <button
                      onClick={() => {
                        onUpdate({
                          errorConfig: {
                            ...step.errorConfig!,
                            rules: step.errorConfig!.rules!.filter(r => r.id !== rule.id)
                          }
                        });
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/50 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Error Type</label>
                        <CustomDropdown
                          value={rule.errorType}
                          onChange={(val) => {
                            const newRules = [...step.errorConfig!.rules!];
                            newRules[index] = { ...rule, errorType: val as any };
                            onUpdate({ errorConfig: { ...step.errorConfig!, rules: newRules } });
                          }}
                          options={[
                            { id: 'any', name: 'Any Error' },
                            { id: 'api_error', name: 'API Error' },
                            { id: 'validation_error', name: 'Validation Error' },
                            { id: 'timeout', name: 'Timeout' },
                            { id: 'auth_error', name: 'Auth Error' },
                            { id: 'rate_limit_error', name: 'Rate Limit' },
                            { id: 'network_error', name: 'Network Error' }
                          ]}
                          placeholder="Select error type..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Error Code (Optional)</label>
                        <input 
                          type="text"
                          placeholder="e.g. 429"
                          value={rule.errorCode || ''}
                          onChange={(e) => {
                            const newRules = [...step.errorConfig!.rules!];
                            newRules[index] = { ...rule, errorCode: e.target.value };
                            onUpdate({ errorConfig: { ...step.errorConfig!, rules: newRules } });
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</label>
                      <CustomDropdown
                        value={rule.action}
                        onChange={(val) => {
                          const newRules = [...step.errorConfig!.rules!];
                          newRules[index] = { ...rule, action: val as any };
                          onUpdate({ errorConfig: { ...step.errorConfig!, rules: newRules } });
                        }}
                        options={[
                          { id: 'stop', name: 'Stop Workflow' },
                          { id: 'continue', name: 'Continue Anyway' },
                          { id: 'retry', name: 'Retry Step' },
                          { id: 'fallback', name: 'Run Fallback' },
                          { id: 'notify', name: 'Send Notification' }
                        ]}
                        placeholder="Select action..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rule Description</label>
                      <input 
                        type="text"
                        placeholder="e.g. Retry on rate limits to avoid failure"
                        value={rule.description || ''}
                        onChange={(e) => {
                          const newRules = [...step.errorConfig!.rules!];
                          newRules[index] = { ...rule, description: e.target.value };
                          onUpdate({ errorConfig: { ...step.errorConfig!, rules: newRules } });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                      />
                    </div>

                    {rule.action === 'retry' && (
                      <div className="space-y-3 p-3 bg-amber-50/30 dark:bg-amber-900/5 border border-amber-100/50 dark:border-amber-900/20 rounded-lg">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Max Retries</label>
                            <input 
                              type="number"
                              min="1"
                              max="10"
                              value={rule.retryCount || 3}
                              onChange={(e) => {
                                const newRules = [...step.errorConfig!.rules!];
                                newRules[index] = { ...rule, retryCount: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) };
                                onUpdate({ errorConfig: { ...step.errorConfig!, rules: newRules } });
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Interval (sec)</label>
                            <input 
                              type="number"
                              min="1"
                              max="60"
                              value={rule.retryInterval || 5}
                              onChange={(e) => {
                                const newRules = [...step.errorConfig!.rules!];
                                newRules[index] = { ...rule, retryInterval: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)) };
                                onUpdate({ errorConfig: { ...step.errorConfig!, rules: newRules } });
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox"
                              checked={rule.useExponentialBackoff || false}
                              onChange={(e) => {
                                const newRules = [...step.errorConfig!.rules!];
                                newRules[index] = { ...rule, useExponentialBackoff: e.target.checked };
                                onUpdate({ errorConfig: { ...step.errorConfig!, rules: newRules } });
                              }}
                              className="sr-only"
                            />
                            <div className={cn(
                              "w-7 h-3.5 rounded-full transition-colors",
                              rule.useExponentialBackoff ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"
                            )} />
                            <div className={cn(
                              "absolute left-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform shadow-sm",
                              rule.useExponentialBackoff ? "translate-x-3.5" : "translate-x-0"
                            )} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">Exponential Backoff</span>
                          </div>
                        </label>
                      </div>
                    )}

                    {rule.action === 'fallback' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Fallback Step</label>
                        <CustomDropdown
                          value={rule.fallbackStepId || null}
                          onChange={(val) => {
                            const newRules = [...step.errorConfig!.rules!];
                            newRules[index] = { ...rule, fallbackStepId: val };
                            onUpdate({ errorConfig: { ...step.errorConfig!, rules: newRules } });
                          }}
                          options={otherSteps.map(s => {
                            const app = APPS.find(a => a.id === s.appId);
                            const event = app ? (s.type === 'trigger' ? app.triggers : app.actions).find(e => e.id === s.eventId) : null;
                            return {
                              id: s.id,
                              name: app ? `${app.name}: ${event?.name || 'Step'}` : 'Unnamed Step',
                            };
                          })}
                          placeholder="Select fallback step..."
                        />
                      </div>
                    )}

                    {rule.action === 'notify' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Notification Message</label>
                        <textarea 
                          value={rule.notificationMessage || ''}
                          onChange={(e) => {
                            const newRules = [...step.errorConfig!.rules!];
                            newRules[index] = { ...rule, notificationMessage: e.target.value };
                            onUpdate({ errorConfig: { ...step.errorConfig!, rules: newRules } });
                          }}
                          placeholder="Message to send..."
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white min-h-[60px]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            </motion.div>
          )}
        </>
      ) : (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Map Fields</h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Zap className="w-3 h-3 text-indigo-500" />
                <span>Assign source data to target fields</span>
              </div>
            </div>

            <div className="space-y-4">
              {events.find(e => e.id === step.eventId)?.fields?.map(field => (
                <div key={field.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{field.type}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      {step.config?.[field.id] ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                          <Zap className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 truncate">
                            {step.config[field.id]}
                          </span>
                          <button 
                            onClick={() => onUpdate({ config: { ...step.config, [field.id]: '' } })}
                            className="ml-auto p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-md transition-colors"
                          >
                            <X className="w-3 h-3 text-indigo-400" />
                          </button>
                        </div>
                      ) : (
                        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-400 italic">
                          Not mapped
                        </div>
                      )}
                    </div>
                    
                    <VariableSelector 
                      precedingSteps={precedingSteps}
                      parameters={parameters}
                      onSelect={(variable) => {
                        onUpdate({ config: { ...step.config, [field.id]: variable } });
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {(!events.find(e => e.id === step.eventId)?.fields || events.find(e => e.id === step.eventId)?.fields?.length === 0) && (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Settings className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No fields available to map for this event.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ParametersModal({ parameters, onUpdate, onClose }: { 
  parameters: any[], 
  onUpdate: (parameters: any[]) => void, 
  onClose: () => void 
}) {
  const handleAddParameter = () => {
    const newParam = {
      id: uuidv4(),
      name: `param_${parameters.length + 1}`,
      type: 'string',
      required: false,
      defaultValue: '',
      description: ''
    };
    onUpdate([...parameters, newParam]);
  };

  const handleUpdateParameter = (id: string, updates: any) => {
    onUpdate(parameters.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleRemoveParameter = (id: string) => {
    onUpdate(parameters.filter(p => p.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workflow Parameters</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define custom inputs for this workflow</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {parameters.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Settings className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No parameters defined</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
                Parameters allow you to pass dynamic data into your workflow when it's triggered.
              </p>
              <button
                onClick={handleAddParameter}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add First Parameter
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {parameters.map((param) => (
                <div key={param.id} className="p-5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl relative group">
                  <button
                    onClick={() => handleRemoveParameter(param.id)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Name</label>
                        <input 
                          type="text"
                          value={param.name}
                          onChange={(e) => handleUpdateParameter(param.id, { name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                          placeholder="parameter_name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Type</label>
                        <CustomDropdown
                          value={param.type}
                          onChange={(val) => handleUpdateParameter(param.id, { type: val })}
                          options={[
                            { id: 'string', name: 'String' },
                            { id: 'number', name: 'Number' },
                            { id: 'boolean', name: 'Boolean' },
                            { id: 'json', name: 'JSON' }
                          ]}
                          placeholder="Select type"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Default Value (Optional)</label>
                        <input 
                          type="text"
                          value={param.defaultValue}
                          onChange={(e) => handleUpdateParameter(param.id, { defaultValue: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                          placeholder="Default value..."
                        />
                      </div>
                      <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox"
                              checked={param.required}
                              onChange={(e) => handleUpdateParameter(param.id, { required: e.target.checked })}
                              className="sr-only"
                            />
                            <div className={cn(
                              "w-8 h-4 rounded-full transition-colors",
                              param.required ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"
                            )} />
                            <div className={cn(
                              "absolute left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                              param.required ? "translate-x-4" : "translate-x-0"
                            )} />
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Required</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
                    <input 
                      type="text"
                      value={param.description}
                      onChange={(e) => handleUpdateParameter(param.id, { description: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                      placeholder="What is this parameter for?"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddParameter}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Another Parameter
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            Parameters can be used in any step using the variable selector.
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function VariableSelector({ 
  precedingSteps, 
  parameters,
  onSelect 
}: { 
  precedingSteps: WorkflowStep[], 
  parameters: any[],
  onSelect: (variable: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md flex items-center gap-1"
      >
        <Zap className="w-3 h-3" />
        Insert Data
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute right-0 z-50 w-64 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
            >
              {precedingSteps.length === 0 && parameters.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">No data available</div>
              ) : (
                <>
                  {parameters.length > 0 && (
                    <div className="border-b border-slate-100 dark:border-slate-800">
                      <div className="px-3 py-2 bg-indigo-50/50 dark:bg-indigo-900/10 text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                        <Settings className="w-3 h-3" />
                        <span>Workflow Parameters</span>
                      </div>
                      {parameters.map((param) => (
                        <button
                          key={param.id}
                          onClick={() => {
                            onSelect(`{{parameters.${param.name}}}`);
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between group"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="truncate font-medium text-slate-700 dark:text-slate-200">{param.name}</span>
                            <span className="text-[10px] text-slate-400 truncate">{param.type}</span>
                          </div>
                          <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  {precedingSteps.map((s, i) => {
                  const app = APPS.find(a => a.id === s.appId);
                  const event = app ? (s.type === 'trigger' ? app.triggers : app.actions).find(e => e.id === s.eventId) : null;
                  if (!app || !event) return null;
                  
                  return (
                    <div key={s.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-[8px] border border-slate-200 dark:border-slate-700">{i + 1}</span>
                        <span className="truncate">{app.name}: {event.name}</span>
                      </div>
                      <div className="p-1 space-y-0.5">
                        {event.outputFields?.map(field => (
                          <button
                            key={field.id}
                            onClick={() => {
                              onSelect(`{{step_${i + 1}.${field.id}}}`);
                              setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between group rounded-lg"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="truncate font-medium text-slate-700 dark:text-slate-200">{field.name}</span>
                              <span className="text-[10px] text-slate-400 truncate">{field.type}</span>
                            </div>
                            <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500 shrink-0" />
                          </button>
                        ))}
                        {(!event.outputFields || event.outputFields.length === 0) && (
                          <button
                            onClick={() => {
                              onSelect(`{{step_${i + 1}.output}}`);
                              setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between group rounded-lg"
                          >
                            <span className="truncate">Output Data</span>
                            <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500 shrink-0" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </div>
  );
}
