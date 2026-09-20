import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkflowTemplate, WORKFLOW_TEMPLATES } from '../data/templates';
import { APPS, APPS_BY_ID } from '../data/apps';
import { AppIcon } from './AppIcon';

interface TemplateSuggestionsProps {
  connectedAppIds: string[];
  onSelect: (template: WorkflowTemplate) => void;
}

export function TemplateSuggestions({ connectedAppIds, onSelect }: TemplateSuggestionsProps) {
  // Filter templates where the user has at least one of the required apps connected
  const suggestedTemplates = WORKFLOW_TEMPLATES.filter(template => 
    template.requiredApps.some(appId => connectedAppIds.includes(appId))
  );

  if (suggestedTemplates.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">AI-Powered Suggestions</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestedTemplates.map((template, index) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(template)}
            className="group relative flex flex-col items-start text-left p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 rounded-3xl shadow-sm hover:shadow-xl hover:bg-white/80 dark:hover:bg-slate-900/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
            
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex -space-x-2">
                {template.requiredApps.map(appId => {
                  const app = APPS_BY_ID[appId];
                  if (!app) return null;
                  return (
                    <div key={appId} className="relative">
                      <AppIcon 
                        app={app} 
                        className="w-8 h-8 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm" 
                      />
                      {connectedAppIds.includes(appId) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                {template.category}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {template.title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {template.description}
            </p>

            <div className="mt-auto flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Zap className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400" />
              <span>One-click Setup</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
