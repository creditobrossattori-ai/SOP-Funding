import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  MessageSquare,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { ActiveView } from '../types';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  overallProgress: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  syncState?: any;
  isSyncing?: boolean;
  onOpenSyncModal?: () => void;
  onTriggerSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  overallProgress,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <header
      id="global-navbar"
      className="sticky top-0 z-40 w-full bg-[#000000] border-b border-gray-900 shadow-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2 text-left focus:outline-none focus:ring-2 focus:ring-[#068383] rounded p-1 transition cursor-pointer"
              title="Ir al inicio - Centro de Funding"
            >
              {!imgError ? (
                <img
                  src="https://lh3.googleusercontent.com/d/1PU2V7T2Q-jKUrnqXGBIoPAWrdEW2Kve1"
                  alt="CreditoBros Logo"
                  style={{ maxHeight: '40px' }}
                  className="object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#068383] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#068383]/20">
                    CB
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm tracking-tight text-white uppercase leading-none">
                      Crédito<span className="text-[#068383]">Bros</span>
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 tracking-wider">
                      FUNDING HUB
                    </span>
                  </div>
                </div>
              )}
            </button>

            {/* Department Badge */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#068383]/20 text-teal-300 border border-[#068383]/40 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#068383] animate-pulse" />
              Equipo Funding
            </div>
          </div>

          {/* Navigation Tabs (3 Main Views) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-tab-home"
              onClick={() => setActiveView('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'home'
                  ? 'bg-[#068383] text-white shadow-sm shadow-[#068383]/30'
                  : 'text-gray-300 hover:bg-gray-850 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Inicio</span>
            </button>

            <button
              id="nav-tab-modules"
              onClick={() => setActiveView('module')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'module'
                  ? 'bg-[#068383] text-white shadow-sm shadow-[#068383]/30'
                  : 'text-gray-300 hover:bg-gray-850 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Módulo</span>
            </button>

            <button
              id="nav-tab-chat"
              onClick={() => setActiveView('chat')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative cursor-pointer ${
                activeView === 'chat'
                  ? 'bg-[#068383] text-white shadow-sm shadow-[#068383]/30'
                  : 'text-gray-300 hover:bg-gray-850 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chatbot IA</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#068383]"></span>
              </span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Progress Bar (Local Storage Persisted) */}
            <div
              className="hidden xl:flex flex-col items-end min-w-[130px]"
              title={`Progreso total del equipo: ${overallProgress}% completado`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#068383]" />
                <span>Progreso: {overallProgress}%</span>
              </div>
              <div className="w-28 h-2 bg-gray-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-[#068383] transition-all duration-500 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              id="btn-toggle-dark-mode"
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-850 border border-transparent hover:border-gray-800 transition cursor-pointer"
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label="Alternar modo oscuro"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
