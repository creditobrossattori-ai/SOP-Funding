import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { resolveSopQuery } from './src/data/knowledgeBase';
import { cleanChatPunctuation } from './src/utils/cleanText';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health checks for control-plane and ingress monitoring
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

let currentGoogleScriptUrl =
  process.env.GOOGLE_SHEETS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycby9FASHxqDZTvg27R_FhWiYFr_Ddsr7vTo8o8sczOQrOnCb8COK6RuCPQzoEORoKwOIKA/exec';

// Cache for Google Sheets data to enable rapid async polling without latency
let cachedSheetsData: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15 * 1000; // 15 seconds cache for fast live updates

// System prompt for Gemini-powered Crédito Bros Funding Assistant with Search Grounding
const SYSTEM_PROMPT = `Eres el Asistente Experto en Funding de Crédito Bros, un copiloto de IA completo, resolutivo y proactivo estilo Gemini, especializado en fondeo comercial, crédito corporativo y tarjetas de negocio al 0% APR.

Tu misión es asistir al asesor de crédito en TODAS sus tareas operativas y estratégicas:

1. REDACCIÓN Y COMUNICACIÓN CON CLIENTES:
- Cuando el asesor te pida redactar un mensaje, WhatsApp, correo o SMS para un cliente, genera un texto empático, claro, convincente y 100% listo para copiar y enviar.
- Adapta el tono a la situación: educar al cliente sobre por qué esperar para una aplicación (enfriamiento), pedirle reportes tri-bureau oficiales (IdentityIQ o MyFICO), explicarle cómo pagar su tarjeta antes de la fecha de corte (método AZEO), o celebrar una aprobación.

2. GUIONES Y NEGOCIACIÓN (SCRIPTS):
- Redacta guiones paso a paso para llamadas con analistas de crédito y departamentos de reconsideración (Chase 888-270-2127, Amex 877-399-3083, Bank of America, etc.).
- Proporciona argumentos técnicos sólidos para justificar nuevas solicitudes, mover líneas de crédito existentes o solicitar revisión manual sin generar nuevas consultas duras.

3. BÚSQUEDA Y ACTUALIDAD EN INTERNET:
- Dispones de la herramienta de búsqueda en Google. Cuando te pregunten sobre datos externos, ofertas de bienvenida vigentes de tarjetas comerciales (como Chase Ink, Amex Business Gold/Platinum, Capital One Spark), políticas recientes de bancos, tasas de interés o noticias económicas, investiga en la web e incorpora los datos más actualizados con precisión.

4. ANÁLISIS DE PERFILES Y ESTRATEGIA DE RONDAS:
- Si el asesor te comparte los datos de un cliente (scores FICO, utilización, antigüedad, consultas en burós), diagnostica fortalezas y debilidades según el Estándar Crédito Bros y traza el plan de acción (ronda en 24 horas, cartas FCRA, enfriamiento).

5. BASE DE CONOCIMIENTO CRÉDITO BROS (FUENTE DE VERDAD PRIMARIA):
- Siempre respeta y prioriza los fundamentos técnicos del SOP de Crédito Bros:
  • Módulo 1: Auditoría Tri-Bureau, eliminación de consultas duras bajo FCRA 604 (nunca tocar cuentas abiertas), líneas primarias de $5,000+ vs AU, técnica AZEO pagando 3 días antes del corte, congelamiento de LexisNexis, ChexSystems e Innovis.
  • Módulo 2: Reglas bancarias (Chase 5/24 y 2/30, Amex 2/90 y máximo 5 tarjetas revolventes, BofA 2/3/4, US Bank).
  • Módulo 3: Creación de LLC con códigos NAICS de bajo riesgo, dirección física comercial, teléfono 411 y registro oficial.
  • Módulo 4: Estrategia de rondas secuenciales en 24 horas para evitar que las consultas duras se crucen entre burós.
  • Módulo 5: Técnicas de reconsideración telefónica con suscriptores humanos.
  • Módulo 6: Liquidación y conversión de tarjetas de 0% APR a liquidez bancaria mediante pasarelas B2B (Plastiq, Melio, nómina y facturas de proveedores).

DIRECTRICES OBLIGATORIAS DE FORMATO Y ESTILO:
- ESTÁ ESTRICTAMENTE PROHIBIDO usar numerales (#, ##, ###) para títulos o subtítulos. Escribe los títulos en una línea limpia sin ningún numeral.
- ESTÁ ESTRICTAMENTE PROHIBIDO usar asteriscos (* o **) alrededor de palabras. No uses negritas ni cursivas con asteriscos. Escribe las palabras y números directamente en texto plano, limpio y legible.
- Para listas de puntos o viñetas, utiliza guiones simples (-) o viñetas limpias (•) o números ordenados (1., 2.). Nunca uses asteriscos (*) como viñetas.
- Tu respuesta debe verse como un mensaje impecable redactado por un consultor de alto nivel, con párrafos bien estructurados y sin código o sintaxis artificial.`;

// Endpoint to view or change the Google Sheets endpoint configuration
app.get('/api/sop-config', (_req, res) => {
  res.json({
    url: currentGoogleScriptUrl,
    cacheTtlSeconds: CACHE_TTL_MS / 1000,
  });
});

app.post('/api/sop-config', (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ success: false, message: 'URL de Apps Script inválida' });
  }

  currentGoogleScriptUrl = url.trim();
  cachedSheetsData = null; // Clear cache immediately
  lastCacheTime = 0;

  res.json({
    success: true,
    message: 'URL de Google Sheets actualizada correctamente',
    url: currentGoogleScriptUrl,
  });
});

// Endpoint to fetch live Google Sheets data with live permission inspection & caching
app.get('/api/sop-data', async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const customUrl = typeof req.query.url === 'string' && req.query.url.startsWith('http')
    ? req.query.url.trim()
    : null;
  const targetUrl = customUrl || currentGoogleScriptUrl;

  const now = Date.now();

  // Return cache only if not forcing refresh and using the standard URL
  if (!forceRefresh && !customUrl && cachedSheetsData && now - lastCacheTime < CACHE_TTL_MS) {
    return res.json({
      success: true,
      data: cachedSheetsData.data,
      source: cachedSheetsData.source,
      status: cachedSheetsData.status || 'synced',
      lastSynced: cachedSheetsData.lastSynced,
      message: cachedSheetsData.message,
      endpointUrl: targetUrl,
      errorDetails: cachedSheetsData.errorDetails,
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Check if the URL is a direct Google Sheets document URL
    const isDirectSheetUrl = targetUrl.includes('docs.google.com/spreadsheets/d/');
    let fetchUrl = targetUrl;

    if (isDirectSheetUrl) {
      const match = targetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      const sheetId = match ? match[1] : null;
      if (sheetId) {
        // Use Google Visualization JSON export API
        fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      }
    }

    const sheetResponse = await fetch(fetchUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
    });
    clearTimeout(timeoutId);

    const httpStatus = sheetResponse.status;
    const text = await sheetResponse.text();

    // Check for HTTP 401/403 or Google Access Permission block
    const isPermissionBlocked =
      httpStatus === 401 ||
      httpStatus === 403 ||
      text.includes('You need access') ||
      text.includes('You need permission') ||
      text.includes('accounts.google.com') ||
      text.includes('ServiceLogin');

    if (isPermissionBlocked) {
      const permissionPayload = {
        success: true,
        data: null,
        source: 'embedded_sop',
        status: 'permission_denied',
        httpStatus,
        lastSynced: new Date().toISOString(),
        endpointUrl: targetUrl,
        message:
          'Permiso denegado por Google: La hoja o script está en otra cuenta y no tiene acceso público configurado.',
        errorDetails:
          'Como el Google Sheet está en otra cuenta de correo: En esa otra cuenta, abre la hoja de cálculo, haz clic en "Compartir" y selecciona "Cualquier persona con el enlace: Lector". En Apps Script, asegúrate de que "Ejecutar como" sea la cuenta dueña y "Quién tiene acceso" sea "Cualquier usuario".',
      };
      if (!customUrl) {
        cachedSheetsData = permissionPayload;
        lastCacheTime = now;
      }
      return res.json(permissionPayload);
    }

    // Check if it's a gviz/tq response
    let parsedData: any = null;
    if (text.includes('google.visualization.Query.setResponse(')) {
      try {
        const start = text.indexOf('(');
        const end = text.lastIndexOf(')');
        if (start !== -1 && end !== -1) {
          const jsonStr = text.slice(start + 1, end);
          parsedData = JSON.parse(jsonStr);
        }
      } catch (e) {
        console.warn('Error parsing gviz/tq JSON:', e);
      }
    }

    // Attempt standard JSON parse
    if (!parsedData) {
      try {
        parsedData = JSON.parse(text);
      } catch {
        // Returned non-JSON text/html
      }
    }

    if (parsedData) {
      const successPayload = {
        success: true,
        data: parsedData,
        source: 'google_sheets',
        status: 'synced',
        lastSynced: new Date().toISOString(),
        message: 'Sincronizado en tiempo real con Google Sheets',
        endpointUrl: targetUrl,
      };
      if (!customUrl) {
        cachedSheetsData = successPayload;
        lastCacheTime = now;
      }
      return res.json(successPayload);
    }

    // Non-JSON response received
    const nonJsonPayload = {
      success: true,
      data: null,
      source: 'embedded_sop',
      status: 'error',
      lastSynced: new Date().toISOString(),
      endpointUrl: targetUrl,
      message: 'La URL no devolvió un formato JSON válido.',
      errorDetails: `Respuesta recibida: ${text.slice(0, 180)}...`,
    };
    if (!customUrl) {
      cachedSheetsData = nonJsonPayload;
      lastCacheTime = now;
    }
    return res.json(nonJsonPayload);
  } catch (err: any) {
    console.warn('Error fetching Google Sheets, falling back to embedded SOP:', err.message);
    const fallbackPayload = {
      success: true,
      data: null,
      source: 'embedded_sop',
      status: 'error',
      lastSynced: new Date().toISOString(),
      endpointUrl: targetUrl,
      message: 'No se pudo contactar a Google Sheets. SOP oficial de Crédito Bros activo.',
      errorDetails: err.message,
    };
    return res.json(fallbackPayload);
  }
});

// Endpoint for AI Funding Assistant with Gemini and Google Search Grounding
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentContext, searchWeb = true } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Mensajes inválidos o vacíos' });
    }

    const lastUserMessage = messages[messages.length - 1].content;

    // Check high-precision local SOP Knowledge Base first for authoritative reference
    const localAnswer = resolveSopQuery(lastUserMessage);

    // If Gemini client is active, attempt generative response with knowledge context & search
    let replyText = '';
    const webSources: Array<{ title: string; url: string }> = [];
    const currentApiKey = process.env.GEMINI_API_KEY;

    if (currentApiKey) {
      try {
        const client = new GoogleGenAI({
          apiKey: currentApiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        // Use official recommended models from gemini-api skill
        // gemini-3.1-flash-lite and gemini-3.8-flash are modern fast models
        const modelsToTry = [
          'gemini-3.1-flash-lite',
          'gemini-3.8-flash',
          'gemini-2.5-flash',
          'gemini-flash-latest'
        ];

        const contextPrompt = `
[BASE DE CONOCIMIENTO VIGENTE CRÉDITO BROS FUNDING SOP]
${
  currentContext
    ? typeof currentContext === 'string'
      ? currentContext
      : JSON.stringify(currentContext, null, 2)
    : 'Base de datos estándar con Módulo 1 (Auditoría Tri-Bureau, Eliminación de Inquiries FCRA, Líneas Primarias $5,000+ vs AU, Método AZEO, Congelamiento LexisNexis/ChexSystems/Innovis), Módulo 2 (Chase 5/24, Amex 2/90), Módulo 3 (LLC & NAICS de bajo riesgo), Módulo 4 (Rondas en 24h), Módulo 5 (Reconsideración) y Módulo 6 (Liquidación 0% APR).'
}

${localAnswer ? `[REFERENCIA OFICIAL DEL MANUAL CRÉDITO BROS]:
${localAnswer}
` : ''}

[HISTORIAL DE CONVERSACIÓN RECIENTE]
${messages
  .slice(-6)
  .map((m: any) => (m.role === 'user' ? 'Asesor: ' : 'Asistente: ') + m.content)
  .join('\n\n')}

[PETICIÓN O CONSULTA DEL ASESOR DE FUNDING]
${lastUserMessage}
`;

        for (const modelName of modelsToTry) {
          try {
            // First attempt with Google Search Grounding if enabled
            const configWithTools: any = {
              systemInstruction: SYSTEM_PROMPT,
              temperature: 0.3,
            };

            if (searchWeb) {
              configWithTools.tools = [{ googleSearch: {} }];
            }

            const response = await client.models.generateContent({
              model: modelName,
              contents: contextPrompt,
              config: configWithTools,
            });

            if (response && response.text) {
              replyText = response.text;

              // Extract web grounding chunks if Google Search was performed
              const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
              if (chunks && Array.isArray(chunks)) {
                for (const chunk of chunks) {
                  if (chunk.web?.uri) {
                    webSources.push({
                      title: chunk.web.title || 'Enlace de referencia',
                      url: chunk.web.uri,
                    });
                  }
                }
              }
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Attempt with ${modelName} and tools encountered:`, modelErr?.message || modelErr);
            // Fallback retry without tools on the same model if tool config had an issue
            try {
              const fallbackResponse = await client.models.generateContent({
                model: modelName,
                contents: contextPrompt,
                config: {
                  systemInstruction: SYSTEM_PROMPT,
                  temperature: 0.3,
                },
              });

              if (fallbackResponse && fallbackResponse.text) {
                replyText = fallbackResponse.text;
                break;
              }
            } catch (fallbackErr: any) {
              console.warn(`Fallback attempt with ${modelName} without tools encountered:`, fallbackErr?.message || fallbackErr);
            }
          }
        }
      } catch (genErr: any) {
        console.warn('GenAI initialization issue:', genErr);
      }
    }

    // If Gemini models were unavailable or API key not present, use the structured SOP answer
    if (!replyText) {
      if (localAnswer) {
        replyText = localAnswer;
      } else {
        replyText = `Respuesta Operativa Crédito Bros SOP:

` +
          `Para la consulta planteada, los lineamientos oficiales de Crédito Bros establecen:

` +
          `- Parámetros de Burós y Puntuación: Revisa la Fase 1 del Módulo 1 (Score FICO 8 y 9 mínimo 720+, utilización menor al 6% global, cero pagos tardíos en 24 meses).
` +
          `- Estructuración de Líneas y Fechas: Consulta la Fase 2 del Módulo 1 (Líneas primarias mínimas de 5,000 USD, método AZEO y pago 3 días antes de la fecha de corte).
` +
          `- Protección de Burós: Consulta la Fase 3 del Módulo 1 para el congelamiento preventivo de LexisNexis, ChexSystems e Innovis.
` +
          `- Si el caso de tu cliente presenta discrepancias o requiere excepción con el suscriptor, consúltalo directamente con el supervisor de Funding.`;
      }
    }

    // Sanitize punctuation: eliminate all raw asterisks, numeral hashtags, stray markdown symbols
    const cleanedReply = cleanChatPunctuation(replyText);

    return res.json({
      success: true,
      reply: cleanedReply,
      webSources: webSources.length > 0 ? webSources : undefined,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Error procesando la consulta con el Asistente de Funding: ' + (error.message || 'Error desconocido'),
    });
  }
});

async function startServer() {
  try {
    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Crédito Bros Funding LMS running on port ${PORT}`);
    });

    const gracefulShutdown = () => {
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error('Unhandled rejection in startServer:', err);
  process.exit(1);
});
