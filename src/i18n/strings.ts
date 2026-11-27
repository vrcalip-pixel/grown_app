/**
 * Words for the pages around the guides: home, category pages, previews,
 * sources and the header. Guide content itself lives in the guide packs.
 *
 * English is the source. Spanish and Khmer were brought over from the author's
 * FYI build, where they were machine-written; a few Spanish lines marked
 * "added here" were written during the merge. None of the Spanish or Khmer has
 * had a human review yet. A missing Khmer line falls back to English.
 */

export type Lang = "en" | "es" | "km";
export const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: "en", label: "English", name: "English" },
  { id: "es", label: "Español", name: "Español" },
  { id: "km", label: "ខ្មែរ", name: "Khmer" },
];

type Entry = { en: string; es?: string; km?: string };

export const STRINGS = {
  // Header
  navHome: { en: "Grown home", es: "Inicio de Grown", km: "ទំព័រដើម Grown" },
  navAuto: { en: "Car and traffic tickets", es: "Carro y multas de tráfico", km: "រថយន្ត និងសំបុត្រផាកពិន័យចរាចរណ៍" },
  navHousing: { en: "Housing", es: "Vivienda y contratos", km: "លំនៅដ្ឋាន និងកិច្ចសន្យាជួល" },
  navSources: { en: "Official court sources", es: "Fuentes oficiales de la corte", km: "ប្រភពផ្លូវការរបស់តុលាការ" },
  langSwitcher: { en: "Language", es: "Idioma", km: "ភាសា" },
  menuAll: { en: "All sections", es: "Todas las secciones", km: "ផ្នែកទាំងអស់" },
  menuSources: { en: "Sources", es: "Fuentes", km: "ប្រភព" },
  home: { en: "Home", es: "Inicio", km: "ទំព័រដើម" },
  readAloud: { en: "Read this to me", es: "Léemelo", km: "អានឱ្យខ្ញុំស្តាប់" }, // es added here
  stopReading: { en: "Stop reading", es: "Dejar de leer", km: "ឈប់អាន" }, // es added here

  // Home
  homeTitle: {
    en: "Nobody hands you a manual for this. We got you.",
    es: "Nadie te da un manual para esto. Aquí estamos contigo.",
    km: "គ្មាននរណាឱ្យសៀវភៅណែនាំសម្រាប់រឿងទាំងនេះទេ។ យើងនៅជាមួយអ្នក។",
  },
  homeIntro: {
    en: "Clear, step-by-step guidance for tickets, leases, DMV notices, and medical bills, so you never have to figure it out alone. Pick a category to start.",
    es: "Guía clara paso a paso para multas, contratos de renta, avisos del DMV y facturas médicas, para que nunca tengas que resolverlo sin apoyo. Elige una categoría para empezar.",
    km: "ការណែនាំច្បាស់លាស់មួយជំហានម្តងៗ សម្រាប់សំបុត្រផាកពិន័យ កិច្ចសន្យាជួលផ្ទះ លិខិត DMV និងវិក្កយបត្រពេទ្យ ដើម្បីកុំឱ្យអ្នកដោះស្រាយតែម្នាក់ឯង។ សូមជ្រើសប្រភេទមួយដើម្បីចាប់ផ្តើម។",
  },
  // The fine print at the foot of every page. It carries the trust promise that used to be a
  // panel on the home page. Spanish and Khmer added here, not yet reviewed by a person.
  footTrust: {
    en: "Grown is not the court, the police, or immigration.",
    es: "Grown no es la corte, la policía ni inmigración.",
    km: "Grown មិនមែនជាតុលាការ ប៉ូលិស ឬអន្តោប្រវេសន៍ទេ។",
  },
  footRole: {
    en: "It is not a lawyer and doesn't give legal advice. It explains what a document means and what your options are.",
    es: "No es un abogado y no da asesoría legal. Explica qué significa un documento y cuáles son tus opciones.",
    km: "វាមិនមែនជាមេធាវី ហើយមិនផ្តល់ដំបូន្មានផ្លូវច្បាប់ទេ។ វាពន្យល់ថាឯកសារមួយមានន័យយ៉ាងណា និងអ្នកមានជម្រើសអ្វីខ្លះ។",
  },
  footPrivacy: {
    en: "No account, no name or license number, no income questions, and no trackers. Nothing you tap is saved. If you choose to use Ask Grown, your question and the answers you tapped are sent to Claude, an AI made by Anthropic, to write a reply. Grown does not store them.",
    es: "Sin cuenta, sin nombre ni número de licencia, sin preguntas sobre ingresos y sin rastreadores. No se guarda nada de lo que tocas. Si decides usar Ask Grown, tu pregunta y las respuestas que tocaste se envían a Claude, una IA creada por Anthropic, para escribir una respuesta. Grown no las guarda.",
    km: "មិនចាំបាច់មានគណនី មិនសួរឈ្មោះ ឬលេខប័ណ្ណបើកបរ មិនសួរអំពីប្រាក់ចំណូល និងគ្មានកម្មវិធីតាមដាន។ អ្វីដែលអ្នកចុច មិនត្រូវបានរក្សាទុកទេ។ ប្រសិនបើអ្នកជ្រើសប្រើ Ask Grown សំណួររបស់អ្នក និងចម្លើយដែលអ្នកបានចុច នឹងត្រូវបញ្ជូនទៅ Claude ដែលជា AI បង្កើតដោយ Anthropic ដើម្បីសរសេរចម្លើយ។ Grown មិនរក្សាទុកពួកវាទេ។",
  },
  footFacts: {
    en: "Grown never makes up fees or dates. It points you to the amount and due date printed on your own ticket or court notice. Facts last checked against official California court sources on {date}.",
    es: "Grown nunca inventa cobros ni fechas. Te señala la cantidad y la fecha límite impresas en tu propia multa o aviso de la corte. Datos revisados por última vez con fuentes oficiales de las cortes de California el {date}.",
    km: "Grown មិនដែលបង្កើតតម្លៃ ឬកាលបរិច្ឆេទដោយខ្លួនឯងឡើយ។ វាចង្អុលអ្នកទៅចំនួនទឹកប្រាក់ និងថ្ងៃផុតកំណត់ ដែលបោះពុម្ពលើសំបុត្រផាកពិន័យ ឬលិខិតតុលាការរបស់អ្នកផ្ទាល់។ ព័ត៌មានត្រូវបានពិនិត្យចុងក្រោយជាមួយប្រភពផ្លូវការរបស់តុលាការរដ្ឋកាលីហ្វ័រញ៉ា នៅថ្ងៃ {date}។",
  },
  footBuilt: {
    en: "Built by Vincent Calip for HDA 294/494, The Agentic Self (ASU). Version {version} · Long Beach, CA.",
    es: "Creado por Vincent Calip para HDA 294/494, The Agentic Self (ASU). Versión {version} · Long Beach, CA.",
    km: "បង្កើតដោយ Vincent Calip សម្រាប់ HDA 294/494, The Agentic Self (ASU)។ កំណែ {version} · Long Beach, CA។",
  },

  catAuto: { en: "Car", es: "Carro", km: "រថយន្ត" },
  catAutoBlurb: {
    en: "Traffic tickets, DMV notices, and vehicle registration.",
    es: "Multas de tráfico, avisos del DMV y registro del carro.",
    km: "សំបុត្រផាកពិន័យចរាចរណ៍ លិខិត DMV និងការចុះបញ្ជីរថយន្ត។",
  },
  catHousing: { en: "Housing", es: "Vivienda", km: "លំនៅដ្ឋាន" },
  catHousingBlurb: {
    en: "First leases, deposits, repairs, notices, and roommates.",
    es: "Primer contrato, depósitos, reparaciones, avisos y compañeros.",
    km: "កិច្ចសន្យាជួលដំបូង ប្រាក់កក់ ការជួសជុល សេចក្តីជូនដំណឹង និងអ្នករួមបន្ទប់។",
  },
  catMedical: { en: "Health", es: "Salud", km: "សុខភាព" },
  catMedicalBlurb: {
    en: "Hospital bills, insurance letters, and itemized statements.",
    es: "Facturas de hospital, cartas del seguro y cobros detallados.",
    km: "វិក្កយបត្រមន្ទីរពេទ្យ លិខិតធានារ៉ាប់រង និងបញ្ជីចំណាយលម្អិត។",
  },
  catWork: { en: "Money", es: "Dinero", km: "លុយ" },
  catWorkBlurb: {
    en: "Tax forms, paycheck deductions, and benefits letters.",
    es: "Formularios de impuestos, descuentos del cheque y cartas de beneficios.",
    km: "ទម្រង់ពន្ធ ការកាត់ប្រាក់ខែ និងលិខិតអត្ថប្រយោជន៍។",
  },
  badgeLive: { en: "1 live", es: "1 activa", km: "១ កំពុងដំណើរការ" },
  badgePreviews: { en: "{n} previews", es: "{n} vistas previas", km: "{n} មើលជាមុន" },
  comingNext: { en: "Coming next", es: "Próximamente", km: "មកដល់ឆាប់ៗ" },

  // Auto
  autoEyebrow: { en: "CAR", es: "CARRO", km: "រថយន្ត" },
  autoTitle: { en: "Car paperwork, one step at a time.", es: "Papeles del carro, paso por paso.", km: "ឯកសាររថយន្ត ដោះស្រាយមួយជំហានម្តងៗ។" },
  autoIntro: {
    en: "Start with a Long Beach traffic ticket; DMV and registration are next.",
    es: "Empieza con una multa en Long Beach; DMV y registro vienen después.",
    km: "ចាប់ផ្តើមពីសំបុត្រផាកពិន័យនៅ Long Beach; ផ្នែក DMV និងការចុះបញ្ជីនឹងមកបន្ទាប់។",
  },
  liveGuide: { en: "Live guide", es: "Guía activa", km: "កំពុងដំណើរការ" },
  ticketTitle: { en: "I got a traffic ticket", es: "Me dieron una multa de tráfico", km: "ខ្ញុំទទួលបានសំបុត្រផាកពិន័យចរាចរណ៍" },
  ticketBlurb: {
    en: "Find out where it goes, what matters first, and your real options.",
    es: "Descubre a dónde va, qué importa primero y cuáles son tus opciones.",
    km: "ដឹងថាត្រូវទៅខាងណា អ្វីសំខាន់មុនគេ និងជម្រើសពិតរបស់អ្នក។",
  },
  ticketMeta: { en: "Long Beach, CA · about 2 minutes", es: "Long Beach, CA · unos 2 minutos", km: "Long Beach, CA · ប្រហែល ២ នាទី" },
  startGuide: { en: "Start this guide", es: "Empezar esta guía", km: "ចាប់ផ្តើមមគ្គុទ្ទេសក៍នេះ" },
  dmvTitle: { en: "A letter from the DMV", es: "Una carta del DMV", km: "លិខិតពី DMV" },
  dmvBlurb: {
    en: "Registration holds, license notices, and proof-of-insurance letters.",
    es: "Retenciones de registro, avisos de licencia y cartas de seguro.",
    km: "ការផ្អាកការចុះបញ្ជី សេចក្តីជូនដំណឹងប័ណ្ណបើកបរ និងលិខិតបញ្ជាក់ធានារ៉ាប់រង។",
  },
  smogTitle: { en: "Vehicle registration & smog", es: "Registro del carro y smog", km: "ការចុះបញ្ជីរថយន្ត និងការត្រួតពិនិត្យផ្សែង" },
  smogBlurb: {
    en: "Renewal deadlines, late fees, and title transfer basics.",
    es: "Fechas de renovación, recargos y cambio de título básico.",
    km: "ថ្ងៃផុតកំណត់បន្ត ប្រាក់ពិន័យយឺត និងការផ្ទេរកម្មសិទ្ធិមូលដ្ឋាន។",
  },
  // Shown above the ticket guide when the page language is not English. Spanish added here.
  guideEnglishOnly: {
    en: "This guide is in English for now. Other languages are being reviewed by a person before they go live.",
    es: "Por ahora esta guía está en inglés. Una persona está revisando la traducción antes de publicarla.",
    km: "មគ្គុទ្ទេសក៍នេះមានជាភាសាអង់គ្លេសសិន។ ភាសាផ្សេងទៀតកំពុងត្រូវបានពិនិត្យដោយមនុស្ស មុននឹងដាក់ឱ្យប្រើ។",
  },

  // Housing
  resEyebrow: { en: "HOUSING", es: "VIVIENDA", km: "លំនៅដ្ឋាន" },
  previewTag: { en: "Preview · not live yet", es: "Vista previa · aún no está activa", km: "មើលជាមុន · មិនទាន់ដំណើរការពេញលេញទេ" },
  resTitle: { en: "Housing paperwork without the guesswork.", es: "Papeles de vivienda sin andar adivinando.", km: "ឯកសារជួលផ្ទះ ដោយមិនបាច់ស្មានទុកមុន។" },
  resIntro: {
    en: "Preview how Grown breaks down leases, deposits, repairs, notices, and roommates.",
    es: "Mira cómo Grown explica contratos, depósitos, reparaciones, avisos y compañeros.",
    km: "មើលជាមុនពីរបៀបដែល Grown បំបែកកិច្ចសន្យា ប្រាក់កក់ ការជួសជុល សេចក្តីជូនដំណឹង និងអ្នករួមបន្ទប់។",
  },
  resNote: {
    en: "Every card below opens a preview of our six-question pattern. None of these guides are live yet.",
    es: "Cada tarjeta abre una vista previa de nuestro patrón de seis preguntas. Ninguna de estas guías está activa todavía.",
    km: "កាតនីមួយៗខាងក្រោមបើកការមើលជាមុននៃលំនាំសំណួរ ៦ ចំណុចរបស់យើង។ មគ្គុទ្ទេសក៍ទាំងនេះមិនទាន់ដំណើរការពេញលេញទេ។",
  },
  allPreviews: { en: "All Housing previews", es: "Todas las vistas previas de Vivienda", km: "ការមើលជាមុនផ្នែកលំនៅដ្ឋានទាំងអស់" },
  howItWorks: { en: "How this Grown guide will work", es: "Cómo funcionará esta guía de Grown", km: "របៀបដែលមគ្គុទ្ទេសក៍ Grown នេះនឹងដំណើរការ" },
  sixQuestions: {
    en: "Every Grown guide asks the same six core questions. Only the rules and options change.",
    es: "Cada guía de Grown hace las mismas seis preguntas clave. Solo cambian las reglas y opciones.",
    km: "មគ្គុទ្ទេសក៍ Grown នីមួយៗសួរសំណួរស្នូល ៦ ដូចគ្នា ផ្លាស់ប្តូរតែវិធាន និងជម្រើសប៉ុណ្ណោះ។",
  },
  q1: { en: "What is this paper?", es: "¿Qué es este papel?", km: "តើឯកសារនេះជាអ្វី?" },
  q2: { en: "Where is the place?", es: "¿Dónde queda el lugar?", km: "តើទីកន្លែងនៅឯណា?" },
  q3: { en: "What date matters?", es: "¿Qué fecha importa?", km: "តើកាលបរិច្ឆេទណាសំខាន់?" },
  q4: { en: "What could it cost you?", es: "¿Qué te puede costar?", km: "តើវាអាចចំណាយប៉ុន្មាន?" },
  q5: { en: "What are your options?", es: "¿Cuáles son tus opciones?", km: "តើអ្នកមានជម្រើសអ្វីខ្លះ?" },
  q6: { en: "Your next move", es: "Tu próximo paso", km: "ជំហានបន្ទាប់របស់អ្នក" },
  previewNote: {
    en: "This guide goes live only after every rule is verified.",
    es: "Esta guía se activa solo después de verificar cada regla.",
    km: "មគ្គុទ្ទេសក៍នេះនឹងបើកដំណើរការ លុះត្រាតែវិធាននីមួយៗត្រូវបានផ្ទៀងផ្ទាត់រួចរាល់។",
  },

  // Sources
  srcEyebrow: { en: "SOURCES", es: "FUENTES", km: "ប្រភព" },
  srcTitle: { en: "Where every Grown answer comes from.", es: "De dónde sale cada respuesta de Grown.", km: "កន្លែងដែលចម្លើយរបស់ Grown មកពី។" },
  srcIntro: {
    en: "Only official California court and city sources. Never guesswork or ads.",
    es: "Solo fuentes oficiales de las cortes de California y la ciudad. Sin adivinanzas.",
    km: "ប្រើតែប្រភពផ្លូវការរបស់តុលាការ California និងទីក្រុងប៉ុណ្ណោះ មិនស្មាន ឬផ្សាយពាណិជ្ជកម្មឡើយ។",
  },
  srcChecked: {
    en: "Facts checked against official California court sources on {date}",
    es: "Datos verificados con fuentes oficiales de las cortes de California el {date}",
    km: "ព័ត៌មានត្រូវបានផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការរបស់តុលាការរដ្ឋ California នៅថ្ងៃទី {date}",
  },
  srcBody: {
    en: "Grown checks every rule against public California court self-help pages and state codes before a guide goes live. Grown never links to paid traffic schools, ticket lawyers, or referral sites.",
    es: "Grown revisa cada regla en páginas públicas de ayuda de las cortes de California y códigos estatales antes de publicar una guía. Nunca enlaza a escuelas de tráfico pagadas ni anuncios de abogados.",
    km: "Grown ផ្ទៀងផ្ទាត់វិធាននីមួយៗជាមួយគេហទំព័រជំនួយខ្លួនឯងសាធារណៈរបស់តុលាការ California និងច្បាប់រដ្ឋ មុនពេលបើកដំណើរការ។ Grown មិនដាក់តំណទៅសាលាចរាចរណ៍បង់ប្រាក់ ឬមេធាវីឡើយ។",
  },
} satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;

export function pick(entry: { en: string; es?: string | null; km?: string | null }, lang: Lang): string {
  return (lang === "en" ? entry.en : entry[lang]) || entry.en;
}
