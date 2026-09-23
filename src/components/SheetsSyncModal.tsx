import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Link2,
  Copy,
  Check,
  Code2,
  ExternalLink,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { SheetsSyncState } from '../types';

interface SheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SheetsSyncState;
  isSyncing: boolean;
  onManualSync: (forceRefresh?: boolean) => Promise<void>;
  onUpdateUrl: (newUrl: string) => Promise<void>;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  syncIntervalSeconds: number;
  onChangeSyncInterval: (interval: number) => void;
}

const APPS_SCRIPT_TEMPLATE = `// ==========================================
// CÓDIGO GOOGLE APPS SCRIPT PARA CRÉDITO BROS
// ==========================================
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Intenta buscar la hoja 'SOP' o toma la primera hoja
    const sheet = ss.getSheetByName("SOP") || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Hoja sin registros suficientes",
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Encabezados en fila 1
    const headers = data[0].map(h => String(h).trim());
    const rows = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.every(c => c === "" || c === null)) continue;
      
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = row[idx];
      });
      rows.push(obj);
    }
    
    const output = {
      success: true,
      lastUpdated: new Date().toISOString(),
      rowCount: rows.length,
      data: rows
    };
    
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const SheetsSyncModal: React.FC<SheetsSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  isSyncing,
  onManualSync,
  onUpdateUrl,
  autoSyncEnabled,
  onToggleAutoSync,
  syncIntervalSeconds,
  onChangeSyncInterval,
}) => {
  const [urlInput, setUrlInput] = useState(syncState.endpointUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'fix' | 'code'>('status');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(syncState.endpointUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setSaveStatus('Guardando...');
    try {
      await onUpdateUrl(urlInput.trim());
      setSaveStatus('¡URL actualizada y probada!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('Error al actualizar');
    }
  };

  const isBlocked = syncState.status === 'permission_denied';
  const isSuccess = syncState.status === 'synced';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#068383]/15 text-[#068383] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Sincronización Automática con Google Sheets
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Base de datos en vivo de Crédito Bros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/30">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'status'
                ? 'border-[#068383] text-[#068383]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Estado & Auto-Sync
          </button>
          <button
            onClick={() => setActiveTab('fix')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'fix'
                ? 'border-[#068383] text-[#068383]'
                : isBlocked
                ? 'border-transparent text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span>Cómo resolver Error 403</span>
            {isBlocked && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'code'
                ? 'border-[#068383] text-[#068383]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Código Apps Script (Code.gs)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'status' && (
            <>
              {/* Status Banner */}
              {isBlocked ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Google bloqueó la solicitud (Error 403: Permiso Denegado)</span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    Tu Google Apps Script está configurado con acceso privado (&quot;Solo yo&quot;).
                    Para que la plataforma lea tus actualizaciones de forma automática, debes
                    cambiar el acceso a <strong>&quot;Cualquier usuario&quot; (Anyone)</strong>.
                  </p>
                  <button
                    onClick={() => setActiveTab('fix')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 underline hover:no-underline pt-1 cursor-pointer"
                  >
                    Ver los 3 pasos para habilitar el acceso público &rarr;
                  </button>
                </div>
              ) : isSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-sm">
                      Sincronizado con Google Sheets en tiempo real
                    </div>
                    <div className="text-xs text-emerald-800 dark:text-emerald-300">
                      {syncState.itemCount} módulos cargados dinámicamente. Última comprobación:{' '}
                      {syncState.lastSynced || 'Reciente'}.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-sm">Base de datos de Crédito Bros activa</div>
                    <div className="text-xs text-blue-800 dark:text-blue-300">
                      {syncState.message}
                    </div>
                  </div>
                </div>
              )}

              {/* Automatic Sync Controls */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <span>Sincronización Automática</span>
                      {autoSyncEnabled && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          ACTIVO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Detecta cambios en tu Google Sheet automáticamente sin recargar la página.
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={(e) => onToggleAutoSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#068383]"></div>
                  </label>
                </div>

                {autoSyncEnabled && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-slate-700 text-xs">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      Frecuencia de sondeo:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[15, 30, 60].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => onChangeSyncInterval(sec)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            syncIntervalSeconds === sec
                              ? 'bg-[#068383] text-white shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          Cada {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pt-1">
                  <Zap className="w-3.5 h-3.5 text-[#068383]" />
                  <span>
                    También se sincroniza al instante cuando regresas a esta pestaña del navegador.
                  </span>
                </div>
              </div>

              {/* URL Configuration Form */}
              <form onSubmit={handleSaveUrl} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" />
                    URL del Web App (Google Apps Script)
                  </label>
                  {saveStatus && (
                    <span className="text-xs font-semibold text-[#068383] animate-pulse">
                      {saveStatus}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#068383]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#068383] hover:bg-[#046565] text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0 cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar URL actual</span>
                </button>

                <button
                  type="button"
                  onClick={() => onManualSync(true)}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'fix' && (
            <div className="space-y-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ¿Por qué no se reflejan los cambios que hiciste en Google Sheets?
                </div>
                <p>
                  Google Apps Script protege los Web Apps por defecto. Cuando creas o actualizas una
                  implementación, Google exige permisos de inicio de sesión salvo que configures
                  explícitamente <strong>&quot;Quién tiene acceso: Cualquier usuario&quot;</strong>.
                </p>
              </div>

              <h4 className="font-bold text-gray-900 dark:text-white text-sm pt-2">
                Sigue estos 3 pasos rápidos en tu Google Sheets:
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#068383] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      Abre el editor de Google Apps Script
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                      En tu Google Sheet, ve al menú superior <strong>Extensiones</strong> &gt;{' '}
                      <strong>Apps Script</strong>.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#068383] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      Crear o Editar Implementación
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                      Haz clic en el botón azul superior <strong>Implementar (Deploy)</strong> &gt;{' '}
                      <strong>Administrar implementaciones</strong> (o Nueva implementación).
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#068383]/10 dark:bg-[#068383]/20 border border-[#068383]/30 flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#068383] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-[#068383] dark:text-teal-300">
                      Configurar &quot;Quién tiene acceso&quot; (CRÍTICO)
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mt-1">
                      En la opción <strong>Quién tiene acceso (Who has access)</strong>, selecciona:{' '}
                      <span className="font-bold underline text-gray-900 dark:text-white">
                        Cualquier usuario (Anyone)
                      </span>
                      .
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 mt-1 text-[11px]">
                      *Si hiciste cambios en el código de tu script, selecciona <strong>Versión: Nueva versión</strong>{' '}
                      antes de hacer clic en Implementar.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    setActiveTab('status');
                    onManualSync(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#068383] hover:bg-[#046565] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ya configuré el acceso: Probar conexión ahora</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-[#068383]" />
                    Script de Lectura JSON para Google Sheets
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Pega este código en tu archivo <code>Code.gs</code> en Google Apps Script:
                  </p>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-gray-950 text-gray-100 text-xs font-mono overflow-x-auto leading-relaxed border border-gray-800 max-h-72">
                {APPS_SCRIPT_TEMPLATE}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-950/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            Crédito Bros • Sincronización Automática en tiempo real
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-bold text-xs hover:bg-gray-300 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
