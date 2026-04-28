import React from 'react';
import { cn } from '../lib/utils';
import * as LucideIcons from 'lucide-react';
import { AppIntegration } from '../data/apps';

interface AppIconProps {
  app: AppIntegration;
  className?: string;
}

export function AppIcon({ app, className }: AppIconProps) {
  if (app.iconType === 'lucide' && app.iconName) {
    const Icon = (LucideIcons as any)[app.iconName];
    if (Icon) {
      return (
        <div 
          className={cn("flex items-center justify-center rounded-xl text-white shadow-lg overflow-hidden relative group", className)}
          style={{ backgroundColor: app.color }}
        >
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
          <Icon className="w-1/2 h-1/2 relative z-10 drop-shadow-md" />
        </div>
      );
    }
  }

  return (
    <div 
      className={cn("flex items-center justify-center rounded-xl text-white font-bold shadow-lg overflow-hidden relative", className)}
      style={{ backgroundColor: app.color }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
      <span className="relative z-10 drop-shadow-md">{app.textIcon || app.name.substring(0, 1)}</span>
    </div>
  );
}
