/**
 * The preview categories: housing, medical, and finance. Each has a
 * page listing its previews. Plain data only, so both the server (to build the
 * pages) and the browser (to show them) can read it.
 *
 * Medical and Finance were written during the build, in English and
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
  blurb: Text;
  eyebrow: Text;
  title: Text;
  intro: Text;
  allPreviews: Text;
}

export const PREVIEW_CATEGORIES: Record<string, PreviewCategory> = {
  residences: {
    order: ["first-lease", "security-deposit", "repairs", "notices-rent", "roommates"],
    tone: "green",
    icon: "home",
    name: { en: "Residences", es: "Vivienda", km: "លំនៅដ្ឋាន" },
    blurb: {
      en: "First leases, deposits, repairs, notices, and roommates.",
      es: "Primer contrato, depósitos, reparaciones, avisos y compañeros.",
      km: "កិច្ចសន្យាជួលដំបូង ប្រាក់កក់ ការជួសជុល សេចក្តីជូនដំណឹង និងអ្នករួមបន្ទប់។",
    },
    eyebrow: { en: "RESIDENCES", es: "VIVIENDA", km: "លំនៅដ្ឋាន" },
    title: { en: "Housing paperwork without the guesswork.", es: "Papeles de vivienda sin andar adivinando.", km: "ឯកសារជួលផ្ទះ ដោយមិនបាច់ស្មានទុកមុន។" },
    intro: {
      en: "Preview how Grown breaks down leases, deposits, repairs, notices, and roommates.",
      es: "Mira cómo Grown explica contratos, depósitos, reparaciones, avisos y compañeros.",
      km: "មើលជាមុនពីរបៀបដែល Grown បំបែកកិច្ចសន្យា ប្រាក់កក់ ការជួសជុល សេចក្តីជូនដំណឹង និងអ្នករួមបន្ទប់។",
    },
    allPreviews: { en: "All Residences previews", es: "Todas las vistas previas de Vivienda", km: "ការមើលជាមុនផ្នែកលំនៅដ្ឋានទាំងអស់" },
  },
  medical: {
    order: ["hospital-bill", "insurance-letter", "itemized-statement"],
    tone: "rose",
    icon: "medical",
    name: { en: "Medical", es: "Salud y facturas", km: "សុខភាព" },
    blurb: {
      en: "Hospital bills, insurance letters, and itemized statements.",
      es: "Facturas de hospital, cartas del seguro y cobros detallados.",
      km: "វិក្កយបត្រមន្ទីរពេទ្យ លិខិតធានារ៉ាប់រង និងបញ្ជីចំណាយលម្អិត។",
    },
    eyebrow: { en: "MEDICAL", es: "SALUD", km: "សុខភាព" },
    title: { en: "Medical paperwork, one line at a time.", es: "Papeles médicos, línea por línea." },
    intro: {
      en: "Preview how Grown will break down hospital bills, insurance letters, and itemized statements.",
      es: "Mira cómo Grown explicará facturas de hospital, cartas del seguro y cobros detallados.",
    },
    allPreviews: { en: "All Medical previews", es: "Todas las vistas previas de Salud" },
  },
  finance: {
    order: ["tax-forms", "paycheck", "benefits-letter"],
    tone: "gold",
    icon: "dollar",
    name: { en: "Finance", es: "Finanzas", km: "ហិរញ្ញវត្ថុ" },
    blurb: {
      en: "Tax forms, paycheck deductions, and benefits letters.",
      es: "Formularios de impuestos, descuentos del cheque y cartas de beneficios.",
      km: "ទម្រង់ពន្ធ ការកាត់ប្រាក់ខែ និងលិខិតអត្ថប្រយោជន៍។",
    },
    eyebrow: { en: "FINANCE", es: "FINANZAS", km: "ហិរញ្ញវត្ថុ" },
    title: { en: "Finance paperwork, made plain.", es: "Papeles de finanzas, en claro." },
    intro: {
      en: "Preview how Grown will break down tax forms, paychecks, and benefits letters.",
      es: "Mira cómo Grown explicará formularios de impuestos, cheques de pago y cartas de beneficios.",
    },
    allPreviews: { en: "All Finance previews", es: "Todas las vistas previas de Finanzas" },
  },
};
