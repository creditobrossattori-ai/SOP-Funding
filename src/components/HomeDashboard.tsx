import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  FileText,
  Zap,
  PhoneCall,
  Coins,
  ArrowRight,
  Sparkles,
  Bot,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  BookOpen,
  Lock,
} from 'lucide-react';
import { FundingModule, UserProgress } from '../types';
import { calculateModuleProgress } from '../services/progressService';
import { searchSop } from '../services/sopService';

interface HomeDashboardProps {
  modules: FundingModule[];
  progress: UserProgress;
  syncState?: any;
  onSelectModule: (moduleId: string, stepId?: string) => void;
  onOpenChat: (initialPrompt?: string) => void;
  onOpenSyncModal?: () => void;
  isSyncing?: boolean;
  onTriggerSync?: () => void;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'ShieldCheck':
      return ShieldCheck;
    case 'Building2':
      return Building2;
    case 'FileText':
      return FileText;
    case 'Zap':
      return Zap;
    case 'PhoneCall':
      return PhoneCall;
    case 'Coins':
      return Coins;
    default:
      return BookOpen;
  }
};

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  modules,
  progress,
  syncState,
  onSelectModule,
  onOpenChat,
  onOpenSyncModal,
  isSyncing,
  onTriggerSync,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery.trim()
    ? searchSop(searchQuery, modules)
    : [];

  const completedStepsCount = progress.completedStepIds.length;
  let totalStepsCount = 0;
  modules.forEach((m) => {
    m.phases.forEach((p) => {
      totalStepsCount += p.steps.length;
    });
  });

  const overallPct =
    totalStepsCount > 0
      ? Math.round((completedStepsCount / totalStepsCount) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Central Welcome Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm p-6 sm:p-10">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#068383]/10 text-[#068383] dark:bg-[#068383]/25 dark:text-teal-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Plataforma Interna de Fondeo Comercial
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
              Bienvenido al Centro de Funding
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
              La base de conocimiento operativa y SOP de Crédito Bros. Aprende,
              ejecuta y escala rondas de financiamiento de 5 a 6 cifras al 0%
              APR con estándares bancarios rigurosos.
            </p>
          </div>

          {/* Overall Team Progress Card */}
          <div className="w-full md:w-72 p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tu Avance en el SOP
              </span>
              <span className="text-lg font-extrabold text-[#068383]">
                {overallPct}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#068383] rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
              <span>{completedStepsCount} de {totalStepsCount} pasos</span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Auto-guardado
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar & Quick Jump */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 relative">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el SOP (ej: Chase 5/24, Códigos NAICS, Plastiq, Reconsideración)..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#068383] focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-20 z-30 max-w-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden divide-y divide-gray-100 dark:divide-slate-800">
              <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400">
                {searchResults.length} coincidencias encontradas:
              </div>
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelectModule(res.module.id, res.stepId);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-3.5 hover:bg-[#068383]/5 dark:hover:bg-[#068383]/10 transition flex items-start justify-between gap-3 group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#068383]">
                      {res.module.title}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#068383]">
                      {res.stepTitle}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                      {res.snippet}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#068383] group-hover:translate-x-1 transition shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Assistant Banner (Prominent Quick Access) */}
      <section
        id="banner-chatbot"
        className="rounded-2xl bg-gradient-to-r from-[#068383] to-[#046565] text-white p-6 sm:p-8 shadow-md shadow-[#068383]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white shrink-0">
            <Bot className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              SOP Conectado en Tiempo Real
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              ¿Tienes una duda técnica o de suscripción bancaria?
            </h2>
            <p className="text-teal-50 text-sm max-w-2xl leading-relaxed">
              El Asistente Experto en Funding de Crédito Bros responde tus
              preguntas citando fases específicas del SOP y las reglas exactas
              de cada entidad financiera.
            </p>
          </div>
        </div>

        <button
          id="btn-open-chatbot-banner"
          onClick={() => onOpenChat()}
          className="shrink-0 px-6 py-3 rounded-xl bg-white text-[#068383] font-bold text-sm shadow-md hover:bg-teal-50 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
        >
          <span>Abrir Chatbot de Asistencia</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
        </button>
      </section>

      {/* Modules Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">
            Módulos del Programa de Funding
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Completa cada fase en orden secuencial para garantizar la máxima tasa
            de éxito en las rondas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Layers className="w-4 h-4 text-[#068383]" />
          <span>Módulo 1 Activo • Módulo 2 en Proceso</span>
        </div>
      </div>

      {/* Grid of Large Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {modules.map((module) => {
          const IconComp = getIconComponent(module.iconName);
          const { completed, total, percentage } = calculateModuleProgress(
            module,
            progress.completedStepIds
          );
          const isFinished = percentage === 100;
          const isLocked = !!module.isLocked;

          return (
            <div
              key={module.id}
              id={`card-module-${module.id}`}
              className={`group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border p-6 shadow-sm transition-all duration-300 ${
                isLocked
                  ? 'border-dashed border-gray-300 dark:border-slate-700 opacity-90'
                  : 'border-gray-200 dark:border-slate-800 hover:shadow-xl hover:border-[#068383]/40 dark:hover:border-[#068383]/50'
              }`}
            >
              <div className="space-y-4">
                {/* Header with Icon and Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform ${
                      isLocked
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        : 'bg-[#068383]/10 dark:bg-[#068383]/20 text-[#068383] group-hover:scale-110'
                    }`}
                  >
                    {isLocked ? <Lock className="w-5 h-5" /> : <IconComp className="w-6 h-6" />}
                  </div>
                  {module.badge && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isLocked
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-[#068383]/10 text-[#068383] dark:bg-[#068383]/20 dark:text-teal-300'
                      }`}
                    >
                      {module.badge}
                    </span>
                  )}
                </div>

                {/* Title and Subtitle */}
                <div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isLocked ? 'text-amber-600 dark:text-amber-400' : 'text-[#068383]'
                    }`}
                  >
                    Módulo {module.moduleNumber}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#068383] transition mt-0.5 leading-snug">
                    {module.title.replace(/^Módulo \d+:\s*/, '')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-2 mt-1">
                    {module.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {module.description}
                </p>

                {/* Stats & Progress */}
                <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {module.estimatedHours}
                    </span>
                    {isLocked ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Próximamente disponible
                      </span>
                    ) : (
                      <span>
                        {completed}/{total} pasos ({percentage}%)
                      </span>
                    )}
                  </div>
                  {!isLocked && (
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFinished ? 'bg-emerald-500' : 'bg-[#068383]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                {isLocked ? (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                    <Lock className="w-4 h-4" />
                    <span>Módulo en Proceso</span>
                  </div>
                ) : (
                  <button
                    id={`btn-module-${module.id}`}
                    onClick={() => onSelectModule(module.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#068383] hover:bg-[#046565] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Ingresar al Módulo</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Action for Fast AI Access */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          id="btn-floating-chatbot"
          onClick={() => onOpenChat()}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#068383] text-white font-bold text-sm shadow-xl shadow-[#068383]/30 hover:bg-[#046565] hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-slate-800"
          title="Abrir Asistente Experto en Funding"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="hidden sm:inline">Asistente de Funding</span>
          <span className="sm:hidden">Chat</span>
        </button>
      </div>
    </div>
  );
};
