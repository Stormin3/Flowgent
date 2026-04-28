import React, { useState } from 'react';
import { X, Clock, RotateCcw, AlertTriangle } from 'lucide-react';
import { Workflow, WorkflowVersion } from '../data/types';
import { motion, AnimatePresence } from 'motion/react';

interface WorkflowVersionsModalProps {
  workflow: Workflow;
  onClose: () => void;
  onRevert: (version: WorkflowVersion) => void;
}

export function WorkflowVersionsModal({ workflow, onClose, onRevert }: WorkflowVersionsModalProps) {
  const versions = workflow.versions || [];
  const [versionToRevert, setVersionToRevert] = useState<WorkflowVersion | null>(null);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Version History</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {workflow.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {versions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No versions saved yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...versions].reverse().map((version, index) => (
                  <div 
                    key={version.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Version {version.versionNumber}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(version.createdAt).toLocaleString()} • {version.steps.length} steps
                      </p>
                    </div>
                    {index !== 0 && (
                      <button
                        onClick={() => setVersionToRevert(version)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Revert
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      {versionToRevert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 p-6"
          >
            <div className="flex items-center gap-4 text-amber-600 dark:text-amber-500 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revert Workflow?</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to revert to Version {versionToRevert.versionNumber}? This will create a new version with these settings, preserving your current work as the previous version.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setVersionToRevert(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRevert(versionToRevert);
                  setVersionToRevert(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Revert to Version {versionToRevert.versionNumber}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
