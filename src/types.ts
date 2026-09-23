export type ActiveView = 'home' | 'module' | 'chat';

export type NoteType = 'info' | 'warning' | 'tip' | 'requirement';

export interface StepCallout {
  type: NoteType;
  title: string;
  content: string;
  highlightText?: string;
}

export interface ExternalResource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'tool' | 'template';
  description?: string;
  badge?: string;
}

export interface StepInteractiveChecklist {
  id: string;
  label: string;
  details?: string;
}

export interface ModuleStep {
  id: string;
  title: string;
  summary: string;
  order: number;
  readingTimeMinutes: number;
  contentMarkdown: string;
  callouts?: StepCallout[];
  resources?: ExternalResource[];
  checklist?: StepInteractiveChecklist[];
  keyRules?: string[];
  bankRules?: {
    bankName: string;
    bureau: 'Experian' | 'Equifax' | 'TransUnion' | 'Multibureau';
    ruleName: string;
    recommendation: string;
    coolingPeriod?: string;
  }[];
}

export interface ModulePhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  steps: ModuleStep[];
}

export interface FundingModule {
  id: string;
  slug: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string; // Lucide icon identifier
  colorTheme: string; // Default #068383
  badge?: string;
  estimatedHours: string;
  phases: ModulePhase[];
  isLocked?: boolean;
  statusLabel?: string;
}

export interface UserProgress {
  completedStepIds: string[];
  lastModuleId?: string;
  lastStepId?: string;
  stepNotes?: Record<string, string>;
  checklistState?: Record<string, boolean>;
  lastUpdated: string;
}

export interface WebGroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[];
  webSources?: WebGroundingSource[];
  isError?: boolean;
}

export interface SheetsSyncState {
  status: 'idle' | 'loading' | 'synced' | 'fallback' | 'error' | 'permission_denied';
  lastSynced?: string;
  message?: string;
  endpointUrl: string;
  source: 'google_sheets' | 'embedded_sop';
  itemCount: number;
  autoSyncActive?: boolean;
  syncIntervalSeconds?: number;
  errorDetails?: string;
  httpStatus?: number;
}
