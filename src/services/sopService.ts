import { FundingModule, SheetsSyncState } from '../types';
import { DEFAULT_FUNDING_MODULES } from '../data/defaultSopData';
import { normalizeSheetsData } from './sheetsParser';

export const DEFAULT_GOOGLE_SHEETS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby9FASHxqDZTvg27R_FhWiYFr_Ddsr7vTo8o8sczOQrOnCb8COK6RuCPQzoEORoKwOIKA/exec';

export async function fetchSopData(
  forceRefresh = false,
  customUrl?: string
): Promise<{
  modules: FundingModule[];
  syncState: SheetsSyncState;
}> {
  try {
    const params = new URLSearchParams();
    if (forceRefresh) params.append('refresh', 'true');
    if (customUrl) params.append('url', customUrl);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/sop-data${qs}`);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const payload = await res.json();
    const endpointUrl = payload.endpointUrl || customUrl || DEFAULT_GOOGLE_SHEETS_SCRIPT_URL;

    // Check if permission denied was detected
    if (payload.status === 'permission_denied') {
      return {
        modules: DEFAULT_FUNDING_MODULES,
        syncState: {
          status: 'permission_denied',
          lastSynced: payload.lastSynced || new Date().toLocaleTimeString(),
          message:
            payload.message ||
            'Acceso Restringido en Google (Error 403): Configura "Quién tiene acceso" en "Cualquier usuario" en tu Apps Script.',
          endpointUrl,
          source: 'embedded_sop',
          itemCount: DEFAULT_FUNDING_MODULES.length,
          errorDetails: payload.errorDetails,
          httpStatus: payload.httpStatus || 403,
        },
      };
    }

    // Try to normalize received data
    if (payload.data) {
      const normalized = normalizeSheetsData(payload.data);
      if (normalized && normalized.length > 0) {
        return {
          modules: normalized,
          syncState: {
            status: 'synced',
            lastSynced: payload.lastSynced || new Date().toLocaleTimeString(),
            message:
              payload.message || 'Sincronizado en tiempo real con Google Sheets',
            endpointUrl,
            source: 'google_sheets',
            itemCount: normalized.length,
          },
        };
      }
    }

    // Fallback to embedded SOP
    return {
      modules: DEFAULT_FUNDING_MODULES,
      syncState: {
        status: payload.source === 'google_sheets' ? 'synced' : 'fallback',
        lastSynced: payload.lastSynced || new Date().toLocaleTimeString(),
        message:
          payload.message ||
          'Base de datos oficial de Crédito Bros cargada en modo resiliente.',
        endpointUrl,
        source: 'embedded_sop',
        itemCount: DEFAULT_FUNDING_MODULES.length,
        errorDetails: payload.errorDetails,
      },
    };
  } catch (error: any) {
    console.warn('Error fetching Google Sheets data:', error);
    return {
      modules: DEFAULT_FUNDING_MODULES,
      syncState: {
        status: 'error',
        lastSynced: new Date().toLocaleTimeString(),
        message: 'No se pudo conectar al servicio de Google Sheets. Usando base local oficial.',
        endpointUrl: customUrl || DEFAULT_GOOGLE_SHEETS_SCRIPT_URL,
        source: 'embedded_sop',
        itemCount: DEFAULT_FUNDING_MODULES.length,
        errorDetails: error.message,
      },
    };
  }
}

export async function updateSopEndpoint(url: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const res = await fetch('/api/sop-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export function searchSop(
  query: string,
  modules: FundingModule[]
): {
  module: FundingModule;
  stepTitle: string;
  stepId: string;
  snippet: string;
}[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results: {
    module: FundingModule;
    stepTitle: string;
    stepId: string;
    snippet: string;
  }[] = [];

  for (const mod of modules) {
    for (const phase of mod.phases) {
      for (const step of phase.steps) {
        if (
          step.title.toLowerCase().includes(q) ||
          step.summary.toLowerCase().includes(q) ||
          step.contentMarkdown.toLowerCase().includes(q)
        ) {
          const idx = step.contentMarkdown.toLowerCase().indexOf(q);
          const snippet =
            idx >= 0
              ? '...' +
                step.contentMarkdown.substring(
                  Math.max(0, idx - 40),
                  Math.min(step.contentMarkdown.length, idx + 80)
                ) +
                '...'
              : step.summary;

          results.push({
            module: mod,
            stepTitle: step.title,
            stepId: step.id,
            snippet,
          });
        }
      }
    }
  }

  return results.slice(0, 8);
}
