import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { APPS } from '../data/apps';
import { Connection } from '../data/types';
import { Plus, Trash2, Key, ExternalLink, ShieldCheck, AlertCircle, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ConnectionsViewProps {
  hideHeader?: boolean;
}

export function ConnectionsView({ hideHeader = false }: ConnectionsViewProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [connectionName, setConnectionName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const validateApiKey = (key: string) => {
    if (key.length < 8) {
      return 'API key must be at least 8 characters long.';
    }
    // Simple regex for common API key formats (alphanumeric, hyphens, underscores, dots)
    const apiKeyRegex = /^[a-zA-Z0-9._-]+$/;
    if (!apiKeyRegex.test(key)) {
      return 'API key contains invalid characters. Use only letters, numbers, dots, hyphens, or underscores.';
    }
    return null;
  };

  useEffect(() => {
    if (apiKey) {
      setApiKeyError(validateApiKey(apiKey));
    } else {
      setApiKeyError(null);
    }
  }, [apiKey]);

  const fetchConnections = async () => {
    if (!auth.currentUser) return;
    try {
      const response = await fetch(`/api/connections?userId=${auth.currentUser.uid}`);
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setConnections(data);
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [auth.currentUser]);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !connectionName || !apiKey || !auth.currentUser) return;

    const validationError = validateApiKey(apiKey);
    if (validationError) {
      setApiKeyError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          appId: selectedAppId,
          name: connectionName,
          apiKey: apiKey
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save connection');
      }
      
      await fetchConnections();
      
      setIsAddModalOpen(false);
      setSelectedAppId(null);
      setConnectionName('');
      setApiKey('');
    } catch (err) {
      setError('Failed to save connection. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      const response = await fetch(`/api/connections/${id}?userId=${auth.currentUser?.uid}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete connection');
      }
      
      await fetchConnections();
    } catch (err) {
      console.error('Error deleting connection:', err);
    }
  };

  const filteredApps = APPS.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAppIcon = (appId: string) => {
    const app = APPS.find(a => a.id === appId);
    if (!app) return <Key className="w-5 h-5" />;
    return <Key className="w-5 h-5" style={{ color: app.color }} />;
  };

  const getAppName = (appId: string) => {
    return APPS.find(a => a.id === appId)?.name || 'Unknown App';
  };

  return (
    <div className={cn(
      "flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950",
      hideHeader && "bg-transparent dark:bg-transparent"
    )}>
      {/* Header */}
      {!hideHeader && (
        <header className="p-8 pb-4 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Connections</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your API keys and app credentials securely.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Connection
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className={cn("flex-1 overflow-y-auto p-8 pt-4", hideHeader && "p-0")}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No connections yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
              Connect your favorite apps to start building powerful automated workflows. Your credentials are stored securely.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Set up your first connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((conn) => (
              <motion.div
                key={conn.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {getAppIcon(conn.appId)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{conn.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{getAppName(conn.appId)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteConnection(conn.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <Key className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate flex-1">
                    ••••••••••••••••••••••••
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Added {new Date(conn.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-medium text-indigo-500">
                    <Check className="w-3 h-3" />
                    Connected
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Connection Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Connection</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {!selectedAppId ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search apps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {filteredApps.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setSelectedAppId(app.id)}
                          className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Key className="w-6 h-6" style={{ color: app.color }} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAddConnection} className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        {getAppIcon(selectedAppId)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">{getAppName(selectedAppId)}</h3>
                        <button 
                          type="button"
                          onClick={() => setSelectedAppId(null)}
                          className="text-xs text-indigo-500 font-medium hover:underline"
                        >
                          Change app
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Connection Name
                        </label>
                        <input
                          type="text"
                          required
                          value={connectionName}
                          onChange={(e) => setConnectionName(e.target.value)}
                          placeholder="e.g., My Personal Gmail"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          API Key / Credential
                        </label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="password"
                            required
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                            className={cn(
                              "w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white",
                              apiKeyError && "ring-2 ring-red-500"
                            )}
                          />
                        </div>
                        {apiKeyError && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {apiKeyError}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          This key is stored securely and only accessible by you.
                        </p>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl text-sm flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                      </div>
                    )}

                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedAppId(null)}
                        className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !!apiKeyError}
                        className="flex-[2] px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShieldCheck className="w-5 h-5" />
                            Save Connection
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
