// Knowledge base and fast expert resolver for Crédito Bros Funding SOP
export interface SopQA {
  keywords: string[];
  title: string;
  module: string;
  phase: string;
  response: string;
}

export const FUNDING_KNOWLEDGE_BASE: SopQA[] = [
  {
    keywords: ['requisito', 'score', 'puntaje', 'fico', 'minimo', 'elegibilidad', 'calificar'],
    title: 'Estándares Mínimos de Aprobación Crédito Bros',
    module: 'Módulo 1: Optimización de Perfil & Burós',
    phase: 'Fase 1: Auditoría Tri-Bureau',
    response: `Estándares Mínimos de Aprobación (Benchmark Crédito Bros):

Para que el expediente de un cliente avance con éxito a las aplicaciones comerciales:
1. Score FICO 8 y FICO 9: Mínimo 720 puntos en Experian (óptimo: 750 o más).
2. Utilización Revolvente Total: Inferior al 6% global (técnica AZEO: entre 1% y 3% en una sola tarjeta y cero en las demás).
3. Historial de Pagos: 100% puntual. Cero pagos atrasados en los últimos 24 meses y ninguna cuenta en colección activa.
4. Edad Promedio de Cuentas (AAoA): Mínimo 2 años de promedio general, con la cuenta primaria más antigua superando los 4 años.
5. Reporte Oficial: Extraer exclusivamente a través de IdentityIQ, MyFICO o Experian Premium. Nunca utilizar Credit Karma ya que usa VantageScore.`
  },
  {
    keywords: ['inquiry', 'inquiries', 'consulta', 'dura', 'disputa', 'limpieza', 'borrar', 'quitar'],
    title: 'Protocolo de Hard Inquiries y Límites por Buró',
    module: 'Módulo 1: Optimización de Perfil & Burós',
    phase: 'Fase 1: Paso 1.2 Supresión de Consultas Duras',
    response: `Tolerancia Máxima y Supresión de Consultas Duras:

- Tolerancia por Buró: Máximo 2 a 3 consultas en Experian (idealmente entre 0 y 1), y máximo 2 en Equifax y TransUnion en los últimos 6 meses.
- Regla de Oro FCRA: Nunca disputar consultas vinculadas a cuentas abiertas y activas. Si se tocan, el banco emisor puede cancelar la tarjeta o considerar la acción como fraude.
- Consultas No Vinculadas: Aquellas de solicitudes denegadas o cotizaciones de concesionarios e hipotecas se pueden disputar llamando a Experian al 1-855-414-6048 o mediante cartas bajo la Sección 604 de la FCRA.
- Estrategia de Enfriamiento: Si Experian acumula más de 3 consultas recientes, se deben pausar las aplicaciones a bancos que consultan Experian (como Chase y Amex) y reorientar el flujo hacia entidades que consultan TransUnion o Equifax.`
  },
  {
    keywords: ['au', 'authorized', 'user', 'usuario', 'autorizado', 'limite', 'primaria', 'paridad'],
    title: 'Líneas Primarias vs Cuentas de Usuario Autorizado (AU)',
    module: 'Módulo 1: Optimización de Perfil & Burós',
    phase: 'Fase 2: Paso 1.3 Líneas Primarias vs AU',
    response: `Regla de Paridad de Límites y Cuentas de Usuario Autorizado:

- Diferencia Crítica: Una tarjeta de Usuario Autorizado (AU) eleva el puntaje numérico al reducir la utilización, pero los analistas de riesgo de bancos Tier 1 la descartan al momento de asignar el límite comercial.
- Fórmula de Paridad: Los bancos comerciales aprueban entre 1.5 y 2.5 veces el límite de la tarjeta primaria propia más alta del solicitante.
- Estándar Crédito Bros: El solicitante debe contar con al menos 2 tarjetas primarias con límites de 5,000 USD o más (preferiblemente una superior a 10,000 USD) y 12 meses de antigüedad impecable.
- Solución para Límites Bajos: Tramitar aumentos de límite sin consulta dura (Soft Pull CLI) en American Express, Discover o Apple Card cada 91 a 180 días.`
  },
  {
    keywords: ['corte', 'closing', 'due', 'vencimiento', 'azeo', 'utilizacion', 'fecha'],
    title: 'Técnica AZEO y Fechas de Corte',
    module: 'Módulo 1: Optimización de Perfil & Burós',
    phase: 'Fase 2: Paso 1.4 Reestructuración de Utilización',
    response: `Sincronización de Pagos y Protocolo AZEO (All Zero Except One):

- Fecha de Vencimiento: Es el día límite para pagar y evitar intereses moratorios. No es la fecha que se transmite a los burós de crédito.
- Fecha de Corte: Es el día en que el banco emisor cierra el balance mensual y lo transmite a Experian, Equifax y TransUnion. El saldo a las 11:59 PM de ese día se registra en el reporte por 30 días.
- Regla de Pago: Liquidar el saldo 3 días hábiles antes de la fecha de corte.
- Protocolo AZEO:
  1. Llevar todas las tarjetas a saldo de cero dólares.
  2. Mantener únicamente una tarjeta primaria con un balance de entre 1% y 2% de su límite (entre 25 y 50 USD).
  3. Esto evita la penalización algorítmica de 15 a 20 puntos que FICO aplica cuando todas las tarjetas reportan cero absoluto.`
  },
  {
    keywords: ['lexisnexis', 'chexsystems', 'congelar', 'freeze', 'secundario', 'innovis', 'ews'],
    title: 'Bloqueo Preventivo de Burós Secundarios',
    module: 'Módulo 1: Optimización de Perfil & Burós',
    phase: 'Fase 3: Paso 1.5 Bloqueo Preventivo',
    response: `Congelamiento Preventivo de Burós Secundarios:

Congelar estas bases de datos antes de una ronda comercial previene rechazos automáticos por consultas cruzadas o discrepancias de domicilio:
1. LexisNexis: Base de datos de antecedentes y solicitudes en Estados Unidos. Se tramita el Consumer Security Freeze en su portal oficial.
2. ChexSystems y Early Warning Services: Registran historial de cuentas bancarias y de cheques. Es indispensable mantenerlo limpio para aperturar cuentas operativas en Chase y US Bank.
3. Innovis: Cuarto buró de crédito alternativo utilizado por entidades secundarias.

Nota: El congelamiento es un derecho federal gratuito y no disminuye el puntaje FICO. Guarda siempre los números PIN de seguridad por si se requiere un desbloqueo temporal de 48 horas.`
  },
  {
    keywords: ['5/24', 'chase', 'exposicion', 'regla'],
    title: 'Regla 5/24 de Chase y Límites de Exposición',
    module: 'Módulo 2: Reglas por Banco',
    phase: 'Fase 1: Reglas Chase',
    response: `Regla Chase 5/24 y Directrices de Suscripción:

- Definición: Chase deniega automáticamente solicitudes de tarjetas de crédito si el solicitante ha abierto 5 o más cuentas personales en cualquier banco durante los últimos 24 meses.
- Tarjetas Comerciales de Chase (Ink Business): Requieren estar por debajo de 5/24 para ser aprobadas, pero una vez aprobadas no se contabilizan en el 5/24 personal.
- Límite de Exposición: Chase rara vez extiende crédito total combinado superior al 50% de los ingresos anuales comprobables del solicitante sumando líneas personales y comerciales.`
  },
  {
    keywords: ['amex', '2/90', 'american express', 'charge', 'tarjeta'],
    title: 'Reglas de Suscripción American Express (Amex)',
    module: 'Módulo 2: Reglas por Banco',
    phase: 'Fase 1: Reglas American Express',
    response: `Políticas de American Express para Funding:

- Regla 2/90: American Express únicamente aprueba un máximo de 2 tarjetas de crédito revolventes en un periodo de 90 días naturales.
- Límite de Tarjetas Revolventes: Máximo 5 tarjetas de crédito revolventes por titular. Las tarjetas de cargo como Platinum o Gold no computan para este límite de 5.
- Ventaja de Clientes Existentes: Amex suele realizar consultas suaves sin impacto (Soft Pull) a clientes con historial previo positivo al solicitar nuevas tarjetas comerciales.`
  },
  {
    keywords: ['mensaje', 'cliente', 'redactar', 'whatsapp', 'correo', 'escribir'],
    title: 'Plantilla de Comunicación para Clientes - Método AZEO y Preparación',
    module: 'Herramientas de Comunicación con Clientes',
    phase: 'Atención al Cliente y Estrategia',
    response: `Aquí tienes una propuesta de mensaje lista para enviar a tu cliente:

Hola estimado cliente, un saludo cordial del equipo de Crédito Bros.

Para que tu perfil crediticio califique al 100% en las solicitudes de tarjetas comerciales con 0% de interés que estamos preparando para tu empresa, necesitamos coordinar los siguientes pasos clave esta semana:

1. Liquidación antes de tu Fecha de Corte:
Por favor, asegúrate de pagar tus tarjetas de crédito personales 3 días hábiles antes de su fecha de corte (Statement Date), no de la fecha de vencimiento. Esto garantiza que los burós (Experian, Equifax y TransUnion) registren tu deuda en el nivel óptimo.

2. Técnica AZEO (All Zero Except One):
Deja todas tus tarjetas en saldo de cero dólares, excepto una sola tarjeta primaria propia, en la cual dejaremos un saldo muy bajo (entre 20 y 40 dólares). Esto aumentará tu puntaje FICO entre 15 y 25 puntos de manera inmediata.

3. Congelamiento de nuevas solicitudes:
Por favor, no abras cuentas nuevas ni permitas cotizaciones en concesionarios o tiendas por los próximos 30 días, ya que cualquier consulta no coordinada afectaría la aprobación bancaria.

Cualquier duda que tengas con tus fechas, avísame por aquí para revisarla juntos.`
  },
  {
    keywords: ['script', 'guion', 'llamada', 'reconsideracion', 'analista', 'chase'],
    title: 'Guión de Llamada de Reconsideración Bancaria (Chase Reconsideration)',
    module: 'Módulo 5: Técnicas de Reconsideración',
    phase: 'Fase 1: Negociación Telefónica',
    response: `Guión para Llamar al Analista de Crédito (Chase Reconsideration al 888-270-2127):

Paso 1: Saludo inicial y presentación
"Hola, mi nombre es [Nombre del Asesor o Titular]. Llamo respecto a la solicitud de la tarjeta Chase Ink Business para mi empresa [Nombre de la LLC]. El número de referencia de la aplicación es [Número]. Quería verificar si necesitan alguna documentación adicional de la compañía para concluir la aprobación."

Paso 2: Si mencionan número de cuentas recientes o consultas
"Comprendo su punto. Sin embargo, quiero destacar que mi empresa ha incrementado su facturación en los últimos trimestres y estamos buscando centralizar todos nuestros gastos operativos, suministros y nómina dentro del ecosistema de Chase. Mi historial de pagos en todas mis cuentas es 100% puntual sin ningún atraso."

Paso 3: Proponer reubicación de líneas si es necesario
"Si el banco no puede extender mayor exposición crediticia total en este momento, con mucho gusto puedo trasladar parte del límite de mi otra tarjeta [Nombre de tarjeta] hacia esta nueva Ink Business para cubrir las necesidades operativas sin aumentar el riesgo para Chase."

Paso 4: Cierre profesional
"Agradezco mucho su tiempo y revisión manual. ¿Podría confirmarme el resultado de la reconsideración en este momento?"`
  },
  {
    keywords: ['naics', 'llc', 'actividad', 'riesgo', 'empresa', 'creacion'],
    title: 'Estructuración de LLC y Códigos NAICS de Bajo Riesgo',
    module: 'Módulo 3: Estructuración Legal & Creación de LLC',
    phase: 'Fase 1: Selección de Actividad',
    response: `Lineamientos de Estructuración Legal y Códigos NAICS:

- Regla Fundamental: Los bancos utilizan sistemas automatizados que rechazan o restringen préstamos a empresas con actividades consideradas de alto riesgo (bienes raíces directos, préstamos, transporte de carga pesada, criptomonedas, entretenimiento nocturno o ventas de autos usados).
- Códigos NAICS Recomendados: Consultoría de Negocios y Gestión Administrativa (541611), Servicios de Marketing Digital y Publicidad (541810), Comercio Electrónico Minorista (454110), o Soporte Técnico y Servicios Informáticos (541512).
- Requisitos de Presencia Corporativa:
  1. Dirección comercial física real (nunca PO Box o buzones virtuales detectables tipo UPS Store).
  2. Número telefónico comercial listado en el directorio 411 nacional.
  3. Correo electrónico corporativo con dominio propio (evitar correos gratuitos de Gmail o Yahoo).
  4. Cuenta bancaria operativa (Business Checking) aperturada con el EIN oficial.`
  }
];

export function resolveSopQuery(userQuery: string): string | null {
  const q = userQuery.toLowerCase().trim();
  if (q.length < 3) return null;

  // 1. Dynamic intent detection: Drafting message for a client
  const isDraftingForClient =
    (q.includes('cliente') || q.includes('redacta') || q.includes('escribe') || q.includes('mensaje') || q.includes('correo') || q.includes('whatsapp')) &&
    (q.includes('mensaje') || q.includes('escribe') || q.includes('redacta') || q.includes('carta'));

  if (isDraftingForClient) {
    const nameMatch = userQuery.match(/(?:cliente|para|con)\s+([A-ZÁÉÍÓÚ][a-záéíóú]+)/i);
    const clientName = nameMatch ? nameMatch[1] : 'estimado cliente';

    const mentions90Days = q.includes('90') || q.includes('esperar') || q.includes('tiempo') || q.includes('enfriamiento');
    const mentionsAzeo = q.includes('azeo') || q.includes('corte') || q.includes('pago') || q.includes('utilizacion');

    if (mentions90Days && mentionsAzeo) {
      return `Aquí tienes el mensaje personalizado listo para copiar y enviar a ${clientName}:

Hola ${clientName}, un saludo cordial de parte del equipo de Crédito Bros.

Te escribo para compartirte el plan estratégico para tu siguiente fase de fondeo comercial al 0% de interés y asegurar que el banco nos apruebe los montos más altos:

1. Período de Enfriamiento Estratégico (90 días):
Para proteger tu perfil y no levantar alertas algorítmicas en los departamentos de riesgo, los bancos de primer nivel (como Chase y American Express) exigen una ventana de al menos 90 días entre rondas de solicitudes. Esto permite que las consultas recientes se asienten y el sistema no te califique como un perfil con necesidad urgente de liquidez.

2. Optimización con la Técnica AZEO (All Zero Except One):
Durante estas semanas, aplicaremos la técnica AZEO en tus tarjetas personales:
- Paga todas tus tarjetas de crédito hasta dejarlas en balance de 0 dólares, excepto una sola tarjeta primaria propia.
- En esa tarjeta seleccionada, mantén un saldo mínimo de entre 20 y 40 dólares (menos del 3% de su límite).
- Muy importante: Realiza el pago 3 días hábiles antes de tu fecha de corte (Statement Closing Date), no en la fecha de vencimiento, para que los burós (Experian, Equifax y TransUnion) registren tu récord en el nivel óptimo.

3. Congelamiento de Nuevas Consultas:
Por favor evita autorizar cotizaciones en tiendas departamentales, concesionarios o abrir nuevas cuentas mientras preparamos tu expediente.

Cualquier pregunta que tengas sobre las fechas de tus tarjetas, avísame por aquí para revisarlas juntos.`;
    }

    if (mentionsAzeo) {
      return `Aquí tienes la propuesta de mensaje lista para enviar a ${clientName}:

Hola ${clientName}, un saludo cordial del equipo de Crédito Bros.

Para que tu perfil crediticio alcance el puntaje óptimo antes de presentar tus solicitudes de tarjetas comerciales con 0% de interés, te comparto las instrucciones exactas para el pago de tus tarjetas este mes:

1. Diferencia entre Fecha de Corte y de Vencimiento:
Los burós de crédito (Experian, Equifax y TransUnion) registran el balance que tienes en tu tarjeta el día de la fecha de corte (Statement Date), no el día del vencimiento. Por lo tanto, debemos liquidar tu saldo 3 días hábiles antes del corte para que los burós reciban el balance óptimo.

2. Método AZEO (All Zero Except One):
- Lleva todas tus tarjetas a un balance de 0 dólares.
- Deja únicamente una tarjeta primaria propia con un saldo simbólico de entre 25 y 50 dólares (entre 1% y 2% de tu límite).
- Esto evita la penalización que aplica el algoritmo FICO cuando todas las tarjetas reportan cero absoluto y maximiza tu puntuación entre 15 y 25 puntos.

3. Protección del Perfil:
No solicites nuevos créditos personales en este lapso. Mantendremos este esquema hasta lanzar la ronda de aplicaciones comerciales de tu LLC.

Quedo a tu disposición si necesitas verificar la fecha de corte exacta de alguna tarjeta.`;
    }
  }

  // 2. Standard Knowledge Base Keyword Matching
  let bestMatch: SopQA | null = null;
  let maxScore = 0;

  for (const item of FUNDING_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (q.includes(kw)) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore >= 2) {
    return bestMatch.response;
  }

  return null;
}
