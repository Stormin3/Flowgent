import React from 'react';
import { LayoutDashboard, Workflow, Blocks, Settings, HelpCircle, LogOut, X, Moon, Sun, Key, Activity, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: 'dashboard' | 'apps' | 'connections' | 'monitoring' | 'templates' | 'settings';
  onChangeView: (view: 'dashboard' | 'apps' | 'connections' | 'monitoring' | 'templates' | 'settings') => void;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Sidebar({ currentView, onChangeView, isOpen, onClose, darkMode, onToggleDarkMode }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0 transform transition-transform duration-200 ease-in-out md:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Workflow className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">flowgent</span>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-white" aria-label="Close sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <button
            onClick={() => { onChangeView('dashboard'); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              currentView === 'dashboard' 
                ? "bg-indigo-500/10 text-indigo-400" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => { onChangeView('apps'); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              currentView === 'apps' 
                ? "bg-indigo-500/10 text-indigo-400" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Blocks className="w-5 h-5" />
            Apps & Integrations
          </button>
          <button
            onClick={() => { onChangeView('templates'); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              currentView === 'templates' 
                ? "bg-indigo-500/10 text-indigo-400" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Sparkles className="w-5 h-5" />
            Templates Library
          </button>
          <button
            onClick={() => { onChangeView('connections'); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              currentView === 'connections' 
                ? "bg-indigo-500/10 text-indigo-400" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Key className="w-5 h-5" />
            Connections
          </button>
          <button
            onClick={() => { onChangeView('monitoring'); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              currentView === 'monitoring' 
                ? "bg-indigo-500/10 text-indigo-400" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Activity className="w-5 h-5" />
            Monitoring & Logs
          </button>
          <button
            onClick={() => { onChangeView('settings'); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              currentView === 'settings' 
                ? "bg-indigo-500/10 text-indigo-400" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-800 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                U
              </div>
              <div>
                <p className="text-sm font-medium text-white">User Account</p>
                <p className="text-xs text-slate-400">Pro Plan</p>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-slate-400">4,500 / 10,000 tasks used</p>
          </div>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
            Help & Support
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <button 
              onClick={onToggleDarkMode}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </div>
              <div className={cn(
                "w-10 h-5 rounded-full relative transition-colors duration-200",
                darkMode ? "bg-indigo-500" : "bg-slate-700"
              )}>
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200",
                  darkMode ? "left-6" : "left-1"
                )} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
