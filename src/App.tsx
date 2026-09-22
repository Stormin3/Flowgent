/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { WorkflowBuilder } from './components/WorkflowBuilder';
import { ResearchChatbot } from './components/ResearchChatbot';
import { AppsView } from './components/AppsView';
import { ConnectionsView } from './components/ConnectionsView';
import { MonitoringView } from './components/MonitoringView';
import { TemplatesView } from './components/TemplatesView';
import { Workflow } from './data/types';
import { WorkflowTemplate } from './data/templates';
import { v4 as uuidv4 } from 'uuid';
import { Menu, Workflow as WorkflowIcon, Moon, Sun } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'apps' | 'connections' | 'settings' | 'builder' | 'monitoring' | 'templates'>('dashboard');
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf_gmail_example',
      name: 'Process Important Emails',
      description: 'Triggers when a new email arrives in Gmail and processes it.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'step_trigger_1',
          type: 'trigger',
          appId: 'gmail',
          eventId: 'new_email',
          config: {}
        },
        {
          id: 'step_action_1',
          type: 'action',
          appId: 'slack',
          eventId: 'send_channel_message',
          config: {
            channel: 'alerts',
            text: 'New important email received!'
          }
        }
      ]
    }
  ]);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCreateNew = () => {
    setEditingWorkflowId(null);
    setCurrentView('builder');
  };

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflowId(workflow.id);
    setCurrentView('builder');
  };

  const handleUseTemplate = (template: WorkflowTemplate) => {
    const newWorkflow: Workflow = {
      id: uuidv4(),
      name: template.title,
      description: template.description,
      isActive: false,
      steps: template.steps.map(step => ({ ...step, id: uuidv4() })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to list and open builder
    setWorkflows(prev => [...prev, newWorkflow]);
    setEditingWorkflowId(newWorkflow.id);
    setCurrentView('builder');
  };

  const handleSaveWorkflow = (workflow: Workflow) => {
    setWorkflows(prev => {
      const existing = prev.find(w => w.id === workflow.id);
      
      const newVersion = {
        id: crypto.randomUUID(),
        versionNumber: existing ? (existing.versions?.length || 0) + 1 : 1,
        createdAt: new Date().toISOString(),
        steps: workflow.steps,
        groups: workflow.groups,
        parameters: workflow.parameters,
        name: workflow.name,
        description: workflow.description
      };

      if (existing) {
        const versions = existing.versions || [];
        return prev.map(w => w.id === workflow.id ? { 
          ...workflow, 
          updatedAt: new Date().toISOString(),
          versions: [...versions, newVersion]
        } : w);
      }
      return [...prev, { 
        ...workflow, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
        versions: [newVersion]
      }];
    });
    setCurrentView('dashboard');
  };

  const handleToggleActive = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
  };

  const handleRevertWorkflow = (workflowId: string, version: any) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === workflowId) {
        const newVersion = {
          id: crypto.randomUUID(),
          versionNumber: (w.versions?.length || 0) + 1,
          createdAt: new Date().toISOString(),
          steps: version.steps,
          groups: version.groups,
          parameters: version.parameters,
          name: version.name,
          description: version.description
        };
        
        return {
          ...w,
          steps: version.steps,
          groups: version.groups,
          parameters: version.parameters,
          name: version.name,
          description: version.description,
          updatedAt: new Date().toISOString(),
          versions: [...(w.versions || []), newVersion]
        };
      }
      return w;
    }));
  };

  const editingWorkflow = editingWorkflowId ? workflows.find(w => w.id === editingWorkflowId) : undefined;

  return (
    <div className={cn(
      "flex flex-col md:flex-row h-screen w-full overflow-hidden font-sans transition-colors duration-300",
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shrink-0 z-30 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <WorkflowIcon className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">flowgent</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <Sidebar 
        currentView={currentView === 'builder' ? 'dashboard' : currentView} 
        onChangeView={setCurrentView} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {currentView === 'dashboard' && (
          <Dashboard 
            workflows={workflows} 
            onCreateNew={handleCreateNew} 
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            onRevert={handleRevertWorkflow}
            onNavigateToMonitoring={() => setCurrentView('monitoring')}
          />
        )}
        
        {currentView === 'apps' && (
          <AppsView />
        )}
        
        {currentView === 'connections' && (
          <ConnectionsView />
        )}
        
        {currentView === 'monitoring' && (
          <MonitoringView />
        )}
        
        {currentView === 'templates' && (
          <TemplatesView onUseTemplate={handleUseTemplate} />
        )}
        
        {currentView === 'settings' && (
          <div className={cn(
            "flex-1 flex items-center justify-center",
            darkMode ? "bg-slate-950" : "bg-slate-50"
          )}>
            <p className="text-slate-500">Settings coming soon.</p>
          </div>
        )}
        
        {currentView === 'builder' && (
          <WorkflowBuilder 
            workflow={editingWorkflow} 
            onSave={handleSaveWorkflow} 
            onBack={() => setCurrentView('dashboard')}
          />
        )}
        <ResearchChatbot />
      </main>
    </div>
  );
}
