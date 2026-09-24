import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  FileText,
  ExternalLink,
  Download,
  AlertTriangle,
  Info,
  Lightbulb,
  ShieldAlert,
  Bot,
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  Building,
  Clock,
  Menu,
  Lock,
  X,
} from 'lucide-react';
import {
  FundingModule,
  ModulePhase,
  ModuleStep,
  StepCallout,
  UserProgress,
} from '../types';
import { AIChatDrawer } from './AIChatDrawer';
import { calculateModuleProgress } from '../services/progressService';

interface ModuleViewProps {
  modules: FundingModule[];
  selectedModuleId: string;
  selectedStepId?: string;
  progress: UserProgress;
  onSelectModule: (moduleId: string, stepId?: string) => void;
  onToggleStepCompletion: (stepId: string) => void;
  onToggleChecklistItem: (checkId: string) => void;
  onOpenFullScreenChat: (initialPrompt?: string) => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({
  modules,
  selectedModuleId,
  selectedStepId,
  progress,
  onSelectModule,
  onToggleStepCompletion,
  onToggleChecklistItem,
  onOpenFullScreenChat,
}) => {
  // Active module
  const currentModule =
    modules.find((m) => m.id === selectedModuleId) || modules[0];

  // Active step
  const allSteps: ModuleStep[] = [];
  currentModule.phases.forEach((p) => {
    p.steps.forEach((s) => allSteps.push(s));
  });

  const activeStep =
    allSteps.find((s) => s.id === selectedStepId) || allSteps[0];

  // Accordion state: which phases are expanded
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    [currentModule.phases[0]?.id || '']: true,
  });

  // Right Chatbot Panel: open/closed state
  // On desktop (>=1024px) defaults to open (30% right column).
  // On mobile (<1024px) defaults to closed so it NEVER obstructs or hides module content!
  const [isChatOpen, setIsChatOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Mobile sidebar drawer state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Copy notification for step link
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // When module changes, ensure active step's phase is expanded
    const parentPhase = currentModule.phases.find((p) =>
      p.steps.some((s) => s.id === activeStep?.id)
    );
    if (parentPhase) {
      setExpandedPhases((prev) => ({
        ...prev,
        [parentPhase.id]: true,
      }));
    }
  }, [selectedModuleId, activeStep?.id, currentModule]);

  const togglePhaseAccordion = (phaseId: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const isStepDone = (stepId: string) =>
    progress.completedStepIds.includes(stepId);

  // Next & Prev step navigation
  const currentIndex = allSteps.findIndex((s) => s.id === activeStep?.id);
  const prevStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null;
  const nextStep =
    currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null;

  const handleNextStep = () => {
    if (activeStep && !isStepDone(activeStep.id)) {
      onToggleStepCompletion(activeStep.id);
    }
    if (nextStep) {
      onSelectModule(currentModule.id, nextStep.id);
    }
  };

  const { completed, total, percentage } = calculateModuleProgress(
    currentModule,
    progress.completedStepIds
  );

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#F8F9FA] dark:bg-slate-950 transition-colors">
      {/* Module Top Bar / Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 shrink-0 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto min-w-0">
          {/* Mobile navigation toggle */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-100 font-bold text-xs min-h-[38px] border border-gray-200 dark:border-slate-700 active:scale-95 transition shrink-0"
            title="Abrir índice de pasos"
          >
            <Menu className="w-4 h-4 text-[#068383]" />
            <span>Pasos ({percentage}%)</span>
          </button>

          {/* Module Selector Pill Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline text-xs font-semibold text-gray-500 dark:text-gray-400">
              Módulo:
            </span>
            <select
              value={currentModule.id}
              onChange={(e) => onSelectModule(e.target.value)}
              className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#068383] focus:outline-none cursor-pointer max-w-[150px] sm:max-w-xs truncate"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id} disabled={m.isLocked}>
                  Módulo {m.moduleNumber}: {m.title.replace(/^Módulo \d+:\s*/, '')} {m.isLocked ? '(En Proceso)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>/</span>
            <span className="truncate max-w-xs font-medium text-gray-800 dark:text-gray-200">
              {activeStep?.title}
            </span>
          </div>
        </div>

        {/* Right side of Top Bar: Progress and AI Assistant Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span>Progreso del Módulo:</span>
            <span className="text-[#068383] font-bold">
              {completed}/{total} ({percentage}%)
            </span>
          </div>

          {!isChatOpen && (
            <button
              id="btn-reopen-chat-topbar"
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#068383] text-white hover:bg-[#046565] font-bold text-xs min-h-[36px] shadow-sm active:scale-95 transition shrink-0"
              title="Mostrar Asistente de IA"
            >
              <Bot className="w-3.5 h-3.5 animate-pulse" />
              <span>Consultar IA</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Steps Drawer Backdrop */}
        {isMobileNavOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ========================================================= */}
        {/* COLUMN 1: LEFT NAVIGATION (20% width on desktop)         */}
        {/* ========================================================= */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-1/5 shrink-0 flex flex-col
            ${isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Header of Column 1 */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-slate-800/30">
            <div>
              <div className="text-[11px] font-bold text-[#068383] uppercase tracking-wider">
                Índice de Pasos
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {currentModule.title.replace(/^Módulo \d+:\s*/, '')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#068383] dark:text-teal-300">
                {percentage}%
              </span>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 min-h-[40px] min-w-[40px] flex items-center justify-center transition cursor-pointer"
                title="Cerrar índice"
                aria-label="Cerrar índice"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Accordion Menu with Phases and Steps */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {currentModule.phases.map((phase) => {
              const isExpanded = !!expandedPhases[phase.id];
              const phaseCompletedSteps = phase.steps.filter((s) =>
                isStepDone(s.id)
              ).length;
              const isPhaseDone = phaseCompletedSteps === phase.steps.length;

              return (
                <div
                  key={phase.id}
                  className="rounded-xl border border-gray-200/70 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs"
                >
                  {/* Phase Accordion Header */}
                  <button
                    onClick={() => togglePhaseAccordion(phase.id)}
                    className="w-full text-left p-3 flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isPhaseDone ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-600 flex items-center justify-center shrink-0 text-[9px] font-bold text-gray-500">
                          {phase.phaseNumber}
                        </div>
                      )}
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                        {phase.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-gray-400">
                      <span className="text-[10px]">
                        {phaseCompletedSteps}/{phase.steps.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {/* Steps List */}
                  {isExpanded && (
                    <div className="p-1 space-y-1 bg-gray-50/60 dark:bg-slate-950/40 border-t border-gray-100 dark:border-slate-800">
                      {phase.steps.map((step) => {
                        const isActive = activeStep?.id === step.id;
                        const done = isStepDone(step.id);

                        return (
                          <div
                            key={step.id}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all group ${
                              isActive
                                ? 'bg-[#068383] text-white shadow-sm font-semibold'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            {/* Checkbox to toggle step completion */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStepCompletion(step.id);
                              }}
                              className="shrink-0 p-0.5 rounded focus:outline-none cursor-pointer"
                              title={
                                done
                                  ? 'Marcar como pendiente'
                                  : 'Marcar como completado'
                              }
                            >
                              {done ? (
                                <CheckCircle
                                  className={`w-3.5 h-3.5 ${
                                    isActive
                                      ? 'text-white'
                                      : 'text-emerald-500'
                                  }`}
                                />
                              ) : (
                                <Circle
                                  className={`w-3.5 h-3.5 ${
                                    isActive
                                      ? 'text-teal-200'
                                      : 'text-gray-300 dark:text-slate-600 group-hover:text-gray-400'
                                  }`}
                                />
                              )}
                            </button>

                            {/* Step Title Click */}
                            <button
                              onClick={() => {
                                onSelectModule(currentModule.id, step.id);
                                setIsMobileNavOpen(false);
                              }}
                              className="flex-1 text-left truncate cursor-pointer"
                            >
                              {step.title}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* COLUMN 2: CENTER READING CONTENT (Expandable to 80%/100%) */}
        {/* ========================================================= */}
        <main
          className={`
            flex-1 h-full overflow-y-auto p-4 sm:p-8 pb-28 md:pb-8 transition-all duration-300
            ${isChatOpen ? 'lg:w-[50%]' : 'lg:w-[80%]'}
          `}
        >
          {activeStep ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Step Header */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#068383]/10 text-[#068383] dark:bg-[#068383]/20 dark:text-teal-300 text-xs font-bold">
                      {currentModule.title.split(':')[0]} • Paso {activeStep.order}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {activeStep.readingTimeMinutes} min lectura
                    </span>
                  </div>

                  {/* Completion Toggle button */}
                  <button
                    onClick={() => onToggleStepCompletion(activeStep.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isStepDone(activeStep.id)
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-[#068383] hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {isStepDone(activeStep.id)
                        ? 'Paso Completado'
                        : 'Marcar como completado'}
                    </span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
                  {activeStep.title}
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                  {activeStep.summary}
                </p>
              </div>

              {/* Callout / Notes / Alerts (Required by user: "Nota/Alerta con fondo tenue") */}
              {activeStep.callouts && activeStep.callouts.length > 0 && (
                <div className="space-y-3">
                  {activeStep.callouts.map((callout, idx) => {
                    let styleClasses =
                      'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-100';
                    let Icon = Info;

                    if (callout.type === 'warning') {
                      styleClasses =
                        'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-100';
                      Icon = AlertTriangle;
                    } else if (callout.type === 'requirement') {
                      styleClasses =
                        'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-100';
                      Icon = ShieldAlert;
                    } else if (callout.type === 'tip') {
                      styleClasses =
                        'bg-[#068383]/10 dark:bg-[#068383]/20 border-[#068383]/30 text-teal-900 dark:text-teal-100';
                      Icon = Lightbulb;
                    }

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex items-start gap-3.5 text-sm ${styleClasses}`}
                      >
                        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm">{callout.title}</h4>
                          <p className="leading-relaxed">{callout.content}</p>
                          {callout.highlightText && (
                            <div className="mt-1 text-xs font-bold underline">
                              {callout.highlightText}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Main Content Body */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base space-y-4">
                {activeStep.contentMarkdown.split('\n\n').map((block, bIdx) => {
                  const trimmed = block.trim();
                  if (trimmed === '---') {
                    return (
                      <hr
                        key={bIdx}
                        className="my-5 border-t border-gray-200 dark:border-slate-800"
                      />
                    );
                  }

                  // Inline Note/Callout box syntax: > [!TIPO] or [ALERTA] / [TIP] / [REQUISITO] / [NOTA]
                  if (trimmed.startsWith('> [!') || trimmed.startsWith('[ALERTA]') || trimmed.startsWith('[TIP]') || trimmed.startsWith('[REQUISITO]') || trimmed.startsWith('[NOTA]')) {
                    let type: 'warning' | 'tip' | 'requirement' | 'info' = 'info';
                    let title = 'Nota Operativa';
                    let rawContent = trimmed;

                    if (trimmed.includes('[ALERTA]') || trimmed.includes('[!WARNING]')) {
                      type = 'warning';
                      title = '⚠️ Alerta de Underwriting';
                      rawContent = trimmed.replace(/>\s*\[!(WARNING|ALERTA)\]\s*/i, '').replace(/\[ALERTA\]\s*/i, '');
                    } else if (trimmed.includes('[TIP]') || trimmed.includes('[!TIP]')) {
                      type = 'tip';
                      title = '💡 Consejo Práctico Crédito Bros';
                      rawContent = trimmed.replace(/>\s*\[!TIP\]\s*/i, '').replace(/\[TIP\]\s*/i, '');
                    } else if (trimmed.includes('[REQUISITO]') || trimmed.includes('[!REQUIREMENT]')) {
                      type = 'requirement';
                      title = '🛡️ Requisito Obligatorio';
                      rawContent = trimmed.replace(/>\s*\[!(REQUIREMENT|REQUISITO)\]\s*/i, '').replace(/\[REQUISITO\]\s*/i, '');
                    } else {
                      rawContent = trimmed.replace(/>\s*\[!(NOTE|NOTA)\]\s*/i, '').replace(/\[NOTA\]\s*/i, '');
                    }

                    const boxStyles = {
                      warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200',
                      tip: 'bg-[#068383]/10 dark:bg-[#068383]/20 border-[#068383]/40 dark:border-[#068383]/50 text-teal-950 dark:text-teal-100',
                      requirement: 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/80 text-red-900 dark:text-red-200',
                      info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200',
                    }[type];

                    return (
                      <div key={bIdx} className={`p-4 rounded-xl border-l-4 my-3 shadow-xs ${boxStyles}`}>
                        <div className="font-bold text-xs uppercase tracking-wider mb-1">
                          {title}
                        </div>
                        <div
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: rawContent.replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="font-bold">$1</strong>'
                            ),
                          }}
                        />
                      </div>
                    );
                  }

                  if (trimmed.startsWith('### ')) {
                    return (
                      <div key={bIdx} className="pt-2 pb-1 border-b border-gray-100 dark:border-slate-800">
                        <h3 className="text-xl font-extrabold text-black dark:text-white tracking-tight">
                          {trimmed.replace('### ', '')}
                        </h3>
                      </div>
                    );
                  }
                  if (trimmed.startsWith('#### ')) {
                    return (
                      <h4
                        key={bIdx}
                        className="text-base font-bold text-[#068383] dark:text-teal-400 pt-1 tracking-wide"
                      >
                        {trimmed.replace('#### ', '')}
                      </h4>
                    );
                  }
                  if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                    return (
                      <div key={bIdx} className="my-2 p-3.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
                        <ul className="space-y-2 text-sm sm:text-base">
                          {trimmed.split('\n').map((li, lIdx) => (
                            <li
                              key={lIdx}
                              className="flex items-start gap-2.5 text-gray-700 dark:text-gray-300"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#068383] mt-2 shrink-0" />
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: li
                                    .replace(/^[*|-]\s*/, '')
                                    .replace(
                                      /\*\*(.*?)\*\*/g,
                                      '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>'
                                    ),
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  if (trimmed.match(/^\d+\.\s/)) {
                    return (
                      <div key={bIdx} className="my-2 p-3.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
                        <ol className="space-y-2 text-sm sm:text-base">
                          {trimmed.split('\n').map((li, lIdx) => {
                            const numberMatch = li.match(/^(\d+)\.\s*/);
                            const num = numberMatch ? numberMatch[1] : `${lIdx + 1}`;
                            const cleanText = li.replace(/^\d+\.\s*/, '');
                            return (
                              <li
                                key={lIdx}
                                className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                              >
                                <span className="w-5 h-5 rounded-full bg-[#068383]/10 text-[#068383] dark:bg-[#068383]/20 dark:text-teal-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {num}
                                </span>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: cleanText.replace(
                                      /\*\*(.*?)\*\*/g,
                                      '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>'
                                    ),
                                  }}
                                />
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    );
                  }
                  return (
                    <p
                      key={bIdx}
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: trimmed.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>'
                        ),
                      }}
                    />
                  );
                })}
              </div>

              {/* Bank Rules Matrix (if applicable to this step) */}
              {activeStep.bankRules && activeStep.bankRules.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#068383]" />
                    <span>Reglas de Suscripción Bancaria Específicas</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 text-gray-600 dark:text-gray-300">
                          <th className="py-2.5 px-3 font-semibold">Banco</th>
                          <th className="py-2.5 px-3 font-semibold">Buró Principal</th>
                          <th className="py-2.5 px-3 font-semibold">Regla / Política</th>
                          <th className="py-2.5 px-3 font-semibold">Recomendación Crédito Bros</th>
                          <th className="py-2.5 px-3 font-semibold">Enfriamiento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {activeStep.bankRules.map((br, bIdx) => (
                          <tr
                            key={bIdx}
                            className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30"
                          >
                            <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                              {br.bankName}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-[#068383]/10 text-[#068383] dark:bg-[#068383]/20 dark:text-teal-300 text-xs font-semibold">
                                {br.bureau}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">
                              {br.ruleName}
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                              {br.recommendation}
                            </td>
                            <td className="py-3 px-3 text-gray-500 text-xs">
                              {br.coolingPeriod || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Interactive Step Checklist */}
              {activeStep.checklist && activeStep.checklist.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#068383]" />
                      <span>Checklist de Verificación Operativa</span>
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Sincronizado con almacenamiento local
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {activeStep.checklist.map((item) => {
                      const isChecked = !!progress.checklistState?.[item.id];
                      return (
                        <label
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleChecklistItem(item.id)}
                            className="w-4 h-4 mt-0.5 text-[#068383] rounded focus:ring-[#068383] accent-[#068383] cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <div
                              className={`text-sm font-semibold ${
                                isChecked
                                  ? 'line-through text-gray-400 dark:text-gray-500'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {item.label}
                            </div>
                            {item.details && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.details}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* External Links & Downloadable Resources (Required: "abrir enlaces externos o descargar PDFs") */}
              {activeStep.resources && activeStep.resources.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#068383]" />
                    <span>Recursos, Enlaces Externos & Documentos</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeStep.resources.map((res, rIdx) => (
                      <a
                        key={rIdx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-[#068383] dark:hover:border-[#068383] hover:bg-gray-50 dark:hover:bg-slate-800/50 transition flex items-start justify-between gap-3 text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {res.type === 'pdf' ? (
                              <Download className="w-4 h-4 text-red-500 shrink-0" />
                            ) : (
                              <ExternalLink className="w-4 h-4 text-[#068383] shrink-0" />
                            )}
                            <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#068383] transition">
                              {res.title}
                            </span>
                          </div>
                          {res.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {res.description}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 shrink-0">
                          {res.type}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Step Navigation Bar */}
              <div className="pt-6 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {prevStep ? (
                  <button
                    onClick={() =>
                      onSelectModule(currentModule.id, prevStep.id)
                    }
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold hover:border-[#068383] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Paso Anterior: {prevStep.title}</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  id="btn-next-step"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#068383] hover:bg-[#046565] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {nextStep
                      ? 'Completar y Siguiente Paso'
                      : '¡Módulo Completado!'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Selecciona un paso del menú lateral.
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* COLUMN 3: RIGHT COLLAPSIBLE AI CHATBOT (Desktop 30%)      */}
        {/* ========================================================= */}
        {isChatOpen && (
          <>
            {/* Desktop: 30% Right Column (Unchanged, preserved) */}
            <aside
              id="sidebar-chatbot"
              className="hidden lg:flex lg:w-[30%] h-full shrink-0 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none z-20 flex-col animate-slideInRight"
            >
              <AIChatDrawer
                currentModule={currentModule}
                currentStepTitle={activeStep?.title}
                isSidebar={true}
                onClose={() => setIsChatOpen(false)}
                onExpandToFullScreen={() => onOpenFullScreenChat()}
              />
            </aside>

            {/* Mobile: Bottom Sheet (Does NOT push or squeeze content, easily dismissed with backdrop or Cerrar) */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
              onClick={() => setIsChatOpen(false)}
              aria-hidden="true"
            />
            <div
              className="fixed inset-x-0 bottom-0 z-50 h-[88vh] max-h-[92vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden lg:hidden animate-slideUp"
            >
              {/* Mobile handle to tap or drag */}
              <div
                className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 shrink-0 cursor-pointer"
                onClick={() => setIsChatOpen(false)}
                title="Toca para cerrar"
              />
              <div className="flex-1 overflow-hidden flex flex-col">
                <AIChatDrawer
                  currentModule={currentModule}
                  currentStepTitle={activeStep?.title}
                  isSidebar={true}
                  onClose={() => setIsChatOpen(false)}
                  onExpandToFullScreen={() => onOpenFullScreenChat()}
                />
              </div>
            </div>
          </>
        )}

        {/* Floating Button to Re-Open Chat if Closed (Positioned above mobile bottom bar) */}
        {!isChatOpen && (
          <button
            id="btn-floating-reopen-chat"
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-[#068383] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#068383]/30 hover:bg-[#046565] hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-slate-800"
            title="Reabrir Asistente de IA"
          >
            <Bot className="w-4 h-4 animate-pulse" />
            <span>Consultar Asistente IA</span>
          </button>
        )}
      </div>
    </div>
  );
};
