import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { APPS } from '../data/apps';
import { AppIcon } from './AppIcon';

export function AppsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(APPS.map(app => app.category))).sort();

  const filteredApps = APPS.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? app.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Apps & Integrations</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">Connect your favorite tools to automate your workflows.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 -mb-2 md:mb-0 w-full md:w-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              All Apps
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredApps.map(app => (
            <div 
              key={app.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group cursor-pointer"
            >
              <AppIcon app={app} className="w-16 h-16 rounded-2xl mb-4 group-hover:scale-105 transition-transform" />
              <h3 className="font-semibold text-slate-900 dark:text-white">{app.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{app.category}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex justify-center gap-4 text-xs font-medium text-slate-400">
                <span title="Triggers">{app.triggers.length} Triggers</span>
                <span title="Actions">{app.actions.length} Actions</span>
              </div>
            </div>
          ))}
        </div>
        
        {filteredApps.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No apps found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
