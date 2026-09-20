import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Workflow, ArrowRight, Zap } from 'lucide-react';
import { WORKFLOW_TEMPLATES, WorkflowTemplate } from '../data/templates';
import { APPS } from '../data/apps';
import { AppIcon } from './AppIcon';
import { cn } from '../lib/utils';
import { auth, db, collection, query, where, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { Connection } from '../data/types';

interface TemplatesViewProps {
  onUseTemplate: (template: WorkflowTemplate) => void;
}

export function TemplatesView({ onUseTemplate }: TemplatesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectedAppIds, setConnectedAppIds] = useState<string[]>([]);

  // Fetch connections to mark which templates are ready to use
  React.useEffect(() => {
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

  const categories = useMemo(() => {
    const cats = new Set(WORKFLOW_TEMPLATES.map(t => t.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredTemplates = useMemo(() => {
    return WORKFLOW_TEMPLATES.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative font-sans">
      
      {/* Magic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-400/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-24 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium text-sm mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Template Library
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6"
          >
            Don't build from scratch. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Start creating instantly.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 dark:text-slate-400"
          >
            Discover pre-configured automation pathways designed for power users. Get up and running in a single click.
          </motion.p>
        </div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between"
        >
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search use cases (e.g. 'Summarize Email')..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  selectedCategory === cat 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" 
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, idx) => {
              const userHasAllConnections = template.requiredApps.every(appId => connectedAppIds.includes(appId));
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  key={template.id}
                  className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex -space-x-3">
                      {template.requiredApps.map((appId, i) => {
                        const app = APPS.find(a => a.id === appId);
                        if (!app) return null;
                        const isConnected = connectedAppIds.includes(appId);
                        return (
                          <div key={appId} className="relative transition-transform group-hover:-translate-y-1" style={{ transitionDelay: `${i * 50}ms`, zIndex: 10 - i }}>
                            <AppIcon app={app} className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-900 shadow-sm" />
                            {isConnected && (
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" title="Connected" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {template.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-1">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Workflow className="w-4 h-4" />
                      {template.steps.length} Steps
                    </div>
                    <button
                      onClick={() => onUseTemplate(template)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        userHasAllConnections
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                          : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 shadow-md"
                      )}
                    >
                      {userHasAllConnections ? (
                        <>
                          <Zap className="w-4 h-4 fill-white" /> Activate Now
                        </>
                      ) : (
                        <>
                          Use Template <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredTemplates.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No templates found</h3>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your search criteria or category filter.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
