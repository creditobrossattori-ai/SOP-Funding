import { FundingModule } from '../types';

export const DEFAULT_FUNDING_MODULES: FundingModule[] = [
  {
    id: 'mod-1',
    slug: 'optimizacion-perfil-buros',
    moduleNumber: 1,
    title: 'Módulo 1: Optimización de Perfil & Burós',
    subtitle: 'Auditoría integral, supresión de consultas duras y estructuración de crédito personal',
    description: 'Protocolo maestro de Crédito Bros para auditar los tres burós (Experian, Equifax y TransUnion), eliminar inquiries no vinculadas y consolidar líneas primarias superiores a $5,000 USD antes de iniciar rondas comerciales.',
    iconName: 'ShieldCheck',
    colorTheme: '#068383',
    badge: 'Disponible Ahora',
    estimatedHours: '3.5 Horas',
    phases: [
      {
        id: 'phase-1-1',
        phaseNumber: 1,
        title: 'Fase 1: Auditoría Tri-Bureau y Diagnóstico de Riesgo',
        description: 'Revisión exhaustiva de los tres burós crediticios antes de presentar expedientes a entidades bancarias de primer nivel.',
        steps: [
          {
            id: 'step-1-1-1',
            title: '1.1 Extracción y Análisis del Reporte Tri-Bureau',
            summary: 'Procedimiento de extracción sin afectar el puntaje y análisis de métricas FICO Bankcard exigidas por los departamentos de riesgo.',
            order: 1,
            readingTimeMinutes: 12,
            contentMarkdown: `### 🎯 Fundamento de la Auditoría Tri-Bureau

Antes de presentar cualquier solicitud formal ante bancos de primer nivel como Chase, Bank of America o American Express, el equipo de Funding debe auditar minuciosamente el expediente en los tres burós: **Experian**, **Equifax** y **TransUnion**.

Un puntaje numérico alto no garantiza aprobaciones en la banca comercial. Los analistas de crédito evalúan la solidez del perfil: límites previos otorgados, antigüedad de cuentas activas y puntualidad absoluta en pagos.

[ALERTA]
Nunca utilices Credit Karma para evaluar a un cliente de fondeo comercial. Credit Karma utiliza el modelo VantageScore 3.0, el cual los bancos de primer nivel no contemplan para aprobar líneas de crédito. Un cliente con 740 puntos en Credit Karma puede reflejar 685 en su puntaje FICO real.

---

### 📋 Parámetros de Elegibilidad (Estándar Crédito Bros)

Para que el expediente de un cliente califique a la ronda de aplicaciones comerciales, debe cumplir rigurosamente con los siguientes rangos:

* **Score FICO 8 y FICO 9**: Mínimo de 720 puntos en Experian (Rango óptimo para aprobaciones altas: 750+).
* **Utilización Revolvente Total**: Inferior al 6% global. Se recomienda la regla 1-3% en una sola tarjeta y saldo cero ($0) en las demás.
* **Cuentas Derogatorias**: Cero pagos tardíos (30, 60 o 90 días) en los últimos 24 meses y ninguna cuenta en colección activa.
* **Historial de Pagos**: 100% de cumplimiento histórico en el reporte.
* **Edad Promedio de Cuentas (AAoA)**: Promedio mínimo de 2 años, con la cuenta primaria más longeva superando los 4 años.

[TIP]
Revisa con anticipación la fecha de corte (Statement Closing Date) de cada tarjeta. Si el cliente maneja un balance alto, indícale realizar el pago 3 días hábiles antes del corte para que los burós registren balance en cero antes de iniciar la ronda.

---

### 🔍 Plataformas de Monitoreo Autorizadas

El equipo debe extraer expedientes únicamente de servicios con datos oficiales FICO:

1. **IdentityIQ**: Reporte tri-bureau completo con balance desglosado cuenta por cuenta.
2. **MyFICO**: Permite visualizar puntajes FICO 8, FICO 9, FICO Bankcard y FICO Auto en los 3 burós simultáneamente.
3. **Experian Premium**: Reporte directo con alertas inmediatas de consultas duras y nuevas líneas.

[REQUISITO]
Verifica que el reporte extraído de IdentityIQ o MyFICO tenga una fecha de emisión no mayor a 5 días naturales antes de enviar las solicitudes bancarias.`,
            callouts: [
              {
                type: 'warning',
                title: 'Alerta de Riesgo: VantageScore vs FICO Score',
                content: 'La mayoría de clientes confían en el número mostrado por Credit Karma (VantageScore 3.0). Los bancos comerciales de EE.UU. evalúan exclusivamente FICO Bankcard 8 y 9.',
                highlightText: 'Regla inviolable: Auditar únicamente mediante IdentityIQ o MyFICO.'
              },
              {
                type: 'tip',
                title: 'Tip Operativo de Suscripción',
                content: 'Sincroniza siempre los pagos antes del corte del estado de cuenta bancario para que el buró reciba la información con la más baja utilización posible.'
              }
            ],
            checklist: [
              { id: 'c1-1', label: 'Descargar reporte Tri-Bureau oficial (IdentityIQ o MyFICO)', details: 'Comprobar fecha de emisión menor a 5 días y vigencia en los 3 burós' },
              { id: 'c1-2', label: 'Verificar FICO 8 y FICO Bankcard en Experian, Equifax y TransUnion', details: 'Puntaje objetivo de aprobación: 720+ puntos' },
              { id: 'c1-3', label: 'Auditar la utilización en cada tarjeta individual', details: 'Ninguna tarjeta debe reportar más del 6% de su límite asignado' },
              { id: 'c1-4', label: 'Confirmar ausencia de late payments en los últimos 24 meses', details: 'Cero incidencias de morosidad' },
              { id: 'c1-5', label: 'Calcular la edad promedio de cuentas (AAoA)', details: 'Edad promedio mínima: 2 años; cuenta más antigua mayor a 4 años' }
            ],
            resources: [
              {
                title: 'Portal Oficial MyFICO (FICO 8/9)',
                url: 'https://www.myfico.com',
                type: 'link',
                description: 'Acceso a puntajes oficiales FICO utilizados por el 90% de los prestamistas en EE.UU.'
              },
              {
                title: 'Portal IdentityIQ Tri-Bureau',
                url: 'https://www.identityiq.com',
                type: 'tool',
                description: 'Herramienta de extracción y análisis integral de expedientes crediticios.'
              }
            ]
          },
          {
            id: 'step-1-1-2',
            title: '1.2 Supresión y Manejo de Hard Inquiries',
            summary: 'Protocolos para auditar consultas recientes, disputar inquiries no vinculadas y distribuir aplicaciones entre burós.',
            order: 2,
            readingTimeMinutes: 15,
            contentMarkdown: `### 🛡️ Impacto de las Hard Inquiries en el Fondeo Comercial

Las consultas duras (**Hard Inquiries**) indican que el cliente ha solicitado financiamiento formal. Para las áreas de riesgo de los bancos Tier 1, acumular más de 3 consultas en los últimos 6 meses despierta una alerta algorítmica de "búsqueda urgente de crédito" (credit hunger).

[REQUISITO]
Bajo la Sección 604 de la Fair Credit Reporting Act (FCRA), una entidad solo puede consultar el historial si existe una autorización explícita y un propósito permisible. Jamás disputes consultas de cuentas que se encuentren actualmente abiertas y vigentes.

---

### 📊 Umbrales Máximos Permitidos por Buró

Para mantener una tasa de aprobación superior al 90%, el perfil debe ajustarse a estos límites:

* **Experian (EX)**: Máximo 2 a 3 consultas en los últimos 6 meses (idealmente 0 a 1).
* **Equifax (EQ)**: Máximo 2 consultas en los últimos 6 meses.
* **TransUnion (TU)**: Máximo 2 consultas en los últimos 6 meses.

[ALERTA]
Si disputas o eliminas una consulta asociada a una tarjeta comercial recién aprobada o activa, el banco emisor puede interpretar la acción como fraude, congelar la tarjeta y cerrar la cuenta unilateralmente. Solo se disputan consultas huérfanas o denegadas.

---

### ⚡ Estrategia Operativa de Limpieza Telefónica

1. **Identificación de Consultas No Vinculadas**:
   * Descarga el reporte y clasifica las consultas correspondientes a solicitudes denegadas o cotizaciones de concesionarios de autos e hipotecas.
   * Separa las consultas que pertenezcan a tarjetas que el cliente mantiene activas.

2. **Llamada de Disputa al Buró Experian**:
   * Comunicarse con la línea de atención al consumidor de Experian (1-855-414-6048).
   * Explicar al agente que aparecen consultas duras que no resultaron en cuentas abiertas y solicitar su revisión directa.

3. **Cartas FCRA para TransUnion y Equifax**:
   * En caso de consultas no resueltas por teléfono, enviar cartas de disputa por correo certificado citando la Sección 604 de la FCRA.

[TIP]
Si el cliente ya cuenta con 4 o más consultas en Experian, no presentes solicitudes ante Chase ni American Express en esta ronda. Reorienta las aplicaciones hacia entidades que consulten TransUnion (como Barclays o US Bank en determinados estados).`,
            callouts: [
              {
                type: 'requirement',
                title: 'Normativa FCRA (Sección 604)',
                content: 'Toda consulta sin propósito legal documentado puede removerse del buró. Sin embargo, nunca toques consultas de cuentas que permanezcan abiertas.',
                highlightText: 'Disputar únicamente consultas no vinculadas a líneas activas.'
              },
              {
                type: 'tip',
                title: 'Estrategia de Enfriamiento',
                content: 'Planifica la ronda alternando bancos que jalen burós distintos para no concentrar más de 2 consultas en el mismo buró durante 72 horas.'
              }
            ],
            checklist: [
              { id: 'c1-6', label: 'Separar y registrar consultas por cada buró individual', details: 'Contabilizar consultas de los últimos 6 y 12 meses en EX, EQ y TU' },
              { id: 'c1-7', label: 'Verificar cuáles consultas corresponden a cuentas vigentes', details: 'Marcar como no modificables para proteger las líneas activas' },
              { id: 'c1-8', label: 'Preparar proceso de supresión para consultas no vinculadas', details: 'Llamada al buró o envío de carta formal amparada en FCRA' },
              { id: 'c1-9', label: 'Ajustar la lista de bancos si Experian supera el umbral crítico', details: 'Si EX tiene > 3 consultas, migrar solicitudes a bancos que jalen TransUnion' }
            ],
            resources: [
              {
                title: 'Portal de Soporte y Disputas de Experian',
                url: 'https://www.experian.com/disputes/main.html',
                type: 'link',
                description: 'Canal oficial para verificar y reportar consultas no autorizadas.'
              }
            ]
          }
        ]
      },
      {
        id: 'phase-1-2',
        phaseNumber: 2,
        title: 'Fase 2: Envejecimiento & Estructuración de Líneas Primarias',
        description: 'Construcción de tradelines primarios con límites de $5k a $25k y gestión responsable de usuarios autorizados.',
        steps: [
          {
            id: 'step-1-2-1',
            title: '1.3 Líneas Primarias vs Cuentas de Usuario Autorizado (AU)',
            summary: 'Cómo los analistas bancarios diferencian líneas propias de tradelines agregados y la fórmula matemática para proyectar límites comerciales.',
            order: 3,
            readingTimeMinutes: 11,
            contentMarkdown: `### 💳 La Realidad de las Cuentas Authorized User (AU)

Uno de los mitos más frecuentes en financiamiento es considerar que agregando una tarjeta de Usuario Autorizado (AU) de $30,000 con 10 años de antigüedad se logran aprobaciones de 6 cifras automáticamente.

Los algoritmos iniciales de puntaje reconocen la tarjeta AU y pueden incrementar numéricamente el FICO score al reducir el ratio de utilización global. Sin embargo, los analistas de riesgo de Chase, Bank of America y Citibank filtran minuciosamente estos tradelines en la suscripción manual.

[NOTA]
Un tradeline de Usuario Autorizado ayuda a pulir el puntaje numérico, pero no reemplaza el historial primario. El banco prestará capital proporcional a lo que el solicitante haya administrado bajo su propia responsabilidad legal.

---

### 🧠 Criterio de Evaluación del Analista de Riesgo (Underwriter)

* **Tradeline AU**: Se considera una referencia de respaldo, pero no cuenta como historial crediticio propio.
* **Línea Primaria**: Es la tarjeta o crédito donde el cliente es el titular legal directo.
* **Regla de Paridad de Límites**: Los bancos comerciales aprueban un límite inicial equivalente a **1.5x hasta 2.5x el límite de la tarjeta primaria más alta** que el cliente ya posee.

---

### 🏆 Estándar Crédito Bros para Aprobaciones de $25,000+

Para aspirar a tarjetas de crédito de negocios con límites de 5 cifras, el perfil personal debe contar con:

1. Al menos **2 tarjetas primarias con límites iguales o superiores a $5,000 USD** (preferiblemente una superior a $10,000).
2. Un mínimo de **12 meses de antigüedad y manejo ejemplar** en esas cuentas primarias.
3. Si el cliente solo posee tarjetas pequeñas ($1,000 a $2,500), se debe ejecutar una etapa previa de solicitudes de incremento de límite sin consulta dura (*Soft Pull CLI*).

[TIP]
Instituciones como American Express, Discover, Apple Card (Goldman Sachs) y Navy Federal permiten solicitar aumentos de límite de crédito (CLI) mediante consultas suaves (Soft Pull) directamente desde sus aplicaciones móviles sin perjudicar el score.`,
            callouts: [
              {
                type: 'info',
                title: 'Fórmula de Proyección de Límite Comercial',
                content: 'Límite Estimado Comercial ≈ (Límite Primario Propio Más Alto) x (1.5 a 2.5) sujeto a ingresos comerciales y relación bancaria previa.',
                highlightText: 'El límite comercial aprobado es un reflejo de tu límite personal más elevado.'
              },
              {
                type: 'tip',
                title: 'Estrategia de Incrementos Soft Pull',
                content: 'Solicita incrementos de línea cada 91 a 180 días en tarjetas que no generen consulta dura para duplicar la capacidad crediticia antes de la ronda.'
              }
            ],
            checklist: [
              { id: 'c1-10', label: 'Determinar el límite de la tarjeta primaria más alta en el reporte personal', details: 'Debe alcanzar al menos $5,000 USD para calificar a fondeo alto' },
              { id: 'c1-11', label: 'Separar en la auditoría las tarjetas de usuario autorizado (AU)', details: 'Calcular el límite real primario excluyendo cuentas de terceros' },
              { id: 'c1-12', label: 'Tramitar aumentos de límite vía Soft Pull si el límite es menor a $3,000', details: 'Utilizar apps de Amex, Discover o Apple Card' }
            ]
          },
          {
            id: 'step-1-2-2',
            title: '1.4 Reestructuración de Utilización y Fechas de Corte',
            summary: 'Técnica AZEO para optimizar el puntaje FICO y sincronización de pagos con la fecha exacta de corte del estado de cuenta.',
            order: 4,
            readingTimeMinutes: 10,
            contentMarkdown: `### ⏱️ Fecha de Vencimiento vs Fecha de Corte

Uno de los errores más costosos al estructurar el perfil es confundir la **Fecha de Vencimiento (Payment Due Date)** con la **Fecha de Corte (Statement Closing Date)**.

[ALERTA]
Pagar el saldo el día de vencimiento evita intereses por mora, pero no previene que el banco reporte un saldo elevado si el uso fue alto durante el ciclo. El buró de crédito registra únicamente el saldo presente el día del corte mensual.

---

### 📌 Diferenciación Fundamental:

1. **Payment Due Date (Fecha de Vencimiento)**:
   * Día límite para abonar el balance anterior y evitar penalidades o intereses moratorios.
   * Esta fecha no se envía de inmediato a los 3 burós de crédito.

2. **Statement Closing Date (Fecha de Corte)**:
   * Día en que el banco emisor realiza el corte contable mensual y transmite el saldo exacto a Experian, TransUnion y Equifax.
   * El balance que figure a las 11:59 PM de esa jornada es el que permanecerá en el reporte crediticio durante los próximos 30 días.

---

### 🎯 El Protocolo AZEO (All Zero Except One)

Para incrementar el puntaje FICO entre 15 y 30 puntos en un solo ciclo de facturación:

* **Todas las tarjetas de crédito deben reportar balance de $0.00**.
* **Únicamente una tarjeta primaria debe reportar entre el 1% y el 2% de su límite de crédito** (por ejemplo, un balance de $30 a $50 en una tarjeta de $3,000 de límite).
* Si reportas saldo $0 en absolutamente todas las tarjetas, el algoritmo FICO deduce entre 12 y 18 puntos por supuesta "inactividad crediticia". La regla AZEO previene esta penalización algorítmica.

[TIP]
Los pagos deben enviarse 3 días hábiles antes de la fecha de corte. Si la fecha de corte cae en fin de semana o día festivo, algunos bancos adelantan el reporte al último día hábil previo.`,
            callouts: [
              {
                type: 'warning',
                title: 'Puntos Clave del Calendario Bancario',
                content: 'Monitorea con precisión los estados de cuenta en PDF para anotar la fecha de cierre de ciclo de cada tarjeta. Mantén los pagos sincronizados.',
                highlightText: 'Abonar la deuda 3 días hábiles antes del Statement Closing Date.'
              }
            ],
            checklist: [
              { id: 'c1-13', label: 'Localizar la fecha de corte (Statement Closing Date) de cada tarjeta', details: 'Verificar en el PDF del estado de cuenta o banca en línea' },
              { id: 'c1-14', label: 'Ejecutar el método AZEO: saldar a cero todas las tarjetas excepto una', details: 'Dejar un saldo de entre 1% y 2% en una sola tarjeta primaria' },
              { id: 'c1-15', label: 'Confirmar en IdentityIQ que los burós hayan actualizado los saldos a $0', details: 'Esperar actualización formal antes de emitir solicitudes' }
            ]
          }
        ]
      },
      {
        id: 'phase-1-3',
        phaseNumber: 3,
        title: 'Fase 3: Congelamiento de Burós Secundarios',
        description: 'Bloqueo preventivo de agencias secundarias (LexisNexis, ChexSystems, Innovis) para evitar denegaciones automáticas.',
        steps: [
          {
            id: 'step-1-3-1',
            title: '1.5 Bloqueo Preventivo de Burós Secundarios y ChexSystems',
            summary: 'Protocolo para congelar bases de datos secundarias que los bancos consultan para auditar discrepancias de dirección o antecedentes de cheques.',
            order: 5,
            readingTimeMinutes: 13,
            contentMarkdown: `### 🔐 ¿Por qué Congelar Burós Secundarios?

Además de las 3 grandes agencias (Experian, TransUnion, Equifax), los departamentos de prevención de fraude de las entidades bancarias consultan bases de datos secundarias para comprobar si existen múltiples solicitudes recientes, discrepancias de domicilio o cierres forzosos de cuentas de cheques.

Congelar estas agencias antes de iniciar una ronda de fondeo suprime potenciales objeciones secundarias y obliga a los sistemas bancarios a evaluar al solicitante únicamente con base en su historial crediticio principal.

[REQUISITO]
El congelamiento de burós secundarios es un derecho gratuito garantizado por leyes federales de protección al consumidor en EE.UU. No afecta de manera negativa el puntaje FICO ni bloquea las tarjetas de crédito existentes.

---

### 🛡️ Agencias Secundarias Principales a Congelar:

1. **LexisNexis**:
   * Contiene el mayor registro de antecedentes, domicilios previos, registros judiciales y vinculaciones patrimoniales en EE.UU.
   * Los bancos la utilizan para cotejar identidad y detectar si el cliente ha tramitado financiamiento reciente en otras entidades.
   * *Acción*: Tramitar el "Consumer Security Freeze" a través de su portal oficial en línea.

2. **ChexSystems & Early Warning Services (EWS)**:
   * Llevan el registro de cuentas bancarias y de cheques (sobregiros no saldados, sospechas de fraude o cancelaciones forzadas).
   * Entidades como Chase, US Bank y PNC consultan ChexSystems y EWS al solicitar cuentas comerciales.

3. **Innovis Consumer Assistance**:
   * Cuarto buró de crédito alternativo utilizado por bancos como Capital One y cooperativas de crédito regionales.
   * Congelar Innovis evita consultas secundarias cruzadas durante las rondas de financiamiento.

[TIP]
Si un banco requiere acceso específico a ChexSystems para abrir una cuenta bancaria comercial indispensable para el fondeo, puedes solicitar un desbloqueo temporal (temporary thaw) de 48 a 72 horas mediante el PIN de seguridad que te asigna la agencia.`,
            callouts: [
              {
                type: 'tip',
                title: 'Levantamiento Temporal (Temporary Thaw)',
                content: 'Guarda siempre los números PIN generados durante el congelamiento en una bóveda segura de contraseñas. Facilitarán desbloqueos rápidos si un banco lo requiere.'
              }
            ],
            checklist: [
              { id: 'c1-16', label: 'Solicitar el Consumer Security Freeze en el portal de LexisNexis', details: 'Almacenar el PIN de seguridad otorgado' },
              { id: 'c1-17', label: 'Revisar el informe ChexSystems y comprobar ausencia de registros negativos', details: 'Historial bancario limpio' },
              { id: 'c1-18', label: 'Completar la solicitud de congelamiento de seguridad en Innovis', details: 'Enviar solicitud electrónica' }
            ],
            resources: [
              {
                title: 'Portal Oficial de Congelamiento LexisNexis',
                url: 'https://consumer.risk.lexisnexis.com/freeze',
                type: 'link',
                description: 'Sitio oficial de LexisNexis para gestionar el bloqueo de seguridad.'
              },
              {
                title: 'Portal de Seguridad al Consumidor Innovis',
                url: 'https://www.innovis.com/personal/securityFreeze',
                type: 'link',
                description: 'Gestión de bloqueo de crédito en la agencia secundaria Innovis.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'mod-2',
    slug: 'reglas-por-banco-secuenciacion',
    moduleNumber: 2,
    title: 'Módulo 2: Reglas por Banco & Secuenciación',
    subtitle: 'Políticas de suscripción, algoritmos 5/24, 2/90 y orden de ataque',
    description: 'Conoce las políticas internas no escritas de Chase, Amex, Bank of America, US Bank y Capital One para evitar rechazos automáticos.',
    iconName: 'Building2',
    colorTheme: '#068383',
    badge: 'En Proceso',
    estimatedHours: '4.0 Horas',
    isLocked: true,
    statusLabel: 'En Proceso',
    phases: [
      {
        id: 'phase-2-1',
        phaseNumber: 1,
        title: 'Fase 1: Reglas de Entidades Tier 1 (Chase y Amex)',
        description: 'Políticas no negociables de los dos bancos comerciales más grandes de EE.UU.',
        steps: [
          {
            id: 'step-2-1-1',
            title: '2.1 La Regla 5/24 y Límites de Exposición de Chase',
            summary: 'Cálculo exacto del 5/24 y el límite del 50% de ingresos declarados.',
            order: 1,
            readingTimeMinutes: 16,
            contentMarkdown: `### Regla Chase 5/24 y Límites de Exposición (Contenido en Proceso de Carga)`,
            checklist: []
          }
        ]
      }
    ]
  }
];
