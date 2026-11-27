/**
 * The preview categories: housing, health, and money. Each has a
 * page listing its previews. Plain data only, so both the server (to build the
 * pages) and the browser (to show them) can read it.
 *
 * Health and Money were written during the build, in English and
 * Spanish. They have no Khmer yet, so Khmer falls back to English. None of the
 * Spanish or Khmer has had a human review.
 */

type Text = { en: string; es?: string; km?: string };

export interface PreviewCategory {
  /** Preview guide ids, in the order they are listed. */
  order: string[];
  tone: "green" | "rose" | "gold";
  icon: "home" | "medical" | "dollar";
  name: Text;
  /** One reassuring line for the home card. */
  blurb: Text;
  /** A short list of what is inside, for the home card. Items are split on "|". */
  list: Text;
  eyebrow: Text;
  title: Text;
  intro: Text;
  allPreviews: Text;
}

export const PREVIEW_CATEGORIES: Record<string, PreviewCategory> = {
  housing: {
    order: ["first-lease", "security-deposit", "repairs", "notices-rent", "roommates"],
    tone: "green",
    icon: "home",
    name: { en: "Housing", es: "Vivienda", km: "លំនៅដ្ឋាន" },
    blurb: { en: "Let's get your home paperwork handled.", es: "Pongamos en orden los papeles de tu vivienda.", km: "មករៀបចំឯកសារផ្ទះរបស់អ្នកឱ្យរួចរាល់។" },
    list: { en: "Leases|Deposits|Repairs", es: "Contratos|Depósitos|Reparaciones", km: "កិច្ចសន្យាជួល|ប្រាក់កក់|ការជួសជុល" },
    eyebrow: { en: "HOUSING", es: "VIVIENDA", km: "លំនៅដ្ឋាន" },
    title: { en: "Housing paperwork without the guesswork.", es: "Papeles de vivienda sin andar adivinando.", km: "ឯកសារជួលផ្ទះ ដោយមិនបាច់ស្មានទុកមុន។" },
    intro: {
      en: "Preview how Grown breaks down leases, deposits, repairs, notices, and roommates.",
      es: "Mira cómo Grown explica contratos, depósitos, reparaciones, avisos y compañeros.",
      km: "មើលជាមុនពីរបៀបដែល Grown បំបែកកិច្ចសន្យា ប្រាក់កក់ ការជួសជុល សេចក្តីជូនដំណឹង និងអ្នករួមបន្ទប់។",
    },
    allPreviews: { en: "All Housing previews", es: "Todas las vistas previas de Vivienda", km: "ការមើលជាមុនផ្នែកលំនៅដ្ឋានទាំងអស់" },
  },
  health: {
    order: ["hospital-bill", "insurance-letter", "itemized-statement"],
    tone: "rose",
    icon: "medical",
    name: { en: "Health", es: "Salud", km: "សុខភាព" },
    blurb: { en: "Let's make sense of that bill before you pay.", es: "Entendamos esa factura antes de que pagues.", km: "មកយល់ពីវិក្កយបត្រនោះ មុនពេលអ្នកបង់ប្រាក់។" },
    list: { en: "Hospital bills|Insurance letters|Itemized statements", es: "Facturas de hospital|Cartas del seguro|Cobros detallados", km: "វិក្កយបត្រមន្ទីរពេទ្យ|លិខិតធានារ៉ាប់រង|បញ្ជីចំណាយលម្អិត" },
    eyebrow: { en: "HEALTH", es: "SALUD", km: "សុខភាព" },
    title: { en: "Health paperwork, one line at a time.", es: "Papeles médicos, línea por línea." },
    intro: {
      en: "Preview how Grown will break down hospital bills, insurance letters, and itemized statements.",
      es: "Mira cómo Grown explicará facturas de hospital, cartas del seguro y cobros detallados.",
    },
    allPreviews: { en: "All Health previews", es: "Todas las vistas previas de Salud" },
  },
  money: {
    order: ["tax-forms", "paycheck", "benefits-letter"],
    tone: "gold",
    icon: "dollar",
    name: { en: "Money", es: "Dinero", km: "លុយ" },
    blurb: { en: "Let's figure out where your money is going.", es: "Veamos a dónde se va tu dinero.", km: "មកមើលថាលុយរបស់អ្នកទៅណា។" },
    list: { en: "Tax forms|Paychecks|Benefits letters", es: "Formularios de impuestos|Cheques de pago|Cartas de beneficios", km: "ទម្រង់ពន្ធ|ប្រាក់ខែ|លិខិតអត្ថប្រយោជន៍" },
    eyebrow: { en: "MONEY", es: "DINERO", km: "លុយ" },
    title: { en: "Money paperwork, made plain.", es: "Papeles de dinero, en claro." },
    intro: {
      en: "Preview how Grown will break down tax forms, paychecks, and benefits letters.",
      es: "Mira cómo Grown explicará formularios de impuestos, cheques de pago y cartas de beneficios.",
    },
    allPreviews: { en: "All Money previews", es: "Todas las vistas previas de Dinero" },
  },
};
