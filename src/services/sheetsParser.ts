import {
  FundingModule,
  ModulePhase,
  ModuleStep,
  StepInteractiveChecklist,
  ExternalResource,
} from '../types';
import { DEFAULT_FUNDING_MODULES } from '../data/defaultSopData';

/**
 * Normalizes data received from Google Sheets / Apps Script into valid FundingModule[]
 * Supports:
 * 1. Native FundingModule[] array
 * 2. Object with { modules: FundingModule[] } or { data: FundingModule[] }
 * 3. Flat spreadsheet rows with columns like (Modulo, Fase, Paso, Contenido, etc.)
 */
export function normalizeSheetsData(rawInput: any): FundingModule[] | null {
  if (!rawInput) return null;

  let rawList: any[] | null = null;

  if (Array.isArray(rawInput)) {
    rawList = rawInput;
  } else if (typeof rawInput === 'object') {
    if (Array.isArray(rawInput.data)) {
      rawList = rawInput.data;
    } else if (Array.isArray(rawInput.modules)) {
      rawList = rawInput.modules;
    } else if (Array.isArray(rawInput.result)) {
      rawList = rawInput.result;
    } else if (rawInput.rows) {
      rawList = rawInput.rows;
    } else if (rawInput.table && Array.isArray(rawInput.table.rows)) {
      // Support for direct Google Sheet gviz/tq export
      const cols = rawInput.table.cols || [];
      const rows = rawInput.table.rows || [];
      let headers: string[] = cols.map((col: any) => String(col.label || '').trim());
      const hasLabels = headers.some((h) => h.length > 0);

      const startRow = hasLabels ? 0 : 1;
      if (!hasLabels && rows.length > 0) {
        headers = (rows[0].c || []).map((cell: any) =>
          String(cell?.v || '').trim()
        );
      }

      const flattenedRows: Record<string, any>[] = [];
      for (let i = startRow; i < rows.length; i++) {
        const cList = rows[i]?.c || [];
        if (
          cList.every(
            (cell: any) => !cell || cell.v === '' || cell.v === null
          )
        ) {
          continue;
        }
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          const cellVal = cList[idx]?.v;
          rowObj[h || `col_${idx}`] =
            cellVal !== null && cellVal !== undefined ? cellVal : '';
        });
        flattenedRows.push(rowObj);
      }
      if (flattenedRows.length > 0) {
        rawList = flattenedRows;
      }
    } else {
      // Check if it is a dictionary of sheet tabs: { "Módulo 1": [...], "Módulo 2": [...] }
      const entries = Object.entries(rawInput);
      const isSheetDict =
        entries.length > 0 && entries.some(([_, val]) => Array.isArray(val));

      if (isSheetDict) {
        const flattened: Record<string, any>[] = [];
        for (const [sheetName, sheetRows] of entries) {
          if (Array.isArray(sheetRows)) {
            sheetRows.forEach((rowObj: any) => {
              if (rowObj && typeof rowObj === 'object') {
                flattened.push({
                  modulo_origen: sheetName,
                  modulo: sheetName,
                  ...rowObj,
                });
              }
            });
          }
        }
        if (flattened.length > 0) {
          rawList = flattened;
        }
      }
    }
  }

  if (!rawList || rawList.length === 0) {
    return null;
  }

  // Check if it already has the structured FundingModule schema
  const firstItem = rawList[0];
  if (
    firstItem &&
    typeof firstItem === 'object' &&
    (firstItem.phases || (firstItem.id && firstItem.moduleNumber))
  ) {
    // Valid structured module array
    return rawList.map((mod: any, idx: number) => ({
      id: String(mod.id || `mod-${idx + 1}`),
      slug: String(mod.slug || `modulo-${idx + 1}`),
      moduleNumber: Number(mod.moduleNumber || idx + 1),
      title: String(mod.title || `Módulo ${idx + 1}`),
      subtitle: String(mod.subtitle || ''),
      description: String(mod.description || ''),
      iconName: String(mod.iconName || 'BookOpen'),
      colorTheme: String(mod.colorTheme || '#068383'),
      badge: mod.badge ? String(mod.badge) : undefined,
      estimatedHours: String(mod.estimatedHours || '2 Horas'),
      isLocked: Boolean(mod.isLocked),
      phases: Array.isArray(mod.phases)
        ? mod.phases.map((ph: any, pIdx: number) => ({
            id: String(ph.id || `phase-${idx + 1}-${pIdx + 1}`),
            phaseNumber: Number(ph.phaseNumber || pIdx + 1),
            title: String(ph.title || `Fase ${pIdx + 1}`),
            description: String(ph.description || ''),
            steps: Array.isArray(ph.steps)
              ? ph.steps.map((st: any, sIdx: number) => ({
                  id: String(st.id || `step-${idx + 1}-${pIdx + 1}-${sIdx + 1}`),
                  title: String(st.title || `Paso ${sIdx + 1}`),
                  summary: String(st.summary || ''),
                  order: Number(st.order || sIdx + 1),
                  readingTimeMinutes: Number(st.readingTimeMinutes || 10),
                  contentMarkdown: String(st.contentMarkdown || st.content || ''),
                  callouts: st.callouts || [],
                  resources: st.resources || [],
                  checklist: st.checklist || [],
                  keyRules: st.keyRules || [],
                  bankRules: st.bankRules || [],
                }))
              : [],
          }))
        : [],
    }));
  }

  // Check if items are flat spreadsheet rows
  // Look for keys like "Modulo", "Módulo", "Fase", "Paso", "Contenido", "Resumen", etc.
  const hasFlatKeys = Object.keys(firstItem).some((k) => {
    const lk = k.toLowerCase();
    return (
      lk.includes('modulo') ||
      lk.includes('fase') ||
      lk.includes('paso') ||
      lk.includes('titulo') ||
      lk.includes('contenido')
    );
  });

  if (hasFlatKeys) {
    return transformFlatRowsToModules(rawList);
  }

  return null;
}

/**
 * Transforms flat tabular rows into hierarchical FundingModule[]
 */
function transformFlatRowsToModules(rows: Record<string, any>[]): FundingModule[] {
  const modulesMap = new Map<string, {
    moduleNumber: number;
    title: string;
    subtitle: string;
    description: string;
    iconName: string;
    badge?: string;
    phasesMap: Map<string, {
      phaseNumber: number;
      title: string;
      description: string;
      steps: ModuleStep[];
    }>;
  }>();

  rows.forEach((row, rowIdx) => {
    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        for (const actualKey of Object.keys(row)) {
          if (actualKey.toLowerCase().trim() === k.toLowerCase()) {
            return String(row[actualKey] || '').trim();
          }
        }
      }
      return '';
    };

    const moduleTitle =
      getVal(
        'modulo_origen',
        'modulo',
        'módulo',
        'module',
        'nombre_modulo',
        'modulo_titulo',
        'hoja',
        'pestaña'
      ) || 'Módulo 1: General';

    const phaseTitle =
      getVal(
        'fase_o_seccion',
        'fase',
        'seccion',
        'phase',
        'fase_titulo',
        'nombre_fase'
      ) || 'Fase 1: General';

    const stepTitle =
      getVal(
        'elemento_o_paso',
        'elemento',
        'paso',
        'step',
        'paso_titulo',
        'titulo_paso',
        'titulo',
        'title'
      ) || `Paso ${rowIdx + 1}`;

    const condition = getVal('condicion_o_pregunta', 'condicion', 'pregunta');
    const instructions = getVal(
      'instrucciones_y_acciones',
      'instrucciones',
      'acciones',
      'contenido',
      'content',
      'contentmarkdown',
      'texto',
      'descripcion',
      'detalle'
    );
    const notes = getVal('notas_adicionales', 'notas', 'nota');
    const toolLink = getVal('enlace_herramienta', 'enlace', 'link', 'herramienta');

    const stepSummary =
      (condition && condition !== '-' ? condition : instructions.slice(0, 140)) ||
      getVal('resumen', 'summary', 'descripcion_corta', 'subtitulo');

    // Build rich markdown content from the spreadsheet columns
    const contentParts: string[] = [];
    if (instructions && instructions !== '-') {
      contentParts.push(instructions);
    }
    if (condition && condition !== '-') {
      contentParts.push(`**Condición / Criterio Clave:**\n${condition}`);
    }
    if (notes && notes !== '-') {
      contentParts.push(`**Notas Adicionales y Reglas:**\n${notes}`);
    }
    if (toolLink && toolLink !== '-') {
      const isUrl = toolLink.startsWith('http://') || toolLink.startsWith('https://');
      contentParts.push(
        isUrl
          ? `**Herramienta de Trabajo:** [Abrir enlace oficial](${toolLink})`
          : `**Herramienta / Referencia:** ${toolLink}`
      );
    }

    const stepContent = contentParts.join('\n\n') || instructions || stepSummary;
    const readingTime =
      parseInt(getVal('tiempo', 'duracion', 'minutos', 'readingtime')) || 10;

    let iconName = getVal('icono', 'icon', 'iconname');
    if (!iconName || iconName === 'BookOpen') {
      const lowerMod = moduleTitle.toLowerCase();
      if (lowerMod.includes('perfil') || lowerMod.includes('auditor')) iconName = 'ShieldCheck';
      else if (lowerMod.includes('banco') || lowerMod.includes('regla')) iconName = 'Building2';
      else if (lowerMod.includes('llc') || lowerMod.includes('corporativ')) iconName = 'FileText';
      else if (lowerMod.includes('ronda') || lowerMod.includes('aplicacion')) iconName = 'Zap';
      else if (lowerMod.includes('reconsideracion') || lowerMod.includes('llamada')) iconName = 'PhoneCall';
      else if (lowerMod.includes('liquidez') || lowerMod.includes('fond') || lowerMod.includes('moneda')) iconName = 'Coins';
      else iconName = 'BookOpen';
    }

    if (!modulesMap.has(moduleTitle)) {
      const modNum = modulesMap.size + 1;
      modulesMap.set(moduleTitle, {
        moduleNumber: modNum,
        title: moduleTitle,
        subtitle: getVal('subtitulo_modulo', 'modulo_subtitulo') || '',
        description: getVal('descripcion_modulo') || `Contenido de ${moduleTitle}`,
        iconName,
        phasesMap: new Map(),
      });
    }

    const modObj = modulesMap.get(moduleTitle)!;
    if (!modObj.phasesMap.has(phaseTitle)) {
      const phNum = modObj.phasesMap.size + 1;
      modObj.phasesMap.set(phaseTitle, {
        phaseNumber: phNum,
        title: phaseTitle,
        description: getVal('descripcion_fase') || '',
        steps: [],
      });
    }

    const phaseObj = modObj.phasesMap.get(phaseTitle)!;

    const stepId = `step-${modObj.moduleNumber}-${phaseObj.phaseNumber}-${phaseObj.steps.length + 1}`;

    const checklist: StepInteractiveChecklist[] = [];
    if (instructions && instructions !== '-') {
      checklist.push({
        id: `chk-${stepId}-1`,
        label:
          instructions.length > 90
            ? `${instructions.slice(0, 90)}...`
            : instructions,
        details: instructions,
      });
    }

    const keyRules: string[] = [];
    if (notes && notes !== '-') {
      keyRules.push(notes);
    }
    if (condition && condition !== '-') {
      keyRules.push(`Condición: ${condition}`);
    }

    const resources: ExternalResource[] = [];
    if (
      toolLink &&
      (toolLink.startsWith('http://') || toolLink.startsWith('https://'))
    ) {
      resources.push({
        title: 'Herramienta Oficial',
        url: toolLink,
        type: 'link',
      });
    }

    const stepObj: ModuleStep = {
      id: stepId,
      title: stepTitle,
      summary: stepSummary,
      order: phaseObj.steps.length + 1,
      readingTimeMinutes: readingTime,
      contentMarkdown: stepContent,
      callouts: [],
      resources,
      checklist,
      keyRules,
    };

    phaseObj.steps.push(stepObj);
  });

  if (modulesMap.size === 0) {
    return DEFAULT_FUNDING_MODULES;
  }

  // Convert map to array
  const result: FundingModule[] = [];
  let mIndex = 1;
  for (const [title, modData] of modulesMap.entries()) {
    const phases: ModulePhase[] = [];
    let pIndex = 1;
    for (const [pTitle, pData] of modData.phasesMap.entries()) {
      phases.push({
        id: `phase-${mIndex}-${pIndex}`,
        phaseNumber: pIndex,
        title: pTitle,
        description: pData.description,
        steps: pData.steps,
      });
      pIndex++;
    }

    result.push({
      id: `mod-${mIndex}`,
      slug: `modulo-${mIndex}`,
      moduleNumber: mIndex,
      title: title.startsWith('Módulo') ? title : `Módulo ${mIndex}: ${title}`,
      subtitle: modData.subtitle,
      description: modData.description,
      iconName: modData.iconName,
      colorTheme: '#068383',
      estimatedHours: `${Math.max(1, Math.round(phases.reduce((acc, p) => acc + p.steps.length, 0) * 0.3))} Horas`,
      phases,
    });
    mIndex++;
  }

  return result;
}
