import { UserProgress, FundingModule } from '../types';

const STORAGE_KEY = 'creditobros_funding_progress_v1';

const defaultProgress: UserProgress = {
  completedStepIds: ['step-1-1-1'], // Start with step 1 partially visited
  checklistState: {
    c1: true,
  },
  lastUpdated: new Date().toISOString(),
};

export const getStoredProgress = (): UserProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw);
    return {
      ...defaultProgress,
      ...parsed,
      completedStepIds: Array.isArray(parsed.completedStepIds) ? parsed.completedStepIds : [],
      checklistState: parsed.checklistState || {},
    };
  } catch (e) {
    console.error('Error reading progress from localStorage:', e);
    return defaultProgress;
  }
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress to localStorage:', e);
  }
};

export const toggleStepCompletion = (
  stepId: string,
  currentProgress: UserProgress
): UserProgress => {
  const exists = currentProgress.completedStepIds.includes(stepId);
  const updatedIds = exists
    ? currentProgress.completedStepIds.filter((id) => id !== stepId)
    : [...currentProgress.completedStepIds, stepId];

  const updated: UserProgress = {
    ...currentProgress,
    completedStepIds: updatedIds,
    lastStepId: stepId,
    lastUpdated: new Date().toISOString(),
  };

  saveProgress(updated);
  return updated;
};

export const toggleChecklistItem = (
  checklistId: string,
  currentProgress: UserProgress
): UserProgress => {
  const currentState = currentProgress.checklistState?.[checklistId] ?? false;
  const updated: UserProgress = {
    ...currentProgress,
    checklistState: {
      ...(currentProgress.checklistState || {}),
      [checklistId]: !currentState,
    },
    lastUpdated: new Date().toISOString(),
  };
  saveProgress(updated);
  return updated;
};

export const calculateTotalSteps = (modules: FundingModule[]): number => {
  let count = 0;
  for (const m of modules) {
    for (const p of m.phases) {
      count += p.steps.length;
    }
  }
  return count;
};

export const calculateOverallProgress = (
  modules: FundingModule[],
  completedStepIds: string[]
): number => {
  const total = calculateTotalSteps(modules);
  if (total === 0) return 0;
  const completedCount = completedStepIds.length;
  return Math.min(100, Math.round((completedCount / total) * 100));
};

export const calculateModuleProgress = (
  module: FundingModule,
  completedStepIds: string[]
): { completed: number; total: number; percentage: number } => {
  let total = 0;
  let completed = 0;
  for (const p of module.phases) {
    for (const s of p.steps) {
      total++;
      if (completedStepIds.includes(s.id)) {
        completed++;
      }
    }
  }
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percentage };
};
