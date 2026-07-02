export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Job {
  id: string;
  workflowId: string;
  name: string;
  status: JobStatus;
  progress: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface JobCreateInput {
  id?: string;
  workflowId: string;
  name: string;
  status?: JobStatus;
  progress?: number;
  metadata?: Record<string, unknown>;
}

export interface JobUpdateInput {
  status?: JobStatus;
  progress?: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  config: Record<string, unknown>;
  lastRunAt?: number;
  lastStatus?: JobStatus;
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowCreateInput {
  id?: string;
  name: string;
  description?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface WorkflowUpdateInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  lastRunAt?: number;
  lastStatus?: JobStatus;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  path: string;
  size?: number;
  mimeType?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface AssetCreateInput {
  id?: string;
  name: string;
  type: string;
  path: string;
  size?: number;
  mimeType?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AssetUpdateInput {
  name?: string;
  size?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  path: string;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface PluginCreateInput {
  id?: string;
  name: string;
  version: string;
  enabled?: boolean;
  path: string;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface PluginUpdateInput {
  enabled?: boolean;
  version?: string;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type SettingType = 'string' | 'number' | 'boolean' | 'json';

export interface Setting {
  key: string;
  value: string | number | boolean | Record<string, unknown> | unknown[];
  type: SettingType;
  createdAt: number;
  updatedAt: number;
}
