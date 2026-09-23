import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveView,
  FundingModule,
  SheetsSyncState,
  UserProgress,
} from './types';
import { DEFAULT_FUNDING_MODULES } from './data/defaultSopData';
import {
  fetchSopData,
  updateSopEndpoint,
  DEFAULT_GOOGLE_SHEETS_SCRIPT_URL,
} from './services/sopService';
import {
  getStoredProgress,
  saveProgress,
  toggleStepCompletion,
  toggleChecklistItem,
  calculateOverallProgress,
} from './services/progressService';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { ModuleView } from './components/ModuleView';
import { FullScreenChat } from './components/FullScreenChat';
import { SheetsSyncModal } from './components/SheetsSyncModal';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [modules, setModules] = useState<FundingModule[]>(DEFAULT_FUNDING_MODULES);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    DEFAULT_FUNDING_MODULES[0].id
  );
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(
    DEFAULT_FUNDING_MODULES[0].phases[0]?.steps[0]?.id
  );

  const [syncState, setSyncState] = useState<SheetsSyncState>({
    status: 'idle',
    endpointUrl: DEFAULT_GOOGLE_SHEETS_SCRIPT_URL,
    source: 'embedded_sop',
    itemCount: DEFAULT_FUNDING_MODULES.length,
    message: 'Cargando datos...',
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Auto-sync configuration state persisted in localStorage
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('creditobros_autosync');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [syncIntervalSeconds, setSyncIntervalSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('creditobros_sync_interval');
      return saved ? parseInt(saved, 10) : 30;
    } catch {
      return 30;
    }
  });

  // Local storage persisted progress
  const [progress, setProgress] = useState<UserProgress>(getStoredProgress);

  // Native dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('creditobros_dark_mode');
      if (savedTheme !== null) {
        return savedTheme === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('creditobros_dark_mode', String(isDarkMode));
    } catch {}
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    try {
      localStorage.setItem('creditobros_autosync', String(enabled));
    } catch {}
  };

  const handleChangeSyncInterval = (interval: number) => {
    setSyncIntervalSeconds(interval);
    try {
      localStorage.setItem('creditobros_sync_interval', String(interval));
    } catch {}
  };

  // Prevent multiple concurrent fetches
  const isFetchingRef = useRef(false);

  // Core function to load data from Google Sheets API
  const handleLoadSopData = async (forceRefresh = false, isBackground = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isBackground) {
      setIsSyncing(true);
    }

    try {
      const result = await fetchSopData(forceRefresh);
      setModules(result.modules);
      setSyncState(result.syncState);
    } catch (e) {
      console.error('Error loading SOP data:', e);
    } finally {
      isFetchingRef.current = false;
      if (!isBackground) {
        setIsSyncing(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    handleLoadSopData(false);
  }, []);

  // Automatic periodic background sync
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const intervalId = setInterval(() => {
      handleLoadSopData(true, true);
    }, syncIntervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [autoSyncEnabled, syncIntervalSeconds]);

  // Sync on window/tab focus (detects Google Sheet changes immediately when user switches tabs)
  useEffect(() => {
    const handleFocus = () => {
      if (autoSyncEnabled) {
        handleLoadSopData(true, true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [autoSyncEnabled]);

  // Update Endpoint URL
  const handleUpdateEndpointUrl = async (newUrl: string) => {
    setIsSyncing(true);
    try {
      await updateSopEndpoint(newUrl);
      const result = await fetchSopData(true, newUrl);
      setModules(result.modules);
      setSyncState(result.syncState);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handlers for module navigation
  const handleSelectModule = (moduleId: string, stepId?: string) => {
    setSelectedModuleId(moduleId);
    const targetModule = modules.find((m) => m.id === moduleId);
    if (stepId) {
      setSelectedStepId(stepId);
    } else if (targetModule && targetModule.phases[0]?.steps[0]) {
      setSelectedStepId(targetModule.phases[0].steps[0].id);
    }
    setActiveView('module');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStep = (stepId: string) => {
    const updated = toggleStepCompletion(stepId, progress);
    setProgress(updated);
  };

  const handleToggleChecklist = (checkId: string) => {
    const updated = toggleChecklistItem(checkId, progress);
    setProgress(updated);
  };

  const overallProgressPct = calculateOverallProgress(
    modules,
    progress.completedStepIds
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-slate-950 text-[#000000] dark:text-gray-100 transition-colors duration-200">
      {/* Permanent Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        overallProgress={overallProgressPct}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        syncState={syncState}
        isSyncing={isSyncing}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onTriggerSync={() => handleLoadSopData(true)}
      />

      {/* Main View Area (A: Home, B: Module, C: Full-Screen Chat) */}
      <div className="flex-1">
        {activeView === 'home' && (
          <HomeDashboard
            modules={modules}
            progress={progress}
            syncState={syncState}
            onSelectModule={handleSelectModule}
            onOpenChat={() => setActiveView('chat')}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            isSyncing={isSyncing}
            onTriggerSync={() => handleLoadSopData(true)}
          />
        )}

        {activeView === 'module' && (
          <ModuleView
            modules={modules}
            selectedModuleId={selectedModuleId}
            selectedStepId={selectedStepId}
            progress={progress}
            onSelectModule={handleSelectModule}
            onToggleStepCompletion={handleToggleStep}
            onToggleChecklistItem={handleToggleChecklist}
            onOpenFullScreenChat={() => setActiveView('chat')}
          />
        )}

        {activeView === 'chat' && (
          <FullScreenChat
            modules={modules}
            onBackToHome={() => setActiveView('home')}
            onGoToModule={(modId) => handleSelectModule(modId)}
          />
        )}
      </div>

      {/* Google Sheets Synchronization & Diagnostics Modal */}
      <SheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncState={syncState}
        isSyncing={isSyncing}
        onManualSync={(forceRefresh) => handleLoadSopData(forceRefresh)}
        onUpdateUrl={handleUpdateEndpointUrl}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={handleToggleAutoSync}
        syncIntervalSeconds={syncIntervalSeconds}
        onChangeSyncInterval={handleChangeSyncInterval}
      />

      {/* Persistent Footer in Black */}
      <footer className="mt-auto border-t border-gray-900 bg-[#000000] py-5 px-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-gray-300">
            <span>© {new Date().getFullYear()} Crédito Bros</span>
            <span>•</span>
            <span className="text-[#068383]">Centro Operativo de Funding</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <span>Base de Conocimiento Oficial • Uso exclusivo interno</span>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="text-[#068383] hover:underline cursor-pointer font-medium"
            >
              Configurar Google Sheets
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
