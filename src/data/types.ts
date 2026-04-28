import { AppIntegration, AppEvent } from './apps';

export type ErrorType = 'any' | 'api_error' | 'validation_error' | 'timeout' | 'auth_error' | 'rate_limit_error' | 'network_error';

export type ErrorHandlingRule = {
  id: string;
  errorType: ErrorType;
  errorCode?: string; // Specific error code (e.g., 429, 503)
  description?: string;
  action: 'stop' | 'continue' | 'retry' | 'fallback' | 'notify';
  retryCount?: number;
  retryInterval?: number; // in seconds
  useExponentialBackoff?: boolean;
  fallbackStepId?: string;
  notificationMessage?: string;
};

export type ErrorHandlingConfig = {
  action: 'stop' | 'continue' | 'retry' | 'fallback' | 'notify';
  retryCount?: number;
  retryInterval?: number; // in seconds
  useExponentialBackoff?: boolean;
  fallbackStepId?: string;
  notificationMessage?: string;
  rules?: ErrorHandlingRule[];
};

export type WorkflowGroup = {
  id: string;
  name: string;
  description?: string;
  isCollapsed: boolean;
  position: { x: number; y: number };
  style?: {
    width: number;
    height: number;
    backgroundColor?: string;
  };
};

export type WorkflowStep = {
  id: string;
  type: 'trigger' | 'action';
  appId: string | null;
  eventId: string | null;
  connectionId?: string | null;
  groupId?: string | null;
  config: Record<string, any>;
  errorConfig?: ErrorHandlingConfig;
  position?: { x: number; y: number };
};

export type WorkflowParameter = {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  required: boolean;
  defaultValue?: any;
  description?: string;
};

export type WorkflowVersion = {
  id: string;
  versionNumber: number;
  createdAt: string;
  steps: WorkflowStep[];
  groups?: WorkflowGroup[];
  parameters?: WorkflowParameter[];
  name: string;
  description: string;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: WorkflowStep[];
  groups?: WorkflowGroup[];
  parameters?: WorkflowParameter[];
  createdAt: string;
  updatedAt: string;
  versions?: WorkflowVersion[];
};

export type Connection = {
  id: string;
  userId: string;
  appId: string;
  name: string;
  apiKey: string;
  createdAt: string;
};

export type RunStatus = 'running' | 'success' | 'failed' | 'retrying';

export type WorkflowRun = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  errorDetails?: string;
  steps: StepRun[];
};

export type StepRun = {
  id: string;
  stepId: string;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  logs: string[];
  error?: string;
};