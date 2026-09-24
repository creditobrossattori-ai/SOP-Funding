import React from 'react';
import { Bot, Sparkles, BookOpen, Database, ArrowLeft } from 'lucide-react';
import { FundingModule } from '../types';
import { AIChatDrawer } from './AIChatDrawer';

interface FullScreenChatProps {
  modules: FundingModule[];
  onBackToHome: () => void;
  onGoToModule: (moduleId: string) => void;
}

export const FullScreenChat: React.FC<FullScreenChatProps> = ({
  modules,
  onBackToHome,
  onGoToModule,
}) => {
  return (
    <div className="w-full h-[calc(100vh-64px)] pb-16 md:pb-0 flex flex-col bg-[#F8F9FA] dark:bg-slate-950 transition-colors">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 sm:px-8 py-3 shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Inicio</span>
          </button>

          <div className="h-4 w-px bg-gray-300 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#068383] text-white flex items-center justify-center text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
              Copiloto Gemini & SOP Funding — Crédito Bros
            </span>
          </div>
        </div>

        {/* Quick Module shortcuts */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            Acceso Rápido a Módulos:
          </span>
          <div className="flex gap-1">
            {modules.slice(0, 4).map((m) => (
              <button
                key={m.id}
                onClick={() => onGoToModule(m.id)}
                className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 hover:bg-[#068383] hover:text-white dark:hover:bg-[#068383] text-[11px] font-semibold text-gray-700 dark:text-gray-300 transition"
              >
                M{m.moduleNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Centered Large Chat Canvas (ChatGPT / Claude style) */}
      <div className="flex-1 w-full max-w-4xl mx-auto h-full p-2 sm:p-6 overflow-hidden flex flex-col">
        <div className="flex-1 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <AIChatDrawer isSidebar={false} />
        </div>
      </div>
    </div>
  );
};
