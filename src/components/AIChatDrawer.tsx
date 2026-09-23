import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  X,
  Maximize2,
  Trash2,
  Copy,
  Check,
  Globe,
  ExternalLink,
  MessageSquare,
  PhoneCall,
  Search,
  CheckCheck,
} from 'lucide-react';
import { ChatMessage, FundingModule } from '../types';
import { cleanChatPunctuation } from '../utils/cleanText';

interface AIChatDrawerProps {
  currentModule?: FundingModule;
  currentStepTitle?: string;
  isSidebar?: boolean;
  onClose?: () => void;
  onExpandToFullScreen?: () => void;
}

const QUICK_ACTIONS = [
  {
    icon: MessageSquare,
    label: 'Redactar a Cliente',
    prompt: 'Por favor redacta un mensaje claro, persuasivo y empático para mi cliente explicándole cómo pagar con la técnica AZEO 3 días antes de su fecha de corte para elevar su puntaje FICO.',
  },
  {
    icon: PhoneCall,
    label: 'Script de Llamada',
    prompt: 'Escribe un guión de llamada palabra por palabra para comunicarme con el analista de crédito de Chase Reconsideration (888-270-2127) para reconsiderar una tarjeta Chase Ink Business.',
  },
  {
    icon: Search,
    label: 'Buscar en Internet',
    prompt: 'Busca en internet cuáles son las ofertas de bienvenida vigentes y periodos de 0% APR en tarjetas de crédito comerciales de Chase, American Express y US Bank.',
  },
  {
    icon: Sparkles,
    label: 'Auditar Perfil',
    prompt: 'Tengo un cliente con FICO 740, 2 tarjetas primarias con límite de 6,000 USD, 2 inquiries en Experian y 5% de utilización. ¿Cuál es el plan de acción y qué bancos aplicar primero?',
  },
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  currentModule,
  currentStepTitle,
  isSidebar = true,
  onClose,
  onExpandToFullScreen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        '¡Hola! Soy tu Copiloto Inteligente de Funding en Crédito Bros, impulsado por Gemini.\n\nEstoy conectado al SOP operativo de Crédito Bros y cuento con búsqueda en Google en tiempo real.\n\nPuedo ayudarte activamente a:\n- Redactar mensajes listos para enviar a tus clientes por WhatsApp o correo.\n- Crear guiones de llamada para analistas de crédito y líneas de reconsideración bancaria.\n- Investigar en internet ofertas actuales de tarjetas comerciales y condiciones de mercado.\n- Auditar perfiles crediticios de clientes y estructurar rondas de aplicación.\n\n¿En qué cliente, regla o tarea necesitas apoyo hoy?',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchWebEnabled, setSearchWebEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build context of current view if present
      const contextData = {
        currentModuleId: currentModule?.id,
        currentModuleTitle: currentModule?.title,
        currentStepTitle: currentStepTitle || 'Vista general',
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentContext: contextData,
          searchWeb: searchWebEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: cleanChatPunctuation(data.reply || 'No se recibió respuesta del asistente.'),
        webSources: data.webSources,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        isError: true,
        content:
          'Hubo una interrupción de conexión con el servicio de IA o Google Sheets. Según el protocolo de Crédito Bros, consulta directamente con el supervisor si la consulta es crítica.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content:
          'Historial reiniciado. Estoy listo para ayudarte con clientes, búsquedas en internet y consultas del SOP de Crédito Bros.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-gray-50/70 dark:bg-slate-800/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#068383] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
              <span>Asistente Gemini & Funding</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
              <span>Crédito Bros SOP</span>
              <span>•</span>
              <span className="text-[#068383] dark:text-teal-400 font-medium">
                {searchWebEnabled ? 'Google Search Activo' : 'SOP Local'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Web Search Toggle Button */}
          <button
            onClick={() => setSearchWebEnabled(!searchWebEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
              searchWebEnabled
                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-[#068383] dark:text-teal-300'
                : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400'
            }`}
            title={
              searchWebEnabled
                ? 'Búsqueda web activada: el asistente buscará información en internet cuando sea necesario'
                : 'Búsqueda web desactivada: solo responderá con el SOP interno'
            }
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web {searchWebEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {isSidebar && onExpandToFullScreen && (
            <button
              onClick={onExpandToFullScreen}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Expandir a Pantalla Completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Limpiar conversación"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {isSidebar && onClose && (
            <button
              id="btn-close-chat-sidebar"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Ocultar panel lateral de chat"
              aria-label="Cerrar panel de chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-2.5 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-gray-800 text-white dark:bg-slate-700'
                    : 'bg-[#068383] text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`group relative max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#068383] text-white rounded-tr-none'
                    : message.isError
                    ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 rounded-tl-none'
                    : 'bg-gray-100 dark:bg-slate-800/80 text-gray-800 dark:text-gray-100 border border-gray-200/60 dark:border-slate-700/60 rounded-tl-none'
                }`}
              >
                {/* Message body: 100% clean typography without asterisks, numeral hashtags or markdown artifacts */}
                <div className="space-y-1.5">
                  {cleanChatPunctuation(message.content)
                    .split('\n')
                    .map((rawLine, idx) => {
                      const line = rawLine.trim();
                      if (!line) {
                        return <div key={idx} className="h-1.5" />;
                      }

                      // Check if line is a bullet item (- or •)
                      if (line.startsWith('- ') || line.startsWith('• ')) {
                        const bulletText = line.replace(/^[-•]\s*/, '');
                        const colonIdx = bulletText.indexOf(':');
                        if (colonIdx > 0 && colonIdx < 45) {
                          const label = bulletText.substring(0, colonIdx);
                          const rest = bulletText.substring(colonIdx + 1);
                          return (
                            <div key={idx} className="flex items-start gap-2 pl-0.5">
                              <span
                                className={`text-sm leading-none select-none mt-1 ${
                                  isUser ? 'text-teal-200' : 'text-[#068383] dark:text-[#18b5b5]'
                                }`}
                              >
                                •
                              </span>
                              <p className="flex-1 leading-relaxed">
                                <strong
                                  className={`font-semibold ${
                                    isUser
                                      ? 'text-white'
                                      : 'text-gray-900 dark:text-white'
                                  }`}
                                >
                                  {label}:
                                </strong>
                                {rest}
                              </p>
                            </div>
                          );
                        }
                        return (
                          <div key={idx} className="flex items-start gap-2 pl-0.5">
                            <span
                              className={`text-sm leading-none select-none mt-1 ${
                                isUser ? 'text-teal-200' : 'text-[#068383] dark:text-[#18b5b5]'
                              }`}
                            >
                              •
                            </span>
                            <p className="flex-1 leading-relaxed">{bulletText}</p>
                          </div>
                        );
                      }

                      // Check if line is a numbered item: e.g. "1. "
                      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
                      if (numMatch) {
                        const num = numMatch[1];
                        const text = numMatch[2];
                        const colonIdx = text.indexOf(':');
                        if (colonIdx > 0 && colonIdx < 45) {
                          const label = text.substring(0, colonIdx);
                          const rest = text.substring(colonIdx + 1);
                          return (
                            <div key={idx} className="flex items-start gap-2 pl-0.5">
                              <span
                                className={`font-bold text-xs shrink-0 select-none mt-0.5 ${
                                  isUser ? 'text-teal-200' : 'text-[#068383] dark:text-[#18b5b5]'
                                }`}
                              >
                                {num}.
                              </span>
                              <p className="flex-1 leading-relaxed">
                                <strong
                                  className={`font-semibold ${
                                    isUser
                                      ? 'text-white'
                                      : 'text-gray-900 dark:text-white'
                                  }`}
                                >
                                  {label}:
                                </strong>
                                {rest}
                              </p>
                            </div>
                          );
                        }
                        return (
                          <div key={idx} className="flex items-start gap-2 pl-0.5">
                            <span
                              className={`font-bold text-xs shrink-0 select-none mt-0.5 ${
                                isUser ? 'text-teal-200' : 'text-[#068383] dark:text-[#18b5b5]'
                              }`}
                            >
                              {num}.
                            </span>
                            <p className="flex-1 leading-relaxed">{text}</p>
                          </div>
                        );
                      }

                      // Check if line looks like a header/title: e.g. ends with ":" or is a bold section
                      const isTitle = line.endsWith(':') && line.length < 80;
                      if (isTitle) {
                        return (
                          <p
                            key={idx}
                            className={`font-bold pt-1.5 ${
                              isUser
                                ? 'text-white'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {line}
                          </p>
                        );
                      }

                      return (
                        <p key={idx} className="leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                </div>

                {/* Grounding Web Sources if available */}
                {!isUser && message.webSources && message.webSources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-slate-700/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#068383] dark:text-teal-400" />
                      <span>Fuentes de búsqueda web (Google):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {message.webSources.slice(0, 4).map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[10px] text-[#068383] dark:text-teal-300 hover:border-[#068383] transition max-w-[220px] truncate"
                          title={source.url}
                        >
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{source.title || 'Referencia Web'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Footer: Timestamp and Quick Copy */}
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser
                      ? 'text-teal-100'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <span>{message.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer"
                      title="Copiar texto listo para el cliente"
                    >
                      {copiedId === message.id ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#068383] text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#068383] animate-bounce" />
              <div
                className="w-2 h-2 rounded-full bg-[#068383] animate-bounce"
                style={{ animationDelay: '0.15s' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-[#068383] animate-bounce"
                style={{ animationDelay: '0.3s' }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {searchWebEnabled ? 'Buscando en internet y analizando SOP...' : 'Consultando SOP...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips (Gemini style) */}
      <div className="px-3 sm:px-4 py-2 border-t border-gray-100 dark:border-slate-800/80 bg-gray-50/60 dark:bg-slate-900/60 overflow-x-auto shrink-0 flex items-center gap-1.5 scrollbar-none">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Acciones:
        </span>
        {QUICK_ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(action.prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-[#068383] hover:text-[#068383] dark:hover:text-teal-300 hover:shadow-2xs transition shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Icon className="w-3 h-3 text-[#068383] dark:text-teal-400" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta, pide un mensaje para cliente o busca en internet..."
              className="w-full resize-none max-h-32 px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-slate-950/70 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#068383] focus:border-transparent transition"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#068383] text-white hover:bg-[#046565] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition flex items-center justify-center shrink-0 cursor-pointer"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
          <span>Enter para enviar, Shift+Enter para salto de línea</span>
          <span className="flex items-center gap-1">
            <Globe className="w-2.5 h-2.5 text-[#068383]" />
            <span>Google Search & Crédito Bros SOP</span>
          </span>
        </div>
      </div>
    </div>
  );
};
